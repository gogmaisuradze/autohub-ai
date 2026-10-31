import React from 'react';

/** Shared cached atlas for decorative dashboard artwork. */
export const CoinArtwork: React.FC<{ index: number; collection?: 'actions' | 'details'; className?: string }> = ({ index, collection = 'actions', className = 'w-20 h-20 sm:w-24 sm:h-24' }) => {
  const columns = collection === 'actions' ? 4 : 3;
  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105 ${className}`}>
      <img src={`${import.meta.env.BASE_URL}images/icons/${collection === 'actions' ? 'dashboard-coins-v1' : 'dashboard-details-v1'}.png`} alt="" loading="lazy" decoding="async" draggable={false}
        className="absolute max-w-none pointer-events-none"
        style={{ width: `${columns * 100}%`, height: '300%', left: `${-(index % columns) * 100}%`, top: `${-Math.floor(index / columns) * 100}%` }} />
    </span>
  );
};
