import React, { useState } from 'react';
import { MapPointType, MapReport } from '../../types';
import { sounds } from '../../services/soundEffects';
import {
  X,
  Shield,
  Camera,
  AlertTriangle,
  Fuel,
  MapPin,
  Send,
  Navigation,
  CheckCircle2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (report: Omit<MapReport, 'id' | 'confirmations' | 'active'>) => void;
  currentCoords: { lat: number; lng: number } | null;
}

export const AddReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddReport,
  currentCoords
}) => {
  const [selectedType, setSelectedType] = useState<MapPointType>('patrol');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('Wissol');
  const [fuelRegular, setFuelRegular] = useState('2.94');
  const [fuelPremium, setFuelPremium] = useState('3.12');
  const [fuelDiesel, setFuelDiesel] = useState('3.19');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomPin, setUseCustomPin] = useState(false);

  if (!isOpen) return null;

  const defaultTbilisi = { lat: 41.7151, lng: 44.8271 };
  const targetCoords = currentCoords || defaultTbilisi;

  const types = [
    {
      type: 'patrol' as MapPointType,
      label: 'პატრული',
      sub: 'ეკიპაჟი / ჩასაფრება',
      icon: Shield,
      color: 'bg-blue-600/15 text-blue-600 border-blue-400'
    },
    {
      type: 'radar' as MapPointType,
      label: 'რადარი',
      sub: 'სიჩქარის კამერა',
      icon: Camera,
      color: 'bg-amber-600/15 text-amber-600 border-amber-400'
    },
    {
      type: 'hazard' as MapPointType,
      label: 'საფრთხე',
      sub: 'ავარია / სარემონტო',
      icon: AlertTriangle,
      color: 'bg-rose-600/15 text-rose-600 border-rose-400'
    },
    {
      type: 'fuel' as MapPointType,
      label: 'ბენზინი',
      sub: 'საწვავის ფასები',
      icon: Fuel,
      color: 'bg-emerald-600/15 text-emerald-600 border-emerald-400'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsSubmitting(true);

    const reportTitle = title.trim() || (
      selectedType === 'patrol' ? 'საპატრულო ეკიპაჟი' :
      selectedType === 'radar' ? 'სიჩქარის რადარი' :
      selectedType === 'hazard' ? 'საგზაო დაბრკოლება / ავარია' :
      `${brand} - საწვავის განახლებული ფასები`
    );

    const payload: Omit<MapReport, 'id' | 'confirmations' | 'active'> = {
      type: selectedType,
      title: reportTitle,
      description: description.trim() || undefined,
      lat: targetCoords.lat + (Math.random() - 0.5) * 0.002, // slight jitter if default
      lng: targetCoords.lng + (Math.random() - 0.5) * 0.002,
      timestamp: Date.now()
    };

    if (selectedType === 'fuel') {
      payload.brand = brand;
      payload.fuel_prices = {
        regular_92: parseFloat(fuelRegular) || 2.94,
        premium_95: parseFloat(fuelPremium) || 3.12,
        diesel: parseFloat(fuelDiesel) || 3.19
      };
    }

    setTimeout(() => {
      onAddReport(payload);
      sounds.playSuccess();
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg neu-card rounded-3xl shadow-neu-modal p-6 border border-white max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-gold">
              <Navigation className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy">
                საგზაო შეტყობინების დამატება
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Waze-სტილის ცოცხალი გაფრთხილება მძღოლებისთვის
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wider">
              1. აირჩიეთ კატეგორია
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {types.map(item => {
                const isSelected = selectedType === item.type;
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedType(item.type);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-navy text-white border-navy shadow-md scale-[1.02]'
                        : 'bg-white hover:bg-slate-50 text-navy border-slate-200'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-gold text-navy' : item.color
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="font-black text-xs">{item.label}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Fuel Specific options */}
          {selectedType === 'fuel' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/40 space-y-3">
              <label className="block text-xs font-bold text-navy">
                ბენზინგასამართი ბრენდი:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Wissol', 'Gulf', 'Rompetrol', 'Socar', 'Lukoil'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      brand === b
                        ? 'bg-navy text-gold shadow-sm'
                        : 'bg-white text-navy hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">რეგულარი (₾)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelRegular}
                    onChange={(e) => setFuelRegular(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">პრემიუმი (₾)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelPremium}
                    onChange={(e) => setFuelPremium(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">დიზელი (₾)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelDiesel}
                    onChange={(e) => setFuelDiesel(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Title & Details */}
          <div>
            <label className="block text-xs font-bold text-navy mb-1.5">
              სათაური / ლოკაციის აღწერა
            </label>
            <input
              type="text"
              placeholder={
                selectedType === 'patrol' ? 'მაგ: ჩასაფრება ვაჟა-ფშაველაზე' :
                selectedType === 'radar' ? 'მაგ: სიჩქარის რადარი 60 კმ/სთ' :
                selectedType === 'hazard' ? 'მაგ: მარჯვენა ზოლი გადაკეტილია' :
                'მაგ: ჭავჭავაძის ფილიალი'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy mb-1.5">
              დამატებითი დეტალები (სურვილისამებრ)
            </label>
            <textarea
              rows={2}
              placeholder="მაგ: გზის მარცხენა მხარეს, შეფერხებულია მოძრაობა..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-gold resize-none"
            />
          </div>

          {/* 4. GPS Location info */}
          <div className="p-3.5 rounded-2xl neu-surface border border-white flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin size={16} className="text-gold shrink-0" />
              <span>
                {currentCoords ? (
                  <>GPS კოორდინატები: <strong className="font-mono text-navy">{targetCoords.lat.toFixed(4)}, {targetCoords.lng.toFixed(4)}</strong></>
                ) : (
                  <>ლოკაცია: <strong className="text-navy">თბილისის ცენტრი (ნაგულისხმევი)</strong></>
                )}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Geo
            </span>
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-slate-500 hover:text-navy"
            >
              გაუქმება
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-navy hover:bg-slate-800 text-gold font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={15} />
              <span>{isSubmitting ? 'იგზავნება n8n-ში...' : 'შეტყობინების გაგზავნა'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddReportModal;
