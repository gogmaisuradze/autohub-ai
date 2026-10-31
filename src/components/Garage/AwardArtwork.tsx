import React, { useState } from 'react';

export function AwardArtwork({ level, place, label, className = 'w-20 h-20', locked = false, fallback = '🏅' }: { level?: number; place?: number; label: string; className?: string; locked?: boolean; fallback?: string }) {
  const [failed, setFailed] = useState(false);
  const index = place !== undefined ? (place === 1 ? 9 : place === 2 ? 10 : place === 3 ? 11 : 12) : Math.max(0, Math.min(8, (level || 1) - 1));
  return <span role="img" aria-label={label} className={`relative inline-block shrink-0 overflow-hidden ${className} ${locked ? 'opacity-40 grayscale' : ''}`}>
    {failed ? <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-3xl">{fallback}</span> : <img src={`${import.meta.env.BASE_URL}images/exam-awards/awards-3d-v1.png`} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} style={{ position: 'absolute', width: '500%', height: '300%', maxWidth: 'none', left: `${-(index % 5) * 100}%`, top: `${-Math.floor(index / 5) * 100}%` }} />}
  </span>;
}
