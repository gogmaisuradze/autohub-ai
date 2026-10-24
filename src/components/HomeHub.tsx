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
  Calendar,
  Navigation as NavigationIcon
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
      id: 'garage' as TabType,
      title: 'მეტი — გარაჟი, მოწმობა & პარამეტრები',
      subtitle: 'მართვის მოწმობის კონსპექტი, OBD ადაპტერი და n8n ვებჰუკები',
      icon: Car,
      badgeText: `${vehicle.driver_license_points ?? 100} ქულა`,
      badgeColor: (vehicle.driver_license_points ?? 100) >= 70 ? 'bg-emerald-500 text-white font-bold shadow-sm' : 'bg-amber-500 text-white font-bold shadow-sm',
      badgeSubtext: `${vehicle.brand} ${vehicle.model}`,
      tag: 'მართვის მოწმობა'
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
      {/* 2. ORBITING SERVICES CAROUSEL (მთლიანად ჩაღრმავებული სექცია, თითქოს შიგნით ზის) */}
      <div className="rounded-3xl sm:rounded-[2.2rem] p-4 sm:p-6 bg-[#F6F8FB] border border-white/80 shadow-[inset_6px_6px_16px_rgba(135,148,168,0.36),inset_-6px_-6px_16px_rgba(255,255,255,1)] relative overflow-hidden no-scrollbar flex flex-col items-center justify-center">
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
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-circle flex items-center justify-center shrink-0">
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
                
                <div className={`min-w-8 sm:min-w-10 h-8 sm:h-10 px-2.5 sm:px-3 rounded-full ${dept.badgeColor} flex items-center justify-center font-black text-xs sm:text-sm shadow-md shrink-0 whitespace-nowrap`}>
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
