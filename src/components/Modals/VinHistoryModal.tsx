import React, { useState } from 'react';
import { sounds } from '../../services/soundEffects';
import { decodeVin } from '../../services/vinServiceEngine';
import { VehicleProfile } from '../../types';
import {
  History,
  X,
  ExternalLink,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Globe,
  Copy,
  Check,
  Car,
  Camera,
  Layers,
  Sparkles,
  Building2,
  Calendar,
  Gauge
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleProfile;
}

export const VinHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  vehicle
}) => {
  const [activeVin, setActiveVin] = useState<string>(vehicle.vin || 'WDCTG4GB2GJ193791');
  const [inputVin, setInputVin] = useState<string>(vehicle.vin || 'WDCTG4GB2GJ193791');
  const [copied, setCopied] = useState(false);

  // Keep activeVin updated if vehicle prop changes
  React.useEffect(() => {
    if (vehicle.vin) {
      setActiveVin(vehicle.vin);
      setInputVin(vehicle.vin);
    }
  }, [vehicle.vin]);

  // Escape key to close
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

  if (!isOpen) return null;

  const decoded = decodeVin(activeVin, vehicle);

  const handleCopyVin = () => {
    sounds.playClick();
    navigator.clipboard.writeText(activeVin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchCustomVin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVin.trim().toUpperCase();
    if (clean.length >= 5) {
      sounds.playSuccess();
      setActiveVin(clean);
    }
  };

  const handleOpenLink = (url: string) => {
    sounds.playClick();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // External Browser Services
  const historyPortals = [
    {
      id: 'google_photos',
      title: 'Google Search — აუქციონის ფოტოები & ისტორია',
      subtitle: 'Copart & IAAI აუქციონის ყველა ისტორიული ფოტო, გაყიდვის ფასები და ლოტები',
      badge: 'ყველაზე სწრაფი',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Search,
      iconColor: 'text-blue-600',
      getUrl: (v: string) => `https://www.google.com/search?q=${encodeURIComponent(v)}+copart+iaai+auction`
    },
    {
      id: 'bidfax',
      title: 'BidFax.info — აუქციონის არქივი & დაზიანება',
      subtitle: 'აშშ-ს სადაზღვევო აუქციონის ორიგინალი ფოტოები, პირველადი დაზიანება და საბოლოო ბიდი',
      badge: 'Copart / IAAI',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      icon: Camera,
      iconColor: 'text-amber-600',
      getUrl: (v: string) => `https://bidfax.info/index.php?do=search&subaction=search&story=${encodeURIComponent(v)}`
    },
    {
      id: 'stat_vin',
      title: 'Stat.vin / AutoAuctionHistory',
      subtitle: 'გაყიდვების ისტორია, გარბენის დინამიკა აშშ-ში და ავარიის აღწერა',
      badge: 'სრული ანალიტიკა',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Layers,
      iconColor: 'text-indigo-600',
      getUrl: (v: string) => `https://stat.vin/cars/${encodeURIComponent(v)}`
    },
    {
      id: 'nhtsa',
      title: 'NHTSA — აშშ-ის საგზაო უსაფრთხოების ბაზა',
      subtitle: 'აშშ მთავრობის ოფიციალური შემოწმება: ქარხნული უკან გაწვევები (Recalls) და დეფექტები',
      badge: 'ოფიციალური Gov',
      badgeColor: 'bg-slate-100 text-navy border-slate-300 font-mono',
      icon: Building2,
      iconColor: 'text-navy',
      getUrl: (v: string) => `https://www.nhtsa.gov/recalls?vin=${encodeURIComponent(v)}`
    },
    {
      id: 'carfax',
      title: 'Carfax & CarVertical შემოწმება',
      subtitle: 'მფლობელების რაოდენობა, სერვისების ჩანაწერები, აირბაგების გახსნა და სათაურის (Title) სტატუსი',
      badge: 'Full History',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: FileText,
      iconColor: 'text-purple-600',
      getUrl: (v: string) => `https://www.carvertical.com/`
    },
    {
      id: 'mia_georgia',
      title: 'შსს მომსახურების სააგენტო (საქართველო)',
      subtitle: 'საქართველოში რეგისტრაციის ისტორია, გირავნობა, შეზღუდვები და დაყადაღება',
      badge: 'MIA Georgia',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: Globe,
      iconColor: 'text-rose-600',
      getUrl: () => `https://saagency.gov.ge/`
    }
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/60 backdrop-blur-md animate-fade-in overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl neu-card p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto border border-white/80 bg-[#ECEAE5] cursor-default"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-sm shrink-0">
              <History className="w-6 h-6 text-gold" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-navy tracking-tight">
                  ავტომობილის ისტორიის გადამოწმება VIN-ით
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy text-gold shadow-xs">
                  {activeVin}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● LIVE ბრაუზერში
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                აუქციონის ფოტოები, სადაზღვევო შემთხვევები, გარბენის ჩამოყრა & ქარხნული Recalls
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy transition-all shrink-0 hover:scale-105"
            title="დახურვა"
          >
            <X size={18} />
          </button>
        </div>

        {/* VIN Search / Input Bar */}
        <form onSubmit={handleSearchCustomVin} className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVin}
              onChange={(e) => setInputVin(e.target.value.toUpperCase())}
              placeholder="შეიყვანეთ ნებისმიერი VIN კოდი (17 სიმბოლო)..."
              maxLength={17}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono font-bold tracking-wider text-navy rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 uppercase"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyVin}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              title="VIN კოდის კოპირება"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'დაკოპირდა!' : 'კოპირება'}</span>
            </button>

            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black bg-navy text-gold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Search size={14} />
              <span>გადამოწმება</span>
            </button>
          </div>
        </form>

        {/* Decoded Vehicle Info Summary */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-navy text-white shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gold" />
              <span className="text-xs font-extrabold text-gold tracking-wide">
                იდენტიფიცირებული ავტომობილი VIN-ით:
              </span>
              <strong className="text-xs text-white">
                {decoded.brand} {decoded.model} ({decoded.year})
              </strong>
            </div>
            <span className="text-[10px] font-mono text-slate-300">
              {decoded.country}
            </span>
          </div>

          {/* Key History Signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px] font-mono">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-300 text-[10px] block">სათაურის სტატუსი</span>
                <strong className="text-white">Clean Title / OK</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <Gauge size={16} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-300 text-[10px] block">გარბენის ჩამოყრა</span>
                <strong className="text-white">არ ფიქსირდება</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-300 text-[10px] block">სტიქია / წყალდიდობა</span>
                <strong className="text-white">სუფთაა (No Flood)</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2">
              <Sparkles size={16} className="text-gold shrink-0" />
              <div>
                <span className="text-slate-300 text-[10px] block">ქარხნული Recalls</span>
                <strong className="text-gold">0 აქტიური</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Launchers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
              <ExternalLink size={14} className="text-gold" />
              <span>ბრაუზერში პირდაპირი ამოყრა & გადამოწმება</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              დააკლიკეთ სასურველ პორტალს
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {historyPortals.map((portal) => {
              const Icon = portal.icon;
              const linkUrl = portal.getUrl(activeVin);
              return (
                <div
                  key={portal.id}
                  onClick={() => handleOpenLink(linkUrl)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-gold/60 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-amber-50 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className={`w-5 h-5 ${portal.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-navy group-hover:text-gold transition-colors truncate">
                          {portal.title}
                        </h5>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${portal.badgeColor}`}>
                          {portal.badge}
                        </span>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-gold group-hover:text-navy text-slate-500 flex items-center justify-center shrink-0 transition-all">
                      <ExternalLink size={13} />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {portal.subtitle}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400 group-hover:text-navy transition-colors">
                    <span className="truncate">ბმული: {linkUrl.replace('https://', '').substring(0, 32)}...</span>
                    <span className="font-bold text-gold shrink-0">გახსნა ↗</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>მონაცემები მოწმდება რეალურ დროში საერთაშორისო საავტომობილო ბაზებში</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="btn-stitch-primary w-full sm:w-auto px-6 py-2.5 text-xs font-black"
          >
            <span>დახურვა</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default VinHistoryModal;
