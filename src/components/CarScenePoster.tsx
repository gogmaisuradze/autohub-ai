import React from 'react';

export const CAR_POSTER_URL = `${import.meta.env.BASE_URL}models/bmw-poster.png`;

export function CarScenePoster({hidden = false, message = '3D მოდელი იტვირთება…', className = ''}: {hidden?:boolean; message?:string; className?:string}) {
  return <div aria-hidden={hidden} className={`absolute inset-0 z-10 overflow-hidden bg-[#05070b] pointer-events-none transition-opacity duration-500 motion-reduce:transition-none ${hidden ? 'opacity-0' : 'opacity-100'} ${className}`}>
    <img src={CAR_POSTER_URL} alt="ავტომობილის საწყისი ფოტო" width={388} height={538} loading="eager" fetchPriority="high" className="h-full w-full object-contain" />
    {!hidden && <span role="status" aria-live="polite" className="absolute bottom-10 left-1/2 -translate-x-1/2 max-w-[90%] whitespace-nowrap rounded-full bg-slate-950/85 px-3 py-2 text-xs text-white border border-white/15">{message}</span>}
  </div>;
}
