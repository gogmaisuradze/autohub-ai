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
  ChevronRight,
  User,
  Settings
} from 'lucide-react';

export type TabType = 'home' | 'obd' | 'fines' | 'parking' | 'ai' | 'service' | 'map' | 'garage' | 'settings' | 'exam';

interface Props {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  dtcCount: number;
  finesCount: number;
  onOpenUserAccountModal?: () => void;
  lang?: 'ge' | 'en';
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  dtcCount,
  finesCount,
  onOpenUserAccountModal,
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ECEAE5] border-t border-slate-300 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-1.5 px-3 select-none"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          {/* 1st Tab: მთავარი */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsMoreSheetOpen(false);
              onSelectTab('home');
            }}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'home' && !isMoreSheetOpen ? 'text-gold font-black' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {activeTab === 'home' && !isMoreSheetOpen && (
              <span className="absolute -top-1 w-6 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-7 h-7">
              <LayoutGrid className={`w-5 h-5 transition-transform ${activeTab === 'home' && !isMoreSheetOpen ? 'text-gold scale-110' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[10.5px] tracking-tight mt-0.5 whitespace-nowrap ${activeTab === 'home' && !isMoreSheetOpen ? 'font-black text-navy' : 'font-medium text-slate-500'}`}>
              {isGe ? 'მთავარი' : 'Home'}
            </span>
          </button>

          {/* 2nd Tab: გარაჟი */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsMoreSheetOpen(false);
              onSelectTab('garage');
            }}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'garage' && !isMoreSheetOpen ? 'text-gold font-black' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {activeTab === 'garage' && !isMoreSheetOpen && (
              <span className="absolute -top-1 w-6 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-7 h-7">
              <Car className={`w-5 h-5 transition-transform ${activeTab === 'garage' && !isMoreSheetOpen ? 'text-gold scale-110' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[10.5px] tracking-tight mt-0.5 whitespace-nowrap ${activeTab === 'garage' && !isMoreSheetOpen ? 'font-black text-navy' : 'font-medium text-slate-500'}`}>
              {isGe ? 'გარაჟი' : 'Garage'}
            </span>
          </button>

          {/* 3rd Tab: სკანერი (ცენტრი - ამაღლებული მრგვალი Navy ღილაკი) */}
          <div className="relative flex flex-col items-center justify-center -mt-6">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsMoreSheetOpen(false);
                onSelectTab('obd');
              }}
              className={`w-14 h-14 rounded-full bg-[#14213D] border-4 border-[#ECEAE5] shadow-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
                activeTab === 'obd' && !isMoreSheetOpen ? 'ring-2 ring-gold shadow-[0_0_18px_rgba(245,158,11,0.55)]' : ''
              }`}
              title={isGe ? 'OBD სკანერი' : 'OBD Scanner'}
            >
              <Activity className="w-6 h-6 text-gold" strokeWidth={2.4} />
            </button>
            <span className={`text-[10.5px] tracking-tight mt-1 whitespace-nowrap ${activeTab === 'obd' && !isMoreSheetOpen ? 'font-black text-navy' : 'font-medium text-slate-500'}`}>
              {isGe ? 'სკანერი' : 'Scanner'}
            </span>
          </div>

          {/* 4th Tab: რუკა */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsMoreSheetOpen(false);
              onSelectTab('map');
            }}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'map' && !isMoreSheetOpen ? 'text-gold font-black' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {activeTab === 'map' && !isMoreSheetOpen && (
              <span className="absolute -top-1 w-6 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-7 h-7">
              <NavigationIcon className={`w-5 h-5 transition-transform ${activeTab === 'map' && !isMoreSheetOpen ? 'text-gold scale-110' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[10.5px] tracking-tight mt-0.5 whitespace-nowrap ${activeTab === 'map' && !isMoreSheetOpen ? 'font-black text-navy' : 'font-medium text-slate-500'}`}>
              {isGe ? 'რუკა' : 'Map'}
            </span>
          </button>

          {/* 5th Tab: მეტი */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsMoreSheetOpen((prev) => !prev);
            }}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              isMoreSheetOpen || (isMoreActive && activeTab !== 'garage')
                ? 'text-gold font-black'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            {(isMoreSheetOpen || (isMoreActive && activeTab !== 'garage')) && (
              <span className="absolute -top-1 w-6 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-7 h-7">
              <MoreHorizontal
                className={`w-5 h-5 transition-transform ${
                  isMoreSheetOpen || (isMoreActive && activeTab !== 'garage') ? 'text-gold scale-110' : 'text-slate-500'
                }`}
              />
            </div>
            <span className={`text-[10.5px] tracking-tight mt-0.5 whitespace-nowrap ${
              isMoreSheetOpen || (isMoreActive && activeTab !== 'garage') ? 'font-black text-navy' : 'font-medium text-slate-500'
            }`}>
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
            className="relative z-10 w-full bg-[#ECEAE5] rounded-t-3xl border-t border-white/90 shadow-2xl p-4 pb-[max(5.5rem,env(safe-area-inset-bottom,0px))] animate-slide-up max-h-[85dvh] overflow-y-auto"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Native Drag Pill Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-start justify-between pb-1 mb-3">
              <div>
                <h3 className="text-2xl font-black text-navy tracking-tight">
                  {isGe ? 'მეტი' : 'More'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isGe ? 'აპლიკაციის ყველა ფუნქცია' : 'All application features'}
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

            {/* 1. 2-Column Grid (6 Cards: Fines, Parking, AI Mechanic, Service, Tickets, Profile) */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* 1. ჯარიმები */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  onSelectTab('fines');
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
              >
                <ShieldAlert size={22} className="text-navy" />
                <span className="text-xs font-black text-navy">{isGe ? 'ჯარიმები' : 'Fines'}</span>
              </button>

              {/* 2. პარკინგი */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  onSelectTab('parking');
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
              >
                <ParkingSquare size={22} className="text-navy" />
                <span className="text-xs font-black text-navy">{isGe ? 'პარკინგი' : 'Parking'}</span>
              </button>

              {/* 3. AI მექანიკოსი */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  onSelectTab('ai');
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
              >
                <Bot size={22} className="text-navy" />
                <span className="text-xs font-black text-navy">{isGe ? 'AI მექანიკოსი' : 'AI Mechanic'}</span>
              </button>

              {/* 4. სერვისი */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  onSelectTab('service');
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
              >
                <Wrench size={22} className="text-navy" />
                <span className="text-xs font-black text-navy">{isGe ? 'სერვისი' : 'Service'}</span>
              </button>

              {/* 5. ბილეთები */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  onSelectTab('exam');
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
              >
                <GraduationCap size={22} className="text-navy" />
                <span className="text-xs font-black text-navy">{isGe ? 'ბილეთები' : 'Tickets'}</span>
              </button>

              {/* 6. პროფილი */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  if (onOpenUserAccountModal) {
                    onOpenUserAccountModal();
                  } else {
                    onSelectTab('garage');
                  }
                }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-start gap-3 active:scale-95 transition-all text-left"
              >
                <User size={22} className="text-navy" />
                <span className="text-xs font-black text-navy">{isGe ? 'პროფილი' : 'Profile'}</span>
              </button>
            </div>

            {/* 2. Featured Card (Full Width): ჩემი გარაჟი */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsMoreSheetOpen(false);
                onSelectTab('garage');
              }}
              className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 cursor-pointer active:scale-[0.99] transition-all mb-4 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#14213D] flex items-center justify-center shrink-0">
                <Car size={24} className="text-gold" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-navy">{isGe ? 'ჩემი გარაჟი' : 'My Garage'}</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{isGe ? 'მანქანები, ტექ-პასპორტი' : 'Vehicles, Registration'}</p>
              </div>
            </button>

            {/* 3. Section: პარამეტრები */}
            <div className="space-y-1.5 mb-2">
              <h5 className="text-sm font-black text-navy px-1">{isGe ? 'პარამეტრები' : 'Settings'}</h5>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsMoreSheetOpen(false);
                  onSelectTab('settings');
                }}
                className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-navy" />
                  <span className="text-sm font-bold text-navy">{isGe ? 'აპის პარამეტრები' : 'App Settings'}</span>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
