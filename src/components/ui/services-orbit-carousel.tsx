"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabType } from "../Navigation";
import { DtcCode, FineItem, ServiceItem } from "../../types";
import {
  Activity,
  ShieldAlert,
  Bot,
  Wrench,
  Car,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Camera,
  ParkingSquare
} from "lucide-react";

interface Props {
  dtcCodes: DtcCode[];
  fines: FineItem[];
  servicesList: ServiceItem[];
  onSelectDepartment: (tab: TabType) => void;
}

export const ServicesOrbitCarousel: React.FC<Props> = ({
  dtcCodes,
  fines,
  servicesList,
  onSelectDepartment
}) => {
  const pendingFines = fines.filter(f => f.status === 'pending');
  const totalFineDiscounted = pendingFines.reduce((acc, f) => acc + f.discounted_amount_gel, 0);
  const oilService = servicesList.find(s => s.category === 'oil' || s.variant_key === 'engine_oil' || s.title_ge.toLowerCase().includes('ზეთ'));

  const hubServices = [
    {
      id: 1,
      tab: 'obd' as TabType,
      title: 'ტესტირება',
      name_ge: 'დიაგნოსტიკა & ტესტირება',
      role: 'ცოცხალი ტელემეტრია & DTC',
      icon: Activity,
      badgeText: dtcCodes.length > 0 ? `${dtcCodes.length} DTC ხარვეზი` : 'სისტემა სუფთაა',
      badgeColor: dtcCodes.length > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white',
      desc: 'შეცდომების კოდების ამოკითხვა, ლაზერული სკანირება და Check Engine-ის ჩაქრობა.',
      accent: '#FCA311'
    },
    {
      id: 2,
      tab: 'fines' as TabType,
      title: 'ჯარიმები',
      name_ge: 'საპატრულო ჯარიმები (police.ge)',
      role: 'ვიდეოკამერების მონიტორინგი',
      icon: Camera,
      badgeText: pendingFines.length > 0 ? `${pendingFines.length} აქტიური` : 'სუფთაა',
      badgeColor: 'bg-gold text-navy font-black',
      desc: `გადასახდელია ${totalFineDiscounted} ₾ (მოქმედებს -20% საშეღავათო ვადა 11 დღე).`,
      accent: '#FCA311'
    },
    {
      id: 3,
      tab: 'parking' as TabType,
      title: 'პარკინგი',
      name_ge: 'საპარკინგე სერვისები',
      role: 'ზონები, ტაიმერი & აბონემენტი',
      icon: ParkingSquare,
      badgeText: 'LIVE',
      badgeColor: 'bg-blue-600 text-white font-black',
      desc: 'თბილისის ზონალური პარკირების წამზომი (A/B/C), მუნიციპალური ჯარიმები და აბონემენტები.',
      accent: '#2563EB'
    },
    {
      id: 4,
      tab: 'service' as TabType,
      title: 'სერვისი',
      name_ge: 'მოვლის ისტორია & რესურსი',
      role: 'რესურსის პროგრეს-ბარები',
      icon: Wrench,
      badgeText: oilService ? `ზეთი ${oilService.health_percentage}%` : 'სერვისი',
      badgeColor: 'bg-gold text-navy font-black',
      desc: oilService ? `ძრავის ზეთის შეცვლამდე დარჩა ${oilService.remaining_km.toLocaleString()} კმ.` : 'სერვისის განრიგი.',
      accent: '#FCA311'
    },
    {
      id: 5,
      tab: 'garage' as TabType,
      title: 'მეტი',
      name_ge: 'მეტი — გარაჟი, რუკა & ფასები',
      role: 'რუკა, სალონები & საწვავი',
      icon: Car,
      badgeText: 'მეტი',
      badgeColor: 'bg-emerald-500 text-white font-black',
      desc: 'პატრულის ჩასაფრებები, რადარები, Wissol/Gulf საწვავის ფასები, ავტო სალონები და გარაჟი.',
      accent: '#10B981'
    },
    {
      id: 6,
      tab: 'ai' as TabType,
      title: 'AI ჩატი',
      name_ge: 'AI ასისტენტი (GPT-4o)',
      role: 'პერსონალური ონლაინ ოსტატი',
      icon: Bot,
      badgeText: 'ONLINE 24/7',
      badgeColor: 'bg-navy text-white',
      desc: 'დიაგნოსტიკის ანალიზი, ნაწილების ფასები თბილისის ბაზარზე და ხარჯთაღრიცხვა.',
      accent: '#14213D'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Generous radius and enlarged round service nodes for optimal visibility and tactile feel
  const [radius, setRadius] = useState(315);
  const [nodeSize, setNodeSize] = useState(115);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 420) {
        setRadius(175);
        setNodeSize(75);
      } else if (w < 540) {
        setRadius(215);
        setNodeSize(88);
      } else if (w < 768) {
        setRadius(255);
        setNodeSize(98);
      } else if (w < 1024) {
        setRadius(285);
        setNodeSize(106);
      } else {
        setRadius(315);
        setNodeSize(115);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerSize = radius * 2 + nodeSize + 40;

  const getRotation = useCallback(
    (index: number): number => (index - activeIndex) * (360 / hubServices.length),
    [activeIndex, hubServices.length]
  );

  const next = () => setActiveIndex((i) => (i + 1) % hubServices.length);
  const prev = () => setActiveIndex((i) => (i - 1 + hubServices.length) % hubServices.length);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [isHovering]);

  const activeService = hubServices[activeIndex];
  const ActiveIcon = activeService.icon;

  return (
    <div
      className="flex flex-col items-center justify-center p-2 sm:p-4 my-2 relative select-none overflow-x-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Orbit Container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Soft Circular Orbit Track Ring */}
        <div
          className="absolute rounded-full border-2 border-dashed border-slate-300 pointer-events-none opacity-50 transition-all duration-300"
          style={{ width: radius * 2, height: radius * 2 }}
        />

        {/* Central Active Department Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService.id}
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -15 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="z-10 neu-card rounded-3xl p-5 sm:p-6 w-72 sm:w-80 md:w-[340px] text-center shadow-neu-card border border-white"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-center mb-2">
              <span className={`px-3 py-0.5 rounded-full text-xs font-black shadow-sm ${activeService.badgeColor}`}>
                {activeService.badgeText}
              </span>
            </div>

            {/* Icon Avatar */}
            <div className="w-14 h-14 rounded-full neu-circle mx-auto my-2 flex items-center justify-center shadow-md">
              <ActiveIcon className="w-7 h-7 text-navy" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-navy mt-1.5 tracking-tight">
              {activeService.name_ge}
            </h3>

            <p className="text-xs text-slate-500 font-bold mt-0.5">
              {activeService.role}
            </p>

            <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed px-1">
              {activeService.desc}
            </p>

            {/* Navigation & Action Buttons */}
            <div className="flex items-center justify-center gap-2.5 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
                title="წინა"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => onSelectDepartment(activeService.tab)}
                className="px-5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold bg-gold hover:bg-amber-400 text-navy shadow-gold-soft flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>გადასვლა</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={next}
                className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
                title="შემდეგი"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Orbiting Department Circular Nodes */}
        {hubServices.map((service, i) => {
          const rotation = getRotation(i);
          const isActive = i === activeIndex;
          const NodeIcon = service.icon;

          return (
            <motion.div
              key={service.id}
              animate={{
                transform: `rotate(${rotation}deg) translateY(-${radius}px)`,
              }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 22,
                delay: isActive ? 0 : Math.abs(i - activeIndex) * 0.04
              }}
              style={{
                width: nodeSize,
                height: nodeSize,
                position: "absolute",
                top: `calc(50% - ${nodeSize / 2}px)`,
                left: `calc(50% - ${nodeSize / 2}px)`,
                zIndex: isActive ? 25 : 15,
              }}
            >
              {/* Counter-rotation to keep icons upright */}
              <motion.div
                animate={{ rotate: -rotation }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 22,
                }}
                className="w-full h-full"
              >
                <motion.div
                  onClick={() => setActiveIndex(i)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.94 }}
                  className={`w-full h-full rounded-full neu-circle flex flex-col items-center justify-center cursor-pointer transition-all border border-white/80 shadow-md ${
                    isActive
                      ? "ring-4 ring-gold shadow-gold-soft bg-white scale-105"
                      : "hover:border-gold opacity-95 hover:opacity-100 hover:shadow-lg"
                  }`}
                  title={service.name_ge}
                >
                  <NodeIcon
                    size={nodeSize >= 105 ? 38 : nodeSize >= 90 ? 32 : nodeSize >= 75 ? 28 : 24}
                    className={`transition-colors duration-200 ${isActive ? "text-gold" : "text-navy"}`}
                  />
                  <span className={`font-black tracking-tight truncate max-w-[88%] mt-1.5 text-center transition-colors duration-200 ${
                    nodeSize >= 105 ? "text-xs sm:text-sm" : nodeSize >= 90 ? "text-xs" : "text-[11px]"
                  } ${isActive ? "text-navy" : "text-slate-700"}`}>
                    {service.title}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Indicator Dots */}
      <div className="flex justify-center mt-3 space-x-2">
        {hubServices.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === activeIndex
                ? "bg-gold scale-125 shadow-sm"
                : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesOrbitCarousel;
