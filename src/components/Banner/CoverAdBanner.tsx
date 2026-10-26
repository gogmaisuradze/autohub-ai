import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Wrench,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  ExternalLink,
  Tag
} from 'lucide-react';
import { TabType } from '../Navigation';
import { sounds } from '../../services/soundEffects';

interface AdSlide {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  ctaText: string;
  imageUrl: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  actionType: 'booking' | 'fines' | 'insurance' | 'tires';
  accentColor: string;
}

const AD_SLIDES: AdSlide[] = [
  {
    id: 'ad-insurance',
    tag: '⭐ ოფიციალური პარტნიორი • CASCO VIP',
    tagColor: 'bg-amber-500/20 text-gold border-gold/40',
    title: 'ავტოდაზღვევა 20%-იანი ფასდაკლებით',
    description: 'სრული CASCO დაცვა + უფასო ევაკუატორი 24/7 საქართველოს მასშტაბით. გაიაქტიურეთ ონლაინ 2 წუთში!',
    ctaText: 'დაზღვევის გააქტიურება',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    icon: ShieldCheck,
    actionType: 'insurance',
    accentColor: '#C5A059'
  },
  {
    id: 'ad-service',
    tag: '🔧 AUTOHUB სერვის ცენტრი • 15% OFF',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    title: 'ძრავის სრული დიაგნოსტიკა & ზეთის შეცვლა',
    description: 'ორიგინალი გერმანული ზეთები (Castrol & Mobil 1) და ფილტრები გარანტიით. ჩაეწერეთ რიგის გარეშე!',
    ctaText: 'სერვისის დაჯავშნა',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1600&q=80',
    icon: Wrench,
    actionType: 'booking',
    accentColor: '#10B981'
  },
  {
    id: 'ad-tires',
    tag: '🛞 სეზონური აქცია • TIRE PRO GEORGIA',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    title: 'პრემიუმ საბურავები + უფასო მონტაჟი',
    description: 'Michelin, Continental, Bridgestone — 4 საბურავის შეძენისას მიიღეთ ბალანსირება და აზოტი საჩუქრად!',
    ctaText: 'კატალოგის ნახვა',
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1600&q=80',
    icon: Flame,
    actionType: 'tires',
    accentColor: '#F97316'
  },
  {
    id: 'ad-fines',
    tag: '⚡ POLICE.GE • 20% DISCOUNT',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    title: 'ვიდეოჯარიმების მყისიერი SMS გაფრთხილება',
    description: 'შეიტყვეთ ვიდეოჯარიმის დაფიქსირებისთანავე და ისარგებლეთ 20%-იანი საშეღავათო ფასდაკლებით!',
    ctaText: 'ჯარიმების შემოწმება',
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80',
    icon: Sparkles,
    actionType: 'fines',
    accentColor: '#38BDF8'
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = AD_SLIDES.length;
  const currentSlide = AD_SLIDES[currentSlideIndex];

  // Auto-advance slides every 6.5 seconds when not paused
  useEffect(() => {
    if (isPaused || isDismissed) return;

    timerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isDismissed, totalSlides]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleSelectSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    setCurrentSlideIndex(index);
  };

  const handleAction = () => {
    sounds.playSuccess();
    switch (currentSlide.actionType) {
      case 'booking':
        if (onOpenBookingModal) {
          onOpenBookingModal();
        } else if (onNavigateTab) {
          onNavigateTab('service');
        }
        break;
      case 'fines':
        if (onNavigateTab) {
          onNavigateTab('fines');
        }
        break;
      case 'insurance':
        setNoticeMessage('⭐ CASCO პარტნიორი: TBC Insurance / GPI Holding-ის 20%-იანი ფასდაკლების ფორმა გააქტიურებულია!');
        setTimeout(() => setNoticeMessage(null), 5000);
        break;
      case 'tires':
        setNoticeMessage('🛞 TIRE PRO: ონლაინ კატალოგი & უფასო მონტაჟის აქცია გააქტიურებულია!');
        setTimeout(() => setNoticeMessage(null), 5000);
        break;
      default:
        break;
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
          className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-navy text-gold text-[11px] font-bold border border-gold/40 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 group"
        >
          <Tag size={12} className="text-gold group-hover:scale-110 transition-transform" />
          <span>სარეკლამო ქავერი (გამოჩენა)</span>
        </button>
      </div>
    );
  }

  const SlideIcon = currentSlide.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-700/50 group transition-all"
    >
      {/* Background Cover Image with Zoom Effect */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden">
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.title}
          className="w-full h-full object-cover object-center transform transition-all duration-1000 ease-out scale-105 group-hover:scale-110 opacity-70"
        />
        {/* Cinematic Multi-layered Vignette & Dark Gradient for Flawless Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />
      </div>

      {/* Decorative Gold Laser Border Glow */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

      {/* Content Container */}
      <div className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        
        {/* Top Row: Sponsor Tag & Dismiss Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold border flex items-center gap-1.5 shadow-xs ${currentSlide.tagColor}`}>
              <SlideIcon size={12} />
              <span>{currentSlide.tag}</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/10 text-slate-300 border border-white/20">
              PROMO
            </span>
          </div>

          {/* Dismiss (Hide) Button */}
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

        {/* Center: Title & Description */}
        <div className="my-2 sm:my-3 max-w-2xl space-y-1 sm:space-y-1.5">
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {currentSlide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-snug line-clamp-2 drop-shadow-sm font-medium">
            {currentSlide.description}
          </p>
        </div>

        {/* Bottom Row: CTA Button & Carousel Controls */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Action Button */}
          <button
            type="button"
            onClick={handleAction}
            className="px-4 sm:px-5 py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs sm:text-sm font-black shadow-md hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group/btn"
          >
            <span>{currentSlide.ctaText}</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>

          {/* Carousel Arrows & Dot Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {AD_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={(e) => handleSelectSlide(idx, e)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? 'w-6 bg-gold shadow-xs'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={slide.title}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="წინა"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                title="შემდეგი"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
