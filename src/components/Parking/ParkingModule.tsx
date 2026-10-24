import React, { useState, useEffect } from 'react';
import { VehicleProfile, ParkingFineItem, ActiveParkingSession, ParkingPermitItem } from '../../types';
import { GeorgianLicensePlate } from '../ui/GeorgianLicensePlate';
import { sounds } from '../../services/soundEffects';
import {
  ParkingSquare,
  Timer,
  Play,
  Square,
  Sparkles,
  MapPin,
  Check,
  AlertTriangle,
  FileText,
  Building,
  Info,
  Clock,
  CreditCard,
  Car,
  BellRing,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  allVehicles?: VehicleProfile[];
  onSelectVehicle?: (v: VehicleProfile) => void;
  onUpdateVehicle?: (updated: Partial<VehicleProfile>) => void;
  onOpenFieldPrompt?: (field: 'plate_number') => void;
  onOpenAddVehicle?: () => void;
}

type SubTab = 'zone_parking' | 'parking_fines' | 'permits' | 'spots';
type CityType = 'tbilisi' | 'batumi' | 'kutaisi';

// ========================================================
// AUTHENTIC OFFICIAL MUNICIPAL EMBLEMS & COATS OF ARMS
// Tbilisi (თბილისის პარკინგი) • Batumi (ბათუმის ინსპექცია) • Kutaisi (ქუთაისის მერია)
// ========================================================

/**
 * თბილისის ოფიციალური გერბი / ემბლემა (Tbilisi Official Coat of Arms):
 * Circular Georgian shield, 7 seven-pointed stars arched across top rim,
 * stylized Asomtavruli „Ⴇ“ (Tani) glyph unifying the ascending Falcon & Pheasant in talons,
 * thermal sulfur water springs waves at base, bordered by oak laurel wreath.
 */
export const TbilisiContourLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer Circular Georgian Shield */}
    <circle cx="40" cy="40" r="37" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.06" />
    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5" opacity="0.6" />

    {/* 7 Seven-Pointed Stars Arched Across the Top Rim */}
    {/* Star 1 */}
    <polygon points="21,21 21.6,22.4 23,23 21.6,23.6 21,25 20.4,23.6 19,23 20.4,22.4" fill="currentColor" />
    {/* Star 2 */}
    <polygon points="26,16 26.6,17.4 28,18 26.6,18.6 26,20 25.4,18.6 24,18 25.4,17.4" fill="currentColor" />
    {/* Star 3 */}
    <polygon points="32.5,13 33.1,14.4 34.5,15 33.1,15.6 32.5,17 31.9,15.6 30.5,15 31.9,14.4" fill="currentColor" />
    {/* Star 4 (Apex / Center Top) */}
    <polygon points="40,9.5 40.8,11.3 42.6,12 40.8,12.7 40,14.5 39.2,12.7 37.4,12 39.2,11.3" fill="currentColor" />
    {/* Star 5 */}
    <polygon points="47.5,13 48.1,14.4 49.5,15 48.1,15.6 47.5,17 46.9,15.6 45.5,15 46.9,14.4" fill="currentColor" />
    {/* Star 6 */}
    <polygon points="54,16 54.6,17.4 56,18 54.6,18.6 54,20 53.4,18.6 52,18 53.4,17.4" fill="currentColor" />
    {/* Star 7 */}
    <polygon points="59,21 59.6,22.4 61,23 59.6,23.6 59,25 58.4,23.6 57,23 58.4,22.4" fill="currentColor" />

    {/* Central Asomtavruli „Ⴇ“ (Tani) Ring */}
    <ellipse cx="40" cy="38" rx="13.5" ry="12.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08" />
    {/* Core vertical stem of „Ⴇ“ */}
    <line x1="40" y1="26" x2="40" y2="50" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

    {/* Falcon Head (left-facing with curved beak and eye) */}
    <path d="M38 27 C36 24 32 24 30 27 C28 29 27 32 30 32" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M28 29 Q25.5 30.5 27.5 32.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="33" cy="28" r="0.9" fill="currentColor" />

    {/* Falcon Wings Sweeping Upwards (Outstretched) */}
    {/* Left wing */}
    <path d="M29 34 C21 29 16 22 13 26 C16 32 23 37 30 38" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.14" />
    <path d="M19 28 L24 35 M15 30 L20 37" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    {/* Right wing */}
    <path d="M51 34 C59 29 64 22 67 26 C64 32 57 37 50 38" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.14" />
    <path d="M61 28 L56 35 M65 30 L60 37" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />

    {/* Pheasant in Falcon Talons at base of „Ⴇ“ */}
    <path d="M35 44 C33 47 35 51 40 51 C45 51 47 47 45 44 C43 42 37 42 35 44 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.22" />
    <path d="M43 50 C46 53 49 55 52 56" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M37 44 L36 48 M43 44 L44 48" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />

    {/* Thermal Sulfur Spring Waves at Base (თბილი წყლები) */}
    <path d="M16 60 C24 57, 32 63, 40 60 C48 57, 56 63, 64 60" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M20 65 C27 62, 33 67, 40 65 C47 62, 53 67, 60 65" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    <path d="M25 70 C30 68, 35 72, 40 70 C45 68, 50 72, 55 70" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />

    {/* Laurel / Oak Border Sprigs along lower flanks */}
    <path d="M12 47 C10 54 13 61 17 66" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="11" cy="51" r="1.3" fill="currentColor" opacity="0.7" />
    <circle cx="13" cy="58" r="1.3" fill="currentColor" opacity="0.7" />
    <path d="M68 47 C70 54 67 61 63 66" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="69" cy="51" r="1.3" fill="currentColor" opacity="0.7" />
    <circle cx="67" cy="58" r="1.3" fill="currentColor" opacity="0.7" />
  </svg>
);

/**
 * ბათუმის ოფიციალური გერბი (Batumi Official Coat of Arms):
 * 3-towered mural fortress crown with central portal, two crossed naval golden anchors,
 * pointed heraldic shield with central inescutcheon containing 3 golden bezants (coins),
 * and rhythmic Black Sea waves.
 */
export const BatumiContourLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Crossed Naval Anchors in Background */}
    {/* Anchor 1: Top-Left to Bottom-Right */}
    <circle cx="14" cy="11" r="3" stroke="currentColor" strokeWidth="1.3" />
    <line x1="11" y1="14" x2="17" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="16" y1="13" x2="63" y2="67" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M57 69 Q67 68 68 59" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <polygon points="68,58 65,63 70,61" fill="currentColor" />

    {/* Anchor 2: Top-Right to Bottom-Left */}
    <circle cx="66" cy="11" r="3" stroke="currentColor" strokeWidth="1.3" />
    <line x1="63" y1="8" x2="69" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="64" y1="13" x2="17" y2="67" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M23 69 Q13 68 12 59" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <polygon points="12,58 10,61 15,63" fill="currentColor" />

    {/* 3-Towered Mural Fortress Crown (სამკოშკიანი ციხე-გვირგვინი) */}
    <path d="M26 15 H54 V19 H26 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.18" />
    {/* Center Tower */}
    <path d="M36 8 H44 V15 H36 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.25" />
    <path d="M36 8 V6 H38 V8 H40 V6 H42 V8 H44 V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M38 15 V12 Q40 10 42 12 V15" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.35" />
    {/* Left Tower */}
    <path d="M26 10 H32 V15 H26 Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.22" />
    <path d="M26 10 V8 H28 V10 H30 V8 H32 V10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    {/* Right Tower */}
    <path d="M48 10 H54 V15 H48 Z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.22" />
    <path d="M48 10 V8 H50 V10 H52 V8 H54 V10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />

    {/* Main Pointed Heraldic Shield */}
    <path d="M21 19 H59 V43 C59 58, 40 69, 40 71 C40 69, 21 58, 21 43 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
    <path d="M25 23 H55 V43 C55 55, 40 64, 40 66 C40 64, 25 55, 25 43 Z" stroke="currentColor" strokeWidth="1" opacity="0.6" />

    {/* Upper Chevron Band */}
    <path d="M23 29 L40 23 L57 29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

    {/* Central Inescutcheon (გულისფარი) */}
    <path d="M33 31 H47 V44 C47 51, 40 55, 40 56 C40 55, 33 51, 33 44 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
    {/* 3 Golden Bezants (Coins) */}
    <circle cx="37" cy="38" r="2.2" stroke="currentColor" strokeWidth="1" fill="currentColor" />
    <circle cx="43" cy="38" r="2.2" stroke="currentColor" strokeWidth="1" fill="currentColor" />
    <circle cx="40" cy="46" r="2.2" stroke="currentColor" strokeWidth="1" fill="currentColor" />

    {/* Black Sea Rhythmic Waves in Shield Base */}
    <path d="M26 58 C30 56, 35 60, 40 58 C45 56, 50 60, 54 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M30 63 C33 61.5, 37 64.5, 40 63 C43 61.5, 47 64.5, 50 63" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
  </svg>
);


// City Config with Logos and Regional Attributes
interface CityConfig {
  id: CityType;
  name_ge: string;
  name_en: string;
  region_ge: string;
  subtitle: string;
  contourLogo: React.FC<{ className?: string }>;
}

const CITIES: CityConfig[] = [
  {
    id: 'tbilisi',
    name_ge: 'თბილისი',
    name_en: 'Tbilisi',
    region_ge: 'თბილისის პარკინგი',
    subtitle: 'ზონალური A, B, C (1-3 ₾/სთ)',
    contourLogo: TbilisiContourLogo
  },
  {
    id: 'batumi',
    name_ge: 'ბათუმი',
    name_en: 'Batumi',
    region_ge: 'მუნიციპალური ინსპექცია',
    subtitle: 'ბულვარი & სანაპირო (1-1.5 ₾/სთ)',
    contourLogo: BatumiContourLogo
  },
  {
    id: 'kutaisi',
    name_ge: 'ქუთაისი',
    name_en: 'Kutaisi',
    region_ge: 'სატრანსპორტო სამსახური',
    subtitle: 'ცენტრალური ზონა (1 ₾/სთ)',
    contourLogo: BatumiContourLogo
  }
];

interface CityZoneConfig {
  id: string;
  name: string;
  rate: string;
  rateGel: number;
  areas: string;
  badge: string;
}

const CITY_ZONES: Record<CityType, CityZoneConfig[]> = {
  tbilisi: [
    {
      id: 'zone_a',
      name: 'ზონა A',
      rate: '1.00 ₾ / სთ',
      rateGel: 1.0,
      areas: 'ვაკე, ვერა, მთაწმინდა, საბურთალო, სოლოლაკი',
      badge: 'ცენტრი'
    },
    {
      id: 'zone_b',
      name: 'ზონა B',
      rate: '2.00 ₾ / სთ',
      rateGel: 2.0,
      areas: 'ჩუღურეთი, დიდუბე, ისანი, ავლაბარი',
      badge: 'საშუალო'
    },
    {
      id: 'zone_c',
      name: 'ზონა C',
      rate: '3.00 ₾ / სთ',
      rateGel: 3.0,
      areas: 'ავჭალა, გლდანი, სამგორი, ვარკეთილი',
      badge: 'გარეუბანი'
    }
  ],
  batumi: [
    {
      id: 'batumi_boulevard',
      name: 'ბულვარის ზონა',
      rate: '1.00 ₾ / სთ',
      rateGel: 1.0,
      areas: 'რუსთაველის გამზირი, ბულვარი, პორტი',
      badge: 'სანაპირო'
    },
    {
      id: 'batumi_center',
      name: 'ძველი ბათუმი',
      rate: '1.50 ₾ / სთ',
      rateGel: 1.5,
      areas: 'მ. აბაშიძის, ევროპის მოედანი, ზ. გამსახურდია',
      badge: 'ისტორიული'
    },
    {
      id: 'batumi_gorgiladze',
      name: 'გორგილაძის ზონა',
      rate: '1.00 ₾ / სთ',
      rateGel: 1.0,
      areas: 'გორგილაძის ქუჩა, ჭავჭავაძის გამზირი',
      badge: 'კომერციული'
    }
  ],
  kutaisi: [
    {
      id: 'kutaisi_center',
      name: 'ცენტრალური ზონა',
      rate: '1.00 ₾ / სთ',
      rateGel: 1.0,
      areas: 'დავით აღმაშენებლის მოედანი, ა. წერეთლის ქ.',
      badge: 'ქალაქის ცენტრი'
    },
    {
      id: 'kutaisi_historic',
      name: 'ბაგრატის & ხიდის ზონა',
      rate: '1.00 ₾ / სთ',
      rateGel: 1.0,
      areas: 'თეთრი ხიდის მიმდებარე, ბაგრატის ტერიტორია',
      badge: 'ისტორიული'
    }
  ]
};

const CITY_QUICK_LOCATIONS: Record<CityType, string[]> = {
  tbilisi: [
    'ი. ჭავჭავაძის #34 (ვაკე)',
    'ალ. ყაზბეგის #14 (საბურთალო)',
    'შ. რუსთაველის #2',
    'დ. აღმაშენებლის #72',
    'პეკინის #5'
  ],
  batumi: [
    'შ. რუსთაველის გამზ. #10 (ბულვარი)',
    'მ. აბაშიძის #24 (ძველი ბათუმი)',
    'ზ. გორგილაძის #88',
    'ევროპის მოედანი #3'
  ],
  kutaisi: [
    'დავით აღმაშენებლის მოედანი #1',
    'ა. წერეთლის #5',
    'თეთრი ხიდის მიმდებარე ტერიტორია',
    'შ. რუსთაველის #12'
  ]
};

// Pre-seeded Initial Parking Fines in Georgia
const INITIAL_PARKING_FINES: ParkingFineItem[] = [
  {
    id: 'pk_tf_102',
    city: 'tbilisi',
    fine_type: 'zone_overtime',
    title_ge: 'ზონალური პარკირების საფასურის გადაუხდელობა (15 წთ გადაცილება)',
    amount_gel: 10,
    penalty_date: '2026-10-18',
    due_days_left: 22,
    status: 'pending',
    location: 'თბილისი, ი. ჭავჭავაძის გამზ. #34 (ზონა A)',
    ticket_number: 'TB-PK-98124'
  },
  {
    id: 'pk_tf_103',
    city: 'tbilisi',
    fine_type: 'sidewalk',
    title_ge: 'არასწორი პარკირება (ქვეითთა გადასასვლელთან 5 მეტრის დაუცველობა)',
    amount_gel: 50,
    penalty_date: '2026-10-12',
    due_days_left: 14,
    status: 'pending',
    location: 'თბილისი, ალ. ყაზბეგის გამზ. #14',
    ticket_number: 'TB-PK-95411'
  },
  {
    id: 'pk_batumi_101',
    city: 'batumi',
    fine_type: 'illegal_parking',
    title_ge: 'ბათუმის მუნიციპალური პარკირების წესის დარღვევა (ბულვარი)',
    amount_gel: 10,
    penalty_date: '2026-09-28',
    due_days_left: 0,
    status: 'paid',
    location: 'ბათუმი, რუსთაველის ქუჩა #12',
    ticket_number: 'BAT-PK-4421'
  },
  {
    id: 'pk_kutaisi_101',
    city: 'kutaisi',
    fine_type: 'illegal_parking',
    title_ge: 'დავით აღმაშენებლის მოედანზე არასწორი პარკირება',
    amount_gel: 10,
    penalty_date: '2026-10-09',
    due_days_left: 11,
    status: 'pending',
    location: 'ქუთაისი, დავით აღმაშენებლის მოედანი #1',
    ticket_number: 'KT-PK-3312'
  }
];

// Pre-seeded Parking Permits in Georgia (Tbilisi, Batumi & Kutaisi)
const INITIAL_PERMITS: ParkingPermitItem[] = [
  {
    id: 'pm_tb_annual',
    title_ge: 'თბილისის მუნიციპალური წლიური აბონემენტი',
    city: 'tbilisi',
    permitType: 'annual_standard',
    cost_gel: 50,
    expiryDate: '2027-04-15',
    isActive: true,
    plateNumber: 'FR-282-EE'
  },
  {
    id: 'pm_tb_resident',
    title_ge: 'ადგილობრივი მაცხოვრებლის უფასო საშვი (ჭავჭავაძის #34, 100მ რადიუსი)',
    city: 'tbilisi',
    permitType: 'resident_free',
    cost_gel: 0,
    expiryDate: '2027-10-21',
    isActive: true,
    plateNumber: 'FR-282-EE'
  },
  {
    id: 'pm_batumi_annual',
    title_ge: 'ბათუმის ავტოტრანსპორტის წლიური პარკირება',
    city: 'batumi',
    permitType: 'batumi_annual',
    cost_gel: 40,
    expiryDate: '2026-12-31',
    isActive: false,
    plateNumber: 'FR-282-EE'
  },
  {
    id: 'pm_kutaisi_annual',
    title_ge: 'ქუთაისის მუნიციპალური პარკირების წლიური საშვი',
    city: 'kutaisi',
    permitType: 'zone_pass',
    cost_gel: 30,
    expiryDate: '2027-01-10',
    isActive: false,
    plateNumber: 'FR-282-EE'
  }
];

// Commercial / Airport Garage Parking Spots & Rates in Georgia
const COMMERCIAL_PARKING_SPOTS = [
  {
    id: 'spot_orbeliani',
    name_ge: 'ორბელიანის მიწისქვეშა მუნიციპალური პარკინგი',
    operator_ge: 'თბილისის მერია (ტრანსპორტის სააგენტო)',
    address: 'ორბელიანის მოედანი, თბილისი',
    hourlyRateGel: 1.0,
    freeMinutes: 15,
    availableSpaces: 214,
    totalSpaces: 350,
    isOpen24h: true,
    evCharging: true
  },
  {
    id: 'spot_galleria',
    name_ge: 'Galleria Tbilisi მიწისქვეშა პარკინგი',
    operator_ge: 'Galleria Mall (City Center)',
    address: 'შოთა რუსთაველის გამზ. #2/4',
    hourlyRateGel: 3.0,
    freeMinutes: 0,
    availableSpaces: 142,
    totalSpaces: 300,
    isOpen24h: true,
    evCharging: true
  },
  {
    id: 'spot_airport',
    name_ge: 'თბილისის საერთაშორისო აეროპორტის პარკინგი',
    operator_ge: 'TAV Georgia (Airport Parking)',
    address: 'თბილისის საერთაშორისო აეროპორტი',
    hourlyRateGel: 3.5,
    freeMinutes: 10,
    availableSpaces: 380,
    totalSpaces: 1000,
    isOpen24h: true,
    evCharging: false
  },
  {
    id: 'spot_citymall',
    name_ge: 'City Mall საბურთალოს პარკინგი',
    operator_ge: 'City Mall Saburtalo',
    address: 'ვაჟა-ფშაველას გამზ. #70',
    hourlyRateGel: 2.0,
    freeMinutes: 30,
    availableSpaces: 95,
    totalSpaces: 650,
    isOpen24h: false,
    evCharging: true
  },
  {
    id: 'spot_tb_mall',
    name_ge: 'Tbilisi Mall პარკინგი',
    operator_ge: 'Tbilisi Mall Dighomi',
    address: 'დ. აღმაშენებლის ხეივანი მე-16 კმ',
    hourlyRateGel: 0.0,
    freeMinutes: 999,
    availableSpaces: 1250,
    totalSpaces: 2500,
    isOpen24h: false,
    evCharging: true
  }
];

export const ParkingModule: React.FC<Props> = ({
  vehicle,
  allVehicles,
  onSelectVehicle,
  onUpdateVehicle,
  onOpenFieldPrompt,
  onOpenAddVehicle
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('zone_parking');
  const [simulatedPaymentId, setSimulatedPaymentId] = useState<string | null>(null);

  // Municipal Parking Fines State
  const [parkingFines, setParkingFines] = useState<ParkingFineItem[]>(() => {
    try {
      const saved = localStorage.getItem('autohub_parking_fines_v2');
      if (saved) return JSON.parse(saved);
      return INITIAL_PARKING_FINES;
    } catch {
      return INITIAL_PARKING_FINES;
    }
  });

  // Selected City & Zone State
  const [selectedCity, setSelectedCity] = useState<CityType>('tbilisi');
  const [selectedZone, setSelectedZone] = useState<string>('zone_a');
  const [parkingLocationInput, setParkingLocationInput] = useState(CITY_QUICK_LOCATIONS.tbilisi[0]);

  // Live Zone Parking Session State
  const [activeSession, setActiveSession] = useState<ActiveParkingSession>(() => {
    try {
      const saved = localStorage.getItem('autohub_active_parking_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isActive) {
          return parsed;
        }
      }
    } catch {}
    return {
      isActive: false,
      city: 'tbilisi',
      zone: 'zone_a',
      zoneName_ge: 'ზონა A (1.00 ₾/სთ)',
      hourlyRateGel: 1.0,
      startTime: 0,
      elapsedSeconds: 0,
      accumulatedCostGel: 0,
      isFree15MinActive: true,
      freeMinRemaining: 15,
      plateNumber: vehicle.plate_number || 'FR-282-EE'
    };
  });

  // Parking Permits State
  const [permits, setPermits] = useState<ParkingPermitItem[]>(() => {
    try {
      const saved = localStorage.getItem('autohub_parking_permits_v2');
      return saved ? JSON.parse(saved) : INITIAL_PERMITS;
    } catch {
      return INITIAL_PERMITS;
    }
  });

  // Ticket Search State
  const [searchTicketNumber, setSearchTicketNumber] = useState('');
  const [ticketSearchSuccess, setTicketSearchSuccess] = useState<string | null>(null);

  // Fallback vehicles list for the Parking Profile
  const vehiclesList = allVehicles && allVehicles.length > 0 ? allVehicles : [vehicle];

  // Keep live parking stopwatch running
  useEffect(() => {
    let timer: any;
    if (activeSession.isActive && activeSession.startTime > 0) {
      timer = setInterval(() => {
        const now = Date.now();
        const elapsedSec = Math.max(0, Math.floor((now - activeSession.startTime) / 1000));
        const elapsedMin = Math.floor(elapsedSec / 60);

        // Free 15 min rule calculation
        const freeRem = Math.max(0, 15 - elapsedMin);
        const billableHours = elapsedMin > 15 ? Math.ceil((elapsedMin - 15) / 60) : 0;
        const currentCost = billableHours * activeSession.hourlyRateGel;

        setActiveSession(prev => {
          const updated = {
            ...prev,
            elapsedSeconds: elapsedSec,
            accumulatedCostGel: currentCost,
            isFree15MinActive: freeRem > 0,
            freeMinRemaining: freeRem
          };
          try {
            localStorage.setItem('autohub_active_parking_session', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession.isActive, activeSession.startTime, activeSession.hourlyRateGel]);

  // Persist parking fines and permits
  useEffect(() => {
    try {
      localStorage.setItem('autohub_parking_fines_v2', JSON.stringify(parkingFines));
    } catch {}
  }, [parkingFines]);

  useEffect(() => {
    try {
      localStorage.setItem('autohub_parking_permits_v2', JSON.stringify(permits));
    } catch {}
  }, [permits]);

  // Switch Active Parking Vehicle Handler
  const handleSwitchVehicle = (v: VehicleProfile) => {
    sounds.playClick();
    if (onSelectVehicle) {
      onSelectVehicle(v);
    }
    // Update plate in active session if stopped
    if (!activeSession.isActive) {
      setActiveSession(prev => ({
        ...prev,
        plateNumber: v.plate_number || 'GE-777-AA'
      }));
    }
  };

  // Handlers for Municipal Parking Fines
  const handlePayParkingFine = (fineId: string) => {
    sounds.playSuccess();
    setSimulatedPaymentId(fineId);
    setTimeout(() => {
      setParkingFines(parkingFines.map(pf => pf.id === fineId ? { ...pf, status: 'paid' } : pf));
      setSimulatedPaymentId(null);
    }, 1200);
  };

  const handleSearchParkingFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketNumber.trim()) return;
    sounds.playScanSweep();

    const found = parkingFines.find(pf => pf.ticket_number.toLowerCase().includes(searchTicketNumber.trim().toLowerCase()));
    if (found) {
      setTicketSearchSuccess(`ქვითარი #${found.ticket_number} ნაპოვნია: ${found.title_ge} (${found.amount_gel} ₾).`);
      sounds.playSuccess();
    } else {
      const newFine: ParkingFineItem = {
        id: `pk_${Date.now()}`,
        city: selectedCity,
        fine_type: 'zone_overtime',
        title_ge: `${CITIES.find(c => c.id === selectedCity)?.name_ge || 'თბილისის'} სატრანსპორტო სააგენტო — ზონალური გადაუხდელობა`,
        amount_gel: 10,
        penalty_date: new Date().toISOString().split('T')[0],
        due_days_left: 30,
        status: 'pending',
        location: `${CITIES.find(c => c.id === selectedCity)?.name_ge || 'თბილისი'}, მუნიციპალური ზონა`,
        ticket_number: searchTicketNumber.toUpperCase()
      };
      setParkingFines([newFine, ...parkingFines]);
      setTicketSearchSuccess(`ქვითარი #${newFine.ticket_number} წარმატებით ამოიკითხა მუნიციპალური ბაზიდან.`);
      sounds.playSuccess();
    }
    setTimeout(() => setTicketSearchSuccess(null), 4000);
  };

  // Handlers for Live Zone Parking
  const handleStartParking = () => {
    sounds.playScanSweep();
    const cityZones = CITY_ZONES[selectedCity] || CITY_ZONES.tbilisi;
    const currentZoneConfig = cityZones.find(z => z.id === selectedZone) || cityZones[0];

    const newSession: ActiveParkingSession = {
      isActive: true,
      city: selectedCity,
      zone: selectedZone as any,
      zoneName_ge: `${currentZoneConfig.name} (${currentZoneConfig.rate})`,
      hourlyRateGel: currentZoneConfig.rateGel,
      startTime: Date.now(),
      elapsedSeconds: 0,
      accumulatedCostGel: 0,
      isFree15MinActive: true,
      freeMinRemaining: 15,
      plateNumber: vehicle.plate_number || 'FR-282-EE'
    };

    setActiveSession(newSession);
    try {
      localStorage.setItem('autohub_active_parking_session', JSON.stringify(newSession));
    } catch {}
  };

  const handleStopParking = () => {
    sounds.playSuccess();
    const finalCost = activeSession.accumulatedCostGel;
    const finalElapsedMin = Math.ceil(activeSession.elapsedSeconds / 60);

    alert(`პარკირების სესია დასრულებულია!\nავტომობილი: ${vehicle.plate_number || activeSession.plateNumber}\nქალაქი: ${selectedCity.toUpperCase()}\nხანგრძლივობა: ${finalElapsedMin} წთ.\nგადასახდელი თანხა: ${finalCost.toFixed(2)} ₾.\nსაფასური წარმატებით გადახდილია!`);

    const resetSession: ActiveParkingSession = {
      ...activeSession,
      isActive: false,
      startTime: 0,
      elapsedSeconds: 0,
      accumulatedCostGel: 0
    };
    setActiveSession(resetSession);
    try {
      localStorage.removeItem('autohub_active_parking_session');
    } catch {}
  };

  // Handler for Permits
  const handleTogglePermit = (permitId: string) => {
    sounds.playClick();
    setPermits(permits.map(p => {
      if (p.id === permitId) {
        const nextState = !p.isActive;
        if (nextState) sounds.playSuccess();
        return { ...p, isActive: nextState };
      }
      return p;
    }));
  };

  // Filter fines and permits for the active vehicle
  const pendingParkingFines = parkingFines.filter(f => f.status === 'pending');
  const totalPendingParking = pendingParkingFines.reduce((acc, f) => acc + f.amount_gel, 0);

  const activeVehiclePermit = permits.find(p => p.isActive && (p.plateNumber === vehicle.plate_number || p.plateNumber === 'FR-282-EE'));

  // Format stopwatch MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ======================================================== */}
      {/* 1. DEDICATED PARKING PROFILE & ADDED VEHICLES CAROUSEL    */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-7 rounded-3xl neu-card shadow-neu-card border border-white space-y-5">
        
        {/* Top: Profile Header & Active Car Info */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-navy via-slate-800 to-navy text-gold flex items-center justify-center shadow-md relative shrink-0">
              <ParkingSquare className="w-7 h-7 text-gold" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-navy">
                  საპარკინგე პროფილი & მუნიციპალური ანგარიში
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/15 text-navy border border-gold/30">
                  საქართველო
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-navy border border-blue-200 shadow-2xs">
                  <img src="/tbilisi-parking-transparent.png" alt="თბილისის პარკინგი" className="h-3.5 object-contain" />
                  <span>თბილისის პარკინგი</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-navy border border-teal-200 shadow-2xs">
                  <img src="/batumi-parking-transparent.png" alt="ბათუმის ინსპექცია" className="h-3.5 object-contain" />
                  <span>ბათუმის ინსპექცია</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-navy border border-emerald-200 shadow-2xs">
                  <img src="/kutaisi-parking-transparent.png" alt="ქუთაისის მერია" className="h-3.5 object-contain" />
                  <span>ქუთაისის მერია</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ანგარიშის მფლობელი: <strong className="text-navy">{vehicle.driver_name || 'გიორგი მაისურაძე'}</strong> (პირადი #: <span className="font-mono">{vehicle.driver_personal_number || '01024085521'}</span>)
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mt-1">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>თბილისი • ბათუმი • ქუთაისი (მუნიციპალური ზონები)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Current Active Vehicle Plate & Parking Status Pill */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">არჩეული ავტომობილი</span>
              <span className="text-xs font-black text-navy">{vehicle.brand} {vehicle.model}</span>
            </div>
            <GeorgianLicensePlate plate={vehicle.plate_number || 'FR-282-EE'} size="md" variant="white" />
          </div>
        </div>

        {/* Active Vehicle Status Bar: Permits, Live Timer, and Fines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Permit Status */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">მუნიციპალური საშვი</span>
                <span className="text-xs font-extrabold text-navy">
                  {activeVehiclePermit ? '● მოქმედი აბონემენტი' : 'არ არის გააქტიურებული'}
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeVehiclePermit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {activeVehiclePermit ? 'აქტიური' : '0 საშვი'}
            </span>
          </div>

          {/* Live Session Status */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeSession.isActive ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-500'
              }`}>
                <Timer size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">LIVE ზონალური სესია</span>
                <span className="text-xs font-extrabold text-navy">
                  {activeSession.isActive ? `${activeSession.zoneName_ge}` : 'არ მიმდინარეობს'}
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSession.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {activeSession.isActive ? formatTime(activeSession.elapsedSeconds) : 'გამორთული'}
            </span>
          </div>

          {/* Fines Status */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                totalPendingParking > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {totalPendingParking > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">საპარკინგე ჯარიმები</span>
                <span className={`text-xs font-extrabold ${totalPendingParking > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {totalPendingParking > 0 ? `${totalPendingParking} ₾ გადასახდელი` : 'სუფთაა (0 ₾)'}
                </span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              totalPendingParking > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {pendingParkingFines.length} ჯარიმა
            </span>
          </div>
        </div>

        {/* Added Vehicles Section (დამატებული ავტომობილები) */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-2">
              <Car size={16} className="text-gold" />
              <h3 className="text-xs font-black uppercase tracking-wider text-navy">
                დამატებული ავტომობილები საპარკინგე ანგარიშზე ({vehiclesList.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              დააწკაპუნეთ ავტომობილზე საპარკინგე რეჟიმის გადასართავად
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vehiclesList.map(v => {
              const isCurrent = v.id === vehicle.id;
              const hasPermit = permits.some(p => p.isActive && (p.plateNumber === v.plate_number || (v.id === vehicle.id && p.plateNumber === 'FR-282-EE')));
              const isLive = activeSession.isActive && activeSession.plateNumber === v.plate_number;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSwitchVehicle(v)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 relative ${
                    isCurrent
                      ? 'bg-navy text-white border-gold shadow-md ring-2 ring-gold/40 scale-[1.01]'
                      : 'bg-white hover:bg-slate-50 text-navy border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm">{v.brand} {v.model}</span>
                        <span className={`text-[10px] font-mono ${isCurrent ? 'text-slate-300' : 'text-slate-400'}`}>
                          ({v.year})
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono block mt-0.5 ${isCurrent ? 'text-gold' : 'text-slate-400'}`}>
                        VIN: ...{v.vin ? v.vin.slice(-6) : 'GJ193791'}
                      </span>
                    </div>

                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold text-navy shadow-xs flex items-center gap-1 shrink-0">
                        <Check size={11} strokeWidth={3} />
                        <span>არჩეულია</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchVehicle(v);
                        }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-gold hover:text-navy text-slate-600 transition-all shrink-0"
                      >
                        არჩევა
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/30">
                    <GeorgianLicensePlate plate={v.plate_number || 'FR-282-EE'} size="xs" variant="white" />
                    
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {hasPermit && (
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                          isCurrent ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          საშვი ✔
                        </span>
                      )}
                      {isLive && (
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500 text-white animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Vehicle Card Button */}
            {onOpenAddVehicle && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenAddVehicle();
                }}
                className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-gold hover:bg-gold/5 transition-all flex flex-col items-center justify-center text-center gap-1.5 text-slate-500 hover:text-navy min-h-[90px]"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm">
                  +
                </div>
                <span className="text-xs font-bold">+ სხვა მანქანის დამატება</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUB-TAB SWITCHER                                      */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('zone_parking');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'zone_parking'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <Timer size={15} />
          <span>ცოცხალი ზონალური პარკირება</span>
          {activeSession.isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('parking_fines');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'parking_fines'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <FileText size={15} />
          <span>საპარკინგე ჯარიმები & საურავები</span>
          {pendingParkingFines.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
              {pendingParkingFines.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('permits');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'permits'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <Sparkles size={15} />
          <span>აბონემენტები & საშვები</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('spots');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'spots'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <Building size={15} />
          <span>მოლები & აეროპორტი</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: LIVE ZONE PARKING WITH REGION CONTOUR LOGOS    */}
      {/* ======================================================== */}
      {activeSubTab === 'zone_parking' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Active Live Parking Stopwatch Card */}
          {activeSession.isActive ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-navy to-slate-900 text-white shadow-xl border-2 border-gold/40 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    აქტიური პარკირების სესია (LIVE)
                  </span>
                </div>
                <GeorgianLicensePlate plate={activeSession.plateNumber} size="sm" variant="white" />
              </div>

              <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                {/* Timer Display */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                    გასული დრო (Stopwatch):
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-gold drop-shadow-sm">
                    {formatTime(activeSession.elapsedSeconds)}
                  </div>
                </div>

                {/* Free Period Notice or Cost */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  {activeSession.isFree15MinActive ? (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                        ✔ 15-წუთიანი უფასო საშეღავათო რეჟიმი
                      </span>
                      <p className="text-xs text-slate-300">
                        დარჩა: <strong className="font-mono text-white">{activeSession.freeMinRemaining} წუთი</strong> უფასოდ.
                      </p>
                      <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
                        0.00 ₾
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-300 block mb-1">
                        საფასური ({activeSession.hourlyRateGel.toFixed(2)} ₾/სთ)
                      </span>
                      <span className="text-3xl font-black font-mono text-white">
                        {activeSession.accumulatedCostGel.toFixed(2)} ₾
                      </span>
                    </div>
                  )}
                </div>

                {/* Stop & Pay Button */}
                <div className="flex flex-col justify-center">
                  <button
                    onClick={handleStopParking}
                    className="btn-stitch-rose w-full py-4 px-6 text-xs sm:text-sm font-black"
                  >
                    <Square size={16} className="fill-white" />
                    <span>პარკირების შეჩერება & გადახდა</span>
                  </button>
                  <span className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                    {activeSession.zoneName_ge}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Start Parking Control Center */
            <div className="p-6 rounded-3xl neu-card shadow-neu-card border border-white space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm">
                    <Timer className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-navy">
                      ზონალური საათობრივი პარკირების დაწყება
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      საქართველოს მუნიციპალური სატრანსპორტო სააგენტოების ერთიანი სისტემა
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                  🇬🇪 პირველი 15 წთ უფასოა
                </span>
              </div>

              {/* 1. AUTHENTIC CITY & REGION SELECTOR (TBILISI, BATUMI & KUTAISI) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} className="text-gold" />
                    <span>1. აირჩიეთ ქალაქი / რეგიონი:</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    თბილისი • ბათუმი • ქუთაისი • ოფიციალური ლოგოები
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {CITIES.map(c => {
                    const isSelected = selectedCity === c.id;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedCity(c.id);
                          const firstZone = CITY_ZONES[c.id][0];
                          setSelectedZone(firstZone.id);
                          setParkingLocationInput(CITY_QUICK_LOCATIONS[c.id][0]);
                        }}
                        className={`p-3.5 sm:p-4 rounded-3xl text-left border transition-all flex flex-col justify-between group relative overflow-hidden ${
                          isSelected
                            ? 'bg-navy text-white border-gold shadow-lg ring-2 ring-gold/40 scale-[1.02]'
                            : 'bg-white hover:bg-slate-50 text-navy border-slate-200 shadow-xs'
                        }`}
                      >
                        {/* Top: Official City Logo & Selection Dot */}
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-2xl transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-white p-1.5 shadow-sm ring-1 ring-gold/40'
                              : 'bg-white p-1.5 shadow-xs border border-slate-100'
                          }`}>
                            {c.id === 'tbilisi' ? (
                              <img
                                src="/tbilisi-parking-transparent.png"
                                alt="თბილისის პარკინგი"
                                className="w-16 h-12 sm:w-20 sm:h-14 object-contain"
                              />
                            ) : c.id === 'batumi' ? (
                              <img
                                src="/batumi-parking-transparent.png"
                                alt="ბათუმის მუნიციპალური ინსპექცია"
                                className="w-16 h-12 sm:w-20 sm:h-14 object-contain"
                              />
                            ) : (
                              <img
                                src="/kutaisi-parking-transparent.png"
                                alt="ქუთაისის მერია"
                                className="w-16 h-12 sm:w-20 sm:h-14 object-contain"
                              />
                            )}
                          </div>
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-2 ring-white/40" />
                          )}
                        </div>

                        {/* City Details */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm sm:text-base tracking-wide block">{c.name_ge}</span>
                            <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              ({c.name_en})
                            </span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold block mt-0.5 ${isSelected ? 'text-gold' : 'text-slate-500'}`}>
                            {c.id === 'tbilisi' ? 'თბილისის პარკინგი • ზონები' : c.id === 'batumi' ? 'მუნიციპალური ინსპექცია' : 'ქუთაისის მერია'}
                          </span>
                          <span className={`text-[11px] font-medium mt-1 block truncate ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                            {c.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TBILISI PARKING OFFICIAL BRAND BANNER */}
              {selectedCity === 'tbilisi' && (
                <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-50/90 via-white to-amber-50/40 rounded-2xl border border-blue-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <img
                      src="/tbilisi-parking-logo.png"
                      alt="თბილისის პარკინგი"
                      className="h-10 sm:h-11 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-navy">
                          თბილისის მუნიციპალური პარკინგი
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ოფიციალური სისტემა
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        დედაქალაქის ზონალურ-საათობრივი პარკირების გადახდა • A, B, C ზონები
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="px-2.5 py-1 rounded-xl bg-white text-navy font-mono font-bold text-xs border border-slate-200 shadow-2xs">
                      ⏱️ 15 წთ უფასო
                    </span>
                  </div>
                </div>
              )}

              {/* BATUMI MUNICIPAL INSPECTION OFFICIAL BRAND BANNER */}
              {selectedCity === 'batumi' && (
                <div className="p-3.5 sm:p-4 bg-gradient-to-r from-teal-50/90 via-white to-blue-50/40 rounded-2xl border border-teal-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <img
                      src="/batumi-parking-transparent.png"
                      alt="ბათუმის მუნიციპალური ინსპექცია"
                      className="h-11 sm:h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-navy">
                          ბათუმის მუნიციპალური ინსპექცია • საპარკინგე სამსახური
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-200">
                          ოფიციალური კონტროლი
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ბულვარის & სანაპიროს საათობრივი პარკირება • მუნიციპალური საშვები
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="px-2.5 py-1 rounded-xl bg-white text-navy font-mono font-bold text-xs border border-slate-200 shadow-2xs">
                      🌊 ბულვარი & ცენტრი
                    </span>
                  </div>
                </div>
              )}

              {/* KUTAISI MUNICIPALITY OFFICIAL BRAND BANNER */}
              {selectedCity === 'kutaisi' && (
                <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/40 rounded-2xl border border-emerald-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <img
                      src="/kutaisi-parking-transparent.png"
                      alt="ქუთაისის მერიის სატრანსპორტო სამსახური"
                      className="h-11 sm:h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-navy">
                          ქუთაისის მერია • სატრანსპორტო სამსახური
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ოფიციალური სისტემა
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        დავით აღმაშენებლის მოედნის & ისტორიული ცენტრის საათობრივი პარკირება
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="px-2.5 py-1 rounded-xl bg-white text-navy font-mono font-bold text-xs border border-slate-200 shadow-2xs">
                      🏛️ ცენტრი (1 ₾/სთ)
                    </span>
                  </div>
                </div>
              )}

              {/* 2. DYNAMIC ZONE SELECTOR FOR THE SELECTED CITY */}
              <div>
                <label className="block text-xs font-black text-navy uppercase tracking-wider mb-2">
                  2. აირჩიეთ {CITIES.find(c => c.id === selectedCity)?.name_ge}ს პარკირების ზონა & ტარიფი:
                </label>
                <div className={`grid grid-cols-1 ${
                  CITY_ZONES[selectedCity].length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                } gap-3`}>
                  {CITY_ZONES[selectedCity].map(z => {
                    const isSel = selectedZone === z.id;
                    return (
                      <div
                        key={z.id}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedZone(z.id);
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSel
                            ? 'bg-navy text-white border-navy shadow-md scale-[1.02] ring-2 ring-gold/40'
                            : 'bg-white hover:bg-slate-50 text-navy border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm">{z.name}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                            isSel ? 'bg-gold text-navy' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {z.rate}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>
                          {z.areas}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-100/20 flex items-center justify-between text-[10px]">
                          <span className={`font-mono ${isSel ? 'text-gold' : 'text-slate-400'}`}>სტატუსი: {z.badge}</span>
                          <span className={`font-bold ${isSel ? 'text-emerald-300' : 'text-emerald-700'}`}>● ხელმისაწვდომია</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. QUICK LOCATION CHIPS FOR SELECTED CITY */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  პარკირების ლოკაცია / ქუჩა ({CITIES.find(c => c.id === selectedCity)?.name_ge}):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CITY_QUICK_LOCATIONS[selectedCity].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setParkingLocationInput(loc)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        parkingLocationInput === loc
                          ? 'bg-navy text-gold shadow-sm'
                          : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={parkingLocationInput}
                  onChange={(e) => setParkingLocationInput(e.target.value)}
                  placeholder="შეიყვანეთ ქუჩა ან ლოკაცია..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartParking}
                  className="btn-stitch-primary w-full py-4.5 px-6 text-sm sm:text-base font-black tracking-wide"
                >
                  <Play size={18} className="fill-navy" />
                  <span>პარკირების დაწყება (Live Timer ჩართვა)</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2.5 font-mono flex items-center justify-center gap-1.5">
                  <span>ავტომობილი:</span>
                  <GeorgianLicensePlate plate={vehicle.plate_number || 'FR-282-EE'} size="xs" variant="white" />
                  <span>• პირველი 15 წუთი უფასოა!</span>
                </p>
              </div>
            </div>
          )}

          {/* Legal 15 Min Info Box */}
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-300/40 text-xs text-navy flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-950 font-bold mb-0.5">
                საქართველოს კანონმდებლობა მუნიციპალურ ზონალურ პარკირებაზე:
              </strong>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                თბილისის, ბათუმის, ქუთაისისა და რუსთავის მუნიციპალიტეტების დადგენილებით, ზონალურ-საათობრივ პარკირებაზე თითოეულ ავტომობილს ეძლევა <strong>15 უფასო წუთი</strong> დღეში 4-ჯერ. 15 წუთის ამოწურვის შემდეგ სისტემა ავტომატურად იწყებს საათობრივი ტარიფის დათვლას.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: MUNICIPAL PARKING FINES                       */}
      {/* ======================================================== */}
      {activeSubTab === 'parking_fines' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Municipal Ticket Search Form */}
          <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-gold" />
                <span>მუნიციპალური პარკირების ქვითრის ძებნა & შემოწმება</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                თბილისი • ბათუმი • ქუთაისი
              </span>
            </div>

            <form onSubmit={handleSearchParkingFine} className="flex gap-2">
              <input
                type="text"
                value={searchTicketNumber}
                onChange={(e) => setSearchTicketNumber(e.target.value)}
                placeholder="შეიყვანეთ ქვითრის # (მაგ: TB-PK-98124, BAT-PK-4421, KT-PK-3312)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <button
                type="submit"
                className="btn-stitch-navy px-6 py-2.5 text-xs font-bold shrink-0"
              >
                ქვითრის შემოწმება
              </button>
            </form>

            {ticketSearchSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 animate-fade-in">
                {ticketSearchSuccess}
              </p>
            )}
          </div>

          {/* Sauravi 150 GEL Warning Alert Banner */}
          {pendingParkingFines.length > 0 && (
            <div className="p-4 rounded-3xl bg-rose-500/10 border-2 border-rose-400/60 flex items-center justify-between gap-3 text-xs animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="font-extrabold text-navy flex items-center gap-2">
                    <span>150 ₾-იანი საურავის გაფრთხილება:</span>
                    <span className="text-rose-700 font-mono font-black">
                      სულ გადასახდელია {totalPendingParking} ₾
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    პარკირების 10₾/50₾-იანი ჯარიმის 30 დღეში გადაუხდელობის შემთხვევაში ერიცხება <strong>150 ₾ საურავი</strong>!
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-mono font-bold text-xs shrink-0">
                ვადა: 30 დღე
              </span>
            </div>
          )}

          {/* Parking Fines Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parkingFines.map(fine => {
              const isPaid = fine.status === 'paid';
              const cityLabel = fine.city === 'tbilisi' ? '🇬🇪 თბილისი' : fine.city === 'batumi' ? '🌊 ბათუმი' : '🏛️ ქუთაისი';

              return (
                <div
                  key={fine.id}
                  className={`p-5 rounded-3xl neu-card shadow-neu-card border border-white transition-all flex flex-col justify-between ${
                    isPaid ? 'opacity-60' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {fine.city === 'tbilisi' ? (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                            <img src="/tbilisi-parking-transparent.png" alt="თბილისის პარკინგი" className="h-4 object-contain" />
                            <span className="text-[10px] font-bold text-navy">თბილისის პარკინგი</span>
                          </div>
                        ) : fine.city === 'batumi' ? (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                            <img src="/batumi-parking-transparent.png" alt="ბათუმის ინსპექცია" className="h-4 object-contain" />
                            <span className="text-[10px] font-bold text-navy">ბათუმის ინსპექცია</span>
                          </div>
                        ) : fine.city === 'kutaisi' ? (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                            <img src="/kutaisi-parking-transparent.png" alt="ქუთაისის მერია" className="h-4 object-contain" />
                            <span className="text-[10px] font-bold text-navy">ქუთაისის მერია</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-navy text-gold text-[10px] font-mono font-bold">
                            {cityLabel}
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          #{fine.ticket_number}
                        </span>
                      </div>

                      {isPaid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          ✔ გადახდილია
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-700">
                          დარჩა {fine.due_days_left} დღე
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-navy mb-1.5 leading-snug">
                      {fine.title_ge}
                    </h4>

                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mb-3 flex items-center gap-1.5">
                      <MapPin size={13} className="text-gold shrink-0" />
                      <span className="truncate">{fine.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">ჯარიმის ოდენობა:</span>
                      <span className="text-2xl font-black font-mono text-navy">
                        {fine.amount_gel} ₾
                      </span>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => handlePayParkingFine(fine.id)}
                        disabled={simulatedPaymentId === fine.id}
                        className="btn-stitch-primary px-5 py-2.5 text-xs font-black"
                      >
                        <CreditCard size={14} />
                        <span>{simulatedPaymentId === fine.id ? 'მუშავდება...' : 'გადახდა (1-კლიკი)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: PARKING PERMITS & PASSES                      */}
      {/* ======================================================== */}
      {activeSubTab === 'permits' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-2">
            <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
              <Sparkles size={16} className="text-gold" />
              <span>პარკირების ოფიციალური აბონემენტები და მაცხოვრებლის საშვები</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>ავტომობილის სახელმწიფო ნომერზე მიბმული მოქმედი აბონემენტები:</span>
              <GeorgianLicensePlate plate={vehicle.plate_number || 'FR-282-EE'} size="xs" variant="white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permits.map(permit => {
              const cityLabel = permit.city === 'tbilisi' ? 'თბილისი' : permit.city === 'batumi' ? 'ბათუმი' : 'ქუთაისი';

              return (
                <div
                  key={permit.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {permit.city === 'tbilisi' ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                          <img src="/tbilisi-parking-transparent.png" alt="თბილისის პარკინგი" className="h-4 object-contain" />
                          <span className="text-[10px] font-bold text-navy">თბილისის პარკინგი</span>
                        </div>
                      ) : permit.city === 'batumi' ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                          <img src="/batumi-parking-transparent.png" alt="ბათუმის ინსპექცია" className="h-4 object-contain" />
                          <span className="text-[10px] font-bold text-navy">ბათუმის ინსპექცია</span>
                        </div>
                      ) : permit.city === 'kutaisi' ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                          <img src="/kutaisi-parking-transparent.png" alt="ქუთაისის მერია" className="h-4 object-contain" />
                          <span className="text-[10px] font-bold text-navy">ქუთაისის მერია</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {cityLabel}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        permit.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {permit.isActive ? '● აქტიურია' : 'შეჩერებულია'}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-navy leading-snug">
                      {permit.title_ge}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      ვადა: {permit.expiryDate}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-black font-mono text-navy">
                      {permit.cost_gel === 0 ? 'უფასო (0 ₾)' : `${permit.cost_gel} ₾ / წელი`}
                    </span>

                    <button
                      onClick={() => handleTogglePermit(permit.id)}
                      className={`px-4 py-2 text-xs font-bold transition-all ${
                        permit.isActive
                          ? 'btn-stitch-soft'
                          : 'btn-stitch-navy'
                      }`}
                    >
                      {permit.isActive ? 'გამორთვა' : 'გააქტიურება'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: COMMERCIAL / MALL & AIRPORT SPOTS             */}
      {/* ======================================================== */}
      {activeSubTab === 'spots' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white">
            <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
              <Building size={16} className="text-gold" />
              <span>სავაჭრო მოლების, მიწისქვეშა ავტოფარეხებისა და აეროპორტის ტარიფები</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              რეალური ტარიფები და ცოცხალი თავისუფალი ადგილები საქართველოში
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMERCIAL_PARKING_SPOTS.map(spot => (
              <div key={spot.id} className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-navy">{spot.name_ge}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{spot.operator_ge}</span>
                  </div>
                  <span className="text-lg font-black font-mono text-navy bg-gold/15 px-2.5 py-0.5 rounded-xl text-amber-900 border border-gold/30">
                    {spot.hourlyRateGel === 0 ? 'უფასო' : `${spot.hourlyRateGel.toFixed(2)} ₾ / სთ`}
                  </span>
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <MapPin size={13} className="text-gold shrink-0" />
                  <span>{spot.address}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-500">თავისუფალი:</span>
                    <span className="font-black text-emerald-700">{spot.availableSpaces} / {spot.totalSpaces}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-500">24/7 რეჟიმი:</span>
                    <span className="font-bold text-navy">{spot.isOpen24h ? '✔ კი' : '23:00-მდე'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ParkingModule;
