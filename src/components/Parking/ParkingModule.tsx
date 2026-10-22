import React, { useState, useEffect } from 'react';
import { VehicleProfile, ParkingFineItem, ActiveParkingSession, ParkingPermitItem } from '../../types';
import { sounds } from '../../services/soundEffects';
import {
  ParkingSquare,
  Timer,
  Play,
  Square,
  Sparkles,
  MapPin,
  Check,
  AlertTriangle,
  FileText,
  Building,
  Info,
  Clock,
  CreditCard,
  Car,
  BellRing,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  onUpdateVehicle?: (updated: Partial<VehicleProfile>) => void;
  onOpenFieldPrompt?: (field: 'plate_number') => void;
}

type SubTab = 'zone_parking' | 'parking_fines' | 'permits' | 'spots';

// Pre-seeded Initial Parking Fines in Georgia
const INITIAL_PARKING_FINES: ParkingFineItem[] = [
  {
    id: 'pk_tf_102',
    city: 'tbilisi',
    fine_type: 'zone_overtime',
    title_ge: 'ზონალური პარკირების საფასურის გადაუხდელობა (15 წთ გადაცილება)',
    amount_gel: 10,
    penalty_date: '2026-10-18',
    due_days_left: 22,
    status: 'pending',
    location: 'თბილისი, ი. ჭავჭავაძის გამზ. #34 (ზონა A)',
    ticket_number: 'TB-PK-98124'
  },
  {
    id: 'pk_tf_103',
    city: 'tbilisi',
    fine_type: 'sidewalk',
    title_ge: 'არასწორი პარკირება (ქვეითთა გადასასვლელთან 5 მეტრის დაუცველობა)',
    amount_gel: 50,
    penalty_date: '2026-10-12',
    due_days_left: 14,
    status: 'pending',
    location: 'თბილისი, ალ. ყაზბეგის გამზ. #14',
    ticket_number: 'TB-PK-95411'
  },
  {
    id: 'pk_batumi_101',
    city: 'batumi',
    fine_type: 'illegal_parking',
    title_ge: 'ბათუმის მუნიციპალური პარკირების წესის დარღვევა',
    amount_gel: 10,
    penalty_date: '2026-09-28',
    due_days_left: 0,
    status: 'paid',
    location: 'ბათუმი, რუსთაველის ქუჩა #12',
    ticket_number: 'BAT-PK-4421'
  }
];

// Pre-seeded Parking Permits in Georgia
const INITIAL_PERMITS: ParkingPermitItem[] = [
  {
    id: 'pm_tb_annual',
    title_ge: 'თბილისის მუნიციპალური წლიური აბონემენტი',
    city: 'tbilisi',
    permitType: 'annual_standard',
    cost_gel: 50,
    expiryDate: '2027-04-15',
    isActive: true,
    plateNumber: 'GE-777-AA'
  },
  {
    id: 'pm_tb_resident',
    title_ge: 'ადგილობრივი მაცხოვრებლის უფასო საშვი (ჭავჭავაძის #34, 100მ რადიუსი)',
    city: 'tbilisi',
    permitType: 'resident_free',
    cost_gel: 0,
    expiryDate: '2027-10-21',
    isActive: true,
    plateNumber: 'GE-777-AA'
  },
  {
    id: 'pm_batumi_annual',
    title_ge: 'ბათუმის ავტოტრანსპორტის წლიური პარკირება',
    city: 'batumi',
    permitType: 'batumi_annual',
    cost_gel: 40,
    expiryDate: '2026-12-31',
    isActive: false,
    plateNumber: 'GE-777-AA'
  }
];

// Commercial / Airport Garage Parking Spots & Rates in Georgia
const COMMERCIAL_PARKING_SPOTS = [
  {
    id: 'spot_orbeliani',
    name_ge: 'ორბელიანის მიწისქვეშა მუნიციპალური პარკინგი',
    operator_ge: 'თბილისის მერია (ტრანსპორტის სააგენტო)',
    address: 'ორბელიანის მოედანი, თბილისი',
    hourlyRateGel: 1.0,
    freeMinutes: 15,
    availableSpaces: 214,
    totalSpaces: 350,
    isOpen24h: true,
    evCharging: true
  },
  {
    id: 'spot_galleria',
    name_ge: 'Galleria Tbilisi მიწისქვეშა პარკინგი',
    operator_ge: 'Galleria Mall (City Center)',
    address: 'შოთა რუსთაველის გამზ. #2/4',
    hourlyRateGel: 3.0,
    freeMinutes: 0,
    availableSpaces: 142,
    totalSpaces: 300,
    isOpen24h: true,
    evCharging: true
  },
  {
    id: 'spot_airport',
    name_ge: 'თბილისის საერთაშორისო აეროპორტის პარკინგი',
    operator_ge: 'TAV Georgia (Airport Parking)',
    address: 'თბილისის საერთაშორისო აეროპორტი',
    hourlyRateGel: 3.5,
    freeMinutes: 10,
    availableSpaces: 380,
    totalSpaces: 1000,
    isOpen24h: true,
    evCharging: false
  },
  {
    id: 'spot_citymall',
    name_ge: 'City Mall საბურთალოს პარკინგი',
    operator_ge: 'City Mall Saburtalo',
    address: 'ვაჟა-ფშაველას გამზ. #70',
    hourlyRateGel: 2.0,
    freeMinutes: 30,
    availableSpaces: 95,
    totalSpaces: 650,
    isOpen24h: false,
    evCharging: true
  },
  {
    id: 'spot_tb_mall',
    name_ge: 'Tbilisi Mall პარკინგი',
    operator_ge: 'Tbilisi Mall Dighomi',
    address: 'დ. აღმაშენებლის ხეივანი მე-16 კმ',
    hourlyRateGel: 0.0,
    freeMinutes: 999,
    availableSpaces: 1250,
    totalSpaces: 2500,
    isOpen24h: false,
    evCharging: true
  }
];

export const ParkingModule: React.FC<Props> = ({
  vehicle,
  onUpdateVehicle,
  onOpenFieldPrompt
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('zone_parking');
  const [simulatedPaymentId, setSimulatedPaymentId] = useState<string | null>(null);

  // Municipal Parking Fines State
  const [parkingFines, setParkingFines] = useState<ParkingFineItem[]>(() => {
    try {
      const saved = localStorage.getItem('autohub_parking_fines');
      return saved ? JSON.parse(saved) : INITIAL_PARKING_FINES;
    } catch {
      return INITIAL_PARKING_FINES;
    }
  });

  // Live Zone Parking Session State
  const [selectedCity, setSelectedCity] = useState<'tbilisi' | 'batumi' | 'kutaisi'>('tbilisi');
  const [selectedZone, setSelectedZone] = useState<'zone_a' | 'zone_b' | 'zone_c' | 'batumi_center'>('zone_a');
  const [parkingLocationInput, setParkingLocationInput] = useState('ი. ჭავჭავაძის გამზ. #34 (ვაკე)');

  const [activeSession, setActiveSession] = useState<ActiveParkingSession>(() => {
    try {
      const saved = localStorage.getItem('autohub_active_parking_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isActive) {
          return parsed;
        }
      }
    } catch {}
    return {
      isActive: false,
      city: 'tbilisi',
      zone: 'zone_a',
      zoneName_ge: 'ზონა A (1.00 ₾/სთ)',
      hourlyRateGel: 1.0,
      startTime: 0,
      elapsedSeconds: 0,
      accumulatedCostGel: 0,
      isFree15MinActive: true,
      freeMinRemaining: 15,
      plateNumber: vehicle.plate_number || 'GE-777-AA'
    };
  });

  // Parking Permits State
  const [permits, setPermits] = useState<ParkingPermitItem[]>(() => {
    try {
      const saved = localStorage.getItem('autohub_parking_permits');
      return saved ? JSON.parse(saved) : INITIAL_PERMITS;
    } catch {
      return INITIAL_PERMITS;
    }
  });

  // Ticket Search State
  const [searchTicketNumber, setSearchTicketNumber] = useState('');
  const [ticketSearchSuccess, setTicketSearchSuccess] = useState<string | null>(null);

  // Keep live parking stopwatch running
  useEffect(() => {
    let timer: any;
    if (activeSession.isActive && activeSession.startTime > 0) {
      timer = setInterval(() => {
        const now = Date.now();
        const elapsedSec = Math.max(0, Math.floor((now - activeSession.startTime) / 1000));
        const elapsedMin = Math.floor(elapsedSec / 60);

        // Free 15 min rule calculation
        const freeRem = Math.max(0, 15 - elapsedMin);
        const billableHours = elapsedMin > 15 ? Math.ceil((elapsedMin - 15) / 60) : 0;
        const currentCost = billableHours * activeSession.hourlyRateGel;

        setActiveSession(prev => {
          const updated = {
            ...prev,
            elapsedSeconds: elapsedSec,
            accumulatedCostGel: currentCost,
            isFree15MinActive: freeRem > 0,
            freeMinRemaining: freeRem
          };
          try {
            localStorage.setItem('autohub_active_parking_session', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession.isActive, activeSession.startTime, activeSession.hourlyRateGel]);

  // Persist parking fines and permits
  useEffect(() => {
    try {
      localStorage.setItem('autohub_parking_fines', JSON.stringify(parkingFines));
    } catch {}
  }, [parkingFines]);

  useEffect(() => {
    try {
      localStorage.setItem('autohub_parking_permits', JSON.stringify(permits));
    } catch {}
  }, [permits]);

  // Handlers for Municipal Parking Fines
  const handlePayParkingFine = (fineId: string) => {
    sounds.playSuccess();
    setSimulatedPaymentId(fineId);
    setTimeout(() => {
      setParkingFines(parkingFines.map(pf => pf.id === fineId ? { ...pf, status: 'paid' } : pf));
      setSimulatedPaymentId(null);
    }, 1200);
  };

  const handleSearchParkingFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketNumber.trim()) return;
    sounds.playScanSweep();

    const found = parkingFines.find(pf => pf.ticket_number.toLowerCase().includes(searchTicketNumber.trim().toLowerCase()));
    if (found) {
      setTicketSearchSuccess(`ქვითარი #${found.ticket_number} ნაპოვნია: ${found.title_ge} (${found.amount_gel} ₾).`);
      sounds.playSuccess();
    } else {
      const newFine: ParkingFineItem = {
        id: `pk_${Date.now()}`,
        city: 'tbilisi',
        fine_type: 'zone_overtime',
        title_ge: 'თბილისის სატრანსპორტო სააგენტო — ზონალური გადაუხდელობა',
        amount_gel: 10,
        penalty_date: new Date().toISOString().split('T')[0],
        due_days_left: 30,
        status: 'pending',
        location: 'თბილისი, მუნიციპალური ზონა',
        ticket_number: searchTicketNumber.toUpperCase()
      };
      setParkingFines([newFine, ...parkingFines]);
      setTicketSearchSuccess(`ქვითარი #${newFine.ticket_number} წარმატებით ამოიკითხა თბილისის სატრანსპორტო ბაზიდან.`);
      sounds.playSuccess();
    }
    setTimeout(() => setTicketSearchSuccess(null), 4000);
  };

  // Handlers for Live Zone Parking
  const handleStartParking = () => {
    sounds.playScanSweep();
    const rate = selectedZone === 'zone_a' ? 1.0 : selectedZone === 'zone_b' ? 2.0 : selectedZone === 'zone_c' ? 3.0 : 1.0;
    const zName = selectedZone === 'zone_a' ? 'ზონა A (1.00 ₾/სთ)' : selectedZone === 'zone_b' ? 'ზონა B (2.00 ₾/სთ)' : selectedZone === 'zone_c' ? 'ზონა C (3.00 ₾/სთ)' : 'ბათუმის ცენტრი (1.00 ₾/სთ)';

    const newSession: ActiveParkingSession = {
      isActive: true,
      city: selectedCity,
      zone: selectedZone,
      zoneName_ge: zName,
      hourlyRateGel: rate,
      startTime: Date.now(),
      elapsedSeconds: 0,
      accumulatedCostGel: 0,
      isFree15MinActive: true,
      freeMinRemaining: 15,
      plateNumber: vehicle.plate_number || 'GE-777-AA'
    };

    setActiveSession(newSession);
    try {
      localStorage.setItem('autohub_active_parking_session', JSON.stringify(newSession));
    } catch {}
  };

  const handleStopParking = () => {
    sounds.playSuccess();
    const finalCost = activeSession.accumulatedCostGel;
    const finalElapsedMin = Math.ceil(activeSession.elapsedSeconds / 60);

    alert(`პარკირების სესია დასრულებულია!\nავტომობილი: ${vehicle.plate_number}\nხანგრძლივობა: ${finalElapsedMin} წთ.\nგადასახდელი თანხა: ${finalCost.toFixed(2)} ₾.\nსაფასური წარმატებით გადახდილია!`);

    const resetSession: ActiveParkingSession = {
      ...activeSession,
      isActive: false,
      startTime: 0,
      elapsedSeconds: 0,
      accumulatedCostGel: 0
    };
    setActiveSession(resetSession);
    try {
      localStorage.removeItem('autohub_active_parking_session');
    } catch {}
  };

  // Handler for Permits
  const handleTogglePermit = (permitId: string) => {
    sounds.playClick();
    setPermits(permits.map(p => {
      if (p.id === permitId) {
        const nextState = !p.isActive;
        if (nextState) sounds.playSuccess();
        return { ...p, isActive: nextState };
      }
      return p;
    }));
  };

  const pendingParkingFines = parkingFines.filter(f => f.status === 'pending');
  const totalPendingParking = pendingParkingFines.reduce((acc, f) => acc + f.amount_gel, 0);

  // Format stopwatch MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header Banner & Plate Overview */}
      <div className="p-6 rounded-3xl neu-card shadow-neu-card flex flex-wrap items-center justify-between gap-6 border border-white">
        <div className="flex items-center gap-4">
          {/* Georgia Car License Plate */}
          <div className="px-5 py-3 rounded-2xl bg-white text-navy font-black font-mono border-2 border-slate-200 shadow-sm flex items-center gap-3.5 tracking-widest text-lg sm:text-xl shrink-0">
            <div className="flex flex-col items-center justify-center pr-2.5 border-r border-slate-200 text-xs font-bold text-blue-700">
              <span>🇬🇪</span>
              <span className="text-[10px]">GE</span>
            </div>
            <span>{vehicle.plate_number || 'GE-777-AA'}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-navy flex items-center gap-2">
                <ParkingSquare className="w-5 h-5 text-gold" />
                საპარკინგე სერვისები (საქართველო)
              </h2>
              {activeSession.isActive && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  LIVE პარკინგი
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>თბილისის ზონალური პარკირება (A/B/C)</span>
              <span>•</span>
              <span>ბათუმი & ქუთაისი</span>
              <span>•</span>
              <span>აბონემენტები & საურავები</span>
            </p>
          </div>
        </div>

        {/* Fines Summary */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">საპარკინგე ჯარიმები:</span>
            <span className={`text-2xl font-black font-mono ${totalPendingParking > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {totalPendingParking} ₾
            </span>
          </div>

          {totalPendingParking > 0 && (
            <span className="px-3 py-1.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>{pendingParkingFines.length} ჯარიმა</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. SUB-TAB SWITCHER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('zone_parking');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'zone_parking'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <Timer size={15} />
          <span>ცოცხალი ზონალური პარკირება</span>
          {activeSession.isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('parking_fines');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'parking_fines'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <FileText size={15} />
          <span>საპარკინგე ჯარიმები & საურავები</span>
          {pendingParkingFines.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
              {pendingParkingFines.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('permits');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'permits'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <Sparkles size={15} />
          <span>აბონემენტები & საშვები</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('spots');
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'spots'
              ? 'bg-navy text-gold shadow-sm scale-105'
              : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
          }`}
        >
          <Building size={15} />
          <span>მოლები & აეროპორტი</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: LIVE ZONE PARKING TIMER ================= */}
      {activeSubTab === 'zone_parking' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Active Live Parking Stopwatch Card */}
          {activeSession.isActive ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-navy to-slate-900 text-white shadow-xl border-2 border-gold/40 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    აქტიური პარკირების სესია (LIVE)
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-gold border border-white/15">
                  {activeSession.plateNumber}
                </span>
              </div>

              <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                {/* Timer Display */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                    გასული დრო (Stopwatch):
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-gold drop-shadow-sm">
                    {formatTime(activeSession.elapsedSeconds)}
                  </div>
                </div>

                {/* Free Period Notice or Cost */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  {activeSession.isFree15MinActive ? (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                        ✔ 15-წუთიანი უფასო საშეღავათო რეჟიმი
                      </span>
                      <p className="text-xs text-slate-300">
                        დარჩა: <strong className="font-mono text-white">{activeSession.freeMinRemaining} წუთი</strong> უფასოდ.
                      </p>
                      <span className="text-xl font-black font-mono text-emerald-400 mt-1 block">
                        0.00 ₾
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-300 block mb-1">
                        საფასური ({activeSession.hourlyRateGel.toFixed(2)} ₾/სთ)
                      </span>
                      <span className="text-3xl font-black font-mono text-white">
                        {activeSession.accumulatedCostGel.toFixed(2)} ₾
                      </span>
                    </div>
                  )}
                </div>

                {/* Stop & Pay Button */}
                <div className="flex flex-col justify-center">
                  <button
                    onClick={handleStopParking}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Square size={16} className="fill-white" />
                    <span>პარკირების შეჩერება & გადახდა</span>
                  </button>
                  <span className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                    {activeSession.zoneName_ge}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Start Parking Control Center */
            <div className="p-6 rounded-3xl neu-card shadow-neu-card border border-white space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm">
                    <Timer className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-navy">
                      ზონალური საათობრივი პარკირების დაწყება
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      თბილისის სატრანსპორტო სააგენტოს & ბათუმის მუნიციპალური სისტემა
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  🇬🇪 პირველი 15 წთ უფასოა
                </span>
              </div>

              {/* City Selector */}
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                  1. აირჩიეთ ქალაქი:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'tbilisi' as const, label: '🏛️ თბილისი (Tbilisi)' },
                    { id: 'batumi' as const, label: '🌊 ბათუმი (Batumi)' },
                    { id: 'kutaisi' as const, label: '📍 ქუთაისი (Kutaisi)' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedCity(c.id);
                      }}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                        selectedCity === c.id
                          ? 'bg-navy text-gold shadow-sm font-black'
                          : 'bg-white hover:bg-slate-50 text-navy border border-slate-200'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone Selector */}
              {selectedCity === 'tbilisi' ? (
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                    2. აირჩიეთ თბილისის პარკირების ზონა:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'zone_a' as const,
                        name: 'ზონა A',
                        rate: '1.00 ₾ / სთ',
                        areas: 'ვაკე, ვერა, მთაწმინდა, საბურთალო',
                        badge: 'ცენტრი'
                      },
                      {
                        id: 'zone_b' as const,
                        name: 'ზონა B',
                        rate: '2.00 ₾ / სთ',
                        areas: 'ჩუღურეთი, დიდუბე, ისანი',
                        badge: 'საშუალო'
                      },
                      {
                        id: 'zone_c' as const,
                        name: 'ზონა C',
                        rate: '3.00 ₾ / სთ',
                        areas: 'ავჭალა, გლდანი, სამგორი',
                        badge: 'გარეუბანი'
                      }
                    ].map(z => {
                      const isSel = selectedZone === z.id;
                      return (
                        <div
                          key={z.id}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedZone(z.id);
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSel
                              ? 'bg-navy text-white border-navy shadow-md scale-[1.02]'
                              : 'bg-white hover:bg-slate-50 text-navy border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-sm">{z.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isSel ? 'bg-gold text-navy' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {z.rate}
                            </span>
                          </div>
                          <p className={`text-[11px] ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>
                            {z.areas}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-navy block text-sm">
                      {selectedCity === 'batumi' ? 'ბათუმის მუნიციპალური ზონა' : 'ქუთაისის მუნიციპალური ზონა'}
                    </span>
                    <span className="text-slate-500">ტარიფი: 1.00 ₾ / საათი</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                    აქტიურია
                  </span>
                </div>
              )}

              {/* Quick Location Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  პარკირების ლოკაცია / ქუჩა:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'ი. ჭავჭავაძის #34 (ვაკე)',
                    'ალ. ყაზბეგის #14 (საბურთალო)',
                    'შ. რუსთაველის #2',
                    'დ. აღმაშენებლის #72',
                    'პეკინის #5'
                  ].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setParkingLocationInput(loc)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        parkingLocationInput === loc
                          ? 'bg-navy text-gold shadow-sm'
                          : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={parkingLocationInput}
                  onChange={(e) => setParkingLocationInput(e.target.value)}
                  placeholder="მაგ: ვაკე, ჭავჭავაძის #34"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                />
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartParking}
                  className="w-full py-4 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-sm shadow-gold-soft flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Play size={18} className="fill-navy" />
                  <span>პარკირების დაწყება (Live Timer ჩართვა)</span>
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-mono">
                  ავტომობილი: <strong className="text-navy">{vehicle.plate_number}</strong> • პირველი 15 წუთი უფასოა!
                </p>
              </div>
            </div>
          )}

          {/* Legal 15 Min Info Box */}
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-300/40 text-xs text-navy flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-950 font-bold mb-0.5">
                საქართველოს კანონმდებლობა ზონალურ პარკირებაზე:
              </strong>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                თბილისის მუნიციპალიტეტის დადგენილებით, ზონალურ-საათობრივ პარკირებაზე თითოეულ ავტომობილს ეძლევა <strong>15 უფასო წუთი</strong> დღეში 4-ჯერ. 15 წუთის ამოწურვის შემდეგ სისტემა ავტომატურად იწყებს საათობრივი ტარიფის დათვლას.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: MUNICIPAL PARKING FINES ================= */}
      {activeSubTab === 'parking_fines' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Municipal Ticket Search Form */}
          <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-gold" />
                <span>მუნიციპალური პარკირების ქვითრის ძებნა & შემოწმება</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                თბილისი • ბათუმი • ქუთაისი
              </span>
            </div>

            <form onSubmit={handleSearchParkingFine} className="flex gap-2">
              <input
                type="text"
                value={searchTicketNumber}
                onChange={(e) => setSearchTicketNumber(e.target.value)}
                placeholder="შეიყვანეთ ქვითრის # (მაგ: TB-PK-98124)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-navy hover:bg-slate-800 text-gold font-bold text-xs shrink-0 transition-all shadow-sm"
              >
                ქვითრის შემოწმება
              </button>
            </form>

            {ticketSearchSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 animate-fade-in">
                {ticketSearchSuccess}
              </p>
            )}
          </div>

          {/* Sauravi 150 GEL Warning Alert Banner */}
          {pendingParkingFines.length > 0 && (
            <div className="p-4 rounded-3xl bg-rose-500/10 border-2 border-rose-400/60 flex items-center justify-between gap-3 text-xs animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="font-extrabold text-navy flex items-center gap-2">
                    <span>150 ₾-იანი საურავის გაფრთხილება:</span>
                    <span className="text-rose-700 font-mono font-black">
                      სულ გადასახდელია {totalPendingParking} ₾
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    პარკირების 10₾/50₾-იანი ჯარიმის 30 დღეში გადაუხდელობის შემთხვევაში ერიცხება <strong>150 ₾ საურავი</strong>!
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-mono font-bold text-xs shrink-0">
                ვადა: 30 დღე
              </span>
            </div>
          )}

          {/* Parking Fines Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parkingFines.map(fine => {
              const isPaid = fine.status === 'paid';
              return (
                <div
                  key={fine.id}
                  className={`p-5 rounded-3xl neu-card shadow-neu-card border border-white transition-all flex flex-col justify-between ${
                    isPaid ? 'opacity-60' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-navy text-gold text-[10px] font-mono font-bold">
                          {fine.city === 'tbilisi' ? '🇬🇪 თბილისი' : '🌊 ბათუმი'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          #{fine.ticket_number}
                        </span>
                      </div>

                      {isPaid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          ✔ გადახდილია
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-700">
                          დარჩა {fine.due_days_left} დღე
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-navy mb-1.5 leading-snug">
                      {fine.title_ge}
                    </h4>

                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mb-3 flex items-center gap-1.5">
                      <MapPin size={13} className="text-gold shrink-0" />
                      <span className="truncate">{fine.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">ჯარიმის ოდენობა:</span>
                      <span className="text-2xl font-black font-mono text-navy">
                        {fine.amount_gel} ₾
                      </span>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => handlePayParkingFine(fine.id)}
                        disabled={simulatedPaymentId === fine.id}
                        className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gold hover:bg-amber-400 text-navy shadow-gold-soft transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <CreditCard size={14} />
                        <span>{simulatedPaymentId === fine.id ? 'მუშავდება...' : 'გადახდა (1-კლიკი)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: PARKING PERMITS & PASSES ================= */}
      {activeSubTab === 'permits' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-2">
            <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
              <Sparkles size={16} className="text-gold" />
              <span>პარკირების ოფიციალური აბონემენტები და მაცხოვრებლის საშვები</span>
            </h3>
            <p className="text-xs text-slate-500">
              ავტომობილის სახელმწიფო ნომერზე ({vehicle.plate_number}) მიბმული მოქმედი აბონემენტები
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permits.map(permit => (
              <div
                key={permit.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {permit.city === 'tbilisi' ? 'თბილისი' : 'ბათუმი'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      permit.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {permit.isActive ? '● აქტიურია' : 'შეჩერებულია'}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-navy leading-snug">
                    {permit.title_ge}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    ვადა: {permit.expiryDate}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black font-mono text-navy">
                    {permit.cost_gel === 0 ? 'უფასო (0 ₾)' : `${permit.cost_gel} ₾ / წელი`}
                  </span>

                  <button
                    onClick={() => handleTogglePermit(permit.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      permit.isActive
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-navy text-gold hover:bg-slate-800'
                    }`}
                  >
                    {permit.isActive ? 'გამორთვა' : 'გააქტიურება'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: COMMERCIAL / MALL & AIRPORT SPOTS ================= */}
      {activeSubTab === 'spots' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-3xl neu-card shadow-neu-card border border-white">
            <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
              <Building size={16} className="text-gold" />
              <span>სავაჭრო მოლების, მიწისქვეშა ავტოფარეხებისა და აეროპორტის ტარიფები</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              რეალური ტარიფები და ცოცხალი თავისუფალი ადგილები საქართველოში
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMERCIAL_PARKING_SPOTS.map(spot => (
              <div key={spot.id} className="p-5 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-navy">{spot.name_ge}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{spot.operator_ge}</span>
                  </div>
                  <span className="text-lg font-black font-mono text-navy bg-gold/15 px-2.5 py-0.5 rounded-xl text-amber-900 border border-gold/30">
                    {spot.hourlyRateGel === 0 ? 'უფასო' : `${spot.hourlyRateGel.toFixed(2)} ₾ / სთ`}
                  </span>
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <MapPin size={13} className="text-gold shrink-0" />
                  <span>{spot.address}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-500">თავისუფალი:</span>
                    <span className="font-black text-emerald-700">{spot.availableSpaces} / {spot.totalSpaces}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-500">24/7 რეჟიმი:</span>
                    <span className="font-bold text-navy">{spot.isOpen24h ? '✔ კი' : '23:00-მდე'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ParkingModule;
