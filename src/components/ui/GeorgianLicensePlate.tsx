import React from 'react';

interface Props {
  plate: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'white' | 'standard';
  className?: string;
}

export const GeorgianLicensePlate: React.FC<Props> = ({
  plate,
  size = 'sm',
  variant = 'white',
  className = ''
}) => {
  if (!plate) return null;

  // Real Georgian License Plate format:
  // e.g. "FR-282-EE" -> ["FR", "282", "EE"] or "FR282EE" -> ["FR", "282", "EE"]
  let parts = plate.includes('-') ? plate.split('-') : [];
  if (parts.length < 2) {
    const clean = plate.replace(/\s+/g, '').toUpperCase();
    if (clean.length === 7) {
      parts = [clean.slice(0, 2), clean.slice(2, 5), clean.slice(5)];
    } else {
      parts = [plate];
    }
  }

  // 1. Clean White License Plate (Pure white reflective background, black border and embossed black text, no blue bar)
  if (variant === 'white') {
    if (size === 'xs') {
      return (
        <div
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-white border border-slate-900 shadow-2xs select-none font-mono tracking-wider text-[9px] font-black text-slate-950 ${className}`}
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
        >
          {parts.map((p, idx) => (
            <React.Fragment key={idx}>
              <span>{p}</span>
              {idx < parts.length - 1 && <span className="text-slate-400 text-[7px] mx-0.5 font-bold">●</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (size === 'sm') {
      return (
        <div
          className={`inline-flex items-center px-2 py-0.5 rounded-[4px] bg-white border-[1.5px] border-slate-900 shadow-xs select-none font-mono tracking-wider text-[11px] font-black text-slate-950 ${className}`}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1)' }}
        >
          {parts.map((p, idx) => (
            <React.Fragment key={idx}>
              <span>{p}</span>
              {idx < parts.length - 1 && <span className="text-slate-400 text-[8px] mx-1 font-bold">●</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (size === 'lg') {
      return (
        <div
          className={`inline-flex items-center px-5 py-2.5 rounded-xl bg-white border-[2.5px] border-slate-950 shadow-md select-none font-mono tracking-widest text-xl sm:text-2xl font-black text-slate-950 ${className}`}
          style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,1)' }}
        >
          {parts.map((p, idx) => (
            <React.Fragment key={idx}>
              <span>{p}</span>
              {idx < parts.length - 1 && <span className="text-slate-300 text-base mx-2 font-bold">●</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Default 'md'
    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-lg bg-white border-2 border-slate-950 shadow-sm select-none font-mono tracking-wider text-xs sm:text-sm font-black text-slate-950 ${className}`}
        style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,1)' }}
      >
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            <span>{p}</span>
            {idx < parts.length - 1 && <span className="text-slate-400 text-[10px] mx-1.5 font-bold">●</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // 2. Standard format with EU/GE blue bar
  if (size === 'xs') {
    return (
      <div
        className={`inline-flex items-stretch rounded-[3.5px] bg-white border border-slate-900 shadow-xs overflow-hidden select-none font-mono tracking-wider ${className}`}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}
      >
        {/* Left EU/GE blue bar */}
        <div className="bg-[#003399] text-white px-1 py-0.5 flex flex-col items-center justify-center shrink-0 border-r border-slate-800">
          <span className="text-[7px] leading-none select-none">🇬🇪</span>
          <span className="font-sans font-black text-[6px] tracking-tight leading-none mt-0.5">GE</span>
        </div>
        {/* Plate characters */}
        <div className="px-1.5 py-0.5 flex items-center gap-0.5 text-[9px] font-black text-slate-950 font-mono">
          {parts.map((p, idx) => (
            <React.Fragment key={idx}>
              <span>{p}</span>
              {idx < parts.length - 1 && <span className="text-slate-400 text-[7px]">●</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div
        className={`inline-flex items-stretch rounded-[4px] bg-white border-[1.5px] border-slate-900 shadow-xs overflow-hidden select-none font-mono tracking-wider ${className}`}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.9)' }}
      >
        {/* Left EU/GE blue bar */}
        <div className="bg-[#003399] text-white px-1.5 py-0.5 flex flex-col items-center justify-center shrink-0 border-r border-slate-900">
          <span className="text-[8px] leading-none select-none">🇬🇪</span>
          <span className="font-sans font-black text-[7px] tracking-tight leading-none mt-0.5">GE</span>
        </div>
        {/* Plate characters with authentic separator dot */}
        <div className="px-2 py-0.5 flex items-center gap-1 text-[11px] font-black text-slate-950 font-mono">
          {parts.map((p, idx) => (
            <React.Fragment key={idx}>
              <span>{p}</span>
              {idx < parts.length - 1 && <span className="text-slate-400 text-[9px] font-bold">●</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-stretch rounded-xl bg-white border-[2.5px] border-slate-950 shadow-md overflow-hidden select-none font-mono tracking-widest ${className}`}
        style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.9)' }}
      >
        {/* Left EU/GE blue bar */}
        <div className="bg-[#003399] text-white px-3 py-2 flex flex-col items-center justify-center border-r-2 border-slate-950 shrink-0">
          <span className="text-sm leading-none select-none">🇬🇪</span>
          <span className="font-sans font-black text-[11px] tracking-tighter leading-none mt-1">GE</span>
        </div>
        {/* Plate characters */}
        <div className="px-4 py-2 flex items-center gap-2 text-lg sm:text-2xl font-black text-slate-950 font-mono">
          {parts.map((p, idx) => (
            <React.Fragment key={idx}>
              <span>{p}</span>
              {idx < parts.length - 1 && <span className="text-slate-300 text-sm font-bold">●</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Default 'md' standard
  return (
    <div
      className={`inline-flex items-stretch rounded-lg bg-white border-2 border-slate-950 shadow-sm overflow-hidden select-none font-mono tracking-wider ${className}`}
      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
    >
      {/* Left EU/GE blue bar */}
      <div className="bg-[#003399] text-white px-2 py-1 flex flex-col items-center justify-center border-r-[1.5px] border-slate-950 shrink-0">
        <span className="text-[10px] leading-none select-none">🇬🇪</span>
        <span className="font-sans font-black text-[8px] tracking-tight leading-none mt-0.5">GE</span>
      </div>
      {/* Plate characters */}
      <div className="px-2.5 py-1 flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-950 font-mono">
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            <span>{p}</span>
            {idx < parts.length - 1 && <span className="text-slate-400 text-[10px]">●</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GeorgianLicensePlate;
