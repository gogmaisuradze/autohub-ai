import React, { useState } from 'react';
import { VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import {
  Car,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Sparkles,
  Zap,
  Cpu,
  Wrench,
  ShieldCheck,
  Wifi,
  Fuel,
  Gauge
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveVehicle: (newVehicle: VehicleProfile) => void;
  initialData?: Partial<VehicleProfile>;
  initialStep?: number;
}

const POPULAR_BRANDS = [
  'BMW',
  'Mercedes-Benz',
  'Porsche',
  'Toyota',
  'Audi',
  'Volkswagen',
  'Ford',
  'Hyundai',
  'Lexus',
  'Subaru'
];

export const AddVehicleWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveVehicle,
  initialData,
  initialStep = 1
}) => {
  const [step, setStep] = useState<number>(initialStep);

  // Allow closing via Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Form State
  const [formData, setFormData] = useState<VehicleProfile>({
    id: initialData?.id || `CAR_${Date.now().toString().slice(-4)}`,
    brand: initialData?.brand || 'Mercedes-Benz',
    model: initialData?.model || 'GLA 250',
    year: initialData?.year || 2016,
    engine: initialData?.engine || '2.0L Turbo (1991 cm³)',
    vin: initialData?.vin || 'WDCTG4GB2GJ193791',
    plate_number: initialData?.plate_number || 'FR-282-EE',
    tech_passport: initialData?.tech_passport || '22-3999',
    mileage_km: initialData?.mileage_km || 45000,
    fuel_type: initialData?.fuel_type || 'petrol',
    obd_ip: initialData?.obd_ip || '192.168.0.10',
    obd_port: initialData?.obd_port || 35000,
    last_oil_change_km: initialData?.last_oil_change_km || 40000,
    pti_expiry_date: initialData?.pti_expiry_date || '2026-12-31',
    horsepower: initialData?.horsepower || 250
  });

  // Synchronize formData whenever modal opens or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        id: initialData?.id || prev.id || `CAR_${Date.now().toString().slice(-4)}`,
        brand: initialData?.brand || prev.brand || 'BMW',
        model: initialData?.model !== undefined ? initialData.model : prev.model,
        year: initialData?.year || prev.year || 2023,
        engine: initialData?.engine || prev.engine || '',
        vin: initialData?.vin || prev.vin || '',
        plate_number: initialData?.plate_number || prev.plate_number || 'GE-777-AA',
        tech_passport: initialData?.tech_passport || prev.tech_passport || '',
        mileage_km: initialData?.mileage_km !== undefined ? initialData.mileage_km : prev.mileage_km,
        fuel_type: initialData?.fuel_type || prev.fuel_type || 'petrol',
        obd_ip: initialData?.obd_ip || prev.obd_ip || '192.168.0.10',
        obd_port: initialData?.obd_port || prev.obd_port || 35000,
        last_oil_change_km: initialData?.last_oil_change_km || prev.last_oil_change_km || 40000,
        pti_expiry_date: initialData?.pti_expiry_date || prev.pti_expiry_date || '2026-12-31',
        horsepower: initialData?.horsepower || prev.horsepower || 250
      }));
      setStep(initialStep || 1);
    }
  }, [isOpen, initialData, initialStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    sounds.playClick();
    if (step < 4) {
      setStep(s => s + 1);
    } else {
      handleFinalSave();
    }
  };

  const handlePrev = () => {
    sounds.playClick();
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const handleFinalSave = () => {
    sounds.playSuccess();
    onSaveVehicle(formData);
    onClose();
  };

  const stepsList = [
    { num: 1, title: 'იდენტიფიკაცია', icon: Car },
    { num: 2, title: 'ძრავა & საწვავი', icon: Zap },
    { num: 3, title: 'გარბენი & მოვლა', icon: Gauge },
    { num: 4, title: 'OBD & VIN', icon: Wifi }
  ];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-fade-in cursor-pointer overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl neu-surface rounded-3xl p-6 sm:p-8 shadow-2xl border border-white max-h-[90vh] overflow-y-auto cursor-default my-auto"
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-gold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-gold font-bold tracking-wider">
                ● ჭკვიანი ავტო-პროფილი
              </span>
              <h3 className="text-lg font-black text-navy">
                {initialData?.vin ? 'OBD-II ავტო-რეგისტრაციის ოსტატი' : 'ავტომობილის დამატება'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* OBD Auto-Discovered Banner if detected from ECU */}
        {initialData?.vin && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-between gap-2 text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <span>მონაცემები ამოკითხულია დაკავშირებული OBD-II ადაპტერიდან (VIN: {formData.vin})</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
              ECU Auto-Filled
            </span>
          </div>
        )}

        {/* Step Progress Tracker */}
        <div className="my-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-navy">
              ნაბიჯი {step} / 4: <span className="text-gold">{stepsList[step - 1].title}</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              {Math.round((step / 4) * 100)}% შევსებული
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Step Pills */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isDone = s.num < step;
              const isCurrent = s.num === step;
              return (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all text-xs font-bold ${
                    isCurrent
                      ? 'bg-navy text-white shadow-sm'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon size={14} className={isCurrent ? 'text-gold' : isDone ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-[10px] truncate max-w-full">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: IDENTITY & PLATE NUMBER */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p className="text-xs text-navy leading-relaxed">
                <strong className="text-amber-900">რატომ სჭირდება AI-ს:</strong> სახელმწიფო ნომრით სისტემა ავტომატურად ამოწმებს საპატრულო კამერების ვიდეოჯარიმებს და -20%-იან ფასდაკლების ვადებს.
              </p>
            </div>

            {/* Georgian License Plate Mockup Input */}
            <div>
              <label className="block text-xs font-black text-navy uppercase mb-1.5">
                სახელმწიფო ნომერი (License Plate)
              </label>
              <div className="flex items-center gap-3 p-2 rounded-2xl neu-inset">
                <div className="px-3 py-2 rounded-xl bg-white text-navy font-black text-xs border border-slate-200 flex flex-col items-center leading-none">
                  <span className="text-sm">🇬🇪</span>
                  <span className="text-[9px] font-mono text-blue-700 font-bold mt-0.5">GE</span>
                </div>
                <input
                  type="text"
                  placeholder="მაგ. GE-777-AA"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value.toUpperCase() })}
                  className="bg-transparent border-none outline-none font-mono font-black text-base text-navy w-full tracking-widest uppercase placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Brand Quick Selector */}
            <div>
              <label className="block text-xs font-black text-navy uppercase mb-1.5">
                მარკა (Brand)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {POPULAR_BRANDS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFormData({ ...formData, brand: b })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      formData.brand === b
                        ? 'bg-navy text-white shadow-sm font-black'
                        : 'bg-white text-slate-700 hover:border-gold border border-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  მოდელი (Model)
                </label>
                <input
                  type="text"
                  placeholder="მაგ. 330i M-Sport, RAV4, Taycan..."
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  გამოშვების წელი (Year)
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2026"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2023 })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ENGINE & FUEL */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p className="text-xs text-navy leading-relaxed">
                <strong className="text-amber-900">რატომ სჭირდება AI-ს:</strong> ძრავის ტიპისა და საწვავის სისტემის მიხედვით AI მექანიკოსი ზუსტად შიფრავს DTC ხარვეზებს და გაწვდით თავსებადი ნაწილების ფასებს.
              </p>
            </div>

            {/* Fuel Type Tabs */}
            <div>
              <label className="block text-xs font-black text-navy uppercase mb-1.5">
                საწვავის ტიპი (Fuel Type)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'petrol', label: 'ბენზინი (Gasoline)' },
                  { id: 'diesel', label: 'დიზელი (Diesel)' },
                  { id: 'hybrid', label: 'ჰიბრიდი (Hybrid)' },
                  { id: 'electric', label: 'ელექტრო (EV)' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, fuel_type: f.id as any })}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition-all text-center border ${
                      formData.fuel_type === f.id
                        ? 'bg-navy text-white shadow-sm border-navy font-black'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-gold'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  ძრავის მოცულობა / კოდი
                </label>
                <input
                  type="text"
                  placeholder="მაგ. 2.0L TwinPower Turbo (B48)"
                  value={formData.engine}
                  onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  ცხენის ძალა (HP)
                </label>
                <input
                  type="number"
                  placeholder="მაგ. 255"
                  value={formData.horsepower || ''}
                  onChange={(e) => setFormData({ ...formData, horsepower: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MILEAGE & MAINTENANCE BASELINE */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p className="text-xs text-navy leading-relaxed">
                <strong className="text-amber-900">რატომ სჭირდება AI-ს:</strong> მიმდინარე გარბენის საფუძველზე სისტემა ავტომატურად ითვლის ზეთის, ხუნდების, ფილტრებისა და ტექ-დათვალიერების დარჩენილ რესურსს.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  მიმდინარე გარბენი (Current Mileage, კმ)
                </label>
                <input
                  type="number"
                  value={formData.mileage_km}
                  onChange={(e) => setFormData({ ...formData, mileage_km: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  ბოლო ზეთის შეცვლის გარბენი (კმ)
                </label>
                <input
                  type="number"
                  value={formData.last_oil_change_km || 0}
                  onChange={(e) => setFormData({ ...formData, last_oil_change_km: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">
                ტექ-დათვალიერების (PTI) მოქმედების ვადა
              </label>
              <input
                type="date"
                value={formData.pti_expiry_date || ''}
                onChange={(e) => setFormData({ ...formData, pti_expiry_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* STEP 4: OBD-II ADAPTER & VIN */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p className="text-xs text-navy leading-relaxed">
                <strong className="text-amber-900">რატომ სჭირდება AI-ს:</strong> VIN კოდით AI ამოიცნობს ზუსტ ქარხნულ სპეციფიკაციას, ხოლო OBD-II ადაპტერი იძლევა რეალურ დროში ტელემეტრიასა და Check Engine-ის ჩაქრობას.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy mb-1">
                VIN კოდი (17-ნიშნა შასის ნომერი)
              </label>
              <input
                type="text"
                placeholder="მაგ. WBA5R1C50NFP12345 (არასავალდებულო)"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono uppercase tracking-wider"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  OBD-II Wi-Fi IP მისამართი
                </label>
                <input
                  type="text"
                  placeholder="192.168.0.10"
                  value={formData.obd_ip}
                  onChange={(e) => setFormData({ ...formData, obd_ip: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  OBD პორტი (Port)
                </label>
                <input
                  type="number"
                  placeholder="35000"
                  value={formData.obd_port}
                  onChange={(e) => setFormData({ ...formData, obd_port: parseInt(e.target.value) || 35000 })}
                  className="w-full px-4 py-2.5 rounded-2xl neu-inset text-xs font-bold text-navy outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-2xl neu-btn text-xs font-bold text-navy flex items-center gap-1.5 hover:text-gold"
              >
                <ChevronLeft size={16} />
                <span>უკან</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFinalSave}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-navy transition-all"
            >
              მოგვიანებით შევსება
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <span>{step === 4 ? 'შენახვა & დასრულება 🎉' : 'გაგრძელება'}</span>
              {step < 4 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddVehicleWizardModal;
