import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    sounds.playClick();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-4 rounded-3xl bg-dark-900 border border-cyan-500/40 shadow-glow-cyan animate-bounce-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-neon flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">დააინსტალირეთ AutoHub AI</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              დაამატეთ ეკრანზე PWA აპლიკაციის სახით ოფლაინ დიაგნოსტიკისთვის
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBanner(false)}
          className="text-slate-500 hover:text-white text-xs"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-neon hover:bg-cyan-400 text-black shadow-glow-cyan transition-all"
        >
          ეკრანზე დამატება
        </button>
      </div>
    </div>
  );
};
