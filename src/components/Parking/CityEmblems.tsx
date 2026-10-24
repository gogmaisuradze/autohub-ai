import React from 'react';

export type CityType = 'tbilisi' | 'batumi' | 'kutaisi';

/**
 * თბილისის ოფიციალური გერბი (Official Coat of Arms of Tbilisi)
 * მრგვალი ქართული ჰერალდიკური ფარი, 7 შვიდქიმიანი ოქროს ვარსკვლავი,
 * ასომთავრული „Ⴇ“ (თანი), შავარდენი გაშლილი ფრთებით, ხოხობი ბრჭყალებში,
 * თბილისის გოგირდის თერმული წყლების ტალღები და მუხა-ზეთისხილის რტოები.
 */
export const TbilisiCoatOfArms: React.FC<{ className?: string; size?: number }> = ({
  className = "w-14 h-14",
  size
}) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="თბილისის ოფიციალური გერბი"
    >
      <defs>
        {/* Outer Circular Gradient */}
        <radialGradient id="tbShieldBg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="60%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#050B14" />
        </radialGradient>
        {/* Golden Metallic Rim Gradient */}
        <linearGradient id="tbGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="30%" stopColor="#EAB308" />
          <stop offset="70%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>
        {/* Inner Gold Foil */}
        <linearGradient id="tbGoldCore" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        {/* Sulfur Bath Waves Gradient */}
        <linearGradient id="tbWaterWave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="tbGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Golden Border & Shadow */}
      <circle cx="50" cy="50" r="47" fill="url(#tbGoldRim)" filter="url(#tbGlow)" />
      <circle cx="50" cy="50" r="44.5" fill="#0B132B" stroke="#CA8A04" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="42" fill="url(#tbShieldBg)" />

      {/* Decorative Beaded Inner Ring */}
      <circle cx="50" cy="50" r="40" stroke="#EAB308" strokeWidth="0.75" strokeDasharray="1.5 2" opacity="0.85" />

      {/* 7 Seven-Pointed Golden Stars across the upper arc */}
      {/* Star 1 */}
      <polygon points="23,28 24.2,29.5 26,29.2 24.8,30.8 25.5,32.5 23.8,31.8 22.8,33.2 22.5,31.5 21,30.5 22.5,29.8" fill="url(#tbGoldCore)" />
      {/* Star 2 */}
      <polygon points="30,21 31.2,22.5 33,22.2 31.8,23.8 32.5,25.5 30.8,24.8 29.8,26.2 29.5,24.5 28,23.5 29.5,22.8" fill="url(#tbGoldCore)" />
      {/* Star 3 */}
      <polygon points="39,16.5 40.2,18 42,17.7 40.8,19.3 41.5,21 39.8,20.3 38.8,21.7 38.5,20 37,19 38.5,18.3" fill="url(#tbGoldCore)" />
      {/* Star 4 (Apex / Center Top) */}
      <polygon points="50,13.5 51.5,15.5 53.8,15 52.3,17 53.2,19.2 51,18.3 49.8,20.2 49.4,18 47.5,16.8 49.4,15.8" fill="url(#tbGoldCore)" />
      {/* Star 5 */}
      <polygon points="61,16.5 61.5,18.3 63,19 61.5,20 61.2,21.7 60.2,20.3 58.5,21 59.2,19.3 58,17.7 59.8,18" fill="url(#tbGoldCore)" />
      {/* Star 6 */}
      <polygon points="70,21 70.5,22.8 72,23.5 70.5,24.5 70.2,26.2 69.2,24.8 67.5,25.5 68.2,23.8 67,22.2 68.8,22.5" fill="url(#tbGoldCore)" />
      {/* Star 7 */}
      <polygon points="77,28 77.5,29.8 79,30.5 77.5,31.5 77.2,33.2 76.2,31.8 74.5,32.5 75.2,30.8 74,29.2 75.8,29.5" fill="url(#tbGoldCore)" />

      {/* Central Asomtavruli „Ⴇ“ (Tani) Ring */}
      <circle cx="50" cy="48" r="17.5" stroke="url(#tbGoldCore)" strokeWidth="2.5" fill="none" opacity="0.9" />
      {/* Core vertical stem of „Ⴇ“ */}
      <line x1="50" y1="33" x2="50" y2="64" stroke="url(#tbGoldCore)" strokeWidth="2.6" strokeLinecap="round" />

      {/* Falcon (შავარდენი) Soaring with Outstretched Wings */}
      {/* Falcon Head & Beak */}
      <path d="M47.5 35 C45 31.5 39.5 31.5 37 35 C34.5 37.5 33.5 41 37.5 41 C40.5 41 42 39 42 37" stroke="#FEF08A" strokeWidth="1.6" fill="#F59E0B" strokeLinecap="round" />
      <circle cx="41" cy="35" r="1.1" fill="#0B132B" />
      <path d="M35 37 Q32 39 34.5 41" stroke="#FEF08A" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* Falcon Left Wing (Flaring outward and up) */}
      <path d="M36.5 44 C26.5 38 20 29 16 34 C20 42 29 48 38 49 Z" fill="url(#tbGoldCore)" stroke="#FEF08A" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M24 37 L30 46 M19 39 L25 48 M29 34 L35 44" stroke="#FEF08A" strokeWidth="1.1" strokeLinecap="round" />

      {/* Falcon Right Wing (Flaring outward and up) */}
      <path d="M63.5 44 C73.5 38 80 29 84 34 C80 42 71 48 62 49 Z" fill="url(#tbGoldCore)" stroke="#FEF08A" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M76 37 L70 46 M81 39 L75 48 M71 34 L65 44" stroke="#FEF08A" strokeWidth="1.1" strokeLinecap="round" />

      {/* Golden Pheasant (ხოხობი) in Falcon's Talons */}
      <path d="M43.5 56 C41 60 43.5 65 50 65 C56.5 65 59 60 56.5 56 C54 53 46 53 43.5 56 Z" fill="url(#tbGoldCore)" stroke="#FEF08A" strokeWidth="1.5" />
      <path d="M54 64 C58 68 62 70 66 71" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Talons grasping pheasant */}
      <path d="M46 56 L45 61 M54 56 L55 61" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" />

      {/* Hot Sulfur Thermal Waves at Base (თბილი წყლები) */}
      <path d="M20 74 C30 70, 40 77, 50 74 C60 70, 70 77, 80 74" stroke="url(#tbWaterWave)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M25 80 C33 77, 42 83, 50 80 C58 77, 67 83, 75 80" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" fill="none" />
      <path d="M32 86 C38 84, 44 88, 50 86 C56 84, 62 88, 68 86" stroke="#BAE6FD" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" fill="none" />

      {/* Oak & Laurel Sprigs along lower sides */}
      <path d="M15 57 C12 66 16 75 21 81" stroke="#EAB308" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="62" r="1.6" fill="#F59E0B" />
      <circle cx="17" cy="71" r="1.6" fill="#F59E0B" />
      <path d="M85 57 C88 66 84 75 79 81" stroke="#EAB308" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="86" cy="62" r="1.6" fill="#F59E0B" />
      <circle cx="83" cy="71" r="1.6" fill="#F59E0B" />
    </svg>
  );
};

/**
 * ბათუმის ოფიციალური გერბი (Official Coat of Arms of Batumi)
 * სამკოშკიანი ოქროს ციხე-გვირგვინი, ორი გადაჯვარედინებული ოქროს საზღვაო ღუზა,
 * ჰერალდიკური ფარი, გულისფარი 3 ოქროს მონეტით (ბეზანტით), შავი ზღვის ტალღები.
 */
export const BatumiCoatOfArms: React.FC<{ className?: string; size?: number }> = ({
  className = "w-14 h-14",
  size
}) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="ბათუმის ოფიციალური გერბი"
    >
      <defs>
        {/* Shield Gradient */}
        <linearGradient id="btShieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>
        {/* Gold Texture for Crown and Anchors */}
        <linearGradient id="btGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        {/* Black Sea Wave Gradient */}
        <linearGradient id="btSea" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </linearGradient>
        <filter id="btShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. Crossed Golden Naval Anchors Behind the Shield */}
      {/* Anchor 1: Top-Left to Bottom-Right */}
      <g stroke="url(#btGold)" strokeLinecap="round" strokeLinejoin="round">
        {/* Shackle Ring & Stock */}
        <circle cx="16" cy="14" r="3.8" strokeWidth="1.8" fill="#0F172A" />
        <line x1="12" y1="18" x2="20" y2="10" strokeWidth="2.2" />
        {/* Shank */}
        <line x1="19" y1="17" x2="79" y2="83" strokeWidth="2.8" />
        {/* Arms & Flukes */}
        <path d="M72 86 Q85 84 86 72" strokeWidth="2.6" fill="none" />
        <polygon points="86,70 82,76 89,74" fill="url(#btGold)" />
      </g>

      {/* Anchor 2: Top-Right to Bottom-Left */}
      <g stroke="url(#btGold)" strokeLinecap="round" strokeLinejoin="round">
        {/* Shackle Ring & Stock */}
        <circle cx="84" cy="14" r="3.8" strokeWidth="1.8" fill="#0F172A" />
        <line x1="80" y1="10" x2="88" y2="18" strokeWidth="2.2" />
        {/* Shank */}
        <line x1="81" y1="17" x2="21" y2="83" strokeWidth="2.8" />
        {/* Arms & Flukes */}
        <path d="M28 86 Q15 84 14 72" strokeWidth="2.6" fill="none" />
        <polygon points="14,70 11,74 18,76" fill="url(#btGold)" />
      </g>

      {/* 2. Three-Towered Golden Mural Fortress Crown (სამკოშკიანი ციხე-გვირგვინი) */}
      <g filter="url(#btShadow)">
        {/* Crown Base */}
        <path d="M32 20 H68 V25 H32 Z" fill="url(#btGold)" stroke="#B45309" strokeWidth="0.8" />
        {/* Center Tower */}
        <path d="M45 11 H55 V20 H45 Z" fill="url(#btGold)" stroke="#B45309" strokeWidth="0.8" />
        {/* Center Tower Crenellations (3 teeth) */}
        <path d="M45 11 V8 H48 V11 H52 V8 H55 V11" fill="url(#btGold)" stroke="#B45309" strokeWidth="0.8" />
        {/* Center Arched Portal Window */}
        <path d="M48 20 V16 Q50 14 52 16 V20 Z" fill="#0F172A" />

        {/* Left Tower */}
        <path d="M33 13 H41 V20 H33 Z" fill="url(#btGold)" stroke="#B45309" strokeWidth="0.8" />
        <path d="M33 13 V10 H36 V13 H38 V10 H41 V13" fill="url(#btGold)" stroke="#B45309" strokeWidth="0.8" />
        <path d="M35 20 V17 Q37 15 39 17 V20 Z" fill="#0F172A" />

        {/* Right Tower */}
        <path d="M59 13 H67 V20 H59 Z" fill="url(#btGold)" stroke="#B45309" strokeWidth="0.8" />
        <path d="M59 13 V10 H62 V13 H64 V10 H67 V13" fill="url(#btGold)" stroke="#B45309" strokeWidth="0.8" />
        <path d="M61 20 V17 Q63 15 65 17 V20 Z" fill="#0F172A" />
      </g>

      {/* 3. Pointed Heraldic Shield */}
      <g filter="url(#btShadow)">
        {/* Outer Shield with Gold Rim */}
        <path
          d="M26 25 H74 V56 C74 74, 50 88, 50 90 C50 88, 26 74, 26 56 Z"
          fill="url(#btShieldBg)"
          stroke="url(#btGold)"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Inner Shield Lining */}
        <path
          d="M30 29 H70 V55 C70 70, 50 82, 50 84 C50 82, 30 70, 30 55 Z"
          stroke="#FDE047"
          strokeWidth="0.9"
          fill="none"
          opacity="0.8"
        />

        {/* Diagonal Silver / Azure Chevron */}
        <path d="M28 38 L50 29 L72 38" stroke="#E2E8F0" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />

        {/* 4. Central Inescutcheon (გულისფარი) */}
        <path
          d="M41 40 H59 V57 C59 66, 50 71, 50 72 C50 71, 41 66, 41 57 Z"
          fill="#991B1B"
          stroke="url(#btGold)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* 3 Golden Bezants / Coins (2 Top, 1 Bottom) */}
        <circle cx="46" cy="49" r="2.8" fill="url(#btGold)" stroke="#78350F" strokeWidth="0.6" />
        <circle cx="54" cy="49" r="2.8" fill="url(#btGold)" stroke="#78350F" strokeWidth="0.6" />
        <circle cx="50" cy="59" r="2.8" fill="url(#btGold)" stroke="#78350F" strokeWidth="0.6" />

        {/* 5. Black Sea Rhythmic Waves at Shield Base */}
        <path d="M31 71 C37 68, 43 74, 50 71 C57 68, 63 74, 69 71" stroke="url(#btSea)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M36 77 C41 75, 45 79, 50 77 C55 75, 59 79, 64 77" stroke="#BAE6FD" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" fill="none" />
      </g>
    </svg>
  );
};

/**
 * ქუთაისის ოფიციალური გერბი (Official Coat of Arms of Kutaisi)
 * სამკოშკიანი ციხე-გვირგვინი, ლაჟვარდისფერი ჰერალდიკური ფარი ოქროს კანტით,
 * ცენტრში კოლხეთის ოქროს საწმისი (Golden Fleece) დაკიდებული ოქროს რგოლზე,
 * ქვემოთ მდინარე რიონის ტალღები (თეთრი ხიდი).
 */
export const KutaisiCoatOfArms: React.FC<{ className?: string; size?: number }> = ({
  className = "w-14 h-14",
  size
}) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="ქუთაისის ოფიციალური გერბი"
    >
      <defs>
        {/* Royal Azure Shield Gradient */}
        <radialGradient id="ktShieldBg" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
        {/* Golden Foil for Golden Fleece & Crown */}
        <linearGradient id="ktGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        {/* Silver Gradient for Crown Accents */}
        <linearGradient id="ktSilver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        {/* Rioni River Wave Gradient */}
        <linearGradient id="ktRioni" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="ktShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. Three-Towered Fortress Crown (სამკოშკიანი ციხე-გვირგვინი) */}
      <g filter="url(#ktShadow)">
        {/* Crown Base */}
        <path d="M33 18 H67 V23 H33 Z" fill="url(#ktSilver)" stroke="#475569" strokeWidth="0.8" />
        {/* Center Tower */}
        <path d="M45 9 H55 V18 H45 Z" fill="url(#ktSilver)" stroke="#475569" strokeWidth="0.8" />
        <path d="M45 9 V6 H48 V9 H52 V6 H55 V9" fill="url(#ktSilver)" stroke="#475569" strokeWidth="0.8" />
        {/* Center Arched Portal Window */}
        <path d="M48 18 V14 Q50 12 52 14 V18 Z" fill="#0F172A" />

        {/* Left Tower */}
        <path d="M34 11 H42 V18 H34 Z" fill="url(#ktSilver)" stroke="#475569" strokeWidth="0.8" />
        <path d="M34 11 V8 H37 V11 H39 V8 H42 V11" fill="url(#ktSilver)" stroke="#475569" strokeWidth="0.8" />
        <path d="M36 18 V15 Q38 13 40 15 V18 Z" fill="#0F172A" />

        {/* Right Tower */}
        <path d="M58 11 H66 V18 H58 Z" fill="url(#ktSilver)" stroke="#475569" strokeWidth="0.8" />
        <path d="M58 11 V8 H61 V11 H63 V8 H66 V11" fill="url(#ktSilver)" stroke="#475569" strokeWidth="0.8" />
        <path d="M60 18 V15 Q62 13 64 15 V18 Z" fill="#0F172A" />
      </g>

      {/* 2. Main Pointed French-Georgian Shield */}
      <g filter="url(#ktShadow)">
        {/* Outer Shield with Rich Gold Border */}
        <path
          d="M25 23 H75 V56 C75 75, 50 89, 50 91 C50 89, 25 75, 25 56 Z"
          fill="url(#ktShieldBg)"
          stroke="url(#ktGold)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Inner Gold Inset Line */}
        <path
          d="M29 27 H71 V55 C71 71, 50 83, 50 85 C50 83, 29 71, 29 55 Z"
          stroke="#FDE047"
          strokeWidth="1"
          fill="none"
          opacity="0.85"
        />

        {/* 3. Golden Ring & Royal Red Ribbon Suspender */}
        <circle cx="50" cy="33" r="3.2" fill="none" stroke="url(#ktGold)" strokeWidth="1.6" />
        <path d="M47 34 L43 38 M53 34 L57 38" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />

        {/* 4. The Colchian Golden Fleece (ოქროს საწმისი) */}
        {/* Central Ram's Body & Curly Fleece Silhouette */}
        <g filter="url(#ktShadow)">
          {/* Main fleece silhouette hanging by middle */}
          <path
            d="M42 38 C40 40, 36 41, 35 44 C34 47, 36 50, 35 53 C34 56, 32 58, 34 61 C36 63, 40 61, 42 63 C44 65, 45 68, 48 68 C50 68, 51 65, 53 68 C56 68, 57 65, 59 63 C61 61, 65 63, 67 61 C69 58, 67 56, 66 53 C65 50, 67 47, 66 44 C65 41, 61 40, 59 38 C56 40, 45 40, 42 38 Z"
            fill="url(#ktGold)"
            stroke="#FEF08A"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Ram Head at Center Left */}
          <path d="M42 41 C38 41, 35 44, 38 48 C41 51, 45 49, 45 45 Z" fill="url(#ktGold)" stroke="#FEF08A" strokeWidth="1.2" />
          {/* Curled Horn */}
          <path d="M38 43 C36 41, 34 43, 35 46 C36 48, 39 47, 39 45" stroke="#78350F" strokeWidth="1.4" fill="none" strokeLinecap="round" />

          {/* Golden Fleece Curls & Textures */}
          <circle cx="45" cy="46" r="1.5" stroke="#92400E" strokeWidth="0.8" fill="none" />
          <circle cx="51" cy="45" r="1.6" stroke="#92400E" strokeWidth="0.8" fill="none" />
          <circle cx="57" cy="46" r="1.5" stroke="#92400E" strokeWidth="0.8" fill="none" />
          <circle cx="44" cy="53" r="1.6" stroke="#92400E" strokeWidth="0.8" fill="none" />
          <circle cx="50" cy="53" r="1.8" stroke="#92400E" strokeWidth="0.8" fill="none" />
          <circle cx="56" cy="53" r="1.6" stroke="#92400E" strokeWidth="0.8" fill="none" />
          <circle cx="47" cy="60" r="1.5" stroke="#92400E" strokeWidth="0.8" fill="none" />
          <circle cx="53" cy="60" r="1.5" stroke="#92400E" strokeWidth="0.8" fill="none" />

          {/* Hanging Hooves at bottom */}
          <path d="M35 61 L34 66 M39 62 L39 67 M62 62 L62 67 M66 61 L67 66" stroke="#78350F" strokeWidth="1.6" strokeLinecap="round" />
        </g>

        {/* 5. Rioni River Turquoise & Azure Waves (მდინარე რიონი) */}
        <path d="M30 73 C37 70, 43 76, 50 73 C57 70, 63 76, 70 73" stroke="url(#ktRioni)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M35 79 C40 77, 45 81, 50 79 C55 77, 60 81, 65 79" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" fill="none" />
      </g>
    </svg>
  );
};

/**
 * უნივერსალური გერბის კომპონენტი ქალაქის ID-ის მიხედვით
 */
export const CityCoatOfArms: React.FC<{
  city: CityType;
  className?: string;
  size?: number;
  showBadge?: boolean;
}> = ({ city, className = "w-14 h-14", size, showBadge = false }) => {
  const renderEmblem = () => {
    switch (city) {
      case 'tbilisi':
        return <TbilisiCoatOfArms className={className} size={size} />;
      case 'batumi':
        return <BatumiCoatOfArms className={className} size={size} />;
      case 'kutaisi':
        return <KutaisiCoatOfArms className={className} size={size} />;
      default:
        return <TbilisiCoatOfArms className={className} size={size} />;
    }
  };

  if (!showBadge) {
    return renderEmblem();
  }

  const label =
    city === 'tbilisi'
      ? 'თბილისის გერბი'
      : city === 'batumi'
      ? 'ბათუმის გერბი'
      : 'ქუთაისის გერბი';

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="relative group p-1 rounded-2xl bg-gradient-to-br from-white/90 to-slate-100 shadow-sm border border-slate-200/80 transition-transform hover:scale-105">
        {renderEmblem()}
      </div>
      <span className="text-[9px] font-mono font-bold tracking-tight text-slate-500 uppercase">
        {label}
      </span>
    </div>
  );
};
