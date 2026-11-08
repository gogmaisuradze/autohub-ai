import React, { useState } from 'react';
import { TabType } from './Navigation';
import { DtcCode, FineItem, ServiceItem, VehicleProfile, ServiceBookingItem } from '../types';
import { PromptFieldType } from './Modals/ContextualFieldPromptModal';
import { ServicesOrbitCarousel } from './ui/services-orbit-carousel';
import { sounds } from '../services/soundEffects';
import {
  Activity,
  ShieldAlert,
  Bot,
  Wrench,
  Car,
  ArrowRight,
  Wifi,
  Sparkles,
  Thermometer,
  BellRing,
  ParkingSquare,
  Calendar,
  Navigation as NavigationIcon,
  AlertTriangle,
  GraduationCap,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  dtcCodes: DtcCode[];
  fines: FineItem[];
  services: ServiceItem[];
  onSelectDepartment: (tab: TabType) => void;
  onOpenBookingModal?: () => void;
  onOpenFieldPrompt?: (field: PromptFieldType) => void;
  onNavigateToAiClarification?: (initialPrompt?: string) => void;
  bookings?: ServiceBookingItem[];
  isTourActive?: boolean;
  orbitSpinTrigger?: number;
}

export const HomeHub: React.FC<Props> = ({
  vehicle,
  dtcCodes,
  fines,
  services,
  onSelectDepartment,
  onOpenBookingModal,
  onOpenFieldPrompt,
  onNavigateToAiClarification,
  bookings = [],
  isTourActive = false,
  orbitSpinTrigger
}) => {
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const [selectedOrbitTab, setSelectedOrbitTab] = useState<TabType>('obd');
  const pendingFines = fines.filter(f => f.status === 'pending');
  const totalFineDiscounted = pendingFines.reduce((acc, f) => acc + f.discounted_amount_gel, 0);
  const oilService = services.find(s => s.category === 'oil' || s.variant_key === 'engine_oil' || s.title_ge.toLowerCase().includes('ზეთ'));

  // Calculate missing vehicle fields for proactive prompt
  const missingFields: { field: PromptFieldType; label: string }[] = [];
  if (!vehicle.plate_number || vehicle.plate_number === 'GE-000-XX') {
    missingFields.push({ field: 'plate_number', label: 'სახ. ნომერი' });
  }
  if (!vehicle.mileage_km || vehicle.mileage_km === 0) {
    missingFields.push({ field: 'mileage_km', label: 'გარბენი' });
  }
  if (!vehicle.engine) {
    missingFields.push({ field: 'engine', label: 'ძრავა' });
  }
  if (!vehicle.vin || vehicle.vin.length < 10) {
    missingFields.push({ field: 'vin', label: 'VIN შასი' });
  }
  if (!vehicle.tech_passport) {
    missingFields.push({ field: 'tech_passport', label: 'ტექ-პასპორტი' });
  }

  // Dynamic Department Cards based on current active vehicle
  const mainDepartments = [
    {
      id: 'obd' as TabType,
      title: 'დიაგნოსტიკა',
      subtitle: `${vehicle.brand} ${vehicle.model} • DTC კოდები & ტელემეტრია`,
      icon: Activity,
      badgeText: dtcCodes.length > 0 ? `${dtcCodes.length}` : 'OK',
      badgeColor: dtcCodes.length > 0 ? 'bg-rose-500 text-white font-bold' : 'bg-emerald-500 text-white font-bold',
      badgeSubtext: dtcCodes.length > 0 ? `${dtcCodes.length} ხარვეზი` : 'სისტემა სუფთაა',
      tag: vehicle.engine || 'CAN 11/500 Live'
    },
    {
      id: 'fines' as TabType,
      title: 'ჯარიმები',
      subtitle: `ნომერი: ${vehicle.plate_number || 'GE-000-XX'} • ${vehicle.driver_license_points ?? 100} ქულა`,
      icon: ShieldAlert,
      badgeText: pendingFines.length > 0 ? `${pendingFines.length}` : 'OK',
      badgeColor: pendingFines.length > 0 ? 'bg-gold text-navy font-bold shadow-gold-soft' : 'bg-emerald-500 text-white font-bold shadow-sm',
      badgeSubtext: pendingFines.length > 0 ? `${totalFineDiscounted} ₾ ვადაში` : 'ჯარიმა არ არის',
      tag: pendingFines.length > 0 ? `${pendingFines.length} აქტიური` : '0 ჯარიმა'
    },
    {
      id: 'exam' as TabType,
      title: 'ბილეთები',
      subtitle: '2026 წლის ოფიციალური საგამოცდო ბილეთები',
      icon: GraduationCap,
      badgeText: '2026',
      badgeColor: 'bg-indigo-600 text-white font-black shadow-sm',
      badgeSubtext: vehicle.driver_name ? vehicle.driver_name.split(' ')[0] : 'თეორია',
      tag: 'A • B • C • D'
    },
    {
      id: 'parking' as TabType,
      title: 'პარკინგი',
      subtitle: `ზონალური ტაიმერი • ${vehicle.plate_number || 'GE-000-XX'} (15 წთ უფასო)`,
      icon: ParkingSquare,
      badgeText: 'P',
      badgeColor: 'bg-blue-600 text-white font-black shadow-sm',
      badgeSubtext: 'ზონები & ტაიმერი',
      tag: '15 წთ უფასო'
    },
    {
      id: 'service' as TabType,
      title: 'სერვისი',
      subtitle: `გარბენი: ${vehicle.mileage_km.toLocaleString()} კმ • ${oilService ? oilService.title_ge : 'ზეთის შეცვლა'}`,
      icon: Wrench,
      badgeText: oilService ? `${oilService.health_percentage}%` : '100%',
      badgeColor: 'bg-gold text-navy font-bold',
      badgeSubtext: oilService ? `დარჩა ${oilService.remaining_km} კმ` : 'სერვისი OK',
      tag: `${vehicle.brand} სპეციფიკაცია`
    },
    {
      id: 'map' as TabType,
      title: 'რუკა',
      subtitle: `რადარები, საპატრულო და ${vehicle.fuel_type === 'petrol' ? 'საწვავი' : 'დამტენები'}`,
      icon: NavigationIcon,
      badgeText: 'LIVE',
      badgeColor: 'bg-cyan-500 text-white font-black shadow-sm',
      badgeSubtext: 'Waze რეჟიმი',
      tag: 'საპატრულო რადარი'
    },
    {
      id: 'ai' as TabType,
      title: 'AI მექანიკოსი',
      subtitle: `ონლაინ კონსულტაცია: ${vehicle.brand} ${vehicle.model}`,
      icon: Bot,
      badgeText: 'AI',
      badgeColor: 'bg-navy text-white',
      badgeSubtext: `${vehicle.brand} ასისტენტი`,
      tag: 'ონლაინ 24/7'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Missing Data & AI Clarification Banner (If any core vehicle parameters are unfulfilled) */}
      {missingFields.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl neu-card border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-extrabold text-navy">
                  მონაცემები შესავსებია და დასაზუსტებელია ({missingFields.length} პარამეტრი)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  AI ასისტენტი
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                სრული რესურსის, სერვისების და ჯარიმების ზუსტი კონტროლისთვის შეავსეთ ან დააზუსტეთ AI ბოტთან
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {missingFields.slice(0, 3).map(mf => (
              <button
                key={mf.field}
                onClick={() => {
                  sounds.playClick();
                  onOpenFieldPrompt?.(mf.field);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-navy border border-slate-200 hover:border-gold hover:bg-slate-50 transition-all shadow-xs"
              >
                + {mf.label}
              </button>
            ))}

            <button
              onClick={() => {
                sounds.playClick();
                onNavigateToAiClarification?.(
                  `გამარჯობა AI მექანიკოსო, ჩემი მანქანის (${vehicle.brand} ${vehicle.model}) პროფილში აკლია: ${missingFields.map(m => m.label).join(', ')}. გთხოვთ დამეხმაროთ მონაცემების დაზუსტებასა და ქარხნული პარამეტრების შევსებაში.`
                );
              }}
              className="px-4 py-2 rounded-xl bg-navy text-gold text-xs font-black hover:bg-slate-800 transition-all shadow-xs flex items-center gap-1.5"
            >
              <Bot size={14} className="text-gold" />
              <span>🤖 AI დაზუსტება</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ORBITING SERVICES CAROUSEL (ორბიტის ფანჯარა ელეგანტური ბექგრაუნდით) */}
      <div data-tour="orbit-carousel" id="orbit-carousel-section" className="scroll-mt-32 rounded-3xl sm:rounded-[2.2rem] px-2 py-3.5 sm:p-6 bg-gradient-to-b from-[#F8FAFD] via-[#F2F5F9] to-[#EAEFF6] border border-white/90 shadow-[inset_4px_4px_14px_rgba(135,148,168,0.28),inset_-4px_-4px_14px_rgba(255,255,255,1)] relative overflow-hidden no-scrollbar flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-between px-2 sm:px-4 mb-2">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-gold uppercase tracking-wider block">
              ● სერვისების ორბიტალური მართვა
            </span>
            <h3 className="text-sm sm:text-lg font-black text-navy leading-tight">
              აირჩიეთ მიმართულება ორბიტაზე
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-400">
            {vehicle.brand} {vehicle.model}
          </span>
        </div>

        {/* Orbit Carousel with AutoHub Services */}
        <ServicesOrbitCarousel
          dtcCodes={dtcCodes}
          fines={fines}
          servicesList={services}
          onSelectDepartment={onSelectDepartment}
          vehicle={vehicle}
          isTourActive={isTourActive}
          triggerSpin={orbitSpinTrigger}
          activeTab={selectedOrbitTab}
          onActiveTabChange={(tab) => setSelectedOrbitTab(tab)}
        />
      </div>

      {/* 3. Collapsible Department Cards Section (ორბიტასთან სინქრონიზებული ველი) */}
      {(() => {
        const activeDept = mainDepartments.find(d => d.id === selectedOrbitTab) || mainDepartments[0];
        const ActiveDeptIcon = activeDept.icon;

        return (
          <div data-tour="department-cards" className="scroll-mt-32 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xs overflow-hidden transition-all">
            {/* Synchronized Department Bar */}
            <div className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/80 transition-colors select-none">
              <div
                onClick={() => {
                  sounds.playClick();
                  onSelectDepartment(activeDept.id);
                }}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                title="დააჭირეთ განყოფილების გასახსნელად"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                  activeDept.id === 'ai' ? 'bg-[#14213D] text-[#F59E0B] border border-[#F59E0B]/40' : 'bg-[#14213D] text-white'
                }`}>
                  <ActiveDeptIcon size={22} className="text-[#F59E0B]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md font-bold">
                      ორბიტაზე არჩეული
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-navy group-hover:text-amber-600 transition-colors">
                      {activeDept.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black ${activeDept.badgeColor}`}>
                      {activeDept.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate font-medium">
                    {activeDept.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Direct Open Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSelectDepartment(activeDept.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>გახსნა</span>
                  <ArrowRight size={13} />
                </button>

                {/* Accordion Toggle (All 7 Departments) */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsDepartmentsOpen(prev => !prev);
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  title={isDepartmentsOpen ? 'ყველა განყოფილების აკეცვა' : 'ყველა 7 განყოფილების ჩამოშლა'}
                >
                  <span className="hidden md:inline font-mono text-[11px]">
                    {isDepartmentsOpen ? 'აკეცვა' : 'ყველა (7)'}
                  </span>
                  <div className={`transition-transform duration-300 ${isDepartmentsOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
              </div>
            </div>

            {/* Collapsible Content Body with All 7 Department Cards */}
            {isDepartmentsOpen && (
              <div className="p-3 sm:p-4 pt-2 space-y-2.5 border-t border-slate-100 animate-fade-in bg-slate-50/50">
                <div className="text-[11px] font-mono text-slate-500 font-bold px-1 flex items-center justify-between">
                  <span>ყველა განყოფილება (დააკლიკეთ ორბიტაზე ასარჩევად ან გასახსნელად):</span>
                  <span>7 განყოფილება</span>
                </div>
                {mainDepartments.map((dept) => {
                  const Icon = dept.icon;
                  const isAi = dept.id === 'ai';
                  const isSelectedFromOrbit = dept.id === selectedOrbitTab;

                  return (
                    <div
                      key={dept.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedOrbitTab(dept.id);
                      }}
                      onDoubleClick={() => {
                        sounds.playClick();
                        onSelectDepartment(dept.id);
                      }}
                      className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer transition-all group active:scale-[0.99] relative overflow-hidden ${
                        isSelectedFromOrbit
                          ? 'bg-amber-50/90 border-2 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                          : 'bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs'
                      }`}
                    >
                      {isAi && <div className="ai-lightning-flash" />}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                          isSelectedFromOrbit
                            ? 'bg-[#14213D] text-[#F59E0B]'
                            : 'neu-circle text-navy group-hover:text-amber-600'
                        }`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-colors" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm sm:text-base font-bold transition-colors truncate ${
                              isSelectedFromOrbit ? 'text-navy font-black' : 'text-navy group-hover:text-amber-600'
                            }`}>
                              {dept.title}
                            </h4>
                            {isSelectedFromOrbit && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">
                                ორბიტაზე არჩეული
                              </span>
                            )}
                            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {dept.tag}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {dept.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right Actions & Badge */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold text-navy block font-mono">
                            {dept.badgeSubtext}
                          </span>
                        </div>
                        
                        <div className={`min-w-8 sm:min-w-10 h-8 sm:h-10 px-2.5 sm:px-3 rounded-full ${dept.badgeColor} flex items-center justify-center font-black text-xs sm:text-sm shadow-md shrink-0 whitespace-nowrap`}>
                          {dept.badgeText}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            onSelectDepartment(dept.id);
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center text-slate-400 transition-all shrink-0"
                          title="გადასვლა"
                        >
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
};
