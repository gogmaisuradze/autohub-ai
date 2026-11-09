/**
 * CarMe — OBD-WiFi სერვისი
 *
 * პირდაპირი კავშირი WiFi ELM327 ადაპტერთან (მაგ. VZUO/Zvio 2 → 192.168.0.10:35000).
 * მუშაობს მხოლოდ ნატიურ აპში (Capacitor), სადაც ხელმისაწვდომია TCP socket —
 * ბრაუზერში raw TCP აკრძალულია, ამიტომ `transport` იქ null-ია.
 *
 * ლოგიკა (offline-first):
 *   1. წაიკითხე კოდები/მონაცემი ადაპტერიდან (ინტერნეტის გარეშეც)
 *   2. ყოველთვის შეინახე ლოკალურად (რიგი) — არაფერი იკარგება
 *   3. ინტერნეტის დაბრუნებისას → ავტომატურად გააგზავნე carme.ge/n8n-ზე → AI ანალიზი
 */

export interface ObdDtc {
  code: string;            // მაგ. "P0128"
  description?: string;    // შევსდება სერვერზე/ლექსიკონში
}

export interface ObdLive {
  rpm: number | null;
  coolantC: number | null;
  speedKmh: number | null;
  voltage: number | null;
  engineLoadPct: number | null;      // 0104 — ძრავის დატვირთვა
  intakeTempC: number | null;        // 010F — შემშვები ჰაერის ტემპ.
  mafGps: number | null;             // 0110 — ჰაერის ნაკადი (MAF)
  throttlePct: number | null;        // 0111 — დროსელის პოზიცია
  fuelLevelPct: number | null;       // 012F — საწვავის დონე
  runtimeSec: number | null;         // 011F — მუშაობის დრო გაშვებიდან
  distanceMilKm: number | null;      // 0121 — მანძილი ჩართული MIL-ით
  ambientTempC: number | null;       // 0146 — გარე ჰაერის ტემპ.
  moduleVoltage: number | null;      // 0142 — ECU ძაბვა
  manifoldKpa: number | null;        // 010B — კოლექტორის წნევა
  distSinceClearedKm: number | null; // 0131 — მანძილი კოდების განულებიდან
}

export interface ObdScanResult {
  id: string;
  scannedAt: string;       // ISO 8601
  vin: string | null;
  dtcs: ObdDtc[];          // Mode 03 — შენახული კოდები
  pendingDtcs: ObdDtc[];   // Mode 07 — მოლოდინში მყოფი
  permanentDtcs: ObdDtc[]; // Mode 0A — მუდმივი
  live: ObdLive;
  synced: boolean;         // გაიგზავნა თუ არა სერვერზე
}

/**
 * TCP transport — ნატიური პლაგინი ავსებს (iOS/Android).
 * `send` აბრუნებს ადაპტერის პასუხს ELM327-ის '>' prompt-მდე.
 */
export interface ObdTransport {
  connect(host: string, port: number): Promise<void>;
  send(command: string): Promise<string>;
  close(): Promise<void>;
  isConnected(): boolean;
}

let transport: ObdTransport | null = null;
/** ნატიურ აპში TCP პლაგინის ჩასართავად (bootstrap-ზე) */
export function setObdTransport(t: ObdTransport | null) {
  transport = t;
}

const DEFAULT_HOST = '192.168.0.10';
const DEFAULT_PORT = 35000;
const QUEUE_KEY = 'carme_obd_queue';
const N8N_SCAN_URL = 'https://meticulous-oyster.pikapod.net/webhook/obd-scan';

// პასუხიდან hex ბაიტების ამოღება (მაგ. "41 0C 1A F8" → [0x41,0x0C,0x1A,0xF8])
function hexBytes(resp: string): number[] {
  const clean = resp.replace(/[\r\n>]/g, ' ').replace(/SEARCHING\.\.\./gi, '').trim();
  const tokens = clean.split(/\s+/).filter(t => /^[0-9A-Fa-f]{2}$/.test(t));
  return tokens.map(t => parseInt(t, 16));
}

// Mode 03 DTC: ორი ბაიტი → კოდი (მაგ. 0x01 0x28 → "P0128")
function parseDtc(b1: number, b2: number): string | null {
  if (b1 === 0 && b2 === 0) return null;
  const letter = ['P', 'C', 'B', 'U'][(b1 >> 6) & 0x3];
  const d1 = (b1 >> 4) & 0x3;
  const d2 = b1 & 0x0f;
  const d3 = (b2 >> 4) & 0x0f;
  const d4 = b2 & 0x0f;
  return `${letter}${d1}${d2.toString(16).toUpperCase()}${d3.toString(16).toUpperCase()}${d4.toString(16).toUpperCase()}`;
}

class ObdWifiService {
  private connected = false;

  /** ხელმისაწვდომია თუ არა (ანუ ნატიურ აპში ვართ და პლაგინი ჩართულია) */
  public isAvailable(): boolean {
    return transport !== null;
  }

  public isConnected(): boolean {
    return this.connected && !!transport?.isConnected();
  }

  /** დაკავშირება + ELM327 ინიციალიზაცია */
  public async connect(host: string = DEFAULT_HOST, port: number = DEFAULT_PORT): Promise<void> {
    if (!transport) {
      throw new Error('OBD კავშირი მიუწვდომელია — ხელმისაწვდომია მხოლოდ CarMe ნატიურ აპში.');
    }
    await transport.connect(host, port);
    await transport.send('ATZ');   // reset
    await transport.send('ATE0');  // echo off
    await transport.send('ATL0');  // linefeeds off
    await transport.send('ATSP0'); // ავტო-პროტოკოლი
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (transport) await transport.close();
    this.connected = false;
  }

  /** სრული სკანი: VIN + ხარვეზის კოდები + ცოცხალი მონაცემი */
  public async scan(): Promise<ObdScanResult> {
    if (!transport || !this.connected) {
      throw new Error('ჯერ დაუკავშირდი ადაპტერს (connect).');
    }
    const vin = await this.readVin();
    const dtcs = await this.readDtcs();
    const pendingDtcs = await this.readPendingDtcs();
    const permanentDtcs = await this.readPermanentDtcs();
    const live = await this.readLive();

    const result: ObdScanResult = {
      id: `scan-${Date.now()}`,
      scannedAt: new Date().toISOString(),
      vin,
      dtcs,
      pendingDtcs,
      permanentDtcs,
      live,
      synced: false
    };

    this.enqueue(result);       // offline-first: ყოველთვის ლოკალურად
    void this.syncQueue();      // ინტერნეტია → მაშინვე აგზავნის
    return result;
  }

  /** ხარვეზის კოდების ჩაქრობა (Mode 04) */
  public async clearDtcs(): Promise<void> {
    if (!transport || !this.connected) throw new Error('ჯერ დაუკავშირდი ადაპტერს.');
    await transport.send('04');
  }

  private async readVin(): Promise<string | null> {
    try {
      const resp = await transport!.send('0902');
      const bytes = hexBytes(resp).filter((_, i) => i > 2); // header-ის მოჭრა
      const ascii = bytes.filter(b => b >= 0x20 && b < 0x7f).map(b => String.fromCharCode(b)).join('');
      return ascii.length >= 11 ? ascii.slice(-17) : null;
    } catch {
      return null;
    }
  }

  // ზოგადი DTC-წამკითხველი: cmd (მაგ. '03') + marker (პასუხის პირველი ბაიტი, მაგ. 0x43)
  private async readDtcsByMode(cmd: string, marker: number): Promise<ObdDtc[]> {
    try {
      const resp = await transport!.send(cmd);
      const bytes = hexBytes(resp);
      const idx = bytes.indexOf(marker);
      const payload = idx >= 0 ? bytes.slice(idx + 1) : bytes;
      const dtcs: ObdDtc[] = [];
      const seen = new Set<string>();
      for (let i = 0; i + 1 < payload.length; i += 2) {
        const code = parseDtc(payload[i], payload[i + 1]);
        if (code && !seen.has(code)) { seen.add(code); dtcs.push({ code }); } // დუბლიკატის გარეშე
      }
      return dtcs;
    } catch {
      return [];
    }
  }

  private readDtcs(): Promise<ObdDtc[]> { return this.readDtcsByMode('03', 0x43); }          // შენახული
  private readPendingDtcs(): Promise<ObdDtc[]> { return this.readDtcsByMode('07', 0x47); }    // მოლოდინში
  private readPermanentDtcs(): Promise<ObdDtc[]> { return this.readDtcsByMode('0A', 0x4A); }  // მუდმივი

  private async readLive(): Promise<ObdLive> {
    const rpm = await this.readPid('010C', b => b.length >= 2 ? Math.round(((b[0] * 256) + b[1]) / 4) : null);
    const coolantC = await this.readPid('0105', b => b.length >= 1 ? b[0] - 40 : null);
    const speedKmh = await this.readPid('010D', b => b.length >= 1 ? b[0] : null);
    const engineLoadPct = await this.readPid('0104', b => b.length >= 1 ? Math.round((b[0] * 100) / 255) : null);
    const intakeTempC = await this.readPid('010F', b => b.length >= 1 ? b[0] - 40 : null);
    const mafGps = await this.readPid('0110', b => b.length >= 2 ? Math.round(((b[0] * 256) + b[1]) / 100) : null);
    const throttlePct = await this.readPid('0111', b => b.length >= 1 ? Math.round((b[0] * 100) / 255) : null);
    const fuelLevelPct = await this.readPid('012F', b => b.length >= 1 ? Math.round((b[0] * 100) / 255) : null);
    const runtimeSec = await this.readPid('011F', b => b.length >= 2 ? (b[0] * 256) + b[1] : null);
    const distanceMilKm = await this.readPid('0121', b => b.length >= 2 ? (b[0] * 256) + b[1] : null);
    const ambientTempC = await this.readPid('0146', b => b.length >= 1 ? b[0] - 40 : null);
    const moduleVoltage = await this.readPid('0142', b => b.length >= 2 ? Math.round((((b[0] * 256) + b[1]) / 1000) * 10) / 10 : null);
    const manifoldKpa = await this.readPid('010B', b => b.length >= 1 ? b[0] : null);
    const distSinceClearedKm = await this.readPid('0131', b => b.length >= 2 ? (b[0] * 256) + b[1] : null);
    let voltage: number | null = null;
    try {
      const v = await transport!.send('ATRV');
      const m = v.match(/([0-9]+\.?[0-9]*)\s*V/i);
      voltage = m ? Number(m[1]) : null;
    } catch {}
    return {
      rpm, coolantC, speedKmh, voltage,
      engineLoadPct, intakeTempC, mafGps, throttlePct, fuelLevelPct,
      runtimeSec, distanceMilKm, ambientTempC, moduleVoltage, manifoldKpa, distSinceClearedKm
    };
  }

  // 41-header-ის მოჭრის შემდეგ მონაცემ-ბაიტებზე ფუნქციის დადება
  private async readPid(pid: string, fn: (dataBytes: number[]) => number | null): Promise<number | null> {
    try {
      const resp = await transport!.send(pid);
      const bytes = hexBytes(resp);
      const idx = bytes.indexOf(0x41);
      const data = idx >= 0 ? bytes.slice(idx + 2) : []; // 41 + PID-ბაიტი → data
      return fn(data);
    } catch {
      return null;
    }
  }

  // ---------- offline რიგი + სინქრონი ----------

  public getQueue(): ObdScanResult[] {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  private saveQueue(items: ObdScanResult[]): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-100)));
    } catch {}
  }

  private enqueue(result: ObdScanResult): void {
    const q = this.getQueue();
    q.push(result);
    this.saveQueue(q);
  }

  /** დაუსინქრონებელი სკანების გაგზავნა carme.ge/n8n-ზე (ინტერნეტის არსებობისას) */
  public async syncQueue(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const q = this.getQueue();
    const pending = q.filter(r => !r.synced);
    if (pending.length === 0) return;

    for (const r of pending) {
      try {
        const res = await fetch(N8N_SCAN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'carme-wifi-obd',
            scannedAt: r.scannedAt,
            vin: r.vin,
            dtcs: r.dtcs.map(d => d.code),
            // raw_data — n8n ანალიზატორი ამ ველს კითხულობს (თორემ AI ცარიელ input-ს იღებდა)
            raw_data: [...r.dtcs, ...(r.pendingDtcs || []), ...(r.permanentDtcs || [])].map(d => d.code).join(',') || 'NO_CODES',
            pendingDtcs: (r.pendingDtcs || []).map(d => d.code),
            permanentDtcs: (r.permanentDtcs || []).map(d => d.code),
            live: r.live
          })
        });
        if (res.ok) r.synced = true;
      } catch {
        break; // ქსელი ჩავარდა — ვტოვებთ შემდეგ ცდამდე
      }
    }
    this.saveQueue(q);
  }

  /** online-ზე დაბრუნებისას ავტო-სინქრონის ჩართვა */
  public initAutoSync(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => void this.syncQueue());
    void this.syncQueue();
  }
}

export const obdWifiService = new ObdWifiService();
