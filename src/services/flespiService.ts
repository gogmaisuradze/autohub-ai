/**
 * AutoHub AI - flespi ცოცხალი ტელემეტრიის მიმღები
 *
 * რას აკეთებს: flespi-ის არხიდან (channel) კითხულობს SinoTrack/4G აპარატის
 * ბოლო შეტყობინებას, თარგმნის აპის `DeviceTelemetryReading` ფორმატად და
 * აწვდის `obd4gService.ingestTelemetry()`-ს. იქიდან ავტომატურად მუშაობს
 * პარკინგის დეტექცია, რუკა და ყველა გამომწერი კომპონენტი.
 *
 * გააქტიურდება მხოლოდ როცა:
 *   1. obd4gService რეჟიმი = 'real', და
 *   2. localStorage-ში ჩაწერილია flespi ტოკენი.
 * ტოკენის გარეშე მშვიდად ისვენებს (აპს არ აფერხებს).
 *
 * კონფიგურაცია (localStorage):
 *   autohub_flespi_token   — flespi Standard token (Settings → Tokens)
 *   autohub_flespi_channel — არხის id (ნაგულისხმევი: 1476908 = "SinoTrack 4G")
 */

import { DeviceTelemetryReading } from '../types/telemetry';
import { obd4gService } from './obd4gService';

const FLESPI_BASE = 'https://flespi.io';
const TOKEN_KEY = 'autohub_flespi_token';
const CHANNEL_KEY = 'autohub_flespi_channel';
const DEFAULT_CHANNEL = '1476908';
const POLL_INTERVAL_MS = 5000;

// flespi-ის პარამეტრი რიცხვად (ან null)
function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

class FlespiService {
  private pollTimer: any = null;
  private lastTimestamp: number | null = null;
  private inFlight = false;

  private getToken(): string | null {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      return t && t.trim() ? t.trim() : null;
    } catch {
      return null;
    }
  }

  private getChannelId(): string {
    try {
      return localStorage.getItem(CHANNEL_KEY)?.trim() || DEFAULT_CHANNEL;
    } catch {
      return DEFAULT_CHANNEL;
    }
  }

  /** ტოკენის/არხის ჩაწერა კოდიდან (ან გამოიყენე Settings-ის localStorage) */
  public configure(token: string, channelId?: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token.trim());
      if (channelId) localStorage.setItem(CHANNEL_KEY, channelId.trim());
    } catch {}
  }

  /** პოლინგის ჩართვა (უსაფრთხოა მრავალჯერ გამოძახება) */
  public start() {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => this.tick(), POLL_INTERVAL_MS);
  }

  public stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async tick() {
    // მხოლოდ real რეჟიმში და ტოკენის არსებობისას
    if (obd4gService.getMode() !== 'real') return;
    const token = this.getToken();
    if (!token || this.inFlight) return;

    this.inFlight = true;
    try {
      const channelId = this.getChannelId();
      // ბოლო ერთი შეტყობინება (reverse + count:1)
      const selector = encodeURIComponent(JSON.stringify({ reverse: true, count: 1 }));
      const url = `${FLESPI_BASE}/gw/channels/${channelId}/messages?data=${selector}`;
      const res = await fetch(url, {
        headers: { Authorization: `FlespiToken ${token}` }
      });
      if (!res.ok) return;

      const body = await res.json();
      const msg = Array.isArray(body?.result) ? body.result[0] : null;
      if (!msg) return;

      const ts = num(msg['timestamp']);
      // იგივე შეტყობინება ხელახლა არ დავამუშავოთ
      if (ts !== null && this.lastTimestamp === ts) return;
      this.lastTimestamp = ts;

      obd4gService.ingestTelemetry(this.mapReading(msg));
    } catch {
      // ქსელის ხარვეზი — უბრალოდ ვტოვებთ შემდეგ ციკლამდე
    } finally {
      this.inFlight = false;
    }
  }

  /** flespi-ის ნედლი შეტყობინება → აპის DeviceTelemetryReading */
  private mapReading(msg: Record<string, any>): DeviceTelemetryReading {
    const active = obd4gService.getActiveDevice();
    const ts = num(msg['timestamp']);
    const recordedAt = ts !== null ? new Date(ts * 1000).toISOString() : new Date().toISOString();
    const hdop = num(msg['position.hdop']);

    return {
      // deviceId/vehicleId ვაიგივებთ აქტიურ მოწყობილობას, რომ ingestTelemetry მიიღოს
      deviceId: active?.deviceId || (msg['ident'] ? `OBD4G-IMEI-${msg['ident']}` : 'flespi-device'),
      vehicleId: active?.vehicleId || 'CAR_01',
      recordedAt,
      receivedAt: new Date().toISOString(),
      latitude: num(msg['position.latitude']),
      longitude: num(msg['position.longitude']),
      accuracyMeters: hdop !== null ? Math.round(hdop * 5 * 10) / 10 : null, // HDOP → სავარაუდო მეტრი
      speedKmh: num(msg['position.speed']),
      ignition:
        typeof msg['engine.ignition.status'] === 'boolean' ? msg['engine.ignition.status'] : null,
      batteryVoltage:
        num(msg['external.powersource.voltage']) ?? num(msg['battery.voltage']) ?? null,
      rpm: num(msg['engine.rpm']),
      gsmSignalDbm: num(msg['gsm.signal.dbm']) ?? num(msg['gsm.signal.level']),
      satellitesCount: num(msg['position.satellites'])
    };
  }
}

export const flespiService = new FlespiService();
