"use client";

import React, { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import {
  Car,
  Construction,
  Camera,
  AlertTriangle,
  Fuel,
  Zap,
  Wrench,
  Droplets,
  Cog,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  CheckCircle2,
  Layers,
  Sparkles,
  MousePointer,
  RotateCw
} from "lucide-react";
import { sounds } from "../../services/soundEffects";
import { ThematicCategoryVisual } from "./ThematicCategoryVisuals";

export type MapCategoryKey =
  | 'traffic_jam'
  | 'road_repair'
  | 'radar'
  | 'hazard'
  | 'fuel'
  | 'charging'
  | 'service'
  | 'car_wash'
  | 'parts'
  | 'showroom';

export interface MapCategoryItem {
  key: MapCategoryKey;
  groupTitle: string;
  groupColor: string;
  title: string;
  shortName: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  accent: string;
  iconBg: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  description: string;
  countText: string;
}

/**
 * 10 Official Map Categories ordered exactly matching AutoHub's 4-column structure:
 * Column 1: მოძრაობა & საცობები (საცობები, რემონტი, რადარები, საფრთხე)
 * Column 2: საწვავი & ენერგია (ავტოგასამართი, EV დამტენები)
 * Column 3: ავტოსერვისი & მოვლა (სერვისი, ავტოსამრეცხაო)
 * Column 4: ნაწილები & სალონები (ავტონაწილები, ავტოსალონები)
 */
export const MAP_CATEGORIES: MapCategoryItem[] = [
  {
    key: 'traffic_jam',
    groupTitle: 'მოძრაობა & საცობები',
    groupColor: 'bg-rose-50 text-rose-700 border-rose-200/70',
    title: 'საცობები (Live)',
    shortName: 'საცობები',
    subtitle: 'მძიმე შეფერხებები & ალტერნატივები',
    badge: 'Live 12',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accent: '#DC2626',
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/70',
    icon: Car,
    description: 'თბილისისა და რეგიონების მძიმე საცობები რეალურ დროში, ალტერნატიული სწრაფი მარშრუტები და მოძრაობის დინამიკა.',
    countText: '12 აქტიური საცობი'
  },
  {
    key: 'road_repair',
    groupTitle: 'მოძრაობა & საცობები',
    groupColor: 'bg-amber-50 text-amber-700 border-amber-200/70',
    title: 'ქუჩის რემონტი',
    shortName: 'რემონტი',
    subtitle: 'საგზაო სამუშაოები & შეზღუდვები',
    badge: '14',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: '#F59E0B',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/70',
    icon: Construction,
    description: 'საგზაო სამუშაოები, გადათხრილი ქუჩები, ზოლების შევიწროება და დროებითი შემოვლითი გზები.',
    countText: '14 რემონტი'
  },
  {
    key: 'radar',
    groupTitle: 'მოძრაობა & საცობები',
    groupColor: 'bg-amber-50 text-amber-800 border-amber-300',
    title: 'რადარები & კამერები',
    shortName: 'რადარები',
    subtitle: 'სიჩქარის & შუქნიშნის კამერები',
    badge: '260',
    badgeColor: 'bg-amber-500 text-slate-950 font-black border-amber-400',
    accent: '#F59E0B',
    iconBg: 'bg-amber-500/20 text-amber-600 border border-amber-400/50',
    icon: Camera,
    description: 'საქართველოს მასშტაბით სიჩქარის სტაციონარული, სექციური და ჭკვიანი შუქნიშნის კამერები 300მ წინასწარი ხმოვანი გაფრთხილებით.',
    countText: '260 კამერა'
  },
  {
    key: 'hazard',
    groupTitle: 'მოძრაობა & საცობები',
    groupColor: 'bg-rose-50 text-rose-700 border-rose-200/70',
    title: 'საგზაო საფრთხე',
    shortName: 'საფრთხე',
    subtitle: 'შემთხვევები & შეფერხებები',
    badge: 'Live',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accent: '#DC2626',
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/70',
    icon: AlertTriangle,
    description: 'საგზაო შემთხვევები, მოყინული მონაკვეთები, ნისლი, ქვათაცვენა და გაფრთხილებები.',
    countText: 'ცოცხალი შეტყობინებები'
  },
  {
    key: 'fuel',
    groupTitle: 'საწვავი & ენერგია',
    groupColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    title: 'ავტოგასამართი & ფასები',
    shortName: 'საწვავი',
    subtitle: 'Gulf, Wissol, Socar, Rompetrol, L...',
    badge: '1 421',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: '#059669',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/70',
    icon: Fuel,
    description: 'საწვავის განახლებული ფასები: Gulf, Wissol, Socar, Rompetrol, Lukoil, Portal. პრემიუმი, რეგულარი, დიზელი და გაზი.',
    countText: '1 421 სადგური'
  },
  {
    key: 'charging',
    groupTitle: 'საწვავი & ენერგია',
    groupColor: 'bg-teal-50 text-teal-700 border-teal-200/70',
    title: 'EV დამტენები',
    shortName: 'დამტენები',
    subtitle: 'ელექტრომობილების სწრაფი დამტენები',
    badge: '254',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    accent: '#0D9488',
    iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/70',
    icon: Zap,
    description: 'ელექტრომობილების სწრაფი DC და AC დამტენები (CCS2, Chademo, Type 2, GB/T, Tesla) მთელ საქართველოში.',
    countText: '254 დამტენი ჰაბი'
  },
  {
    key: 'service',
    groupTitle: 'ავტოსერვისი & მოვლა',
    groupColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    title: 'სერვისი & ვულკანიზაცია',
    shortName: 'სერვისი',
    subtitle: 'დიაგნოსტიკა, სავალი ნაწილი, ...',
    badge: '1 344',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accent: '#4F46E5',
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/70',
    icon: Wrench,
    description: 'სავალი ნაწილის შეკეთება, კომპიუტერული დიაგნოსტიკა, ძრავის ოსტატები, ზეთის შეცვლა და 24/7 ვულკანიზაცია.',
    countText: '1 344 პროფესიონალი'
  },
  {
    key: 'car_wash',
    groupTitle: 'ავტოსერვისი & მოვლა',
    groupColor: 'bg-sky-50 text-sky-700 border-sky-200/70',
    title: 'ავტოსამრეცხაო',
    shortName: 'სამრეცხაო',
    subtitle: 'თვითმომსახურება & ქიმწმენდა',
    badge: '902',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    accent: '#0284C7',
    iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/70',
    icon: Droplets,
    description: 'თვითმომსახურების ბოქსები, ტურბო-ქაფი, უკონტაქტო რეცხვა, ავტო-დითეილინგი და ქიმწმენდა.',
    countText: '902 ავტოსამრეცხაო'
  },
  {
    key: 'parts',
    groupTitle: 'ნაწილები & სალონები',
    groupColor: 'bg-purple-50 text-purple-700 border-purple-200/70',
    title: 'ავტონაწილები',
    shortName: 'ნაწილები',
    subtitle: 'ნაწილები, დეტალები & ზეთები',
    badge: '619',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: '#7C3AED',
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/70',
    icon: Cog,
    description: 'ახალი და მეორადი ორიგინალი ნაწილები, ძრავის ზეთები, სამუხრუჭე ხუნდები, ფილტრები და აქსესუარები.',
    countText: '619 ავტომაღაზია'
  },
  {
    key: 'showroom',
    groupTitle: 'ნაწილები & სალონები',
    groupColor: 'bg-amber-50 text-amber-700 border-amber-200/70',
    title: 'ავტოსალონები',
    shortName: 'სალონები',
    subtitle: 'ოფიციალური დილერები & ცენტრები',
    badge: '122',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: '#D97706',
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/70',
    icon: Building2,
    description: 'ოფიციალური იმპორტიორები, პრემიუმ ავტოსალონები და ავტომობილების სავაჭრო ცენტრები გარანტიით.',
    countText: '122 ავტოსალონი'
  }
];

const wrap = (value: number, length: number) => ((value % length) + length) % length;

interface Props {
  activeCategoryKey: string;
  onSelectCategory: (key: MapCategoryKey | 'all') => void;
  className?: string;
}

export const MapCategoriesCoverflow: React.FC<Props> = ({
  activeCategoryKey,
  onSelectCategory,
  className = ""
}) => {
  const items = MAP_CATEGORIES;

  // Find initial index matching activeCategoryKey
  const matchingIndex = items.findIndex(item => item.key === activeCategoryKey);
  const [index, setIndex] = useState(matchingIndex >= 0 ? matchingIndex : 2); // Default to radars (#2 in 0-indexed)
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 900, height: 380 });
  const [hovered, setHovered] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; time: number; horizontal: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const wheelThrottleRef = useRef<number>(0);
  const id = useId();

  // If outside filter changes to a category, sync the index
  useEffect(() => {
    if (activeCategoryKey !== 'all') {
      const idx = items.findIndex(item => item.key === activeCategoryKey);
      if (idx >= 0 && idx !== wrap(index, items.length)) {
        setIndex(idx);
      }
    }
  }, [activeCategoryKey]);

  const activeIndex = items.length ? wrap(index, items.length) : 0;
  const active = items[activeIndex];

  // Dynamic responsive card width
  const cardWidth = Math.min(360, Math.max(260, stageSize.width * 0.52));
  const step = cardWidth * 0.74;
  const before = 2;
  const after = 2;

  const slots = items.length > 1
    ? Array.from({ length: before + after + 3 }, (_, position) => index + position - before - 1)
    : [index];

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!stage.current) return;
    const measure = () => {
      if (stage.current) {
        setStageSize({ width: stage.current.clientWidth, height: stage.current.clientHeight });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reduced || dragging || hovered) return;
    const timer = setTimeout(() => {
      setIndex(current => current + 1);
    }, 4500);
    return () => clearTimeout(timer);
  }, [playing, index, reduced, dragging, hovered]);

  const select = (next: number) => {
    sounds.playClick();
    setIndex(next);
    setDrag(0);
  };

  // Clicking ANY card (active or adjacent) transitions to it or toggles filter
  const handleCardClick = (item: MapCategoryItem, slotIndex: number) => {
    sounds.playClick();
    if (slotIndex === index) {
      if (activeCategoryKey === item.key) {
        onSelectCategory('all');
      } else {
        onSelectCategory(item.key);
      }
    } else {
      // Bring clicked background card forward to center AND activate filter on live map!
      setIndex(slotIndex);
      onSelectCategory(item.key);
    }
  };

  // Smooth scroll to the live map container if requested
  const scrollMapIntoView = () => {
    const el = document.getElementById('map') || document.querySelector('.leaflet-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Wheel / Trackpad scroll advance ("გადასქროლვით იცვლებოდეს")
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 14) return;

    const now = performance.now();
    if (now - wheelThrottleRef.current < 240) return;
    wheelThrottleRef.current = now;

    sounds.playClick();
    if (delta > 0) {
      setIndex(c => c + 1);
    } else {
      setIndex(c => c - 1);
    }
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    gesture.current = { x: event.clientX, y: event.clientY, time: performance.now(), horizontal: false };
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      gesture.current = null;
      return;
    }
    // High drag threshold (20px) to prevent micro-clicks from being dropped
    if (!start.horizontal && Math.abs(dx) > 20) {
      start.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    if (start.horizontal) {
      setDrag(Math.max(-1.2, Math.min(1.2, dx / step)));
    }
  };

  // Flick / Swipe gesture handling ("ასევე გაკვრით გადასვლა შეიძლებოდეს")
  const pointerUp = (event: PointerEvent<HTMLDivElement>, cancel = false) => {
    const start = gesture.current;
    gesture.current = null;
    if (start?.horizontal) {
      const dx = event.clientX - start.x;
      const dt = Math.max(1, performance.now() - start.time);
      const velocity = Math.abs(dx) / dt;

      // Quick flick ("გაკვრით") OR standard drag distance threshold
      const isFlick = velocity > 0.22 && Math.abs(dx) > 18;
      const isThreshold = Math.abs(dx) > Math.min(42, cardWidth * 0.15);

      if (!cancel && (isFlick || isThreshold)) {
        sounds.playClick();
        const stepCount = Math.abs(dx) > cardWidth * 0.8 && velocity > 0.65 ? 2 : 1;
        setIndex(current => current + (dx < 0 ? stepCount : -stepCount));
      }
    }
    setDrag(0);
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // Click anywhere on empty stage background to navigate
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) return;
    // If target is the stage background or floor shadow
    if (e.target === stage.current || (e.target as HTMLElement).classList.contains('stage-floor-shadow')) {
      const rect = stage.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.35) {
        select(index - 1);
      } else if (clickX > rect.width * 0.65) {
        select(index + 1);
      }
    }
  };

  if (!active) return null;

  const isCurrentActiveFilter = activeCategoryKey === active.key;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border-2 border-slate-200/90 bg-white/95 text-slate-800 shadow-sm p-4 sm:p-5 transition-all backdrop-blur-md ${className}`}
      onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          select(index + 1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          select(index - 1);
        }
      }}
      tabIndex={0}
      aria-label="საგზაო ნიშნების 3D Coverflow კარუსელი"
    >
      {/* Top Banner Row: Section Title & All-Categories Button (AutoHub Light Palette) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div
          onClick={() => {
            sounds.playClick();
            onSelectCategory('all');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="დააწკაპუნეთ ყველა ობიექტის ერთად საჩვენებლად"
        >
          <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
            <Sparkles size={16} />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-black tracking-tight text-slate-900 flex items-center gap-2 group-hover:text-amber-600 transition-colors">
              <span>საგზაო კატეგორიები (3D Coverflow)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase font-bold">
                Live რუკა
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              რუკის ნიშნები • ნებისმიერ ბარათზე დაჭერით გადასვლა და ფილტრაცია
            </p>
          </div>
        </div>

        {/* Quick Filter Reset / Show All (AutoHub Button Style) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectCategory('all');
            }}
            title="ყველა კატეგორიის ერთად ჩვენება"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-2 shadow-2xs active:scale-95 cursor-pointer ${
              activeCategoryKey === 'all'
                ? 'bg-[#1A2232] text-amber-400 border-amber-400 font-black shadow-md shadow-slate-900/15 ring-2 ring-amber-400/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200/90'
            }`}
          >
            <Layers size={14} className={activeCategoryKey === 'all' ? 'text-amber-400' : 'text-slate-500'} />
            <span>ყველა ობიექტი ერთად</span>
          </button>
        </div>
      </div>

      {/* 3D Coverflow Stage with Wheel Scrolling support & Prominent Floating Chevrons */}
      <div
        ref={stage}
        onClick={handleStageClick}
        onWheel={handleWheel}
        data-dragging={dragging || undefined}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={event => pointerUp(event)}
        onPointerCancel={event => pointerUp(event, true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative min-h-[310px] sm:min-h-[345px] flex items-center justify-center perspective-[1100px] transform-style-3d touch-pan-y select-none cursor-grab active:cursor-grabbing my-2"
        style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
      >
        {/* Soft realistic floor drop shadow */}
        <div
          className="stage-floor-shadow absolute bottom-2 left-1/2 -translate-x-1/2 w-[70%] max-w-[460px] h-[26px] rounded-full bg-slate-400/30 blur-md pointer-events-none"
        />

        {/* Prominent Floating Stage Arrow Left */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            select(index - 1);
          }}
          aria-label="წინა კატეგორია"
          title="წინა კატეგორია"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white/95 hover:bg-white text-slate-800 hover:text-navy border-2 border-slate-200/90 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer"
        >
          <ChevronLeft size={22} className="text-slate-800" />
        </button>

        {/* Prominent Floating Stage Arrow Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            select(index + 1);
          }}
          aria-label="შემდეგი კატეგორია"
          title="შემდეგი კატეგორია"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white/95 hover:bg-white text-slate-800 hover:text-navy border-2 border-slate-200/90 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer"
        >
          <ChevronRight size={22} className="text-slate-800" />
        </button>

        {slots.map(slot => {
          const item = items[wrap(slot, items.length)];
          const d = slot - index;
          const offset = d + drag;
          const abs = Math.abs(offset);
          const x = offset * step;
          const isSelected = slot === index;
          const isFiltered = activeCategoryKey === item.key;
          const ItemIcon = item.icon;
          const zIndex = isSelected ? 35 : Math.max(1, 30 - Math.round(abs * 8));

          return (
            <div
              key={slot}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(item, slot);
              }}
              title={isSelected ? "დააწკაპუნეთ გასაფილტრად" : `დააწკაპუნეთ წინ გამოსატანად: ${item.title}`}
              className={`absolute top-1/2 -translate-y-1/2 rounded-2xl p-3 sm:p-3.5 transition-all duration-500 cursor-pointer select-none border-2 group hover:z-50 ${
                isSelected
                  ? 'border-amber-400 bg-[#1A2232] text-white shadow-2xl shadow-slate-900/30 ring-4 ring-amber-400/25 scale-100'
                  : 'border-slate-200/90 bg-white/95 text-slate-800 shadow-md hover:border-amber-400 hover:shadow-2xl hover:scale-[1.04] opacity-85 hover:opacity-100 hover:ring-2 hover:ring-amber-400/20'
              }`}
              style={{
                width: `${cardWidth}px`,
                zIndex,
                transform: `translate3d(${x}px, -50%, ${-Math.min(abs, 3) * 110}px) rotateY(${-Math.max(-36, Math.min(36, offset * 28))}deg) scale(${1 - Math.min(abs, 3) * 0.08})`,
                opacity: d < -before || d > after ? 0 : 1,
                pointerEvents: d < -before || d > after ? 'none' : 'auto',
                transition: dragging ? 'none' : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, border-color 0.25s, box-shadow 0.25s',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Card Top: Group Label + Exact Count Badge (matching AutoHub screenshot) */}
              <div className="flex items-center justify-between gap-2 pb-2">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 truncate px-2 py-0.5 rounded-lg border ${
                    isSelected
                      ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                      : item.groupColor
                  }`}
                >
                  <ItemIcon size={12} className={isSelected ? "text-amber-400" : "text-slate-600"} />
                  <span className="truncate">{item.groupTitle}</span>
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 transition-colors border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Grounded Official Road Sign Plate */}
              <div
                className={`relative w-full aspect-[16/10] rounded-xl overflow-hidden border flex items-center justify-center shadow-inner ${
                  isSelected ? 'border-amber-400/40 bg-[#101726]' : 'border-slate-200 bg-slate-100'
                }`}
              >
                <ThematicCategoryVisual
                  categoryKey={item.key}
                  isSelected={isSelected}
                  isFiltered={isFiltered}
                  countText={item.countText}
                  badge={item.badge}
                />

                {/* Road Sign Status Pill */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white pointer-events-none">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border shadow-2xs ${
                      isSelected
                        ? 'bg-slate-950/85 text-amber-300 border-amber-400/30'
                        : 'bg-slate-900/85 text-slate-200 border-white/15'
                    }`}
                  >
                    {item.countText}
                  </span>
                  {isFiltered && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={11} /> აქტიურია
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom Info: Title, Subtitle & Action Indicator */}
              <div className="pt-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          : item.iconBg
                      }`}
                    >
                      <ItemIcon size={14} />
                    </div>
                    <h5
                      className={`text-sm truncate tracking-tight ${
                        isSelected ? 'text-white font-black' : 'text-slate-900 font-bold'
                      }`}
                    >
                      {item.title}
                    </h5>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all shrink-0 ${
                      isFiltered
                        ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-2xs'
                        : isSelected
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200'
                    }`}
                  >
                    {isFiltered ? 'გაფილტრულია' : isSelected ? 'არჩევა' : 'დააწკაპუნეთ'}
                  </span>
                </div>
                <p
                  className={`text-[11px] truncate pl-9 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Controls Bar: Active Info + Dock Navigation */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 pt-2 border-t border-slate-200/80">
        <div
          onClick={() => {
            sounds.playClick();
            if (isCurrentActiveFilter) {
              onSelectCategory('all');
            } else {
              onSelectCategory(active.key);
            }
          }}
          className="text-center max-w-xl cursor-pointer hover:opacity-85 transition-opacity"
          title="დააწკაპუნეთ რუკაზე გასაფილტრად"
        >
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{active.title}</span>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${active.badgeColor}`}>
                {active.badge}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 sm:line-clamp-none font-medium">
            {active.description}
          </p>
        </div>

        {/* Dock Controls (AutoHub Navy & Gold) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 shadow-2xs">
            {/* Position indicator */}
            <button
              type="button"
              onClick={() => select(index + 1)}
              title="შემდეგ კატეგორიაზე გადასვლა"
              className="text-xs font-mono font-bold text-slate-600 border-r border-slate-300 pr-2.5 hover:text-navy cursor-pointer transition-colors"
            >
              <span className="text-amber-600 font-black">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-slate-400 mx-1">/</span>
              <span>{String(items.length).padStart(2, "0")}</span>
            </button>

            {/* Transport Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => select(index - 1)}
                aria-label="წინა კატეგორია"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 transition-all active:scale-90 border border-slate-200/80 shadow-2xs"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => setPlaying(prev => !prev)}
                aria-label={playing ? "პაუზა" : "ავტო-დათვალიერება"}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  playing
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              </button>

              <button
                type="button"
                onClick={() => select(index + 1)}
                aria-label="შემდეგი კატეგორია"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 transition-all active:scale-90 border border-slate-200/80 shadow-2xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Direct Filter Action Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (isCurrentActiveFilter) {
                onSelectCategory('all');
              } else {
                onSelectCategory(active.key);
                scrollMapIntoView();
              }
            }}
            title="რუკაზე ამ კატეგორიის ობიექტების გაფილტვრა და ჩვენება"
            className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all active:scale-95 border-2 cursor-pointer ${
              isCurrentActiveFilter
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                : 'bg-[#1A2232] hover:bg-slate-800 text-amber-400 border-amber-400 shadow-md shadow-slate-900/15'
            }`}
          >
            {isCurrentActiveFilter ? (
              <>
                <CheckCircle2 size={13} />
                <span>ფილტრი აქტიურია (გამორთვა)</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>რუკაზე ჩვენება ({active.title})</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Navigation Hints */}
        <div
          onClick={() => select(index + 1)}
          className="text-[10px] text-slate-500 flex items-center gap-2 flex-wrap justify-center font-medium cursor-pointer hover:text-slate-800 transition-colors"
          title="დააწკაპუნეთ შემდეგ კატეგორიაზე გადასასვლელად"
        >
          <span className="flex items-center gap-1"><MousePointer size={11} className="text-amber-600" /> ნებისმიერ ბარათზე დაჭერა</span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1"><RotateCw size={11} className="text-amber-600" /> მაუსით სქროლი</span>
          <span className="text-slate-300">•</span>
          <ArrowLeft size={10} />
          <ArrowRight size={10} />
          <span>ისრებით მართვა</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Bottom Horizontal Quick-Nav Icon Strip (10 Categories)   */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full pt-3 mt-3 border-t border-slate-200/80">
        <div className="flex items-center justify-between pb-2 px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            საგზაო ნიშნების სწრაფი ზოლი (ნებისმიერზე დაჭერით გადასვლა)
          </span>
          <span className="text-[10px] text-amber-600 font-mono font-bold">
            10 კატეგორია
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar sm:justify-center">
          {items.map((cat, i) => {
            const isSelected = activeIndex === i;
            const isFiltered = activeCategoryKey === cat.key;
            const Icon = cat.icon;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIndex(i);
                  onSelectCategory(cat.key);
                }}
                title={`${cat.title} (${cat.badge})`}
                className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-[#1A2232] text-white border-amber-400 shadow-md shadow-slate-900/15 ring-2 ring-amber-400/25 scale-105 font-black'
                    : isFiltered
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Category Icon Badge Container */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : cat.iconBg
                  }`}
                >
                  <Icon size={13} />
                </div>

                <span className="whitespace-nowrap text-[11px] font-sans">
                  {cat.shortName}
                </span>

                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold transition-colors ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : isFiltered
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat.badge.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
