import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { sounds } from '../services/soundEffects';
import {
  LayoutGrid,
  Activity,
  ShieldAlert,
  Wrench,
  ParkingSquare,
  Navigation as NavigationIcon,
  ChevronDown,
  GraduationCap
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

  const [isPatrolOpen, setIsPatrolOpen] = useState(false);
  const patrolBtnRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const isPatrolActive = activeTab === 'fines' || activeTab === 'exam';

  const updatePosition = useCallback(() => {
    if (!patrolBtnRef.current) return;
    const rect = patrolBtnRef.current.getBoundingClientRect();
    const menuWidth = 250;
    let left = rect.left + rect.width / 2 - menuWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - menuWidth - 12));
    setDropdownPos({
      top: rect.bottom + 6,
      left
    });
  }, []);

  useEffect(() => {
    if (isPatrolOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isPatrolOpen, updatePosition]);

  useEffect(() => {
    if (!isPatrolOpen) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (patrolBtnRef.current && patrolBtnRef.current.contains(target)) {
        return;
      }
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      setIsPatrolOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPatrolOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPatrolOpen]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    updatePosition();
    setIsPatrolOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsPatrolOpen(false);
    }, 220);
  };

  const handlePatrolButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playClick();
    onSelectTab('fines');
    setIsPatrolOpen(false);
  };

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
      badgeColor: 'bg-rose-500 text-white font-black'
    },
    {
      id: 'patrol_dropdown' as const,
      label: isGe ? 'საპატრულო' : 'Patrol',
      icon: ShieldAlert,
      badge: finesCount > 0 ? `${finesCount}` : null,
      badgeColor: 'bg-[#FC8181] text-white font-black'
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

  return (
    <nav
      data-tour="navigation-menu"
      className="w-full max-w-full relative z-30 transition-colors border-t border-white/60 bg-[#ECEAE5]/90"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-start md:justify-center gap-1.5 sm:gap-2.5 md:gap-4 lg:gap-5 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth w-full">
          {tabs.map((tab) => {
            if (tab.id === 'patrol_dropdown') {
              const Icon = tab.icon;
              return (
                <div
                  key="patrol-nav-item"
                  ref={patrolBtnRef}
                  className="relative shrink-0"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={handlePatrolButtonClick}
                    className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 active:scale-95 ${
                      isPatrolActive
                        ? 'bg-white text-navy shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-navy hover:bg-white/40'
                    }`}
                    aria-expanded={isPatrolOpen}
                    aria-haspopup="true"
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors shrink-0 ${
                        isPatrolActive ? 'text-gold' : 'text-slate-500'
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

                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        sounds.playClick();
                        if (!isPatrolOpen) {
                          updatePosition();
                          setIsPatrolOpen(true);
                        } else {
                          setIsPatrolOpen(false);
                        }
                      }}
                      className="p-0.5 -mr-0.5 rounded hover:bg-slate-200/50 transition-colors"
                      title="საპატრულო მენიუ"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                          isPatrolOpen ? 'rotate-180 text-gold' : 'text-slate-400'
                        }`}
                      />
                    </span>
                  </button>

                  {/* Dropdown Portal */}
                  {isPatrolOpen && dropdownPos && createPortal(
                    <div
                      ref={dropdownRef}
                      style={{
                        top: `${dropdownPos.top}px`,
                        left: `${dropdownPos.left}px`
                      }}
                      className="fixed z-[9999] w-[250px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_16px_36px_rgba(20,33,61,0.18)] p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* 1. ჯარიმები */}
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onSelectTab('fines');
                          setIsPatrolOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                          activeTab === 'fines'
                            ? 'bg-amber-500/15 text-navy font-black border border-amber-300/80 shadow-2xs'
                            : 'hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            activeTab === 'fines' ? 'bg-amber-500 text-white' : 'bg-rose-100 text-rose-600'
                          }`}>
                            <ShieldAlert size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-navy truncate">
                              {isGe ? 'ჯარიმები' : 'Traffic Fines'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {isGe ? 'ვიდეოჯარიმები & -20%' : 'Police fines & -20%'}
                            </div>
                          </div>
                        </div>

                        {finesCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-[#FC8181] text-white shrink-0 ml-1">
                            {finesCount}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-emerald-600 shrink-0 ml-1">
                            ✓ OK
                          </span>
                        )}
                      </button>

                      {/* 2. ბილეთები */}
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onSelectTab('exam');
                          setIsPatrolOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                          activeTab === 'exam'
                            ? 'bg-amber-500/15 text-navy font-black border border-amber-300/80 shadow-2xs'
                            : 'hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            activeTab === 'exam' ? 'bg-amber-500 text-white' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <GraduationCap size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-navy truncate">
                              {isGe ? 'ბილეთები' : 'Exam Tickets'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {isGe ? 'მართვის მოწმობა 2026' : 'Driver license theory'}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              );
            }

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
  );
};
