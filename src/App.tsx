import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { VEHICLE_PRESETS, OWNER_VEHICLES, VISITOR_INITIAL_VEHICLE } from './constants/vehicles';
import { Navigation, TabType } from './components/Navigation';
import { HomeHub } from './components/HomeHub';

import { AiMechanicChat } from './components/AiMechanic/AiMechanicChat';
import { FinesModule } from './components/Fines/FinesModule';
import { ParkingModule } from './components/Parking/ParkingModule';
import { ServiceLogModule } from './components/ServiceLog/ServiceLogModule';
import { GarageModule } from './components/Garage/GarageModule';
import LiveTrafficMap from './components/Map/LiveTrafficMap';
import { SettingsModule } from './components/Settings/SettingsModule';
import { ClearDtcModal } from './components/Modals/ClearDtcModal';
import { ObdAdapterConnectModal, ObdAdapterType } from './components/Modals/ObdAdapterConnectModal';
import { PwaInstallBanner } from './components/Modals/PwaInstallBanner';
import { AddVehicleWizardModal } from './components/Modals/AddVehicleWizardModal';
import { ContextualFieldPromptModal, PromptFieldType } from './components/Modals/ContextualFieldPromptModal';
import { VinHistoryModal } from './components/Modals/VinHistoryModal';
import { ServiceBookingModal } from './components/Booking/ServiceBookingModal';
import { CoverAdBanner } from './components/Banner/CoverAdBanner';
import { FloatingMechanicWidget } from './components/AiMechanic/FloatingMechanicWidget';
import { InteractiveSiteTour } from './components/Guide/InteractiveSiteTour';
import { ParkingConfirmationModal } from './components/Parking/ParkingConfirmationModal';
import { parkingSessionService } from './services/parkingSessionService';
import { ParkingSession } from './types/parkingSession';
import { DtcCode, FineItem, ServiceBookingItem, ServiceItem, TelemetryData, VehicleProfile } from './types';
import { n8nService } from './services/n8nService';
import { sounds } from './services/soundEffects';
import { generateServicesForVehicle } from './services/vinServiceEngine';
import { ArrowLeft } from 'lucide-react';

const ObdModule = React.lazy(() => import('./components/Diagnostics/ObdModule'));

const INITIAL_VEHICLE: VehicleProfile = {
  id: 'CAR_01',
  brand: 'Mercedes-Benz',
  model: 'GLA 250',
  year: 2016,
  engine: '2.0L Turbo M270 (1991 cm³ / 208 HP)',
  vin: 'WDCTG4GB2GJ193791',
  plate_number: 'FR-282-EE',
  tech_passport: '22-3999',
  mileage_km: 78400,
  fuel_type: 'petrol',
  obd_ip: '192.168.0.10',
  obd_port: 35000,
  horsepower: 208,
  last_oil_change_km: 73200,
  pti_expiry_date: '2027-02-15',
  driver_license_points: 90,
  driver_personal_number: '01024085432',
  driver_name: 'გიორგი მაისურაძე',
  driver_phone: '+995 599 12 34 56',
  driver_photo_url: 'avatar_dog'
};

const INITIAL_DTC_CODES: DtcCode[] = [
  {
    code: 'P0011',
    title_ge: 'Mercedes M270: გამანაწილებელი ლილვის ფაზის გადახრა (Bank 1, Intake Camshaft)',
    severity: 'medium',
    safe_to_drive: true,
    advice: 'M270 ძრავის ტიპიური ხარვეზი: შეამოწმეთ შემშვები ლილვის ელექტრომაგნიტი (Camshaft Solenoid Magnet) ან ზეთის წნევა.',
    estimated_cost_gel: 160,
    category: 'engine',
    timestamp: '2026-10-24'
  },
  {
    code: 'P0128',
    title_ge: 'Mercedes M270: თერმოსტატის გაგრილების ტემპერატურა დაბალია (Coolant Temp Below Regulating)',
    severity: 'medium',
    safe_to_drive: true,
    advice: 'ელექტრონული თერმოსტატის კორპუსი ღიაა ჩარჩენილი. ძრავი ნელა თბება. რეკომენდირებულია თერმოსტატის შეცვლა.',
    estimated_cost_gel: 240,
    category: 'engine',
    timestamp: '2026-10-24'
  },
  {
    code: 'P0133',
    title_ge: 'ჟანგბადის სენსორის დაგვიანებული რეაგირება (Bank 1, Sensor 1 O2)',
    severity: 'low',
    safe_to_drive: true,
    advice: 'გამონაბოლქვში საწვავის ნარევის მონიტორინგი. შეამოწმეთ ლამბდა-ზონდის კონექტორი ან გაწმინდეთ სენსორი.',
    estimated_cost_gel: 120,
    category: 'emissions',
    timestamp: '2026-10-24'
  }
];

const INITIAL_FINES: FineItem[] = [
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

const INITIAL_SERVICES: ServiceItem[] = [
  // 1. Fluids (ზეთები და სითხეები)
  {
    id: 'srv_1',
    title_ge: 'ძრავის ზეთი (Motul 5W-30) & ზეთის ფილტრი',
    category: 'fluids',
    variant_key: 'engine_oil',
    variant_name_ge: 'ძრავის ზეთი',
    current_km: 48200,
    interval_km: 8000,
    remaining_km: 2400,
    remaining_days: 42,
    last_service_date: '2026-06-12',
    last_service_km: 45800,
    health_percentage: 30,
    cost_gel: 240,
    notes: 'Motul 8100 X-clean+ სინთეტიკური ზეთი',
    oil_viscosity: '5W-30',
    oil_brand: 'Motul',
    oil_liters: 5.2,
    oil_filter_replaced: true
  },
  {
    id: 'srv_atf',
    title_ge: 'გადაცემათა კოლოფის ზეთი (ZF 8HP ATF & ფილტრი)',
    category: 'fluids',
    variant_key: 'transmission_fluid',
    variant_name_ge: 'კოლოფის ზეთი ATF',
    current_km: 48200,
    interval_km: 60000,
    remaining_km: 35000,
    remaining_days: 520,
    last_service_date: '2025-09-15',
    last_service_km: 23200,
    health_percentage: 58,
    cost_gel: 680,
    notes: 'ZF Lifeguard 8 სრული აპარატული შეცვლა + ახალი ორიგინალი პადდონი',
    transmission_fluid_type: 'full',
    transmission_type: 'zf8hp',
    transmission_filter_replaced: true,
    transmission_fluid_brand: 'ZF Lifeguard 8'
  },
  {
    id: 'srv_coolant',
    title_ge: 'გამაგრილებელი სითხე - ანტიფრიზი (HEPU G12+ -35°C)',
    category: 'fluids',
    variant_key: 'coolant',
    variant_name_ge: 'ანტიფრიზი',
    current_km: 48200,
    interval_km: 60000,
    remaining_km: 42000,
    remaining_days: 600,
    last_service_date: '2026-01-10',
    last_service_km: 42000,
    health_percentage: 70,
    cost_gel: 130,
    notes: 'სრული ჩარეცხვა და ახალი HEPU G12+ კონცენტრატი',
    coolant_freezing_point_c: -35,
    coolant_spec: 'G12+ (წითელი)'
  },

  // 2. Chassis & Wheels (სავალი ნაწილი და ბორბლები)
  {
    id: 'srv_2',
    title_ge: 'წინა სამუხრუჭე ხუნდები (Brembo Ceramic)',
    category: 'chassis',
    variant_key: 'brake_pads',
    variant_name_ge: 'სამუხრუჭე ხუნდები',
    current_km: 48200,
    interval_km: 25000,
    remaining_km: 17500,
    remaining_days: 280,
    last_service_date: '2026-02-18',
    last_service_km: 40700,
    health_percentage: 70,
    cost_gel: 310,
    notes: 'დისკები იდეალურ მდგომარეობაშია (სისქე 28.0 მმ)',
    brake_position: 'front',
    brake_brand: 'Brembo',
    brake_wear_pct: 30,
    brake_disc_status: 'good',
    brake_fluid_checked: true
  },
  {
    id: 'srv_5',
    title_ge: 'საბურავები (Michelin Pilot Sport 5)',
    category: 'chassis',
    variant_key: 'tires',
    variant_name_ge: 'საბურავები',
    current_km: 48200,
    interval_km: 40000,
    remaining_km: 28000,
    remaining_days: 380,
    last_service_date: '2026-03-20',
    last_service_km: 36200,
    health_percentage: 70,
    cost_gel: 920,
    notes: 'წინა და უკანა ბალანსირება გაკეთებულია, წნევა 2.3 Bar',
    tire_size: '225/45 R18',
    tire_season: 'summer',
    tire_brand: 'Michelin Pilot Sport 5',
    tread_depth_mm: 6.8,
    tire_pressure_bar: 2.3
  },
  {
    id: 'srv_align',
    title_ge: 'თვლების გეომეტრია (3D რაზვალი & ბალანსირება)',
    category: 'chassis',
    variant_key: 'wheel_alignment',
    variant_name_ge: 'თვლების გეომეტრია',
    current_km: 48200,
    interval_km: 15000,
    remaining_km: 11000,
    remaining_days: 210,
    last_service_date: '2026-04-10',
    last_service_km: 44200,
    health_percentage: 73,
    cost_gel: 70,
    notes: 'Hunter 3D ლაზერულ სტენდზე 4-ვე თვლის გასწორება',
    alignment_type: 'both',
    alignment_axle: 'both'
  },

  // 3. Filters (ფილტრები და ჰაერის მიწოდება)
  {
    id: 'srv_3',
    title_ge: 'ჰაერისა და სალონის მიკროფილტრი',
    category: 'filters',
    variant_key: 'cabin_filter',
    variant_name_ge: 'სალონის ფილტრი',
    current_km: 48200,
    interval_km: 15000,
    remaining_km: 3100,
    remaining_days: 55,
    last_service_date: '2026-04-05',
    last_service_km: 36300,
    health_percentage: 20,
    cost_gel: 110,
    notes: 'MANN-Filter FreciousPlus ნახშირის ანტიალერგიული ფილტრი',
    filter_air: true,
    filter_cabin: true,
    filter_fuel: false,
    filter_cabin_type: 'carbon',
    filter_brand: 'MANN-Filter'
  },

  // 4. Engine & Ignition (ძრავი და აალების სისტემა)
  {
    id: 'srv_plugs',
    title_ge: 'აალების სანთლები - სვეჩები (NGK Laser Iridium)',
    category: 'engine',
    variant_key: 'spark_plugs',
    variant_name_ge: 'აალების სანთლები',
    current_km: 48200,
    interval_km: 60000,
    remaining_km: 45000,
    remaining_days: 640,
    last_service_date: '2026-01-20',
    last_service_km: 41200,
    health_percentage: 75,
    cost_gel: 280,
    notes: 'NGK Laser Iridium 4 ცალი, კოჭები შემოწმებულია (0 Misfire)',
    spark_plug_type: 'iridium',
    spark_plug_count: 4,
    spark_plug_brand: 'NGK Laser Iridium'
  },

  // 5. Electrical & AC (ელექტროობა და კლიმატი)
  {
    id: 'srv_batt',
    title_ge: 'აკუმულატორი (Varta Silver Dynamic AGM 80Ah)',
    category: 'electrical',
    variant_key: 'battery',
    variant_name_ge: 'აკუმულატორი',
    current_km: 48200,
    interval_km: 60000,
    remaining_km: 52000,
    remaining_days: 850,
    last_service_date: '2025-11-05',
    last_service_km: 40200,
    health_percentage: 86,
    cost_gel: 360,
    notes: '12.6V მოსვენებისას, 14.2V დატენვისას, 3-წლიანი გარანტიით',
    battery_capacity_ah: 80,
    battery_voltage: 12.6,
    battery_mfg_date: '2025/11',
    battery_brand: 'Varta Silver Dynamic AGM'
  },

  // 6. Legal & PTI (იურიდიული და სადაზღვევო ვადები)
  {
    id: 'srv_4',
    title_ge: 'პერიოდული ტექ-დათვალიერება (PTI Georgia)',
    category: 'legal',
    variant_key: 'pti',
    variant_name_ge: 'ტექ-დათვალიერება PTI',
    current_km: 48200,
    interval_km: 30000,
    remaining_km: 8400,
    remaining_days: 50,
    last_service_date: '2025-12-10',
    last_service_km: 39800,
    health_percentage: 85,
    cost_gel: 60,
    notes: 'გამონაბოლქვი და სამუხრუჭე სტენდი ჩაბარებულია',
    pti_expiry_date: '2026-12-10',
    pti_reminder_enabled: true,
    pti_reminder_days: 30,
    pti_center: 'თბილისი, Greenway დიღომი',
    pti_cert_number: 'PTI-GE-98432',
    pti_status: 'passed'
  },
  {
    id: 'srv_insur',
    title_ge: 'ავტომობილის კასკო დაზღვევა (ალდაგი)',
    category: 'legal',
    variant_key: 'insurance',
    variant_name_ge: 'ავტოდაზღვევა',
    current_km: 48200,
    interval_km: 25000,
    remaining_km: 18000,
    remaining_days: 260,
    last_service_date: '2026-03-01',
    last_service_km: 42000,
    health_percentage: 72,
    cost_gel: 1250,
    notes: 'სრული კასკო 0% ფრანშიზით, მესამე პირის პასუხისმგებლობა და ევაკუატორის სერვისი',
    insurance_company: 'ალდაგი (Aldagi)',
    insurance_type: 'casco',
    insurance_policy_number: 'POL-2026-9812',
    insurance_expiry_date: '2027-03-01'
  }
];

export const App: React.FC = () => {
  // Persist active tab in localStorage and URL hash so browser refreshes stay on the same screen
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const hash = window.location.hash.replace('#', '') as TabType;
      if (hash === 'garage') return 'fines';
      if (['home', 'obd', 'fines', 'parking', 'ai', 'service', 'map', 'settings'].includes(hash)) {
        return hash;
      }
      const saved = localStorage.getItem('autohub_active_tab') as TabType;
      if (saved === 'garage') return 'fines';
      if (saved && ['home', 'obd', 'fines', 'parking', 'ai', 'service', 'map', 'settings'].includes(saved)) {
        return saved;
      }
      return 'obd'; // Default to OBD/3D Testing screen so user immediately sees the 3D car!
    } catch {
      return 'obd';
    }
  });

  // Animation ID reference for smooth organic scrolling
  const scrollAnimRef = useRef<number | null>(null);

  const smoothScrollTo = (targetY: number, duration = 900) => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }

    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;

    if (Math.abs(distance) < 6) return;

    let startTime: number | null = null;

    const cancelListeners = () => {
      window.removeEventListener('wheel', handleInterrupt);
      window.removeEventListener('touchstart', handleInterrupt);
    };

    const handleInterrupt = () => {
      if (scrollAnimRef.current !== null) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
      cancelListeners();
    };

    window.addEventListener('wheel', handleInterrupt, { passive: true });
    window.addEventListener('touchstart', handleInterrupt, { passive: true });

    // Smooth cubic bezier easing for organic, graceful scrolling
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * ease);

      if (elapsed < duration) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
        cancelListeners();
      }
    };

    scrollAnimRef.current = requestAnimationFrame(step);
  };

  const scrollToMainContent = (duration = 950) => {
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    const stickyHeaderEl = document.getElementById('sticky-header');
    const headerHeight = stickyHeaderEl ? stickyHeaderEl.getBoundingClientRect().height : 110;

    const rect = mainEl.getBoundingClientRect();
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = Math.max(0, rect.top + currentScrollY - headerHeight - 10);

    smoothScrollTo(targetY, duration);
  };

  const handleTabChange = (tab: TabType) => {
    const isSameTab = tab === activeTab;
    setActiveTab(tab);
    try {
      localStorage.setItem('autohub_active_tab', tab);
      window.location.hash = tab;
    } catch {}

    if (tab === 'home') {
      if (!isSameTab && !isSiteTourActive) {
        smoothScrollTo(0, 750);
      }
    } else {
      // Gently glide down past the banner so page content starts cleanly below the sticky navigation
      setTimeout(() => {
        scrollToMainContent(950);
      }, 40);
    }
  };

  // Global Keyboard Navigation: Alt + ArrowLeft / Alt + ArrowRight for switching main tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Alt/Option + ArrowLeft / ArrowRight switches top tabs
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const tabList: TabType[] = ['home', 'obd', 'fines', 'parking', 'service', 'map'];
        const currentIdx = tabList.indexOf(activeTab);
        if (currentIdx !== -1) {
          e.preventDefault();
          sounds.playClick();
          if (e.key === 'ArrowLeft') {
            const prevIdx = (currentIdx - 1 + tabList.length) % tabList.length;
            handleTabChange(tabList[prevIdx]);
          } else {
            const nextIdx = (currentIdx + 1) % tabList.length;
            handleTabChange(tabList[nextIdx]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const [vehicle, setVehicle] = useState<VehicleProfile>(() => {
    try {
      const saved = localStorage.getItem('autohub_vehicle_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          const loaded = { ...INITIAL_VEHICLE, ...parsed };
          if (!loaded.driver_photo_url || loaded.driver_photo_url === 'avatar_lion') {
            loaded.driver_photo_url = 'avatar_dog';
          }
          return loaded;
        }
      }
      return INITIAL_VEHICLE;
    } catch {
      return INITIAL_VEHICLE;
    }
  });

  const [dtcCodes, setDtcCodes] = useState<DtcCode[]>(() => {
    try {
      const saved = localStorage.getItem('autohub_dtc_codes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_DTC_CODES;
    } catch {
      return INITIAL_DTC_CODES;
    }
  });

  const [fines, setFines] = useState<FineItem[]>(() => {
    try {
      const saved = localStorage.getItem('autohub_fines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_FINES;
    } catch {
      return INITIAL_FINES;
    }
  });

  // Global 4G OBD Parking Session listener
  const [globalParkingSession, setGlobalParkingSession] = useState<ParkingSession | null>(() => parkingSessionService.getSession());

  useEffect(() => {
    const unsub = parkingSessionService.subscribe((sess) => {
      setGlobalParkingSession(sess);
    });
    return unsub;
  }, []);

  const getServicesForVehicle = useCallback((v: VehicleProfile): ServiceItem[] => {
    try {
      const storageKey = `autohub_services_${v.vin || v.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    const generated = generateServicesForVehicle(v);
    try {
      localStorage.setItem(`autohub_services_${v.vin || v.id}`, JSON.stringify(generated));
    } catch {}
    return generated;
  }, []);

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const initialVeh = (() => {
        const saved = localStorage.getItem('autohub_vehicle_profile');
        if (saved) return JSON.parse(saved);
        return INITIAL_VEHICLE;
      })();
      const storageKey = `autohub_services_${initialVeh.vin || initialVeh.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return generateServicesForVehicle(initialVeh);
    } catch {
      return generateServicesForVehicle(INITIAL_VEHICLE);
    }
  });

  // Automatically keep services aligned to active vehicle's VIN
  useEffect(() => {
    const vehServices = getServicesForVehicle(vehicle);
    setServices(vehServices);
  }, [vehicle.id, vehicle.vin, getServicesForVehicle]);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isObdConnected, setIsObdConnected] = useState<boolean>(false);
  const [isObdAdapterModalOpen, setIsObdAdapterModalOpen] = useState<boolean>(false);
  const [autoStartScanTrigger, setAutoStartScanTrigger] = useState<number>(0);
  const [obdAdapterType, setObdAdapterType] = useState<ObdAdapterType>(() => {
    try {
      const saved = localStorage.getItem('autohub_obd_adapter_type') as ObdAdapterType;
      if (saved && ['wifi', 'bluetooth', 'cloud_4g'].includes(saved)) return saved;
    } catch {}
    return 'cloud_4g';
  });
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  // Account Mode: 'owner' (ჩემი ექაუნთი - 2 მანქანა) | 'visitor' (სტუმრის რეჟიმი - 1 მანქანა, შევსებადი)
  const [accountMode, setAccountMode] = useState<'owner' | 'visitor'>(() => {
    try {
      const saved = localStorage.getItem('autohub_account_mode') as 'owner' | 'visitor';
      if (saved === 'owner' || saved === 'visitor') return saved;
    } catch {}
    return 'owner';
  });

  // All Saved Vehicles in Garage
  const [allVehicles, setAllVehicles] = useState<VehicleProfile[]>(() => {
    try {
      const mode = localStorage.getItem('autohub_account_mode') || 'owner';
      const storageKey = mode === 'visitor' ? 'autohub_visitor_vehicles' : 'autohub_owner_vehicles';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return mode === 'visitor' ? [VISITOR_INITIAL_VEHICLE] : OWNER_VEHICLES;
    } catch {
      return OWNER_VEHICLES;
    }
  });

  const handleToggleAccountMode = () => {
    sounds.playClick();
    const nextMode: 'owner' | 'visitor' = accountMode === 'owner' ? 'visitor' : 'owner';
    setAccountMode(nextMode);
    try {
      localStorage.setItem('autohub_account_mode', nextMode);
    } catch {}

    if (nextMode === 'visitor') {
      let visitorList: VehicleProfile[] = [];
      try {
        const saved = localStorage.getItem('autohub_visitor_vehicles');
        if (saved) visitorList = JSON.parse(saved);
      } catch {}
      if (!visitorList || visitorList.length === 0) {
        visitorList = [VISITOR_INITIAL_VEHICLE];
      }
      setAllVehicles(visitorList);
      setVehicle(visitorList[0]);
      try {
        localStorage.setItem('autohub_vehicle_profile', JSON.stringify(visitorList[0]));
      } catch {}
    } else {
      let ownerList: VehicleProfile[] = [];
      try {
        const saved = localStorage.getItem('autohub_owner_vehicles');
        if (saved) ownerList = JSON.parse(saved);
      } catch {}
      if (!ownerList || ownerList.length === 0) {
        ownerList = OWNER_VEHICLES;
      }
      setAllVehicles(ownerList);
      setVehicle(ownerList[0]);
      try {
        localStorage.setItem('autohub_vehicle_profile', JSON.stringify(ownerList[0]));
      } catch {}
    }
  };

  // Language State: 'ge' (default Georgian) | 'en'
  const [lang, setLang] = useState<'ge' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('autohub_lang') as 'ge' | 'en';
      if (saved === 'ge' || saved === 'en') return saved;
    } catch {}
    return 'ge';
  });

  const handleToggleLang = () => {
    sounds.playClick();
    const nextLang = lang === 'ge' ? 'en' : 'ge';
    setLang(nextLang);
    try {
      localStorage.setItem('autohub_lang', nextLang);
    } catch {}
  };

  const handleSelectLang = (selected: 'ge' | 'en') => {
    sounds.playClick();
    setLang(selected);
    try {
      localStorage.setItem('autohub_lang', selected);
    } catch {}
  };

  // Modal States
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [wizardInitialData, setWizardInitialData] = useState<Partial<VehicleProfile> | undefined>(undefined);
  const [fieldPrompt, setFieldPrompt] = useState<{
    isOpen: boolean;
    fieldType: PromptFieldType;
    value: any;
  }>({
    isOpen: false,
    fieldType: 'plate_number',
    value: ''
  });

  // Service Bookings State (Calendar Appointments & Digital Passes)
  const [bookings, setBookings] = useState<ServiceBookingItem[]>(() => {
    try {
      const saved = localStorage.getItem('autohub_service_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeBookingForAi, setActiveBookingForAi] = useState<ServiceBookingItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVinHistoryModalOpen, setIsVinHistoryModalOpen] = useState(false);
  const [bookingModalPrefill, setBookingModalPrefill] = useState<{
    serviceType?: ServiceBookingItem['service_type'];
    title?: string;
  }>({});
  const [tourTrigger, setTourTrigger] = useState<number>(0);
  const [isSiteTourActive, setIsSiteTourActive] = useState<boolean>(false);

  const handleOpenTour = () => {
    sounds.playSuccess();
    setTourTrigger(prev => prev + 1);
  };

  const handleSaveNewVehicle = (newV: VehicleProfile) => {
    const updatedList = [newV, ...allVehicles.filter(v => v.id !== newV.id)];
    setAllVehicles(updatedList);
    setVehicle(newV);

    const freshServices = generateServicesForVehicle(newV);
    setServices(freshServices);
    try {
      localStorage.setItem(`autohub_services_${newV.vin || newV.id}`, JSON.stringify(freshServices));
      localStorage.setItem('autohub_services', JSON.stringify(freshServices));
      localStorage.setItem('autohub_garage_vehicles', JSON.stringify(updatedList));
      localStorage.setItem('autohub_vehicle_profile', JSON.stringify(newV));
    } catch {}

    // Sync this customer's vehicle + info into the shared Google Sheet (keyed by plate)
    n8nService.syncVehicle({
      vehicle_id: newV.id,
      owner_name: newV.driver_name || '',
      phone: (newV as any).driver_phone || '',
      plate: newV.plate_number || '',
      vin: newV.vin || '',
      brand: newV.brand || '',
      model: newV.model || '',
      year: newV.year || '',
      engine: newV.engine || '',
      fuel: newV.fuel_type || '',
      mileage_km: newV.mileage_km || '',
      active_dtc: dtcCodes,
      source: 'website'
    });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (allVehicles.length <= 1) {
      alert('გარაჟში მინიმუმ 1 ავტომობილი უნდა დარჩეს.');
      return;
    }
    const updatedList = allVehicles.filter(v => v.id !== vehicleId);
    setAllVehicles(updatedList);
    try {
      localStorage.setItem('autohub_garage_vehicles', JSON.stringify(updatedList));
    } catch {}

    if (vehicle.id === vehicleId) {
      const nextVehicle = updatedList[0];
      setVehicle(nextVehicle);
      try {
        localStorage.setItem('autohub_vehicle_profile', JSON.stringify(nextVehicle));
      } catch {}
    }
    sounds.playClearChime();
  };

  const handleOpenFieldPrompt = (field: PromptFieldType) => {
    sounds.playClick();
    setFieldPrompt({
      isOpen: true,
      fieldType: field,
      value: (vehicle as any)[field] || ''
    });
  };

  const handleSaveField = (field: PromptFieldType, value: any) => {
    const updatedVehicle = { ...vehicle, [field]: value };
    setVehicle(updatedVehicle);
    const updatedList = allVehicles.map(v => v.id === vehicle.id ? updatedVehicle : v);
    setAllVehicles(updatedList);
    try {
      localStorage.setItem('autohub_vehicle_profile', JSON.stringify(updatedVehicle));
      localStorage.setItem('autohub_garage_vehicles', JSON.stringify(updatedList));
    } catch {}

    if (field === 'mileage_km' && typeof value === 'number' && value > 0) {
      const updatedServices = services.map(s => {
        const lastKm = s.last_service_km || 0;
        const diff = Math.max(0, value - lastKm);
        const remainingKm = Math.max(0, s.interval_km - diff);
        const health = Math.max(0, Math.min(100, Math.round((remainingKm / s.interval_km) * 100)));
        return {
          ...s,
          current_km: value,
          remaining_km: remainingKm,
          health_percentage: health
        };
      });
      setServices(updatedServices);
      try {
        localStorage.setItem(`autohub_services_${vehicle.vin || vehicle.id}`, JSON.stringify(updatedServices));
        localStorage.setItem('autohub_services', JSON.stringify(updatedServices));
      } catch {}
    }
  };

  // Live Telemetry Simulation
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    rpm: 780,
    speed: 0,
    coolant_temp: 92,
    battery_voltage: 14.2,
    fuel_trim_st: 3.2,
    fuel_trim_lt: 8.5,
    throttle_position: 12.4,
    intake_air_temp: 24,
    oil_pressure_psi: 38
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const rpmNoise = (Math.random() - 0.5) * 45;
        const baseRpm = prev.speed > 0 ? 1800 + prev.speed * 25 : 780;
        return {
          ...prev,
          rpm: Math.max(680, Math.min(baseRpm + rpmNoise, 6800)),
          battery_voltage: +(14.1 + Math.random() * 0.2).toFixed(1),
          coolant_temp: Math.round(Math.min(Math.max(prev.coolant_temp + (Math.random() - 0.5) * 0.4, 88), 96)),
          fuel_trim_st: +(prev.fuel_trim_st + (Math.random() - 0.5) * 0.8).toFixed(1)
        };
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('autohub_dtc_codes', JSON.stringify(dtcCodes));
  }, [dtcCodes]);

  useEffect(() => {
    localStorage.setItem('autohub_fines', JSON.stringify(fines));
  }, [fines]);

  useEffect(() => {
    localStorage.setItem('autohub_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('autohub_service_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Automatic Fines Synchronization: whenever vehicle details (plate, tech passport) or personal driver details change anywhere, sync fines automatically!
  useEffect(() => {
    if (vehicle.plate_number && vehicle.tech_passport) {
      n8nService.checkFines(vehicle.plate_number, vehicle.tech_passport)
        .then(res => {
          if (res && Array.isArray(res.fines)) {
            setFines(res.fines);
            if (res.fines.length === 0) {
              setVehicle(v => ({ ...v, driver_license_points: 100 }));
            } else {
              const totalDeducted = res.fines
                .filter(f => f.status === 'pending' && f.points_status === 'deducted')
                .reduce((acc, f) => acc + (f.points_deducted || 0), 0);
              setVehicle(v => ({ ...v, driver_license_points: Math.max(0, 100 - totalDeducted) }));
            }
          }
        })
        .catch(() => {});
    }
  }, [vehicle.plate_number, vehicle.tech_passport, vehicle.driver_personal_number]);

  const handleOpenBookingModal = (serviceType?: ServiceBookingItem['service_type'], title?: string) => {
    sounds.playClick();
    setBookingModalPrefill({ serviceType, title });
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = (newBooking: ServiceBookingItem) => {
    const updated = [newBooking, ...bookings.filter(b => b.id !== newBooking.id)];
    setBookings(updated);
    try {
      localStorage.setItem('autohub_service_bookings', JSON.stringify(updated));
    } catch {}

    setActiveBookingForAi(newBooking);
    // Switch to AI tab immediately so the AI bot clarifies the booking with all accumulated data!
    handleTabChange('ai');
  };

  const handleUpdateBooking = (updatedBooking: ServiceBookingItem) => {
    const updated = bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    setBookings(updated);
    try {
      localStorage.setItem('autohub_service_bookings', JSON.stringify(updated));
    } catch {}
    if (activeBookingForAi?.id === updatedBooking.id) {
      setActiveBookingForAi(updatedBooking);
    }
  };

  const handleAskAiAboutCode = (code: DtcCode) => {
    setAiInitialPrompt(
      `გამარჯობა, მაქვს შეცდომის კოდი ${code.code} (${code.title_ge}). გთხოვთ ამიხსნათ დეტალურად: რა ნაწილის გაუმართაობაა, რა ჯდება თბილისში შეცვლა და შეიძლება თუ არა მოძრაობის გაგრძელება?`
    );
    setActiveTab('ai');
  };

  const handleConsultAiAboutAllCodes = (codes: DtcCode[]) => {
    if (codes.length === 0) {
      setAiInitialPrompt(
        'გამარჯობა AI მექანიკოსო, ავტომობილის დიაგნოსტიკა სუფთაა. მინდა პროფილაქტიკური რჩევები ჩემი მანქანისთვის.'
      );
    } else {
      const codeList = codes.map(c => `${c.code}: ${c.title_ge}`).join('\n• ');
      setAiInitialPrompt(
        `გამარჯობა AI მექანიკოსო, ჩავატარე OBD-II დიაგნოსტიკა და აღმოჩნდა შემდეგი ხარვეზები:\n• ${codeList}\n\nგთხოვთ ამიხსნათ:\n1. რატომ აანთო ეს შეცდომები ერთად და რა არის მთავარი მიზეზი?\n2. რამდენად საშიშია ავტომობილით მოძრაობის გაგრძელება?\n3. რა ნაწილებია შესაცვლელი და რა ჯდება შეკეთება თბილისში?`
      );
    }
    handleTabChange('ai');
  };

  const handleClearSuccess = () => {
    setDtcCodes([]);
  };

  return (
    <div className="min-h-screen bg-[#ECEAE5] text-navy antialiased">
      {/* 1 & 2. Unified Sticky Header & Navigation Bar (Always visible on screen, never hidden) */}
      <div id="sticky-header" className="sticky top-0 z-40 w-full bg-[#ECEAE5]/95 backdrop-blur-xl border-b border-white/80 transition-colors shadow-xs">
        <Header
          vehicle={vehicle}
          allVehicles={allVehicles}
          onChangeVehicle={(newVehicle) => {
            setVehicle(newVehicle);
            localStorage.setItem('autohub_vehicle_profile', JSON.stringify(newVehicle));
          }}
          onDeleteVehicle={handleDeleteVehicle}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={() => setIsSoundEnabled(sounds.toggleSound())}
          onNavigateHome={() => handleTabChange('home')}
          onOpenAddVehicle={() => setIsAddVehicleModalOpen(true)}
          onOpenBookingModal={() => handleOpenBookingModal()}
          dtcCount={dtcCodes.length}
          finesCount={fines.filter(f => f.status === 'pending').length}
          onSelectTab={handleTabChange}
          lang={lang}
          onToggleLang={handleToggleLang}
          onSelectLang={handleSelectLang}
          isObdConnected={isObdConnected}
          onOpenObdModal={() => setIsObdAdapterModalOpen(true)}
          accountMode={accountMode}
          onToggleAccountMode={handleToggleAccountMode}
          onOpenTour={handleOpenTour}
        />

        <Navigation
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          dtcCount={dtcCodes.length}
          finesCount={fines.filter(f => f.status === 'pending').length}
          lang={lang}
        />
      </div>

      {/* Cover Advertising Banner (Wider panoramic layout for grand automotive photography) */}
      <div id="cover-banner-section" data-tour="cover-banner" className="hidden md:block w-full max-w-[1720px] 2xl:max-w-[1860px] mx-auto px-2.5 sm:px-5 lg:px-7 pt-3 sm:pt-4">
        <CoverAdBanner
          onNavigateTab={handleTabChange}
          onOpenBookingModal={() => handleOpenBookingModal()}
          onOpenObdModal={() => setIsObdAdapterModalOpen(true)}
          onOpenVinHistory={() => setIsVinHistoryModalOpen(true)}
          onScrollPastBanner={() => scrollToMainContent(950)}
          isTourActive={isSiteTourActive}
        />
      </div>

      {/* 3. Main Content Container (Unified wide layout matching CoverAdBanner) */}
      <main id="main-content" className="w-full max-w-[1720px] 2xl:max-w-[1860px] mx-auto px-2.5 sm:px-5 lg:px-7 py-3 sm:py-5 pb-28 sm:pb-24">
        {/* Home Hub View (Department Buttons on Screen) */}
        {activeTab === 'home' && (
          <HomeHub
            vehicle={vehicle}
            dtcCodes={dtcCodes}
            fines={fines}
            services={services}
            bookings={bookings}
            onSelectDepartment={(tab) => handleTabChange(tab)}
            onOpenBookingModal={() => handleOpenBookingModal()}
            onOpenFieldPrompt={handleOpenFieldPrompt}
            onNavigateToAiClarification={(prompt) => {
              if (prompt) setAiInitialPrompt(prompt);
              handleTabChange('ai');
            }}
            isTourActive={isSiteTourActive}
          />
        )}

        {/* Sub-department Views */}
        {activeTab === 'obd' && (
          <React.Suspense fallback={<div className="min-h-[430px] rounded-3xl bg-white/60 grid place-items-center text-slate-500" role="status">დიაგნოსტიკა იტვირთება…</div>}>
          <ObdModule
            vehicle={vehicle}
            telemetry={telemetry}
            dtcCodes={dtcCodes}
            onUpdateDtcCodes={setDtcCodes}
            onOpenClearModal={() => setIsClearModalOpen(true)}
            onAskAiAboutCode={handleAskAiAboutCode}
            onConsultAiMechanic={handleConsultAiAboutAllCodes}
            onUpdateVehicle={(updated) => setVehicle(v => ({ ...v, ...updated }))}
            onOpenAddVehicleWithData={(data) => {
              setWizardInitialData(data);
              setIsAddVehicleModalOpen(true);
            }}
            onAutoRegisterVehicle={handleSaveNewVehicle}
            isConnected={isObdConnected}
            onConnectionChange={setIsObdConnected}
            adapterType={obdAdapterType}
            onOpenAdapterModal={() => setIsObdAdapterModalOpen(true)}
            autoStartScanTrigger={autoStartScanTrigger}
            onOpenFieldPrompt={handleOpenFieldPrompt}
          />
          </React.Suspense>
        )}

        {activeTab === 'fines' && (
          <FinesModule
            vehicle={vehicle}
            fines={fines}
            onUpdateFines={setFines}
            onUpdateVehicle={(updated) => setVehicle(v => ({ ...v, ...updated }))}
            onNavigateToParking={() => handleTabChange('parking')}
            onOpenFieldPrompt={handleOpenFieldPrompt}
            onNavigateToAiClarification={(prompt) => {
              if (prompt) setAiInitialPrompt(prompt);
              handleTabChange('ai');
            }}
          />
        )}

        {activeTab === 'parking' && (
          <ParkingModule
            vehicle={vehicle}
            allVehicles={allVehicles}
            onSelectVehicle={(v) => {
              setVehicle(v);
              try {
                localStorage.setItem('autohub_vehicle_profile', JSON.stringify(v));
              } catch {}
            }}
            onUpdateVehicle={(updated) => setVehicle(v => ({ ...v, ...updated }))}
            onOpenFieldPrompt={handleOpenFieldPrompt}
            onOpenAddVehicle={() => setIsAddVehicleModalOpen(true)}
          />
        )}

        {activeTab === 'ai' && (
          <AiMechanicChat
            vehicle={vehicle}
            dtcCodes={dtcCodes}
            initialPrompt={aiInitialPrompt}
            onClearInitialPrompt={() => setAiInitialPrompt(undefined)}
            activeBooking={activeBookingForAi}
            onUpdateBooking={handleUpdateBooking}
            allBookings={bookings}
            onOpenBookingModal={() => handleOpenBookingModal()}
            services={services}
            fines={fines}
          />
        )}

        {activeTab === 'service' && (
          <ServiceLogModule
            vehicle={vehicle}
            services={services}
            bookings={bookings}
            onOpenBookingModal={handleOpenBookingModal}
            onAddBooking={(newBooking) => {
              const updated = [newBooking, ...bookings.filter(b => b.id !== newBooking.id)];
              setBookings(updated);
              try {
                localStorage.setItem('autohub_service_bookings', JSON.stringify(updated));
              } catch {}
            }}
            onNavigateToAiClarification={(booking) => {
              setActiveBookingForAi(booking);
              handleTabChange('ai');
            }}
            onAddService={(newItem) => {
              const updated = [newItem, ...services];
              setServices(updated);
              try {
                localStorage.setItem(`autohub_services_${vehicle.vin || vehicle.id}`, JSON.stringify(updated));
                localStorage.setItem('autohub_services', JSON.stringify(updated));
              } catch {}
            }}
            onUpdateService={(updatedItem) => {
              const updated = services.map(s => s.id === updatedItem.id ? updatedItem : s);
              setServices(updated);
              try {
                localStorage.setItem(`autohub_services_${vehicle.vin || vehicle.id}`, JSON.stringify(updated));
                localStorage.setItem('autohub_services', JSON.stringify(updated));
              } catch {}
            }}
            onDeleteService={(id) => {
              const updated = services.filter(s => s.id !== id);
              setServices(updated);
              try {
                localStorage.setItem(`autohub_services_${vehicle.vin || vehicle.id}`, JSON.stringify(updated));
                localStorage.setItem('autohub_services', JSON.stringify(updated));
              } catch {}
            }}
            onOpenFieldPrompt={handleOpenFieldPrompt}
            onOpenVinHistory={() => setIsVinHistoryModalOpen(true)}
            onResetToVinSpecs={() => {
              const fresh = generateServicesForVehicle(vehicle);
              setServices(fresh);
              try {
                localStorage.setItem(`autohub_services_${vehicle.vin || vehicle.id}`, JSON.stringify(fresh));
                localStorage.setItem('autohub_services', JSON.stringify(fresh));
              } catch {}
            }}
            onAskAiAboutService={(item) => {
              setAiInitialPrompt(`გამარჯობა AI მექანიკოსო, გთხოვთ დამიზუსტოთ სერვისის '${item.title_ge}' დეტალები: როდის და რა ინტერვალით უნდა შეიცვალოს, რა ბრენდის ნაწილებია OEM რეკომენდებული ჩემს ${vehicle.brand} ${vehicle.model}-ზე და რა ჯდება?`);
              handleTabChange('ai');
            }}
          />
        )}

        {activeTab === 'map' && (
          <div className="animate-fade-in">
            <LiveTrafficMap vehicle={vehicle} />
          </div>
        )}

        {(activeTab === 'garage' || activeTab === 'settings') && (
          <GarageModule
            vehicle={vehicle}
            onNavigateTab={setActiveTab}
            onUpdateVehicle={setVehicle}
            onOpenAddModal={() => setIsAddVehicleModalOpen(true)}
            onDeleteVehicle={handleDeleteVehicle}
            onOpenFieldPrompt={handleOpenFieldPrompt}
            allVehicles={allVehicles}
            onSelectVehicle={(v) => {
              setVehicle(v);
              localStorage.setItem('autohub_vehicle_profile', JSON.stringify(v));
            }}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={() => setIsSoundEnabled(sounds.toggleSound())}
            onOpenVinHistory={() => setIsVinHistoryModalOpen(true)}
            onResetToVinSpecs={() => {
              const fresh = generateServicesForVehicle(vehicle);
              setServices(fresh);
              try {
                localStorage.setItem(`autohub_services_${vehicle.vin || vehicle.id}`, JSON.stringify(fresh));
                localStorage.setItem('autohub_services', JSON.stringify(fresh));
              } catch {}
            }}
            services={services}
            onAddBooking={(newBooking) => {
              const updated = [newBooking, ...bookings.filter(b => b.id !== newBooking.id)];
              setBookings(updated);
              try {
                localStorage.setItem('autohub_service_bookings', JSON.stringify(updated));
              } catch {}
            }}
            onNavigateToAiClarification={(prompt) => {
              if (prompt) setAiInitialPrompt(prompt);
              handleTabChange('ai');
            }}
          />
        )}
      </main>

      {/* Modals & Floating Banners */}
      <ObdAdapterConnectModal
        isOpen={isObdAdapterModalOpen}
        onClose={() => setIsObdAdapterModalOpen(false)}
        onConnectSuccess={(type, startTesting) => {
          setObdAdapterType(type);
          setIsObdConnected(true);
          if (startTesting) {
            setAutoStartScanTrigger(prev => prev + 1);
          }
        }}
        vehicleIp={vehicle.obd_ip}
        vehiclePort={vehicle.obd_port}
        initialType={obdAdapterType}
        vehicleBrand={vehicle.brand}
        vehicleModel={vehicle.model}
      />

      <ClearDtcModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onSuccessClear={handleClearSuccess}
        vehicleId={vehicle.id}
      />

      {/* Smart 4-Step Add Vehicle Wizard Modal */}
      <AddVehicleWizardModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => {
          setIsAddVehicleModalOpen(false);
          setWizardInitialData(undefined);
        }}
        onSaveVehicle={handleSaveNewVehicle}
        initialData={wizardInitialData || { brand: vehicle.brand || 'BMW' }}
      />

      {/* Contextual Just-In-Time Micro Field Prompt Modal */}
      <ContextualFieldPromptModal
        isOpen={fieldPrompt.isOpen}
        onClose={() => setFieldPrompt(p => ({ ...p, isOpen: false }))}
        fieldType={fieldPrompt.fieldType}
        currentValue={fieldPrompt.value}
        onSaveField={handleSaveField}
        onAskAiToClarify={(field) => {
          const fieldNames: Record<string, string> = {
            plate_number: 'სახელმწიფო ნომრის',
            mileage_km: 'მიმდინარე გარბენის',
            engine: 'ძრავის სპეციფიკაციის',
            vin: 'VIN შასის კოდის',
            fuel_type: 'საწვავის ტიპის',
            tech_passport: 'ტექ-პასპორტის',
            driver_name: 'მძღოლის სახელის',
            driver_phone: 'ტელეფონის',
            driver_personal_number: 'პირადი ნომრის'
          };
          setAiInitialPrompt(`გამარჯობა AI მექანიკოსო, მყავს ${vehicle.brand} ${vehicle.model} (${vehicle.year} წელი, ${vehicle.engine || 'ძრავა დაუზუსტებელი'}). გთხოვთ დამეხმაროთ ${fieldNames[field] || field}-ის დაზუსტებაში ქარხნული მონაცემების მიხედვით.`);
          handleTabChange('ai');
        }}
      />

      {/* Calendar & Auto-Doctor Service Booking Modal */}
      <ServiceBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        vehicle={vehicle}
        dtcCodes={dtcCodes}
        services={services}
        fines={fines}
        onSubmitBooking={handleSubmitBooking}
        preselectedServiceType={bookingModalPrefill.serviceType}
        preselectedTitle={bookingModalPrefill.title}
      />

      {/* Vehicle VIN History & Auction Verification Modal */}
      <VinHistoryModal
        isOpen={isVinHistoryModalOpen}
        onClose={() => setIsVinHistoryModalOpen(false)}
        vehicle={vehicle}
      />

      {/* Floating Bottom-Right AI Assistant Window */}
      <FloatingMechanicWidget
        vehicle={vehicle}
        dtcCodes={dtcCodes}
        onOpenFullChat={handleTabChange}
        onOpenBookingModal={() => handleOpenBookingModal()}
        lang={lang}
      />

      {/* Interactive Cloud Bot & Google-Style Guided Site Tour */}
      <InteractiveSiteTour
        currentTab={activeTab}
        onNavigateTab={handleTabChange}
        externalTrigger={tourTrigger}
        onTourActiveChange={setIsSiteTourActive}
      />

      {/* Global 4G OBD Parking Stop Confirmation Modal (when user is outside the Parking tab) */}
      {activeTab !== 'parking' && globalParkingSession && globalParkingSession.status === 'probable_stop' && (
        <ParkingConfirmationModal
          session={globalParkingSession}
          candidateLots={[globalParkingSession.lot]}
          isOpen={globalParkingSession.status === 'probable_stop'}
          onConfirm={(leadMin, customDuration) => {
            parkingSessionService.confirmParking(leadMin, customDuration);
            handleTabChange('parking');
          }}
          onDismiss={() => {
            parkingSessionService.dismissProbableStop();
          }}
          onSelectDifferentLot={(lot) => {
            parkingSessionService.updateSessionLot(lot);
          }}
        />
      )}

      {/* PWA Install Banner - შენახულია და გამორთულია (საჭიროებისას ჩაირთვება ტელეფონზე) */}
      {/* <PwaInstallBanner /> */}
    </div>
  );
};

export default App;
