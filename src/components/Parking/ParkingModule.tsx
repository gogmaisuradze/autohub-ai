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
  ArrowRight,
  Radio,
  Signal,
  Cpu,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck,
  Navigation,
  Map,
  Zap,
  X
} from 'lucide-react';
import ParkingLocationPicker from './ParkingLocationPicker';
import { ParkingZonesMap } from './ParkingZonesMap';
import { DelineatedParkingZone, DELINEATED_PARKING_ZONES, createManualParkingLot } from '../../constants/parkingZones';
import {
  ParkingLocationLot,
  TBILISI_OPERATOR_REQUIREMENTS
} from '../../types/parking';
import {
  ParkingSession,
  ParkingSessionStatus
} from '../../types/parkingSession';
import { DeviceTelemetryReading } from '../../types/telemetry';
import { StopDetectionResult } from '../../services/parkingStopDetector';
import { obd4gService } from '../../services/obd4gService';
import {
  parkingSessionService,
  formatTbilisiTime,
  formatTbilisiDateTime
} from '../../services/parkingSessionService';
import { ParkingConfirmationModal } from './ParkingConfirmationModal';
import {
  TbilisiCoatOfArms,
  BatumiCoatOfArms,
  KutaisiCoatOfArms,
  CityCoatOfArms
} from './CityEmblems';
import {
  TBILISI_PARKING_LOGO_B64,
  BATUMI_PARKING_LOGO_B64,
  KUTAISI_PARKING_LOGO_B64
} from '../../constants/parkingLogosData';

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

export const KutaisiContourLogo: React.FC<{ className?: string }> = ({ className = "w-14 h-14" }) => (
  <KutaisiCoatOfArms className={className} />
);

// City Config with Official Municipal Logos & Regional Attributes
interface CityConfig {
  id: CityType;
  name_ge: string;
  name_en: string;
  region_ge: string;
  subtitle: string;
  coatOfArms: React.FC<{ className?: string; size?: number }>;
  contourLogo: React.FC<{ className?: string }>;
  logoBase64: string;
}

const CITIES: CityConfig[] = [
  {
    id: 'tbilisi',
    name_ge: 'თბილისი',
    name_en: 'Tbilisi',
    region_ge: 'თბილისის პარკინგი',
    subtitle: 'ზონალური A, B, C (1-3 ₾/სთ)',
    coatOfArms: TbilisiCoatOfArms,
    contourLogo: TbilisiContourLogo,
    logoBase64: TBILISI_PARKING_LOGO_B64
  },
  {
    id: 'batumi',
    name_ge: 'ბათუმი',
    name_en: 'Batumi',
    region_ge: 'მუნიციპალური ინსპექცია',
    subtitle: 'ბულვარი & სანაპირო (1-1.5 ₾/სთ)',
    coatOfArms: BatumiCoatOfArms,
    contourLogo: BatumiContourLogo,
    logoBase64: BATUMI_PARKING_LOGO_B64
  },
  {
    id: 'kutaisi',
    name_ge: 'ქუთაისი',
    name_en: 'Kutaisi',
    region_ge: 'სატრანსპორტო სამსახური',
    subtitle: 'ცენტრალური ზონა (1 ₾/სთ)',
    coatOfArms: KutaisiCoatOfArms,
    contourLogo: KutaisiContourLogo,
    logoBase64: KUTAISI_PARKING_LOGO_B64
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
    '#05 ი. ჭავჭავაძის #34 (ვაკე)',
    '#07 პეკინის #5 (საბურთალო)',
    '#08 ალ. ყაზბეგის #14',
    '#03 შ. რუსთაველის #2',
    '#01 კოტე აფხაზის ქ. (სოლოლაკი)',
    '#10 დ. აღმაშენებლის #72',
    '#12 აკ. წერეთლის #118'
  ],
  batumi: [
    '#101 შ. რუსთაველის გამზ. (ბულვარი)',
    '#102 მ. აბაშიძის #24 (ძველი ბათუმი)',
    '#103 ზ. გორგილაძის #88'
  ],
  kutaisi: [
    '#201 დავით აღმაშენებლის მოედანი',
    '#202 თეთრი ხიდის მიმდებარე ტერიტორია'
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
  const [locationPicker, setLocationPicker] = useState<{ initialLot?: DelineatedParkingZone } | null>(null);
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

  // 4G OBD Telemetry & Device State
  const [telemetry, setTelemetry] = useState<DeviceTelemetryReading | null>(null);
  const [stopResult, setStopResult] = useState<StopDetectionResult | null>(null);
  const [obdMode, setObdMode] = useState<'real' | 'demo'>(() => obd4gService.getMode());
  const [activeDevice, setActiveDevice] = useState(() => obd4gService.getActiveDevice());

  // Strict Parking Session State from parkingSessionService
  const [parkingSession, setParkingSession] = useState<ParkingSession | null>(() => parkingSessionService.getSession());
  const [showOperatorReqs, setShowOperatorReqs] = useState(false);
  const [copiedLotCode, setCopiedLotCode] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [selectedParkingAction, setSelectedParkingAction] = useState<'location' | 'map' | 'slot' | null>(null);
  const [customSlotInput, setCustomSlotInput] = useState<string>('005');

  // Subscriptions to 4G OBD & Parking Session Lifecycle
  useEffect(() => {
    const unsubObd = obd4gService.subscribeTelemetry((reading, stopRes) => {
      setTelemetry(reading);
      setStopResult(stopRes);
    });
    return unsubObd;
  }, []);

  useEffect(() => {
    const unsubSession = parkingSessionService.subscribe((sess) => {
      setParkingSession(sess);
      if (sess && sess.status !== 'completed' && sess.status !== 'probable_stop') {
        setActiveSession(prev => ({
          ...prev,
          isActive: true,
          zoneName_ge: `ზონა #${sess.lot.lotCode} — ${sess.lot.street_ge}`,
          hourlyRateGel: sess.lot.hourlyRateGel,
          startTime: new Date(sess.stoppedAt).getTime(),
          plateNumber: sess.plateNumber
        }));
      } else if (!sess || sess.status === 'completed') {
        setActiveSession(prev => ({
          ...prev,
          isActive: false,
          startTime: 0,
          elapsedSeconds: 0
        }));
      }
    });
    return unsubSession;
  }, []);

  // Live seconds ticker for countdown calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fallback vehicles list for the Parking Profile
  const vehiclesList = allVehicles && allVehicles.length > 0 ? allVehicles : [vehicle];

  // Active / Detected Parked Lot and Parked Vehicle for 4G OBD Banner
  const activeParkedLot = parkingSession?.lot || stopResult?.matchedLot || DELINEATED_PARKING_ZONES.find(z => z.lotCode === '005');
  const parkedVehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : 'Mercedes-Benz C300';
  const parkedPlateNumber = vehicle.plate_number || activeSession.plateNumber || 'FR-282-EE';

  // Keep live parking stopwatch running
  useEffect(() => {
    let timer: any;
    if (activeSession.isActive && activeSession.startTime > 0) {
      timer = setInterval(() => {
        const now = Date.now();
        const elapsedSec = Math.max(0, Math.floor((now - activeSession.startTime) / 1000));
        const elapsedMin = Math.floor(elapsedSec / 60);

        // Free 15 min rule calculation
        const freeAllowance = parkingSession?.lot.freeMinutes ?? 0;
        const freeRem = Math.max(0, freeAllowance - elapsedMin);
        const billableHours = elapsedMin > freeAllowance ? Math.ceil((elapsedMin - freeAllowance) / 60) : 0;
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
  }, [activeSession.isActive, activeSession.startTime, activeSession.hourlyRateGel, parkingSession?.lot.freeMinutes]);

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

  // Handlers for Live Zone Parking & Delineated Map Selection
  const handleSelectDelineatedZone = (zone: DelineatedParkingZone) => {
    sounds.playClick();
    setSelectedCity(zone.city);
    const catId = zone.category === 'A' ? 'zone_a' : zone.category === 'B' ? 'zone_b' : 'zone_c';
    setSelectedZone(catId);
    setParkingLocationInput(`ზონა #${zone.zoneNumber} — ${zone.street_name_ge}`);
  };

  const handleCopyLotCode = (code: string) => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedLotCode(true);
      setTimeout(() => setCopiedLotCode(false), 2000);
    }
  };

  const startConfirmedParking = (zone: DelineatedParkingZone, durationMinutes: number) => {
    sounds.playScanSweep();
    setSelectedCity(zone.city);
    const catId = zone.category === 'A' ? 'zone_a' : zone.category === 'B' ? 'zone_b' : 'zone_c';
    setSelectedZone(catId);
    const locName = `ზონა #${zone.zoneNumber} — ${zone.street_name_ge}`;
    setParkingLocationInput(locName);

    // Trigger state in parkingSessionService
    const session = parkingSessionService.createProbableStopSession(zone, vehicle);
    if (!session || session.lot.lotCode !== zone.lotCode) return;
    parkingSessionService.confirmParking(Math.min(5, durationMinutes - 1), durationMinutes);
    setLocationPicker(null);

    const newSession: ActiveParkingSession = {
      isActive: true,
      city: zone.city,
      zone: catId as any,
      zoneName_ge: `ზონა #${zone.zoneNumber} (${zone.categoryName_ge}) — ${zone.street_name_ge}`,
      hourlyRateGel: zone.hourly_rate_gel,
      startTime: Date.now(),
      elapsedSeconds: 0,
      accumulatedCostGel: 0,
      isFree15MinActive: true,
      freeMinRemaining: zone.freeMinutes,
      plateNumber: vehicle.plate_number || 'FR-282-EE'
    };
    newSession.isFree15MinActive = zone.freeMinutes > 0;

    setActiveSession(newSession);
    try {
      localStorage.setItem('autohub_active_parking_session', JSON.stringify(newSession));
    } catch {}
  };

  const handleStartParkingFromMap = (zone: DelineatedParkingZone) => {
    setLocationPicker({ initialLot: zone });
  };
  const handleStartParking = () => {
    setLocationPicker({});
  };

  const handleStopParking = () => {
    sounds.playSuccess();
    parkingSessionService.completeSession();

    const finalCost = activeSession.accumulatedCostGel;
    const finalElapsedMin = Math.ceil(activeSession.elapsedSeconds / 60);

    alert(`პარკირების სესია დასრულებულია!\nავტომობილი: ${vehicle.plate_number || activeSession.plateNumber}\nქალაქი: ${selectedCity.toUpperCase()}\nხანგრძლივობა: ${finalElapsedMin} წთ.\nშეხსენების ტაიმერი შეჩერებულია!`);

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
    <div className="space-y-6">
      {locationPicker && <ParkingLocationPicker city={selectedCity} initialLot={locationPicker.initialLot}
        plate={vehicle.plate_number || ''} vehicleId={vehicle.id}
        obdReading={obdMode === 'real' && telemetry?.vehicleId === vehicle.id && activeDevice?.deviceId === telemetry?.deviceId ? telemetry : undefined} onClose={() => setLocationPicker(null)}
        onConfirm={startConfirmedParking} />}
      
      {/* ======================================================== */}
      {/* 0. SMART PARKING DECK (იგივე სტილი და ფერები რაც OBD ბანერში) */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 lg:p-7 rounded-3xl neu-card shadow-neu-card border border-white/80 bg-[#ECEAE5] text-navy space-y-5 transition-all">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0 bg-white border border-white">
              <ParkingSquare className="w-6 h-6 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  AutoHub ჭკვიანი პარკინგი
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  activeSession.isActive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-gold/15 text-navy border-gold/30'
                }`}>
                  {activeSession.isActive ? '🟢 აქტიური' : '🅿️ მზადაა'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeSession.isActive
                  ? `პარკირება აქტიურია • ${activeParkedLot?.street_ge || 'ჭავჭავაძის გამზ.'} (#${customSlotInput || activeParkedLot?.lotCode || '005'})`
                  : 'აირჩიეთ პარკირების მეთოდი ან დაიწყეთ ავტომატურად'}
              </p>
            </div>
          </div>

          {/* Right Header Status Pill / Plate */}
          <div className="flex items-center gap-2 shrink-0">
            {activeSession.isActive ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-black text-xs flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{formatTime(activeSession.elapsedSeconds)}</span>
              </div>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-navy font-mono font-black text-xs shadow-2xs">
                {parkedPlateNumber}
              </span>
            )}
          </div>
        </div>

        {/* 1. ძირითადი 4 ფანჯარა (ლოკაციით დაწყება, ქუჩის ნახვა რუკაზე, სლოტის ნომრის ჩაწერა, პარკირების დაწყება) */}
        <div>
          <label className="text-xs font-black text-navy uppercase tracking-wider block mb-2.5">
            1. აირჩიეთ პარკირების მოქმედება:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: ლოკაციით პარკინგის დაწყება */}
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedParkingAction(selectedParkingAction === 'location' ? null : 'location');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                selectedParkingAction === 'location'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      selectedParkingAction === 'location' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Navigation className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-950 border-amber-300 font-black ring-1 ring-amber-400/40">
                    GPS დეტექცია
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">ლოკაციით დაწყება</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {activeParkedLot?.district_ge || 'ვაკე'} • {activeParkedLot?.categoryLabel_ge || 'ზონა A (1.00 ₾/სთ)'}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● GPS ავტომატური ამოცნობა
                  </span>
                </div>

                {selectedParkingAction === 'location' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                selectedParkingAction === 'location'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>დეტალები</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  selectedParkingAction === 'location' ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 2: ქუჩის ნახვა რუკაზე */}
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedParkingAction(selectedParkingAction === 'map' ? null : 'map');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                selectedParkingAction === 'map'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      selectedParkingAction === 'map' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Map className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                    რუკა & ზონა
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">ქუჩის ნახვა რუკაზე</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {activeParkedLot?.street_ge || 'ი. ჭავჭავაძის გამზირი'} #{activeParkedLot?.lotCode === '005' ? '34' : '34'}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● მზიურის მოპირდაპირედ
                  </span>
                </div>

                {selectedParkingAction === 'map' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                selectedParkingAction === 'map'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>რუკის ნახვა</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  selectedParkingAction === 'map' ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 3: სლოტის ნომრის ჩაწერა */}
            <div
              onClick={() => {
                sounds.playClick();
                setSelectedParkingAction(selectedParkingAction === 'slot' ? null : 'slot');
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                selectedParkingAction === 'slot'
                  ? 'bg-white shadow-md border-gold ring-2 ring-gold/40'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      selectedParkingAction === 'slot' ? 'bg-gold text-navy font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ParkingSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                    ლოტი #{customSlotInput || activeParkedLot?.lotCode || '005'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">სლოტის ნომრის ჩაწერა</h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    მუნიციპალური ლოტი #{customSlotInput || '005'}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● ჩაწერეთ ნომერი
                  </span>
                </div>

                {selectedParkingAction === 'slot' && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold text-navy flex items-center justify-center shadow-xs">
                    <Check size={11} className="stroke-[3]" />
                  </div>
                )}
              </div>

              <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-sans font-bold transition-colors ${
                selectedParkingAction === 'slot'
                  ? 'border-gold/30 text-navy'
                  : 'border-slate-100 text-slate-500 group-hover:text-navy'
              }`}>
                <span>ჩაწერა</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${
                  selectedParkingAction === 'slot' ? 'rotate-180 text-navy' : ''
                }`} />
              </div>
            </div>

            {/* Card 4: პარკირების დაწყება (ცალკე მეოთხე ფანჯარა - მშვიდი და დახვეწილი სტილი) */}
            <div
              onClick={() => {
                sounds.playClick();
                if (!activeSession.isActive) {
                  handleStartParking();
                } else {
                  handleStopParking();
                }
              }}
              className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border relative flex flex-col justify-between group active:scale-[0.98] ${
                activeSession.isActive
                  ? 'bg-white shadow-md border-rose-500 ring-2 ring-rose-500/30'
                  : 'neu-btn bg-[#FAFBFD] text-slate-700 hover:text-navy border border-slate-200/80 hover:bg-white hover:border-gold/70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    activeSession.isActive
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-navy group-hover:bg-gold/25'
                  }`}>
                    {!activeSession.isActive ? (
                      <Zap className="w-5 h-5 text-gold fill-gold" />
                    ) : (
                      <Square className="w-5 h-5 fill-rose-600 text-rose-600" />
                    )}
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    !activeSession.isActive
                      ? 'bg-amber-100 text-amber-900 border-amber-200 font-black'
                      : 'bg-rose-100 text-rose-800 border-rose-200 font-black'
                  }`}>
                    {!activeSession.isActive ? '⚡ დაწყება' : '🛑 STOP'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy">
                    {!activeSession.isActive ? 'პარკირების დაწყება' : 'პარკირების შეწყვეტა'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {!activeSession.isActive ? 'დააჭირეთ დასაწყებად' : 'სესიის დასრულება'}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 block mt-1 font-semibold">
                    ● {!activeSession.isActive ? '15 წთ უფასო • ზონა A' : `ხანგრძლივობა: ${formatTime(activeSession.elapsedSeconds)}`}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-sans font-bold text-slate-500 group-hover:text-navy transition-colors">
                <span>{!activeSession.isActive ? 'დაწყება' : 'შეწყვეტა'}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. დეტალური ჩამოსაშლელი ინსტრუქცია/პარამეტრები (ჩნდება მხოლოდ დაჭერისას) */}
        {selectedParkingAction && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-black text-navy flex items-center gap-1.5 uppercase tracking-wide">
                <span>
                  {selectedParkingAction === 'location'
                    ? '2. ლოკაციის მონაცემები'
                    : selectedParkingAction === 'map'
                    ? '2. ქუჩის ნახვა რუკაზე'
                    : '2. საპარკინგე სლოტის ნომრის ჩაწერა'}
                </span>
                <span className="text-gold font-mono font-bold">
                  ({activeParkedLot?.district_ge || 'ვაკე'})
                </span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedParkingAction(null);
                }}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-navy transition-all"
                title="დახურვა"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content: Location */}
            {selectedParkingAction === 'location' && (
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">მდებარეობა</span>
                    <strong className="text-navy text-xs block mt-0.5">{activeParkedLot?.street_ge || 'ი. ჭავჭავაძის გამზირი'} #{activeParkedLot?.lotCode === '005' ? '34' : '34'}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">ვაკე • მზიურის მოპირდაპირედ</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">სატარიფო ზონა</span>
                    <strong className="text-gold text-xs block mt-0.5">{activeParkedLot?.categoryLabel_ge || 'ზონა A (1.00 ₾/სთ)'}</strong>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">✓ პირველი 15 წთ უფასო</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">GPS სიზუსტე</span>
                    <strong className="text-navy text-xs block mt-0.5">±6.5 მეტრი</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">14 თანამგზავრი აქტიურია</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      handleStartParking();
                      setSelectedParkingAction(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-navy hover:bg-slate-800 text-gold font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Zap size={14} className="fill-gold text-gold" />
                    <span>ამ ლოკაციით პარკირების დაწყება</span>
                  </button>
                </div>
              </div>
            )}

            {/* Content: Map */}
            {selectedParkingAction === 'map' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <strong className="text-navy block font-bold text-xs sm:text-sm">
                      {activeParkedLot?.street_ge || 'ი. ჭავჭავაძის გამზირი'} #{activeParkedLot?.lotCode === '005' ? '34' : '34'}
                    </strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      კოორდინატები: 41.7118° N, 44.7745° E • ვაკის ზონალური საპარკინგე სექტორი
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      document.getElementById('parking-zones-map-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-navy text-gold font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <Map size={14} />
                    <span>რუკაზე ნახვა ➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* Content: Slot Input */}
            {selectedParkingAction === 'slot' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2.5">
                  <label className="text-[11px] text-slate-600 block font-bold">
                    ჩაწერეთ საგზაო ნიშანზე მითითებული საპარკინგე სლოტის/ლოტის ნომერი:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">#</span>
                      <input
                        type="text"
                        value={customSlotInput}
                        onChange={(e) => setCustomSlotInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="005"
                        className="pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-mono font-black text-navy text-sm w-32 uppercase bg-white focus:outline-hidden focus:ring-2 focus:ring-gold focus:border-gold shadow-xs"
                      />
                    </div>

                    {/* Quick Slot Preset Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['001', '005', '012', '034'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setCustomSlotInput(code);
                            setParkingLocationInput(`ზონა #${code} — ი. ჭავჭავაძის გამზირი`);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                            customSlotInput === code
                              ? 'bg-gold text-navy border-gold shadow-xs font-black'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-gold'
                          }`}
                        >
                          #{code}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playSuccess();
                        setParkingLocationInput(`ზონა #${customSlotInput} — ი. ჭავჭავაძის გამზირი`);
                        setSelectedParkingAction(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-navy text-gold font-bold text-xs hover:bg-slate-800 transition-all ml-auto shadow-sm"
                    >
                      დამახსოვრება
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Action Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              document.getElementById('parking-zones-map-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-stitch-soft w-full sm:w-auto px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-2 group transition-all"
          >
            <Map className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
            <span>სრული რუკის ნახვა</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (!activeSession.isActive) {
                handleStartParking();
              } else {
                handleStopParking();
              }
            }}
            className={`w-full sm:flex-1 py-3.5 sm:py-4 px-8 text-sm sm:text-base font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all ${
              !activeSession.isActive ? 'btn-stitch-navy' : 'btn-stitch-rose text-white'
            }`}
          >
            <Zap className={`w-5 h-5 ${!activeSession.isActive ? 'text-gold fill-gold' : 'text-white fill-white'}`} />
            <span>
              {!activeSession.isActive
                ? 'პარკირების დაწყება'
                : `პარკირების შეწყვეტა (${formatTime(activeSession.elapsedSeconds)})`}
            </span>
            <ArrowRight size={17} className={!activeSession.isActive ? 'text-gold' : 'text-white'} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. INTERACTIVE PARKING ZONES MAP (პირველივე მთავარი აქცენტი) */}
      {/* ======================================================== */}
      <div id="parking-zones-map-section" className="space-y-2">
        <ParkingZonesMap
          city={selectedCity}
          selectedZoneId={parkingLocationInput.match(/#([A-Za-z]?\d+)/)?.[1]?.toUpperCase()}
          onSelectZone={handleSelectDelineatedZone}
          onStartParkingWithZone={handleStartParkingFromMap}
        />
      </div>

      {/* ======================================================== */}
      {/* 2. DEDICATED PARKING PROFILE & ADDED VEHICLES CAROUSEL    */}
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
                  <img src={TBILISI_PARKING_LOGO_B64} alt="თბილისის პარკინგი" className="h-3.5 max-w-[50px] object-contain" />
                  <span>თბილისი</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-navy border border-teal-200 shadow-2xs">
                  <img src={BATUMI_PARKING_LOGO_B64} alt="ბათუმის ინსპექცია" className="h-3.5 max-w-[30px] object-contain" />
                  <span>ბათუმი</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-navy border border-emerald-200 shadow-2xs">
                  <img src={KUTAISI_PARKING_LOGO_B64} alt="ქუთაისის მერია" className="h-3.5 max-w-[30px] object-contain" />
                  <span>ქუთაისი</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ანგარიშის მფლობელი: <strong className="text-navy">{vehicle.driver_name || 'მძღოლის პროფილი'}</strong> (პირადი #: <span className="font-mono">{vehicle.driver_personal_number || 'არ არის მითითებული'}</span>)
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
          
          {/* Active Live Parking Stopwatch Card with Strict Status Separation */}
          {(activeSession.isActive || (parkingSession && parkingSession.status !== 'completed' && parkingSession.status !== 'probable_stop')) ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white shadow-xl border-2 border-gold/40 relative overflow-hidden space-y-5">
              {/* Top: Status Badges and Plate */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping"></div>
                  <div>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                      {parkingSession?.status === 'operator_activated'
                        ? '🏛️ ოფიციალურად გააქტიურებულია ოპერატორთან'
                        : parkingSession?.status === 'user_confirmed_parking'
                        ? '🟡 მომხმარებლის მიერ დადასტურებული პარკირება'
                        : '🔔 AutoHub შეხსენების ტაიმერი (შიდა სისტემა)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      სესია #{parkingSession?.sessionId.slice(-6) || 'LIVE'}
                    </span>
                  </div>
                </div>
                <GeorgianLicensePlate plate={parkingSession?.plateNumber || activeSession.plateNumber} size="sm" variant="white" />
              </div>

              {/* Strict Legal Warning Notice */}
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold block mb-0.5">
                    ⚠️ ყურადღება: ეს არის AutoHub-ის შიდა შეხსენების ტაიმერი!
                  </strong>
                  <p className="text-slate-200 leading-relaxed text-[11px]">
                    ადგილობრივი ტაიმერი <strong>არ წარმოადგენს</strong> მუნიციპალური პარკირების ოფიციალურ საფასურის გადახდას. მუნიციპალური ჯარიმის თავიდან ასაცილებლად, აუცილებელია პარკირების ოფიციალურად გააქტიურება მუნიციპალურ სერვისში.
                  </p>
                </div>
              </div>

              {/* Official Lot Code & Verification Provenance Bar */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    პარკირების ოფიციალური ლოტის კოდი:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black font-mono text-gold">
                      #{parkingSession?.lot.lotCode || (parkingLocationInput.match(/#([A-Za-z]?\d+)/)?.[1] || '005')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/20">
                      ზონა {parkingSession?.lot.tariffCategory || 'A'} ({parkingSession?.lot.hourlyRateGel?.toFixed(2) || (activeSession.hourlyRateGel?.toFixed(2) || '—')} ₾/სთ)
                    </span>
                  </div>
                  <span className="text-xs text-slate-300 block mt-1">
                    {parkingSession?.lot.street_ge || activeSession.zoneName_ge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    მონაცემის წყარო: {parkingSession?.lot.dataSource || 'parking.tbilisi.gov.ge'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyLotCode(parkingSession?.lot.lotCode || '005')}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center gap-1.5 border border-white/15"
                  >
                    <Copy size={13} />
                    <span>{copiedLotCode ? '✓ დაკოპირდა!' : 'კოდის კოპირება'}</span>
                  </button>
                  <a
                    href="https://parking.tbilisi.gov.ge/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-gold text-slate-950 hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 shadow-md font-mono"
                  >
                    <ExternalLink size={13} />
                    <span>parking.tbilisi.gov.ge</span>
                  </a>
                </div>
              </div>

              {/* Timer Display & Cost Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                {/* Timer Display */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                    გასული დრო (Stopwatch):
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-gold drop-shadow-sm">
                    {formatTime(activeSession.elapsedSeconds)}
                  </div>
                  {parkingSession && (
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">
                      ვადა იწურება: <strong className="text-white">{formatTbilisiTime(parkingSession.expiresAt)}</strong>
                    </span>
                  )}
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
                        საფასური ({(activeSession.hourlyRateGel?.toFixed(2) || '—')} ₾/სთ)
                      </span>
                      <span className="text-3xl font-black font-mono text-white">
                        {activeSession.accumulatedCostGel.toFixed(2)} ₾
                      </span>
                    </div>
                  )}
                </div>

                {/* Stop & Complete Button */}
                <div className="flex flex-col justify-center">
                  <button
                    onClick={handleStopParking}
                    className="btn-stitch-rose w-full py-4 px-6 text-xs sm:text-sm font-black"
                  >
                    <Square size={16} className="fill-white" />
                    <span>სესიის დასრულება / შეჩერება</span>
                  </button>
                  <span className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                    შეხსენება და ტაიმერი გაითიშება
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Start Parking Control Center — სადა & მინიმალისტური დიზაინი */
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                    <Timer size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      ზონალური პარკირების დაწყება
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      თბილისი • ბათუმი • ქუთაისი
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ⏱️ 15 წთ უფასო
                  </span>
                  <GeorgianLicensePlate plate={vehicle.plate_number || 'FR-282-EE'} size="xs" variant="white" />
                </div>
              </div>

              {/* 1. City Selector — Sleek Minimalist Segmented Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
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
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs transition-all ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 font-medium'
                      }`}
                    >
                      {c.name_ge}
                    </button>
                  );
                })}
              </div>

              {/* 2. Zone Selector — Compact Horizontal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CITY_ZONES[selectedCity].map(z => {
                  const isSel = selectedZone === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedZone(z.id);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSel
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{z.name}</span>
                        <span className={`font-mono text-[11px] ${isSel ? 'text-amber-300' : 'text-slate-600'}`}>
                          {z.rate}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate mt-1 ${isSel ? 'text-slate-300' : 'text-slate-400'}`}>
                        {z.areas}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* 3. Address & Lot Input with Quick Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  საპარკინგე ლოტი ან მისამართი:
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={parkingLocationInput}
                    onChange={(e) => setParkingLocationInput(e.target.value)}
                    placeholder="ჩაწერეთ საპარკინგე ლოტი (#A1410) ან ქუჩა..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                  />
                </div>

                {/* Quick Chips (Understated & Minimalist) */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {CITY_QUICK_LOCATIONS[selectedCity].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setParkingLocationInput(loc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        parkingLocationInput === loc
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Sleek Minimalist Start Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartParking}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
                >
                  <Play size={16} className="text-amber-400 fill-amber-400" />
                  <span>პარკირების დაწყება</span>
                </button>
                <div className="text-[11px] text-center text-slate-500 mt-2 font-mono flex items-center justify-center gap-1.5 flex-wrap">
                  <span>ავტომობილი:</span>
                  <GeorgianLicensePlate plate={vehicle.plate_number || 'FR-282-EE'} size="xs" variant="white" />
                  <span>• პირველი 15 წუთი უფასოა</span>
                </div>
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

          {/* Official Municipal Operator Requirements Accordion */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowOperatorReqs(!showOperatorReqs)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center border border-gold/30 shrink-0">
                  <Building size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-black text-white">
                      {TBILISI_OPERATOR_REQUIREMENTS.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-gold/20 text-gold border border-gold/30">
                      TTC & მერია
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ოფიციალური მონაცემთა წყაროების, API-ებისა და ლიცენზირების ჩამონათვალი
                  </p>
                </div>
              </div>
              <button type="button" className="text-slate-400 hover:text-white p-2">
                {showOperatorReqs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {showOperatorReqs && (
              <div className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[11px] leading-relaxed">
                  ⚠️ <strong>იურიდიული დაცვა:</strong> მხოლოდ საიტზე (msmap / parking.tbilisi.gov.ge) ხილული ფენის არსებობა <strong>არ წარმოადგენს</strong> მონაცემთა კომერციული გამოყენების ნებართვას. AutoHub AI არ აჩვენებს დაუდასტურებელ „თავისუფალი ადგილების“ რაოდენობას და იყენებს მხოლოდ გადამოწმებულ ოფიციალურ ტარიფებს.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TBILISI_OPERATOR_REQUIREMENTS.items.map((req) => (
                    <div key={req.code} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-white text-xs">{req.label_ge}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                          req.priority === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : req.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {req.priority === 'critical' ? 'კრიტიკული' : req.priority === 'high' ? 'მაღალი' : 'საშუალო'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {req.description_ge}
                      </p>
                      <span className="text-[9px] font-mono text-slate-500 block pt-1">
                        კოდი: {req.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                            <img src={TBILISI_PARKING_LOGO_B64} alt="თბილისის პარკინგი" className="h-3.5 max-w-[60px] object-contain" />
                            <span className="text-[10px] font-bold text-navy">თბილისის პარკინგი</span>
                          </div>
                        ) : fine.city === 'batumi' ? (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                            <img src={BATUMI_PARKING_LOGO_B64} alt="ბათუმის ინსპექცია" className="h-3.5 max-w-[30px] object-contain" />
                            <span className="text-[10px] font-bold text-navy">ბათუმის ინსპექცია</span>
                          </div>
                        ) : fine.city === 'kutaisi' ? (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                            <img src={KUTAISI_PARKING_LOGO_B64} alt="ქუთაისის მერია" className="h-3.5 max-w-[30px] object-contain" />
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
                          <img src={TBILISI_PARKING_LOGO_B64} alt="თბილისის პარკინგი" className="h-3.5 max-w-[60px] object-contain" />
                          <span className="text-[10px] font-bold text-navy">თბილისის პარკინგი</span>
                        </div>
                      ) : permit.city === 'batumi' ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                          <img src={BATUMI_PARKING_LOGO_B64} alt="ბათუმის ინსპექცია" className="h-3.5 max-w-[30px] object-contain" />
                          <span className="text-[10px] font-bold text-navy">ბათუმის ინსპექცია</span>
                        </div>
                      ) : permit.city === 'kutaisi' ? (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                          <img src={KUTAISI_PARKING_LOGO_B64} alt="ქუთაისის მერია" className="h-3.5 max-w-[30px] object-contain" />
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

      {/* 4G OBD Real-time Stop Detection & Parking Confirmation Modal */}
      {!locationPicker && parkingSession && parkingSession.status === 'probable_stop' && (
        <ParkingConfirmationModal
          session={parkingSession}
          candidateLots={stopResult?.candidateLots || [parkingSession.lot]}
          isOpen={parkingSession.status === 'probable_stop'}
          onConfirm={(leadMin, customDuration) => {
            parkingSessionService.confirmParking(leadMin, customDuration);
          }}
          onDismiss={() => {
            parkingSessionService.dismissProbableStop();
          }}
          onSelectDifferentLot={(lot) => {
            parkingSessionService.updateSessionLot(lot);
          }}
        />
      )}

    </div>
  );
};

export default ParkingModule;
