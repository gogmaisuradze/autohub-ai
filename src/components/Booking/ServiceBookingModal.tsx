import React, { useState } from 'react';
import { DtcCode, FineItem, ServiceBookingItem, ServiceItem, VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import {
  Calendar as CalendarIcon,
  Clock,
  Wrench,
  Bot,
  Car,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  Building2,
  Sparkles,
  X,
  ShieldCheck,
  Droplets,
  Disc,
  FileCheck,
  Zap,
  Wind
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleProfile;
  dtcCodes: DtcCode[];
  services: ServiceItem[];
  fines: FineItem[];
  onSubmitBooking: (booking: ServiceBookingItem) => void;
  preselectedServiceType?: ServiceBookingItem['service_type'];
  preselectedTitle?: string;
}

const SERVICE_PROVIDERS = [
  {
    name: 'თეგეტა მოტორსი (ცენტრალური ფილიალი, დიღომი)',
    address: 'დ. აღმაშენებლის ხეივანი მე-12 კმ, თბილისი',
    phone: '032 2 26 44 44',
    rating: 4.8,
    types: ['doctor_mechanic', 'oil_fluids', 'brakes_chassis', 'obd_diagnostics', 'ac_climate']
  },
  {
    name: 'ამბოლი (საბურთალოს ფილიალი)',
    address: 'ვაჟა-ფშაველას გამზ. #71, თბილისი',
    phone: '032 2 15 40 40',
    rating: 4.7,
    types: ['oil_fluids', 'brakes_chassis', 'ac_climate']
  },
  {
    name: 'Greenway Georgia (ტექინსპექტირება PTI)',
    address: 'დიღმის მასივი, რობაქიძის გამზ. #7, თბილისი',
    phone: '032 2 99 77 77',
    rating: 4.9,
    types: ['pti_inspection']
  },
  {
    name: 'ავტოექსპერტი (ვაშლიჯვრის ცენტრი)',
    address: 'გოძიაშვილის ქ. #23, თბილისი',
    phone: '032 2 55 11 22',
    rating: 4.8,
    types: ['doctor_mechanic', 'obd_diagnostics', 'brakes_chassis']
  },
  {
    name: 'AutoHub VIP მობილური ექიმი (ადგილზე მოსვლით)',
    address: 'თბილისის მასშტაბით გამოძახებით (VIP Service)',
    phone: '+995 599 00 11 22',
    rating: 5.0,
    types: ['doctor_mechanic', 'obd_diagnostics', 'oil_fluids']
  }
];

const TIME_SLOTS = [
  '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30'
];

export const ServiceBookingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  vehicle,
  dtcCodes,
  services,
  fines,
  onSubmitBooking,
  preselectedServiceType,
  preselectedTitle
}) => {
  if (!isOpen) return null;

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [serviceType, setServiceType] = useState<ServiceBookingItem['service_type']>(
    preselectedServiceType || (dtcCodes.length > 0 ? 'doctor_mechanic' : 'oil_fluids')
  );
  const [providerName, setProviderName] = useState(SERVICE_PROVIDERS[0].name);
  const [bookingDate, setBookingDate] = useState(defaultDateStr);
  const [bookingTime, setBookingTime] = useState('11:00');
  const [driverName, setDriverName] = useState(vehicle.driver_name || 'გიორგი მაისურაძე');
  const [driverPhone, setDriverPhone] = useState(vehicle.driver_phone || '+995 599 12 34 56');
  const [plateNumber, setPlateNumber] = useState(vehicle.plate_number || 'FR-282-EE');
  
  // Custom or auto-generated problem description
  const defaultComplaint = dtcCodes.length > 0
    ? `დაფიქსირებულია ${dtcCodes.length} DTC ხარვეზი (${dtcCodes.map(d => d.code).join(', ')}). საჭიროა დეტალური კომპიუტერული დიაგნოსტიკა და შეკეთება.`
    : 'გეგმიური ტექნიკური მომსახურება და სერვის-წიგნაკის კომპონენტების შემოწმება.';

  const [complaint, setComplaint] = useState(preselectedTitle || defaultComplaint);

  // Oil health snapshot
  const oilService = services.find(s => s.variant_key === 'engine_oil' || s.title_ge.toLowerCase().includes('ზეთ'));
  const oilHealthPct = oilService ? oilService.health_percentage : 30;

  // Quick date chips
  const dateOptions = [
    { label: 'ხვალ', date: defaultDateStr },
    {
      label: '+2 დღე',
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
      })()
    },
    {
      label: '+3 დღე',
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split('T')[0];
      })()
    },
    {
      label: 'შაბათი',
      date: (() => {
        const d = new Date();
        const day = d.getDay();
        const diff = (6 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        return d.toISOString().split('T')[0];
      })()
    }
  ];

  const getServiceTypeTitle = (type: ServiceBookingItem['service_type']) => {
    switch (type) {
      case 'doctor_mechanic': return 'ავტო-ექიმის კონსულტაცია & დიაგნოსტიკა';
      case 'oil_fluids': return 'ძრავის ზეთისა და სითხეების სერვისი';
      case 'brakes_chassis': return 'სამუხრუჭე ხუნდები & სავალი ნაწილი';
      case 'pti_inspection': return 'პერიოდული ტექ-დათვალიერება PTI';
      case 'obd_diagnostics': return 'OBD-II კომპიუტერული დიაგნოსტიკა';
      case 'ac_climate': return 'კლიმატკონტროლი & კონდიცირება';
      default: return 'ინდივიდუალური სერვისი';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();

    const newBooking: ServiceBookingItem = {
      id: `BK-${Date.now().toString(36).toUpperCase()}`,
      service_type: serviceType,
      title_ge: getServiceTypeTitle(serviceType),
      provider_name: providerName,
      booking_date: bookingDate,
      booking_time: bookingTime,
      vehicle_id: vehicle.id,
      plate_number: plateNumber.toUpperCase(),
      driver_name: driverName,
      driver_phone: driverPhone,
      status: 'pending',
      complaint_or_goal: complaint,
      related_dtc_codes: dtcCodes.map(d => d.code),
      estimated_cost_gel: dtcCodes.length > 0 ? 320 : 180,
      accumulated_snapshot: {
        mileage_km: vehicle.mileage_km,
        active_dtc_count: dtcCodes.length,
        oil_health_pct: oilHealthPct,
        pending_fines_count: fines.filter(f => f.status === 'pending').length
      },
      created_at: new Date().toISOString()
    };

    onSubmitBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#EDF1F7] rounded-3xl shadow-2xl border border-white max-w-2xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy text-gold flex items-center justify-center shadow-md">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  ჩაწერა ავტო-ექიმთან / სერვისში
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-600" />
                  AI Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                აირჩიეთ თარიღი და დრო — მონაცემები ავტომატურად დაზუსტდება AI ბოტის ფანჯარაში
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Accumulated Vehicle Data Live Snapshot (The core requirement) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-slate-100 border border-amber-400/50 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-navy flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-gold" />
                <span>მანქანის მოგროვებული მონაცემები (Live Snapshot)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                სინქრონიზებულია
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">ავტომობილი</span>
                <span className="font-bold text-navy truncate block">{vehicle.brand} {vehicle.model}</span>
                <span className="text-[10px] font-mono text-slate-500">{vehicle.mileage_km.toLocaleString()} კმ</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">DTC შეცდომები</span>
                <span className={`font-bold block ${dtcCodes.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {dtcCodes.length > 0 ? `${dtcCodes.length} ხარვეზი` : 'სუფთაა (0)'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 truncate block">
                  {dtcCodes.map(d => d.code).join(', ') || 'OK'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">ზეთის რესურსი</span>
                <span className="font-bold text-navy block">{oilHealthPct}%</span>
                <span className="text-[10px] text-slate-500 block">Motul 5W-30</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">ნომერი & მძღოლი</span>
                <span className="font-mono font-bold text-navy block">{plateNumber}</span>
                <span className="text-[10px] text-slate-500 truncate block">{driverName}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-amber-300/40">
              💡 <strong>AI ინტეგრაცია:</strong> ჯავშნის გაგზავნისთანავე AI ბოტი შეადარებს აღნიშნულ მონაცემებს (ხარვეზები, ზეთის ცვეთა, გარბენი) და დააზუსტებს საჭირო სათადარიგო ნაწილებს, ხელობის ფასს და ვიზიტის ხანგრძლივობას.
            </p>
          </div>

          {/* 1. Service Type Selector */}
          <div>
            <label className="block text-xs font-black text-navy mb-2">
              აირჩიეთ მომსახურების მიმართულება
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { type: 'doctor_mechanic', label: 'ავტო-ექიმი', sub: 'დიაგნოსტიკა & შემოწმება', icon: Wrench, color: 'text-amber-600' },
                { type: 'oil_fluids', label: 'ზეთები & სითხეები', sub: 'ძრავი, კოლოფი ATF, ანტიფრიზი', icon: Droplets, color: 'text-blue-600' },
                { type: 'brakes_chassis', label: 'სავალი & ხუნდები', sub: 'Brembo, ამორტიზატორები', icon: Disc, color: 'text-rose-600' },
                { type: 'pti_inspection', label: 'ტექ-დათვალიერება', sub: 'Greenway PTI სერვისი', icon: FileCheck, color: 'text-emerald-600' },
                { type: 'obd_diagnostics', label: 'კომპ. დიაგნოსტიკა', sub: 'OBD-II, Check Engine', icon: Zap, color: 'text-purple-600' },
                { type: 'ac_climate', label: 'კონდიციონერი & AC', sub: 'ფრეონი, სალონის ფილტრი', icon: Wind, color: 'text-cyan-600' }
              ].map(item => {
                const isSelected = serviceType === item.type;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setServiceType(item.type as any);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-navy text-white border-navy shadow-md scale-102'
                        : 'bg-white hover:bg-slate-50 text-navy border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-gold' : item.color}`} />
                      <span className="text-xs font-black truncate">{item.label}</span>
                    </div>
                    <span className={`text-[10px] block truncate ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Service Center / Provider */}
          <div>
            <label className="block text-xs font-black text-navy mb-2 flex items-center justify-between">
              <span>სერვისცენტრი / ავტო-ექიმი</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">თბილისი & რეგიონები</span>
            </label>
            <div className="space-y-2">
              {SERVICE_PROVIDERS.map(prov => {
                const isSelected = providerName === prov.name;
                return (
                  <div
                    key={prov.name}
                    onClick={() => {
                      sounds.playClick();
                      setProviderName(prov.name);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-gold shadow-sm ring-2 ring-gold/30'
                        : 'bg-white/70 hover:bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-gold' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-navy truncate">{prov.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                          ★ {prov.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 ml-6">
                        {prov.address} • {prov.phone}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-gold border-gold text-navy' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle size={12} className="stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-navy mb-1.5 flex items-center justify-between">
                <span>ვიზიტის თარიღი</span>
                <span className="text-[10px] text-slate-400 font-normal">კალენდარი</span>
              </label>

              {/* Quick Date Chips */}
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
                {dateOptions.map(opt => (
                  <button
                    key={opt.date}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setBookingDate(opt.date);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all shrink-0 ${
                      bookingDate === opt.date
                        ? 'bg-navy text-gold border-navy'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setBookingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-navy mb-1.5 flex items-center justify-between">
                <span>დროის მონაკვეთი (Slot)</span>
                <span className="text-[10px] text-slate-400 font-normal">თავისუფალი საათები</span>
              </label>

              <div className="grid grid-cols-3 min-[450px]:grid-cols-4 gap-1.5">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setBookingTime(t);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      bookingTime === t
                        ? 'bg-gold text-navy font-black border-gold shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock size={11} className={bookingTime === t ? 'text-navy' : 'text-slate-400'} />
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Driver & Vehicle Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-navy mb-1">
                მძღოლის სახელი & გვარი
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={driverName}
                  onChange={e => setDriverName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:border-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy mb-1">
                ტელეფონის ნომერი
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={e => setDriverPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none focus:border-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy mb-1">
                სახელმწიფო ნომერი
              </label>
              <div className="relative">
                <Car size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy uppercase focus:outline-none focus:border-gold"
                  required
                />
              </div>
            </div>
          </div>

          {/* 5. Complaint / Goal description */}
          <div>
            <label className="block text-xs font-black text-navy mb-1.5 flex items-center justify-between">
              <span>ჩივილის ან მიზნის აღწერა</span>
              <span className="text-[10px] text-slate-400 font-normal">გადაეცემა AI-ს & ოსტატს</span>
            </label>
            <textarea
              rows={2}
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
              placeholder="აღწერეთ პრობლემა (მაგ: ძრავის ხმაური, ჩეკის ანთება, ზეთის შეცვლა)..."
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-navy focus:outline-none focus:border-gold resize-none leading-relaxed"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            სავარაუდო ხარჯი: <strong className="text-navy font-bold font-mono">~{dtcCodes.length > 0 ? '320' : '180'} ₾</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="btn-stitch-soft px-5 py-2.5 text-xs font-bold shrink-0"
            >
              გაუქმება
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="btn-stitch-primary flex-1 sm:flex-none justify-center px-6 py-2.5 text-xs font-black"
            >
              <Bot size={15} />
              <span>ჯავშანი & AI დაზუსტება →</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
