import React, { useState } from 'react';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessClear: () => void;
  vehicleId: string;
}

export const ClearDtcModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccessClear,
  vehicleId
}) => {
  const [isClearing, setIsClearing] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  if (!isOpen) return null;

  // Allow closing via Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClearing) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isClearing]);

  const handleConfirmClear = async () => {
    if (!confirmationChecked) return;
    setIsClearing(true);
    sounds.playClick();

    try {
      await n8nService.clearCodes(vehicleId);
      sounds.playClearChime();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onSuccessClear();
      onClose();
    } catch (e) {
      sounds.playAlert();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && !isClearing) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl neu-card p-6 shadow-2xl space-y-4 cursor-default"
      >
        {/* Warning Icon & Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full neu-circle flex items-center justify-center text-rose-500 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-navy">
              Check Engine შეცდომების წაშლა (Clear DTC)
            </h3>
            <span className="text-xs font-mono text-gold font-bold">OBD-II Mode 04 Command</span>
          </div>
        </div>

        {/* Safety Warning Body */}
        <div className="p-4 rounded-2xl neu-inset text-xs text-slate-700 space-y-2 leading-relaxed">
          <p className="font-bold text-rose-600 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            გაფრთხილება უსაფრთხოების შესახებ:
          </p>
          <p>
            შეცდომების წაშლა აქრობს „ჩეკის“ ნათურას და ასუფთავებს ბორტ-კომპიუტერის ადაპტაციურ მეხსიერებას (Fuel Trims, Freeze Frame).
          </p>
          <p className="text-slate-500">
            თუ ფიზიკური გაუმართაობა არ არის აღმოფხვრილი, ჩეკი ხელახლა აინთება რამდენიმე კილომეტრის გავლის შემდეგ.
          </p>
        </div>

        {/* Checkbox confirmation */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl neu-inset cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmationChecked}
            onChange={(e) => setConfirmationChecked(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-gold focus:ring-gold w-4 h-4"
          />
          <span className="text-xs text-navy font-medium">
            ვაცნობიერებ რისკებს და მსურს DTC კოდების განულება ავტომობილის კომპიუტერში.
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            disabled={isClearing}
            className="px-4 py-2 rounded-xl text-xs font-bold neu-btn text-slate-600 hover:text-navy"
          >
            გაუქმება
          </button>

          <button
            onClick={handleConfirmClear}
            disabled={!confirmationChecked || isClearing}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              confirmationChecked && !isClearing
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:scale-105 active:scale-95'
                : 'neu-inset text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isClearing ? 'იშლება...' : 'ჩეკის ჩაქრობა (04)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
