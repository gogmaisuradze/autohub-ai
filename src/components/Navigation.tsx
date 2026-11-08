import React from 'react';
import { sounds } from '../services/soundEffects';
import {
  LayoutGrid,
  Activity,
  ShieldAlert,
  Navigation as NavigationIcon,
  Car
} from 'lucide-react';

export type TabType =
  | 'home'
  | 'garage'
  | 'obd'
  | 'map'
  | 'police'
  | 'fines'
  | 'parking'
  | 'ai'
  | 'service'
  | 'settings'
  | 'exam';

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

  const isGarageActive = activeTab === 'garage' || activeTab === 'service' || activeTab === 'settings';
  const isMapActive = activeTab === 'map' || activeTab === 'parking';
  const isPoliceActive = activeTab === 'police' || activeTab === 'fines' || activeTab === 'exam';

  const desktopTabs = [
    {
      id: 'home' as TabType,
      label: isGe ? 'მთავარი' : 'Dashboard',
      icon: LayoutGrid,
      isActive: activeTab === 'home',
      badge: null as string | null,
      badgeColor: ''
    },
    {
      id: 'garage' as TabType,
      label: isGe ? 'გარაჟი & სერვისი' : 'Garage & Service',
      icon: Car,
      isActive: isGarageActive,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'obd' as TabType,
      label: isGe ? 'დიაგნოსტიკა' : 'Diagnostics',
      icon: Activity,
      isActive: activeTab === 'obd',
      badge: dtcCount > 0 ? `${dtcCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-black'
    },
    {
      id: 'map' as TabType,
      label: isGe ? 'რუკა & პარკინგი' : 'Map & Parking',
      icon: NavigationIcon,
      isActive: isMapActive,
      badge: 'LIVE',
      badgeColor: 'bg-[#06B6D4] text-white font-black'
    },
    {
      id: 'police' as TabType,
      label: isGe ? 'პოლიცია' : 'Police',
      icon: ShieldAlert,
      isActive: isPoliceActive,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-[#FC8181] text-white font-black'
    }
  ];

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
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectTab(tab.id);
                  }}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 active:scale-95 ${
                    tab.isActive
                      ? 'bg-white text-navy shadow-xs border border-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-navy hover:bg-white/40'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      tab.isActive ? 'text-gold' : 'text-slate-500'
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
      {/*    5 Main buttons: Home | Garage | OBD Scan (Center) | Map | Police */}
      {/* ----------------------------------------------------------- */}
      <nav
        data-tour="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ECEAE5] border-t border-slate-300 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-1.5 px-2 select-none"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto text-center">

          {/* 1. მთავარი (Home) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectTab('home');
            }}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'home' ? 'text-navy font-black' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {activeTab === 'home' && (
              <span className="absolute -top-1 w-7 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-8 h-8">
              <LayoutGrid
                className={`w-6 h-6 transition-transform duration-150 ${
                  activeTab === 'home' ? 'text-gold scale-110' : 'text-slate-500'
                }`}
              />
            </div>
            <span
              className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                activeTab === 'home' ? 'font-black text-navy' : 'font-medium text-slate-500'
              }`}
            >
              {isGe ? 'მთავარი' : 'Home'}
            </span>
          </button>

          {/* 2. გარაჟი (Garage & Service Log) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectTab('garage');
            }}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              isGarageActive ? 'text-navy font-black' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {isGarageActive && (
              <span className="absolute -top-1 w-7 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-8 h-8">
              <Car
                className={`w-6 h-6 transition-transform duration-150 ${
                  isGarageActive ? 'text-gold scale-110' : 'text-slate-500'
                }`}
              />
            </div>
            <span
              className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                isGarageActive ? 'font-black text-navy' : 'font-medium text-slate-500'
              }`}
            >
              {isGe ? 'გარაჟი' : 'Garage'}
            </span>
          </button>

          {/* 3. ობდ სკანი (OBD Scan - ცენტრში, ამაღლებული მრგვალი ღილაკი) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectTab('obd');
            }}
            className="relative -mt-6 flex flex-col items-center justify-center group focus:outline-none"
            aria-label="OBD სკანი"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-[#ECEAE5] transition-all duration-150 active:scale-95 ${
                activeTab === 'obd'
                  ? 'bg-[#14213D] text-[#F59E0B] ring-2 ring-[#D97706]/40 scale-105'
                  : 'bg-[#14213D] text-white hover:text-[#F59E0B]'
              }`}
            >
              <Activity className="w-6 h-6 stroke-[2.4]" />
            </div>
            <span
              className={`text-[10px] font-black tracking-tight mt-0.5 whitespace-nowrap ${
                activeTab === 'obd' ? 'text-[#14213D]' : 'text-slate-600'
              }`}
            >
              {isGe ? 'ობდ სკანი' : 'OBD Scan'}
            </span>
            {dtcCount > 0 && (
              <span className="absolute -top-1 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-rose-500 text-white animate-pulse shadow-xs">
                {dtcCount}
              </span>
            )}
          </button>

          {/* 4. რუკა (Map & Parking) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectTab('map');
            }}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              isMapActive ? 'text-navy font-black' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {isMapActive && (
              <span className="absolute -top-1 w-7 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-8 h-8">
              <NavigationIcon
                className={`w-6 h-6 transition-transform duration-150 ${
                  isMapActive ? 'text-gold scale-110' : 'text-slate-500'
                }`}
              />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-mono font-black bg-cyan-500 text-white shadow-xs">
                LIVE
              </span>
            </div>
            <span
              className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                isMapActive ? 'font-black text-navy' : 'font-medium text-slate-500'
              }`}
            >
              {isGe ? 'რუკა' : 'Map'}
            </span>
          </button>

          {/* 5. პოლისი (Police: Fines & Exam Tickets) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onSelectTab('police');
            }}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              isPoliceActive ? 'text-navy font-black' : 'text-slate-500 hover:text-navy'
            }`}
          >
            {isPoliceActive && (
              <span className="absolute -top-1 w-7 h-1 rounded-full bg-gold shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            )}
            <div className="relative flex items-center justify-center w-8 h-8">
              <ShieldAlert
                className={`w-6 h-6 transition-transform duration-150 ${
                  isPoliceActive ? 'text-gold scale-110' : 'text-slate-500'
                }`}
              />
              {finesCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-rose-500 text-white shadow-xs">
                  {finesCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                isPoliceActive ? 'font-black text-navy' : 'font-medium text-slate-500'
              }`}
            >
              {isGe ? 'პოლისი' : 'Police'}
            </span>
          </button>

        </div>
      </nav>
    </>
  );
};
