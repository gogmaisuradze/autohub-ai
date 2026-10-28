import React, { useState } from 'react';
import { ParkingSession } from '../../types/parkingSession';
import { ParkingLocationLot } from '../../types/parking';
import { DELINEATED_PARKING_ZONES, createManualParkingLot } from '../../constants/parkingZones';
import { formatTbilisiTime } from '../../services/parkingSessionService';
import { sounds } from '../../services/soundEffects';
import {
  Car,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  session: ParkingSession;
  candidateLots?: ParkingLocationLot[];
  isOpen: boolean;
  onConfirm: (reminderLeadMinutes: number, customDurationMinutes?: number) => void;
  onDismiss: () => void;
  onSelectDifferentLot: (lot: ParkingLocationLot) => void;
}

export const ParkingConfirmationModal: React.FC<Props> = ({
  session,
  candidateLots = [],
  isOpen,
  onConfirm,
  onDismiss,
  onSelectDifferentLot
}) => {
  const [selectedLeadMinutes, setSelectedLeadMinutes] = useState<number>(session.reminderMinutesBefore || 5);
  const [isChangingLot, setIsChangingLot] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentLot = session.lot;
  const isAmbiguous = candidateLots.length > 1;

  const handleCopyCode = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentLot.lotCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleApplyManualCode = () => {
    if (!manualCodeInput.trim()) return;
    const clean = manualCodeInput.trim().replace('#', '').toUpperCase();
    const found = DELINEATED_PARKING_ZONES.find(z => z.city === currentLot.city && (z.lotCode === clean || z.zoneNumber === clean));
    if (found) {
      onSelectDifferentLot(found);
    } else {
      const created = createManualParkingLot(clean, undefined, currentLot.city);
      onSelectDifferentLot(created);
    }
    setIsChangingLot(false);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border-2 border-gold p-5 sm:p-6 text-navy my-auto">
        
        {/* Header: Detection Badge & Close Button */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-gold flex items-center justify-center shrink-0 border border-gold/40 shadow-sm">
              <Car size={22} className="text-navy" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold text-slate-950 uppercase">
                4G OBD • ავტომატური ამოცნობა
              </span>
              <h3 className="text-base sm:text-lg font-black text-navy mt-0.5 leading-snug">
                ავტომობილი გაჩერდა — პარკირებაა?
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-navy flex items-center justify-center transition-colors border border-slate-200"
            title="დახურვა"
          >
            <X size={15} />
          </button>
        </div>

        {/* Ambiguity Warning if Multiple Candidates Nearby */}
        {isAmbiguous && !isChangingLot && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black">გაურკვეველი საზღვარი / ქუჩის მხარე:</span>
              <p className="text-[11px] leading-relaxed">
                თქვენს ლოკაციასთან ახლოს რამდენიმე საპარკინგე ლოტია. გთხოვთ გადაამოწმოთ ადგილზე საგზაო ნიშნის ნომერი.
              </p>
            </div>
          </div>
        )}

        {/* Main Details Card */}
        {!isChangingLot ? (
          <div className="my-4 space-y-3">
            {/* Vehicle & Plate */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">ავტომობილი:</span>
                <div className="text-sm font-black text-navy">{session.plateNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">გაჩერების დრო:</span>
                <div className="text-xs font-mono font-black text-slate-700">
                  {formatTbilisiTime(session.stoppedAt)} (თბილისი)
                </div>
              </div>
            </div>

            {/* Parking Lot Details */}
            <div className="p-4 rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-amber-50/50 to-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-navy text-gold font-mono font-black text-sm shadow-xs">
                    ლოტი #{currentLot.lotCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                    {currentLot.categoryLabel_ge}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-black text-navy">
                    {currentLot.hourlyRateGel !== null ? `${currentLot.hourlyRateGel.toFixed(2)} ₾ / სთ` : 'სტანდარტული'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-black text-navy">{currentLot.street_ge}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{currentLot.bounds_description_ge}</div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>პირველი 15 წუთი უფასოა</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors border border-slate-200"
                >
                  <Copy size={11} />
                  <span>{copiedCode ? 'კოპირებულია!' : 'კოდის კოპირება'}</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pt-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>მონაცემის წყარო: {currentLot.dataSource}</span>
              </div>
            </div>

            {/* Reminder Lead Time Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-navy flex items-center gap-1.5">
                  <Clock size={13} className="text-gold" />
                  <span>შეხსენების გაფრთხილება:</span>
                </span>
                <span className="text-[11px] font-bold text-amber-600 font-mono">
                  {selectedLeadMinutes} წუთით ადრე
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 10].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedLeadMinutes(mins);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedLeadMinutes === mins
                        ? 'bg-navy text-gold border-navy shadow-sm ring-1 ring-gold font-black'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {mins} წთ ადრე
                  </button>
                ))}
              </div>
            </div>

            {/* Operator Warning Note */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Info size={12} className="text-amber-500 shrink-0" />
                <span>მნიშვნელოვანი განმარტება:</span>
              </div>
              <p className="leading-relaxed">
                შიდა ტაიმერი წარმოადგენს შეხსენების სერვისს და არ ანაცვლებს მუნიციპალური პარკირების ოფიციალურ საფასურს.
              </p>
            </div>
          </div>
        ) : (
          /* Change Lot / Manual Entry Subview */
          <div className="my-4 space-y-3 animate-fade-in">
            <div className="text-xs font-black text-navy">
              აირჩიეთ სწორი ლოტი ან შეიყვანეთ ხელით:
            </div>

            {/* Manual Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="შეიყვანეთ ლოტის კოდი (მაგ: 005, 012)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <button
                type="button"
                onClick={handleApplyManualCode}
                className="px-4 py-2 rounded-xl bg-navy text-gold text-xs font-black shadow-xs hover:bg-slate-800 transition-colors"
              >
                არჩევა
              </button>
            </div>

            {/* Nearby Candidate Lots */}
            <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
              {candidateLots.map(lot => (
                <div
                  key={lot.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectDifferentLot(lot);
                    setIsChangingLot(false);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    lot.id === currentLot.id
                      ? 'bg-amber-50 border-gold/60 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-navy bg-white px-2 py-0.5 rounded border border-slate-200">
                      #{lot.lotCode}
                    </span>
                    <span className="truncate max-w-[200px] text-slate-800">{lot.street_ge}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsChangingLot(false)}
              className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              უკან დაბრუნება
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!isChangingLot && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onDismiss}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-navy text-xs font-bold transition-all text-center order-3 sm:order-1"
            >
              არ ვპარკირდები
            </button>

            <button
              type="button"
              onClick={() => setIsChangingLot(true)}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-navy text-xs font-bold transition-all text-center order-2"
            >
              სხვა ლოტი
            </button>

            <button
              type="button"
              onClick={() => onConfirm(selectedLeadMinutes)}
              className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs font-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 order-1 sm:order-3"
            >
              <CheckCircle2 size={15} />
              <span>ვადასტურებ პარკირებას</span>
            </button>
          </div>
        )}

        {/* Official Portal Outlink */}
        <div className="mt-3 pt-2 text-center">
          <a
            href="https://parking.tbilisi.gov.ge/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-400 hover:text-navy font-bold inline-flex items-center gap-1"
          >
            <span>თბილისის პარკინგის ოფიციალური პორტალი (parking.tbilisi.gov.ge)</span>
            <ExternalLink size={11} />
          </a>
        </div>

      </div>
    </div>
  );
};
