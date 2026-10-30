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
  title: string;
  shortName: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  accent: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  description: string;
  countText: string;
}

export const MAP_CATEGORIES: MapCategoryItem[] = [
  {
    key: 'radar',
    groupTitle: 'მოძრაობა & უსაფრთხოება',
    title: 'რადარები & კამერები',
    shortName: 'რადარები',
    subtitle: 'სიჩქარის & შუქნიშნის კამერები',
    badge: '260 კამერა',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    accent: '#F59E0B',
    icon: Camera,
    description: 'საქართველოს მასშტაბით სიჩქარის სტაციონარული, სექციური და ჭკვიანი შუქნიშნის კამერები 300მ წინასწარი ხმოვანი გაფრთხილებით.',
    countText: '260 აქტიური წერტილი'
  },
  {
    key: 'traffic_jam',
    groupTitle: 'მოძრაობა & საცობები',
    title: 'საცობები (Live)',
    shortName: 'საცობები',
    subtitle: 'მძიმე შეფერხებები & ალტერნატივები',
    badge: 'LIVE 12',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    accent: '#DC2626',
    icon: Car,
    description: 'თბილისისა და რეგიონების მძიმე საცობები რეალურ დროში, ალტერნატიული სწრაფი მარშრუტები და მოძრაობის დინამიკა.',
    countText: '12 აქტიური საცობი'
  },
  {
    key: 'fuel',
    groupTitle: 'საწვავი & ენერგია',
    title: 'ავტოგასამართი & ფასები',
    shortName: 'საწვავი',
    subtitle: 'Gulf, Wissol, Socar, Rompetrol, Lukoil',
    badge: '1 421 ლოკაცია',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    accent: '#1E40AF',
    icon: Fuel,
    description: 'საწვავის განახლებული ფასები: Gulf, Wissol, Socar, Rompetrol, Lukoil, Portal. პრემიუმი, რეგულარი, დიზელი და გაზი.',
    countText: '1 421 სადგური'
  },
  {
    key: 'charging',
    groupTitle: 'საწვავი & ენერგია',
    title: 'EV დამტენები',
    shortName: 'დამტენები',
    subtitle: 'ელექტრომობილების სწრაფი დამტენები',
    badge: '254 სადგური',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    accent: '#047857',
    icon: Zap,
    description: 'ელექტრომობილების სწრაფი DC და AC დამტენები (CCS2, Chademo, Type 2, GB/T, Tesla) მთელ საქართველოში.',
    countText: '254 დამტენი ჰაბი'
  },
  {
    key: 'service',
    groupTitle: 'ავტოსერვისი & მოვლა',
    title: 'სერვისი & ვულკანიზაცია',
    shortName: 'სერვისი',
    subtitle: 'დიაგნოსტიკა, სავალი ნაწილი, საბურავები',
    badge: '1 344 სერვისი',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    accent: '#1E40AF',
    icon: Wrench,
    description: 'სავალი ნაწილის შეკეთება, კომპიუტერული დიაგნოსტიკა, ძრავის ოსტატები, ზეთის შეცვლა და 24/7 ვულკანიზაცია.',
    countText: '1 344 პროფესიონალი'
  },
  {
    key: 'car_wash',
    groupTitle: 'ავტოსერვისი & მოვლა',
    title: 'ავტოსამრეცხაო',
    shortName: 'სამრეცხაო',
    subtitle: 'თვითმომსახურება & ქიმწმენდა',
    badge: '902 ობიექტი',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    accent: '#1E40AF',
    icon: Droplets,
    description: 'თვითმომსახურების ბოქსები, ტურბო-ქაფი, უკონტაქტო რეცხვა, ავტო-დითეილინგი და ქიმწმენდა.',
    countText: '902 ავტოსამრეცხაო'
  },
  {
    key: 'parts',
    groupTitle: 'ნაწილები & სალონები',
    title: 'ავტონაწილები',
    shortName: 'ნაწილები',
    subtitle: 'ნაწილები, დეტალები & ზეთები',
    badge: '619 მაღაზია',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    accent: '#1E40AF',
    icon: Cog,
    description: 'ახალი და მეორადი ორიგინალი ნაწილები, ძრავის ზეთები, სამუხრუჭე ხუნდები, ფილტრები და აქსესუარები.',
    countText: '619 ავტომაღაზია'
  },
  {
    key: 'road_repair',
    groupTitle: 'მოძრაობა & საცობები',
    title: 'ქუჩის რემონტი',
    shortName: 'რემონტი',
    subtitle: 'საგზაო სამუშაოები & შეზღუდვები',
    badge: '14 მონაკვეთი',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    accent: '#DC2626',
    icon: Construction,
    description: 'საგზაო სამუშაოები, გადათხრილი ქუჩები, ზოლების შევიწროება და დროებითი შემოვლითი გზები.',
    countText: '14 რემონტი'
  },
  {
    key: 'hazard',
    groupTitle: 'მოძრაობა & უსაფრთხოება',
    title: 'საგზაო საფრთხე',
    shortName: 'საფრთხე',
    subtitle: 'შემთხვევები & შეფერხებები',
    badge: 'Live საფრთხე',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    accent: '#DC2626',
    icon: AlertTriangle,
    description: 'საგზაო შემთხვევები, მოყინული მონაკვეთები, ნისლი, ქვათაცვენა და გაფრთხილებები.',
    countText: 'ცოცხალი შეტყობინებები'
  },
  {
    key: 'showroom',
    groupTitle: 'ნაწილები & სალონები',
    title: 'ავტოსალონები',
    shortName: 'სალონები',
    subtitle: 'ოფიციალური დილერები & ცენტრები',
    badge: '122 ცენტრი',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    accent: '#1E40AF',
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
  const [index, setIndex] = useState(matchingIndex >= 0 ? matchingIndex : 0);
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
  const cardWidth = Math.min(340, Math.max(250, stageSize.width * 0.58));
  const step = cardWidth * 0.76;
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
    if (performance.now() < suppressClickUntil.current) return;
    sounds.playClick();
    if (slotIndex === index) {
      if (activeCategoryKey === item.key) {
        onSelectCategory('all');
      } else {
        onSelectCategory(item.key);
      }
    } else {
      setIndex(slotIndex);
      onSelectCategory(item.key);
    }
  };

  // Wheel / Trackpad scroll advance ("გადასქროლვით იცვლებოდეს")
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 14) return;

    const now = performance.now();
    if (now - wheelThrottleRef.current < 260) return;
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
    if (!start.horizontal && Math.abs(dx) > 8) {
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
      const isFlick = velocity > 0.25 && Math.abs(dx) > 16;
      const isThreshold = Math.abs(dx) > Math.min(45, cardWidth * 0.16);

      if (!cancel && (isFlick || isThreshold)) {
        sounds.playClick();
        const stepCount = Math.abs(dx) > cardWidth * 0.85 && velocity > 0.7 ? 2 : 1;
        setIndex(current => current + (dx < 0 ? stepCount : -stepCount));
      }
      suppressClickUntil.current = performance.now() + 250;
    }
    setDrag(0);
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!active) return null;

  const isCurrentActiveFilter = activeCategoryKey === active.key;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-slate-700/60 bg-[#0F172A] text-white shadow-xl p-4 sm:p-5 transition-all ${className}`}
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
      {/* Subtle, refined background overlay (No neon) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/15 via-transparent to-black/25 pointer-events-none" />

      {/* Top Banner Row: Section Title & All-Categories Button */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shadow-sm">
            <Sparkles size={16} />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>საგზაო კატეგორიების 3D Coverflow</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                დინამიკური რეჟიმი
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              აპრობირებული საგზაო ნიშნები • გადაფურცლეთ გაკვრით, სქროლით ან დააწკაპუნეთ ბარათზე
            </p>
          </div>
        </div>

        {/* Quick Filter Reset / Show All */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectCategory('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              activeCategoryKey === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Layers size={13} />
            <span>ყველა ობიექტი</span>
          </button>
        </div>
      </div>

      {/* 3D Coverflow Stage with Wheel Scrolling support */}
      <div
        ref={stage}
        onWheel={handleWheel}
        data-dragging={dragging || undefined}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={event => pointerUp(event)}
        onPointerCancel={event => pointerUp(event, true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative min-h-[290px] sm:min-h-[320px] flex items-center justify-center perspective-[1100px] transform-style-3d touch-pan-y select-none cursor-grab active:cursor-grabbing my-2"
        style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
      >
        {/* Subtle, soft floor drop shadow (Not glowing neon) */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[70%] max-w-[500px] h-[25px] rounded-full bg-black/40 blur-md pointer-events-none"
        />

        {slots.map(slot => {
          const item = items[wrap(slot, items.length)];
          const d = slot - index;
          const offset = d + drag;
          const abs = Math.abs(offset);
          const x = offset * step;
          const isSelected = slot === index;
          const isFiltered = activeCategoryKey === item.key;
          const ItemIcon = item.icon;

          return (
            <div
              key={slot}
              onClick={() => handleCardClick(item, slot)}
              title={isSelected ? "დააწკაპუნეთ გასაფილტრად" : `გადასვლა: ${item.title}`}
              className={`absolute top-1/2 -translate-y-1/2 rounded-2xl p-3 sm:p-3.5 transition-all duration-500 cursor-pointer select-none border group ${
                isSelected
                  ? 'border-amber-500/90 bg-[#172236] shadow-xl ring-1 ring-amber-500/30 z-30 scale-100'
                  : 'border-slate-700/60 bg-[#131B2B] shadow-md hover:border-slate-500 opacity-80 hover:opacity-100 z-10'
              }`}
              style={{
                width: `${cardWidth}px`,
                transform: `translate3d(${x}px, -50%, ${-Math.min(abs, 3) * 120}px) rotateY(${-Math.max(-40, Math.min(40, offset * 32))}deg) scale(${1 - Math.min(abs, 3) * 0.08})`,
                opacity: d < -before || d > after ? 0 : 1,
                pointerEvents: d < -before || d > after ? 'none' : 'auto',
                transition: dragging ? 'none' : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, border-color 0.25s',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Card Top: Official Group Label & Road Badge */}
              <div className="flex items-center justify-between gap-2 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1 truncate">
                  <ItemIcon size={12} className="text-amber-400 shrink-0" />
                  <span className="truncate">{item.groupTitle}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              {/* Grounded Road Sign Plate (Simple, authentic, standard traffic styling) */}
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#101726] border border-slate-700/50 flex items-center justify-center shadow-inner">
                <ThematicCategoryVisual
                  categoryKey={item.key}
                  isSelected={isSelected}
                  isFiltered={isFiltered}
                  countText={item.countText}
                  badge={item.badge}
                />

                {/* Road Sign Status Pill */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white pointer-events-none">
                  <span className="text-[10px] font-bold bg-slate-950/85 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                    {item.countText}
                  </span>
                  {isFiltered && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={11} /> გაფილტრულია
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom Info */}
              <div className="pt-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-white truncate tracking-tight">
                    {item.title}
                  </h5>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                      isFiltered
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : isSelected
                          ? 'bg-white/15 text-amber-300 border-amber-500/40'
                          : 'bg-white/5 text-slate-300 border-white/10 group-hover:bg-amber-500/20 group-hover:text-amber-300'
                    }`}
                  >
                    {isFiltered ? 'გაფილტრულია' : isSelected ? 'არჩევა' : 'დააწკაპუნეთ'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Controls Bar: Active Info + Dock Navigation */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 pt-2 border-t border-slate-800">
        <div className="text-center max-w-xl">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{active.title}</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${active.badgeColor}`}>
                {active.badge}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 sm:line-clamp-none">
            {active.description}
          </p>
        </div>

        {/* Dock Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 shadow-sm">
            {/* Position indicator */}
            <span className="text-xs font-mono font-bold text-slate-300 border-r border-slate-700 pr-2.5">
              <span className="text-amber-400 font-bold">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{String(items.length).padStart(2, "0")}</span>
            </span>

            {/* Transport Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => select(index - 1)}
                aria-label="წინა კატეგორია"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-90"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={() => setPlaying(prev => !prev)}
                aria-label={playing ? "პაუზა" : "ავტო-დათვალიერება"}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  playing
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              </button>

              <button
                type="button"
                onClick={() => select(index + 1)}
                aria-label="შემდეგი კატეგორია"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white transition-all active:scale-90"
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
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 ${
              isCurrentActiveFilter
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
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
        <p className="text-[10px] text-slate-400 flex items-center gap-2 flex-wrap justify-center">
          <span className="flex items-center gap-1"><MousePointer size={11} className="text-amber-400" /> გაკვრა (Flick)</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1"><RotateCw size={11} className="text-amber-400" /> მაუსით სქროლი</span>
          <span className="text-slate-600">•</span>
          <ArrowLeft size={10} />
          <ArrowRight size={10} />
          <span>ისრებით მართვა</span>
        </p>
      </div>

      {/* ======================================================== */}
      {/* Bottom Horizontal Quick-Nav Icon Strip (10 Categories)   */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full pt-2.5 mt-2.5 border-t border-slate-800">
        <div className="flex items-center justify-between pb-1.5 px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            საგზაო ნიშნების სწრაფი ზოლი (ნებისმიერზე დაჭერით გადასვლა)
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-bold">
            10 კატეგორია
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:justify-center">
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
                className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black scale-105'
                    : isFiltered
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                }`}
              >
                <Icon
                  size={13}
                  className={`shrink-0 ${
                    isSelected ? 'text-slate-950' : isFiltered ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span className="whitespace-nowrap text-[11px] font-sans">
                  {cat.shortName}
                </span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                    isSelected
                      ? 'bg-slate-950 text-amber-300'
                      : isFiltered
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-900 text-slate-400'
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
