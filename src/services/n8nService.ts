import { DtcCode, FineItem, MapReport, N8nConfig, WebhookLog } from '../types';

export const DEFAULT_N8N_CONFIG: N8nConfig = {
  baseUrl: 'https://n8n.your-domain.com/webhook',
  scanEndpoint: '/obd-scan',
  clearEndpoint: '/clear-codes',
  chatEndpoint: '/ai-mechanic-chat',
  finesEndpoint: '/fines-check',
  reportsEndpoint: '/get-reports',
  addReportEndpoint: '/add-report',
  useLiveWebhook: false
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
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
  public async sendChatMessage(message: string, carContext: any): Promise<{ reply: string }> {
    const endpoint = `${this.config.baseUrl}${this.config.chatEndpoint}`;
    const payload = { message, car_context: carContext, timestamp: new Date().toISOString() };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return data;
      } catch (err: any) {
        console.warn('n8n ai chat webhook failed, falling back to smart mechanic:', err.message);
      }
    }

    // Advanced Georgian automotive AI mechanic response generation
    await new Promise(r => setTimeout(r, 1100));
    const lower = message.toLowerCase();
    let reply = "";

    if (lower.includes('ფასი') || lower.includes('ჯდება') || lower.includes('ღირს') || lower.includes('ხარჯი')) {
      reply = `თბილისის ბაზრის მიხედვით:\n` +
        `• ჟანგბადის სენსორი (O2 Lambda Bosch): 110 - 160 ₾\n` +
        `• შეცვლის ხელობა: 30 - 50 ₾\n` +
        `• სანთლები (NGK/Denso Iridium 4 ცალი): 120 - 180 ₾\n` +
        `• ბაბინა (Delphi/Bremi): 70 - 110 ₾ ცალი.\n` +
        `გირჩევთ შეიძინოთ თეგეტაში ან ელიავას ოფიციალურ დილერებთან, რათა არ შეგხვდეთ უხარისხო ანალოგი.`;
    } else if (lower.includes('გზა') || lower.includes('მოძრაობა') || lower.includes('ვიარო') || lower.includes('საშიში')) {
      reply = `თქვენი ბოლო დიაგნოსტიკის მიხედვით:\n` +
        `⚠️ P0300 (Misfire) კოდის დროს: თუ „ჩეკი“ ციმციმებს, მოძრაობა დაუყოვნებლივ უნდა შეაჩეროთ, რადგან დაუწვავი საწვავი შედის კატალიზატორში და დნობს მას (კატალიზატორის შეცვლა 1000+ ₾ ჯდება).\n` +
        `თუ ჩეკი უბრალოდ ანთია და არ ციმციმებს, შეგიძლიათ მშვიდად მიხვიდეთ უახლოეს სერვისცენტრამდე 60 კმ/სთ-მდე სიჩქარით.`;
    } else if (lower.includes('ნაწილი') || lower.includes('რა ვიყიდო') || lower.includes('ყიდვა')) {
      reply = `თქვენი ${carContext.brand || 'ავტომობილის'} (${carContext.model || 'მოდელისთვის'}): \n` +
        `1. ზედა ჟანგბადის სენსორი (Upstream O2 Sensor)\n` +
        `2. შემშვები კოლექტორის ვაკუუმის შლანგები (შესამოწმებელია კვამლის აპარატით)\n` +
        `3. ანთების სანთლების კომპლექტი (Iridium).\n` +
        `ნაწილების ყიდვამდე აუცილებლად შეამოწმეთ VIN კოდით: ${carContext.vin || 'WBA330...'}!`;
    } else if (lower.includes('ხელოსანი') || lower.includes('სერვისი') || lower.includes('სად')) {
      reply = `თბილისში აღნიშნულ პრობლემებზე გირჩევთ:\n` +
        `📍 თეგეტა მოტორსი (ცენტრალური ფილიალი, დიღომი) - ზუსტი კომპიუტერული დიაგნოსტიკა\n` +
        `📍 სანზონა / ფეიქრები - ელექტრიკოსი გიორგი (სპეციალიზაცია Bosch/Siemens სისტემებზე)\n` +
        `📍 ავტოექსპერტი (ვაშლიჯვარი) - კვამლის გენერატორით ვაკუუმის შემოწმება.`;
    } else {
      reply = `გამარჯობა! მე ვარ თქვენი AutoHub AI მექანიკოსი. ჩემი სისტემა უკავშირდება თქვენი ${carContext.brand} ${carContext.model}-ის ბორტ-კომპიუტერს.\n\n` +
        `აქტიურია 3 DTC კოდი: P0133, P0171, P0300. შემიძლია გაგიანალიზოთ ნაწილების ფასები, შეკეთების სირთულე ან გირჩიოთ, როგორ იმოქმედოთ გზაზე. რა გაინტერესებთ?`;
    }

    const mockResponse = { reply };
    this.addLog(endpoint, 'POST', payload, mockResponse, 'simulated');
    return mockResponse;
  }

  // 4. Fines Check
  public async checkFines(plateNumber: string, techPassport: string): Promise<{ fines: FineItem[] }> {
    const endpoint = `${this.config.baseUrl}${this.config.finesEndpoint}`;
    const payload = { plate_number: plateNumber, tech_passport: techPassport, timestamp: new Date().toISOString() };

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.addLog(endpoint, 'POST', payload, data, 'success');
        return data;
      } catch (err: any) {
        console.warn('n8n fines webhook failed, falling back to mock fines:', err.message);
      }
    }

    await new Promise(r => setTimeout(r, 700));
    const mockFines: FineItem[] = [
      {
        id: 'FIN-GEO-2026-9081',
        amount_gel: 50,
        discounted_amount_gel: 40,
        discount_expires_days: 11,
        date: '2026-10-17 16:40',
        location: 'თბილისი, მტკვრის მარჯვენა სანაპირო (კამერა #18)',
        violation_type: 'სიჩქარის გადაჭარბება (+17 კმ/სთ)',
        plate_number: plateNumber || 'GE-777-AA',
        status: 'pending'
      },
      {
        id: 'FIN-GEO-2026-8422',
        amount_gel: 100,
        discounted_amount_gel: 80,
        discount_expires_days: 4,
        date: '2026-10-11 11:15',
        location: 'თბილისი, ჭავჭავაძის გამზირი #37 (ავტობუსის ზოლი)',
        violation_type: 'საზოგადოებრივი ტრანსპორტის ზოლში (Bus Lane) მოძრაობა',
        plate_number: plateNumber || 'GE-777-AA',
        status: 'pending'
      }
    ];

    const mockResponse = { fines: mockFines };
    this.addLog(endpoint, 'POST', payload, mockResponse, 'simulated');
    return mockResponse;
  }

  // 5. Get Map Live Reports (Patrol, Radar, Hazard, Fuel Prices, Auto Showrooms)
  public async getReports(): Promise<MapReport[]> {
    const endpoint = `${this.config.baseUrl}${this.config.reportsEndpoint}`;

    if (this.config.useLiveWebhook) {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reports = Array.isArray(data) ? data : (data.reports || []);
        this.addLog(endpoint, 'GET', {}, reports, 'success');
        return reports;
      } catch (err: any) {
        console.warn('n8n get-reports webhook failed, falling back to cached/mock data:', err.message);
      }
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem('autohub_map_reports');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.addLog(endpoint, 'GET', {}, parsed, 'simulated');
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }

    // Default Tbilisi Mock Reports
    const initialReports: MapReport[] = [
      // Patrol Alerts
      {
        id: 'patrol-1',
        type: 'patrol',
        title: 'საპატრულო ეკიპაჟი - ჩასაფრება',
        description: 'ვაჟა-ფშაველას გამზირი, სამედიცინო უნივერსიტეტთან. ამოწმებენ მობილურსა და ღვედს.',
        lat: 41.7265,
        lng: 44.7562,
        timestamp: Date.now() - 12 * 60000,
        confirmations: 16,
        dismissals: 1,
        active: true
      },
      {
        id: 'patrol-2',
        type: 'patrol',
        title: 'საპატრულო პოლიცია - მოძრავი ეკიპაჟი',
        description: 'მტკვრის მარჯვენა სანაპირო, იუსტიციის სახლთან მიმართულებით.',
        lat: 41.7001,
        lng: 44.8055,
        timestamp: Date.now() - 28 * 60000,
        confirmations: 24,
        dismissals: 2,
        active: true
      },
      {
        id: 'patrol-3',
        type: 'patrol',
        title: 'საპატრულო შემოწმება',
        description: 'აღმაშენებლის ხეივანი, დიღომი - მოძრაობის კონტროლი.',
        lat: 41.7850,
        lng: 44.7720,
        timestamp: Date.now() - 48 * 60000,
        confirmations: 9,
        dismissals: 0,
        active: true
      },

      // Speed Cameras / Radars
      {
        id: 'radar-1',
        type: 'radar',
        title: 'სტაციონარული სიჩქარის რადარი (60 კმ/სთ)',
        description: 'ჭავჭავაძის გამზირი 32, ვაკის პარკთან. ფიქსირდება ორივე მიმართულება.',
        lat: 41.7108,
        lng: 44.7674,
        timestamp: Date.now() - 150 * 60000,
        confirmations: 54,
        dismissals: 0,
        active: true
      },
      {
        id: 'radar-2',
        type: 'radar',
        title: 'სექციური სიჩქარის კონტროლი (70 კმ/სთ)',
        description: 'კახეთის გზატკეცილი, თბილისის აეროპორტის მიმართულება. სექციის სიგრძე 3.2 კმ.',
        lat: 41.6912,
        lng: 44.8980,
        timestamp: Date.now() - 320 * 60000,
        confirmations: 112,
        dismissals: 0,
        active: true
      },
      {
        id: 'radar-3',
        type: 'radar',
        title: 'ჭკვიანი კამერა - ზოლის და წითლის კონტროლი',
        description: 'გმირთა მოედანი, სანაპიროს ასახვევთან. ავტობუსის ზოლისა და მანევრის კონტროლი.',
        lat: 41.7142,
        lng: 44.7825,
        timestamp: Date.now() - 95 * 60000,
        confirmations: 43,
        dismissals: 1,
        active: true
      },

      // Road Hazards / Accidents
      {
        id: 'hazard-1',
        type: 'hazard',
        title: 'ავტოსაგზაო შემთხვევა - მარჯვენა ზოლი გადაკეტილია',
        description: 'კოსტავას ქუჩა, ფილარმონიასთან. შეფერხებულია მოძრაობა, მოსულია ევაკუატორი.',
        lat: 41.7065,
        lng: 44.7885,
        timestamp: Date.now() - 9 * 60000,
        confirmations: 18,
        dismissals: 1,
        active: true
      },
      {
        id: 'hazard-2',
        type: 'hazard',
        title: 'საგზაო სარემონტო სამუშაოები',
        description: 'წერეთლის გამზირი, საგზაო საფარის შეკეთება.',
        lat: 41.7345,
        lng: 44.7890,
        timestamp: Date.now() - 60 * 60000,
        confirmations: 29,
        dismissals: 2,
        active: true
      },

      // Fuel Stations & Live Prices
      {
        id: 'fuel-1',
        type: 'fuel',
        title: 'Wissol Smart Station (ვისოლი)',
        description: 'სრული ასორტიმენტი, Smart Point მარკეტი და ყავა.',
        brand: 'Wissol',
        address: 'ჭავჭავაძის გამზ. 64, ვაკე',
        lat: 41.7115,
        lng: 44.7550,
        fuel_prices: {
          super_98: 3.65,
          premium_95: 3.12,
          regular_92: 2.94,
          diesel: 3.19,
          lpg: 1.62,
          ev_kwh: 0.45
        },
        timestamp: Date.now() - 30 * 60000,
        confirmations: 47,
        active: true
      },
      {
        id: 'fuel-2',
        type: 'fuel',
        title: 'Gulf Georgia (გალფი)',
        description: 'G-Force პრემიუმ საწვავი და სწრაფი მომსახურება.',
        brand: 'Gulf',
        address: 'ვაჟა-ფშაველას გამზ. 41, საბურთალო',
        lat: 41.7240,
        lng: 44.7480,
        fuel_prices: {
          super_98: 3.62,
          premium_95: 3.09,
          regular_92: 2.92,
          diesel: 3.17,
          lpg: 1.59
        },
        timestamp: Date.now() - 45 * 60000,
        confirmations: 38,
        active: true
      },
      {
        id: 'fuel-3',
        type: 'fuel',
        title: 'Rompetrol Georgia (რომპეტროლი)',
        description: 'Efix რუმინული ევრო 5 საწვავი.',
        brand: 'Rompetrol',
        address: 'მარჯვენა სანაპირო, ვახუშტის ხიდთან',
        lat: 41.7225,
        lng: 44.7840,
        fuel_prices: {
          super_98: 3.68,
          premium_95: 3.14,
          regular_92: 2.95,
          diesel: 3.22
        },
        timestamp: Date.now() - 50 * 60000,
        confirmations: 25,
        active: true
      },
      {
        id: 'fuel-4',
        type: 'fuel',
        title: 'Socar Energy (სოკარი)',
        description: 'ბენზინი, დიზელი, CNG გაზი და ელექტრო დამტენი.',
        brand: 'Socar',
        address: 'კახეთის გზატკეცილი 12',
        lat: 41.6960,
        lng: 44.8720,
        fuel_prices: {
          premium_95: 3.07,
          regular_92: 2.89,
          diesel: 3.14,
          lpg: 1.55,
          ev_kwh: 0.42
        },
        timestamp: Date.now() - 80 * 60000,
        confirmations: 41,
        active: true
      },
      {
        id: 'fuel-5',
        type: 'fuel',
        title: 'Lukoil (ლუკოილი)',
        description: 'ევრო სტანდარტის საწვავი ხელმისაწვდომ ფასად.',
        brand: 'Lukoil',
        address: 'წერეთლის გამზირი 114, დიდუბე',
        lat: 41.7380,
        lng: 44.7850,
        fuel_prices: {
          super_98: 3.59,
          premium_95: 3.05,
          regular_92: 2.88,
          diesel: 3.12
        },
        timestamp: Date.now() - 110 * 60000,
        confirmations: 22,
        active: true
      },

      // Auto Showrooms & Official Dealerships
      {
        id: 'showroom-1',
        type: 'showroom',
        title: 'Porsche Center Tbilisi (პორშე ცენტრი)',
        description: 'ოფიციალური იმპორტიორი და სერვის ცენტრი საქართველოში.',
        brand: 'Porsche',
        address: 'კახეთის გზატკეცილი 81',
        phone: '+995 32 2 244 911',
        rating: 4.9,
        lat: 41.6885,
        lng: 44.9120,
        timestamp: Date.now() - 1000 * 60000,
        confirmations: 78,
        active: true
      },
      {
        id: 'showroom-2',
        type: 'showroom',
        title: 'Tegeta Motors Central Hub (თეგეტა მოტორსი)',
        description: 'ყველაზე დიდი ავტო-მომსახურების ცენტრი და შოურუმი კავკასიაში.',
        brand: 'Tegeta',
        address: 'აკაკი ბელიაშვილის ქ. 48, დიღომი',
        phone: '+995 32 2 264 444',
        rating: 4.8,
        lat: 41.7760,
        lng: 44.7660,
        timestamp: Date.now() - 1200 * 60000,
        confirmations: 135,
        active: true
      },
      {
        id: 'showroom-3',
        type: 'showroom',
        title: 'BMW Caucasus (ომეგა მოტორსი)',
        description: 'BMW-სა და MINI-ს ოფიციალური დილერი საქართველოში.',
        brand: 'BMW',
        address: 'აღმაშენებლის ხეივანი მე-12 კმ',
        phone: '+995 32 2 544 444',
        rating: 4.8,
        lat: 41.7920,
        lng: 44.7680,
        timestamp: Date.now() - 1500 * 60000,
        confirmations: 63,
        active: true
      },
      {
        id: 'showroom-4',
        type: 'showroom',
        title: 'Toyota Center Tegeta (ტოიოტა ცენტრი)',
        description: 'ტოიოტას ოფიციალური დილერი - შოურუმი და სერვისი.',
        brand: 'Toyota',
        address: 'უნივერსიტეტის ქუჩა 6, საბურთალო',
        phone: '+995 32 2 292 000',
        rating: 4.7,
        lat: 41.7180,
        lng: 44.7320,
        timestamp: Date.now() - 1800 * 60000,
        confirmations: 82,
        active: true
      },
      {
        id: 'showroom-5',
        type: 'showroom',
        title: 'Mercedes-Benz Center (აკა)',
        description: 'Mercedes-Benz-ის გენერალური წარმომადგენლობა საქართველოში.',
        brand: 'Mercedes-Benz',
        address: 'აკაკი ბელიაშვილის ქ. 12, დიღომი',
        phone: '+995 32 2 243 000',
        rating: 4.8,
        lat: 41.7710,
        lng: 44.7710,
        timestamp: Date.now() - 2000 * 60000,
        confirmations: 94,
        active: true
      }
    ];

    try {
      localStorage.setItem('autohub_map_reports', JSON.stringify(initialReports));
    } catch (e) {
      // ignore
    }

    this.addLog(endpoint, 'GET', {}, initialReports, 'simulated');
    return initialReports;
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
          headers: { 'Content-Type': 'application/json' },
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
      const cached = localStorage.getItem('autohub_map_reports');
      const list: MapReport[] = cached ? JSON.parse(cached) : [];
      const updated = [payload, ...list];
      localStorage.setItem('autohub_map_reports', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    this.addLog(endpoint, 'POST', payload, { success: true, report: payload }, 'simulated');
    return { success: true, report: payload };
  }

  // 7. Vote on Report (Confirm: "ადგილზეა" or Dismiss: "აღარ არის")
  public async voteReport(reportId: string, isStillThere: boolean): Promise<{ success: boolean }> {
    try {
      const cached = localStorage.getItem('autohub_map_reports');
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
        localStorage.setItem('autohub_map_reports', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore
    }
    return { success: true };
  }
}

export const n8nService = new N8nService();
