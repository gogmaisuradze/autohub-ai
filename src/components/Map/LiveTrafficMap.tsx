import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPointType, MapReport, VehicleProfile } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { leafletLoader } from '../../services/leafletLoader';
import { loadCameras, getGeorgiaRegionName } from '../../services/cameraService';
import { mapDataService } from '../../services/mapDataService';
import { getPreferredLocation, watchPreferredLocation, LocationFix } from '../../services/locationService';
import AddReportModal from './AddReportModal';
import {
  Navigation,
  Compass,
  Plus,
  Shield,
  Camera,
  AlertTriangle,
  Fuel,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
  ThumbsUp,
  XCircle,
  Phone,
  Layers,
  MapPin,
  Car,
  RotateCcw,
  Zap,
  Wrench,
  Droplets,
  Cog,
  Lock,
  Unlock,
  MousePointerClick,
  ChevronDown,
  X,
  Construction,
  GitFork,
  ArrowUpRight
} from 'lucide-react';

export interface AlternativeRouteItem {
  id: string;
  title: string;
  corridor: string;
  causeType: 'traffic_jam' | 'road_repair';
  congestedName: string;
  congestedTimeMin: number;
  congestedDistKm: number;
  congestedDelayMin: number;
  congestedCoords: [number, number][];

  altName: string;
  altTimeMin: number;
  altDistKm: number;
  timeSavedMin: number;
  distSavedKm: number;
  altBypassStreets: string[];
  altCoords: [number, number][];

  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
}

export const ALTERNATIVE_ROUTES: AlternativeRouteItem[] = [
  {
    id: 'route-heroes-sq',
    title: 'გმირთა მოედანი ⇄ სანაპირო',
    corridor: 'ცენტრი · ვარაზისხევი / სანაპირო',
    causeType: 'traffic_jam',
    congestedName: 'კოსტავა → გმირთა მოედნის კვანძი → მარჯვენა სანაპირო',
    congestedTimeMin: 32,
    congestedDistKm: 4.9,
    congestedDelayMin: 18,
    congestedCoords: [
      [41.7010, 44.7920],
      [41.7065, 44.7880],
      [41.7120, 44.7820],
      [41.7170, 44.7860],
      [41.7230, 44.7880],
      [41.7280, 44.7850]
    ],
    altName: 'ვარაზისხევი → თამარაშვილი → გოთუას ქუჩა → სააკაძე',
    altTimeMin: 14,
    altDistKm: 3.8,
    timeSavedMin: 18,
    distSavedKm: 1.1,
    altBypassStreets: ['ვარაზისხევი', 'თამარაშვილის ქ.', 'გოთუას ქ.', 'სააკაძის დაღმართი', 'მტკვრის სანაპირო'],
    altCoords: [
      [41.7010, 44.7920],
      [41.7080, 44.7780],
      [41.7160, 44.7720],
      [41.7220, 44.7740],
      [41.7260, 44.7810],
      [41.7280, 44.7850]
    ],
    origin: { name: 'რუსთაველი / კოსტავა', lat: 41.7010, lng: 44.7920 },
    destination: { name: 'მტკვრის მარჯვენა სანაპირო', lat: 41.7280, lng: 44.7850 }
  },
  {
    id: 'route-tsereteli',
    title: 'წერეთლის გამზირი ⇄ დიდუბე',
    corridor: 'დიდუბე · რემონტის შემოვლა',
    causeType: 'road_repair',
    congestedName: 'წერეთლის გამზირის ცენტრი (1 ზოლიანი რემონტი)',
    congestedTimeMin: 38,
    congestedDistKm: 4.2,
    congestedDelayMin: 23,
    congestedCoords: [
      [41.7230, 44.7920],
      [41.7290, 44.7870],
      [41.7350, 44.7820],
      [41.7420, 44.7780],
      [41.7490, 44.7740]
    ],
    altName: 'აგლაძის ქუჩა → ელიავას შემოვლითი → მარცხენა სანაპირო',
    altTimeMin: 15,
    altDistKm: 3.5,
    timeSavedMin: 23,
    distSavedKm: 0.7,
    altBypassStreets: ['აგლაძის ქუჩა', 'ელიავას ბაზრობის შემოვლითი', 'მარცხენა სანაპირო', 'დიდუბის ხიდი'],
    altCoords: [
      [41.7230, 44.7920],
      [41.7260, 44.7830],
      [41.7330, 44.7770],
      [41.7410, 44.7730],
      [41.7490, 44.7740]
    ],
    origin: { name: 'წერეთლის დასაწყისი / დინამო', lat: 41.7230, lng: 44.7920 },
    destination: { name: 'დიდუბის მეტრო / ავტოსადგური', lat: 41.7490, lng: 44.7740 }
  },
  {
    id: 'route-chavchavadze',
    title: 'ჭავჭავაძის გამზირი ⇄ საბურთალო',
    corridor: 'ვაკე-საბურთალო · საცობის შემოვლა',
    causeType: 'traffic_jam',
    congestedName: 'ჭავჭავაძის გამზირი (შუქნიშნები & ავტობუსის ზოლი)',
    congestedTimeMin: 28,
    congestedDistKm: 5.1,
    congestedDelayMin: 15,
    congestedCoords: [
      [41.7090, 44.7780],
      [41.7100, 44.7670],
      [41.7105, 44.7570],
      [41.7150, 44.7480],
      [41.7220, 44.7420]
    ],
    altName: 'ფალიაშვილი / აბაშიძე → თამარაშვილი → უნივერსიტეტის ქუჩა',
    altTimeMin: 13,
    altDistKm: 3.9,
    timeSavedMin: 15,
    distSavedKm: 1.2,
    altBypassStreets: ['ფალიაშვილის ქ.', 'მიშველაძის ქ.', 'თამარაშვილის ქ.', 'უნივერსიტეტის ქ.'],
    altCoords: [
      [41.7090, 44.7780],
      [41.7070, 44.7680],
      [41.7120, 44.7520],
      [41.7180, 44.7460],
      [41.7220, 44.7420]
    ],
    origin: { name: 'ვაკის დასაწყისი / მრგვალი ბაღი', lat: 41.7090, lng: 44.7780 },
    destination: { name: 'დელისის კვანძი / ქავთარაძე', lat: 41.7220, lng: 44.7420 }
  },
  {
    id: 'route-digomi',
    title: 'აღმაშენებლის ხეივანი ⇄ დიღომი',
    corridor: 'დიღმის მასივი · მაგისტრალის შემოვლა',
    causeType: 'traffic_jam',
    congestedName: 'აღმაშენებლის ხეივნის ცენტრალური ტრასა (საცობი ქალაქიდან)',
    congestedTimeMin: 26,
    congestedDistKm: 6.2,
    congestedDelayMin: 14,
    congestedCoords: [
      [41.7640, 44.7750],
      [41.7720, 44.7710],
      [41.7810, 44.7660],
      [41.7920, 44.7610]
    ],
    altName: 'ლუბლიანას ქუჩა → ჩაჩავას ქუჩა → რობაქიძის გამზირი',
    altTimeMin: 12,
    altDistKm: 4.7,
    timeSavedMin: 14,
    distSavedKm: 1.5,
    altBypassStreets: ['რობაქიძის გამზ.', 'ბელიაშვილის ქ.', 'ლუბლიანას ქ.', 'ჩაჩავას ქ.'],
    altCoords: [
      [41.7640, 44.7750],
      [41.7700, 44.7800],
      [41.7780, 44.7760],
      [41.7870, 44.7680],
      [41.7920, 44.7610]
    ],
    origin: { name: 'რობაქიძის ხიდი', lat: 41.7640, lng: 44.7750 },
    destination: { name: 'თბილისის გასასვლელი / თბილისი მოლი', lat: 41.7920, lng: 44.7610 }
  },
  {
    id: 'route-kakheti',
    title: 'კახეთის გზატკეცილი ⇄ აეროპორტი',
    corridor: 'ისანი-სამგორი · აეროპორტის მიმართულება',
    causeType: 'traffic_jam',
    congestedName: 'სამგორის ესტაკადა → კახეთის გზატკეცილი (საცობი)',
    congestedTimeMin: 35,
    congestedDistKm: 11.5,
    congestedDelayMin: 17,
    congestedCoords: [
      [41.6910, 44.8520],
      [41.6880, 44.8680],
      [41.6820, 44.8900],
      [41.6750, 44.9200],
      [41.6690, 44.9540]
    ],
    altName: 'მოსკოვის გამზირი → სამგორის შემოვლითი გზატკეცილი',
    altTimeMin: 18,
    altDistKm: 9.6,
    timeSavedMin: 17,
    distSavedKm: 1.9,
    altBypassStreets: ['მოსკოვის გამზირი', 'აფრიკის დასახლების გზატკეცილი', 'აეროპორტის შემოვლა'],
    altCoords: [
      [41.6910, 44.8520],
      [41.6780, 44.8620],
      [41.6710, 44.8950],
      [41.6680, 44.9300],
      [41.6690, 44.9540]
    ],
    origin: { name: 'ისნის მეტრო / კვანძი', lat: 41.6910, lng: 44.8520 },
    destination: { name: 'თბილისის საერთაშორისო აეროპორტი', lat: 41.6690, lng: 44.9540 }
  },
  {
    id: 'route-rikoti',
    title: 'რიკოთის უღელტეხილი (რემონტის შემოვლა)',
    corridor: 'აღმოსავლეთ-დასავლეთ მაგისტრალი E60',
    causeType: 'road_repair',
    congestedName: 'ძველი რიკოთის გზა (სამშენებლო შეზღუდვები, 1 ზოლი)',
    congestedTimeMin: 55,
    congestedDistKm: 28.0,
    congestedDelayMin: 25,
    congestedCoords: [
      [42.0450, 43.4600],
      [42.0520, 43.4750],
      [42.0620, 43.4860],
      [42.0720, 43.5020],
      [42.0800, 43.5250]
    ],
    altName: 'ახალი ჩქაროსნული ავტობანი & გვირაბი (უბისა-ხევი)',
    altTimeMin: 30,
    altDistKm: 24.2,
    timeSavedMin: 25,
    distSavedKm: 3.8,
    altBypassStreets: ['ახალი რიკოთის ჩქაროსნული გვირაბი', 'უბისას ესტაკადა', 'ხევის ახალი მონაკვეთი'],
    altCoords: [
      [42.0450, 43.4600],
      [42.0550, 43.4720],
      [42.0650, 43.4900],
      [42.0750, 43.5100],
      [42.0800, 43.5250]
    ],
    origin: { name: 'სურამი / რიკოთის დასაწყისი', lat: 42.0450, lng: 43.4600 },
    destination: { name: 'ზესტაფონი / რიკოთის გასასვლელი', lat: 42.0800, lng: 43.5250 }
  }
];

export const INITIAL_TRAFFIC_JAMS: MapReport[] = [
  {
    id: 'jam-1',
    type: 'traffic_jam',
    title: 'გმირთა მოედანი / ვარაზისხევი',
    description: 'მძიმე საცობი პიკის საათში. მოძრაობა შენელებულია 6 კმ/სთ-მდე. რეკომენდებულია ალტერნატიული მოკლე გზა.',
    lat: 41.7120,
    lng: 44.7820,
    timestamp: Date.now() - 1000 * 60 * 12,
    confirmations: 24,
    delay_minutes: 18,
    severity: 'heavy',
    alternativeRouteId: 'route-heroes-sq',
    active: true
  },
  {
    id: 'jam-2',
    type: 'traffic_jam',
    title: 'წერეთლის გამზირი (გამოფენასთან)',
    description: 'გადატვირთული მოძრაობა და შეფერხება. შეფერხება +22 წთ. სიჩქარე: ~5 კმ/სთ.',
    lat: 41.7340,
    lng: 44.7830,
    timestamp: Date.now() - 1000 * 60 * 8,
    confirmations: 31,
    delay_minutes: 22,
    severity: 'heavy',
    alternativeRouteId: 'route-tsereteli',
    active: true
  },
  {
    id: 'jam-3',
    type: 'traffic_jam',
    title: 'ჭავჭავაძის გამზირი (ვაკის პარკი)',
    description: 'ნელი მოძრაობა შუქნიშნების კვანძზე, დაგვიანება +14 წთ.',
    lat: 41.7100,
    lng: 44.7620,
    timestamp: Date.now() - 1000 * 60 * 15,
    confirmations: 18,
    delay_minutes: 14,
    severity: 'moderate',
    alternativeRouteId: 'route-chavchavadze',
    active: true
  },
  {
    id: 'jam-4',
    type: 'traffic_jam',
    title: 'მარჯვენა სანაპირო (იუსტიციის სახლთან)',
    description: 'საცობი სანაპიროზე, მოძრაობა შეფერხებულია მშრალი ხიდის მიმართულებით.',
    lat: 41.6980,
    lng: 44.8050,
    timestamp: Date.now() - 1000 * 60 * 20,
    confirmations: 15,
    delay_minutes: 16,
    severity: 'heavy',
    alternativeRouteId: 'route-heroes-sq',
    active: true
  },
  {
    id: 'jam-5',
    type: 'traffic_jam',
    title: 'კახეთის გზატკეცილი (სამგორი)',
    description: 'სატრანსპორტო ნაკადის შეფერხება აეროპორტის მიმართულებით, +12 წთ.',
    lat: 41.6880,
    lng: 44.8650,
    timestamp: Date.now() - 1000 * 60 * 25,
    confirmations: 12,
    delay_minutes: 12,
    severity: 'moderate',
    alternativeRouteId: 'route-kakheti',
    active: true
  },
  {
    id: 'jam-6',
    type: 'traffic_jam',
    title: 'აღმაშენებლის ხეივანი (დიღომი)',
    description: 'საცობი ქალაქიდან გასასვლელში, საშუალო შეფერხება +11 წთ.',
    lat: 41.7780,
    lng: 44.7670,
    timestamp: Date.now() - 1000 * 60 * 18,
    confirmations: 16,
    delay_minutes: 11,
    severity: 'moderate',
    alternativeRouteId: 'route-digomi',
    active: true
  },
  {
    id: 'jam-7',
    type: 'traffic_jam',
    title: 'ბათუმი · გოგოლის ქუჩა (შემოსასვლელი)',
    description: 'მძიმე საცობი ბათუმის ცენტრისკენ მიმავალ ზოლზე, +14 წთ.',
    lat: 41.6420,
    lng: 41.6580,
    timestamp: Date.now() - 1000 * 60 * 30,
    confirmations: 19,
    delay_minutes: 14,
    severity: 'heavy',
    active: true
  }
];

export const INITIAL_ROAD_REPAIRS: MapReport[] = [
  {
    id: 'repair-1',
    type: 'road_repair',
    title: 'წერეთლის გამზირის კაპიტალური რეაბილიტაცია',
    description: 'მიმდინარეობს ასფალტის დაგება & მიწისქვეშა კომუნიკაციები. სავალი ნაწილი შევიწროებულია 1 ზოლამდე.',
    lat: 41.7310,
    lng: 44.7860,
    timestamp: Date.now() - 1000 * 60 * 45,
    confirmations: 42,
    road_repair_kind: 'ასფალტის დაგება & მილები',
    delay_minutes: 24,
    alternativeRouteId: 'route-tsereteli',
    active: true
  },
  {
    id: 'repair-2',
    type: 'road_repair',
    title: 'მელიქიშვილის გამზირი / კოსტავა',
    description: 'საგზაო საფარის რეკონსტრუქცია და ბორდიურების მოწყობა, მოძრაობა შეზღუდულია.',
    lat: 41.7080,
    lng: 44.7860,
    timestamp: Date.now() - 1000 * 60 * 60,
    confirmations: 28,
    road_repair_kind: 'საგზაო საფარი',
    delay_minutes: 16,
    alternativeRouteId: 'route-heroes-sq',
    active: true
  },
  {
    id: 'repair-3',
    type: 'road_repair',
    title: 'ვაჟა-ფშაველას გამზირი (VII კვარტალი)',
    description: 'წყალმომარაგების მილების გამოცვლა. მარჯვენა ზოლი გადაკეტილია.',
    lat: 41.7220,
    lng: 44.7380,
    timestamp: Date.now() - 1000 * 60 * 90,
    confirmations: 21,
    road_repair_kind: 'მილების გამოცვლა',
    delay_minutes: 10,
    alternativeRouteId: 'route-chavchavadze',
    active: true
  },
  {
    id: 'repair-4',
    type: 'road_repair',
    title: 'დიღმის მასივი · ბელიაშვილის ქუჩა',
    description: 'გზის საფარის ფრეზირება და ახალი ასფალტის დაგება.',
    lat: 41.7740,
    lng: 44.7760,
    timestamp: Date.now() - 1000 * 60 * 110,
    confirmations: 17,
    road_repair_kind: 'ფრეზირება & ასფალტი',
    delay_minutes: 14,
    alternativeRouteId: 'route-digomi',
    active: true
  },
  {
    id: 'repair-5',
    type: 'road_repair',
    title: 'რიკოთის უღელტეხილი (ხევი-უბისა)',
    description: 'ახალი ჩქაროსნული ავტობანისა და გვირაბების სამშენებლო სამუშაოები. მოქმედებს დროებითი შემოვლა.',
    lat: 42.0620,
    lng: 43.4860,
    timestamp: Date.now() - 1000 * 60 * 140,
    confirmations: 55,
    road_repair_kind: 'ავტობანის მშენებლობა',
    delay_minutes: 25,
    alternativeRouteId: 'route-rikoti',
    active: true
  },
  {
    id: 'repair-6',
    type: 'road_repair',
    title: 'ბათუმი · ჭავჭავაძის ქუჩა',
    description: 'სანიაღვრე ქსელის მშენებლობა, სავალი ნაწილი შევიწროებულია.',
    lat: 41.6440,
    lng: 41.6360,
    timestamp: Date.now() - 1000 * 60 * 80,
    confirmations: 14,
    road_repair_kind: 'სანიაღვრე ქსელი',
    delay_minutes: 12,
    active: true
  }
];

interface Props {
  vehicle?: VehicleProfile;
}

export interface CompanyBrandData {
  brandName: string;
  categoryLabel: string;
  categoryBadgeClass: string;
  phone?: string;
  website?: string;
  logoSvg: string;
}

export function getCompanyBrandData(item: MapReport): CompanyBrandData {
  const brandRaw = (item.brand || '').trim();
  const titleRaw = (item.title || '').trim();
  const combined = `${brandRaw} ${titleRaw}`.toLowerCase();

  // 1. FUEL STATIONS
  if (item.type === 'fuel' || combined.includes('fuel') || combined.includes('გასამართ') || combined.includes('ბენზინ') || combined.includes('wissol') || combined.includes('gulf') || combined.includes('rompetrol') || combined.includes('socar') || combined.includes('lukoil') || combined.includes('portal')) {
    if (combined.includes('wissol') || combined.includes('ვისოლ')) {
      return {
        brandName: 'Wissol • ვისოლი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-amber-100 text-amber-950 border border-amber-300',
        phone: item.phone || '*2000',
        website: item.website || 'https://wissol.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#F36F21"/><path d="M6 10L13 28L18 15L23 28L30 10H24.5L21 21.5L18 13.5L15 21.5L11.5 10H6Z" fill="#FFFFFF"/><circle cx="18" cy="8" r="2.2" fill="#FFE500"/></svg>`
      };
    }
    if (combined.includes('gulf') || combined.includes('გალფ') || combined.includes('sun petroleum')) {
      return {
        brandName: 'Gulf • გალფი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-orange-100 text-orange-950 border border-orange-300',
        phone: item.phone || '*0007',
        website: item.website || 'https://gulf.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><circle cx="18" cy="18" r="17" fill="#002D62" stroke="#FF5F00" stroke-width="2"/><ellipse cx="18" cy="18" rx="13" ry="10" fill="#FF5F00"/><text x="18" y="21.5" font-family="Arial, sans-serif" font-weight="900" font-size="9" fill="#FFFFFF" text-anchor="middle">Gulf</text></svg>`
      };
    }
    if (combined.includes('rompetrol') || combined.includes('რომპეტროლ')) {
      return {
        brandName: 'Rompetrol • რომპეტროლი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-rose-100 text-rose-950 border border-rose-300',
        phone: item.phone || '032 291 07 27',
        website: item.website || 'https://rompetrol.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#E30613"/><circle cx="18" cy="18" r="8" fill="#FFED00"/><circle cx="18" cy="18" r="3.5" fill="#1C1917"/></svg>`
      };
    }
    if (combined.includes('socar') || combined.includes('სოკარ')) {
      return {
        brandName: 'SOCAR • სოკარი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-sky-100 text-sky-950 border border-sky-300',
        phone: item.phone || '*0001',
        website: item.website || 'https://socar.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#004B87"/><path d="M18 5C18 5 10 15 10 22C10 26.5 13.5 30 18 30C22.5 30 26 26.5 26 22C26 15 18 5 18 5Z" fill="#00A859"/><circle cx="18" cy="21" r="3.5" fill="#FFFFFF"/></svg>`
      };
    }
    if (combined.includes('lukoil') || combined.includes('ლუკოილ')) {
      return {
        brandName: 'Lukoil • ლუკოილი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-red-100 text-red-950 border border-red-300',
        phone: item.phone || '032 238 00 00',
        website: item.website || 'https://lukoil.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#E30613"/><path d="M18 7C18 7 11 16 11 22C11 26 14 29 18 29C22 29 25 26 25 22C25 16 18 7 18 7Z" fill="#FFFFFF"/></svg>`
      };
    }
    if (combined.includes('portal') || combined.includes('პორტალ')) {
      return {
        brandName: 'Portal • პორტალი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-purple-100 text-purple-950 border border-purple-300',
        phone: item.phone || '032 249 00 00',
        website: item.website || 'https://portal.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#3B0764"/><circle cx="18" cy="18" r="10" fill="none" stroke="#F59E0B" stroke-width="2.5"/><circle cx="18" cy="18" r="4.5" fill="#F59E0B"/></svg>`
      };
    }
    if (combined.includes('connect') || combined.includes('ქონექთ')) {
      return {
        brandName: 'Connect • ქონექთი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-teal-100 text-teal-950 border border-teal-300',
        phone: item.phone,
        website: item.website,
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#0D9488"/><circle cx="13" cy="18" r="4" fill="#FFFFFF"/><circle cx="23" cy="18" r="4" fill="#FEF08A"/><line x1="13" y1="18" x2="23" y2="18" stroke="#FFFFFF" stroke-width="2"/></svg>`
      };
    }
    return {
      brandName: item.brand || item.title || 'ავტოგასამართი სადგური',
      categoryLabel: '⛽ ავტოგასამართი',
      categoryBadgeClass: 'bg-emerald-100 text-emerald-950 border border-emerald-300',
      phone: item.phone,
      website: item.website,
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#15803D"/><path d="M10 11H22V27H10V11Z" fill="#FFFFFF"/><path d="M23 15H25C26 15 27 16 27 17V24" stroke="#FFFFFF" stroke-width="2"/><circle cx="16" cy="16" r="2.5" fill="#15803D"/></svg>`
    };
  }

  // 2. EV CHARGING STATIONS
  if (item.type === 'charging' || combined.includes('charg') || combined.includes('დამტენ') || combined.includes('ev ')) {
    if (combined.includes('space') || combined.includes('სპეის')) {
      return {
        brandName: 'E-Space • ი-სპეისი',
        categoryLabel: '⚡ EV დამტენი',
        categoryBadgeClass: 'bg-teal-100 text-teal-950 border border-teal-300',
        phone: item.phone || '032 205 22 55',
        website: item.website || 'https://e-space.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#0891B2"/><path d="M20 5L10 19H17L14 31L26 15H19L22 5H20Z" fill="#A3E635"/></svg>`
      };
    }
    if (combined.includes('martev') || combined.includes('მარტივ')) {
      return {
        brandName: 'martEV • მარტივი',
        categoryLabel: '⚡ EV დამტენი',
        categoryBadgeClass: 'bg-emerald-100 text-emerald-950 border border-emerald-300',
        phone: item.phone,
        website: item.website,
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#15803D"/><path d="M19 6L11 18H17L15 30L25 15H18L21 6H19Z" fill="#FFFFFF"/></svg>`
      };
    }
    if (combined.includes('tesla') || combined.includes('ტესლა')) {
      return {
        brandName: 'Tesla Supercharger',
        categoryLabel: '⚡ Supercharger',
        categoryBadgeClass: 'bg-red-100 text-red-950 border border-red-300',
        phone: item.phone,
        website: item.website || 'https://tesla.com',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#E11D48"/><path d="M8 12C14 10 22 10 28 12L27 15C22 13 14 13 9 15L8 12ZM18 16V30H15V17C12 17 9 17.5 7 18.5L6 16C10 14.5 15 14 18 14C21 14 26 14.5 30 16L29 18.5C27 17.5 24 17 21 17V30H18V16Z" fill="#FFFFFF"/></svg>`
      };
    }
    return {
      brandName: item.brand || item.title || 'EV დამტენი სადგური',
      categoryLabel: '⚡ EV დამტენი',
      categoryBadgeClass: 'bg-teal-100 text-teal-950 border border-teal-300',
      phone: item.phone,
      website: item.website,
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#0D9488"/><path d="M19 6L11 18H17L15 30L25 15H18L21 6H19Z" fill="#FFFFFF"/></svg>`
    };
  }

  // 3. SERVICE & AUTO PARTS BRANDS
  if (item.type === 'service' || item.type === 'parts' || combined.includes('service') || combined.includes('სერვის') || combined.includes('ნაწილ') || combined.includes('tegeta') || combined.includes('amboli')) {
    if (combined.includes('tegeta') || combined.includes('თეგეტა')) {
      return {
        brandName: 'Tegeta Motors • თეგეტა',
        categoryLabel: '🔧 ავტოსერვისი & ნაწილები',
        categoryBadgeClass: 'bg-blue-100 text-blue-950 border border-blue-300',
        phone: item.phone || '032 226 44 44',
        website: item.website || 'https://tegetamotors.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#0F172A"/><path d="M7 10H29V14H21V28H15V14H7V10Z" fill="#EF4444"/><circle cx="18" cy="7" r="2" fill="#3B82F6"/></svg>`
      };
    }
    if (combined.includes('amboli') || combined.includes('ამბოლ')) {
      return {
        brandName: 'Amboli • ამბოლი',
        categoryLabel: '🔩 ავტონაწილები & სერვისი',
        categoryBadgeClass: 'bg-red-100 text-red-950 border border-red-300',
        phone: item.phone || '032 215 40 40',
        website: item.website || 'https://amboli.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#DC2626"/><path d="M18 7L27 28H22L20 22H16L14 28H9L18 7ZM17 15L16.5 18H19.5L19 15L18 11.5L17 15Z" fill="#FFFFFF"/></svg>`
      };
    }
    if (combined.includes('vianor') || combined.includes('ვიანორ')) {
      return {
        brandName: 'Vianor • ვიანორი',
        categoryLabel: '🛞 საბურავები & სერვისი',
        categoryBadgeClass: 'bg-orange-100 text-orange-950 border border-orange-300',
        phone: item.phone,
        website: item.website || 'https://vianor.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#EA580C"/><text x="18" y="24" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">V</text></svg>`
      };
    }
    if (combined.includes('würth') || combined.includes('ვიურტ')) {
      return {
        brandName: 'Würth Georgia • ვიურტი',
        categoryLabel: '🔩 ინსტრუმენტები & ნაწილები',
        categoryBadgeClass: 'bg-red-100 text-red-950 border border-red-300',
        phone: item.phone,
        website: item.website || 'https://wuerth.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#DC2626"/><circle cx="14" cy="18" r="4.5" fill="#FFFFFF"/><circle cx="22" cy="18" r="4.5" fill="#FFFFFF"/></svg>`
      };
    }
    return {
      brandName: item.brand || item.title || (item.type === 'parts' ? 'ავტონაწილები' : 'ავტოსერვისი'),
      categoryLabel: item.type === 'parts' ? '🔩 ავტონაწილები' : '🔧 ავტოსერვისი',
      categoryBadgeClass: item.type === 'parts' ? 'bg-purple-100 text-purple-950 border border-purple-300' : 'bg-indigo-100 text-indigo-950 border border-indigo-300',
      phone: item.phone,
      website: item.website,
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#4338CA"/><path d="M14.7 9.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-4.5 4.5a2 2 0 01-2.8-2.8l4.5-4.5a6 6 0 017.94-7.94l-3.76 3.76z" fill="#FFFFFF"/></svg>`
    };
  }

  // 4. PARKING (Municipal / Official)
  if (item.type === 'parking' || combined.includes('parking') || combined.includes('პარკინგ')) {
    return {
      brandName: item.code ? `თბილისის პარკინგი #${item.code}` : 'მუნიციპალური პარკინგი',
      categoryLabel: '🅿️ საპარკინგე ზონა',
      categoryBadgeClass: 'bg-blue-100 text-blue-950 border border-blue-300',
      phone: item.phone || '032 293 44 44',
      website: item.website || 'https://parking.tbilisi.gov.ge',
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#1A73E8"/><text x="18" y="26" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle">P</text></svg>`
    };
  }

  // 5. RADAR & POLICE
  if (item.type === 'radar' || item.type === 'patrol') {
    return {
      brandName: item.type === 'patrol' ? 'შსს საპატრულო პოლიცია' : (item.speed_limit_kmh ? `სიჩქარის რადარი · ${item.speed_limit_kmh} კმ/სთ` : 'საგზაო კამერა / რადარი'),
      categoryLabel: item.type === 'patrol' ? '🚓 საპატრულო ეკიპაჟი' : '📷 სიჩქარის კონტროლი',
      categoryBadgeClass: 'bg-indigo-100 text-indigo-950 border border-indigo-300',
      phone: '112 / 032 241 42 42',
      website: 'https://police.ge',
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#1E3A8A"/><path d="M18 6L26 9.5V17C26 22.5 22.5 26.5 18 29C13.5 26.5 10 22.5 10 17V9.5L18 6Z" fill="#2563EB" stroke="#F59E0B" stroke-width="1.5"/><path d="M18 11.5L19.5 15.2L23.5 15.5L20.4 18L21.5 22L18 19.8L14.5 22L15.6 18L12.5 15.5L16.5 15.2L18 11.5Z" fill="#F59E0B"/></svg>`
    };
  }

  // 6. SHOWROOM / DEALERS
  if (item.type === 'showroom' || combined.includes('mercedes') || combined.includes('bmw') || combined.includes('toyota') || combined.includes('audi') || combined.includes('hyundai') || combined.includes('ford') || combined.includes('porsche')) {
    const matchedBrand =
      combined.includes('bmw') ? 'BMW' :
      combined.includes('mercedes') ? 'Mercedes-Benz' :
      combined.includes('toyota') ? 'Toyota' :
      combined.includes('audi') ? 'Audi' :
      combined.includes('hyundai') ? 'Hyundai' :
      combined.includes('porsche') ? 'Porsche' :
      combined.includes('ford') ? 'Ford' :
      (item.brand || 'ავტოსალონი');
    return {
      brandName: `${matchedBrand} • ოფიციალური დილერი`,
      categoryLabel: '🏢 ავტოსალონი',
      categoryBadgeClass: 'bg-slate-100 text-slate-950 border border-slate-300',
      phone: item.phone,
      website: item.website,
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#18181B"/><circle cx="18" cy="18" r="11" fill="none" stroke="#F59E0B" stroke-width="2"/><text x="18" y="22" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#F59E0B" text-anchor="middle">★</text></svg>`
    };
  }

  // 7. CAR WASH / JAMS / REPAIR / HAZARDS
  const fallbackIcons: Record<string, { label: string; bg: string; color: string; icon: string }> = {
    car_wash: { label: '🧼 ავტოსამრეცხაო', bg: 'bg-sky-100 text-sky-950 border border-sky-300', color: '#0284C7', icon: '🧼' },
    traffic_jam: { label: '🔴 საგზაო საცობი', bg: 'bg-rose-100 text-rose-950 border border-rose-300', color: '#E11D48', icon: '🔴' },
    road_repair: { label: '🚧 საგზაო სამუშაოები', bg: 'bg-amber-100 text-amber-950 border border-amber-300', color: '#D97706', icon: '🚧' },
    hazard: { label: '⚠️ საგზაო საფრთხე', bg: 'bg-red-100 text-red-950 border border-red-300', color: '#DC2626', icon: '⚠️' }
  };
  const fb = fallbackIcons[item.type] || { label: item.title, bg: 'bg-slate-100 text-slate-800 border border-slate-300', color: '#475569', icon: '📍' };

  return {
    brandName: item.brand || item.title || 'საგზაო ობიექტი',
    categoryLabel: fb.label,
    categoryBadgeClass: fb.bg,
    phone: item.phone,
    website: item.website,
    logoSvg: `<div class="w-full h-full flex items-center justify-center text-base bg-slate-50">${fb.icon}</div>`
  };
}

export const LiveTrafficMap: React.FC<Props> = ({ vehicle }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);
  const darkLayerRef = useRef<any>(null);
  const satLayerRef = useRef<any>(null);
  const routesLayerRef = useRef<any>(null);

  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState<boolean>(false);
  const [activeRouteId, setActiveRouteId] = useState<string>('route-heroes-sq');

  const [mapTheme, setMapTheme] = useState<'dark' | 'street' | 'satellite'>(() => {
    try {
      const saved = localStorage.getItem('autohub_map_theme');
      if (saved === 'dark' || saved === 'street' || saved === 'satellite') return saved;
    } catch {}
    return 'street';
  });

  const handleThemeChange = (newTheme: 'dark' | 'street' | 'satellite') => {
    sounds.playClick();
    setMapTheme(newTheme);
    try {
      localStorage.setItem('autohub_map_theme', newTheme);
    } catch {}
  };
  const [cameraStatus, setCameraStatus] = useState('მონაცემები იტვირთება…');
  const [reports, setReports] = useState<MapReport[]>([]);
  const [communityReports, setCommunityReports] = useState<MapReport[]>([]);
  const [backendPois, setBackendPois] = useState<MapReport[]>([]);
  const [filterType, setFilterType] = useState<MapPointType | 'all' | 'none'>('radar');
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFix, setLocationFix] = useState<LocationFix | null>(null);
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [activeReportCount, setActiveReportCount] = useState(0);
  const [mapRevision, setMapRevision] = useState(0);
  const [activeMapView, setActiveMapView] = useState<'autohub_map' | 'waze_live'>('autohub_map');
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Map Scroll & Zoom Isolation states (Prevents trapping page scroll on wheel or touch)
  const [isMapUnlocked, setIsMapUnlocked] = useState<boolean>(false);
  const isMapUnlockedRef = useRef<boolean>(false);
  const [showMapGestureHint, setShowMapGestureHint] = useState<boolean>(false);
  const mapGestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTwoFingerOverlay, setShowTwoFingerOverlay] = useState<boolean>(false);
  const twoFingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleMapLock = useCallback(() => {
    sounds.playClick();
    setIsMapUnlocked(prev => {
      const next = !prev;
      isMapUnlockedRef.current = next;
      if (mapInstanceRef.current) {
        if (next) {
          mapInstanceRef.current.scrollWheelZoom.enable();
        } else {
          mapInstanceRef.current.scrollWheelZoom.disable();
        }
      }
      return next;
    });
  }, []);

  const handleScrollPastMap = useCallback(() => {
    sounds.playClick();
    setIsMapUnlocked(false);
    isMapUnlockedRef.current = false;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.scrollWheelZoom.disable();
    }
    const nextSection =
      document.getElementById('live-map-bottom-section') ||
      document.getElementById('map-search-categories') ||
      document.querySelector('.neu-card');
    if (nextSection) {
      const stickyHeaderEl = document.getElementById('sticky-header');
      const headerHeight = stickyHeaderEl ? stickyHeaderEl.getBoundingClientRect().height : 100;
      const rect = nextSection.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = Math.max(0, rect.top + currentScrollY - headerHeight - 12);
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    } else {
      window.scrollBy({ top: 480, behavior: 'smooth' });
    }
  }, []);

  // Exit interactive map mode on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mapContainerRef.current && !mapContainerRef.current.contains(e.target as Node)) {
        if (isMapUnlockedRef.current) {
          setIsMapUnlocked(false);
          isMapUnlockedRef.current = false;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.scrollWheelZoom.disable();
          }
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMapUnlockedRef.current) {
        setIsMapUnlocked(false);
        isMapUnlockedRef.current = false;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.scrollWheelZoom.disable();
        }
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 1. Ensure Leaflet is loaded independently and reliably
  useEffect(() => {
    let isMounted = true;
    leafletLoader.load()
      .then(() => {
        if (isMounted) setIsLeafletReady(true);
      })
      .catch((err) => {
        if (isMounted) setMapLoadError(err?.message || 'რუკის ჩატვირთვა ვერ მოხერხდა.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => { setActiveReportCount(reports.length); }, [reports]);

  // Sync combined reports from community (n8n) and backend POIs
  useEffect(() => {
    if (filterType === 'none' && !searchQuery.trim()) {
      setReports([]);
      return;
    }
    const comm = communityReports.filter(r => !/^(radar-[1-3]|patrol-[1-3]|hazard-[1-2])$/.test(r.id));
    const seen = new Set<string>();
    const merged: MapReport[] = [];
    for (const p of [...INITIAL_TRAFFIC_JAMS, ...INITIAL_ROAD_REPAIRS, ...comm, ...backendPois]) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
    setReports(merged);
  }, [communityReports, backendPois, filterType, searchQuery]);

  // Viewport POI fetcher (queries standalone backend based on map bbox)
  const fetchViewportPois = useCallback(async (currentFilter: MapPointType | 'all' | 'none') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentFilter === 'none') {
      setBackendPois([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const ac = new AbortController();
    abortControllerRef.current = ac;

    try {
      let bbox: [number, number, number, number] | undefined;
      const bounds = map.getBounds();
      if (bounds && bounds.isValid && bounds.isValid() && bounds.getWest() !== bounds.getEast()) {
        const padded = bounds.pad(0.15);
        bbox = [
          padded.getWest(),
          padded.getSouth(),
          padded.getEast(),
          padded.getNorth()
        ];
      }

      const pois = await mapDataService.fetchPois({
        filterType: currentFilter,
        bbox,
        limit: 350,
        signal: ac.signal
      });

      if (!ac.signal.aborted) {
        setBackendPois(pois);
        const modeLabel = mapDataService.isStaticMode() ? 'სტატიკური ბაზა' : 'Live API';
        setCameraStatus(`🟢 AutoHub Map (${modeLabel}) • ${pois.length} ობიექტი ეკრანზე • 9 000+ ბაზაში`);
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn('Backend POIs viewport query error:', e);
      }
    }
  }, []);

  // 2. Fetch Initial Reports & Check Backend on Mount
  useEffect(() => {
    loadReports();
  }, []);

  // Update POIs on map movement or filter change
  useEffect(() => {
    if (mapInstanceRef.current && isLeafletReady) {
      fetchViewportPois(filterType);
    }
  }, [filterType, mapRevision, isLeafletReady, fetchViewportPois]);

  const loadReports = async () => {
    setIsRefreshing(true);
    try {
      let reportTimeout: ReturnType<typeof setTimeout>;
      const communityRequest = Promise.race([
        n8nService.getReports(),
        new Promise<MapReport[]>((_, reject) => { reportTimeout = setTimeout(() => reject(new Error('Reports timeout')), 10000); })
      ]).finally(() => clearTimeout(reportTimeout));

      const [community, isBackendHealthy, fallbackCameras] = await Promise.allSettled([
        communityRequest,
        mapDataService.checkHealth(),
        loadCameras()
      ]);

      const points = community.status === 'fulfilled' ? community.value : [];
      setCommunityReports(points);

      const backendAlive = isBackendHealthy.status === 'fulfilled' && isBackendHealthy.value;
      if (backendAlive) {
        const modeLabel = mapDataService.isStaticMode() ? 'სტატიკური ბაზა' : 'Live API';
        setCameraStatus(`🟢 AutoHub Map აქტიურია (${modeLabel}) • 9 000+ ობიექტი (OSM & მუნიციპალური პარკინგი)`);
        if (filterType !== 'none') {
          if (mapInstanceRef.current) {
            fetchViewportPois(filterType);
          }
        } else {
          setBackendPois([]);
        }
      } else {
        // Fallback to local cameras dataset if standalone server is not running
        const cameraPoints = fallbackCameras.status === 'fulfilled' ? fallbackCameras.value.reports : [];
        if (fallbackCameras.status === 'fulfilled') {
          const date = new Date(fallbackCameras.value.updatedAt).toLocaleString('ka-GE');
          setCameraStatus(`🟡 ლოკალური რეჟიმი (${cameraPoints.length} კამერა) • სერვერი: npm run map:server`);
          setBackendPois(cameraPoints);
        } else {
          setCameraStatus('კამერების ფაილი ვერ ჩაიტვირთა — სცადეთ განახლება.');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. Initialize Map once Leaflet is ready
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Default center: Tbilisi Freedom Square / Rustaveli
    const tbilisiLat = 41.7151;
    const tbilisiLng = 44.8271;

    const map = L.map(mapContainerRef.current, {
      center: [tbilisiLat, tbilisiLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      scrollWheelZoom: false, // Disable accidental wheel scroll hijacking
      closePopupOnClick: false // Keep popup on the pin open when clicking or dragging the map!
    });

    // Cooperative wheel gesture handler: Ctrl/Cmd + wheel allows zoom; normal wheel scrolls the webpage
    const domEl = mapContainerRef.current;
    const onMapWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || isMapUnlockedRef.current) {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
        setShowMapGestureHint(true);
        if (mapGestureTimerRef.current) clearTimeout(mapGestureTimerRef.current);
        mapGestureTimerRef.current = setTimeout(() => {
          setShowMapGestureHint(false);
        }, 1600);
      }
    };

    // 2-finger touch handler: 1 finger scrolls page, 2 fingers drag/zoom map
    const onMapTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && !isMapUnlockedRef.current) {
        map.dragging.disable();
        setShowTwoFingerOverlay(true);
        if (twoFingerTimerRef.current) clearTimeout(twoFingerTimerRef.current);
        twoFingerTimerRef.current = setTimeout(() => setShowTwoFingerOverlay(false), 1600);
      } else if (e.touches.length >= 2 || isMapUnlockedRef.current) {
        map.dragging.enable();
        map.touchZoom.enable();
        setShowTwoFingerOverlay(false);
      }
    };

    const onMapTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 || isMapUnlockedRef.current) {
        map.dragging.enable();
        map.touchZoom.enable();
        setShowTwoFingerOverlay(false);
      }
    };

    const onMapTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        setShowTwoFingerOverlay(false);
        map.dragging.enable();
      }
    };

    if (domEl) {
      domEl.addEventListener('wheel', onMapWheel, { passive: true });
      domEl.addEventListener('touchstart', onMapTouchStart, { passive: true });
      domEl.addEventListener('touchmove', onMapTouchMove, { passive: true });
      domEl.addEventListener('touchend', onMapTouchEnd, { passive: true });
    }

    map.on('moveend', () => setMapRevision(v => v + 1));

    // Pre-create and cache all 3 tile layers for instant, lag-free switching
    // 1. OpenStreetMap standard tiles (100% reliable)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    });
    osmLayerRef.current = osmLayer;

    // 2. CartoDB Dark Matter (true native dark theme, sleek slate/navy, zero CSS filter lag)
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    });
    darkLayerRef.current = darkLayer;

    // 3. Google Hybrid (crystal clear satellite + road & street name overlays in Georgian!)
    const satLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: 'Map data &copy; Google'
    });
    satLayerRef.current = satLayer;

    // Attach initial layer
    const initialLayer = mapTheme === 'dark' ? darkLayer : mapTheme === 'satellite' ? satLayer : osmLayer;
    initialLayer.addTo(map);
    initialLayer.bringToBack();
    if (mapContainerRef.current) {
      mapContainerRef.current.classList.remove('dark-map-tiles');
      if (mapTheme === 'dark') {
        mapContainerRef.current.style.backgroundColor = '#12161f';
      } else if (mapTheme === 'satellite') {
        mapContainerRef.current.style.backgroundColor = '#000000';
      } else {
        mapContainerRef.current.style.backgroundColor = '#f8fafc';
      }
    }

    // Zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Group layer for all reports
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Group layer for alternative routes polylines
    const routesLayer = L.layerGroup().addTo(map);
    routesLayerRef.current = routesLayer;

    mapInstanceRef.current = map;

    // Map Click handler - allows placing a point directly by clicking
    map.on('click', (e: any) => {
      setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Invalidate size after render to prevent grey/empty tile glitch
    const t1 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 50);
    const t2 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 180);
    const t3 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 450);
    const t4 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 900);

    const handleResize = () => { try { map.invalidateSize(); } catch {} };
    window.addEventListener('resize', handleResize);

    // ResizeObserver ensures canvas always matches container size on tab switches and layouts
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        try { map.invalidateSize(); } catch {}
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      if (domEl) {
        domEl.removeEventListener('wheel', onMapWheel);
        domEl.removeEventListener('touchstart', onMapTouchStart);
        domEl.removeEventListener('touchmove', onMapTouchMove);
        domEl.removeEventListener('touchend', onMapTouchEnd);
      }
      if (mapGestureTimerRef.current) clearTimeout(mapGestureTimerRef.current);
      if (twoFingerTimerRef.current) clearTimeout(twoFingerTimerRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      map.remove();
      mapInstanceRef.current = null;
      osmLayerRef.current = null;
      darkLayerRef.current = null;
      satLayerRef.current = null;
    };
  }, [isLeafletReady]);

  // Instant, lag-free theme switching (toggles cached native tile layers without re-downloading)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const osm = osmLayerRef.current;
    const dark = darkLayerRef.current;
    const sat = satLayerRef.current;
    if (!osm || !dark || !sat) return;

    const targetLayer = mapTheme === 'dark' ? dark : mapTheme === 'satellite' ? sat : osm;

    // 1. Add target layer FIRST so map never blanks out or flashes grey
    if (!map.hasLayer(targetLayer)) {
      targetLayer.addTo(map);
    }
    targetLayer.bringToBack();

    // 2. Remove other layers gracefully
    const allLayers = [osm, dark, sat];
    allLayers.forEach(l => {
      if (l !== targetLayer && map.hasLayer(l)) {
        map.removeLayer(l);
      }
    });

    // 3. Update container background color
    if (mapContainerRef.current) {
      mapContainerRef.current.classList.remove('dark-map-tiles');
      if (mapTheme === 'dark') {
        mapContainerRef.current.style.backgroundColor = '#12161f';
      } else if (mapTheme === 'satellite') {
        mapContainerRef.current.style.backgroundColor = '#000000';
      } else {
        mapContainerRef.current.style.backgroundColor = '#f8fafc';
      }
    }

    // Immediate size invalidation to force rendering
    setTimeout(() => { try { map.invalidateSize({ pan: false }); } catch (e) {} }, 40);
  }, [mapTheme]);

  // Helper: Format relative time in Georgian
  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'ახლახანს';
    if (diff < 60) return `${diff} წუთის წინ`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} საათის წინ`;
    return `${Math.floor(hours / 24)} დღის წინ`;
  };

  // 3b. Render Alternative Routes Polylines on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !routesLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const layer = routesLayerRef.current;
    layer.clearLayers();

    if (!showAlternativeRoutes) return;

    const selectedRoute = ALTERNATIVE_ROUTES.find(r => r.id === activeRouteId) || ALTERNATIVE_ROUTES[0];
    if (!selectedRoute) return;

    // 1. Congested / Road repair route: Red dashed line
    const congLine = L.polyline(selectedRoute.congestedCoords, {
      color: '#ef4444',
      weight: 6,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(layer);

    congLine.bindTooltip(`🛑 ძირითადი გზა: ${selectedRoute.congestedTimeMin} წთ (+${selectedRoute.congestedDelayMin} წთ ${selectedRoute.causeType === 'traffic_jam' ? 'საცობი' : 'რემონტი'})`, {
      permanent: false,
      direction: 'top',
      className: 'bg-rose-950 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-md border border-rose-400'
    });

    // 2. Alternative route: Solid glowing emerald green line
    const altLine = L.polyline(selectedRoute.altCoords, {
      color: '#10b981',
      weight: 8,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(layer);

    altLine.bindTooltip(`⚡ ალტერნატიული მოკლე გზა: ${selectedRoute.altTimeMin} წთ (-${selectedRoute.timeSavedMin} წთ მოგება!)`, {
      permanent: true,
      direction: 'top',
      className: 'bg-emerald-900 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xl border-2 border-emerald-400 ring-2 ring-emerald-500/30'
    });

    // 3. Start Marker
    const startIcon = L.divIcon({
      className: 'route-pin-start',
      html: `
        <div class="px-2.5 py-1 rounded-xl bg-[#1A2232] text-white text-[11px] font-black border-2 border-white shadow-lg flex items-center gap-1 whitespace-nowrap">
          <span>🏁</span>
          <span>საწყისი</span>
        </div>
      `,
      iconSize: [75, 28],
      iconAnchor: [37, 14]
    });
    L.marker([selectedRoute.origin.lat, selectedRoute.origin.lng], { icon: startIcon }).addTo(layer);

    // 4. Destination Marker
    const destIcon = L.divIcon({
      className: 'route-pin-dest',
      html: `
        <div class="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black border-2 border-white shadow-lg flex items-center gap-1 whitespace-nowrap animate-bounce">
          <span>🎯</span>
          <span>დანიშნულება</span>
        </div>
      `,
      iconSize: [95, 28],
      iconAnchor: [47, 14]
    });
    L.marker([selectedRoute.destination.lat, selectedRoute.destination.lng], { icon: destIcon }).addTo(layer);

    // 5. Fit map bounds to show the complete route
    try {
      const allCoords = [...selectedRoute.congestedCoords, ...selectedRoute.altCoords];
      const bounds = L.latLngBounds(allCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } catch (e) {
      // ignore
    }
  }, [showAlternativeRoutes, activeRouteId]);

  // 4. Update Markers on reports or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // Filter reports
    const qLower = searchQuery.trim().toLowerCase();
    const filtered = reports.filter(r => {
      const matchesFilter = filterType === 'all' || r.type === filterType;
      const matchesSearch = !qLower ||
        r.title.toLowerCase().includes(qLower) ||
        (r.description && r.description.toLowerCase().includes(qLower)) ||
        (r.brand && r.brand.toLowerCase().includes(qLower)) ||
        (r.address && r.address.toLowerCase().includes(qLower)) ||
        (r.code && r.code.toLowerCase().includes(qLower)) ||
        (r.speedLimit && r.speedLimit.toLowerCase().includes(qLower)) ||
        (r.cameraKind && r.cameraKind.toLowerCase().includes(qLower));
      return matchesFilter && matchesSearch;
    });

    const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
    filtered.forEach(rawItem => {
      const item = {...rawItem, title:escapeHtml(rawItem.title), description:escapeHtml(rawItem.description)};
      // Create clean, aesthetic Google Maps / European standard POI pins (Approved design)
      let iconHtml = '';
      let markerClass = '';

      switch (item.type) {
        case 'patrol':
          markerClass = 'patrol-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-[#1A73E8] text-white font-mono font-bold text-[9px] shadow-sm border border-white -mb-1.5 z-20 whitespace-nowrap">
                LIVE პატრული
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'radar':
          markerClass = 'radar-marker';
          if (item.speed_limit_kmh) {
            // Authentic European/Georgian Speed Limit Road Sign (Red Ring, White Interior, Bold Black Speed)
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-1.5 py-0.2 rounded-full bg-[#202124] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  ${item.speed_limit_kmh} კმ/სთ
                </div>
                <div class="relative w-9 h-9 rounded-full bg-white border-[3.5px] border-[#E53935] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform z-10">
                  <span class="text-[#202124] font-black font-mono text-[13px] tracking-tight leading-none">${item.speed_limit_kmh}</span>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#E53935] -mt-[1px]"></div>
              </div>
            `;
          } else if (item.camera_kind === 'average_speed') {
            // Average Speed Camera Section
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-2 py-0.5 rounded-full bg-[#1A73E8] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  A ⇢ B სექციური
                </div>
                <div class="relative w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                  <span class="text-[9px] font-black font-mono">AVG</span>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
              </div>
            `;
          } else if (item.camera_kind === 'traffic_signals') {
            // Traffic Light Camera
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-1.5 py-0.2 rounded-full bg-[#3C4043] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  შუქნიშანი
                </div>
                <div class="relative w-8 h-8 rounded-full bg-[#202124] text-white flex flex-col items-center justify-center gap-0.5 shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                  <div class="flex items-center gap-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-[#FBBC04]"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
                  </div>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#202124] -mt-[1px]"></div>
              </div>
            `;
          } else {
            // General Radar / Camera
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-1.5 py-0.2 rounded-full bg-[#1A73E8] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  რადარი
                </div>
                <div class="relative w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
              </div>
            `;
          }
          break;

        case 'hazard':
          markerClass = 'hazard-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-[#EA4335] text-white font-bold text-[9px] shadow-xs border border-white -mb-1.5 z-20 whitespace-nowrap">
                საფრთხე
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#EA4335] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'fuel':
          markerClass = 'fuel-marker';
          const brandUpper = (item.brand || item.title || '').toUpperCase();
          const fuelBrand =
            brandUpper.includes('WISSOL') || brandUpper.includes('ვისოლ') ? 'Wissol' :
            brandUpper.includes('GULF') || brandUpper.includes('გალფ') ? 'Gulf' :
            brandUpper.includes('ROMPETROL') || brandUpper.includes('რომპეტროლ') ? 'Rompetrol' :
            brandUpper.includes('SOCAR') || brandUpper.includes('სოკარ') ? 'Socar' :
            brandUpper.includes('LUKOIL') || brandUpper.includes('ლუკოილ') ? 'Lukoil' :
            brandUpper.includes('PORTAL') || brandUpper.includes('პორტალ') ? 'Portal' :
            (item.brand || 'საწვავი');
          const lowestPrice = item.fuel_prices ? (item.fuel_prices.regular_92 || item.fuel_prices.premium_95) : null;
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#202124] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ${lowestPrice ? `${lowestPrice.toFixed(2)}₾` : fuelBrand}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#1E8E3E] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9h2a2 2 0 012 2v7a2 2 0 01-2 2h-2"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1E8E3E] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'charging':
          markerClass = 'charging-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#007B83] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ⚡ ${item.brand || 'EV Fast'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#007B83] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#007B83] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'service':
          markerClass = 'service-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#202124] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                🔧 ${item.brand || 'სერვისი'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#1967D2] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1967D2] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'car_wash':
          markerClass = 'car-wash-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#129EAF] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                🧼 ${item.brand || 'სამრეცხაო'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#129EAF] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#129EAF] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'parts':
          markerClass = 'parts-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#7B1FA2] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                🔩 ${item.brand || 'ნაწილები'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#7B1FA2] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#7B1FA2] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'parking':
          markerClass = 'parking-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#1A73E8] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ${item.code ? `#${item.code}` : '🅿️ პარკინგი'}
              </div>
              <div class="relative w-8 h-8 rounded-lg bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <span class="text-white font-black text-sm font-mono">P</span>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'showroom':
          markerClass = 'showroom-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#202124] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                👑 ${item.brand || 'ავტოსალონი'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#202124] text-[#D97706] flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#202124] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'traffic_jam':
          markerClass = 'traffic-jam-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-[#D93025] text-white font-mono font-black text-[9px] shadow-sm border border-white -mb-1.5 z-20 whitespace-nowrap animate-pulse">
                ${item.delay_minutes ? `+${item.delay_minutes} წთ საცობი` : '🔴 საცობი'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#D93025] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#D93025] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'road_repair':
          markerClass = 'road-repair-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-[#E37400] text-white font-mono font-black text-[9px] shadow-sm border border-white -mb-1.5 z-20 whitespace-nowrap">
                🚧 რემონტი
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#E37400] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#E37400] -mt-[1px]"></div>
            </div>
          `;
          break;
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      // Construct Clean Google Maps Light Popup HTML
      let popupBodyHtml = '';
      if (item.type === 'radar') {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1.5 text-xs text-[#3C4043]">
            <div class="flex items-center justify-between">
              <span class="text-[#5F6368]">კამერის ტიპი:</span>
              <span class="font-bold text-[#202124]">${escapeHtml(item.cameraKind || 'სტაციონარული რადარი')}</span>
            </div>
            ${item.speed_limit_kmh ? `
              <div class="flex items-center justify-between pt-1.5 border-t border-[#E8EAED]">
                <span class="text-[#5F6368]">მაქს. სიჩქარე:</span>
                <span class="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono font-bold text-xs">
                  ${item.speed_limit_kmh} კმ/სთ
                </span>
              </div>
            ` : ''}
            <div class="text-[10px] text-[#5F6368] pt-1.5 border-t border-[#E8EAED] flex items-center justify-between">
              <span>წყარო: ${escapeHtml(item.cameraSource || 'OpenStreetMap')}</span>
              ${item.osmId ? `<a href="https://www.openstreetmap.org/node/${item.osmId}" target="_blank" rel="noopener noreferrer" class="text-[#1A73E8] underline font-mono">OSM #${item.osmId} ↗</a>` : ''}
            </div>
          </div>
        `;
      } else if (item.cameraSource) {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] text-xs text-[#3C4043] space-y-1">
            ${item.speedLimit ? `<div>ლიმიტი: <strong class="text-[#202124]">${escapeHtml(item.speedLimit)}</strong></div>` : ''}
            <div>წყარო: ${escapeHtml(item.cameraSource)}</div>
            ${item.cameraUpdatedAt ? `<div>განახლდა: ${escapeHtml(new Date(item.cameraUpdatedAt).toLocaleDateString('ka-GE'))}</div>` : ''}
            ${item.osmId ? `<a href="https://www.openstreetmap.org/node/${item.osmId}" target="_blank" rel="noopener noreferrer" class="text-[#1A73E8] underline font-mono">წყაროს ნახვა ↗</a>` : ''}
          </div>
        `;
      }
      if (item.type === 'fuel' && item.fuel_prices) {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0]">
            <div class="text-[10px] uppercase tracking-wider font-bold text-[#5F6368] mb-1.5 flex justify-between">
              <span>საწვავის ტიპი</span>
              <span>ფასი / 1 ლ</span>
            </div>
            <div class="space-y-1 text-xs font-mono">
              ${item.fuel_prices.super_98 ? `<div class="flex justify-between text-[#3C4043]"><span>Super 98:</span><span class="font-bold text-[#137333]">${item.fuel_prices.super_98.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.premium_95 ? `<div class="flex justify-between text-[#3C4043]"><span>Premium 95:</span><span class="font-bold text-[#137333]">${item.fuel_prices.premium_95.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.regular_92 ? `<div class="flex justify-between text-[#3C4043]"><span>Euro Regular 92:</span><span class="font-bold text-[#137333]">${item.fuel_prices.regular_92.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.diesel ? `<div class="flex justify-between text-[#3C4043]"><span>Euro Diesel:</span><span class="font-bold text-[#137333]">${item.fuel_prices.diesel.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.lpg ? `<div class="flex justify-between text-[#3C4043]"><span>LPG / გაზი:</span><span class="font-bold text-[#1A73E8]">${item.fuel_prices.lpg.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.ev_kwh ? `<div class="flex justify-between text-[#3C4043]"><span>EV დამტენი:</span><span class="font-bold text-[#D97706]">${item.fuel_prices.ev_kwh.toFixed(2)} ₾/კვტ</span></div>` : ''}
            </div>
          </div>
        `;
      }
      if (item.phone || item.website || item.opening_hours || item.code) {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1.5 text-xs text-[#3C4043]">
            ${item.code ? `<div class="font-mono text-[#1A73E8] font-bold flex items-center justify-between"><span>🅿️ საპარკინგე ლოტი #${escapeHtml(item.code)}</span><span class="text-[#D97706] text-[10px]">15 წთ უფასო</span></div>` : ''}
            ${item.rating ? `<div class="flex items-center gap-1.5 text-[#D97706] font-bold"><span>შეფასება:</span><span>${item.rating} / 5.0 ★</span></div>` : ''}
            ${item.phone ? `<div class="flex items-center gap-1"><span>📞</span><a href="tel:${escapeHtml(item.phone)}" class="text-[#1A73E8] font-mono font-bold hover:underline">${escapeHtml(item.phone)}</a></div>` : ''}
            ${item.website ? `<div class="flex items-center gap-1"><span>🌐</span><a href="${escapeHtml(item.website)}" target="_blank" rel="noopener noreferrer" class="text-[#1A73E8] hover:underline">ვებსაიტი ↗</a></div>` : ''}
            ${item.opening_hours ? `<div class="text-[11px] text-[#5F6368] flex items-center gap-1"><span>🕒</span><span>${escapeHtml(item.opening_hours)}</span></div>` : ''}
          </div>
        `;
      }

      const brandData = getCompanyBrandData(item);
      const displayAddress = item.address || `${getGeorgiaRegionName(item.lat, item.lng)} • საგზაო მონაკვეთი (${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})`;
      const wazeDeepLink = `https://waze.com/ul?ll=${item.lat},${item.lng}&navigate=yes`;
      const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;

      const popupContent = `
        <div class="light-pin-card font-sans text-[#202124] p-1 select-text">
          <!-- Top Row: Logo + Category & Brand Title -->
          <div class="flex items-center gap-2.5 pb-2.5 border-b border-[#E8EAED] pr-7">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-[#DADCE0] bg-white">
              ${brandData.logoSvg}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${brandData.categoryBadgeClass}">
                  ${brandData.categoryLabel}
                </span>
                ${item.opening_hours ? `<span class="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">${item.opening_hours.includes('24') ? '24/7' : escapeHtml(item.opening_hours)}</span>` : ''}
              </div>
              <h4 class="font-extrabold text-xs sm:text-sm text-[#202124] leading-tight truncate mt-0.5" title="${escapeHtml(brandData.brandName)}">
                ${escapeHtml(brandData.brandName)}
              </h4>
            </div>
          </div>

          <!-- Address -->
          <div class="text-[11px] text-[#5F6368] flex items-start gap-1 mt-2 font-medium leading-snug">
            <span class="shrink-0 text-slate-400 mt-0.5">📍</span>
            <span>${escapeHtml(displayAddress)}</span>
          </div>
          ${item.description && item.description !== item.address && item.description !== displayAddress ? `<p class="text-[11px] text-[#5F6368] mt-1 leading-snug">${item.description}</p>` : ''}

          <!-- Phone Number Bar (if available) -->
          ${brandData.phone ? `
            <div class="mt-2 p-1.5 px-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex items-center justify-between">
              <div class="flex items-center gap-1 min-w-0">
                <span class="text-xs">📞</span>
                <span class="font-mono font-bold text-[11px] truncate">${escapeHtml(brandData.phone)}</span>
              </div>
              <a href="tel:${escapeHtml(brandData.phone.replace(/[^0-9+*]/g, ''))}" class="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-all shrink-0">
                დარეკვა
              </a>
            </div>
          ` : ''}

          <!-- Category Specifics (Fuel prices / Speed limit / Parking details) -->
          ${popupBodyHtml}

          <!-- Direction Links (Waze & Google Maps) -->
          <div class="mt-2.5 pt-2 border-t border-[#E8EAED] flex items-center gap-1.5 text-xs">
            <a href="${wazeDeepLink}" target="_blank" rel="noreferrer" class="flex-1 py-1 px-2 rounded-xl bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#1A73E8] border border-[#DADCE0] font-bold text-center flex items-center justify-center gap-1 transition-all">
              <span>Waze ↗</span>
            </a>
            <a href="${gmapsLink}" target="_blank" rel="noreferrer" class="flex-1 py-1 px-2 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-center flex items-center justify-center gap-1 transition-all shadow-xs">
              <span>Google Maps ↗</span>
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });
      marker.bindPopup(popupContent, {
        className: 'light-google-popup',
        maxWidth: 320,
        minWidth: 260,
        autoPan: true,
        autoPanPadding: [20, 20],
        closeOnClick: false,
        autoClose: false,
        closeButton: true
      });

      marker.on('click', (e: any) => {
        if (e?.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        sounds.playClick();
        setSelectedReport(item);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([item.lat, item.lng], { animate: true, duration: 0.35 });
        }
        marker.openPopup();
      });

      marker.on('popupclose', () => {
        setSelectedReport(prev => (prev?.id === item.id ? null : prev));
      });

      marker.addTo(layer);
    });
  }, [reports, filterType, searchQuery, isLeafletReady]);

  // Real OBD GPS has priority; the current device provides the fallback.
  useEffect(() => {
    return watchPreferredLocation(vehicle?.id, fix => {setLocationFix(fix);setUserLocation({lat:fix.lat,lng:fix.lng});setLocationError('');}, message => {setLocationError(message);setLocationFix(null);setUserLocation(null);});
  }, [vehicle?.id]);
  useEffect(() => {
    const map=mapInstanceRef.current,L=(window as any).L;
    if(!map||!L)return;
    if(!locationFix){userMarkerRef.current?.remove();userMarkerRef.current=null;return;}
    const label=locationFix.source==='obd'?'თქვენი მანქანა • 4G OBD GPS':'თქვენი მოწყობილობა • GPS';
    const content=`<div class="p-2 text-xs font-bold text-[#202124]">${label}<br><span class="text-[#5F6368] font-normal font-mono">სიზუსტე: ±${Math.round(locationFix.accuracy)} მ</span></div>`;
    if(userMarkerRef.current){userMarkerRef.current.setLatLng([locationFix.lat,locationFix.lng]);userMarkerRef.current.setPopupContent(content);}
    else {
      const icon=L.divIcon({className:'user-car-marker',html:'<div style="width:24px;height:24px;border:3px solid white;border-radius:50%;background:#1A73E8;box-shadow:0 0 0 6px rgba(26,115,232,0.25)"></div>',iconSize:[24,24],iconAnchor:[12,12]});
      userMarkerRef.current=L.marker([locationFix.lat,locationFix.lng],{icon}).bindPopup(content,{className:'light-google-popup'}).addTo(map);
    }
  },[locationFix,isLeafletReady]);
  const handleLocateMe = async () => {
    sounds.playClick();setIsLocating(true);
    try {
      const fix=await getPreferredLocation(vehicle?.id);
      setLocationFix(fix);setUserLocation({lat:fix.lat,lng:fix.lng});setLocationError('');
      mapInstanceRef.current?.flyTo([fix.lat,fix.lng],15,{duration:1});sounds.playSuccess();
    } catch(error) {setLocationError(error instanceof Error?error.message:'მდებარეობა ვერ განისაზღვრა.');}
    finally {setIsLocating(false);}
  };

  // 6. Handle New Report Add
  const handleAddNewReport = async (newReportPayload: Omit<MapReport, 'id' | 'confirmations' | 'active'>) => {
    try {
      const res = await n8nService.addReport(newReportPayload);
      if (res && res.report) {
        setReports(prev => [res.report, ...prev]);


        // Center map to new point
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([res.report.lat, res.report.lng], 14, { duration: 1 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Structured categories grouped by functional areas (Parking & Patrol removed per user request)
  const categoryGroups = [
    {
      id: 'safety',
      title: '🚨 მოძრაობა & საცობები',
      color: 'border-rose-200/90 bg-rose-50/40',
      items: [
        {
          key: 'traffic_jam' as const,
          label: 'საცობები (Live)',
          badge: 'Live 12',
          desc: 'მძიმე შეფერხებები & ალტერნატივები',
          icon: Car,
          accent: 'text-rose-600 bg-rose-100/90 border-rose-300'
        },
        {
          key: 'road_repair' as const,
          label: 'ქუჩის რემონტი',
          badge: '14',
          desc: 'საგზაო სამუშაოები & შეზღუდვები',
          icon: Construction,
          accent: 'text-amber-700 bg-amber-100/90 border-amber-300'
        },
        {
          key: 'radar' as const,
          label: 'რადარები & კამერები',
          badge: '260',
          desc: 'სიჩქარის & შუქნიშნის კამერები',
          icon: Camera,
          accent: 'text-amber-600 bg-amber-100/90 border-amber-300'
        },
        {
          key: 'hazard' as const,
          label: 'საგზაო საფრთხე',
          badge: 'Live',
          desc: 'შემთხვევები & შეფერხებები',
          icon: AlertTriangle,
          accent: 'text-rose-600 bg-rose-100/90 border-rose-300'
        }
      ]
    },
    {
      id: 'energy',
      title: '⛽ საწვავი & ენერგია',
      color: 'border-emerald-200/90 bg-emerald-50/50',
      items: [
        {
          key: 'fuel' as const,
          label: 'ავტოგასამართი & ფასები',
          badge: '1 421',
          desc: 'Gulf, Wissol, Socar, Rompetrol, Lukoil',
          icon: Fuel,
          accent: 'text-emerald-700 bg-emerald-100/90 border-emerald-300'
        },
        {
          key: 'charging' as const,
          label: 'EV დამტენები',
          badge: '254',
          desc: 'ელექტრომობილების სწრაფი დამტენები',
          icon: Zap,
          accent: 'text-teal-700 bg-teal-100/90 border-teal-300'
        }
      ]
    },
    {
      id: 'service',
      title: '🔧 ავტოსერვისი & მოვლა',
      color: 'border-blue-200/90 bg-blue-50/50',
      items: [
        {
          key: 'service' as const,
          label: 'სერვისი & ვულკანიზაცია',
          badge: '1 344',
          desc: 'დიაგნოსტიკა, სავალი ნაწილი, საბურავები',
          icon: Wrench,
          accent: 'text-indigo-700 bg-indigo-100/90 border-indigo-300'
        },
        {
          key: 'car_wash' as const,
          label: 'ავტოსამრეცხაო',
          badge: '902',
          desc: 'თვითმომსახურება & ქიმწმენდა',
          icon: Droplets,
          accent: 'text-sky-700 bg-sky-100/90 border-sky-300'
        }
      ]
    },
    {
      id: 'market',
      title: '🏬 ნაწილები & სალონები',
      color: 'border-purple-200/90 bg-purple-50/50',
      items: [
        {
          key: 'parts' as const,
          label: 'ავტონაწილები',
          badge: '619',
          desc: 'ნაწილები, დეტალები & ზეთები',
          icon: Cog,
          accent: 'text-purple-700 bg-purple-100/90 border-purple-300'
        },
        {
          key: 'showroom' as const,
          label: 'ავტოსალონები',
          badge: '122',
          desc: 'ოფიციალური დილერები & ცენტრები',
          icon: Building2,
          accent: 'text-amber-700 bg-amber-100/90 border-amber-300'
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Map Top Control Bar (Search, Filters, Geo) — მოცულობითი დაფა */}
      <div data-tour="map-controls" className="p-5 sm:p-6 lg:p-7 rounded-3xl neu-card shadow-neu-card border border-white/90 bg-[#ECEAE5] text-navy space-y-5 transition-all">
        {/* Header Row: Title, Live indicator & Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          
          {/* Title & Live indicator */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-md shrink-0 bg-white border border-white">
              <Navigation className="w-6 h-6 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-navy">
                  AutoHub ცოცხალი საგზაო რუკა
                </h3>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE {reports.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                რადარები, საწვავის ფასები, EV დამტენები და ავტოსერვისები
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher: AutoHub Map vs Waze Live Map */}
            <div className="flex items-center gap-1 p-1 bg-white/90 rounded-2xl border border-slate-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveMapView('autohub_map');
                  setTimeout(() => { mapInstanceRef.current?.invalidateSize(); }, 80);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMapView === 'autohub_map'
                    ? 'bg-navy text-gold shadow-sm font-black'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                }`}
              >
                <span>🗺️ საგზაო რუკა</span>
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveMapView('waze_live'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMapView === 'waze_live'
                    ? 'bg-cyan-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                }`}
              >
                <span>🚗 Waze Live Map</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => {
                sounds.playClick();
                loadReports();
              }}
              disabled={isRefreshing}
              title="მონაცემების განახლება"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-navy border border-slate-200/80 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-gold' : ''} />
            </button>

            {/* Locate Me (GPS) */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-navy border border-slate-200/80 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Compass size={16} className={isLocating ? 'animate-spin text-gold' : 'text-gold'} />
              <span>{isLocating ? 'GPS...' : 'ჩემი ლოკაცია'}</span>
            </button>

            {/* Add Report Button */}
            <button
              data-tour="map-report-btn"
              onClick={() => {
                sounds.playClick();
                setIsAddModalOpen(true);
              }}
              className="btn-stitch-navy px-4 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <Plus size={16} className="text-gold" />
              <span>+ შეტყობინება</span>
            </button>
          </div>
        </div>

        {/* Category Cards Section — 4 თანაბრად გადანაწილებული კატეგორია (2-2 იკონით) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {categoryGroups.map(group => (
            <div
              key={group.id}
              className={`p-3.5 rounded-2xl border ${group.color} space-y-2.5 shadow-2xs`}
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between px-1">
                <span>{group.title}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map(opt => {
                  const isActive = filterType === opt.key;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        sounds.playClick();
                        setFilterType(isActive ? 'all' : opt.key);
                        setSelectedReport(null);
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-xl transition-all duration-200 flex items-center justify-between gap-2.5 text-left ${
                        isActive
                          ? 'bg-[#1A2232] text-white border-2 border-gold shadow-md shadow-navy/25 scale-[1.02] ring-2 ring-gold/25 font-black'
                          : 'bg-white/95 hover:bg-white text-slate-800 border-2 border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            isActive
                              ? 'bg-gold/20 text-gold border-gold/40'
                              : opt.accent
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs truncate ${isActive ? 'text-white font-black' : 'text-slate-900 font-bold'}`}>
                            {opt.label}
                          </div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-gold/80' : 'text-slate-500'}`}>
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 transition-colors ${
                          isActive
                            ? 'bg-gold text-navy font-black shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar: "ყველა ობიექტი" Toggle + Quick Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
          <button
            onClick={() => {
              sounds.playClick();
              setFilterType('all');
              setSelectedReport(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-2 ${
              filterType === 'all'
                ? 'bg-[#1A2232] text-gold border-gold shadow-md shadow-navy/20 font-black scale-102 ring-2 ring-gold/25'
                : 'bg-white text-slate-700 hover:text-navy hover:bg-slate-50 border-slate-200/90 shadow-2xs'
            }`}
          >
            <Layers size={16} className={filterType === 'all' ? 'text-gold' : 'text-slate-500'} />
            <span>ყველა ობიექტი ერთად (9 000+)</span>
          </button>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ძიება: Wissol, Gulf, ვაკე, 80 კმ/სთ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-navy placeholder-slate-400 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-navy p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Live Traffic, Street Repairs & Alternative Routes Strip */}
        <div data-tour="map-traffic-filters" className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Traffic Jams Toggle Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilterType(filterType === 'traffic_jam' ? 'all' : 'traffic_jam');
                setSelectedReport(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-2 ${
                filterType === 'traffic_jam'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/40 font-black scale-[1.02]'
                  : 'bg-rose-50/90 text-rose-800 hover:bg-rose-100/90 border-rose-200/90 shadow-2xs'
              }`}
            >
              <Car size={15} className={filterType === 'traffic_jam' ? 'text-white' : 'text-rose-600'} />
              <span>🔴 საცობები</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                filterType === 'traffic_jam' ? 'bg-white/20 text-white' : 'bg-rose-200/70 text-rose-900'
              }`}>
                Live 12
              </span>
            </button>

            {/* Street Repairs Toggle Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setFilterType(filterType === 'road_repair' ? 'all' : 'road_repair');
                setSelectedReport(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-2 ${
                filterType === 'road_repair'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400/40 font-black scale-[1.02]'
                  : 'bg-amber-50/90 text-amber-900 hover:bg-amber-100/90 border-amber-200/90 shadow-2xs'
              }`}
            >
              <Construction size={15} className={filterType === 'road_repair' ? 'text-white' : 'text-amber-700'} />
              <span>🚧 ქუჩის რემონტი</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                filterType === 'road_repair' ? 'bg-white/20 text-white' : 'bg-amber-200/70 text-amber-950'
              }`}>
                14 ობიექტი
              </span>
            </button>

            {/* Alternative Routes (which are shorter) Toggle Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowAlternativeRoutes(prev => !prev);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border-2 shadow-xs ${
                showAlternativeRoutes
                  ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400/50 shadow-md scale-[1.02]'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-300'
              }`}
            >
              <Zap size={15} className={showAlternativeRoutes ? 'text-white fill-white' : 'text-emerald-600 fill-emerald-500'} />
              <span>⚡ ალტერნატიული მოკლე გზები</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                showAlternativeRoutes ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-950'
              }`}>
                მოკლე & სწრაფი
              </span>
            </button>
          </div>

          {showAlternativeRoutes && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>რუკაზე ნაჩვენებია მწვანე მოკლე ალტერნატივა და წითელი საცობი</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Sleek Map Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs text-xs text-slate-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-navy flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {cameraStatus}
          </span>
          {locationFix && (
            <span className="text-[11px] text-slate-500 font-mono border-l border-slate-200 pl-2">
              {locationFix.source === 'obd' ? '🚗 OBD GPS' : '📱 მოწყობილობის GPS'}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          <span>იხელმძღვანელეთ საგზაო ნიშნებით • </span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy"
          >
            © OpenStreetMap contributors
          </a>
        </div>
      </div>

      {/* 3. Interactive Map Canvas OR Official Waze Live Map View */}
      {activeMapView === 'waze_live' ? (
        <div className="space-y-3 animate-fade-in">
          {/* Waze Info & Deeplink Banner */}
          <div className="p-4 rounded-3xl bg-cyan-950/90 text-white border border-cyan-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Navigation size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Waze Live Map — ოფიციალური საგზაო მოძრაობა</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    Live Traffic
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  ცოცხალი საცობები, შეფერხებები და მოძრაობის სიჩქარეები თბილისში (Waze Iframe Embed).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://www.waze.com/live-map/directions?to=ll.41.7151%2C44.8271"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Waze-ში გახსნა</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Official Waze Iframe Embed */}
          <div className="relative w-full min-h-[560px] h-[560px] sm:h-[640px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950">
            <iframe
              src="https://embed.waze.com/iframe?zoom=13&lat=41.7151&lon=44.7850&ct=livemap"
              width="100%"
              height="100%"
              allowFullScreen
              title="Waze Live Map თბილისი"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      ) : (
      <div id="live-traffic-map-canvas" data-tour="map-canvas" className="relative w-full min-h-[560px] h-[560px] sm:h-[640px] rounded-3xl overflow-hidden border-2 border-slate-300/80 shadow-xl bg-[#F4F3F0]">
        
        {/* Leaflet DOM Node */}
        <div
          ref={mapContainerRef}
          onDoubleClick={handleToggleMapLock}
          className={`w-full h-full z-0 transition-colors duration-300 ${
            mapTheme === 'dark'
              ? 'bg-[#12161f]'
              : mapTheme === 'satellite'
              ? 'bg-black'
              : 'bg-[#f8fafc]'
          }`}
          title="ორჯერ დაკლიკეთ რუკის ზუმის გასააქტიურებლად/გასათიშად"
        />

        {/* Active Map Zoom Pill Badge */}
        {isMapUnlocked && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md text-emerald-300 border border-emerald-400/50 shadow-xl flex items-center gap-2 animate-fade-in text-xs font-bold pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>რუკის ზუმი ჩართულია • ორჯერ დაკლიკეთ ან დააჭირეთ Esc-ს</span>
            <button
              onClick={handleToggleMapLock}
              className="p-0.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="რუკის ზუმის გამორთვა"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* 2-Finger Touch Overlay (Google Maps gesture hint) */}
        {showTwoFingerOverlay && !isMapUnlocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] pointer-events-none animate-fade-in transition-opacity">
            <div className="px-5 py-3 rounded-2xl bg-slate-950/90 text-white text-xs sm:text-sm font-bold border border-white/20 shadow-2xl flex items-center gap-2.5">
              <span className="text-xl">✌️</span>
              <span>გამოიყენეთ <strong>2 თითი</strong> რუკის სამართავად</span>
            </div>
          </div>
        )}

        {/* Momentary Wheel Scroll Hint */}
        {showMapGestureHint && !isMapUnlocked && !showTwoFingerOverlay && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-2xl flex items-center gap-2 pointer-events-none animate-fade-in">
            <MousePointerClick size={16} className="text-gold animate-bounce" />
            <span>გამოიყენეთ <strong>2 თითი (Pinch)</strong> ან <strong>⌘ / Ctrl + Scroll</strong> რუკის ზუმისთვის</span>
          </div>
        )}

        {/* Floating Quick Exit / Scroll Past Button */}
        <button
          type="button"
          onClick={handleScrollPastMap}
          className="absolute bottom-4 right-4 z-20 px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white text-navy font-bold text-xs shadow-md border border-slate-200/90 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group pointer-events-auto"
          title="სერვისებზე და ფასებზე ჩასვლა"
        >
          <span>სერვისებზე ჩასვლა</span>
          <ChevronDown size={14} className="text-gold group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Loading overlay if Leaflet is still preparing */}
        {!isLeafletReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy/80 backdrop-blur-sm text-white">
            <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-3"></div>
            <p className="text-xs font-mono font-bold text-gold">რუკის ინიციალიზაცია...</p>
          </div>
        )}

        {/* Floating Layer Theme Switcher on Map (Dark, Street, Satellite) */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute top-4 right-14 z-20 flex items-center gap-1 p-1 rounded-2xl bg-navy/95 backdrop-blur-md border border-slate-700/80 shadow-lg text-xs"
        >
          {/* Lock / Unlock Toggle Button */}
          <button
            type="button"
            onClick={handleToggleMapLock}
            className={`px-2 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              isMapUnlocked ? 'bg-emerald-500 text-white shadow-xs font-black' : 'text-slate-300 hover:text-white'
            }`}
            title={isMapUnlocked ? 'რუკის ზუმი აქტიურია (ჩასაკეტად დაკლიკეთ)' : 'რუკის ზუმის განბლოკვა (ორჯერ დაკლიკეთ)'}
          >
            {isMapUnlocked ? <Unlock size={11} /> : <Lock size={11} />}
            <span className="hidden sm:inline">{isMapUnlocked ? 'ზუმი აქტიური' : 'ზუმი ჩაკეტილი'}</span>
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleThemeChange('dark');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mapTheme === 'dark' ? 'bg-gold text-navy shadow-xs font-black' : 'text-slate-300 hover:text-white'
            }`}
            title="CartoDB Dark Matter მუქი რეჟიმი"
          >
            <span>🌙 მუქი</span>
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleThemeChange('street');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mapTheme === 'street' ? 'bg-gold text-navy shadow-xs font-black' : 'text-slate-300 hover:text-white'
            }`}
            title="სტანდარტული ქუჩების რუკა"
          >
            <span>🗺️ ქუჩები</span>
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleThemeChange('satellite');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mapTheme === 'satellite' ? 'bg-gold text-navy shadow-xs font-black' : 'text-slate-300 hover:text-white'
            }`}
            title="Google Hybrid სატელიტი ქუჩების სახელებით"
          >
            <span>🛰️ სატელიტი</span>
          </button>
        </div>

        {/* Floating Quick Stats Badge on Map */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-navy/85 backdrop-blur-md text-white border border-slate-700/80 shadow-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono text-slate-300">
            თბილისის სექტორი • <strong className="text-gold font-bold">{reports.length}</strong> აქტიური წერტილი
          </span>
        </div>

        {/* Click-to-Pin hint banner if clicked on map */}
        {clickedCoords && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 px-4 py-2.5 rounded-2xl bg-navy/90 backdrop-blur-md text-white border border-gold/50 shadow-xl flex items-center gap-3 animate-fade-in text-xs">
            <MapPin size={16} className="text-gold animate-bounce" />
            <span>
              მონიშნულია წერტილი: <strong className="font-mono text-gold">{clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)}</strong>
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1 rounded-xl bg-gold text-navy font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              + აქ შეტყობინება
            </button>
            <button
              onClick={() => setClickedCoords(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Floating Action Button (FAB) Bottom Right */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsAddModalOpen(true);
          }}
          className="absolute bottom-5 right-5 z-10 px-5 py-3.5 rounded-full bg-gradient-to-r from-gold to-amber-500 text-navy font-black text-xs shadow-[0_4px_20px_rgba(252,163,17,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white"
        >
          <Plus size={18} />
          <span>შეტყობინების დამატება</span>
        </button>

        {/* Selected Marker Rich Info Card (Slides up when any marker is clicked) */}
        {selectedReport && (() => {
          const brandData = getCompanyBrandData(selectedReport);
          const displayAddress = selectedReport.address || `${getGeorgiaRegionName(selectedReport.lat, selectedReport.lng)} • საგზაო მონაკვეთი (${selectedReport.lat.toFixed(4)}, ${selectedReport.lng.toFixed(4)})`;

          return (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-30 p-4 rounded-3xl bg-white/98 backdrop-blur-xl border border-[#DADCE0] text-[#202124] shadow-[0_12px_32px_rgba(60,64,67,0.22)] animate-fade-in"
            >
              {/* Header: Company Logo + Badge + Name + Close */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E8EAED] gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-slate-200 bg-white"
                    dangerouslySetInnerHTML={{ __html: brandData.logoSvg }}
                  />
                  <div className="min-w-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${brandData.categoryBadgeClass}`}>
                      {brandData.categoryLabel}
                    </span>
                    <h4 className="font-extrabold text-sm text-[#202124] leading-tight truncate mt-0.5" title={brandData.brandName}>
                      {brandData.brandName}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#5F6368] font-mono hidden sm:inline-block">
                    {selectedReport.cameraSource ? 'OSM OpenData' : formatTimeAgo(selectedReport.timestamp)}
                  </span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSelectedReport(null);
                      mapInstanceRef.current?.closePopup();
                    }}
                    className="w-7 h-7 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#5F6368] hover:text-[#202124] flex items-center justify-center text-xs font-bold transition-all"
                    title="დახურვა"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5 mt-2.5 text-xs text-[#5F6368] font-medium leading-snug">
                <span className="shrink-0 text-slate-400 mt-0.5">📍</span>
                <span>{displayAddress}</span>
              </div>
              {selectedReport.description && selectedReport.description !== selectedReport.address && (
                <p className="text-xs text-[#5F6368] mt-1 leading-snug">
                  {selectedReport.description}
                </p>
              )}

              {/* Dedicated Phone Bar (if available) */}
              {brandData.phone && (
                <div className="mt-2.5 p-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">📞</span>
                    <span className="font-mono font-bold text-xs truncate">{brandData.phone}</span>
                  </div>
                  <a
                    href={`tel:${brandData.phone.replace(/[^0-9+*]/g, '')}`}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0 flex items-center gap-1"
                  >
                    <Phone size={12} />
                    <span>დარეკვა</span>
                  </a>
                </div>
              )}

              {/* Details Box */}
              <div className="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1.5 text-xs text-[#3C4043]">
                {selectedReport.delay_minutes && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5F6368]">სავარაუდო შეფერხება:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-xs">
                      ⏱️ +{selectedReport.delay_minutes} წუთი
                    </span>
                  </div>
                )}
                {selectedReport.road_repair_kind && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5F6368]">სამუშაოს ტიპი:</span>
                    <span className="font-bold text-amber-900">
                      🚧 {selectedReport.road_repair_kind}
                    </span>
                  </div>
                )}
                {selectedReport.speed_limit_kmh && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5F6368]">მაქს. სიჩქარე:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono font-bold text-xs">
                      ⚡ {selectedReport.speed_limit_kmh} კმ/სთ
                    </span>
                  </div>
                )}
                {selectedReport.opening_hours && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#5F6368]">
                    <span>🕒</span>
                    <span>{selectedReport.opening_hours}</span>
                  </div>
                )}
                {selectedReport.website && (
                  <div className="flex items-center gap-1.5">
                    <span>🌐</span>
                    <a href={selectedReport.website} target="_blank" rel="noopener noreferrer" className="text-[#1A73E8] hover:underline">
                      ვებსაიტი ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Alternative Route CTA if available */}
              {selectedReport.alternativeRouteId && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveRouteId(selectedReport.alternativeRouteId!);
                    setShowAlternativeRoutes(true);
                    setSelectedReport(null);
                  }}
                  className="w-full mt-2.5 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Zap size={15} className="text-white fill-white" />
                  <span>⚡ ალტერნატიული მოკლე გზის ნახვა (დაზოგვა!)</span>
                </button>
              )}

              {/* Navigation & Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-[#E8EAED] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <a
                    href={`https://waze.com/ul?ll=${selectedReport.lat},${selectedReport.lng}&navigate=yes`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#1A73E8] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DADCE0] transition-all"
                  >
                    <Navigation size={14} />
                    <span>Waze</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedReport.lat},${selectedReport.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <ExternalLink size={14} />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Alternative Shorter Routes Interactive Floating Card / Drawer */}
        {showAlternativeRoutes && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-lg z-30 p-4 sm:p-5 rounded-3xl bg-white/98 backdrop-blur-xl border-2 border-emerald-500/80 text-navy shadow-[0_16px_36px_rgba(16,185,129,0.22)] animate-fade-in space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Zap size={18} className="fill-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy flex items-center gap-1.5">
                    <span>ალტერნატიული მოკლე გზები</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      სწრაფი შემოვლა
                    </span>
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    საცობებისა და რემონტის თავიდან არიდება მოკლე მარშრუტებით
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowAlternativeRoutes(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-navy flex items-center justify-center text-xs transition-colors"
                title="დახურვა"
              >
                ✕
              </button>
            </div>

            {/* Corridor Selector Pills */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                აირჩიეთ მონაკვეთი:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {ALTERNATIVE_ROUTES.map(route => {
                  const isSelected = route.id === activeRouteId;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveRouteId(route.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-[#1A2232] text-white border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{route.causeType === 'traffic_jam' ? '🔴' : '🚧'}</span>
                      <span>{route.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-black ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        -{route.timeSavedMin} წთ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Route Comparison: Congested vs Alternative */}
            {(() => {
              const route = ALTERNATIVE_ROUTES.find(r => r.id === activeRouteId) || ALTERNATIVE_ROUTES[0];
              if (!route) return null;

              const gmapsAltUrl = `https://www.google.com/maps/dir/?api=1&origin=${route.origin.lat},${route.origin.lng}&destination=${route.destination.lat},${route.destination.lng}&travelmode=driving`;
              const wazeAltUrl = `https://waze.com/ul?ll=${route.destination.lat},${route.destination.lng}&navigate=yes`;

              return (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {/* Primary Congested Road */}
                    <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-200/90 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-rose-800">
                        <span>🛑 ძირითადი გზა</span>
                        <span className="font-mono text-rose-700">+{route.congestedDelayMin} წთ</span>
                      </div>
                      <div className="text-sm font-black font-mono text-rose-950">
                        {route.congestedTimeMin} წთ <span className="text-[11px] font-normal text-rose-700 font-sans">({route.congestedDistKm} კმ)</span>
                      </div>
                      <p className="text-[10px] text-rose-800/90 line-clamp-2 leading-tight">
                        {route.congestedName}
                      </p>
                    </div>

                    {/* Alternative Shorter Road */}
                    <div className="p-2.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-500/90 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-black text-emerald-800">
                        <span>⚡ მოკლე ალტერნატივა</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-200 text-emerald-950 font-mono text-[9px] font-black">
                          -{route.timeSavedMin} წთ
                        </span>
                      </div>
                      <div className="text-sm font-black font-mono text-emerald-950 flex items-center gap-1">
                        <span>{route.altTimeMin} წთ</span>
                        <span className="text-[11px] font-normal text-emerald-700 font-sans">({route.altDistKm} კმ)</span>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-800 line-clamp-2 leading-tight">
                        {route.distSavedKm > 0 ? `${route.distSavedKm} კმ-ით მოკლე & თავისუფალი!` : 'თავისუფალი მოძრაობა!'}
                      </p>
                    </div>
                  </div>

                  {/* Turn-by-Turn Bypass Recommendation */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      შემოვლითი ქუჩების მიმართულება:
                    </span>
                    <div className="text-navy font-semibold text-[11px] leading-relaxed flex flex-wrap items-center gap-1">
                      {route.altBypassStreets.map((st, i) => (
                        <React.Fragment key={st}>
                          <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-navy font-bold">
                            {st}
                          </span>
                          {i < route.altBypassStreets.length - 1 && <span className="text-emerald-600 font-black">→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Navigation Links & Focus Map */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        try {
                          const allCoords = [...route.congestedCoords, ...route.altCoords];
                          const L = (window as any).L;
                          if (L && mapInstanceRef.current) {
                            const bounds = L.latLngBounds(allCoords);
                            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                          }
                        } catch (e) {}
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                      title="რუკაზე მარშრუტის ცენტრირება"
                    >
                      <Navigation size={13} />
                      <span>რუკაზე ჩვენება</span>
                    </button>

                    <a
                      href={gmapsAltUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>Google Maps-ით წასვლა</span>
                    </a>

                    <a
                      href={wazeAltUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#1A73E8] font-bold text-xs flex items-center justify-center gap-1 border border-slate-200 transition-colors"
                      title="Waze-ში გახსნა"
                    >
                      <span>Waze</span>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
      )}

      {/* 3. Bottom Legend & Fuel / Showrooms Quick Grid */}
      <div id="live-map-bottom-section" className="grid grid-cols-1 md:grid-cols-2 gap-4 scroll-mt-24">
        
        {/* Live Fuel Station Leaderboard (Best Prices) */}
        <div className="p-4 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
              <Fuel size={15} className="text-emerald-600" />
              <span>საწვავის საუკეთესო ფასები (თბილისი)</span>
            </h4>
            <span className="text-[10px] font-mono font-bold text-slate-400">განახლებულია</span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {reports.filter(r => r.type === 'fuel' && r.fuel_prices).slice(0, 5).map(station => (
              <div
                key={station.id}
                onClick={() => {
                  sounds.playClick();
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([station.lat, station.lng], 16, { duration: 1 });
                  }
                }}
                className="p-3 rounded-2xl neu-surface hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between border border-white"
              >
                <div>
                  <div className="font-extrabold text-xs text-navy flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{station.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {station.address}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {station.fuel_prices?.regular_92 && (
                    <span className="px-2 py-1 rounded-xl bg-slate-200/80 text-navy font-bold">
                      92: {station.fuel_prices.regular_92.toFixed(2)}₾
                    </span>
                  )}
                  {station.fuel_prices?.premium_95 && (
                    <span className="px-2 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black">
                      95: {station.fuel_prices.premium_95.toFixed(2)}₾
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Showrooms & Official Centers */}
        <div className="p-4 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
              <Building2 size={15} className="text-gold" />
              <span>ავტო სალონები და ოფიციალური ცენტრები</span>
            </h4>
            <span className="text-[10px] font-mono font-bold text-gold">ოფიციალური</span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {reports.filter(r => r.type === 'showroom').slice(0, 5).map(showroom => (
              <div
                key={showroom.id}
                onClick={() => {
                  sounds.playClick();
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([showroom.lat, showroom.lng], 16, { duration: 1 });
                  }
                }}
                className="p-3 rounded-2xl neu-surface hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between border border-white"
              >
                <div>
                  <div className="font-extrabold text-xs text-navy flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                    <span>{showroom.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {showroom.address}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs">
                    {showroom.rating} ★
                  </span>
                  {showroom.phone && (
                    <a
                      href={`tel:${showroom.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-xl bg-navy text-gold hover:bg-slate-800 transition-colors"
                      title="დარეკვა"
                    >
                      <Phone size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Report Modal */}
      <AddReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddReport={handleAddNewReport}
        currentCoords={clickedCoords || userLocation}
      />

    </div>
  );
};

export default LiveTrafficMap;
