import React, { useState } from 'react';
import { obdWifiService, ObdScanResult } from '../../services/obdWifiService';
import { Wifi, Loader2, CheckCircle, AlertTriangle, Smartphone, Upload } from 'lucide-react';

// CarMe — WiFi ELM327 პირდაპირი სკანი (ნატიურ აპში).
// ბრაუზერში transport მიუწვდომელია → ინფო-ბანერი „მხოლოდ აპში".
export const ObdWifiScan: React.FC = () => {
  const available = obdWifiService.isAvailable();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'scanning' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<ObdScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = obdWifiService.getQueue().filter(r => !r.synced).length;

  const handleScan = async () => {
    setError(null);
    setResult(null);
    try {
      if (!obdWifiService.isConnected()) {
        setStatus('connecting');
        await obdWifiService.connect();
      }
      setStatus('scanning');
      const r = await obdWifiService.scan();
      setResult(r);
      setStatus('done');
    } catch (e: any) {
      setError(e?.message || 'დაკავშირება ვერ მოხერხდა');
      setStatus('error');
    }
  };

  if (!available) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-navy">WiFi-ით პირდაპირი სკანი</strong> ხელმისაწვდომია მხოლოდ
          <strong> CarMe აპში</strong> (iOS/Android). ბრაუზერში OBD ადაპტერთან კავშირი შეუძლებელია.
        </div>
      </div>
    );
  }

  const busy = status === 'connecting' || status === 'scanning';

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Wifi className="w-4 h-4 text-gold" />
        <span className="text-sm font-black text-navy">პირდაპირი WiFi სკანი (ELM327)</span>
      </div>

      <button
        type="button"
        onClick={handleScan}
        disabled={busy}
        className="btn-stitch-navy w-full py-3 px-4 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <Wifi className="w-4 h-4 text-gold" />}
        <span>
          {status === 'connecting' ? 'დაკავშირება...'
            : status === 'scanning' ? 'სკანირება...'
            : 'სკანი WiFi-ით'}
        </span>
      </button>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>სკანი დასრულდა</span>
          </div>
          {result.vin && (
            <div className="text-[11px] font-mono text-slate-500">VIN: {result.vin}</div>
          )}
          <div className="text-xs text-navy">
            ხარვეზის კოდები: <strong>{result.dtcs.length}</strong>
            {result.dtcs.length > 0 && (
              <span className="font-mono text-rose-600"> ({result.dtcs.map(d => d.code).join(', ')})</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
            <span>RPM: {result.live.rpm ?? '—'}</span>
            <span>ტემპ: {result.live.coolantC != null ? `${result.live.coolantC}°C` : '—'}</span>
            <span>სიჩქარე: {result.live.speedKmh != null ? `${result.live.speedKmh} კმ/სთ` : '—'}</span>
            <span>ძაბვა: {result.live.voltage != null ? `${result.live.voltage}V` : '—'}</span>
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-gold" />
          <span>რიგში {pendingCount} სკანი — ინტერნეტზე ავტომატურად გაიგზავნება ანალიზისთვის</span>
        </div>
      )}
    </div>
  );
};
