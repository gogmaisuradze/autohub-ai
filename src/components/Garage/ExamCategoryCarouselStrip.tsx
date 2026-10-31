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
function VehicleIllustration({ category, className = 'w-[72px] h-11' }: { category: ExamCategory; className?: string }) {
  const wheels = (positions: number[], y = 43, radius = 7) => positions.map(x => <g key={x}><circle cx={x} cy={y} r={radius} fill="#182235" /><circle cx={x} cy={y} r={radius * .55} fill="#c6ced8" /><circle cx={x} cy={y} r={radius * .2} fill="#667589" /></g>);
  const windows = (xs: number[], y = 17, width = 11) => xs.map(x => <rect key={x} x={x} y={y} width={width} height="12" rx="2" fill="#a9d2e4" stroke="#52657c" strokeWidth=".7" />);
  return <svg viewBox="0 0 112 60" className={className} fill="none" aria-hidden="true">
    <ellipse cx="56" cy="53" rx="46" ry="2" fill="#15243b" opacity=".1" />
    {category === 'B' && <><path d="M9 39l4-10 16-4 14-13h29l17 15 12 5 3 12H9z" fill="currentColor" /><path d="M36 25l10-10h11v10zm25-10h9l12 10H61z" fill="#a9d2e4" stroke="#52657c" strokeWidth=".7" /><path d="M16 34h11m61 0h11" stroke="#e4bb56" strokeWidth="3" /><path d="M57 28v12M32 40h46" stroke="#7c8da0" strokeWidth=".8" />{wheels([29,85])}</>}
    {category === 'AM' && <><path d="M22 37q3-14 24-12l6 13h17l10-23h8L77 42H20z" fill="currentColor" /><path d="M35 23h17M79 15l-5-7h14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M84 19l9 23M27 33l-5 10" stroke="#758699" strokeWidth="3" /><path d="M48 36h19" stroke="#d9a841" strokeWidth="3" />{wheels([23,91],44,9)}</>}
    {category === 'A' && <><path d="M23 43l22-20 20 20H23l31-11 24-14 14 26" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" /><path d="M44 21q8-10 21 0l-4 9-18-2zM29 23h18l-6 6H27z" fill="currentColor" /><path d="M76 17l-4-8h12M80 15l8 3" stroke="currentColor" strokeWidth="3" /><circle cx="54" cy="36" r="6" fill="#7c8da0" />{wheels([22,91],44,10)}</>}
    {(category === 'C' || category === 'C1') && <><rect x="8" y={category === 'C' ? 9 : 17} width={category === 'C' ? 58 : 52} height={category === 'C' ? 32 : 24} rx="2" fill="currentColor" /><path d="M68 42V17h19l13 15v10z" fill="currentColor" /><path d="M73 21h12l9 11H73z" fill="#a9d2e4" stroke="#52657c" /><path d="M13 16v19m9-19v19m9-19v19m9-19v19m9-19v19" stroke="#8d9cad" strokeWidth=".7" opacity=".6" /><path d="M7 43h97" stroke="#596a7e" strokeWidth="3" />{wheels(category === 'C' ? [25,44,87] : [25,87])}</>}
    {(category === 'D' || category === 'D1') && <><path d={category === 'D' ? 'M8 40V13q0-5 5-5h83q5 0 5 5v29H8z' : 'M13 42V24l13-10h57l17 16v12z'} fill="currentColor" />{windows(category === 'D' ? [14,28,42,56,70,84] : [31,46,61],category === 'D' ? 15 : 19)}{category === 'D1' && <path d="M82 19l11 11H79V19z" fill="#a9d2e4" />}<path d="M12 35h86" stroke="#d9a841" strokeWidth="2" /><path d="M78 31v9" stroke="#5d7084" />{wheels(category === 'D' ? [25,85] : [30,83])}</>}
    {category === 'Mil' && <><path d="M10 41V29l15-7 10-11h42l12 14 12 7v10z" fill="currentColor" /><path d="M39 15h14v12H29zm19 0h16l10 12H58z" fill="#a9d2e4" stroke="#52657c" /><path d="M17 33h15m35 0h18M49 30v11" stroke="#879078" strokeWidth="2" /><path d="M80 10V1" stroke="#5e7183" strokeWidth="2" />{wheels([28,84],43,10)}</>}
    {category === 'Tram' && <><path d="M42 9l12-8 13 8-13 8zM40 1h29" stroke="currentColor" strokeWidth="2" /><rect x="8" y="17" width="94" height="27" rx="6" fill="currentColor" />{windows([15,29,43,57,71,85],22,10)}<path d="M11 39h88M6 51h100" stroke="#d9a841" strokeWidth="2" />{wheels([25,84],46,4)}</>}
    {category === 'TS' && <><path d="M26 34V12h25v24h34l11 6H21z" fill="currentColor" /><path d="M30 16h16v15H30z" fill="#a9d2e4" stroke="#52657c" /><path d="M57 26h30l8 12H54z" fill="currentColor" /><path d="M71 26V14h4M23 11h31" stroke="currentColor" strokeWidth="3" />{wheels([30],41,13)}{wheels([88],45,8)}<path d="M24 34l12 14m-12 0 12-14" stroke="#758699" strokeWidth="1.3" /></>}
  </svg>;
}

export const CATEGORY_VEHICLE_ICONS: Record<string, (className?: string) => React.ReactNode> = Object.fromEntries(
  (['AM','B','A','C','D','C1','D1','Mil','Tram','TS'] as ExamCategory[]).map(category => [category, (className?: string) => <VehicleIllustration category={category} className={className} />])
);

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
  { cat: 'Mil', label: 'B+C1', name_ge: 'სამხედრო (B+C1)', count: 1452, icon: CATEGORY_VEHICLE_ICONS.Mil },
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
      const track = scrollRef.current;
      const item = activeItemRef.current;
      if (track) track.scrollTo({ left: Math.max(0, item.offsetLeft - track.offsetLeft - (track.clientWidth - item.clientWidth) / 2), behavior: 'smooth' });
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
                className={`min-w-[104px] sm:min-w-[112px] h-[116px] sm:h-[124px] rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 shrink-0 select-none relative overflow-hidden group ${
                  isActive
                    ? 'bg-navy text-white border-2 border-gold shadow-neu-flat ring-2 ring-gold/30 -translate-y-0.5'
                    : 'neu-card bg-white text-navy border border-slate-200/90 hover:border-gold/60 hover:-translate-y-0.5 hover:shadow-md'
                }`}
                aria-pressed={isActive}
                aria-label={`${catItem.label} · ${catItem.name_ge}`}
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
                  {catItem.icon('w-[76px] sm:w-[84px] h-12')}
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
                    {catItem.name_ge.split(' (')[0]}
                  </span>
                  <span className={`block mt-1 text-[9px] ${isActive ? 'text-gold' : 'text-slate-400'}`}>
                    {catItem.count} ბილეთი
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
