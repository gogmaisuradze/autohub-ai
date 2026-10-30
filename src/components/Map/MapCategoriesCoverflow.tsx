"use client";

import React, { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
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
  Sparkles
} from "lucide-react";
import { sounds } from "../../services/soundEffects";

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
  subtitle: string;
  badge: string;
  badgeColor: string;
  accent: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  image: string;
  description: string;
  countText: string;
}

export const MAP_CATEGORIES: MapCategoryItem[] = [
  {
    key: 'radar',
    groupTitle: 'მოძრაობა & უსაფრთხოება',
    title: 'რადარები & კამერები',
    subtitle: 'სიჩქარის & შუქნიშნის კამერები',
    badge: '260 კამერა',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    accent: '#F59E0B',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    description: 'საქართველოს მასშტაბით სიჩქარის სტაციონარული, სექციური და ჭკვიანი შუქნიშნის კამერები 300მ წინასწარი ხმოვანი გაფრთხილებით.',
    countText: '260 აქტიური წერტილი'
  },
  {
    key: 'traffic_jam',
    groupTitle: 'მოძრაობა & საცობები',
    title: 'საცობები (Live)',
    subtitle: 'მძიმე შეფერხებები & ალტერნატივები',
    badge: 'LIVE 12',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    accent: '#EF4444',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
    description: 'თბილისისა და რეგიონების მძიმე საცობები რეალურ დროში, ალტერნატიული სწრაფი მარშრუტები და მოძრაობის დინამიკა.',
    countText: '12 აქტიური საცობი'
  },
  {
    key: 'fuel',
    groupTitle: 'საწვავი & ენერგია',
    title: 'ავტოგასამართი & ფასები',
    subtitle: 'Gulf, Wissol, Socar, Rompetrol, Lukoil',
    badge: '1 421 ლოკაცია',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    accent: '#10B981',
    icon: Fuel,
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    description: 'საწვავის განახლებული ფასები: Gulf, Wissol, Socar, Rompetrol, Lukoil, Portal. პრემიუმი, რეგულარი, დიზელი და გაზი.',
    countText: '1 421 სადგური'
  },
  {
    key: 'charging',
    groupTitle: 'საწვავი & ენერგია',
    title: 'EV დამტენები',
    subtitle: 'ელექტრომობილების სწრაფი დამტენები',
    badge: '254 სადგური',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    accent: '#06B6D4',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    description: 'ელექტრომობილების სწრაფი DC და AC დამტენები (CCS2, Chademo, Type 2, GB/T, Tesla) მთელ საქართველოში.',
    countText: '254 დამტენი ჰაბი'
  },
  {
    key: 'service',
    groupTitle: 'ავტოსერვისი & მოვლა',
    title: 'სერვისი & ვულკანიზაცია',
    subtitle: 'დიაგნოსტიკა, სავალი ნაწილი, საბურავები',
    badge: '1 344 სერვისი',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    accent: '#6366F1',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    description: 'სავალი ნაწილის შეკეთება, კომპიუტერული დიაგნოსტიკა, ძრავის ოსტატები, ზეთის შეცვლა და 24/7 ვულკანიზაცია.',
    countText: '1 344 პროფესიონალი'
  },
  {
    key: 'car_wash',
    groupTitle: 'ავტოსერვისი & მოვლა',
    title: 'ავტოსამრეცხაო',
    subtitle: 'თვითმომსახურება & ქიმწმენდა',
    badge: '902 ობიექტი',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    accent: '#0EA5E9',
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80',
    description: 'თვითმომსახურების ბოქსები, ტურბო-ქაფი, უკონტაქტო რეცხვა, ავტო-დითეილინგი და ქიმწმენდა.',
    countText: '902 ავტოსამრეცხაო'
  },
  {
    key: 'parts',
    groupTitle: 'ნაწილები & სალონები',
    title: 'ავტონაწილები',
    subtitle: 'ნაწილები, დეტალები & ზეთები',
    badge: '619 მაღაზია',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    accent: '#A855F7',
    icon: Cog,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    description: 'ახალი და მეორადი ორიგინალი ნაწილები, ძრავის ზეთები, სამუხრუჭე ხუნდები, ფილტრები და აქსესუარები.',
    countText: '619 ავტომაღაზია'
  },
  {
    key: 'road_repair',
    groupTitle: 'მოძრაობა & საცობები',
    title: 'ქუჩის რემონტი',
    subtitle: 'საგზაო სამუშაოები & შეზღუდვები',
    badge: '14 მონაკვეთი',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    accent: '#F97316',
    icon: Construction,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    description: 'საგზაო სამუშაოები, გადათხრილი ქუჩები, ზოლების შევიწროება და დროებითი შემოვლითი გზები.',
    countText: '14 რემონტი'
  },
  {
    key: 'hazard',
    groupTitle: 'მოძრაობა & უსაფრთხოება',
    title: 'საგზაო საფრთხე',
    subtitle: 'შემთხვევები & შეფერხებები',
    badge: 'Live საფრთხე',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    accent: '#E11D48',
    icon: AlertTriangle,
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80',
    description: 'საგზაო შემთხვევები, მოყინული მონაკვეთები, ნისლი, ქვათაცვენა და გაფრთხილებები.',
    countText: 'ცოცხალი შეტყობინებები'
  },
  {
    key: 'showroom',
    groupTitle: 'ნაწილები & სალონები',
    title: 'ავტოსალონები',
    subtitle: 'ოფიციალური დილერები & ცენტრები',
    badge: '122 ცენტრი',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    accent: '#D97706',
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
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
  const cardWidth = Math.min(350, Math.max(250, stageSize.width * 0.58));
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

  const handleCardClick = (item: MapCategoryItem, slotIndex: number) => {
    if (performance.now() < suppressClickUntil.current) return;
    sounds.playClick();
    if (slotIndex === index) {
      // Toggle or activate filter on the map
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

  const pointerUp = (event: PointerEvent<HTMLDivElement>, cancel = false) => {
    const start = gesture.current;
    gesture.current = null;
    if (start?.horizontal) {
      const dx = event.clientX - start.x;
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.time);
      if (!cancel && (Math.abs(dx) > Math.min(50, cardWidth * 0.18) || (Math.abs(dx) > 14 && velocity > 0.35))) {
        sounds.playClick();
        setIndex(current => current + (dx < 0 ? 1 : -1));
      }
      suppressClickUntil.current = performance.now() + 300;
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
      className={`relative rounded-3xl overflow-hidden border-2 border-gold/40 bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#080d1a] text-white shadow-2xl p-4 sm:p-6 transition-all ${className}`}
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
      aria-label="3D Coverflow კატეგორიების კარუსელი"
    >
      {/* Background Ambience & Lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />

      {/* Top Banner Row: Section Title, Active Status & All-Categories Button */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gold/20 text-gold border border-gold/40 flex items-center justify-center font-bold text-sm shadow-sm">
            <Sparkles size={16} />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>კატეგორიების 3D Coverflow</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 uppercase">
                დინამიკური რეჟიმი
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              გადაფურცლეთ 3D ბარათები ან დააწკაპუნეთ რუკაზე ობიექტების გასაფილტრად
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
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
              activeCategoryKey === 'all'
                ? 'bg-gold text-navy border-gold shadow-md shadow-gold/20'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
            }`}
          >
            <Layers size={13} />
            <span>ყველა ობიექტი</span>
          </button>
        </div>
      </div>

      {/* 3D Coverflow Stage */}
      <div
        ref={stage}
        data-dragging={dragging || undefined}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={event => pointerUp(event)}
        onPointerCancel={event => pointerUp(event, true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative min-h-[300px] sm:min-h-[340px] flex items-center justify-center perspective-[1100px] transform-style-3d touch-pan-y select-none cursor-grab active:cursor-grabbing my-2"
        style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
      >
        {/* Floor subtle reflection ellipse */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[70%] max-w-[500px] h-[30px] rounded-full bg-gradient-to-r from-transparent via-gold/20 to-transparent blur-xl pointer-events-none"
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
              className={`absolute top-1/2 -translate-y-1/2 rounded-2xl p-3 sm:p-3.5 transition-all duration-500 cursor-pointer select-none border backdrop-blur-md ${
                isSelected
                  ? 'border-gold bg-[#151f33]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(245,158,11,0.35)] ring-2 ring-gold/40 z-30'
                  : 'border-white/15 bg-[#121a2d]/85 shadow-[0_15px_30px_rgba(0,0,0,0.4)] opacity-85 hover:opacity-100 hover:border-white/30 z-10'
              }`}
              style={{
                width: `${cardWidth}px`,
                transform: `translate3d(${x}px, -50%, ${-Math.min(abs, 3) * 120}px) rotateY(${-Math.max(-42, Math.min(42, offset * 32))}deg) scale(${1 - Math.min(abs, 3) * 0.08})`,
                opacity: d < -before || d > after ? 0 : 1,
                pointerEvents: d < -before || d > after ? 'none' : 'auto',
                transition: dragging ? 'none' : 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, border-color 0.25s',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Card Top: Group & Live Counter Badge */}
              <div className="flex items-center justify-between gap-2 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1 truncate">
                  <ItemIcon size={12} className="text-gold shrink-0" />
                  <span className="truncate">{item.groupTitle}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              {/* Card Poster Image with Thematic Gradient Overlay */}
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-white/10 group">
                <img
                  src={item.image}
                  alt={item.title}
                  draggable={false}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                {/* Floating Tag over Image */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                  <span className="text-xs font-black drop-shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    <span>{item.countText}</span>
                  </span>
                  {isFiltered && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={11} /> აქტიური
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom Info */}
              <div className="pt-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-sm font-black text-white truncate tracking-tight">
                    {item.title}
                  </h5>
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-lg border transition-all ${
                      isFiltered
                        ? 'bg-gold text-navy border-gold shadow-xs'
                        : isSelected
                          ? 'bg-white/15 text-gold border-gold/40'
                          : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {isFiltered ? 'გაფილტრულია' : isSelected ? 'არჩევა' : 'დათვალიერება'}
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
      <div className="relative z-10 flex flex-col items-center gap-3 pt-2 border-t border-white/10">
        <div className="text-center max-w-xl">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{active.title}</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${active.badgeColor}`}>
                {active.badge}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 sm:line-clamp-none">
            {active.description}
          </p>
        </div>

        {/* Dock Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/15 shadow-inner backdrop-blur-md">
            {/* Position indicator */}
            <span className="text-xs font-mono font-bold text-slate-300 border-r border-white/15 pr-3">
              <span className="text-gold font-black">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{String(items.length).padStart(2, "0")}</span>
            </span>

            {/* Transport Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => select(index - 1)}
                aria-label="წინა კატეგორია"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={() => setPlaying(prev => !prev)}
                aria-label={playing ? "პაუზა" : "ავტო-დათვალიერება"}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  playing
                    ? 'bg-gold text-navy font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
              </button>

              <button
                type="button"
                onClick={() => select(index + 1)}
                aria-label="შემდეგი კატეგორია"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
              >
                <ChevronRight size={17} />
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
            className={`px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 ${
              isCurrentActiveFilter
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-400 to-gold hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-gold/20'
            }`}
          >
            {isCurrentActiveFilter ? (
              <>
                <CheckCircle2 size={14} />
                <span>ფილტრი ჩართულია (გამორთვა)</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>რუკაზე ჩვენება ({active.title})</span>
              </>
            )}
          </button>
        </div>

        {/* Hint text */}
        <p className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>გადაათრიეთ (Drag) თითით ან მაუსით</span>
          <span className="text-slate-600">•</span>
          <ArrowLeft size={11} />
          <ArrowRight size={11} />
          <span>ან გამოიყენეთ კლავიატურის ისრები</span>
        </p>
      </div>
    </div>
  );
};
