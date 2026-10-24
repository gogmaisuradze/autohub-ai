"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TabType } from "../Navigation";
import { DtcCode, FineItem, ServiceItem } from "../../types";
import { sounds } from "../../services/soundEffects";
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
  lang?: 'ge' | 'en';
}

export const ServicesOrbitCarousel: React.FC<Props> = ({
  dtcCodes,
  fines,
  servicesList,
  onSelectDepartment,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';
  const pendingFines = fines.filter(f => f.status === 'pending');
  const totalFineDiscounted = pendingFines.reduce((acc, f) => acc + f.discounted_amount_gel, 0);
  const oilService = servicesList.find(s => s.category === 'oil' || s.variant_key === 'engine_oil' || s.title_ge.toLowerCase().includes('ზეთ'));

  const hubServices = [
    {
      id: 1,
      tab: 'obd' as TabType,
      title: isGe ? 'ტესტირება' : 'OBD Test',
      name: isGe ? 'დიაგნოსტიკა & ტესტირება' : 'Diagnostics & OBD-II',
      role: isGe ? 'ცოცხალი ტელემეტრია & DTC' : 'Live Telemetry & DTC',
      icon: Activity,
      badgeText: dtcCodes.length > 0 ? (isGe ? `${dtcCodes.length} DTC ხარვეზი` : `${dtcCodes.length} DTC Errors`) : (isGe ? 'სისტემა სუფთაა' : 'Systems OK'),
      badgeColor: dtcCodes.length > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white',
      desc: isGe
        ? 'შეცდომების კოდების ამოკითხვა, ლაზერული სკანირება და Check Engine-ის ჩაქრობა.'
        : 'Read error codes, laser scan and clear Check Engine DTC.',
      accent: '#FCA311'
    },
    {
      id: 2,
      tab: 'fines' as TabType,
      title: isGe ? 'ჯარიმები' : 'Fines',
      name: isGe ? 'საპატრულო ჯარიმები' : 'Police Video Fines',
      role: isGe ? 'ვიდეოკამერების მონიტორინგი' : 'Smart Traffic Monitoring',
      icon: ShieldAlert,
      badgeText: pendingFines.length > 0 ? (isGe ? `${pendingFines.length} აქტიური` : `${pendingFines.length} Active`) : (isGe ? 'სუფთაა' : 'Clean'),
      badgeColor: 'bg-gold text-navy font-black',
      desc: isGe
        ? `გადასახდელია ${totalFineDiscounted} ₾ (მოქმედებს -20% საშეღავათო ვადა).`
        : `Outstanding: ${totalFineDiscounted} GEL (-20% discount active).`,
      accent: '#FCA311'
    },
    {
      id: 3,
      tab: 'parking' as TabType,
      title: isGe ? 'პარკინგი' : 'Parking',
      name: isGe ? 'საპარკინგე სერვისები' : 'Parking Services',
      role: isGe ? 'ზონები, ტაიმერი & აბონემენტი' : 'Zones, Timer & Pass',
      icon: ParkingSquare,
      badgeText: 'LIVE',
      badgeColor: 'bg-blue-600 text-white font-black',
      desc: isGe
        ? 'თბილისის ზონალური პარკირების წამზომი (A/B/C), მუნიციპალური ჯარიმები და აბონემენტები.'
        : 'Tbilisi zoned parking stopwatch (A/B/C), municipal fines and passes.',
      accent: '#2563EB'
    },
    {
      id: 4,
      tab: 'service' as TabType,
      title: isGe ? 'სერვისი' : 'Service',
      name: isGe ? 'მოვლის ისტორია & რესურსი' : 'Service History & Lifespan',
      role: isGe ? 'რესურსის პროგრეს-ბარები' : 'Resource Tracking',
      icon: Wrench,
      badgeText: oilService ? (isGe ? `ზეთი ${oilService.health_percentage}%` : `Oil ${oilService.health_percentage}%`) : (isGe ? 'სერვისი' : 'Service'),
      badgeColor: 'bg-gold text-navy font-black',
      desc: oilService
        ? (isGe ? `ძრავის ზეთის შეცვლამდე დარჩა ${oilService.remaining_km.toLocaleString()} კმ.` : `Oil change due in ${oilService.remaining_km.toLocaleString()} km.`)
        : (isGe ? 'სერვისის განრიგი.' : 'Maintenance schedule.'),
      accent: '#FCA311'
    },
    {
      id: 5,
      tab: 'garage' as TabType,
      title: isGe ? 'მეტი' : 'More',
      name: isGe ? 'მეტი — გარაჟი, მოწმობა & რუკა' : 'Garage, License & Live Map',
      role: isGe ? 'მართვის მოწმობა & რუკა' : 'Driver License & Live Map',
      icon: Car,
      badgeText: isGe ? '90 ქულა' : '90 Points',
      badgeColor: 'bg-emerald-500 text-white font-black',
      desc: isGe
        ? 'მართვის მოწმობის Google Notebook კონსპექტი, საგზაო წესები, Waze რუკა, რადარები და ბენზინის ფასები.'
        : 'Google Notebook driving license study guide, rules, Waze map, radars and fuel prices.',
      accent: '#10B981'
    },
    {
      id: 6,
      tab: 'ai' as TabType,
      title: isGe ? 'AI მექანიკოსი' : 'AI Mechanic',
      name: isGe ? 'AI მექანიკოსი' : 'AI Mechanic',
      role: isGe ? 'პერსონალური ონლაინ ოსტატი' : '24/7 Smart Mechanic',
      icon: Bot,
      badgeText: 'ONLINE 24/7',
      badgeColor: 'bg-navy text-white',
      desc: isGe
        ? 'დიაგნოსტიკის ანალიზი, ნაწილების ფასები თბილისის ბაზარზე და ხარჯთაღრიცხვა.'
        : 'Diagnostic analysis, auto part pricing on local market and cost estimates.',
      accent: '#14213D'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Generous radius so the orbiting nodes NEVER touch the central window
  const [radius, setRadius] = useState(250);
  const [nodeSize, setNodeSize] = useState(82);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Available vertical space between navigation and bottom
      const availH = Math.max(380, h - 210);

      if (w < 440) {
        setRadius(135);
        setNodeSize(58);
      } else if (w < 640) {
        setRadius(165);
        setNodeSize(66);
      } else if (w < 768) {
        setRadius(195);
        setNodeSize(72);
      } else if (availH < 680) {
        // Compact height laptops
        setRadius(230);
        setNodeSize(78);
      } else {
        // Standard and large screens - generously expanded
        setRadius(255);
        setNodeSize(84);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerSize = radius * 2 + nodeSize + 20;

  const getRotation = useCallback(
    (index: number): number => (index - activeIndex) * (360 / hubServices.length),
    [activeIndex, hubServices.length]
  );

  const next = () => {
    sounds.playClick();
    setActiveIndex((i) => (i + 1) % hubServices.length);
  };

  const prev = () => {
    sounds.playClick();
    setActiveIndex((i) => (i - 1 + hubServices.length) % hubServices.length);
  };

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % hubServices.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovering, hubServices.length]);

  const activeService = hubServices[activeIndex];
  const ActiveIcon = activeService.icon;

  const handleNodeClick = (index: number, tab: TabType) => {
    sounds.playClick();
    if (index === activeIndex) {
      onSelectDepartment(tab);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-1 sm:p-2 relative select-none overflow-visible no-scrollbar my-auto"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Orbit Container with optimal fit */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >
        {/* Rotating Pronounced Dashed Orbit Track Line - 100% centered on nodes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 85,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute pointer-events-none z-0 flex items-center justify-center"
          style={{
            width: radius * 2,
            height: radius * 2,
          }}
        >
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          >
            <circle
              cx={radius}
              cy={radius}
              r={radius}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.8"
              strokeDasharray="16 11"
              strokeOpacity="0.55"
            />
          </svg>
        </motion.div>

        {/* Central Recessed Inset Card (ჩაღრმავებული სუფთა თეთრი ფანჯარა, თითქოს შიგნით ზის) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="z-10 rounded-3xl p-3.5 sm:p-4.5 w-[185px] min-[400px]:w-[205px] sm:w-[225px] md:w-[235px] text-center bg-[#F7F9FC] border border-slate-200/80 shadow-[inset_4px_4px_10px_rgba(140,155,175,0.32),inset_-4px_-4px_10px_rgba(255,255,255,1)]"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-center mb-1 sm:mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black shadow-xs ${activeService.badgeColor}`}>
                {activeService.badgeText}
              </span>
            </div>

            {/* Recessed Icon Plate */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full mx-auto my-1 sm:my-1.5 flex items-center justify-center bg-white shadow-[inset_2px_2px_4px_rgba(140,155,175,0.35),inset_-2px_-2px_4px_rgba(255,255,255,1)] border border-slate-100">
              <ActiveIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-navy" />
            </div>

            <h3 className="text-xs sm:text-base font-black text-navy mt-0.5 tracking-tight">
              {activeService.name}
            </h3>

            <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-0.5">
              {activeService.role}
            </p>

            <p className="text-[10px] sm:text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed px-1">
              {activeService.desc}
            </p>

            {/* Inset Navigation & Action Buttons */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-300/40">
              <button
                onClick={prev}
                className="btn-stitch-soft w-8 h-8 rounded-full p-0 flex items-center justify-center text-navy hover:text-gold"
                title={isGe ? "წინა" : "Previous"}
              >
                <ChevronLeft size={14} />
              </button>

              <button
                onClick={() => {
                  sounds.playSuccess();
                  onSelectDepartment(activeService.tab);
                }}
                className="btn-stitch-primary px-4 sm:px-5 py-2 text-xs sm:text-sm font-black"
              >
                <span>{isGe ? "გადასვლა" : "Enter"}</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={next}
                className="btn-stitch-soft w-8 h-8 rounded-full p-0 flex items-center justify-center text-navy hover:text-gold"
                title={isGe ? "შემდეგი" : "Next"}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Orbiting 3D Tactile Nodes with Rich Volume & Deep Drop Shadows (მოცულობითი ბურთები) */}
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
                  onClick={() => handleNodeClick(i, service.tab)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    background: isActive
                      ? "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FFFDF8 50%, #FDE3B2 100%)"
                      : "radial-gradient(circle at 32% 28%, #FFFFFF 0%, #F6F8FC 52%, #D3DCE8 100%)"
                  }}
                  className={`w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer transition-all border border-white ${
                    isActive
                      ? "ring-4 ring-gold/90 shadow-[0_0_24px_rgba(252,163,17,0.48),8px_8px_20px_rgba(130,145,170,0.48),-6px_-6px_16px_rgba(255,255,255,1)] scale-105"
                      : "shadow-[8px_8px_18px_rgba(130,145,170,0.46),-7px_-7px_16px_rgba(255,255,255,1),inset_0_1px_2px_rgba(255,255,255,1)] hover:border-gold hover:shadow-[10px_10px_24px_rgba(130,145,170,0.52),-8px_-8px_20px_rgba(255,255,255,1)]"
                  }`}
                  title={service.name}
                >
                  <NodeIcon
                    size={nodeSize >= 86 ? 28 : nodeSize >= 75 ? 24 : nodeSize >= 65 ? 20 : 17}
                    className={`transition-colors duration-200 drop-shadow-xs ${isActive ? "text-gold" : "text-navy"}`}
                  />
                  <span className={`font-black tracking-tight truncate max-w-[86%] mt-0.5 text-center transition-colors duration-200 ${
                    nodeSize >= 86 ? "text-xs" : nodeSize >= 75 ? "text-[11px]" : "text-[9px]"
                  } ${isActive ? "text-navy" : "text-slate-800"}`}>
                    {service.title}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Indicator Dots */}
      <div className="flex justify-center mt-2.5 space-x-2">
        {hubServices.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              sounds.playClick();
              setActiveIndex(index);
            }}
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
