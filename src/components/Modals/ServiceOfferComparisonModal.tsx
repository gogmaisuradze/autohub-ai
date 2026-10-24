import React, { useState } from 'react';
import { ServiceItem, VehicleProfile, ServiceBookingItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import {
  getComparisonForService,
  ServiceTierOption,
  ServiceProviderOption
} from '../../services/serviceComparisonEngine';
import {
  Scale,
  X,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Wrench,
  Building2,
  MapPin,
  Phone,
  ArrowRight,
  Star,
  Award,
  Zap,
  Tag,
  AlertTriangle,
  Car
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  vehicle: VehicleProfile;
  onAcceptOffer: (booking: ServiceBookingItem) => void;
}

export const ServiceOfferComparisonModal: React.FC<Props> = ({
  isOpen,
  onClose,
  service,
  vehicle,
  onAcceptOffer
}) => {
  const [selectedTierId, setSelectedTierId] = useState<'budget' | 'optimal' | 'premium'>('optimal');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('tegeta_motors');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState<string>('11:00');
  const [customerName, setCustomerName] = useState<string>(vehicle.driver_name || 'გიორგი მაისურაძე');
  const [customerPhone, setCustomerPhone] = useState<string>(vehicle.driver_phone || '+995 599 12 34 56');

  // Success Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<ServiceBookingItem | null>(null);

  // Allow closing via Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sounds.playClick();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const comparison = getComparisonForService(service, vehicle);
  const selectedTier = comparison.tiers.find(t => t.id === selectedTierId) || comparison.tiers[1];
  const selectedProvider = comparison.providers.find(p => p.id === selectedProviderId) || comparison.providers[0];

  const handleAgreeAndBook = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();

    const voucherCode = `AUTOHUB-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: ServiceBookingItem = {
      id: `bk_${Date.now()}`,
      service_type: 'doctor_mechanic',
      title_ge: `${service.title_ge} (${selectedTier.name_ge})`,
      provider_name: selectedProvider.name,
      booking_date: bookingDate,
      booking_time: bookingTime,
      vehicle_id: vehicle.id,
      plate_number: vehicle.plate_number,
      driver_name: customerName,
      driver_phone: customerPhone,
      status: 'confirmed',
      voucher_code: voucherCode,
      estimated_cost_gel: selectedTier.price_gel,
      complaint_or_goal: `შეთანხმებული პაკეტი: ${selectedTier.name_ge} (${selectedTier.price_gel} ₾) • ნაწილები: ${selectedTier.parts_brand} • გარანტია: ${selectedTier.warranty} • ცენტრი: ${selectedProvider.name}`,
      created_at: new Date().toISOString()
    };

    setConfirmedBooking(newBooking);
    onAcceptOffer(newBooking);
  };

  const handleCloseModal = () => {
    sounds.playClick();
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/60 backdrop-blur-md animate-fade-in overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-3xl neu-card p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto border border-white/80 bg-[#ECEAE5] cursor-default"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0">
              <Scale className="w-6 h-6 text-gold" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  მომსახურების შედარება & შეთავაზებები
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  comparison.urgency === 'critical'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : comparison.urgency === 'warning'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {comparison.urgency === 'critical' ? '● კრიტიკული საჭიროება' : comparison.urgency === 'warning' ? '● საჭიროებს შეცვლას' : '● გეგმიური შემოწმება'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-navy border border-slate-200">
                  {vehicle.brand} {vehicle.model}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {service.title_ge} • დარჩენილი რესურსი: <strong className="font-mono text-navy">{service.health_percentage}% (~{service.remaining_km.toLocaleString()} კმ)</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy transition-all shrink-0 hover:scale-105"
            title="დახურვა"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. CONFIRMED VOUCHER SUCCESS STATE (თუ კლიენტი დათანხმდა) */}
        {confirmedBooking ? (
          <div className="p-6 rounded-3xl bg-white border-2 border-emerald-400 shadow-xl space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-2">
                ● დადასტურებული საგზური #{confirmedBooking.voucher_code}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-navy">
                შეთავაზება მიღებულია & ვიზიტი დაჯავშნილია!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                სერვისი ჩაინიშნა თქვენს ციფრულ კალენდარში. სერვისცენტრი გელოდებათ მითითებულ დროს რიგის გარეშე.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs font-mono space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">მომსახურება:</span>
                <strong className="text-navy">{confirmedBooking.title_ge}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">სერვისცენტრი:</span>
                <strong className="text-navy">{confirmedBooking.provider_name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">თარიღი & დრო:</span>
                <strong className="text-navy">{confirmedBooking.booking_date} • {confirmedBooking.booking_time}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500">მძღოლი / მანქანა:</span>
                <strong className="text-navy">{confirmedBooking.driver_name} ({vehicle.plate_number})</strong>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">შეთანხმებული ღირებულება:</span>
                <strong className="text-emerald-700 text-sm font-black">{confirmedBooking.estimated_cost_gel} ₾</strong>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={handleCloseModal}
                className="btn-stitch-primary px-8 py-3 text-sm font-black"
              >
                <span>დასრულება & კალენდარში ნახვა</span>
              </button>
            </div>
          </div>
        ) : (
          /* COMPARISON & ACCEPTANCE FLOW */
          <form onSubmit={handleAgreeAndBook} className="space-y-5 animate-fade-in">
            {/* Urgency Explanation Banner */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  comparison.urgency === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-900'
                }`}>
                  <AlertTriangle size={16} />
                </div>
                <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
                  {comparison.urgency_reason}
                </p>
              </div>

              <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 hidden sm:inline-block">
                VIN: {vehicle.vin}
              </span>
            </div>

            {/* 1. Three Transparent Package Tiers (3 შედარებითი ტარიფი) */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <label className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-gold" />
                  <span>1. შეარჩიეთ თქვენთვის სასურველი ვარიანტი:</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  3 განსხვავებული ფასი და გარანტია
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {comparison.tiers.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedTierId(tier.id);
                      }}
                      className={`p-4 rounded-3xl cursor-pointer transition-all border relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white shadow-xl border-gold ring-2 ring-gold/50 scale-[1.01]'
                          : 'neu-btn text-slate-700 hover:text-navy hover:bg-white/80'
                      }`}
                    >
                      <div>
                        {/* Top Badge & Price */}
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                            {tier.badge}
                          </span>
                          <div className="text-right">
                            <span className="text-lg font-black font-mono text-navy block leading-none">
                              {tier.price_gel} ₾
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">ნაწილები + ხელობა</span>
                          </div>
                        </div>

                        {/* Title & Tagline */}
                        <h4 className="text-sm font-black text-navy">{tier.name_ge}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {tier.tagline_ge}
                        </p>

                        {/* Parts & Warranty */}
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-mono space-y-1">
                          <div className="flex items-center gap-1.5 text-navy font-bold truncate">
                            <Wrench size={12} className="text-gold shrink-0" />
                            <span className="truncate">{tier.parts_brand}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <ShieldCheck size={12} className="shrink-0" />
                            <span>გარანტია: {tier.warranty}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <Clock size={11} className="shrink-0" />
                            <span>ხანგრძლივობა: ~{tier.duration}</span>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                          {tier.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Select Indicator */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-gold' : 'text-slate-400'}`}>
                          {isSelected ? '✓ არჩეულია' : 'არჩევა'}
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'bg-gold text-navy' : 'border border-slate-300'
                        }`}>
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Provider Selection (სერვისცენტრის არჩევა) */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={14} className="text-gold" />
                  <span>2. აირჩიეთ სერვისცენტრი საქართველოში:</span>
                </label>
                <span className="text-[11px] text-emerald-600 font-bold">
                  ● ყველა პარტნიორი შემოწმებულია
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {comparison.providers.map((p) => {
                  const isSel = selectedProviderId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedProviderId(p.id);
                      }}
                      className={`p-3 rounded-2xl cursor-pointer border transition-all text-xs flex flex-col justify-between ${
                        isSel
                          ? 'bg-amber-50/60 border-gold ring-1 ring-gold shadow-sm font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <strong className="text-navy text-xs leading-tight truncate">{p.name}</strong>
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0 text-[10px]">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span>{p.rating}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="shrink-0 text-slate-400" />
                          <span className="truncate">{p.address}</span>
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-mono">
                            {p.location_badge}
                          </span>
                          {p.discount_badge && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              {p.discount_badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">{p.phone}</span>
                        <span className={`font-bold ${isSel ? 'text-gold' : 'text-slate-500'}`}>
                          {isSel ? '✓ არჩეულია' : 'არჩევა'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Date, Time & Driver Contact Details */}
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-3">
              <label className="text-xs font-black text-navy uppercase tracking-wider block">
                3. ვიზიტის დრო და საკონტაქტო მონაცემები:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">თარიღი</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-medium text-navy text-xs focus:outline-none focus:ring-2 focus:ring-gold/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">საათი</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-medium text-navy text-xs focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white"
                    >
                      {['09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30'].map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">მძღოლის სახელი</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="სახელი და გვარი"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy text-xs focus:outline-none focus:ring-2 focus:ring-gold/50"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">ტელეფონი</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+995 5XX XX XX XX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-navy text-xs focus:outline-none focus:ring-2 focus:ring-gold/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Footer Summary & Agreement Button */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-mono text-center sm:text-left">
                <span>არჩეულია: </span>
                <strong className="text-navy">{selectedTier.name_ge}</strong> • <span>ცენტრი: </span>
                <strong className="text-navy">{selectedProvider.name}</strong> • <span>გარანტია: </span>
                <strong className="text-emerald-700">{selectedTier.warranty}</strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-stitch-soft w-full sm:w-auto px-5 py-3 text-xs font-bold"
                >
                  <span>გაუქმება</span>
                </button>

                <button
                  type="submit"
                  className="btn-stitch-primary w-full sm:w-auto px-7 py-3 text-sm font-black flex items-center justify-center gap-2 shadow-gold-soft"
                >
                  <CheckCircle2 className="w-5 h-5 text-navy" />
                  <span>დათანხმება & დაჯავშნა • {selectedTier.price_gel} ₾</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ServiceOfferComparisonModal;
