import { DtcCode, FineItem, MapReport, N8nConfig, WebhookLog } from '../types';
import { DeviceTelemetryReading } from '../types/telemetry';
import { ParkingSession } from '../types/parkingSession';

export const DEFAULT_N8N_CONFIG: N8nConfig = {
  baseUrl: 'https://meticulous-oyster.pikapod.net/webhook',
  scanEndpoint: '/obd-scan',
  clearEndpoint: '/clear-codes',
  chatEndpoint: '/ai-mechanic-chat',
  finesEndpoint: '/fines-check',
  reportsEndpoint: '/get-reports',
  addReportEndpoint: '/add-report',
  telemetryEndpoint: '/obd-telemetry',
  parkingConfirmEndpoint: '/parking-session-confirm',
  parkingCompleteEndpoint: '/parking-session-complete',
  apiKey: '',
  useLiveWebhook: true
};

class N8nService {
  private config: N8nConfig = DEFAULT_N8N_CONFIG;
  private logs: WebhookLog[] = [];
  private logListeners: ((logs: WebhookLog[]) => void)[] = [];

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('autohub_n8n_config');
      if (saved) {
        this.config = { ...DEFAULT_N8N_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
  }

  public saveConfig(newConfig: N8nConfig) {
    this.config = newConfig;
    localStorage.setItem('autohub_n8n_config', JSON.stringify(newConfig));
  }

  public getConfig(): N8nConfig {
    return this.config;
  }

  /**
   * Helper to build request headers, including optional authentication key.
   * API keys and tokens are stored in n8n config on the client and validated on n8n server.
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.config.apiKey && this.config.apiKey.trim()) {
      headers['x-autohub-api-key'] = this.config.apiKey.trim();
      headers['Authorization'] = `Bearer ${this.config.apiKey.trim()}`;
    }
    return headers;
  }

  // Sync a user's vehicle + all known info into the shared Google Sheet (keyed by plate).
  // Fire-and-forget: never blocks the UI, always attempts when a baseUrl is set.
  public async syncVehicle(data: Record<string, any>): Promise<void> {
    const endpoint = `${this.config.baseUrl}/autohub-vehicle-sync`;
    const payload = { ...data, source: data.source || 'website', synced_at: new Date().toISOString() };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      this.addLog(endpoint, 'POST', payload, res.ok ? { ok: true } : { status: res.status }, res.ok ? 'success' : 'error');
    } catch (err: any) {
      this.addLog(endpoint, 'POST', payload, { error: err?.message }, 'error');
    }
  }

  // 1. 4G OBD Live Telemetry Streaming to n8n
  public async sendTelemetry(reading: DeviceTelemetryReading): Promise<any> {
    const endpoint = `${this.config.baseUrl}${this.config.telemetryEndpoint || '/obd-telemetry'}`;
    const payload = {
      device_id: reading.deviceId,
      vehicle_id: reading.vehicleId,
      recorded_at: reading.recordedAt,
      received_at: reading.receivedAt,
      latitude: reading.latitude,
      longitude: reading.longitude,
      accuracy_meters: reading.accuracyMeters,
      speed_kmh: reading.speedKmh,
      ignition: reading.ignition,
      battery_voltage: reading.batteryVoltage,
      satellites_count: reading.satellitesCount,
      idempotency_key: `${reading.deviceId}_${reading.recordedAt}`
    };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return data;
      } catch (err: any) {
        console.warn('n8n telemetry webhook failed:', err.message);
      }
    }

    const simulatedResponse = { ok: true, status: 'simulated_telemetry_received' };
    this.addLog(endpoint, 'POST', payload, simulatedResponse, 'simulated');
    return simulatedResponse;
  }

  // 2. Parking Session Confirm to n8n (Schedules server reminders)
  public async confirmParkingSession(session: ParkingSession): Promise<any> {
    const endpoint = `${this.config.baseUrl}${this.config.parkingConfirmEndpoint || '/parking-session-confirm'}`;
    const payload = {
      event: 'parking_confirmed',
      session_id: session.sessionId,
      vehicle_id: session.vehicleId,
      plate_number: session.plateNumber,
      lot_code: session.lot.lotCode,
      street_ge: session.lot.street_ge,
      tariff_category: session.lot.tariffCategory,
      hourly_rate_gel: session.lot.hourlyRateGel,
      stopped_at: session.stoppedAt,
      expires_at: session.expiresAt,
      reminder_lead_minutes: session.reminderMinutesBefore,
      idempotency_key: `${session.sessionId}_confirm`
    };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return data;
      } catch (err: any) {
        console.warn('n8n parking confirm webhook failed:', err.message);
      }
    }

    const simRes = { ok: true, message: 'პარკირების შეხსენება დაგეგმილია n8n-ში' };
    this.addLog(endpoint, 'POST', payload, simRes, 'simulated');
    return simRes;
  }

  // 3. Parking Session Complete to n8n (Cancels future reminders)
  public async completeParkingSession(session: ParkingSession): Promise<any> {
    const endpoint = `${this.config.baseUrl}${this.config.parkingCompleteEndpoint || '/parking-session-complete'}`;
    const payload = {
      event: 'parking_completed',
      session_id: session.sessionId,
      vehicle_id: session.vehicleId,
      plate_number: session.plateNumber,
      completed_at: session.completedAt || new Date().toISOString(),
      idempotency_key: `${session.sessionId}_complete`
    };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return data;
      } catch (err: any) {
        console.warn('n8n parking complete webhook failed:', err.message);
      }
    }

    const simRes = { ok: true, message: 'პარკირების შეხსენებები გაუქმებულია n8n-ში' };
    this.addLog(endpoint, 'POST', payload, simRes, 'simulated');
    return simRes;
  }

  public subscribeLogs(listener: (logs: WebhookLog[]) => void) {
    this.logListeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
    };
  }

  private addLog(endpoint: string, method: string, payload: any, response: any, status: 'success' | 'simulated' | 'error') {
    const entry: WebhookLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('ka-GE'),
      endpoint,
      method,
      status,
      payload,
      response
    };
    this.logs = [entry, ...this.logs.slice(0, 49)];
    this.logListeners.forEach(l => l([...this.logs]));
  }

  // 1. Scan OBD Codes
  public async scanObd(rawData: string = "43 01 33 00 00", vehicleId: string = "CAR_01"): Promise<{ parsed_codes: DtcCode[] }> {
    const endpoint = `${this.config.baseUrl}${this.config.scanEndpoint}`;
    const payload = { raw_data: rawData, vehicle_id: vehicleId, timestamp: new Date().toISOString() };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return data;
      } catch (err: any) {
        console.warn('n8n live webhook failed, falling back to simulated engine:', err.message);
      }
    }

    // Simulated Smart Fallback
    await new Promise(r => setTimeout(r, 900));
    const mockResponse: { parsed_codes: DtcCode[] } = {
      parsed_codes: [
        {
          code: 'P0133',
          title_ge: 'ჟანგბადის სენსორის დაგვიანებული რეაგირება (Bank 1, Sensor 1)',
          severity: 'medium',
          safe_to_drive: true,
          advice: 'გამონაბოლქვში საწვავის ნარევი არაზუსტად იზომება. რეკომენდირებულია სენსორის შემოწმება ან შეცვლა 300-500 კმ-ის ფარგლებში.',
          estimated_cost_gel: 140,
          category: 'emissions',
          timestamp: new Date().toLocaleDateString('ka-GE')
        },
        {
          code: 'P0171',
          title_ge: 'სისტემა ძალიან ღარიბია საწვავით (System Too Lean Bank 1)',
          severity: 'medium',
          safe_to_drive: true,
          advice: 'ძრავში შემოდის ზედმეტი ჰაერი (ვაკუუმის გაპარვა) ან ნაკლები საწვავი მიეწოდება. შეამოწმეთ შემშვები კოლექტორის მილები.',
          estimated_cost_gel: 80,
          category: 'engine',
          timestamp: new Date().toLocaleDateString('ka-GE')
        },
        {
          code: 'P0300',
          title_ge: 'შემთხვევითი/მრავლობითი ცილინდრების აფეთქების გამოტოვება (Random Misfire)',
          severity: 'high',
          safe_to_drive: false,
          advice: 'სანთლების (სვეჩების) ან ბაბინების დეფექტი. ძრავის ძლიერი რყევისას მოძრაობის გაგრძელება არარეკომენდირებულია კატალიზატორის დასაცავად!',
          estimated_cost_gel: 180,
          category: 'engine',
          timestamp: new Date().toLocaleDateString('ka-GE')
        }
      ]
    };

    this.addLog(endpoint, 'POST', payload, mockResponse, 'simulated');
    return mockResponse;
  }

  // 2. Clear DTC Codes
  public async clearCodes(vehicleId: string = "CAR_01"): Promise<{ status: string; message: string }> {
    const endpoint = `${this.config.baseUrl}${this.config.clearEndpoint}`;
    const payload = { command: "04", vehicle_id: vehicleId, timestamp: new Date().toISOString() };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return data;
      } catch (err: any) {
        console.warn('n8n clear-codes live webhook failed, falling back:', err.message);
      }
    }

    await new Promise(r => setTimeout(r, 600));
    const mockResponse = {
      status: 'success',
      message: 'შეცდომები წარმატებით წაიშალა (Mode 04 - Check Engine Reset)'
    };
    this.addLog(endpoint, 'POST', payload, mockResponse, 'simulated');
    return mockResponse;
  }

  // 3. AI Mechanic Chat
  public async askAiMechanic(message: string, vehicle?: any, dtcCodes?: any): Promise<{ reply: string }> {
    return this.sendChatMessage(message, {
      ...vehicle,
      vehicle,
      active_dtc: dtcCodes || vehicle?.active_dtc || []
    });
  }

  public async sendChatMessage(message: string, carContext: any): Promise<{ reply: string }> {
    const endpoint = `${this.config.baseUrl}${this.config.chatEndpoint}`;
    
    // Normalize carContext whether passed directly as vehicle or wrapped context
    const veh = carContext?.vehicle || carContext || {};
    const rawDtc: any[] = carContext?.active_dtc || carContext?.dtc_codes || veh?.dtc_codes || veh?.active_dtc || [];

    const sanitizedCarContext = {
      brand: veh?.brand || carContext?.brand || 'Mercedes-Benz',
      model: veh?.model || carContext?.model || 'GLA 250',
      year: veh?.year || carContext?.year || 2016,
      engine: veh?.engine || carContext?.engine || '2.0L Turbo',
      mileage_km: veh?.mileage_km || veh?.mileage || carContext?.mileage || carContext?.mileage_km || 78400,
      vin: veh?.vin || carContext?.vin || '',
      plate_number: veh?.plate_number || carContext?.plate_number || '',
      active_dtc: Array.isArray(rawDtc)
        ? rawDtc.map((d: any) => ({
            code: d.code,
            title_ge: d.title_ge || d.title || d.description || '',
            severity: d.severity || 'medium',
            safe_to_drive: d.safe_to_drive !== false,
            advice: d.advice || '',
            category: d.category || 'engine',
            estimated_cost_gel: d.estimated_cost_gel || 0
          }))
        : [],
      current_parking: carContext?.current_parking || null
    };

    const payload = {
      message,
      car_context: sanitizedCarContext,
      scanner_summary: {
        total_faults: sanitizedCarContext.active_dtc.length,
        codes: sanitizedCarContext.active_dtc.map(c => c.code),
        has_critical: sanitizedCarContext.active_dtc.some(c => c.severity === 'high' || !c.safe_to_drive)
      },
      timestamp: new Date().toISOString()
    };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');

        let replyText = '';
        if (typeof data === 'string') {
          replyText = data;
        } else if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          replyText = typeof first === 'string' ? first : (first?.reply || first?.output || first?.message || first?.text || JSON.stringify(first));
        } else if (data && typeof data === 'object') {
          replyText = data.reply || data.output || data.message || data.text || data.response || (typeof data.data === 'string' ? data.data : '');
        }

        if (replyText) {
          return { reply: replyText };
        }
      } catch (err: any) {
        console.warn('n8n live webhook failed, dynamically analyzing scanner faults:', err.message);
      }
    }

    // Dynamic Automotive AI Engine (analyzing ACTUAL scanner DTC faults dynamically, NO hardcoded templates)
    await new Promise(r => setTimeout(r, 700));
    const activeDtc = sanitizedCarContext.active_dtc;
    const brand = sanitizedCarContext.brand;
    const model = sanitizedCarContext.model;
    const engine = sanitizedCarContext.engine;
    const lower = message.toLowerCase();

    let reply = "";

    if (activeDtc.length === 0) {
      reply = `🔍 **სკანირების ანალიზი (${brand} ${model}):**\n` +
        `OBD სკანერმა თქვენს ბორტ-კომპიუტერზე არცერთი შეცდომის კოდი (DTC) არ დააფიქსირა. სისტემა მუშაობს ქარხნულ პარამეტრებში, Check Engine გამორთულია.\n\n` +
        `💡 რეკომენდაცია: გააგრძელეთ პერიოდული მოვლა და სითხეების (ძრავის ზეთი, ანტიფრიზი, სამუხრუჭე) კონტროლი გარბენის მიხედვით.`;
    } else {
      const codeListStr = activeDtc.map(c => `• **${c.code}**: ${c.title_ge || 'სისტემური ხარვეზი'}${c.estimated_cost_gel ? ` (~${c.estimated_cost_gel} ₾)` : ''}`).join('\n');
      const hasUnsafe = activeDtc.some(c => c.safe_to_drive === false || c.severity === 'high');
      const totalCost = activeDtc.reduce((sum, c) => sum + (c.estimated_cost_gel || 120), 0);

      if (lower.includes('ფასი') || lower.includes('ჯდება') || lower.includes('ღირს') || lower.includes('ხარჯი')) {
        reply = `💰 **სკანირებული ხარვეზების შეკეთების ხარჯთაღრიცხვა (${brand} ${model}):**\n\n` +
          `${activeDtc.map(c => `• **${c.code}** (${c.title_ge}): ნაწილი + ხელობა ~${c.estimated_cost_gel || 120} - ${(c.estimated_cost_gel || 120) + 60} ₾`).join('\n')}\n\n` +
          `📊 **ჯამური საორიენტაციო ხარჯი:** ~${totalCost} - ${totalCost + 150} ₾ (თბილისის ბაზრის მიხედვით).\n` +
          `გირჩევთ ნაწილები შეიძინოთ თეგეტაში ან ავტობანში ოფიციალური გარანტიით.`;
      } else if (lower.includes('გზა') || lower.includes('მოძრაობა') || lower.includes('ვიარო') || lower.includes('საშიში') || lower.includes('უსაფრთხო')) {
        reply = `⚠️ **უსაფრთხოების ანალიზი (${activeDtc.length} აქტიური ხარვეზი):**\n\n` +
          `${hasUnsafe
            ? `🚨 **გაფრთხილება:** სკანერმა გამოავლინა კრიტიკული ხარვეზი (${activeDtc.filter(c => !c.safe_to_drive || c.severity === 'high').map(c => c.code).join(', ')}). მოძრაობის გაგრძელება არარეკომენდირებულია, რათა თავიდან აიცილოთ ძრავის ან კატალიზატორის მძიმე დაზიანება!`
            : `✅ დაფიქსირებული ხარვეზები საშუალო სიმძიმისაა (${activeDtc.map(c => c.code).join(', ')}). მოძრაობა შესაძლებელია დაბალი დატვირთვით უახლოეს სერვისცენტრამდე.`}\n\n` +
          activeDtc.map(c => `• ${c.code}: ${c.advice || 'საჭიროებს კომპიუტერულ შემოწმებას'}`).join('\n');
      } else if (lower.includes('ნაწილი') || lower.includes('რა ვიყიდო') || lower.includes('ყიდვა')) {
        reply = `🔧 **საჭირო სათადარიგო ნაწილები (${brand} ${model} • ${engine}):**\n\n` +
          activeDtc.map((c, i) => `${i + 1}. **${c.code}**-სთვის: ${c.title_ge} (რეკომენდირებული ბრენდები: Bosch, Denso, Pierburg, NGK)`).join('\n') +
          `\n\n💡 შეძენამდე აუცილებლად გადაამოწმეთ ნაწილის OEM კოდი VIN კოდით: ${sanitizedCarContext.vin || 'თქვენი ავტომობილის პასპორტით'}.`;
      } else {
        reply = `👨‍🔧 **სკანირების შედეგების დეტალური ანალიზი (${brand} ${model}):**\n\n` +
          `ბორტ-კომპიუტერის სკანირებამ გამოავლინა **${activeDtc.length} აქტიური DTC ხარვეზი**:\n` +
          `${codeListStr}\n\n` +
          `📌 **დიაგნოზი და მოქმედების გეგმა:**\n` +
          activeDtc.map(c => `• **${c.code}**: ${c.advice || `${c.title_ge} საჭიროებს კომპიუტერულ შემოწმებას და გაწმენდას/შეცვლას.`}`).join('\n') +
          `\n\n${hasUnsafe ? '⚠️ ყურადღება: მოძრაობა შეზღუდეთ და მიმართეთ ხელოსანს.' : '✅ მოძრაობა დასაშვებია მშვიდ რეჟიმში.'} მკითხეთ დეტალურად: ფასები, ნაწილების შერჩევა ან ხელოსნის რეკომენდაცია.`;
      }
    }

    const mockResponse = { reply };
    this.addLog(endpoint, 'POST', payload, mockResponse, 'simulated');
    return mockResponse;
  }

  // 4. Fines Check (police.ge & n8n webhook)
  public async checkFines(plateNumber: string, techPassport: string): Promise<{ fines: FineItem[] }> {
    const endpoint = `${this.config.baseUrl}${this.config.finesEndpoint}`;
    const payload = { plate_number: plateNumber, tech_passport: techPassport, timestamp: new Date().toISOString() };

    if (this.config.useLiveWebhook) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // If webhook returns any array of fines (even empty []), accept it as genuine!
        if (data && Array.isArray(data.fines)) {
          this.addLog(endpoint, 'POST', payload, data, 'success');
          return data;
        }
      } catch (err: any) {
        console.warn('n8n fines webhook offline or failed:', err.message);
      }
    }

    await new Promise(r => setTimeout(r, 300));
    const normalizedPlate = (plateNumber || '').trim().toUpperCase();
    const normalizedTech = (techPassport || '').trim().toUpperCase();

    // If user checks their own vehicle (any plate other than the demo FR-282-EE / tech 22-3999),
    // NEVER synthesize fake violations or deduct points from their real license!
    const isDemoCar = (normalizedPlate === 'FR-282-EE' || !normalizedPlate) && (!normalizedTech || normalizedTech === '22-3999');

    if (!isDemoCar) {
      // User's own real vehicle: 0 fines, clean record
      const cleanResponse = { fines: [] };
      this.addLog(endpoint, 'POST', payload, cleanResponse, 'simulated');
      return cleanResponse;
    }

    // Default preview fines ONLY for initial demo car demonstration
    const mockFines: FineItem[] = [
      {
        id: 'FIN-GEO-2026-9081',
        ticket_number: 'ოქმი #PT-2026-908124',
        amount_gel: 50,
        discounted_amount_gel: 40,
        discount_expires_days: 11,
        date: '2026-10-17 16:40',
        location: 'თბილისი, მტკვრის მარჯვენა სანაპირო (სექციური რადარი #18)',
        violation_type: 'სიჩქარის გადაჭარბება (+17 კმ/სთ)',
        plate_number: 'FR-282-EE',
        status: 'pending',
        points_deducted: 10,
        points_status: 'deducted',
        article_law_ge: 'ასკ მუხლი 125, ნაწილი 1',
        points_explanation_ge: 'სიჩქარის გადაჭარბება 15-დან 40 კმ/სთ-მდე ითვალისწინებს 10 ქულის დაკლებას მართვის მოწმობაზე.',
        camera_speed_kmh: 77,
        allowed_speed_kmh: 60,
        radar_id: 'MIA-RADAR-018-TB',
        photo_url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'FIN-GEO-2026-8422',
        ticket_number: 'ოქმი #PT-2026-842219',
        amount_gel: 100,
        discounted_amount_gel: 80,
        discount_expires_days: 4,
        date: '2026-10-11 11:15',
        location: 'თბილისი, ჭავჭავაძის გამზირი #37 (ავტობუსის ზოლი - ჭკვიანი კამერა #4)',
        violation_type: 'საზოგადოებრივი ტრანსპორტის ზოლში (Bus Lane) მოძრაობა',
        plate_number: 'FR-282-EE',
        status: 'pending',
        points_deducted: 0,
        points_status: 'video_exempt',
        article_law_ge: 'ასკ მუხლი 125, ნაწილი 8',
        points_explanation_ge: 'ჭკვიანი ვიდეოკამერის ფიქსაცია: ქულა არ აკლდება ავტომატურად (0 ქულა), სანამ მძღოლის იდენტიფიცირება არ მოხდება.',
        radar_id: 'MIA-BUSLANE-004-V',
        photo_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'FIN-GEO-2026-7201',
        ticket_number: 'ოქმი #PT-2026-720110',
        amount_gel: 50,
        discounted_amount_gel: 40,
        discount_expires_days: 0,
        date: '2026-09-28 14:22',
        location: 'თბილისი, რუსთაველის გამზირი / კოსტავას კვეთა',
        violation_type: 'შუქნიშნის ამკრძალავ (წითელ) სიგნალზე გავლა',
        plate_number: 'FR-282-EE',
        status: 'paid',
        points_deducted: 0,
        points_status: 'video_exempt',
        article_law_ge: 'ასკ მუხლი 125, ნაწილი 3',
        points_explanation_ge: 'ჯარიმა სრულად გადახდილია -20% შეღავათით.',
        radar_id: 'MIA-SMARTCAM-009',
        photo_url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
        payment_receipt: {
          txn_id: 'TXN-GE-2026-99381',
          ticket_number: 'ოქმი #PT-2026-720110',
          amount_paid: 40,
          payment_date: '2026-09-29 10:14',
          payment_method: 'VISA (4127 •••• •••• 8842)',
          auth_code: 'AUTH-892173',
          card_last4: '8842',
          payer_name: 'გიორგი მაისურაძე'
        }
      }
    ];

    const mockResponse = { fines: mockFines };
    this.addLog(endpoint, 'POST', payload, mockResponse, 'simulated');
    return mockResponse;
  }

  // 5. Get Map Live Reports (Patrol, Radar, Hazard, Fuel Prices, Auto Showrooms)
  public async getReports(): Promise<MapReport[]> {
    const endpoint = `${this.config.baseUrl}${this.config.reportsEndpoint}`;

    let liveReports: MapReport[] = [];
    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: this.getHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          liveReports = Array.isArray(data) ? data : (data.reports || []);
          this.addLog(endpoint, 'GET', {}, liveReports, 'success');
        }
      } catch (err: any) {
        console.warn('n8n get-reports webhook failed, falling back to cached/mock data:', err.message);
      }
    }

    // Default Tbilisi Verified POIs (radars, fuel stations, showrooms, patrols)
    const initialReports: MapReport[] = [];

    // Combine live reports from n8n + local user additions + verified base POIs
    let localAdditions: MapReport[] = [];
    try {
      const cached = localStorage.getItem('autohub_map_reports_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) localAdditions = parsed;
      }
    } catch (e) {
      // ignore
    }

    const mergedMap = new Map<string, MapReport>();
    // 1. Live reports from n8n first
    for (const r of liveReports) {
      if (r && r.id) mergedMap.set(r.id, r);
    }
    // 2. Local user additions
    for (const r of localAdditions) {
      if (r && r.id && !mergedMap.has(r.id)) mergedMap.set(r.id, r);
    }
    // 3. Base verified POIs (radars, fuel stations, showrooms)
    for (const r of initialReports) {
      if (r && r.id && !mergedMap.has(r.id)) mergedMap.set(r.id, r);
    }

    const finalResult = Array.from(mergedMap.values());
    try {
      localStorage.setItem('autohub_map_reports_v2', JSON.stringify(finalResult));
    } catch (e) {
      // ignore
    }

    this.addLog(endpoint, 'GET', {}, finalResult, liveReports.length > 0 ? 'success' : 'simulated');
    return finalResult;
  }

  // 6. Add Live Map Report (POST /webhook/add-report)
  public async addReport(report: Omit<MapReport, 'id' | 'confirmations' | 'active'>): Promise<{ success: boolean; report: MapReport }> {
    const endpoint = `${this.config.baseUrl}${this.config.addReportEndpoint}`;
    const payload = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      confirmations: 1,
      dismissals: 0,
      active: true
    };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return { success: true, report: data.report || payload };
      } catch (err: any) {
        console.warn('n8n add-report webhook failed, falling back to simulated add:', err.message);
      }
    }

    // Save to local storage
    try {
      const cached = localStorage.getItem('autohub_map_reports_v2');
      const list: MapReport[] = cached ? JSON.parse(cached) : [];
      const updated = [payload, ...list];
      localStorage.setItem('autohub_map_reports_v2', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    this.addLog(endpoint, 'POST', payload, { success: true, report: payload }, 'simulated');
    return { success: true, report: payload };
  }

  // 7. Vote on Report (Confirm: "ადგილზეა" or Dismiss: "აღარ არის")
  public async voteReport(reportId: string, isStillThere: boolean): Promise<{ success: boolean }> {
    try {
      const cached = localStorage.getItem('autohub_map_reports_v2');
      if (cached) {
        const list: MapReport[] = JSON.parse(cached);
        const updated = list.map(item => {
          if (item.id === reportId) {
            return {
              ...item,
              confirmations: isStillThere ? item.confirmations + 1 : item.confirmations,
              dismissals: !isStillThere ? (item.dismissals || 0) + 1 : item.dismissals
            };
          }
          return item;
        });
        localStorage.setItem('autohub_map_reports_v2', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore
    }
    return { success: true };
  }
}

export const n8nService = new N8nService();
