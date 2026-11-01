import React from 'react';

export const CAR_POSTER_URL = `${import.meta.env.BASE_URL}models/bmw-poster.png`;

export function CarScenePoster({
  hidden = false,
  message = '3D მოდელი იტვირთება…',
  className = ''
}: {
  hidden?: boolean;
  message?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden={hidden}
      className={`absolute inset-0 z-10 overflow-hidden pointer-events-none transition-opacity duration-500 motion-reduce:transition-none ${
        hidden ? 'opacity-0' : 'opacity-100'
      } ${className}`}
    >
      {!hidden && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          <span
            role="status"
            aria-live="polite"
            className="whitespace-nowrap rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white/90 border border-white/10 shadow-lg tracking-wide"
          >
            {message}
          </span>
        </div>
      )}
    </div>
  );
}
