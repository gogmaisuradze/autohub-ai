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
  Wifi,
  Sparkles,
  Clock,
  Car,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Check,
  Radio,
  Zap,
  Award
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
    tagColor: 'bg-amber-100/90 text-amber-900 border-amber-300/80',
    accentColor: '#D97706',
    badgeBg: 'bg-amber-500/10 text-amber-800 border-amber-300',
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
    tagColor: 'bg-rose-100/90 text-rose-900 border-rose-300/80',
    accentColor: '#E11D48',
    badgeBg: 'bg-rose-500/10 text-rose-800 border-rose-300',
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
    subtitle: 'CITY PARKING, ZONAL PASSES & INSTANT SMS PAYMENT',
    badge: 'PARKING PRO',
    tag: '🅿️ პარკინგის სისტემა • PARKING PRO',
    tagColor: 'bg-blue-100/90 text-blue-900 border-blue-300/80',
    accentColor: '#2563EB',
    badgeBg: 'bg-blue-500/10 text-blue-800 border-blue-300',
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
    tagColor: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/80',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
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
    tagColor: 'bg-cyan-100/90 text-cyan-900 border-cyan-300/80',
    accentColor: '#0891B2',
    badgeBg: 'bg-cyan-500/10 text-cyan-800 border-cyan-300',
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
    tagColor: 'bg-indigo-100/90 text-indigo-900 border-indigo-300/80',
    accentColor: '#4F46E5',
    badgeBg: 'bg-indigo-500/10 text-indigo-800 border-indigo-300',
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
    tagColor: 'bg-purple-100/90 text-purple-900 border-purple-300/80',
    accentColor: '#7C3AED',
    badgeBg: 'bg-purple-500/10 text-purple-800 border-purple-300',
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
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 text-navy text-xs font-bold border border-stone-300 shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 group"
        >
          <Tag size={13} className="text-gold-600 group-hover:scale-110 transition-transform" />
          <span>📢 AutoHub ციფრული სერვისები (გამოჩენა)</span>
        </button>
      </div>
    );
  }

  // Visual Interactive Preview Card Renderer (Right Column)
  const renderVisualCard = () => {
    switch (current.previewType) {
      case 'obd_gauge':
        return (
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-md flex flex-col justify-between gap-3 text-navy">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-stone-700">OBD-II Bluetooth 5.0</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-mono font-black border border-amber-200">
                14.2 V • LIVE
              </span>
            </div>

            {/* Live Telemetry Dial / Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="text-[10px] font-mono text-stone-500 uppercase">RPM</div>
                <div className="text-base sm:text-lg font-black text-navy font-mono">780</div>
                <div className="text-[9px] text-emerald-600 font-bold">ნორმა</div>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="text-[10px] font-mono text-stone-500 uppercase">ტემპერატურა</div>
                <div className="text-base sm:text-lg font-black text-navy font-mono">92°C</div>
                <div className="text-[9px] text-emerald-600 font-bold">ოპტიმალური</div>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="text-[10px] font-mono text-stone-500 uppercase">წნევა</div>
                <div className="text-base sm:text-lg font-black text-navy font-mono">38 PSI</div>
                <div className="text-[9px] text-emerald-600 font-bold">სტაბილური</div>
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 size={14} className="text-emerald-500" />
                DTC: 0 შეცდომა (Clean)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-navy/5 text-navy text-[10px] font-bold">
                🤖 AI მექანიკოსი
              </span>
            </div>
          </div>
        );

      case 'fines_card':
        return (
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-rose-200/80 shadow-md flex flex-col justify-between gap-3 text-navy">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <ShieldAlert size={15} className="text-rose-600" />
                <span>Police.ge რადარი #GEO-412</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-bold border border-rose-200">
                ცოცხალი ბაზა
              </span>
            </div>

            {/* Violation Details with 20% discount highlight */}
            <div className="space-y-1.5 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
              <div className="text-xs font-black text-stone-900">
                სიჩქარის გადაჭარბება (+24 კმ/სთ)
              </div>
              <div className="text-[11px] text-stone-600">
                თბილისი-სენაკი KM 34 • ვიდეოკამერა
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xs text-stone-400 line-through">50.00 ₾</span>
                <span className="text-lg font-black text-emerald-600 font-mono">40.00 ₾</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  -20% ფასდაკლება
                </span>
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <Clock size={13} />
                დარჩენილია 7 დღე
              </span>
              <span className="text-stone-500 font-mono text-[10px]">
                ქულები: 100 / 100
              </span>
            </div>
          </div>
        );

      case 'parking_zone':
        return (
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-blue-200/80 shadow-md flex flex-col justify-between gap-3 text-navy">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <ParkingSquare size={15} className="text-blue-600" />
                <span>მუნიციპალური პარკინგი</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                თბილისი • ზონა A
              </span>
            </div>

            <div className="space-y-1.5 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900">რუსთაველის გამზირი #14</span>
                <span className="text-xs font-mono font-bold text-blue-700">1.00 ₾ / სთ</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-xs font-mono font-black text-navy flex items-center gap-1">
                  <Clock size={13} className="text-blue-600" />
                  <span>00:46:18</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">
                  ✓ აქტიური პარკირება
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
              <span className="text-stone-600 font-bold">SMS 9110 გაგზავნილია</span>
              <span className="text-[10px] font-mono text-stone-500">22:00-მდე ფასიანი</span>
            </div>
          </div>
        );

      case 'log_timeline':
        return (
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-md flex flex-col justify-between gap-3 text-navy">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <BookOpen size={15} className="text-emerald-600" />
                <span>ციფრული სერვის-წიგნაკი</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                124,500 კმ
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Check size={13} className="text-emerald-600" />
                  <span>ძრავის ზეთი (5W-30)</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 font-black">92% რესურსი</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Check size={13} className="text-emerald-600" />
                  <span>სამუხრუჭე ხუნდები</span>
                </div>
                <span className="text-[11px] font-mono text-amber-600 font-black">+7,500 კმ</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
              <span className="text-stone-500 font-medium">შემდეგი: 128,000 კმ</span>
              <span className="font-bold text-navy">ჯამი: 420 ₾</span>
            </div>
          </div>
        );

      case 'radar_hud':
        return (
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-cyan-200/80 shadow-md flex flex-col justify-between gap-3 text-navy">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800">
                <Radio size={15} className="text-cyan-600 animate-pulse" />
                <span>რადარების დეტექტორი</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-mono font-bold border border-cyan-200">
                GPS LIVE
              </span>
            </div>

            <div className="space-y-2 bg-cyan-50/40 p-2.5 rounded-xl border border-cyan-100">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-stone-900">
                  ⚠️ სიჩქარის რადარი • 350მ წინ
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 bg-white flex items-center justify-center text-xs font-black text-rose-600 shadow-xs">
                  80
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-600">მიმდინარე სიჩქარე:</span>
                <span className="font-mono font-black text-emerald-600">72 კმ/სთ (უსაფრთხო)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
              <span className="text-cyan-700 font-bold">Bus Lane კამერა</span>
              <span className="text-emerald-600 font-bold">🟢 გზა თავისუფალია</span>
            </div>
          </div>
        );

      case 'exam_badge':
        return (
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-indigo-200/80 shadow-md flex flex-col justify-between gap-3 text-navy">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                <GraduationCap size={15} className="text-indigo-600" />
                <span>საგამოცდო ბილეთები 2026</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200">
                კატეგორია B
              </span>
            </div>

            <div className="space-y-1.5 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100">
              <div className="flex items-center justify-between text-xs font-black text-stone-900">
                <span>ბილეთი №14</span>
                <span className="font-mono text-indigo-600">კითხვა 18 / 30</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full w-[60%]"></div>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-stone-600">⏱️ დრო: 22:45</span>
                <span className="text-emerald-600 font-bold">შეცდომები: 0 / 3</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
              <span className="text-indigo-700 font-bold">მზადყოფნა: 94%</span>
              <span className="text-stone-500 font-mono text-[10px]">33 თემატიკა</span>
            </div>
          </div>
        );

      case 'vin_report':
        return (
          <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-purple-200/80 shadow-md flex flex-col justify-between gap-3 text-navy">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
                <ShieldCheck size={15} className="text-purple-600" />
                <span>Carfax & Copart ანგარიში</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-200">
                VERIFIED
              </span>
            </div>

            <div className="space-y-1.5 bg-purple-50/40 p-2.5 rounded-xl border border-purple-100 text-[11px]">
              <div className="font-mono font-bold text-stone-900">VIN: WBA3...9281 (BMW 330i)</div>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Check size={12} />
                  <span>გარბენი: 87k mi</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Check size={12} />
                  <span>Airbags: გაუხსნელი</span>
                </div>
                <div className="flex items-center gap-1 text-stone-700 font-medium">
                  <span>• აუქციონი: Copart</span>
                </div>
                <div className="flex items-center gap-1 text-stone-700 font-medium">
                  <span>• 1 მფლობელი აშშ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
              <span className="text-purple-700 font-bold">სტატუსი: Clean Title</span>
              <span className="text-emerald-600 font-bold">Run & Drive</span>
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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-white via-[#FAF9F5] to-[#F1EFEA] border border-[#DFDAD0] shadow-[0_8px_30px_rgba(20,33,61,0.06)] transition-all"
    >
      {/* Subtle Top Gold Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-navy via-gold to-navy opacity-85" />

      {/* Main Container */}
      <div className="relative z-10 px-4 sm:px-7 lg:px-9 py-4 sm:py-5 flex flex-col justify-between min-h-[220px] sm:min-h-[250px]">
        
        {/* Top Header: Category Tag, Horizontal Service Selector Tabs & Drawer Toggle */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold border flex items-center gap-1.5 shadow-xs ${current.tagColor}`}>
                <CurrentIcon size={13} />
                <span>{current.tag}</span>
              </span>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-stone-200/80 text-navy border border-stone-300">
                {current.badge}
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
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                  isCatalogExpanded
                    ? 'bg-navy text-white border-navy shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
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
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-navy flex items-center justify-center transition-colors border border-stone-300"
                title="ბანერის დამალვა"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick Horizontal Direction Selector Tabs (Clean bright pills) */}
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
                      ? 'bg-navy text-white border-navy shadow-sm font-black'
                      : 'bg-white/90 hover:bg-white text-stone-700 hover:text-navy border-stone-300/80'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-gold' : 'text-stone-500'} />
                  <span>{srv.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Two-Column Responsive Layout (Left: Description, Right: Visual Mockup) */}
        <div className="my-2.5 sm:my-3 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
          {/* Left Column: Title, Subtitle, Full Explanation & Bullets (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-wider text-stone-500 font-bold uppercase">
                {current.subtitle}
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-navy tracking-tight leading-tight">
                {current.title}
              </h2>
            </div>

            {/* Detailed Explanation ("თავისი განმარტებით") */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
              {current.description}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {current.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200/90 text-[10px] sm:text-[11px] font-bold text-stone-800 shadow-2xs truncate"
                >
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Interactive Mockup Card (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            {renderVisualCard()}
          </div>
        </div>

        {/* Bottom Bar: CTA Buttons, Secondary Quick Link, Carousel Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-stone-200/80">
          {/* CTA Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAction(current)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-navy hover:bg-navy-800 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group/btn"
            >
              <span>{current.ctaText}</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {current.secondaryCtaText && (
              <button
                type="button"
                onClick={() => handleSecondaryAction(current)}
                className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 hover:text-navy text-xs font-bold border border-stone-300 shadow-2xs transition-colors"
              >
                {current.secondaryCtaText}
              </button>
            )}
          </div>

          {/* Carousel Arrows & Number Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-mono font-bold text-stone-500">
              <span className="text-navy font-black">{currentIndex + 1}</span> / {totalServices}
            </span>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-stone-100 text-stone-700 hover:text-navy flex items-center justify-center transition-colors border border-stone-300 shadow-2xs"
                title="წინა სერვისი"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-stone-100 text-stone-700 hover:text-navy flex items-center justify-center transition-colors border border-stone-300 shadow-2xs"
                title="შემდეგი სერვისი"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Full Catalog Drawer (ყველა 7 ციფრული სერვისი ერთად) */}
      {isCatalogExpanded && (
        <div className="relative z-20 border-t border-stone-200 bg-stone-50/98 p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-navy text-white flex items-center justify-center font-bold">
                <Layers size={15} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-navy">
                  AutoHub-ის 7 ძირითადი ციფრული სერვისი & დეტალური განმარტებები
                </h3>
                <p className="text-xs text-stone-500">
                  აირჩიეთ ნებისმიერი სერვისი და გადადით შესაბამის მოდულში
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCatalogExpanded(false)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-stone-600 hover:text-navy border border-stone-300"
            >
              ჩაკეცვა
            </button>
          </div>

          {/* 7 Services Cards Grid */}
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
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isActive
                      ? 'border-navy bg-white shadow-md ring-2 ring-navy/20'
                      : 'border-stone-200 bg-white/80 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-stone-100 text-navy flex items-center justify-center shadow-xs">
                        <Icon size={16} />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-stone-400">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="text-xs font-black text-navy leading-tight">
                      {srv.title}
                    </div>
                    <p className="text-[11px] text-stone-600 leading-snug line-clamp-3 font-normal">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-stone-500">
                      {srv.shortName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(srv);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-navy text-white text-[10px] font-bold hover:bg-navy-800 transition-colors"
                    >
                      გახსნა
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Notice Toast */}
      {noticeMessage && (
        <div className="absolute inset-x-3 bottom-3 z-30 p-2.5 rounded-xl bg-navy text-white border border-gold/40 shadow-xl text-xs font-bold text-center flex items-center justify-between gap-2">
          <span className="truncate">{noticeMessage}</span>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-stone-300 hover:text-white shrink-0 p-1"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CoverAdBanner;
