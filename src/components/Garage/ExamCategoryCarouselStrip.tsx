import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Sparkles } from 'lucide-react';
import { ExamCategory } from './examCategories';
import { sounds } from '../../services/soundEffects';

interface CategoryItemDef {
  cat: ExamCategory;
  label: string;
  name_ge: string;
  count: number;
  icon: (className?: string) => React.ReactNode;
}

/**
 * 10 Minimalist Vector Vehicle Silhouettes matching the driving license category strip.
 */
export const CATEGORY_VEHICLE_ICONS: Record<string, (className?: string) => React.ReactNode> = {
  // 1. AM - Scooter / Moped
  AM: (className = 'w-7 h-5') => (
    <svg viewBox="0 0 32 24" className={className} fill="currentColor">
      {/* Rear & Front Wheels */}
      <circle cx="7" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="25" cy="18" r="4" fill="none" stroke="currentColor" strokeWidth="2.2" />
      {/* Scooter Frame & Body */}
      <path d="M6 14 C8 11, 12 11, 14 14 L19 14 L22 8 C23 6.8, 25 6, 27 6 L28 7.5 L25 8.5 L23 13 L26 15 L20 15 C18 15, 17 12, 14 12 L10 15 Z" />
      {/* Handlebar & Headlight */}
      <path d="M23 6 L27 5.5 L28 7.5 L24 8 Z" />
      {/* Seat */}
      <path d="M10 11 C10 9.5, 15 9.5, 16 11 Z" />
    </svg>
  ),

  // 2. B - Passenger Car (Sedan)
  B: (className = 'w-8 h-5') => (
    <svg viewBox="0 0 36 22" className={className} fill="currentColor">
      {/* Wheels */}
      <circle cx="9" cy="17" r="3.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="27" cy="17" r="3.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
      {/* Car Body Profile */}
      <path d="M3 14 L6 14 C7 11.5, 10.5 11.5, 11.5 14 L24.5 14 C25.5 11.5, 29 11.5, 30 14 L33.5 14 C34.5 14, 35 13, 34.5 12 L32 9.5 C31 8.5, 29.5 8, 28 8 L24 8 L18 4 C16.5 3, 14 3, 12 4 L7 8 L4 9 C2.5 9.5, 2 11, 2 12.5 Z" />
      {/* Windows Silhouette */}
      <path d="M13 5 C14.5 4.5, 16.5 4.5, 17.5 5 L23 8.5 L12 8.5 Z" fill="#FFFFFF" fillOpacity="0.4" />
      <path d="M18.5 5 L23.5 5 C25 5, 26.5 6, 27 7.5 L27.5 8.5 L18.5 8.5 Z" fill="#FFFFFF" fillOpacity="0.4" />
    </svg>
  ),

  // 3. A - Motorcycle
  A: (className = 'w-8 h-5') => (
    <svg viewBox="0 0 34 22" className={className} fill="currentColor">
      {/* Wheels */}
      <circle cx="7" cy="16" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="27" cy="16" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      {/* Bike Frame, Engine & Tank */}
      <path d="M7 16 L13 10 L18 10 L22 13 L27 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 10 L24 6 L25 8 L21 11 Z" />
      {/* Seat & Rear Cowl */}
      <path d="M11 9 C11 7.5, 16 7.5, 17 9 L13 10 Z" />
      {/* Handlebar & Windshield */}
      <path d="M22 6 L26 4 L27 6 L24 7 Z" />
      {/* Engine Block */}
      <circle cx="16" cy="14" r="2.5" />
    </svg>
  ),

  // 4. C - Heavy Commercial Truck / Semi
  C: (className = 'w-9 h-5') => (
    <svg viewBox="0 0 38 22" className={className} fill="currentColor">
      {/* Wheels */}
      <circle cx="7" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="25" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Truck Cab */}
      <path d="M3 14 L3 6 C3 4.5, 4 3.5, 5.5 3.5 L10 3.5 L12 7 L12 14 Z" />
      <path d="M5 5 L9.5 5 L11 7.5 L5 7.5 Z" fill="#FFFFFF" fillOpacity="0.4" />
      {/* Big Cargo Box / Semi Trailer */}
      <rect x="13" y="4" width="23" height="10" rx="1.5" />
    </svg>
  ),

  // 5. D - Passenger Transit Bus
  D: (className = 'w-9 h-5') => (
    <svg viewBox="0 0 38 22" className={className} fill="currentColor">
      {/* Wheels */}
      <circle cx="8" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="30" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Bus Body */}
      <rect x="3" y="4" width="32" height="11" rx="2" />
      {/* Windows Strip */}
      <rect x="5" y="6" width="5" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="11.5" y="6" width="5" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="18" y="6" width="5" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="24.5" y="6" width="5" height="4" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
    </svg>
  ),

  // 6. C1 - Delivery Van / Light Truck
  C1: (className = 'w-8 h-5') => (
    <svg viewBox="0 0 34 22" className={className} fill="currentColor">
      {/* Wheels */}
      <circle cx="8" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="26" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Van Body */}
      <path d="M3 14 L3 10 C3 9, 4 8, 5 7.5 L9 5 C10 4.5, 11 4.5, 12 4.5 L30 4.5 C31 4.5, 32 5.5, 32 6.5 L32 14 Z" />
      {/* Front Cab Window */}
      <path d="M5 8.5 L8.5 6.5 L12 6.5 L12 10 L5 10 Z" fill="#FFFFFF" fillOpacity="0.4" />
    </svg>
  ),

  // 7. D1 - Minibus / Shuttle
  D1: (className = 'w-8 h-5') => (
    <svg viewBox="0 0 36 22" className={className} fill="currentColor">
      {/* Wheels */}
      <circle cx="8" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="27" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Minibus Body */}
      <path d="M3 14 L3 10 C3 8.5, 4.5 7, 6 6.5 L10 5.5 C11 5, 12 5, 13 5 L31 5 C32.5 5, 33 6, 33 7.5 L33 14 Z" />
      {/* Multiple Windows */}
      <path d="M6 7.5 L9.5 6.5 L12 6.5 L12 10 L6 10 Z" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="13.5" y="6.5" width="5.5" height="3.5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="20.5" y="6.5" width="5.5" height="3.5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="27.5" y="6.5" width="4" height="3.5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
    </svg>
  ),

  // 8. Mil - Military / Tactical Vehicle
  Mil: (className = 'w-8 h-5') => (
    <svg viewBox="0 0 36 22" className={className} fill="currentColor">
      {/* Big Raised Offroad Wheels */}
      <circle cx="8" cy="16.5" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="27" cy="16.5" r="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
      {/* Rugged Angular SUV Body */}
      <path d="M3 13 L4 9.5 C4.5 8, 6 7.5, 7.5 7 L12 7 L14 4 L28 4 L30 7 L33 9 C34 9.5, 34 11, 34 13 Z" />
      {/* Tactical Windows */}
      <path d="M15 5.5 L20 5.5 L20 8 L13 8 Z" fill="#FFFFFF" fillOpacity="0.4" />
      <path d="M21.5 5.5 L26.5 5.5 L28 8 L21.5 8 Z" fill="#FFFFFF" fillOpacity="0.4" />
      {/* Top Beacon / Antenna */}
      <circle cx="21" cy="2.5" r="1.5" />
    </svg>
  ),

  // 9. Tram - Urban Light Rail / Tram
  Tram: (className = 'w-8 h-5') => (
    <svg viewBox="0 0 36 22" className={className} fill="currentColor">
      {/* Top Pantograph */}
      <path d="M15 1 L21 1 M18 1 L16 4 L20 4 Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      {/* Tram Carriage Body */}
      <rect x="3" y="5" width="30" height="10" rx="1.5" />
      {/* Panoramic Windows */}
      <rect x="5" y="7" width="5" height="4.5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="11.5" y="7" width="5" height="4.5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="18" y="7" width="5" height="4.5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="24.5" y="7" width="5" height="4.5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      {/* Low Rail Bogies */}
      <circle cx="10" cy="16.5" r="2.2" />
      <circle cx="26" cy="16.5" r="2.2" />
    </svg>
  ),

  // 10. TS - Tractor / Spec Machinery (T/S)
  TS: (className = 'w-8 h-5') => (
    <svg viewBox="0 0 34 22" className={className} fill="currentColor">
      {/* Big Rear Wheel & Small Front Wheel */}
      <circle cx="9" cy="15" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="27" cy="17" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Tractor Cabin & Engine Hood */}
      <path d="M5 9 L5 5 C5 3.5, 6.5 3, 8 3 L13 3 C14.5 3, 15 4, 15 5.5 L15 10 L25 10 L29 13 L29 16 L24 16 L23 13 L15 13 L14 15 Z" />
      {/* Cabin Window */}
      <rect x="7" y="4.5" width="6" height="5" rx="0.5" fill="#FFFFFF" fillOpacity="0.4" />
      {/* Vertical Exhaust Stack */}
      <line x1="22" y1="5" x2="22" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * 10 Categories in the EXACT order shown in the user's reference image:
 * AM, B, A, C, D, C1, D1, Military, Tram, T/S
 */
export const ORDERED_EXAM_CATEGORIES: CategoryItemDef[] = [
  { cat: 'AM', label: 'AM', name_ge: 'მოპედი', count: 338, icon: CATEGORY_VEHICLE_ICONS.AM },
  { cat: 'B', label: 'B', name_ge: 'მსუბუქი (B/B1)', count: 921, icon: CATEGORY_VEHICLE_ICONS.B },
  { cat: 'A', label: 'A', name_ge: 'მოტოციკლი (A/A1)', count: 864, icon: CATEGORY_VEHICLE_ICONS.A },
  { cat: 'C', label: 'C', name_ge: 'სატვირთო', count: 1085, icon: CATEGORY_VEHICLE_ICONS.C },
  { cat: 'D', label: 'D', name_ge: 'ავტობუსი', count: 983, icon: CATEGORY_VEHICLE_ICONS.D },
  { cat: 'C1', label: 'C1', name_ge: 'მსუბუქი სატვირთო', count: 1073, icon: CATEGORY_VEHICLE_ICONS.C1 },
  { cat: 'D1', label: 'D1', name_ge: 'მიკროავტობუსი', count: 966, icon: CATEGORY_VEHICLE_ICONS.D1 },
  { cat: 'Mil', label: 'Military', name_ge: 'სამხედრო (B+C1)', count: 1452, icon: CATEGORY_VEHICLE_ICONS.Mil },
  { cat: 'Tram', label: 'Tram', name_ge: 'ტრამვაი', count: 999, icon: CATEGORY_VEHICLE_ICONS.Tram },
  { cat: 'TS', label: 'T/S', name_ge: 'სპეცტექნიკა', count: 1021, icon: CATEGORY_VEHICLE_ICONS.TS },
];

interface ExamCategoryCarouselStripProps {
  activeCategory: ExamCategory;
  onSelectCategory: (category: ExamCategory) => void;
  onOpenRegaliaModal?: () => void;
  currentRankTitle?: string;
  currentRankLevel?: number;
}

export function ExamCategoryCarouselStrip({
  activeCategory,
  onSelectCategory,
  onOpenRegaliaModal,
  currentRankTitle,
  currentRankLevel,
}: ExamCategoryCarouselStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCategory]);

  const handleScrollLeft = () => {
    sounds.playClick();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    sounds.playClick();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Top Sub-Bar: Section Label & Level/Medal Pill Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-xs font-black text-navy uppercase tracking-wider">
            საგამოცდო კატეგორიები (10 კატეგორია):
          </span>
        </div>

        {onOpenRegaliaModal && currentRankTitle && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenRegaliaModal();
            }}
            className="btn-stitch-soft px-3 py-1.5 text-xs font-bold text-navy hover:text-gold flex items-center gap-1.5 shadow-2xs group transition-all"
            title="აკადემიური რეგალიებისა და მედლების სრული კიბე (9 დონე)"
          >
            <Award size={13} className="text-gold group-hover:scale-110 transition-transform" />
            <span>რანგი:</span>
            <strong className="text-navy group-hover:text-gold font-black">
              {currentRankTitle} (Lv.{currentRankLevel || 1})
            </strong>
            <span className="text-[10px] text-gold font-black ml-0.5">მედლები →</span>
          </button>
        )}
      </div>

      {/* Main Horizontal Carousel Container */}
      <div className="relative flex items-center">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handleScrollLeft}
          className="absolute left-0 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full neu-circle flex items-center justify-center text-navy hover:text-gold shadow-md bg-white border border-slate-200 transition-all cursor-pointer -translate-x-1 sm:-translate-x-3 hover:scale-110 active:scale-95"
          aria-label="მარცხნივ გადახვევა"
        >
          <ChevronLeft size={16} className="stroke-[2.5]" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full px-7 sm:px-9 py-2"
        >
          {ORDERED_EXAM_CATEGORIES.map((catItem) => {
            const isActive = activeCategory === catItem.cat;

            return (
              <button
                key={catItem.cat}
                ref={isActive ? activeItemRef : undefined}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectCategory(catItem.cat);
                }}
                className={`min-w-[76px] sm:min-w-[84px] h-[78px] sm:h-[84px] rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 shrink-0 select-none relative overflow-hidden group ${
                  isActive
                    ? 'bg-navy text-white border-2 border-gold shadow-neu-flat ring-2 ring-gold/30 -translate-y-0.5'
                    : 'neu-card bg-white text-navy border border-slate-200/90 hover:border-gold/60 hover:-translate-y-0.5 hover:shadow-md'
                }`}
                title={`${catItem.name_ge} • ${catItem.count} საგამოცდო ბილეთი`}
              >
                {/* Laser line on selected card */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-amber-400 to-gold rounded-t-2xl" />
                )}

                {/* Vehicle Silhouette Icon */}
                <div
                  className={`flex items-center justify-center pt-1.5 transition-transform duration-200 ${
                    isActive ? 'text-white scale-105' : 'text-slate-800 group-hover:text-gold group-hover:scale-110'
                  }`}
                >
                  {catItem.icon()}
                </div>

                {/* Category Code Label */}
                <div className="w-full text-center pb-0.5">
                  <span
                    className={`block font-mono font-black text-xs sm:text-sm tracking-wider uppercase transition-colors ${
                      isActive ? 'text-white' : 'text-navy group-hover:text-gold'
                    }`}
                  >
                    {catItem.label}
                  </span>
                  <span
                    className={`block text-[9px] font-mono leading-none mt-0.5 ${
                      isActive ? 'text-gold' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {catItem.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="absolute right-0 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full neu-circle flex items-center justify-center text-navy hover:text-gold shadow-md bg-white border border-slate-200 transition-all cursor-pointer translate-x-1 sm:translate-x-3 hover:scale-110 active:scale-95"
          aria-label="მარჯვნივ გადახვევა"
        >
          <ChevronRight size={16} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
