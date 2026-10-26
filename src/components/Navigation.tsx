import React from 'react';
import { sounds } from '../services/soundEffects';
import {
  LayoutGrid,
  Activity,
  ShieldAlert,
  Wrench,
  ParkingSquare,
  MoreHorizontal,
  Navigation as NavigationIcon
} from 'lucide-react';

export type TabType = 'home' | 'obd' | 'fines' | 'parking' | 'ai' | 'service' | 'map' | 'garage' | 'settings';

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

  const tabs = [
    {
      id: 'home' as TabType,
      label: isGe ? 'მთავარი' : 'Dashboard',
      icon: LayoutGrid,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'obd' as TabType,
      label: isGe ? 'დიაგნოსტიკა' : 'Diagnostics',
      icon: Activity,
      badge: dtcCount > 0 ? `${dtcCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    {
      id: 'fines' as TabType,
      label: isGe ? 'ჯარიმები' : 'Traffic Fines',
      icon: ShieldAlert,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-gold text-white font-bold'
    },
    {
      id: 'parking' as TabType,
      label: isGe ? 'პარკინგი' : 'Parking',
      icon: ParkingSquare,
      badge: 'LIVE',
      badgeColor: 'bg-blue-600 text-white font-black'
    },
    {
      id: 'service' as TabType,
      label: isGe ? 'სერვისი' : 'Service Log',
      icon: Wrench,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'map' as TabType,
      label: isGe ? 'რუკა' : 'Live Map',
      icon: NavigationIcon,
      badge: 'LIVE',
      badgeColor: 'bg-cyan-500 text-white font-black'
    },
    {
      id: 'garage' as TabType,
      label: isGe ? 'მეტი' : 'More',
      icon: MoreHorizontal,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500 text-white font-bold'
    }
  ];

  // Mobile Bottom Dock Tabs
  const mobileDockTabs = [
    { id: 'home' as TabType, label: isGe ? 'მთავარი' : 'Dashboard', icon: LayoutGrid, badge: null },
    { id: 'obd' as TabType, label: 'OBD', icon: Activity, badge: dtcCount > 0 ? dtcCount : null },
    { id: 'fines' as TabType, label: isGe ? 'ჯარიმები' : 'Fines', icon: ShieldAlert, badge: finesCount > 0 ? finesCount : null },
    { id: 'parking' as TabType, label: isGe ? 'პარკინგი' : 'Parking', icon: ParkingSquare, badge: null },
    { id: 'map' as TabType, label: isGe ? 'რუკა' : 'Map', icon: NavigationIcon, badge: null },
    { id: 'service' as TabType, label: isGe ? 'სერვისი' : 'Service', icon: Wrench, badge: null },
    { id: 'garage' as TabType, label: isGe ? 'მეტი' : 'More', icon: MoreHorizontal, badge: null }
  ];

  return (
    <>
      {/* 1. TOP HORIZONTAL PILL NAV BAR (Always completely visible on screen, never hides) */}
      <nav data-tour="navigation-menu" className="w-full transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 py-2 sm:py-2.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectTab(tab.id);
                  }}
                  className={`relative px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-gold' : 'text-slate-500'
                    }`}
                  />
                  <span>{tab.label}</span>

                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${tab.badgeColor} shadow-xs`}
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

      {/* 2. MOBILE BOTTOM DOCK BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ECEAE5]/95 backdrop-blur-xl border-t border-white/90 px-2 py-1.5 shadow-[0_-6px_25px_rgba(20,33,61,0.12)] flex items-center justify-around transition-colors">
        {mobileDockTabs.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onSelectTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'bg-white text-navy shadow-xs border border-gold/40'
                  : 'text-slate-500 hover:text-navy'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 ${
                    isActive ? (item.isSpecial ? 'text-gold' : 'text-navy') : 'text-slate-400'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 min-w-3.5 rounded-full text-[9px] font-mono font-black bg-rose-500 text-white text-center shadow-xs">
                    {item.badge}
                  </span>
                )}
                {item.isSpecial && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-gold animate-ping"></span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-0.5 ${
                  isActive ? 'text-navy font-black' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
