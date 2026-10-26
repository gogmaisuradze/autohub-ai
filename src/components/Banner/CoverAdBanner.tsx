import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Cog,
  Car,
  Disc,
  Zap,
  Snowflake,
  Flame,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { TabType } from '../Navigation';
import { sounds } from '../../services/soundEffects';

export interface ServiceDirection {
  id: string;
  shortName: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  badge: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accentColor: string;
  ctaText: string;
  actionTab?: TabType;
}

export const SERVICE_DIRECTIONS: ServiceDirection[] = [
  {
    id: 'engine',
    shortName: 'ძრავი & კოლოფი',
    title: 'ძრავის, გადაცემათა კოლოფისა და ზეთის სრული სერვისი',
    subtitle: 'ENGINE, TRANSMISSION & FLUID SERVICES',
    tag: '⚙️ ძრავის მიმართულება • ENGINE PRO',
    tagColor: 'bg-amber-500/20 text-gold border-gold/40',
    badge: 'ENGINE & TRANS',
    description: 'კომპიუტერული დიაგნოსტიკა, ძრავის კაპიტალური და მიმდინარე შეკეთება, ზეთისა და ფილტრების შეცვლა, გადაცემათა კოლოფის (ავტომატიკა, მექანიკა, ვარიატორი, DSG) სრული დიაგნოსტიკა და სითხეების შეცვლა ორიგინალი სტანდარტით.',
    highlights: [
      'კომპიუტერული დიაგნოსტიკა',
      'ზეთისა & ფილტრების შეცვლა',
      'ავტომატიკა / DSG კოლოფები',
      'გარანტია სამუშაოზე'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1600&q=80',
    icon: Cog,
    accentColor: '#C5A059',
    ctaText: 'ძრავის სერვისის დაჯავშნა',
    actionTab: 'service'
  },
  {
    id: 'suspension',
    shortName: 'სავალი ნაწილი',
    title: 'სავალი ნაწილის (პერედოკის) შეკეთება & 3D თვლების შეყრა',
    subtitle: 'CHASSIS, SUSPENSION & 3D WHEEL ALIGNMENT',
    tag: '🚗 სავალი ნაწილი • CHASSIS EXPERT',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    badge: 'CHASSIS & ALIGN',
    description: 'პერედოკის დეტალური დიაგნოსტიკა, ამორტიზატორების, გიტარების, რაზვალის ვტულკების, სტაბილიზატორების, ყუმბარებისა და საჭის მექანიზმის (რულავოის) აღდგენა/შეცვლა. უახლესი ლაზერული 3D თვლების შეყრა (რაზვალი).',
    highlights: [
      'პერედოკის სრული შემოწმება',
      'ამორტიზატორები & გიტარები',
      'ლაზერული 3D შეყრა (რაზვალი)',
      'საჭის მექანიზმის სერვისი'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80',
    icon: Car,
    accentColor: '#38BDF8',
    ctaText: 'სავალი ნაწილის დაჯავშნა',
    actionTab: 'service'
  },
  {
    id: 'brakes',
    shortName: 'სამუხრუჭე',
    title: 'სამუხრუჭე სისტემის დიაგნოსტიკა & უსაფრთხოება',
    subtitle: 'BRAKE SYSTEM, ROTORS, PADS & ABS/ESP',
    tag: '🛑 სამუხრუჭე სისტემა • BRAKE SAFETY',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    badge: 'BRAKE PRO',
    description: 'სამუხრუჭე ხუნდების (კალოტკების) და დისკების შეცვლა/გათლა, სამუხრუჭე მილების ჰერმეტულობა, ABS/ESP ჰიდრავლიკური ბლოკის ტესტირება და სამუხრუჭე სითხის (DOT 4 / DOT 5.1) აპარატურული გამოცვლა.',
    highlights: [
      'ორიგინალი ხუნდების შეცვლა',
      'დისკების გათლა & გასწორება',
      'ABS / ESP ელექტრონიკა',
      'სამუხრუჭე სითხის აპარატურა'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80',
    icon: Disc,
    accentColor: '#F43F5E',
    ctaText: 'მუხრუჭების დაჯავშნა',
    actionTab: 'service'
  },
  {
    id: 'electrics',
    shortName: 'ელექტროობა',
    title: 'ავტო-ელექტროობა, სენსორები & ECU პროგრამირება',
    subtitle: 'AUTO ELECTRICS, WIRING & COMPUTER CODING',
    tag: '⚡ ელექტროობა • AUTO ELECTRICS',
    tagColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    badge: 'ECU & WIRING',
    description: 'სრული ელექტროგაყვანილობის შემოწმება, გენერატორისა და სტარტერის აღდგენა, აკუმულატორის პროფესიული ტესტირება/დატენვა, სენსორების (O2 ლამბდა, MAF, ABS) კალიბრაცია და ECU ბლოკების ადაპტაცია.',
    highlights: [
      'სრული ელექტროგაყვანილობა',
      'სტარტერი & გენერატორი',
      'ECU ბლოკების ადაპტაცია',
      'სენსორების კალიბრაცია'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=1600&q=80',
    icon: Zap,
    accentColor: '#EAB308',
    ctaText: 'ელექტროობის დაჯავშნა',
    actionTab: 'obd'
  },
  {
    id: 'cooling',
    shortName: 'კონდიცირება',
    title: 'კონდიციონერის შევსება & გაგრილების სისტემა',
    subtitle: 'A/C CLIMATE CONTROL & RADIATOR COOLING',
    tag: '❄️ გაგრილება • CLIMATE CONTROL',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    badge: 'CLIMATE PRO',
    description: 'კონდიციონერის სისტემის ჰერმეტულობის ვაკუუმ-ტესტირება, ფრეონით (R134a / R1234yf) და ზეთით შევსება, რადიატორების ულტრაბგერითი გამორეცხვა, თერმოსტატისა და წყლის ტუმბოს (პომპის) შეცვლა.',
    highlights: [
      'ფრეონის ზუსტი შევსება',
      'სისტემის ვაკუუმ-ტესტი',
      'რადიატორების გამორეცხვა',
      'ანტიფრიზის შეცვლა'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1600&q=80',
    icon: Snowflake,
    accentColor: '#06B6D4',
    ctaText: 'კონდიციონერის დაჯავშნა',
    actionTab: 'service'
  },
  {
    id: 'tires',
    shortName: 'საბურავები',
    title: 'პრემიუმ საბურავები, 3D ბალანსირება & დისკები',
    subtitle: 'TIRE SERVICE, 3D BALANCING & WHEEL REPAIR',
    tag: '🛞 საბურავები • TIRE PRO GEORGIA',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    badge: 'TIRE & RIMS',
    description: 'სეზონური საბურავების მონტაჟი, 3D ლაზერული ბალანსირება, დისკების გასწორება/შედუღება, საბურავების შეკეთება (ვულკანიზაცია) და წნევის ოპტიმიზაცია აზოტით. Michelin, Continental, Bridgestone.',
    highlights: [
      'საბურავების მონტაჟი',
      '3D ლაზერული ბალანსირება',
      'დისკების გასწორება',
      'აზოტით დაბერვა'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1600&q=80',
    icon: Flame,
    accentColor: '#F97316',
    ctaText: 'საბურავების სერვისი',
    actionTab: 'service'
  },
  {
    id: 'detailing',
    shortName: 'დითეილინგი',
    title: 'Detailing, 9H კერამიკული დაცვა & ქიმწმენდა',
    subtitle: 'PREMIUM DETAILING, PPF & NANO-CERAMIC',
    tag: '✨ დითეილინგი • LUXURY DETAILING',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    badge: 'DETAILING PRO',
    description: 'სამსაფეხურიანი კორექციული პოლირება, ნანო-კერამიკული დამცავი საფარი (9H Ceramic), სალონის ღრმა ანტიბაქტერიული ქიმწმენდა ორთქლით, ტყავის კვება და ანტიგრავილური დამცავი ფირები (PPF).',
    highlights: [
      '9H ნანო-კერამიკული საფარი',
      'სალონის ღრმა ქიმწმენდა',
      'კორექციული პოლირება',
      'PPF დამცავი ფირები'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1600&q=80',
    icon: Sparkles,
    accentColor: '#A855F7',
    ctaText: 'დითეილინგის დაჯავშნა',
    actionTab: 'service'
  },
  {
    id: 'legal_insurance',
    shortName: 'დაზღვევა & PTI',
    title: 'ავტოდაზღვევა (CASCO), ტექ-ინსპექტირება & ჯარიმები',
    subtitle: 'CASCO INSURANCE, PTI INSPECTION & FINES',
    tag: '🛡️ დაზღვევა & PTI • LEGAL PARTNER',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    badge: 'CASCO & PTI',
    description: 'სრული CASCO ავტოდაზღვევა 20%-იანი ფასდაკლებით + უფასო ევაკუატორი 24/7 საქართველოს მასშტაბით. ავტომობილის მომზადება სავალდებულო პერიოდული ტექ-ინსპექტირებისთვის (PTI) და ვიდეოჯარიმების მონიტორინგი.',
    highlights: [
      'CASCO დაზღვევა 20% OFF',
      'უფასო ევაკუატორი 24/7',
      'ტექ-დათვალიერებისთვის მომზადება',
      'ვიდეოჯარიმების მონიტორინგი'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    icon: ShieldCheck,
    accentColor: '#10B981',
    ctaText: 'დაზღვევის გააქტიურება',
    actionTab: 'fines'
  }
];

interface Props {
  onNavigateTab?: (tab: TabType) => void;
  onOpenBookingModal?: () => void;
}

export const CoverAdBanner: React.FC<Props> = ({
  onNavigateTab,
  onOpenBookingModal
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalDirections = SERVICE_DIRECTIONS.length;
  const current = SERVICE_DIRECTIONS[currentIndex];
  const CurrentIcon = current.icon;

  // Auto-advance slides every 7 seconds when not paused
  useEffect(() => {
    if (isPaused || isDismissed || isCatalogExpanded) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalDirections);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isDismissed, isCatalogExpanded, totalDirections]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setCurrentIndex((prev) => (prev - 1 + totalDirections) % totalDirections);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setCurrentIndex((prev) => (prev + 1) % totalDirections);
  };

  const handleSelectDirection = (index: number) => {
    sounds.playClick();
    setCurrentIndex(index);
  };

  const handleAction = (direction = current) => {
    sounds.playSuccess();
    if (direction.id === 'legal_insurance') {
      if (onNavigateTab) {
        onNavigateTab('fines');
      }
      setNoticeMessage('⭐ CASCO & დაზღვევა: პარტნიორის 20%-იანი ფასდაკლების ფორმა გააქტიურდა!');
      setTimeout(() => setNoticeMessage(null), 5000);
    } else if (direction.id === 'electrics' && onNavigateTab) {
      onNavigateTab('obd');
    } else if (onOpenBookingModal) {
      onOpenBookingModal();
    } else if (onNavigateTab) {
      onNavigateTab('service');
    }
  };

  // Re-open pill if user temporarily dismissed the banner
  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setIsDismissed(false);
          }}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-navy text-gold text-xs font-bold border border-gold/40 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 group"
        >
          <Tag size={13} className="text-gold group-hover:scale-110 transition-transform" />
          <span>📢 სერვისების ქავერი & აქციები (გამოჩენა)</span>
        </button>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-700/60 transition-all bg-slate-950"
    >
      {/* Background Cover Image with Zoom Effect */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden">
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center transform transition-all duration-1000 ease-out scale-105 group-hover:scale-110 opacity-65"
        />
        {/* Cinematic Multi-layered Vignette & Dark Gradient for Flawless Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/35" />
      </div>

      {/* Decorative Gold Laser Border Glow */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />

      {/* Main Content Area (Enlarged Height & Width Proportion) */}
      <div className="relative z-10 px-4 sm:px-7 lg:px-9 py-4 sm:py-6 flex flex-col justify-between min-h-[220px] sm:min-h-[260px] md:min-h-[290px]">
        
        {/* Top Header: Tag, Service Category Selector Pills & Dismiss Button */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold border flex items-center gap-1.5 shadow-xs ${current.tagColor}`}>
                <CurrentIcon size={13} />
                <span>{current.tag}</span>
              </span>
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-gold/20 text-gold border border-gold/40">
                {current.badge}
              </span>
            </div>

            {/* Right: Expand Catalog Button & Dismiss (X) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsCatalogExpanded(prev => !prev);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                  isCatalogExpanded
                    ? 'bg-gold text-slate-950 border-gold shadow-md'
                    : 'bg-slate-900/70 hover:bg-slate-900 text-slate-300 hover:text-white border-white/10'
                }`}
                title="ყველა მიმართულების სრული სია"
              >
                <Layers size={13} />
                <span className="hidden sm:inline">ყველა სერვისი ({totalDirections})</span>
                {isCatalogExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  setIsDismissed(true);
                }}
                className="w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="ბანერის დამალვა"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick-Scrollable Horizontal Direction Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            {SERVICE_DIRECTIONS.map((dir, idx) => {
              const Icon = dir.icon;
              const isActive = idx === currentIndex;
              return (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => handleSelectDirection(idx)}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-gold text-slate-950 border-gold shadow-sm font-black'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/60'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-slate-950' : 'text-gold'} />
                  <span>{dir.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Title, Subtitle, Full Explanation & Highlights */}
        <div className="my-2.5 sm:my-3 max-w-3xl space-y-2">
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-gold/90 font-bold uppercase">
              {current.subtitle}
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {current.title}
            </h2>
          </div>

          {/* Full Explanation ("თავისი განმარტებით") */}
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium drop-shadow-sm line-clamp-3 sm:line-clamp-none">
            {current.description}
          </p>

          {/* Key Highlight Bullets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {current.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/70 border border-slate-700/50 text-[10px] sm:text-[11px] font-bold text-slate-200 truncate"
              >
                <CheckCircle2 size={12} className="text-gold shrink-0" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Action Button, Carousel Arrows & Indicators */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Main Action Button */}
          <button
            type="button"
            onClick={() => handleAction(current)}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs sm:text-sm font-black shadow-lg hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group/btn"
          >
            <Calendar size={15} />
            <span>{current.ctaText}</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>

          {/* Carousel Arrows & Number Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-mono font-bold text-slate-400">
              <span className="text-gold font-black">{currentIndex + 1}</span> / {totalDirections}
            </span>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="წინა მიმართულება"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="შემდეგი მიმართულება"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Full Catalog Drawer (ყველა სერვისის მიმართულება ერთად) */}
      {isCatalogExpanded && (
        <div className="relative z-20 border-t border-slate-800 bg-slate-950/98 p-4 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-bold">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  ყველა სერვისის მიმართულება & დეტალური განმარტებები
                </h3>
                <p className="text-xs text-slate-400">
                  აირჩიეთ ნებისმიერი მიმართულება და გაეცანით რას მოიცავს სრული სერვისი
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

          {/* 8 Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SERVICE_DIRECTIONS.map((dir, idx) => {
              const Icon = dir.icon;
              const isActive = idx === currentIndex;
              return (
                <div
                  key={dir.id}
                  onClick={() => {
                    handleSelectDirection(idx);
                    setIsCatalogExpanded(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isActive
                      ? 'border-gold bg-gold/10 shadow-md ring-1 ring-gold/40'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-gold flex items-center justify-center shadow-xs">
                        <Icon size={16} />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="text-xs font-black text-white leading-tight">
                      {dir.title}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-3 font-normal">
                      {dir.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-gold">
                      {dir.shortName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(dir);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-gold text-slate-950 text-[10px] font-black hover:bg-amber-300 transition-colors"
                    >
                      დაჯავშნა
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Notice Toast */}
      {noticeMessage && (
        <div className="absolute inset-x-3 bottom-3 z-30 p-2.5 rounded-xl bg-slate-900/95 text-white border border-gold/40 shadow-xl text-xs font-bold text-center animate-slide-up flex items-center justify-between gap-2">
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
