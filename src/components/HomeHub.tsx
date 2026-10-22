import React from 'react';
import { TabType } from './Navigation';
import { DtcCode, FineItem, ServiceItem, VehicleProfile } from '../types';
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
  Calendar
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  dtcCodes: DtcCode[];
  fines: FineItem[];
  services: ServiceItem[];
  onSelectDepartment: (tab: TabType) => void;
  onOpenBookingModal?: () => void;
}

export const HomeHub: React.FC<Props> = ({
  vehicle,
  dtcCodes,
  fines,
  services,
  onSelectDepartment,
  onOpenBookingModal
}) => {
  const pendingFines = fines.filter(f => f.status === 'pending');
  const totalFineDiscounted = pendingFines.reduce((acc, f) => acc + f.discounted_amount_gel, 0);
  const oilService = services.find(s => s.category === 'oil' || s.variant_key === 'engine_oil' || s.title_ge.toLowerCase().includes('ზეთ'));

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
      title: 'საპატრულო ჯარიმები & ვიდეოკამერები',
      subtitle: 'ვიდეოჯარიმების მონიტორინგი და 20%-იანი ფასდაკლების ვადა',
      icon: ShieldAlert,
      badgeText: `${pendingFines.length}`,
      badgeColor: 'bg-gold text-navy font-bold shadow-gold-soft',
      badgeSubtext: `${totalFineDiscounted} ₾ ვადაში`,
      tag: 'დარჩა 11 დღე'
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
      id: 'garage' as TabType,
      title: 'მეტი — გარაჟი, რუკა & ფასები',
      subtitle: 'ავტომობილის პროფილი, რადარები, პატრული, საწვავის ცოცხალი ფასები და შოურუმები',
      icon: Car,
      badgeText: 'მეტი',
      badgeColor: 'bg-emerald-500 text-white font-bold shadow-sm',
      badgeSubtext: `${vehicle.brand} ${vehicle.model}`,
      tag: 'მეტი'
    },
    {
      id: 'ai' as TabType,
      title: 'AI პერსონალური მექანიკოსი',
      subtitle: 'ქართულენოვანი კონსულტაცია, ნაწილების ფასები და ხარჯთაღრიცხვა',
      icon: Bot,
      badgeText: 'AI',
      badgeColor: 'bg-navy text-white',
      badgeSubtext: 'GPT-4o Engine',
      tag: 'ხედავს ბორტ-მონაცემებს'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Floating Window Header (Matching Image 2: macOS Window Dots & Search) */}
      <div className="neu-surface rounded-3xl p-5 shadow-neu-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-gold shadow-sm inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm inline-block"></span>
          </div>
          <div className="h-4 w-px bg-slate-300 mx-1"></div>
          <div className="flex items-center gap-2">
            <span className="font-black text-navy text-base tracking-tight">V1 AutoHub</span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">• ლოჯისტიკისა და ავტო-მართვის სივრცე</span>
          </div>
        </div>

        {/* Georgian License Plate Mockup & Quick Booking Action */}
        <div className="flex items-center gap-2">
          {onOpenBookingModal && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenBookingModal();
              }}
              className="px-3.5 py-2 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              title="ჩაწერა ავტო-ექიმთან ან სერვისში"
            >
              <Calendar size={13} />
              <span>📅 ჩაწერა / ჯავშანი</span>
            </button>
          )}

          <div className="px-4 py-2 rounded-2xl bg-white text-navy font-black font-mono shadow-sm border border-slate-200 flex items-center gap-3 tracking-widest text-sm">
            <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-200 text-[10px] font-bold text-blue-700">
              <span>🇬🇪</span>
              <span>GE</span>
            </div>
            <span>{vehicle.plate_number}</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>OBD-II LIVE</span>
          </div>
        </div>
      </div>

      {/* 2. ORBITING SERVICES CAROUSEL (დასაწყისში გამოტანილი სერვისების ორბიტალური მექანიზმი) */}
      <div className="neu-card rounded-3xl p-4 sm:p-6 shadow-neu-card relative overflow-hidden">
        <div className="flex items-center justify-between px-2 mb-2">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-wider block">
              ● სერვისების ორბიტალური მართვა
            </span>
            <h3 className="text-lg font-black text-navy">
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
        />
      </div>

      {/* 3. Stacked Neumorphic Department Cards (Strictly Matching Image 4) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-extrabold text-navy uppercase tracking-wider">
            ყველა განყოფილება (დააკლიკეთ გასახსნელად)
          </h3>
          <span className="text-xs font-mono text-slate-400">5 განყოფილება</span>
        </div>

        {mainDepartments.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.id}
              onClick={() => {
                sounds.playClick();
                onSelectDepartment(dept.id);
              }}
              className="neu-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-neu-flat transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-navy group-hover:text-gold transition-colors" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-navy group-hover:text-gold transition-colors">
                      {dept.title}
                    </h4>
                    <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {dept.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {dept.subtitle}
                  </p>
                </div>
              </div>

              {/* Neumorphic Right Pill Badge (Matching Image 4) */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-navy block font-mono">
                    {dept.badgeSubtext}
                  </span>
                </div>
                
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${dept.badgeColor} flex items-center justify-center font-black text-sm shadow-md`}>
                  {dept.badgeText}
                </div>

                <div className="w-8 h-8 rounded-full neu-circle flex items-center justify-center text-slate-400 group-hover:text-navy group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
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
