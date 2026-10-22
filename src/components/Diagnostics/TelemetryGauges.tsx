import React from 'react';
import { TelemetryData } from '../../types';
import { Activity, BatteryCharging, Gauge, Flame, Zap, Wind } from 'lucide-react';

interface Props {
  telemetry: TelemetryData;
}

export const TelemetryGauges: React.FC<Props> = ({ telemetry }) => {
  const rpmPercent = Math.min(Math.max(telemetry.rpm / 8000, 0), 1);
  const speedPercent = Math.min(Math.max(telemetry.speed / 260, 0), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. RPM Tachometer */}
      <div className="col-span-1 rounded-3xl neu-card p-4 flex flex-col items-center justify-between shadow-neu-card hover:scale-[1.02] transition-all">
        <div className="w-full flex items-center justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-gold" />
            RPM ბრუნი
          </span>
          <span className="font-mono text-[10px] text-navy bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            x1000
          </span>
        </div>

        <div className="relative w-28 h-28 my-2 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#E2E8F0"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset="62.8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#FCA311"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - rpmPercent * 188.4}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-black font-mono text-navy tracking-tight">
              {Math.round(telemetry.rpm)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">rpm</span>
          </div>
        </div>

        <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>0</span>
          <span className="text-gold font-bold">5k</span>
          <span className="text-rose-500">8k</span>
        </div>
      </div>

      {/* 2. Speed (km/h) */}
      <div className="col-span-1 rounded-3xl neu-card p-4 flex flex-col items-center justify-between shadow-neu-card hover:scale-[1.02] transition-all">
        <div className="w-full flex items-center justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-gold" />
            სიჩქარე
          </span>
          <span className="font-mono text-[10px] text-navy bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            GPS/OBD
          </span>
        </div>

        <div className="relative w-28 h-28 my-2 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#E2E8F0"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset="62.8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#14213D"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - speedPercent * 188.4}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black font-mono text-navy tracking-tight">
              {Math.round(telemetry.speed)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">კმ/სთ</span>
          </div>
        </div>

        <div className="w-full flex justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>0</span>
          <span>120</span>
          <span>260</span>
        </div>
      </div>

      {/* 3. Coolant Temperature */}
      <div className="col-span-1 rounded-3xl neu-card p-4 flex flex-col justify-between shadow-neu-card hover:scale-[1.02] transition-all overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold gap-2">
          <span className="flex items-center gap-1.5 truncate">
            <Flame className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>ანტიფრიზი</span>
          </span>
          <span className={`font-mono text-xs sm:text-sm font-extrabold shrink-0 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 ${telemetry.coolant_temp > 105 ? 'text-rose-600 bg-rose-50 border-rose-300 animate-pulse' : 'text-navy'}`}>
            {Math.round(telemetry.coolant_temp)}°C
          </span>
        </div>

        <div className="my-3 space-y-1.5">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${telemetry.coolant_temp > 105 ? 'bg-rose-500' : 'bg-gold'}`}
              style={{ width: `${Math.min(Math.max((Math.round(telemetry.coolant_temp) / 130) * 100, 10), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>50°C</span>
            <span>90°C</span>
            <span>130°C</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          სტატუსი: {telemetry.coolant_temp > 105 ? 'გადახურება' : 'ოპტიმალური'}
        </div>
      </div>

      {/* 4. Battery Voltage */}
      <div className="col-span-1 rounded-3xl neu-card p-4 flex flex-col justify-between shadow-neu-card hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-gold" />
            ბორტ-ძაბვა
          </span>
          <span className="font-mono text-xs font-bold text-navy">
            {telemetry.battery_voltage.toFixed(1)} V
          </span>
        </div>

        <div className="my-3 space-y-1.5">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full rounded-full bg-navy transition-all duration-500"
              style={{ width: `${Math.min(Math.max(((telemetry.battery_voltage - 10) / 5) * 100, 15), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>11.0V</span>
            <span>12.6V</span>
            <span>14.5V</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          გენერატორი: {telemetry.battery_voltage >= 13.5 ? 'მუხტავს' : 'სტენდბაი'}
        </div>
      </div>

      {/* 5. Fuel Trim */}
      <div className="col-span-1 rounded-3xl neu-card p-4 flex flex-col justify-between shadow-neu-card hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-gold" />
            Fuel Trims
          </span>
          <span className="font-mono text-[10px] text-navy font-bold">
            STFT/LTFT
          </span>
        </div>

        <div className="my-2 space-y-2">
          <div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Short-Term:</span>
              <span className="text-navy font-bold">
                {telemetry.fuel_trim_st > 0 ? `+${telemetry.fuel_trim_st}%` : `${telemetry.fuel_trim_st}%`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gold rounded-full"
                style={{ width: `${Math.min(Math.abs(telemetry.fuel_trim_st) * 4, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Long-Term:</span>
              <span className="text-gold font-bold">
                {telemetry.fuel_trim_lt > 0 ? `+${telemetry.fuel_trim_lt}%` : `${telemetry.fuel_trim_lt}%`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-navy rounded-full"
                style={{ width: `${Math.min(Math.abs(telemetry.fuel_trim_lt) * 4, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500">
          ნარევი: კომპენსირებს
        </div>
      </div>

      {/* 6. Throttle */}
      <div className="col-span-1 rounded-3xl neu-card p-4 flex flex-col justify-between shadow-neu-card hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-gold" />
            დროსელი & ჰაერი
          </span>
          <span className="font-mono text-xs font-bold text-navy">
            {Math.round(telemetry.throttle_position)}%
          </span>
        </div>

        <div className="my-2 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-slate-400">Intake Air:</span>
            <span className="text-navy font-bold">{Math.round(telemetry.intake_air_temp)}°C</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-slate-400">Throttle:</span>
            <span className="text-gold font-bold">{Math.round(telemetry.throttle_position)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${telemetry.throttle_position}%` }}
            />
          </div>
        </div>

        <div className="text-[10px] text-slate-500">
          სისტემა: ნორმა
        </div>
      </div>
    </div>
  );
};
