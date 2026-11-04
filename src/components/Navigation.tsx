import React, { useState, useEffect } from 'react';
import { sounds } from '../services/soundEffects';
import {
  LayoutGrid,
  Activity,
  ShieldAlert,
  Wrench,
  ParkingSquare,
  Navigation as NavigationIcon,
  GraduationCap,
  Car,
  Bot,
  MoreHorizontal,
  X,
  ChevronRight
} from 'lucide-react';

export type TabType = 'home' | 'obd' | 'fines' | 'parking' | 'ai' | 'service' | 'map' | 'garage' | 'settings' | 'exam';

interface Props {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  dtcCount: number;
  finesCount: number;
  lang?: 'ge' | 'en';
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  dtcCount,
  finesCount,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  // Close sheet on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMoreSheetOpen) {
        setIsMoreSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoreSheetOpen]);

  // Lock body scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (isMoreSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMoreSheetOpen]);

  const desktopTabs = [
    {
      id: 'home' as TabType,
      label: isGe ? 'მთავარი' : 'Dashboard',
      icon: LayoutGrid,
      badge: null as string | null,
      badgeColor: ''
    },
    {
      id: 'obd' as TabType,
      label: isGe ? 'დიაგნოსტიკა' : 'Diagnostics',
      icon: Activity,
      badge: dtcCount > 0 ? `${dtcCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-black'
    },
    {
      id: 'fines' as TabType,
      label: isGe ? 'ჯარიმები' : 'Fines',
      icon: ShieldAlert,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-[#FC8181] text-white font-black'
    },
    {
      id: 'exam' as TabType,
      label: isGe ? 'ბილეთები' : 'Tickets',
      icon: GraduationCap,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'parking' as TabType,
      label: isGe ? 'პარკინგი' : 'Parking',
      icon: ParkingSquare,
      badge: 'LIVE',
      badgeColor: 'bg-[#2563EB] text-white font-black'
    },
    {
      id: 'map' as TabType,
      label: isGe ? 'რუკა' : 'Live Map',
      icon: NavigationIcon,
      badge: 'LIVE',
      badgeColor: 'bg-[#06B6D4] text-white font-black'
    },
    {
      id: 'service' as TabType,
      label: isGe ? 'სერვისი' : 'Service Log',
      icon: Wrench,
      badge: null,
      badgeColor: ''
    }
  ];

  // Primary 4 tabs for mobile bottom bar
  const mobilePrimaryTabs = [
    {
      id: 'home' as TabType,
      label: isGe ? 'მთავარი' : 'Home',
      icon: LayoutGrid,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'obd' as TabType,
      label: isGe ? 'OBD-II' : 'OBD',
      icon: Activity,
      badge: dtcCount > 0 ? `${dtcCount}` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    {
      id: 'map' as TabType,
      label: isGe ? 'რუკა' : 'Map',
      icon: NavigationIcon,
      badge: 'LIVE',
      badgeColor: 'bg-cyan-500 text-white'
    },
    {
      id: 'fines' as TabType,
      label: isGe ? 'ჯარიმები' : 'Fines',
      icon: ShieldAlert,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-rose-500 text-white'
    }
  ];

  // Items inside "More" Bottom Sheet
  const moreSheetItems = [
    {
      id: 'garage' as TabType,
      title: isGe ? 'ჩემი გარაჟი' : 'My Garage',
      desc: isGe ? 'ავტოპარკი, ტექ-პასპორტი და პროფილი' : 'Vehicles, Tech Passport & Profile',
      icon: Car,
      color: 'bg-amber-500/15 text-amber-600',
      badge: null
    },
    {
      id: 'parking' as TabType,
      title: isGe ? 'პარკინგი' : 'Smart Parking',
      desc: isGe ? 'თბილისი, ბათუმი, ქუთაისი • LIVE ზონები' : 'Tbilisi, Batumi, Kutaisi Live Zones',
      icon: ParkingSquare,
      color: 'bg-blue-500/15 text-blue-600',
      badge: 'LIVE'
    },
    {
      id: 'exam' as TabType,
      title: isGe ? 'საგამოცდო ბილეთები' : 'Exam Tickets',
      desc: isGe ? 'მართვის მოწმობის თეორია 2026' : 'Driving License Theory Test 2026',
      icon: GraduationCap,
      color: 'bg-emerald-500/15 text-emerald-600',
      badge: null
    },
    {
      id: 'service' as TabType,
      title: isGe ? 'სერვისის ჟურნალი' : 'Service Log',
      desc: isGe ? 'ზეთის, ფილტრების & ხარჯების ისტორია' : 'Maintenance & Expense Records',
      icon: Wrench,
      color: 'bg-purple-500/15 text-purple-600',
      badge: null
    },
    {
      id: 'ai' as TabType,
      title: isGe ? 'CarMe AI ასისტენტი' : 'CarMe AI Mechanic',
      desc: isGe ? 'ხელოვნური ინტელექტის ონლაინ დიაგნოსტიკა' : 'AI Powered Instant Troubleshooting',
      icon: Bot,
      color: 'bg-gold/20 text-navy',
      badge: 'AI'
    }
  ];

  const isMoreActive = ['garage', 'parking', 'exam', 'service', 'ai'].includes(activeTab);

  return (
    <>
      {/* ----------------------------------------------------------- */}
      {/* 1. DESKTOP TOP NAVIGATION STRIP (hidden on mobile < md)     */}
      {/* ----------------------------------------------------------- */}
      <nav
        data-tour="navigation-menu"
        className="hidden md:block w-full max-w-full relative z-30 transition-colors border-t border-white/60 bg-[#ECEAE5]/90"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-4 lg:gap-5 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth w-full">
            {desktopTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectTab(tab.id);
                  }}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-white text-navy shadow-xs border border-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-navy hover:bg-white/40'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      isActive ? 'text-gold' : 'text-slate-500'
                    }`}
                  />
                  <span className="whitespace-nowrap">{tab.label}</span>

                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-mono font-black ${tab.badgeColor} shadow-xs ml-0.5 shrink-0`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ----------------------------------------------------------- */}
      {/* 2. MOBILE NATIVE BOTTOM APP NAVIGATION BAR (md:hidden)       */}
      {/* ----------------------------------------------------------- */}
      <nav
        data-tour="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ECEAE5]/95 backdrop-blur-2xl border-t border-slate-300/80 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] pt-1 px-1.5 select-none"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          {mobilePrimaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  onSelectTab(tab.id);
                }}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
                  isActive
                    ? 'text-navy font-black'
                    : 'text-slate-500 hover:text-navy'
                }`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute -top-1 w-7 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
                )}

                <div className="relative flex items-center justify-center w-7 h-7">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-150 ${
                      isActive ? 'text-gold scale-110' : 'text-slate-500'
                    }`}
                  />

                  {/* Micro Badge for DTC or Fines */}
                  {tab.badge && (
                    <span
                      className={`absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${tab.badgeColor} shadow-xs`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                    isActive ? 'font-black text-navy' : 'font-medium text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* 5th Button: More / Menu with Bottom Sheet Drawer */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsMoreSheetOpen((prev) => !prev);
            }}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              isMoreActive || isMoreSheetOpen
                ? 'text-navy font-black'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            {/* Active Indicator for More Tab */}
            {(isMoreActive || isMoreSheetOpen) && (
              <span className="absolute -top-1 w-7 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}

            <div className="relative flex items-center justify-center w-7 h-7">
              <MoreHorizontal
                className={`w-5 h-5 transition-transform duration-150 ${
                  isMoreActive || isMoreSheetOpen ? 'text-gold scale-110' : 'text-slate-500'
                }`}
              />

              {/* Pulsing indicator if one of more services is active */}
              {isMoreActive && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-gold animate-ping" />
              )}
            </div>

            <span
              className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
                isMoreActive || isMoreSheetOpen ? 'font-black text-navy' : 'font-medium text-slate-500'
              }`}
            >
              {isGe ? 'მეტი' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* ----------------------------------------------------------- */}
      {/* 3. MOBILE NATIVE "MORE" BOTTOM SHEET DRAWER                 */}
      {/* ----------------------------------------------------------- */}
      {isMoreSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-navy/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMoreSheetOpen(false)}
          />

          {/* Bottom Sheet Modal Container */}
          <div
            className="relative z-10 w-full bg-[#ECEAE5] rounded-t-3xl border-t border-white/90 shadow-2xl p-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))] animate-slide-up max-h-[85dvh] overflow-y-auto"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Native Drag Pill Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-300/60">
              <div>
                <h3 className="text-base font-black text-navy tracking-tight">
                  {isGe ? 'CarMe სერვისები' : 'CarMe Services'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isGe ? 'დამატებითი ფუნქციები & მართვა' : 'Additional features & tools'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-navy flex items-center justify-center border border-slate-200 shadow-xs"
              >
                <X size={16} />
              </button>
            </div>

            {/* Service Cards List */}
            <div className="space-y-2">
              {moreSheetItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sounds.playSuccess();
                      setIsMoreSheetOpen(false);
                      onSelectTab(item.id);
                    }}
                    className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between gap-3 text-left active:scale-[0.98] ${
                      isActive
                        ? 'bg-white border-2 border-gold shadow-md'
                        : 'bg-white/80 hover:bg-white border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black truncate ${isActive ? 'text-gold' : 'text-navy'}`}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black bg-gold/20 text-navy border border-gold/40">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={16} className={`shrink-0 ${isActive ? 'text-gold' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick CarMe Info Footer in Sheet */}
            <div className="mt-4 pt-3 border-t border-slate-300/50 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono font-bold text-navy">CarMe v2.5 PRO</span>
              <span className="text-gold font-bold">carme.ge</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
