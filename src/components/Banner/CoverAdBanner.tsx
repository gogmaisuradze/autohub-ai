import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldAlert,
  ParkingSquare,
  BookOpen,
  Navigation as NavigationIcon,
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Radio,
  Check,
  ShieldCheck
} from 'lucide-react';
import { TabType } from '../Navigation';
import { sounds } from '../../services/soundEffects';

export interface DigitalServiceItem {
  id: 'obd' | 'fines' | 'parking' | 'servicelog' | 'map' | 'driving_test' | 'vin_check';
  shortName: string;
  category: string;
  title: string;
  subtitle: string;
  badge: string;
  tag: string;
  tagColor: string;
  accentColor: string;
  badgeBg: string;
  imageUrl: string;
  carModelHint: string;
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  ctaText: string;
  secondaryCtaText?: string;
  actionTab?: TabType;
  actionType: 'tab' | 'obd_modal' | 'vin_modal' | 'booking_modal';
  icon: React.ComponentType<{ className?: string; size?: number }>;
  previewType: 'obd_gauge' | 'fines_card' | 'parking_zone' | 'log_timeline' | 'radar_hud' | 'exam_badge' | 'vin_report';
}

export const DIGITAL_SERVICES: DigitalServiceItem[] = [
  {
    id: 'obd',
    shortName: 'OBD დიაგნოსტიკა',
    category: 'დიაგნოსტიკა & AI',
    title: 'ონლაინ და ადაპტერით დიაგნოსტიკა & AI მექანიკოსი',
    subtitle: 'OBD-II LIVE TELEMETRY, SMART DTC SCAN & BLUETOOTH ADAPTER',
    badge: 'OBD-II & AI',
    tag: '🔌 ციფრული დიაგნოსტიკა • OBD-II & AI',
    tagColor: 'bg-amber-500/20 text-gold border-gold/40',
    accentColor: '#FCA311',
    badgeBg: 'bg-gold/20 text-gold border-gold/40',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1920&q=85',
    carModelHint: 'PORSCHE 911 DIGITAL COCKPIT & TELEMETRY',
    description: 'პირადად Bluetooth / Wi-Fi OBD-II ადაპტერის შეერთებით ან ონლაინ ღრუბლოვანი ტელემეტრიით: ძრავის Check Engine შეცდომების (DTC) წაკითხვა, წაშლა, სენსორების ცოცხალი პარამეტრები (RPM, ტემპერატურა, წნევა, აკუმულატორი) და ხელოვნური ინტელექტის (AI) მექანიკოსის დაუყოვნებლივი დასკვნა ქართულ ენაზე.',
    highlights: [
      'Bluetooth / Wi-Fi ELM327 ადაპტერი',
      'Check Engine შეცდომების წაშლა',
      'სენსორების ცოცხალი ტელემეტრია',
      'AI მექანიკოსის ონლაინ კონსულტაცია'
    ],
    specs: [
      { label: 'პროტოკოლი', value: 'OBD-II / CAN-BUS' },
      { label: 'შეცდომები', value: 'P0xxx, B0xxx, C0xxx' },
      { label: 'კავშირი', value: 'Bluetooth 5.0 / Wi-Fi' },
      { label: 'AI ანალიზი', value: 'მყისიერი დიაგნოზი' }
    ],
    ctaText: 'დიაგნოსტიკის დაწყება',
    secondaryCtaText: '🔌 ადაპტერის დაკავშირება',
    actionTab: 'obd',
    actionType: 'tab',
    icon: Activity,
    previewType: 'obd_gauge'
  },
  {
    id: 'fines',
    shortName: 'პოლიციის ჯარიმები',
    category: 'საპატრულო პოლიცია',
    title: 'საპატრულო პოლიციის ყველა ჯარიმა და სერვისი ერთად',
    subtitle: 'POLICE.GE SPEED RADARS, VIDEO FINES & 20% DISCOUNT',
    badge: 'POLICE.GE',
    tag: '🚨 საპატრულო პოლიცია • POLICE.GE',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    accentColor: '#F43F5E',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
    carModelHint: 'PORSCHE 911 GT3 HIGHWAY SPEED CORRIDOR',
    description: 'საპატრულო პოლიციის (Police.ge) სიჩქარის რადარების, ჭკვიანი კამერებისა და საპატრულო ეკიპაჟის მიერ გამოწერილი ყველა ჯარიმის ცოცხალი გადამოწმება ერთ სივრცეში. 20%-იანი ფასდაკლების 10-დღიანი ტაიმერი, SMS შეტყობინებები ახალ ჯარიმაზე, 100-ქულიანი სისტემის კონტროლი და პირდაპირი გადახდა/გასაჩივრება.',
    highlights: [
      'Police.ge ბაზასთან ცოცხალი სინქრონიზაცია',
      '20% ფასდაკლება პირველ 10 დღეში',
      'ვიდეოჯარიმები & რადარის ფოტოები',
      'უფასო SMS შეტყობინება ახალ ჯარიმაზე'
    ],
    specs: [
      { label: 'ფასდაკლება', value: '20% 10 დღის ვადაში' },
      { label: 'წყარო', value: 'police.ge ოფიციალური API' },
      { label: 'ქულები', value: '100 ქულიანი ბალანსი' },
      { label: 'გადახდა', value: 'მყისიერი უსაფრთხო გადახდა' }
    ],
    ctaText: 'ჯარიმების გადამოწმება',
    secondaryCtaText: '20% ფასდაკლების ვადა',
    actionTab: 'fines',
    actionType: 'tab',
    icon: ShieldAlert,
    previewType: 'fines_card'
  },
  {
    id: 'parking',
    shortName: 'პარკინგის სერვისები',
    category: 'მუნიციპალური პარკინგი',
    title: 'მუნიციპალური და ზონალური პარკინგი (თბილისი, ბათუმი)',
    subtitle: 'CITY PARKING, ZONAL PASSES & INSTANT SMS 9110',
    badge: 'PARKING PRO',
    tag: '🅿️ პარკინგის სისტემა • PARKING PRO',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    accentColor: '#38BDF8',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=85',
    carModelHint: 'MERCEDES-BENZ LUXURY URBAN BOULEVARD PARKING',
    description: 'თბილისის, ბათუმისა და ქუთაისის მუნიციპალური პარკირების მართვა: საათობრივი ზონალური (A, B, C ზონები) ტარიფები, წლიური/თვიური აბონემენტების შეძენა, მიმდინარე ზონის ავტომატური ამოცნობა რუკაზე და სწრაფი გადახდა SMS 9110-ით ზედმეტი ჯარიმების თავიდან ასაცილებლად.',
    highlights: [
      'A, B, C ზონალური პარკირება',
      'თბილისი, ბათუმი & ქუთაისი',
      'SMS 9110 სწრაფი აქტივაცია',
      'ჯარიმის თავიდან არიდების ტაიმერი'
    ],
    specs: [
      { label: 'ზონები', value: 'A / B / C ზონალური სისტემა' },
      { label: 'ქალაქები', value: 'თბილისი • ბათუმი • ქუთაისი' },
      { label: 'გადახდა', value: 'SMS 9110 & ბარათი' },
      { label: 'ტაიმერი', value: 'აქტიური შეხსენება' }
    ],
    ctaText: 'პარკინგის მართვა',
    secondaryCtaText: 'SMS 9110 აქტივაცია',
    actionTab: 'parking',
    actionType: 'tab',
    icon: ParkingSquare,
    previewType: 'parking_zone'
  },
  {
    id: 'servicelog',
    shortName: 'სერვისების დღიური',
    category: 'სერვისის ისტორია',
    title: 'ავტომობილის ციფრული სერვის-დღიური & ხარჯების აღრიცხვა',
    subtitle: 'DIGITAL SERVICE LOGBOOK & MAINTENANCE EXPENSE TRACKER',
    badge: 'LOGBOOK',
    tag: '📖 სერვისის ისტორია • LOGBOOK',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=85',
    carModelHint: 'PRECISION TITANIUM ENGINEERING & CHASSIS DYNAMICS',
    description: 'ავტომობილის სრული ციფრული ისტორია: ძრავის ზეთის, ფილტრების, სამუხრუჭე ხუნდების, საბურავებისა და სავალი ნაწილის შეცვლის თარიღები, გარბენი და ხარჯები. ავტომატური შეხსენებები მორიგ გეგმიურ სერვისზე და ავტომობილის საბაზრო ღირებულების შენარჩუნება გაყიდვისას.',
    highlights: [
      'ზეთისა & ფილტრების კალენდარი',
      'შეცვლილი ნაწილების ხარჯთაღრიცხვა',
      'მორიგი სერვისის კმ შეხსენება',
      'გაყიდვისას სანდო სერვის-ისტორია'
    ],
    specs: [
      { label: 'აღრიცხვა', value: '100% ციფრული ისტორია' },
      { label: 'ინტერვალები', value: 'გარბენისა და დროის მიხედვით' },
      { label: 'ანალიტიკა', value: 'თვიური/წლიური ხარჯები' },
      { label: 'ექსპორტი', value: 'PDF სერვის-პასპორტი' }
    ],
    ctaText: 'დღიურის გახსნა',
    secondaryCtaText: 'ჩანაწერის დამატება',
    actionTab: 'service',
    actionType: 'tab',
    icon: BookOpen,
    previewType: 'log_timeline'
  },
  {
    id: 'map',
    shortName: 'რადარების რუკა',
    category: 'ცოცხალი რუკა',
    title: 'ცოცხალი რუკა: რადარები, კამერები & გზის ინფორმაცია',
    subtitle: 'LIVE RADARS, SPEED CAMERAS, BUS LANES & ROAD HAZARDS',
    badge: 'LIVE RADAR',
    tag: '🗺️ რადარების რუკა • LIVE RADAR',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    accentColor: '#06B6D4',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=85',
    carModelHint: 'EXOTIC SUPERCAR ON SCENIC PANORAMIC HIGHWAY',
    description: 'საქართველოს გზების ცოცხალი ინტერაქტიული რუკა: სტაციონარული და სექციური სიჩქარის რადარები, ავტობუსის ზოლის (Bus Lane) მაკონტროლებელი კამერები, საპატრულო ეკიპაჟების ლოკაციები, საგზაო შეფერხებები და საცობების რეალური სიტუაცია რეალურ დროში.',
    highlights: [
      'სიჩქარის სტაციონარული & სექციური რადარები',
      'Bus Lane ავტობუსის ზოლის კამერები',
      'საგზაო საცობები & სარემონტო მონაკვეთები',
      'ხმოვანი გაფრთხილება მოახლოებულ რადარზე'
    ],
    specs: [
      { label: 'რადარები', value: 'საქართველოს ყველა წერტილი' },
      { label: 'სიზუსტე', value: 'GPS რეალურ დროში' },
      { label: 'კამერები', value: 'ჭკვიანი ვიდეო-კონტროლი' },
      { label: 'განგაში', value: '300მ წინასწარი გაფრთხილება' }
    ],
    ctaText: 'რუკის გახსნა',
    secondaryCtaText: 'რადარების სია',
    actionTab: 'map',
    actionType: 'tab',
    icon: NavigationIcon,
    previewType: 'radar_hud'
  },
  {
    id: 'driving_test',
    shortName: 'მართვის ტესტები',
    category: 'მართვის მოწმობა',
    title: 'მართვის მოწმობის თეორიული საგამოცდო ბილეთები 2026',
    subtitle: 'OFFICIAL DRIVING LICENSE THEORY EXAM SIMULATOR 2026',
    badge: 'EXAM 2026',
    tag: '🚦 მართვის მოწმობა • DRIVING EXAM',
    tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    accentColor: '#818CF8',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1920&q=85',
    carModelHint: 'PURE DRIVING PLEASURE & FREEDOM OF THE OPEN ROAD',
    description: 'მომსახურების სააგენტოს 2026 წლის ოფიციალური თეორიული საგამოცდო ბილეთების სრული სიმულატორი. კატეგორიები A, B, C, D; რეალური საგამოცდო დროის ტაიმერი (30 წუთი, 30 კითხვა), შეცდომების დეტალური განხილვა საგზაო მოძრაობის წესების მიხედვით და მზადყოფნის პროცენტული ინდექსი.',
    highlights: [
      '2026 წლის ოფიციალური ბილეთების ბაზა',
      'რეალური გამოცდის ტაიმერი & სიმულაცია',
      'საგზაო ნიშნების & სიტუაციების ილუსტრაციები',
      'შეცდომების ანალიზი & გამეორების რეჟიმი'
    ],
    specs: [
      { label: 'ბაზა', value: '2026 წლის ოფიციალური ბილეთები' },
      { label: 'კატეგორიები', value: 'A • B • C • D კატეგორიები' },
      { label: 'ფორმატი', value: '30 კითხვა / 3 შეცდომის ლიმიტი' },
      { label: 'სტატისტიკა', value: 'მზადყოფნის პროცენტი' }
    ],
    ctaText: 'ტესტის დაწყება (2026)',
    secondaryCtaText: 'საგზაო ნიშნების განხილვა',
    actionTab: 'garage',
    actionType: 'tab',
    icon: GraduationCap,
    previewType: 'exam_badge'
  },
  {
    id: 'vin_check',
    shortName: 'VIN შემოწმება',
    category: 'ისტორია & აუქციონი',
    title: 'ავტომობილის ისტორიის სრული გადამოწმება VIN კოდით',
    subtitle: 'INSTANT VIN CHECK, COPART/IAAI AUCTION & ACCIDENT REPORT',
    badge: 'VIN REPORT',
    tag: '🔍 VIN ისტორია • CARFAX & AUCTION',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    accentColor: '#C084FC',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1920&q=85',
    carModelHint: 'MERCEDES-AMG GT SHOWROOM GLAMOUR & PROVENANCE',
    description: 'ავტომობილის 17-ნიშნა VIN შასის კოდით სრული ისტორიის გაშიფვრა: ამერიკული აუქციონების (Copart, IAAI) საარქივო ფოტოები და დაზიანების ხარისხი, რეალური გარბენის გადამოწმება, აირბაგების გახსნის ისტორია, ქარხნული კომპლექტაცია და ტექნიკური მონაცემები.',
    highlights: [
      'Copart & IAAI აუქციონის რეალური ფოტოები',
      'გარბენის ჩამოყრის (Rollback) გადამოწმება',
      'ავარიებისა & აირბაგების ისტორია',
      'ქარხნული OEM კომპლექტაციის გაშიფვრა'
    ],
    specs: [
      { label: 'აუქციონები', value: 'Copart • IAAI • Manheim' },
      { label: 'ფოტოები', value: 'HQ საარქივო ფოტოები' },
      { label: 'გარბენი', value: 'ოდომეტრის ანალიზი & გრაფიკი' },
      { label: 'სტატუსი', value: 'Clean Title / Salvage' }
    ],
    ctaText: 'VIN კოდის შემოწმება',
    secondaryCtaText: 'აუქციონის ფოტოები',
    actionType: 'vin_modal',
    icon: Search,
    previewType: 'vin_report'
  }
];

export interface CoverAdBannerProps {
  onNavigateTab?: (tab: TabType) => void;
  onOpenObdModal?: () => void;
  onOpenVinHistory?: () => void;
  onOpenBookingModal?: () => void;
}

export const CoverAdBanner: React.FC<CoverAdBannerProps> = ({
  onNavigateTab,
  onOpenObdModal,
  onOpenVinHistory,
  onOpenBookingModal
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalServices = DIGITAL_SERVICES.length;
  const current = DIGITAL_SERVICES[currentIndex];
  const CurrentIcon = current.icon;

  // Auto-advance rotation every 7 seconds
  useEffect(() => {
    if (isPaused || isDismissed || isCatalogExpanded) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalServices);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isDismissed, isCatalogExpanded, totalServices]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setCurrentIndex((prev) => (prev - 1 + totalServices) % totalServices);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setCurrentIndex((prev) => (prev + 1) % totalServices);
  };

  const handleSelectService = (index: number) => {
    sounds.playClick();
    setCurrentIndex(index);
  };

  const handleAction = (service = current) => {
    sounds.playSuccess();

    if (service.id === 'vin_check') {
      if (onOpenVinHistory) {
        onOpenVinHistory();
      } else if (onNavigateTab) {
        onNavigateTab('garage');
      }
      return;
    }

    if (service.id === 'obd') {
      if (onNavigateTab) {
        onNavigateTab('obd');
      }
      return;
    }

    if (service.actionTab && onNavigateTab) {
      onNavigateTab(service.actionTab);
    }
  };

  const handleSecondaryAction = (service = current) => {
    sounds.playClick();

    if (service.id === 'obd' && onOpenObdModal) {
      onOpenObdModal();
      return;
    }

    if (service.id === 'vin_check' && onOpenVinHistory) {
      onOpenVinHistory();
      return;
    }

    if (service.actionTab && onNavigateTab) {
      onNavigateTab(service.actionTab);
    }
  };

  // Re-open pill if temporarily dismissed
  if (isDismissed) {
    return (
      <div className="flex justify-end my-1">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setIsDismissed(false);
          }}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-gold text-xs font-bold border border-gold/40 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 group"
        >
          <Tag size={13} className="text-gold group-hover:scale-110 transition-transform" />
          <span>📢 AutoHub ციფრული სერვისები (გამოჩენა)</span>
        </button>
      </div>
    );
  }

  // Visual Sleek Frosted Glass HUD Widget (Lightweight & Translucent so the Car Shines Through)
  const renderVisualCard = () => {
    switch (current.previewType) {
      case 'obd_gauge':
        return (
          <div className="w-full max-w-[330px] backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-white/20 shadow-xl flex flex-col gap-2.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-200">OBD-II Bluetooth 5.0</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/25 text-gold text-[9px] font-mono font-black border border-gold/40">
                14.2 V • LIVE
              </span>
            </div>

            {/* Live Telemetry Dial / Metrics */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[9px] font-mono text-slate-400 uppercase">RPM</div>
                <div className="text-sm font-black text-white font-mono">780</div>
                <div className="text-[8px] text-emerald-400 font-bold">ნორმა</div>
              </div>
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[9px] font-mono text-slate-400 uppercase">ტემპ.</div>
                <div className="text-sm font-black text-white font-mono">92°C</div>
                <div className="text-[8px] text-emerald-400 font-bold">ოპტიმ.</div>
              </div>
              <div className="p-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[9px] font-mono text-slate-400 uppercase">წნევა</div>
                <div className="text-sm font-black text-white font-mono">38 PSI</div>
                <div className="text-[8px] text-emerald-400 font-bold">სტაბილ.</div>
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 size={12} className="text-emerald-400" />
                0 DTC შეცდომა (Clean)
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-gold text-[9px] font-bold border border-gold/30">
                🤖 AI მექანიკოსი
              </span>
            </div>
          </div>
        );

      case 'fines_card':
        return (
          <div className="w-full max-w-[330px] backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-rose-500/30 shadow-xl flex flex-col gap-2.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-300">
                <ShieldAlert size={14} className="text-rose-400" />
                <span>Police.ge რადარი #GEO-412</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-mono font-bold border border-rose-400/40">
                ცოცხალი ბაზა
              </span>
            </div>

            <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-xs font-black text-white">
                სიჩქარის გადაჭარბება (+24 კმ/სთ)
              </div>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-[11px] text-slate-400 line-through">50.00 ₾</span>
                <span className="text-base font-black text-emerald-400 font-mono">40.00 ₾</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  -20% ფასდაკლება
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <Clock size={12} />
                დარჩენილია 7 დღე
              </span>
              <span className="text-slate-300 font-mono text-[9px]">
                ქულები: 100 / 100
              </span>
            </div>
          </div>
        );

      case 'parking_zone':
        return (
          <div className="w-full max-w-[330px] backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-blue-500/30 shadow-xl flex flex-col gap-2.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-300">
                <ParkingSquare size={14} className="text-blue-400" />
                <span>მუნიციპალური პარკინგი</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-mono font-bold border border-blue-400/40">
                თბილისი • ზონა A
              </span>
            </div>

            <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs font-black text-white">
                <span>რუსთაველის გამზირი #14</span>
                <span className="font-mono text-blue-400">1.00 ₾/სთ</span>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <div className="px-2 py-0.5 rounded-lg bg-white/10 border border-blue-400/40 text-[11px] font-mono font-black text-white flex items-center gap-1">
                  <Clock size={11} className="text-blue-400" />
                  <span>00:46:18</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">
                  ✓ აქტიური პარკირება
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-slate-300 font-bold">SMS 9110 გაგზავნილია</span>
              <span className="text-[9px] font-mono text-slate-400">22:00-მდე ფასიანი</span>
            </div>
          </div>
        );

      case 'log_timeline':
        return (
          <div className="w-full max-w-[330px] backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-emerald-500/30 shadow-xl flex flex-col gap-2.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                <BookOpen size={14} className="text-emerald-400" />
                <span>ციფრული სერვის-წიგნაკი</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-400/40">
                124,500 კმ
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                  <Check size={11} className="text-emerald-400" />
                  <span>ძრავის ზეთი (5W-30)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-black">92% რესურსი</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                  <Check size={11} className="text-emerald-400" />
                  <span>სამუხრუჭე ხუნდები</span>
                </div>
                <span className="text-[10px] font-mono text-gold font-black">+7,500 კმ</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-slate-400">შემდეგი: 128k კმ</span>
              <span className="font-bold text-gold">ჯამი: 420 ₾</span>
            </div>
          </div>
        );

      case 'radar_hud':
        return (
          <div className="w-full max-w-[330px] backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-cyan-500/30 shadow-xl flex flex-col gap-2.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                <Radio size={14} className="text-cyan-400 animate-pulse" />
                <span>რადარების დეტექტორი</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold border border-cyan-400/40">
                GPS LIVE
              </span>
            </div>

            <div className="space-y-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-white">
                  ⚠️ სიჩქარის რადარი • 350მ წინ
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-rose-500 bg-white/10 flex items-center justify-center text-[11px] font-black text-rose-400">
                  80
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-300">მიმდინარე სიჩქარე:</span>
                <span className="font-mono font-black text-emerald-400">72 კმ/სთ (უსაფრთხო)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-cyan-300 font-bold">Bus Lane კამერა</span>
              <span className="text-emerald-400 font-bold">🟢 თავისუფალია</span>
            </div>
          </div>
        );

      case 'exam_badge':
        return (
          <div className="w-full max-w-[330px] backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-indigo-500/30 shadow-xl flex flex-col gap-2.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
                <GraduationCap size={14} className="text-indigo-400" />
                <span>საგამოცდო ბილეთები 2026</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold border border-indigo-400/40">
                კატეგორია B
              </span>
            </div>

            <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs font-black text-white">
                <span>ბილეთი №14</span>
                <span className="font-mono text-indigo-300">კითხვა 18 / 30</span>
              </div>
              <div className="w-full bg-white/15 rounded-full h-1 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-1 rounded-full w-[60%]"></div>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-0.5">
                <span className="text-slate-300">⏱️ დრო: 22:45</span>
                <span className="text-emerald-400 font-bold">შეცდომა: 0 / 3</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-indigo-300 font-bold">მზადყოფნა: 94%</span>
              <span className="text-slate-400 font-mono text-[9px]">33 თემატიკა</span>
            </div>
          </div>
        );

      case 'vin_report':
        return (
          <div className="w-full max-w-[330px] backdrop-blur-md bg-slate-950/40 hover:bg-slate-950/60 transition-all rounded-2xl p-3.5 sm:p-4 border border-purple-500/30 shadow-xl flex flex-col gap-2.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300">
                <ShieldCheck size={14} className="text-purple-400" />
                <span>Carfax & Copart ანგარიში</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold border border-purple-400/40">
                VERIFIED
              </span>
            </div>

            <div className="space-y-1 bg-white/5 p-2 rounded-xl border border-white/10 text-[10px]">
              <div className="font-mono font-bold text-white text-[11px]">VIN: WBA3...9281 (BMW 330i)</div>
              <div className="grid grid-cols-2 gap-1 pt-0.5">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Check size={11} />
                  <span>გარბენი: 87k mi</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Check size={11} />
                  <span>Airbags: გაუხსნელი</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="text-purple-300 font-bold">სტატუსი: Clean Title</span>
              <span className="text-emerald-400 font-bold">Run & Drive</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 transition-all bg-slate-950 group"
    >
      {/* Background Thematic Car Photography - 100% Opacity, Vibrant & Crystal Clear */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden">
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center transform transition-all duration-1000 ease-out scale-100 group-hover:scale-105 opacity-100 brightness-100 contrast-[1.05]"
        />

        {/* Targeted Left Gradient ONLY (Protects text contrast on left, leaving the center and right 100% crystal clear for the car!) */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-4/5 lg:w-3/5 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent pointer-events-none" />
        
        {/* Subtle Top & Bottom Shadow for Controls Legibility */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />
      </div>

      {/* Top Gold Laser Accent Line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-85 z-20" />

      {/* Main Content Container (Enlarged Height for Grand Car Visibility) */}
      <div className="relative z-10 px-4 sm:px-7 lg:px-9 py-4 sm:py-6 flex flex-col justify-between min-h-[260px] sm:min-h-[300px] md:min-h-[330px]">
        
        {/* Top Header: Category Tag, Horizontal Service Selector Tabs & Drawer Toggle */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold border flex items-center gap-1.5 shadow-xs backdrop-blur-md ${current.tagColor}`}>
                <CurrentIcon size={13} />
                <span>{current.tag}</span>
              </span>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-gold/20 text-gold border border-gold/40">
                {current.badge}
              </span>
              <span className="hidden xl:inline-block text-[9px] font-mono tracking-widest text-slate-200/90 font-bold uppercase drop-shadow-sm">
                // {current.carModelHint}
              </span>
            </div>

            {/* Right: Expand Full Catalog Drawer & Dismiss Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsCatalogExpanded(prev => !prev);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 backdrop-blur-md ${
                  isCatalogExpanded
                    ? 'bg-gold text-slate-950 border-gold shadow-md'
                    : 'bg-slate-900/70 hover:bg-slate-900 text-slate-200 hover:text-white border-white/15'
                }`}
                title="ყველა ციფრული სერვისის სრული სია"
              >
                <Layers size={13} />
                <span className="hidden sm:inline">ყველა სერვისი ({totalServices})</span>
                {isCatalogExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  setIsDismissed(true);
                }}
                className="w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="ბანერის დამალვა"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick Horizontal Direction Selector Tabs (Clean bright glowing pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            {DIGITAL_SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              const isActive = idx === currentIndex;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handleSelectService(idx)}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 border-gold shadow-md font-black'
                      : 'bg-slate-900/70 hover:bg-slate-900 text-slate-200 hover:text-white border-white/10 backdrop-blur-md'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-slate-950' : 'text-gold'} />
                  <span>{srv.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Two-Column Responsive Layout (Car in the center/right is wide open to view!) */}
        <div className="my-2 sm:my-3 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
          {/* Left Column: Title, Subtitle, Full Explanation & Bullets (7 cols) */}
          <div className="lg:col-span-7 space-y-2.5 max-w-2xl">
            <div>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-gold font-bold uppercase drop-shadow-sm">
                {current.subtitle}
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                {current.title}
              </h2>
            </div>

            {/* Detailed Explanation ("თავისი განმარტებით") */}
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium drop-shadow-md line-clamp-3 sm:line-clamp-none">
              {current.description}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {current.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md bg-slate-950/65 border border-white/15 text-[10px] sm:text-[11px] font-bold text-white shadow-xs truncate"
                >
                  <CheckCircle2 size={13} className="text-gold shrink-0" />
                  <span className="truncate">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sleek Frosted Glass HUD Widget (Compact & aligned to right, letting the car in center shine!) */}
          <div className="lg:col-span-5 flex items-center justify-end">
            {renderVisualCard()}
          </div>
        </div>

        {/* Bottom Bar: CTA Buttons, Secondary Quick Link, Carousel Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80">
          {/* CTA Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAction(current)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs sm:text-sm font-black shadow-lg hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group/btn"
            >
              <span>{current.ctaText}</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {current.secondaryCtaText && (
              <button
                type="button"
                onClick={() => handleSecondaryAction(current)}
                className="hidden sm:inline-flex px-3 py-2 rounded-xl backdrop-blur-md bg-slate-900/70 hover:bg-slate-900 text-slate-200 hover:text-white text-xs font-bold border border-white/15 shadow-xs transition-colors"
              >
                {current.secondaryCtaText}
              </button>
            )}
          </div>

          {/* Carousel Arrows & Number Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-mono font-bold text-slate-300">
              <span className="text-gold font-black">{currentIndex + 1}</span> / {totalServices}
            </span>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="წინა სერვისი"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="შემდეგი სერვისი"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Full Catalog Drawer (ყველა 7 ციფრული სერვისი თემატური ავტო ფოტოებით) */}
      {isCatalogExpanded && (
        <div className="relative z-20 border-t border-slate-800 bg-slate-950/98 p-4 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-bold">
                <Layers size={15} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  AutoHub-ის 7 ძირითადი ციფრული სერვისი & დეტალური განმარტებები
                </h3>
                <p className="text-xs text-slate-400">
                  აირჩიეთ ნებისმიერი სერვისი და გადადით შესაბამის მოდულში
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCatalogExpanded(false)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              ჩაკეცვა
            </button>
          </div>

          {/* 7 Services Cards Grid with Thematic Car Thumbnails */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {DIGITAL_SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              const isActive = idx === currentIndex;
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    handleSelectService(idx);
                    setIsCatalogExpanded(false);
                  }}
                  className={`rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isActive
                      ? 'border-gold bg-gold/10 shadow-lg ring-1 ring-gold/40'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Thematic Car Thumbnail */}
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={srv.imageUrl}
                      alt={srv.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-mono font-bold text-gold border border-gold/30">
                      <Icon size={11} />
                      <span>{srv.shortName}</span>
                    </div>
                    <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-black text-white leading-tight">
                        {srv.title}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 font-normal mt-1">
                        {srv.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-gold truncate">
                        {srv.badge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(srv);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gold text-slate-950 text-[10px] font-black hover:bg-amber-300 transition-colors shadow-xs"
                      >
                        გახსნა
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Notice Toast */}
      {noticeMessage && (
        <div className="absolute inset-x-3 bottom-3 z-30 p-2.5 rounded-xl bg-slate-900/95 text-white border border-gold/40 shadow-xl text-xs font-bold text-center flex items-center justify-between gap-2">
          <span className="truncate">{noticeMessage}</span>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-slate-400 hover:text-white shrink-0 p-1"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CoverAdBanner;
