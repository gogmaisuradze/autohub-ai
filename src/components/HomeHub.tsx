import React from 'react';
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
  AlertTriangle
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
  bookings = []
}) => {
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

  // Horizontal Neumorphic Cards Stack (Matching Image 4)
  const mainDepartments = [
    {
      id: 'obd' as TabType,
      title: 'ტესტირება & OBD-II დიაგნოსტიკა',
      subtitle: 'DTC შეცდომების კოდები, ცოცხალი ტელემეტრია და ჩეკის ჩაქრობა',
      icon: Activity,
      badgeText: dtcCodes.length > 0 ? `${dtcCodes.length}` : 'OK',
      badgeColor: dtcCodes.length > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white',
      badgeSubtext: dtcCodes.length > 0 ? '3 ხარვეზი' : 'სუფთაა',
      tag: 'CAN 11/500 Live'
    },
    {
      id: 'fines' as TabType,
      title: 'საპატრულო ჯარიმები, მოწმობა & ბილეთები',
      subtitle: 'ვიდეოჯარიმები, 100-ქულიანი მართვის მოწმობა & საგამოცდო ბილეთები 2026',
      icon: ShieldAlert,
      badgeText: pendingFines.length > 0 ? `${pendingFines.length}` : 'OK',
      badgeColor: pendingFines.length > 0 ? 'bg-gold text-navy font-bold shadow-gold-soft' : 'bg-emerald-500 text-white font-bold shadow-sm',
      badgeSubtext: pendingFines.length > 0 ? `${totalFineDiscounted} ₾ ვადაში` : 'სისტემა სუფთაა',
      tag: pendingFines.length > 0 ? 'აქტიური ჯარიმა' : '0 ჯარიმა'
    },
    {
      id: 'parking' as TabType,
      title: 'საპარკინგე სერვისები (საქართველო)',
      subtitle: 'ზონალური პარკირების წამზომი (A/B/C), მუნიციპალური ჯარიმები & აბონემენტები',
      icon: ParkingSquare,
      badgeText: 'P',
      badgeColor: 'bg-blue-600 text-white font-black shadow-sm',
      badgeSubtext: 'ზონები & ტაიმერი',
      tag: '15 წთ უფასო'
    },
    {
      id: 'service' as TabType,
      title: 'მანქანის სერვის-ჟურნალი & რესურსი',
      subtitle: 'ძრავის ზეთი, სამუხრუჭე ხუნდები, ფილტრები და ტექ-დათვალიერება',
      icon: Wrench,
      badgeText: oilService ? `${oilService.health_percentage}%` : 'OK',
      badgeColor: 'bg-gold text-navy font-bold',
      badgeSubtext: oilService ? `დარჩა ${oilService.remaining_km} კმ` : 'სერვისი',
      tag: 'რესურსის კონტროლი'
    },
    {
      id: 'map' as TabType,
      title: 'Waze ცოცხალი საგზაო რუკა & რადარები',
      subtitle: 'საპატრულო ეკიპაჟები, სიჩქარის რადარები, საწვავის ფასები & ავტოსალონები',
      icon: NavigationIcon,
      badgeText: 'LIVE',
      badgeColor: 'bg-cyan-500 text-white font-black shadow-sm',
      badgeSubtext: 'Waze რეჟიმი',
      tag: 'საპატრულო რადარი'
    },
    {
      id: 'ai' as TabType,
      title: 'AI პერსონალური მექანიკოსი',
      subtitle: 'ქართულენოვანი კონსულტაცია, ნაწილების ფასები და ხარჯთაღრიცხვა',
      icon: Bot,
      badgeText: 'AI',
      badgeColor: 'bg-navy text-white',
      badgeSubtext: 'AI ონლაინ',
      tag: 'ხედავს ბორტ-მონაცემებს'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
      <div data-tour="orbit-carousel" className="rounded-3xl sm:rounded-[2.2rem] p-4 sm:p-6 bg-gradient-to-b from-[#F8FAFD] via-[#F2F5F9] to-[#EAEFF6] border border-white/90 shadow-[inset_4px_4px_14px_rgba(135,148,168,0.28),inset_-4px_-4px_14px_rgba(255,255,255,1)] relative overflow-hidden no-scrollbar flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-between px-2 sm:px-4 mb-2">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-wider block">
              ● სერვისების ორბიტალური მართვა
            </span>
            <h3 className="text-base sm:text-lg font-black text-navy">
              აირჩიეთ მიმართულება ორბიტაზე
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
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
        />
      </div>

      {/* 3. Stacked Neumorphic Department Cards (Strictly Matching Image 4) */}
      <div data-tour="department-cards" className="space-y-3.5">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-extrabold text-navy uppercase tracking-wider">
            ყველა განყოფილება (დააკლიკეთ გასახსნელად)
          </h3>
          <span className="text-xs font-mono text-slate-400">5 განყოფილება</span>
        </div>

        {mainDepartments.map((dept) => {
          const Icon = dept.icon;
          const isAi = dept.id === 'ai';
          return (
            <div
              key={dept.id}
              onClick={() => {
                sounds.playClick();
                onSelectDepartment(dept.id);
              }}
              className={`neu-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-neu-flat transition-all group active:scale-[0.99] relative overflow-hidden ${
                isAi
                  ? 'border border-gold/40 shadow-sm hover:border-gold/70'
                  : ''
              }`}
            >
              {isAi && <div className="ai-lightning-flash" />}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-circle flex items-center justify-center shrink-0 ${
                  isAi ? 'border border-gold/60' : ''
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-navy group-hover:text-gold transition-colors" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-navy group-hover:text-gold transition-colors truncate">
                      {dept.title}
                    </h4>
                    <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {dept.tag}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {dept.subtitle}
                  </p>
                </div>
              </div>

              {/* Neumorphic Right Pill Badge (Matching Image 4) */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-navy block font-mono">
                    {dept.badgeSubtext}
                  </span>
                </div>
                
                <div className={`min-w-8 sm:min-w-10 h-8 sm:h-10 px-2.5 sm:px-3 rounded-full ${dept.badgeColor} flex items-center justify-center font-black text-xs sm:text-sm shadow-md shrink-0 whitespace-nowrap ${
                  isAi ? 'border-2 border-gold shadow-[0_0_12px_rgba(252,163,17,0.7)]' : ''
                }`}>
                  {dept.badgeText}
                </div>

                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neu-circle flex items-center justify-center text-slate-400 group-hover:text-navy group-hover:translate-x-1 transition-all shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Mini Telemetry Widgets in Neumorphic Cards (Matching Image 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ძრავის RPM</span>
            <Activity className="w-4 h-4 text-gold" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-navy">785</span>
            <span className="text-xs text-slate-400 font-mono ml-1">rpm</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">● სტაბილური ბრუნი</div>
        </div>

        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ანტიფრიზი</span>
            <Thermometer className="w-4 h-4 text-gold" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-navy">92°C</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">● სამუშაო ნორმა</div>
        </div>

        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ბორტ-ძაბვა</span>
            <Wifi className="w-4 h-4 text-gold" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-navy">14.2 V</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">გენერატორი მუხტავს</div>
        </div>

        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ჯარიმები</span>
            <BellRing className="w-4 h-4 text-gold" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-gold">40 ₾</span>
            <span className="text-xs line-through text-slate-400 ml-1">50 ₾</span>
          </div>
          <div className="text-[11px] text-gold font-bold">● -20% ვადაში</div>
        </div>
      </div>

    </div>
  );
};
