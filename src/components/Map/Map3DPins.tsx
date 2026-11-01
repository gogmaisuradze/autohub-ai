import React from 'react';

/**
 * High-definition 3D Map POI Pins and Coin Badges
 * Matches AutoHub's signature claymorphic 3D styling:
 * 1. Fuel Pin: Navy body, gold ring, gold fuel pump, navy pedestal
 * 2. EV Charging Pin: Porcelain white body, navy ring, gold lightning, white pedestal
 * 3. Service Pin: Navy body, gold ring, gold wrench, gold pedestal
 * 4. Radar / Camera Coin: White 3D cylinder disc, navy concentric ring, navy surveillance camera & radar beam
 * 5. Hazard Coin: Gold 3D cylinder disc, white concentric ring, navy warning triangle & exclamation
 */

export interface Map3DPinProps {
  className?: string;
  size?: number | string;
}

/** 1. 3D Fuel Pin (საწვავი - Wissol, Gulf, Rompetrol, Socar, Lukoil) */
export const Fuel3DPin: React.FC<Map3DPinProps> = ({ className = 'w-10 h-12', size }) => (
  <svg
    viewBox="0 0 100 128"
    className={`inline-block select-none overflow-visible ${className}`}
    style={size ? { width: size, height: typeof size === 'number' ? size * 1.28 : size } : undefined}
    aria-label="3D საწვავის პინი"
  >
    <defs>
      <linearGradient id="fp-navy-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#243B5A" />
        <stop offset="40%" stopColor="#142236" />
        <stop offset="100%" stopColor="#0A121E" />
      </linearGradient>

      <linearGradient id="fp-navy-pedestal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2A4366" />
        <stop offset="60%" stopColor="#16253C" />
        <stop offset="100%" stopColor="#0B1320" />
      </linearGradient>

      <linearGradient id="fp-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="35%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>

      <radialGradient id="fp-specular" cx="35%" cy="25%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>

      <filter id="fp-shadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.35" />
      </filter>

      <filter id="fp-pedestal-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </defs>

    {/* Ground ambient drop shadow */}
    <ellipse cx="50" cy="122" rx="26" ry="6" fill="#000000" opacity="0.32" filter="url(#fp-pedestal-blur)" />

    {/* Pedestal Base (Cylindrical Stand in dark navy) */}
    <g filter="url(#fp-shadow)">
      <path d="M 28 113 C 28 120, 72 120, 72 113 L 72 118 C 72 124, 28 124, 28 118 Z" fill="#0B1320" />
      <ellipse cx="50" cy="113" rx="22" ry="6.5" fill="url(#fp-navy-pedestal)" stroke="#2D486E" strokeWidth="1" />
    </g>

    {/* Teardrop Pin Body */}
    <g filter="url(#fp-shadow)">
      <path
        d="M 50 110 C 47 100, 16 68, 16 46 A 34 34 0 1 1 84 46 C 84 68, 53 100, 50 110 Z"
        fill="url(#fp-navy-body)"
        stroke="#2E4A72"
        strokeWidth="1.2"
      />
      <path
        d="M 25 36 A 30 30 0 0 1 75 36"
        fill="none"
        stroke="url(#fp-specular)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>

    {/* Recessed Center Bezel: Golden Ring */}
    <circle cx="50" cy="46" r="23" fill="#101C2E" stroke="url(#fp-gold-grad)" strokeWidth="4.2" filter="url(#fp-shadow)" />
    <circle cx="50" cy="46" r="20" fill="none" stroke="#FDE68A" strokeWidth="0.8" opacity="0.6" />

    {/* 3D Embossed Golden Fuel Pump */}
    <g transform="translate(34, 30)" filter="url(#fp-shadow)">
      <rect x="5" y="6" width="16" height="23" rx="3" fill="url(#fp-gold-grad)" stroke="#B45309" strokeWidth="0.75" />
      <rect x="8" y="9" width="10" height="6" rx="1.5" fill="#132238" stroke="#FDE68A" strokeWidth="0.6" />
      <line x1="10" y1="12" x2="16" y2="12" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M 21 12 H 24.5 V 23 C 24.5 27, 27 27, 27 22 V 15 C 27 13.5, 25 10.5, 23 8.5 L 21 7"
        fill="none"
        stroke="url(#fp-gold-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="7.5" r="1.3" fill="#FDE68A" />
      <rect x="4" y="27" width="18" height="2.5" rx="1" fill="#B45309" />
    </g>
  </svg>
);

/** 2. 3D EV Charging Pin (EV დამტენები) */
export const Charging3DPin: React.FC<Map3DPinProps> = ({ className = 'w-10 h-12', size }) => (
  <svg
    viewBox="0 0 100 128"
    className={`inline-block select-none overflow-visible ${className}`}
    style={size ? { width: size, height: typeof size === 'number' ? size * 1.28 : size } : undefined}
    aria-label="3D EV დამტენის პინი"
  >
    <defs>
      <linearGradient id="cp-white-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="55%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>

      <linearGradient id="cp-white-pedestal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="70%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>

      <linearGradient id="cp-gold-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>

      <filter id="cp-shadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.22" />
      </filter>

      <filter id="cp-pedestal-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </defs>

    {/* Ground ambient drop shadow */}
    <ellipse cx="50" cy="122" rx="26" ry="6" fill="#000000" opacity="0.22" filter="url(#cp-pedestal-blur)" />

    {/* Pedestal Base (Cylindrical Stand in ceramic white) */}
    <g filter="url(#cp-shadow)">
      <path d="M 28 113 C 28 120, 72 120, 72 113 L 72 118 C 72 124, 28 124, 28 118 Z" fill="#CBD5E1" />
      <ellipse cx="50" cy="113" rx="22" ry="6.5" fill="url(#cp-white-pedestal)" stroke="#E2E8F0" strokeWidth="1" />
    </g>

    {/* Teardrop Pin Body */}
    <g filter="url(#cp-shadow)">
      <path
        d="M 50 110 C 47 100, 16 68, 16 46 A 34 34 0 1 1 84 46 C 84 68, 53 100, 50 110 Z"
        fill="url(#cp-white-body)"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
      <path
        d="M 25 36 A 30 30 0 0 1 75 36"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </g>

    {/* Recessed Center Bezel: Deep Navy Ring */}
    <circle cx="50" cy="46" r="23" fill="#FFFFFF" stroke="#132238" strokeWidth="4.2" filter="url(#cp-shadow)" />
    <circle cx="50" cy="46" r="20" fill="none" stroke="#253A5A" strokeWidth="0.8" opacity="0.4" />

    {/* 3D Embossed Golden Lightning Bolt */}
    <g transform="translate(32, 26)" filter="url(#cp-shadow)">
      <path
        d="M 21 4 L 9 22 H 18 L 14 36 L 28 17 H 18 Z"
        fill="url(#cp-gold-bolt)"
        stroke="#B45309"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M 21 4 L 9 22 H 18 Z"
        fill="#FFFFFF"
        opacity="0.35"
      />
    </g>
  </svg>
);

/** 3. 3D Service / Repair Pin (სერვისი & მოვლა) */
export const Service3DPin: React.FC<Map3DPinProps> = ({ className = 'w-10 h-12', size }) => (
  <svg
    viewBox="0 0 100 128"
    className={`inline-block select-none overflow-visible ${className}`}
    style={size ? { width: size, height: typeof size === 'number' ? size * 1.28 : size } : undefined}
    aria-label="3D ავტოსერვისის პინი"
  >
    <defs>
      <linearGradient id="sp-navy-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#243B5A" />
        <stop offset="40%" stopColor="#142236" />
        <stop offset="100%" stopColor="#0A121E" />
      </linearGradient>

      {/* Gold Pedestal Base (matching reference image!) */}
      <linearGradient id="sp-gold-pedestal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>

      <linearGradient id="sp-gold-wrench" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="35%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>

      <radialGradient id="sp-specular" cx="35%" cy="25%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>

      <filter id="sp-shadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.35" />
      </filter>

      <filter id="sp-pedestal-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </defs>

    {/* Ground ambient drop shadow */}
    <ellipse cx="50" cy="122" rx="26" ry="6" fill="#000000" opacity="0.32" filter="url(#sp-pedestal-blur)" />

    {/* Pedestal Base (Golden Cylindrical Stand!) */}
    <g filter="url(#sp-shadow)">
      <path d="M 28 113 C 28 120, 72 120, 72 113 L 72 118 C 72 124, 28 124, 28 118 Z" fill="#92400E" />
      <ellipse cx="50" cy="113" rx="22" ry="6.5" fill="url(#sp-gold-pedestal)" stroke="#FDE68A" strokeWidth="1" />
    </g>

    {/* Teardrop Pin Body */}
    <g filter="url(#sp-shadow)">
      <path
        d="M 50 110 C 47 100, 16 68, 16 46 A 34 34 0 1 1 84 46 C 84 68, 53 100, 50 110 Z"
        fill="url(#sp-navy-body)"
        stroke="#2E4A72"
        strokeWidth="1.2"
      />
      <path
        d="M 25 36 A 30 30 0 0 1 75 36"
        fill="none"
        stroke="url(#sp-specular)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>

    {/* Recessed Center Bezel: Golden Ring */}
    <circle cx="50" cy="46" r="23" fill="#101C2E" stroke="url(#sp-gold-wrench)" strokeWidth="4.2" filter="url(#sp-shadow)" />
    <circle cx="50" cy="46" r="20" fill="none" stroke="#FDE68A" strokeWidth="0.8" opacity="0.6" />

    {/* 3D Embossed Golden Wrench at 40° Angle */}
    <g transform="translate(50, 46) rotate(-42) translate(-18, -18)" filter="url(#sp-shadow)">
      <path
        d="M 31 7 C 32 10, 31 14, 28 16 L 14 30 C 12 32, 8 32, 6 30 C 4 28, 4 24, 6 22 L 20 8 C 22 5, 26 4, 29 5 L 26 9 L 29 12 L 33 9 Z"
        fill="url(#sp-gold-wrench)"
        stroke="#92400E"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="27" r="2" fill="#101C2E" stroke="#FDE68A" strokeWidth="0.6" />
      <path d="M 19 10 L 9 20" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </g>
  </svg>
);

/** 4. 3D Speed Camera / Radar Coin Badge (რადარები & კამერები) */
export const Radar3DCoin: React.FC<Map3DPinProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`inline-block select-none overflow-visible ${className}`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="3D რადარის მონეტა-ბეიჯი"
  >
    <defs>
      <linearGradient id="rc-white-cylinder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>

      <linearGradient id="rc-coin-rim" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>

      <filter id="rc-shadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.25" />
      </filter>

      <filter id="rc-ground-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>

    {/* Ground ambient drop shadow */}
    <ellipse cx="50" cy="92" rx="34" ry="7" fill="#000000" opacity="0.25" filter="url(#rc-ground-blur)" />

    {/* 3D Coin Extrusion (Tilted Right Edge) */}
    <g filter="url(#rc-shadow)">
      <path
        d="M 50 8 A 40 40 0 0 1 88 50 L 93 54 A 40 40 0 0 1 54 94 L 50 88 A 40 40 0 0 1 50 8 Z"
        fill="url(#rc-coin-rim)"
      />
      <circle cx="48" cy="48" r="39" fill="url(#rc-white-cylinder)" stroke="#E2E8F0" strokeWidth="1.5" />
      <path
        d="M 18 30 A 38 38 0 0 1 68 14"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="48" cy="48" r="30" fill="none" stroke="#132238" strokeWidth="4.5" />
      <circle cx="48" cy="48" r="26.5" fill="#F8FAFC" />
    </g>

    {/* Dark Navy CCTV / Radar Speed Camera */}
    <g transform="translate(30, 30)" filter="url(#rc-shadow)">
      <path d="M 7 28 H 15 L 17 21 H 13 Z" fill="#132238" />
      <path d="M 12 17 L 26 12 C 27.5 11.5, 29 12.5, 29 14 V 20 C 29 21.5, 27.5 22.5, 26 22 L 12 17 Z" fill="#132238" />
      <path d="M 10 16 L 27 10 L 28 12 L 11 18 Z" fill="#2A4365" />
      <ellipse cx="27.5" cy="16.5" rx="2" ry="4" fill="#0A111C" stroke="#475569" strokeWidth="0.8" />
      <circle cx="28" cy="15.5" r="0.9" fill="#38BDF8" />
      <path d="M 32 12 A 8 8 0 0 1 32 21" fill="none" stroke="#132238" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
      <path d="M 35 9 A 12 12 0 0 1 35 24" fill="none" stroke="#132238" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
    </g>
  </svg>
);

/** 5. 3D Hazard / Warning Coin Badge (საგზაო საფრთხე) */
export const Hazard3DCoin: React.FC<Map3DPinProps> = ({ className = 'w-10 h-10', size }) => (
  <svg
    viewBox="0 0 100 100"
    className={`inline-block select-none overflow-visible ${className}`}
    style={size ? { width: size, height: size } : undefined}
    aria-label="3D საფრთხის მონეტა-ბეიჯი"
  >
    <defs>
      <linearGradient id="hc-gold-cylinder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>

      <linearGradient id="hc-coin-rim" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>

      <filter id="hc-shadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.28" />
      </filter>

      <filter id="hc-ground-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>

    {/* Ground ambient drop shadow */}
    <ellipse cx="50" cy="92" rx="34" ry="7" fill="#000000" opacity="0.25" filter="url(#hc-ground-blur)" />

    {/* 3D Coin Extrusion (Tilted Golden Edge) */}
    <g filter="url(#hc-shadow)">
      <path
        d="M 50 8 A 40 40 0 0 1 88 50 L 93 54 A 40 40 0 0 1 54 94 L 50 88 A 40 40 0 0 1 50 8 Z"
        fill="url(#hc-coin-rim)"
      />
      <circle cx="48" cy="48" r="39" fill="url(#hc-gold-cylinder)" stroke="#FDE68A" strokeWidth="1.2" />
      <path
        d="M 18 30 A 38 38 0 0 1 68 14"
        fill="none"
        stroke="#FEF3C7"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="48" cy="48" r="30" fill="none" stroke="#FFFFFF" strokeWidth="4.5" />
      <circle cx="48" cy="48" r="26.5" fill="url(#hc-gold-cylinder)" />
    </g>

    {/* Dark Navy Warning Triangle with Exclamation */}
    <g transform="translate(29, 27)" filter="url(#hc-shadow)">
      <path
        d="M 19 8 C 20 6.5, 22 6.5, 23 8 L 35 29 C 36 30.5, 35 32.5, 33 32.5 H 9 C 7 32.5, 6 30.5, 7 29 Z"
        fill="#132238"
        stroke="#0F172A"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M 21 12 L 31 29 H 11 Z"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <line x1="21" y1="16" x2="21" y2="23" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="21" cy="27" r="1.3" fill="#FFFFFF" />
    </g>
  </svg>
);

/**
 * Pure SVG HTML Generators for Leaflet `divIcon` in `LiveTrafficMap.tsx`
 */

export const getFuel3DPinHtml = (): string => `
  <svg viewBox="0 0 100 128" class="w-10 h-12 overflow-visible drop-shadow-md group-hover:scale-110 transition-transform">
    <ellipse cx="50" cy="122" rx="26" ry="6" fill="#000000" opacity="0.32" />
    <path d="M 28 113 C 28 120, 72 120, 72 113 L 72 118 C 72 124, 28 124, 28 118 Z" fill="#0B1320" />
    <ellipse cx="50" cy="113" rx="22" ry="6.5" fill="#16253C" stroke="#2D486E" stroke-width="1" />
    <path d="M 50 110 C 47 100, 16 68, 16 46 A 34 34 0 1 1 84 46 C 84 68, 53 100, 50 110 Z" fill="#142236" stroke="#2E4A72" stroke-width="1.2" />
    <path d="M 25 36 A 30 30 0 0 1 75 36" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.4" stroke-linecap="round" />
    <circle cx="50" cy="46" r="23" fill="#101C2E" stroke="#F59E0B" stroke-width="4.2" />
    <circle cx="50" cy="46" r="20" fill="none" stroke="#FDE68A" stroke-width="0.8" opacity="0.6" />
    <g transform="translate(34, 30)">
      <rect x="5" y="6" width="16" height="23" rx="3" fill="#F59E0B" stroke="#B45309" stroke-width="0.75" />
      <rect x="8" y="9" width="10" height="6" rx="1.5" fill="#132238" stroke="#FDE68A" stroke-width="0.6" />
      <line x1="10" y1="12" x2="16" y2="12" stroke="#F59E0B" stroke-width="1" stroke-linecap="round" />
      <path d="M 21 12 H 24.5 V 23 C 24.5 27, 27 27, 27 22 V 15 C 27 13.5, 25 10.5, 23 8.5 L 21 7" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="21" cy="7.5" r="1.3" fill="#FDE68A" />
      <rect x="4" y="27" width="18" height="2.5" rx="1" fill="#B45309" />
    </g>
  </svg>
`;

export const getCharging3DPinHtml = (): string => `
  <svg viewBox="0 0 100 128" class="w-10 h-12 overflow-visible drop-shadow-md group-hover:scale-110 transition-transform">
    <ellipse cx="50" cy="122" rx="26" ry="6" fill="#000000" opacity="0.22" />
    <path d="M 28 113 C 28 120, 72 120, 72 113 L 72 118 C 72 124, 28 124, 28 118 Z" fill="#CBD5E1" />
    <ellipse cx="50" cy="113" rx="22" ry="6.5" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1" />
    <path d="M 50 110 C 47 100, 16 68, 16 46 A 34 34 0 1 1 84 46 C 84 68, 53 100, 50 110 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <path d="M 25 36 A 30 30 0 0 1 75 36" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.9" stroke-linecap="round" />
    <circle cx="50" cy="46" r="23" fill="#FFFFFF" stroke="#132238" stroke-width="4.2" />
    <circle cx="50" cy="46" r="20" fill="none" stroke="#253A5A" stroke-width="0.8" opacity="0.4" />
    <g transform="translate(32, 26)">
      <path d="M 21 4 L 9 22 H 18 L 14 36 L 28 17 H 18 Z" fill="#F59E0B" stroke="#B45309" stroke-width="0.8" stroke-linejoin="round" />
      <path d="M 21 4 L 9 22 H 18 Z" fill="#FFFFFF" opacity="0.4" />
    </g>
  </svg>
`;

export const getService3DPinHtml = (): string => `
  <svg viewBox="0 0 100 128" class="w-10 h-12 overflow-visible drop-shadow-md group-hover:scale-110 transition-transform">
    <ellipse cx="50" cy="122" rx="26" ry="6" fill="#000000" opacity="0.32" />
    <path d="M 28 113 C 28 120, 72 120, 72 113 L 72 118 C 72 124, 28 124, 28 118 Z" fill="#92400E" />
    <ellipse cx="50" cy="113" rx="22" ry="6.5" fill="#F59E0B" stroke="#FDE68A" stroke-width="1" />
    <path d="M 50 110 C 47 100, 16 68, 16 46 A 34 34 0 1 1 84 46 C 84 68, 53 100, 50 110 Z" fill="#142236" stroke="#2E4A72" stroke-width="1.2" />
    <path d="M 25 36 A 30 30 0 0 1 75 36" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.4" stroke-linecap="round" />
    <circle cx="50" cy="46" r="23" fill="#101C2E" stroke="#F59E0B" stroke-width="4.2" />
    <circle cx="50" cy="46" r="20" fill="none" stroke="#FDE68A" stroke-width="0.8" opacity="0.6" />
    <g transform="translate(50, 46) rotate(-42) translate(-18, -18)">
      <path d="M 31 7 C 32 10, 31 14, 28 16 L 14 30 C 12 32, 8 32, 6 30 C 4 28, 4 24, 6 22 L 20 8 C 22 5, 26 4, 29 5 L 26 9 L 29 12 L 33 9 Z" fill="#F59E0B" stroke="#92400E" stroke-width="0.75" stroke-linejoin="round" />
      <circle cx="9" cy="27" r="2" fill="#101C2E" stroke="#FDE68A" stroke-width="0.6" />
    </g>
  </svg>
`;

export const getRadar3DCoinHtml = (): string => `
  <svg viewBox="0 0 100 100" class="w-10 h-10 overflow-visible drop-shadow-md group-hover:scale-110 transition-transform">
    <ellipse cx="50" cy="92" rx="34" ry="7" fill="#000000" opacity="0.25" />
    <path d="M 50 8 A 40 40 0 0 1 88 50 L 93 54 A 40 40 0 0 1 54 94 L 50 88 A 40 40 0 0 1 50 8 Z" fill="#94A3B8" />
    <circle cx="48" cy="48" r="39" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
    <path d="M 18 30 A 38 38 0 0 1 68 14" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <circle cx="48" cy="48" r="30" fill="none" stroke="#132238" stroke-width="4.5" />
    <circle cx="48" cy="48" r="26.5" fill="#F8FAFC" />
    <g transform="translate(30, 30)">
      <path d="M 7 28 H 15 L 17 21 H 13 Z" fill="#132238" />
      <path d="M 12 17 L 26 12 C 27.5 11.5, 29 12.5, 29 14 V 20 C 29 21.5, 27.5 22.5, 26 22 L 12 17 Z" fill="#132238" />
      <path d="M 10 16 L 27 10 L 28 12 L 11 18 Z" fill="#2A4365" />
      <ellipse cx="27.5" cy="16.5" rx="2" ry="4" fill="#0A111C" stroke="#475569" stroke-width="0.8" />
      <circle cx="28" cy="15.5" r="0.9" fill="#38BDF8" />
      <path d="M 32 12 A 8 8 0 0 1 32 21" fill="none" stroke="#132238" stroke-width="1.6" stroke-linecap="round" opacity="0.75" />
      <path d="M 35 9 A 12 12 0 0 1 35 24" fill="none" stroke="#132238" stroke-width="1.6" stroke-linecap="round" opacity="0.45" />
    </g>
  </svg>
`;

export const getHazard3DCoinHtml = (): string => `
  <svg viewBox="0 0 100 100" class="w-10 h-10 overflow-visible drop-shadow-md group-hover:scale-110 transition-transform">
    <ellipse cx="50" cy="92" rx="34" ry="7" fill="#000000" opacity="0.25" />
    <path d="M 50 8 A 40 40 0 0 1 88 50 L 93 54 A 40 40 0 0 1 54 94 L 50 88 A 40 40 0 0 1 50 8 Z" fill="#B45309" />
    <circle cx="48" cy="48" r="39" fill="#F59E0B" stroke="#FDE68A" stroke-width="1.2" />
    <path d="M 18 30 A 38 38 0 0 1 68 14" fill="none" stroke="#FEF3C7" stroke-width="3" stroke-linecap="round" opacity="0.9" />
    <circle cx="48" cy="48" r="30" fill="none" stroke="#FFFFFF" stroke-width="4.5" />
    <circle cx="48" cy="48" r="26.5" fill="#F59E0B" />
    <g transform="translate(29, 27)">
      <path d="M 19 8 C 20 6.5, 22 6.5, 23 8 L 35 29 C 36 30.5, 35 32.5, 33 32.5 H 9 C 7 32.5, 6 30.5, 7 29 Z" fill="#132238" stroke="#0F172A" stroke-width="1.2" stroke-linejoin="round" />
      <path d="M 21 12 L 31 29 H 11 Z" fill="none" stroke="#F59E0B" stroke-width="1.2" stroke-linejoin="round" />
      <line x1="21" y1="16" x2="21" y2="23" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" />
      <circle cx="21" cy="27" r="1.3" fill="#FFFFFF" />
    </g>
  </svg>
`;
