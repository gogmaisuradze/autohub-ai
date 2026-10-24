import React, { useState } from 'react';
import { VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import { GeorgianLicensePlate } from '../ui/GeorgianLicensePlate';
import LiveTrafficMap from '../Map/LiveTrafficMap';
import DrivingExamWidget from './DrivingExamWidget';
import {
  Car,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Zap,
  Gauge,
  Calendar,
  Fuel,
  Shield,
  Wifi,
  Sparkles,
  ArrowRight,
  Trash2,
  Navigation,
  Building2,
  MapPin,
  Layers,
  Volume2,
  VolumeX,
  Award,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Check,
  FileText,
  GraduationCap,
  HelpCircle
} from 'lucide-react';

export const DRIVER_LICENSE_NOTEBOOK_URL = 'https://notebook.google.com/notebook/8435d2c1-fa29-44d0-8d3f-da422e03b3f0/artifact/528eecb6-fcf3-484c-9615-670ae0a800b7';

interface Props {
  vehicle: VehicleProfile;
  onUpdateVehicle: (updated: VehicleProfile) => void;
  onOpenAddModal: () => void;
  onDeleteVehicle?: (id: string) => void;
  onOpenFieldPrompt: (field: 'plate_number' | 'mileage_km' | 'engine' | 'vin') => void;
  allVehicles: VehicleProfile[];
  onSelectVehicle: (v: VehicleProfile) => void;
  initialSubTab?: 'profile' | 'map' | 'license';
  isSoundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const GarageModule: React.FC<Props> = ({
  vehicle,
  onUpdateVehicle,
  onOpenAddModal,
  onDeleteVehicle,
  onOpenFieldPrompt,
  allVehicles,
  onSelectVehicle,
  initialSubTab = 'profile',
  isSoundEnabled = true,
  onToggleSound
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'map' | 'license'>(initialSubTab);

  const driverFullName = vehicle.driver_name || 'გიორგი მაისურაძე';
  const nameParts = driverFullName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'გიორგი';
  const lastName = nameParts.slice(1).join(' ') || '';
  const personalNo = vehicle.driver_personal_number || '01024085521';
  const currentPoints = vehicle.driver_license_points ?? 100;
  const deductedPoints = Math.max(0, 100 - currentPoints);

  // Driver license portrait photo state (localStorage persisted)
  const [driverPhoto, setDriverPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem('autohub_driver_photo') || null;
    } catch {
      return null;
    }
  });

  const handleDriverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setDriverPhoto(base64);
      try {
        localStorage.setItem('autohub_driver_photo', base64);
      } catch {}
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  // Calculate completeness score
  const checkFields = [
    { key: 'plate_number', label: 'სახელმწიფო ნომერი', filled: Boolean(vehicle.plate_number && vehicle.plate_number !== 'GE-000-XX'), weight: 25, prompt: 'plate_number' as const },
    { key: 'engine', label: 'ძრავის სპეციფიკაცია', filled: Boolean(vehicle.engine), weight: 25, prompt: 'engine' as const },
    { key: 'mileage_km', label: 'მიმდინარე გარბენი', filled: Boolean(vehicle.mileage_km > 0), weight: 25, prompt: 'mileage_km' as const },
    { key: 'vin', label: 'VIN კოდი', filled: Boolean(vehicle.vin && vehicle.vin.length >= 10), weight: 25, prompt: 'vin' as const }
  ];

  const completeness = checkFields.reduce((acc, f) => acc + (f.filled ? f.weight : 0), 0);
  const missingFields = checkFields.filter(f => !f.filled);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header Bar with Sub-Tab Navigation */}
      <div className="p-5 rounded-3xl neu-card shadow-neu-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm">
            <Car className="w-6 h-6 text-navy" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-navy tracking-tight">
                მეტი — გარაჟი, მართვის მოწმობა & Waze რუკა
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-gold/15 text-gold border border-gold/30">
                {allVehicles.length} ავტომობილი
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ავტომობილის პროფილი, მართვის მოწმობის კონსპექტი, Waze ცოცხალი რუკა და ბენზინის ფასები
            </p>
          </div>
        </div>

        {/* Subtab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 border border-white">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('profile');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'profile'
                ? 'bg-navy text-gold shadow-sm'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Car size={15} />
            <span>ჩემი გარაჟი</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('license');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'license'
                ? 'bg-navy text-gold shadow-sm'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Award size={15} className="text-gold" />
            <span>მართვის მოწმობა</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gold text-navy">
              {currentPoints} ქულა
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('map');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'map'
                ? 'bg-navy text-gold shadow-sm'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <Navigation size={15} />
            <span>Waze რუკა & ფასები</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* External Google Notebook Driver's License Button (Tactile Stitch + Radiant Shimmer) */}
          <a
            href={DRIVER_LICENSE_NOTEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="btn-stitch-primary px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group shadow-gold-soft cursor-pointer"
            title="მართვის მოწმობის & თეორიის კონსპექტი Google Notebook-ში"
          >
            <Award size={15} className="text-navy group-hover:rotate-12 transition-transform shrink-0" />
            <span className="text-navy font-black tracking-tight whitespace-nowrap">მართვის მოწმობა ↗</span>
            <ExternalLink size={12} className="text-navy/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>

          {/* Sound Toggle Button */}
          {onToggleSound && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleSound();
              }}
              className="px-3.5 py-2.5 rounded-2xl neu-btn text-navy font-bold text-xs flex items-center gap-2 transition-all hover:text-gold"
              title={isSoundEnabled ? 'ხმის გათიშვა' : 'ხმის ჩართვა'}
            >
              {isSoundEnabled ? (
                <Volume2 size={16} className="text-gold" />
              ) : (
                <VolumeX size={16} className="text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {isSoundEnabled ? 'ხმა: ON' : 'ხმა: OFF'}
              </span>
            </button>
          )}

          {/* Add New Vehicle Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAddModal();
            }}
            className="px-4 py-2.5 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} />
            <span>+ მანქანის დამატება</span>
          </button>
        </div>
      </div>

      {/* 2. TAB: LIVE TRAFFIC MAP (Waze, Radars, Patrol, Fuel, Showrooms) */}
      {activeSubTab === 'map' && (
        <div className="animate-fade-in">
          <LiveTrafficMap vehicle={vehicle} />
        </div>
      )}

      {/* 3. TAB: DRIVER'S LICENSE & THEORY EXAM (Google Notebook Artifact) */}
      {activeSubTab === 'license' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Prominent Google Notebook CTA Banner */}
          <div className="p-6 rounded-3xl neu-card shadow-neu-card border border-white relative overflow-hidden bg-gradient-to-br from-amber-50/60 via-white to-blue-50/40">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-gold text-navy shadow-gold-soft">
                    Google Notebook ინტეგრაცია
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    საგამოცდო კონსპექტი 2026
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
                  მართვის მოწმობის თეორიული კონსპექტი & საგზაო წესები
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  თქვენი პირადი სასწავლო არტეფაქტი Google Notebook-ში: საგზაო ნიშნების სრული განმარტებები,
                  გზაჯვარედინების გადაკვეთის პრიორიტეტები, ბილეთების გარჩევა და 100-ქულიანი სისტემის წესები.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <a
                  href={DRIVER_LICENSE_NOTEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sounds.playClick()}
                  className="btn-stitch-primary px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-gold-soft group transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Award size={18} className="text-navy group-hover:rotate-12 transition-transform" />
                  <span className="text-navy font-black">კონსპექტის გახსნა Google Notebook-ში</span>
                  <ExternalLink size={15} className="text-navy group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Subtle watermark background */}
            <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none select-none">
              <GraduationCap size={220} className="text-navy" />
            </div>
          </div>

          {/* Authentic Georgian Digital Driver's License Card */}
          <div className="p-6 sm:p-7 rounded-3xl neu-card shadow-neu-card border border-white relative overflow-hidden bg-gradient-to-br from-rose-50/40 via-sky-50/30 to-amber-50/50">
            {/* Top License Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-7 rounded-md bg-white border border-slate-300 shadow-sm flex items-center justify-center font-black text-xs text-rose-600 font-mono">
                  🇬🇪 GE
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy uppercase tracking-wider">
                    საქართველო • GEORGIA
                  </h4>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest block">
                    მართვის მოწმობა / DRIVING LICENCE
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300/60 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>მოქმედი • ACTIVE</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-gold text-navy font-mono font-black text-xs shadow-gold-soft">
                  {currentPoints} / 100 ქულა
                </div>
              </div>
            </div>

            {/* License Content Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Photo & Categories Column */}
              <div className="md:col-span-4 flex flex-col items-center text-center p-4 rounded-2xl bg-white/70 border border-white shadow-sm">
                {/* Driver Photo Upload Frame */}
                <label className="cursor-pointer group relative block" title="დააჭირეთ მძღოლის ფოტოს ასატვირთად">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDriverPhotoUpload}
                  />
                  <div className="w-28 h-36 rounded-xl neu-surface border-2 border-slate-300/80 group-hover:border-gold flex flex-col items-center justify-center relative overflow-hidden mb-2 shadow-inner transition-colors">
                    {driverPhoto ? (
                      <img
                        src={driverPhoto}
                        alt="Driver Portrait"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-slate-300/80 flex items-center justify-center text-slate-500 mb-1 group-hover:scale-105 transition-transform">
                          <Award size={32} className="text-gold" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-gold transition-colors">
                          + ფოტო
                        </span>
                      </>
                    )}
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gold/30 border border-gold/60 flex items-center justify-center">
                      <Sparkles size={9} className="text-amber-700" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gold group-hover:underline block text-center mb-1">
                    {driverPhoto ? 'ფოტოს შეცვლა 📷' : 'ფოტოს ატვირთვა 📷'}
                  </span>
                </label>

                <span className="text-[11px] font-mono font-bold text-slate-400">
                  მოწმობის №: <strong className="text-navy">AA 849201</strong>
                </span>

                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-navy text-gold text-xs font-black font-mono">
                    CAT. B
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold font-mono">
                    B1
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold font-mono">
                    AM
                  </span>
                </div>
              </div>

              {/* Data Fields Columns */}
              <div className="md:col-span-8 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl neu-surface border border-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1. გვარი / Surname</span>
                    <span className="text-sm font-black text-navy font-mono">{lastName || firstName}</span>
                  </div>

                  <div className="p-3 rounded-xl neu-surface border border-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">2. სახელი / Name</span>
                    <span className="text-sm font-black text-navy font-mono">{firstName}</span>
                  </div>

                  <div className="p-3 rounded-xl neu-surface border border-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">3. დაბადების თარიღი & ადგილი</span>
                    <span className="text-xs font-bold text-navy font-mono">15.08.1994 • GEORGIA</span>
                  </div>

                  <div className="p-3 rounded-xl neu-surface border border-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">7. პირადი ნომერი / Personal No</span>
                    <span className="text-xs font-black text-navy font-mono">{personalNo}</span>
                  </div>

                  <div className="p-3 rounded-xl neu-surface border border-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">4a. გაცემის თარიღი / Issue Date</span>
                    <span className="text-xs font-bold text-navy font-mono">12.05.2022</span>
                  </div>

                  <div className="p-3 rounded-xl neu-surface border border-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">4b. მოქმედების ვადა / Valid Until</span>
                    <span className="text-xs font-black text-emerald-700 font-mono">12.05.2032 (10 წელი)</span>
                  </div>
                </div>

                {/* Authority & Points Footer */}
                <div className="p-3.5 rounded-xl bg-white/80 border border-white flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">4c. გამცემი ორგანო / Authority</span>
                    <span className="font-bold text-navy">შსს მომსახურების სააგენტო (MIA SERVICE AGENCY)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">100-ქულიანი ბალანსი</span>
                    <span className="font-black text-gold font-mono">{currentPoints}/100 {deductedPoints > 0 ? `(დაკლებული: -${deductedPoints})` : '(სუფთაა)'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Driving Theory Modules Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-extrabold text-navy uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-gold" />
                <span>საგამოცდო თეორიული მოდულები</span>
              </h4>
              <a
                href={DRIVER_LICENSE_NOTEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-navy hover:text-gold flex items-center gap-1 transition-colors"
              >
                <span>სრული კონსპექტი ↗</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-3xl neu-surface border border-white hover:border-gold/60 transition-all">
                <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-navy mb-2.5">
                  <AlertCircle size={20} className="text-gold" />
                </div>
                <h5 className="font-black text-xs text-navy">1. საგზაო ნიშნები</h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  მაფრთხილებელი, პრიორიტეტის, ამკრძალავი, მიმთითებელი და საინფორმაციო ნიშნები.
                </p>
              </div>

              <div className="p-4 rounded-3xl neu-surface border border-white hover:border-gold/60 transition-all">
                <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-navy mb-2.5">
                  <Navigation size={20} className="text-gold" />
                </div>
                <h5 className="font-black text-xs text-navy">2. გზაჯვარედინები</h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  მარჯვენა ხელის წესი, მთავარი გზის მიმართულება, შუქნიშნები და რეგულირება.
                </p>
              </div>

              <div className="p-4 rounded-3xl neu-surface border border-white hover:border-gold/60 transition-all">
                <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-navy mb-2.5">
                  <Gauge size={20} className="text-gold" />
                </div>
                <h5 className="font-black text-xs text-navy">3. სიჩქარე & მანძილი</h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  ქალაქში 50 კმ/სთ, დასახლების გარეთ 90 კმ/სთ, ავტომაგისტრალზე 110 კმ/სთ.
                </p>
              </div>

              <div className="p-4 rounded-3xl neu-surface border border-white hover:border-gold/60 transition-all">
                <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-navy mb-2.5">
                  <ShieldCheck size={20} className="text-gold" />
                </div>
                <h5 className="font-black text-xs text-navy">4. 100-ქულიანი სისტემა</h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  ქულათა ჩამოკლების წესები, აღდგენა 1 იანვარს, მართვის უფლების შეჩერების ზღვრები.
                </p>
              </div>
            </div>
          </div>

          {/* Full Interactive Driving Exam & 32 Topics Study Platform */}
          <DrivingExamWidget />

        </div>
      )}

      {/* 4. TAB: VEHICLE PROFILE & GARAGE */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">

          {/* Quick Teaser for Driver's License & Theory Exam */}
          <div className="p-4 rounded-3xl neu-card shadow-neu-card border border-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm">
                <Award className="w-5 h-5 text-navy" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-navy">
                    მართვის მოწმობა & თეორიული კონსპექტი
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {currentPoints} / 100 ქულა
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    B კატეგორია
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  საგზაო ნიშნები, მოძრაობის წესები, ბილეთები და Google Notebook-ის სრული კონსპექტი
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveSubTab('license');
                }}
                className="px-4 py-2 rounded-xl neu-btn text-navy font-bold text-xs hover:text-gold transition-colors"
              >
                მოწმობის პროფილი
              </button>
              <a
                href={DRIVER_LICENSE_NOTEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="btn-stitch-primary px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-gold-soft cursor-pointer"
              >
                <span>კონსპექტის გახსნა</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Quick Teaser for Interactive Map */}
          <div
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('map');
            }}
            className="p-4 rounded-3xl neu-card shadow-neu-card border border-white flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:border-gold/60 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                <Navigation className="w-5 h-5 text-navy" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-navy group-hover:text-gold transition-colors">
                    Waze ცოცხალი რუკა, ბენზინის ფასები & ავტო სალონები
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    Live თბილისი
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  პატრულის ჩასაფრებები, რადარები, Wissol/Gulf ფასები და Porsche/Tegeta სალონები
                </p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-navy text-gold font-bold text-xs flex items-center gap-2 shadow-sm group-hover:bg-slate-800 transition-colors">
              <span>რუკის გახსნა</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Active Vehicle Hero Showcase Card */}
          <div className="p-6 rounded-3xl neu-card shadow-neu-card border border-white relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    აქტიური ავტომობილი
                  </span>
                </div>
                <h3 className="text-2xl font-black text-navy tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {vehicle.year} წელი • {vehicle.engine || 'ძრავა დაუზუსტებელია'}
                </p>
              </div>

              {/* Georgian License Plate Mockup */}
              <GeorgianLicensePlate plate={vehicle.plate_number} size="md" />
            </div>

            {/* Profile Completeness Meter */}
            <div className="p-4 rounded-2xl neu-surface border border-white mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <Sparkles size={14} className="text-gold" />
                  <span>AI პროფილის სისრულე: <strong className="text-gold font-mono">{completeness}%</strong></span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {missingFields.length === 0 ? 'ყველა მონაცემი შევსებულია' : `დარჩენილია ${missingFields.length} პარამეტრი`}
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness === 100 ? 'bg-emerald-500' : 'bg-gold'
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>

              {/* Contextual missing fields chips (One-touch fill!) */}
              {missingFields.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500">
                    სწრაფი შევსება:
                  </span>
                  {missingFields.map(field => (
                    <button
                      key={field.key}
                      onClick={() => {
                        sounds.playClick();
                        onOpenFieldPrompt(field.prompt);
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>+ {field.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">საწვავის ტიპი</span>
                <div className="flex items-center gap-1.5 font-bold text-xs text-navy">
                  <Fuel size={14} className="text-gold" />
                  <span className="capitalize">{vehicle.fuel_type}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">გარბენი</span>
                <div className="flex items-center gap-1.5 font-black text-xs text-navy font-mono">
                  <Gauge size={14} className="text-gold" />
                  <span>{vehicle.mileage_km.toLocaleString()} კმ</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">VIN შასი</span>
                <div className="flex items-center gap-1.5 font-bold text-xs text-navy font-mono truncate">
                  <Shield size={14} className="text-gold shrink-0" />
                  <span className="truncate">{vehicle.vin || 'არ არის მითითებული'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl neu-surface border border-white">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">OBD ადაპტერი</span>
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 font-mono">
                  <Wifi size={14} className="text-emerald-500" />
                  <span>{vehicle.obd_ip}:{vehicle.obd_port}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Vehicles / Presets */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-navy uppercase tracking-wider px-1">
              შენახული მანქანები გარაჟში ({allVehicles.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {allVehicles.map(v => {
                const isSelected = v.id === vehicle.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectVehicle(v);
                    }}
                    className={`p-4 rounded-3xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'neu-card border-gold ring-2 ring-gold/40 shadow-gold-soft'
                        : 'neu-surface border-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl neu-circle flex items-center justify-center text-navy">
                        <Car size={18} className={isSelected ? 'text-gold' : 'text-navy'} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold text-navy">
                            აქტიური
                          </span>
                        )}
                        {onDeleteVehicle && allVehicles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              if (window.confirm(`ნამდვილად გსურთ ${v.brand} ${v.model} (${v.plate_number})-ის წაშლა გარაჟიდან?`)) {
                                onDeleteVehicle(v.id);
                              }
                            }}
                            className="w-7 h-7 rounded-lg neu-btn flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="მანქანის წაშლა გარაჟიდან"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <h5 className="font-black text-sm text-navy">{v.brand} {v.model}</h5>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{v.engine}</p>
                    
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                      <GeorgianLicensePlate plate={v.plate_number} size="xs" />
                      <span className="text-navy font-bold">{v.year} წ.</span>
                    </div>
                  </div>
                );
              })}

              {/* + Add New Vehicle Tile */}
              <div
                onClick={() => {
                  sounds.playClick();
                  onOpenAddModal();
                }}
                className="p-5 rounded-3xl border-2 border-dashed border-slate-300 hover:border-gold hover:bg-gold/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-gold group-hover:scale-110 transition-transform mb-2">
                  <Plus size={20} className="text-navy" />
                </div>
                <span className="font-black text-xs text-navy group-hover:text-gold transition-colors">
                  + მანქანის დამატება
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  პროფილის შევსება
                </span>
              </div>
            </div>
          </div>

          {/* Background Automated Pipeline Banner */}
          <div className="p-4 rounded-3xl neu-surface border border-white/80 flex items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span><strong>ავტომატიზაცია:</strong> n8n Backend დაკავშირებულია ფონურ რეჟიმში. მონაცემები იგზავნება ავტომატურად.</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400">Webhook Pipeline Live</span>
          </div>

        </div>
      )}

    </div>
  );
};

export default GarageModule;
