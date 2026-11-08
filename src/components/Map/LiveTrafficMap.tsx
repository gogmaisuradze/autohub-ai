import { useRevealResult } from '../../hooks/useRevealResult';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPointType, MapReport, VehicleProfile } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { leafletLoader } from '../../services/leafletLoader';
import { loadCameras, getGeorgiaRegionName } from '../../services/cameraService';
import { mapDataService } from '../../services/mapDataService';
import { getPreferredLocation, watchPreferredLocation, LocationFix } from '../../services/locationService';
import AddReportModal from './AddReportModal';
import { LocationDetailModal } from './LocationDetailModal';
import { getCompanyBrandData, CompanyBrandData } from './mapBrandUtils';
import { MapCategoriesCoverflow } from './MapCategoriesCoverflow';
import {
  getFuel3DPinHtml,
  getCharging3DPinHtml,
  getService3DPinHtml,
  getRadar3DCoinHtml,
  getHazard3DCoinHtml
} from './Map3DPins';
import {
  Navigation,
  Compass,
  Plus,
  Shield,
  Camera,
  Sparkles,
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


export const LiveTrafficMap: React.FC<Props> = ({ vehicle }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);
  const darkLayerRef = useRef<any>(null);
  const satLayerRef = useRef<any>(null);
  const satLabelsRef = useRef<any>(null);
  const currentBaseLayerRef = useRef<any>(null);
  const routesLayerRef = useRef<any>(null);
  const themeSwitcherRef = useRef<HTMLDivElement | null>(null);

  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState<boolean>(false);
  const [activeRouteId, setActiveRouteId] = useState<string>('route-heroes-sq');

  // მხოლოდ Light (ქუჩები) — მუქი/სატელიტი დროებით გამორთულია (შავდება), ყოველთვის 'street'
  const [mapTheme, setMapTheme] = useState<'dark' | 'street' | 'satellite'>('street');

  const applyMapTheme = useCallback((theme: 'dark' | 'street' | 'satellite') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let target: any = null;
    if (theme === 'dark') target = darkLayerRef.current;
    else if (theme === 'satellite') target = satLayerRef.current;
    else target = osmLayerRef.current;

    if (!target) return;

    // 1. Add new target layer FIRST and bring to back so the screen NEVER flashes or goes black
    if (!map.hasLayer(target)) {
      target.addTo(map);
    }
    if (typeof target.bringToBack === 'function') {
      target.bringToBack();
    }
    currentBaseLayerRef.current = target;

    // 2. Remove other base layers smoothly AFTER target is attached
    const baseLayers = [osmLayerRef.current, darkLayerRef.current, satLayerRef.current];
    baseLayers.forEach(layer => {
      if (layer && layer !== target && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    // 3. Handle Satellite street and place labels overlay
    if (theme === 'satellite') {
      if (satLabelsRef.current && !map.hasLayer(satLabelsRef.current)) {
        satLabelsRef.current.addTo(map);
      }
    } else {
      if (satLabelsRef.current && map.hasLayer(satLabelsRef.current)) {
        map.removeLayer(satLabelsRef.current);
      }
    }

    // 4. Update container background color
    if (mapContainerRef.current) {
      if (theme === 'dark') {
        mapContainerRef.current.style.backgroundColor = '#12161f';
      } else if (theme === 'satellite') {
        mapContainerRef.current.style.backgroundColor = '#0b1320';
      } else {
        mapContainerRef.current.style.backgroundColor = '#f8fafc';
      }
    }

    setTimeout(() => {
      try {
        map.invalidateSize({ pan: false });
      } catch {}
    }, 40);
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'street' | 'satellite') => {
    sounds.playClick();
    setMapTheme(newTheme);
    try {
      localStorage.setItem('autohub_map_theme', newTheme);
    } catch {}
    applyMapTheme(newTheme);
  };
  const [cameraStatus, setCameraStatus] = useState('მონაცემები იტვირთება…');
  const [reports, setReports] = useState<MapReport[]>([]);
  const [communityReports, setCommunityReports] = useState<MapReport[]>([]);
  const [backendPois, setBackendPois] = useState<MapReport[]>([]);
  const [filterType, setFilterType] = useState<MapPointType | 'all' | 'none'>('radar');
  const [categoryViewMode, setCategoryViewMode] = useState<'coverflow' | 'grid'>('coverflow');
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const [detailModalReport, setDetailModalReport] = useState<MapReport | null>(null);
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
  useRevealResult(filterType, 'live-traffic-map-canvas');
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Expose global opener for in-popup HTML buttons
  useEffect(() => {
    (window as any).autohubOpenDetailModal = (id: string) => {
      const found = reports.find(r => r.id === id);
      if (found) {
        sounds.playSuccess();
        setTimeout(() => {
          setDetailModalReport(found);
        }, 60);
      }
    };
    return () => {
      delete (window as any).autohubOpenDetailModal;
    };
  }, [reports]);

  const handleScrollPastMap = useCallback(() => {
    sounds.playClick();
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
        setCameraStatus(`🟢 CarMe Map (${modeLabel}) • ${pois.length} ობიექტი ეკრანზე • 9 000+ ბაზაში`);
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
        setCameraStatus(`🟢 CarMe Map აქტიურია (${modeLabel}) • 9 000+ ობიექტი (OSM & მუნიციპალური პარკინგი)`);
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
      attributionControl: false,
      preferCanvas: true,
      scrollWheelZoom: false, // არ დაბლოკოს გვერდის სქროლი მაუსის ბორბლით
      doubleClickZoom: false,
      closePopupOnClick: false
    });

    // კოოპერატიული ზუმი: Ctrl/Cmd + ბორბალი აზუმებს რუკას, ჩვეულებრივი ბორბალი სქროლავს მთელ გვერდს
    const domEl = mapContainerRef.current;
    const onMapWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
      }
    };
    if (domEl) {
      domEl.addEventListener('wheel', onMapWheel, { passive: true });
    }

    // რუკაზე დაკლიკებისას ზუმის ჩართვა, მაუსის გაწევისას გამორთვა გვერდის სუფთა სქროლისთვის
    map.on('focus', () => {
      try { map.scrollWheelZoom.enable(); } catch {}
    });
    map.on('blur', () => {
      try { map.scrollWheelZoom.disable(); } catch {}
    });
    if (domEl) {
      domEl.addEventListener('mouseleave', () => {
        try { map.scrollWheelZoom.disable(); } catch {}
      });
    }

    let moveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    map.on('moveend', () => {
      if (moveDebounceTimer) clearTimeout(moveDebounceTimer);
      moveDebounceTimer = setTimeout(() => {
        setMapRevision(v => v + 1);
      }, 700);
    });

    // ტაილების წინასწარ შექმნა და ქეშირება — სწრაფი, შეფერხების გარეშე გადართვისთვის
    // 1. ქუჩები: OpenStreetMap-ის სტანდარტული ტაილები (უფასო, გასაღების გარეშე)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: 'abc',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    });
    osmLayerRef.current = osmLayer;

    // 2. მუქი თემა: იგივე OSM ტაილები CSS-ინვერსიით (უფასო, გასაღების გარეშე)
    const darkLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: 'abc',
      maxZoom: 19,
      className: 'map-dark-tiles',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    });
    darkLayerRef.current = darkLayer;

    // 3. Esri World Imagery სატელიტი (მაღალი გარჩევადობის გლობალური სატელიტური ფოტო, უფასო)
    const satLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      maxNativeZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar'
    });
    satLayerRef.current = satLayer;

    // 3b. სატელიტზე ქუჩების/დასახელებების overlay (Esri reference, უფასო)
    const satLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      maxNativeZoom: 18,
      pane: 'overlayPane'
    });
    satLabelsRef.current = satLabels;

    // Zoom control placed on bottom-left so top-right is completely free for theme switcher
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Group layer for all reports
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Group layer for alternative routes polylines
    const routesLayer = L.layerGroup().addTo(map);
    routesLayerRef.current = routesLayer;

    mapInstanceRef.current = map;

    // Pre-attach initial base layer immediately
    const initialLayer = mapTheme === 'dark' ? darkLayer : mapTheme === 'satellite' ? satLayer : osmLayer;
    if (!map.hasLayer(initialLayer)) {
      initialLayer.addTo(map);
    }
    if (typeof initialLayer.bringToBack === 'function') {
      initialLayer.bringToBack();
    }
    currentBaseLayerRef.current = initialLayer;

    // Apply the active theme
    applyMapTheme(mapTheme);

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
      if (domEl) {
        try { domEl.removeEventListener('wheel', onMapWheel); } catch {}
      }
      if (moveDebounceTimer) clearTimeout(moveDebounceTimer);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      map.remove();
      mapInstanceRef.current = null;
      osmLayerRef.current = null;
      darkLayerRef.current = null;
      satLayerRef.current = null;
      satLabelsRef.current = null;
      currentBaseLayerRef.current = null;
    };
  }, [isLeafletReady]);

  // Synchronize mapTheme state changes with Leaflet
  useEffect(() => {
    applyMapTheme(mapTheme);
  }, [mapTheme, applyMapTheme]);

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
            // General Radar / Camera - AutoHub 3D Porcelain & Navy Camera Coin Badge
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-2 py-0.5 rounded-full bg-[#132238] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1.5 z-20 whitespace-nowrap">
                  📷 რადარი
                </div>
                ${getRadar3DCoinHtml()}
              </div>
            `;
          }
          break;

        case 'hazard':
          markerClass = 'hazard-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] shadow-xs border border-white -mb-1.5 z-20 whitespace-nowrap">
                ⚠️ საფრთხე
              </div>
              ${getHazard3DCoinHtml()}
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
              <div class="px-2 py-0.5 rounded-full bg-white text-[#132238] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ${lowestPrice ? `${lowestPrice.toFixed(2)}₾` : fuelBrand}
              </div>
              ${getFuel3DPinHtml()}
            </div>
          `;
          break;

        case 'charging':
          markerClass = 'charging-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#132238] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ⚡ ${item.brand || 'EV Fast'}
              </div>
              ${getCharging3DPinHtml()}
            </div>
          `;
          break;

        case 'service':
          markerClass = 'service-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#132238] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                🔧 ${item.brand || 'სერვისი'}
              </div>
              ${getService3DPinHtml()}
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

          <!-- Direction Links (Google Maps) -->
          <div class="mt-2.5 pt-2 border-t border-[#E8EAED] flex items-center gap-1.5 text-xs">
            <a href="${gmapsLink}" target="_blank" rel="noreferrer" class="flex-1 py-1 px-2 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-center flex items-center justify-center gap-1 transition-all shadow-xs">
              <span>Google Maps ↗</span>
            </a>
          </div>

          <!-- Full Details Modal CTA (Double click hint & button) -->
          <div class="mt-2 pt-1.5 border-t border-[#E8EAED]">
            <button
              type="button"
              onclick="window.autohubOpenDetailModal && window.autohubOpenDetailModal('${escapeHtml(item.id)}')"
              class="w-full py-1.5 px-2 rounded-xl bg-navy text-gold hover:bg-slate-800 text-[11px] font-black flex items-center justify-center gap-1.5 shadow-xs border border-gold/40 transition-all cursor-pointer"
            >
              <span>🔍 სრული ინფორმაციის ფანჯარა (ორმაგი კლიკი)</span>
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });
      marker.bindPopup(popupContent, {
        className: 'light-google-popup',
        maxWidth: 320,
        minWidth: 260,
        autoPan: false,
        closeOnClick: false,
        autoClose: false,
        closeButton: true
      });

      let lastClickTimestamp = 0;

      marker.on('click', (e: any) => {
        if (e?.originalEvent) {
          e.originalEvent.stopPropagation();
        }

        const now = Date.now();
        if (now - lastClickTimestamp < 450) {
          // Double click detected!
          sounds.playSuccess();
          setTimeout(() => {
            setDetailModalReport(item);
          }, 80);
          return;
        }
        lastClickTimestamp = now;

        sounds.playClick();
        setSelectedReport(item);
        marker.openPopup();
      });

      // Dedicated double-click event listener on marker
      marker.on('dblclick', (e: any) => {
        if (e?.originalEvent) {
          e.originalEvent.stopPropagation();
          e.originalEvent.preventDefault();
        }
        sounds.playSuccess();
        setTimeout(() => {
          setDetailModalReport(item);
        }, 80);
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
                  CarMe ცოცხალი საგზაო რუკა
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

        {/* Category Controls & Switcher: 3D Coverflow vs Classic Grid */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>ობიექტების კატეგორიები</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-semibold hidden md:inline-block">
              (რადარები, საცობები, საწვავი, EV დამტენები, სერვისები)
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setCategoryViewMode('coverflow');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                categoryViewMode === 'coverflow'
                  ? 'bg-navy text-gold shadow-sm font-black ring-1 ring-gold/40'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-100'
              }`}
            >
              <Sparkles size={13} className={categoryViewMode === 'coverflow' ? 'text-gold' : 'text-slate-400'} />
              <span>3D Coverflow</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setCategoryViewMode('grid');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                categoryViewMode === 'grid'
                  ? 'bg-navy text-gold shadow-sm font-black ring-1 ring-gold/40'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-100'
              }`}
            >
              <Layers size={13} className={categoryViewMode === 'grid' ? 'text-gold' : 'text-slate-400'} />
              <span>კლასიკური ბადე</span>
            </button>
          </div>
        </div>

        {/* Dynamic Category Section: 3D Coverflow vs 4-Column Grid */}
        {categoryViewMode === 'coverflow' ? (
          <MapCategoriesCoverflow
            activeCategoryKey={filterType}
            onSelectCategory={(key) => {
              setFilterType(key);
              setSelectedReport(null);
            }}
          />
        ) : (
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
        )}

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

        {/* Quick Theme Switcher in Status Bar */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => handleThemeChange('street')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              mapTheme === 'street' ? 'bg-white text-navy shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="სტანდარტული ქუჩების რუკა"
          >
            🗺️ ქუჩები
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block">
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

      {/* 3. Interactive Map Canvas */}
      <div id="live-traffic-map-canvas" data-tour="map-canvas" className="relative w-full min-h-[560px] h-[560px] sm:h-[640px] rounded-3xl overflow-hidden border-2 border-slate-300/80 shadow-xl bg-[#F4F3F0]">
        
        {/* Leaflet DOM Node */}
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%', minHeight: '560px' }}
          className={`w-full h-full z-0 transition-colors duration-300 ${
            mapTheme === 'dark'
              ? 'bg-[#12161f]'
              : mapTheme === 'satellite'
              ? 'bg-black'
              : 'bg-[#f8fafc]'
          }`}
        />

        {/* Loading overlay if Leaflet is still preparing */}
        {!isLeafletReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy/80 backdrop-blur-sm text-white">
            <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-3"></div>
            <p className="text-xs font-mono font-bold text-gold">რუკის ინიციალიზაცია...</p>
          </div>
        )}

        {/* Floating Layer Theme Switcher on Map (Dark, Street, Satellite) */}
        <div
          ref={themeSwitcherRef}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-[500] pointer-events-auto flex items-center gap-1 p-1 rounded-2xl bg-navy/95 backdrop-blur-md border-2 border-white/20 shadow-2xl text-xs"
        >
          <button
            type="button"
            onClick={() => handleThemeChange('street')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              mapTheme === 'street' ? 'bg-gold text-navy shadow-md font-black ring-1 ring-white/50' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="სტანდარტული ქუჩების რუკა"
          >
            <span>🗺️ ქუჩები</span>
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

        {/* Floating Bottom-Right Controls Stack (Hidden on mobile when marker card is open, no overlap!) */}
        <div className={`absolute bottom-4 right-3 sm:bottom-5 sm:right-5 z-20 flex-col items-end gap-2 sm:gap-2.5 pointer-events-auto ${selectedReport ? 'hidden sm:flex' : 'flex'}`}>
          {/* Floating Action Button (FAB) Add Report */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsAddModalOpen(true);
            }}
            className="px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-gold to-amber-500 text-navy font-black text-xs shadow-[0_4px_20px_rgba(252,163,17,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white cursor-pointer"
          >
            <Plus size={18} />
            <span>შეტყობინების დამატება</span>
          </button>
        </div>

        {/* Selected Marker Rich Info Card (Slides up when any marker is clicked) */}
        {selectedReport && (() => {
          const brandData = getCompanyBrandData(selectedReport);
          const displayAddress = selectedReport.address || `${getGeorgiaRegionName(selectedReport.lat, selectedReport.lng)} • საგზაო მონაკვეთი (${selectedReport.lat.toFixed(4)}, ${selectedReport.lng.toFixed(4)})`;

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onDoubleClick={() => {
                sounds.playSuccess();
                setDetailModalReport(selectedReport);
              }}
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      setSelectedReport(null);
                      mapInstanceRef.current?.closePopup();
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center text-sm font-black transition-all cursor-pointer shadow-xs border border-slate-200"
                    title="დახურვა (X)"
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
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedReport.lat},${selectedReport.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <ExternalLink size={14} />
                    <span>Google Maps ნავიგაცია ↗</span>
                  </a>
                </div>
              </div>

              {/* Full Details Modal Window CTA */}
              <button
                type="button"
                onClick={() => {
                  sounds.playSuccess();
                  setDetailModalReport(selectedReport);
                }}
                className="w-full mt-2.5 py-2 px-3 rounded-xl bg-navy text-gold hover:bg-slate-800 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs border border-gold/40 transition-all cursor-pointer"
              >
                <Sparkles size={13} className="text-gold" />
                <span>🔍 სრული ინფორმაციის ფანჯარა (ორმაგი კლიკი)</span>
              </button>
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
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>

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

      {/* Location Rich Details Modal Window (Opens on Double-Click or Click) */}
      <LocationDetailModal
        isOpen={Boolean(detailModalReport)}
        report={detailModalReport}
        onClose={() => setDetailModalReport(null)}
        userCoords={userLocation}
        onSelectAlternativeRoute={(routeId) => {
          setActiveRouteId(routeId);
          setShowAlternativeRoutes(true);
        }}
      />

    </div>
  );
};

export default LiveTrafficMap;
