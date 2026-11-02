import { MapReport } from '../../types';

export interface CompanyBrandData {
  brandName: string;
  categoryLabel: string;
  categoryBadgeClass: string;
  phone?: string;
  website?: string;
  logoSvg: string;
}

export function getCompanyBrandData(item: MapReport): CompanyBrandData {
  const brandRaw = (item.brand || '').trim();
  const titleRaw = (item.title || '').trim();
  const combined = `${brandRaw} ${titleRaw}`.toLowerCase();

  // 1. FUEL STATIONS
  if (item.type === 'fuel' || combined.includes('fuel') || combined.includes('გასამართ') || combined.includes('ბენზინ') || combined.includes('wissol') || combined.includes('gulf') || combined.includes('rompetrol') || combined.includes('socar') || combined.includes('lukoil') || combined.includes('portal')) {
    if (combined.includes('wissol') || combined.includes('ვისოლ')) {
      return {
        brandName: 'Wissol • ვისოლი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-amber-100 text-amber-950 border border-amber-300',
        phone: item.phone || '*2000',
        website: item.website || 'https://wissol.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#132238"/><circle cx="18" cy="18" r="14" fill="#F59E0B"/><polygon points="18,7 23,22 13,22" fill="#132238"/><text x="18" y="32" font-family="Arial, sans-serif" font-weight="900" font-size="8" fill="#132238" text-anchor="middle">W</text></svg>`
      };
    }
    if (combined.includes('gulf') || combined.includes('გალფ')) {
      return {
        brandName: 'Gulf • გალფი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-orange-100 text-orange-950 border border-orange-300',
        phone: item.phone || '032 249 22 22',
        website: item.website || 'https://gulf.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#132238"/><circle cx="18" cy="18" r="14" fill="#EA580C"/><circle cx="18" cy="18" r="7" fill="#132238"/><text x="18" y="21" font-family="Arial, sans-serif" font-weight="900" font-size="9" fill="#EA580C" text-anchor="middle">G</text></svg>`
      };
    }
    if (combined.includes('rompetrol') || combined.includes('რომპეტროლ')) {
      return {
        brandName: 'Rompetrol • რომპეტროლი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-rose-100 text-rose-950 border border-rose-300',
        phone: item.phone || '032 224 04 44',
        website: item.website || 'https://rompetrol.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#132238"/><circle cx="18" cy="18" r="14" fill="#E11D48"/><polygon points="18,9 25,18 18,27 11,18" fill="#FFFFFF"/></svg>`
      };
    }
    if (combined.includes('socar') || combined.includes('სოკარ')) {
      return {
        brandName: 'SOCAR • სოკარი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-emerald-100 text-emerald-950 border border-emerald-300',
        phone: item.phone || '*0001',
        website: item.website || 'https://socar.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#132238"/><circle cx="18" cy="18" r="14" fill="#059669"/><rect x="11" y="11" width="14" height="14" rx="3" fill="#FFFFFF"/><circle cx="18" cy="18" r="4" fill="#059669"/></svg>`
      };
    }
    if (combined.includes('lukoil') || combined.includes('ლუკოილ')) {
      return {
        brandName: 'Lukoil • ლუკოილი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-red-100 text-red-950 border border-red-300',
        phone: item.phone || '032 238 00 38',
        website: item.website || 'https://lukoil.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#132238"/><circle cx="18" cy="18" r="14" fill="#DC2626"/><rect x="13" y="10" width="10" height="16" fill="#FFFFFF"/><text x="18" y="22" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#DC2626" text-anchor="middle">L</text></svg>`
      };
    }
    if (combined.includes('portal') || combined.includes('პორტალ')) {
      return {
        brandName: 'Portal • პორტალი',
        categoryLabel: '⛽ ავტოგასამართი',
        categoryBadgeClass: 'bg-indigo-100 text-indigo-950 border border-indigo-300',
        phone: item.phone || '032 200 00 24',
        website: item.website || 'https://portal.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#132238"/><circle cx="18" cy="18" r="14" fill="#4F46E5"/><circle cx="18" cy="18" r="8" fill="none" stroke="#FFFFFF" stroke-width="3"/><circle cx="18" cy="18" r="3" fill="#FFFFFF"/></svg>`
      };
    }
    return {
      brandName: item.brand || item.title || 'ავტოგასამართი სადგური',
      categoryLabel: '⛽ ავტოგასამართი',
      categoryBadgeClass: 'bg-amber-100 text-amber-950 border border-amber-300',
      phone: item.phone,
      website: item.website,
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#132238"/><path d="M12 9H20V26H12V9Z" fill="#F59E0B"/><path d="M22 13H24V21H22" stroke="#F59E0B" stroke-width="2"/></svg>`
    };
  }

  // 2. EV CHARGING STATIONS
  if (item.type === 'charging' || combined.includes('charg') || combined.includes('დამტენ') || combined.includes('ელექტრო') || combined.includes('ev ') || combined.includes('space') || combined.includes('wink')) {
    const isFast = combined.includes('fast') || combined.includes('dc') || combined.includes('სწრაფი');
    return {
      brandName: item.brand || (isFast ? 'Space EV • სწრაფი დამტენი' : 'EV Charging • დამტენი სადგური'),
      categoryLabel: isFast ? '⚡ DC Fast Charger' : '🔌 EV დამტენი',
      categoryBadgeClass: 'bg-cyan-100 text-cyan-950 border border-cyan-300',
      phone: item.phone || '032 205 15 15',
      website: item.website || 'https://spaceev.ge',
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#0891B2"/><path d="M19 8L11 19H17L15 28L25 16H18L19 8Z" fill="#FEF08A" stroke="#0E7490" stroke-width="1.2" stroke-linejoin="round"/></svg>`
    };
  }

  // 3. AUTO SERVICE & HUBS
  if (item.type === 'service' || combined.includes('service') || combined.includes('სერვის') || combined.includes('თეგეტა') || combined.includes('ამბოლი') || combined.includes('ავტობანი') || combined.includes('ხადავოი') || combined.includes('ვულკანიზაცია')) {
    if (combined.includes('tegeta') || combined.includes('თეგეტა')) {
      return {
        brandName: 'Tegeta Motors • თეგეტა მოტორსი',
        categoryLabel: '🔧 ავტოსერვისი & ჰაბი',
        categoryBadgeClass: 'bg-blue-100 text-blue-950 border border-blue-300',
        phone: item.phone || '032 226 44 44',
        website: item.website || 'https://tegetamotors.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#1E3A8A"/><circle cx="18" cy="18" r="13" fill="#2563EB"/><path d="M13 13H23V17H19V24H16V17H13V13Z" fill="#FFFFFF"/></svg>`
      };
    }
    if (combined.includes('amboli') || combined.includes('ამბოლი')) {
      return {
        brandName: 'Amboli • ამბოლი',
        categoryLabel: '🔧 ავტოსერვისი & ზეთები',
        categoryBadgeClass: 'bg-indigo-100 text-indigo-950 border border-indigo-300',
        phone: item.phone || '032 215 40 40',
        website: item.website || 'https://amboli.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#312E81"/><circle cx="18" cy="18" r="13" fill="#4338CA"/><text x="18" y="23" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">A</text></svg>`
      };
    }
    if (combined.includes('autoban') || combined.includes('ავტობანი')) {
      return {
        brandName: 'Autoban • ავტობანი 2000',
        categoryLabel: '🔧 ავტონაწილები & სერვისი',
        categoryBadgeClass: 'bg-purple-100 text-purple-950 border border-purple-300',
        phone: item.phone || '032 251 77 77',
        website: item.website || 'https://autoban.ge',
        logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#581C87"/><circle cx="18" cy="18" r="13" fill="#7E22CE"/><path d="M18 10L24 24H20L18 18L16 24H12L18 10Z" fill="#FFFFFF"/></svg>`
      };
    }
    return {
      brandName: item.brand || item.title || 'ავტოსერვისი',
      categoryLabel: '🔧 ავტოსერვისი',
      categoryBadgeClass: 'bg-blue-100 text-blue-950 border border-blue-300',
      phone: item.phone,
      website: item.website,
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#1E293B"/><path d="M13 11A5 5 0 0 0 20.5 17.5L24 21L21 24L17.5 20.5A5 5 0 0 0 11 13L13 11Z" fill="#38BDF8"/></svg>`
    };
  }

  // 4. PARKING LOTS & ZONES
  if (item.type === 'parking' || combined.includes('parking') || combined.includes('პარკინგ') || combined.includes('სადგომ')) {
    return {
      brandName: item.code ? `თბილისის პარკინგი #${item.code}` : 'მუნიციპალური პარკინგი',
      categoryLabel: '🅿️ ზონალური პარკინგი',
      categoryBadgeClass: 'bg-emerald-100 text-emerald-950 border border-emerald-300',
      phone: item.phone || '032 293 30 50',
      website: item.website || 'https://parking.tbilisi.gov.ge',
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#065F46"/><rect x="6" y="6" width="24" height="24" rx="6" fill="#10B981"/><path d="M14 11H20C22.2 11 23.5 12.2 23.5 14.2C23.5 16.2 22.2 17.4 20 17.4H17V24H14V11ZM17 13.2V15.2H19.8C20.8 15.2 21.3 14.8 21.3 14.2C21.3 13.6 20.8 13.2 19.8 13.2H17Z" fill="#FFFFFF"/></svg>`
    };
  }

  // 5. RADAR & SPEED CAMERAS
  if (item.type === 'radar' || combined.includes('radar') || combined.includes('კამერა') || combined.includes('რადარ')) {
    const isSection = combined.includes('section') || combined.includes('სექცი');
    return {
      brandName: isSection ? 'სექციური სიჩქარის კონტროლი' : 'საგზაო სიჩქარის რადარი (MVD)',
      categoryLabel: item.speed_limit_kmh ? `📷 რადარი (${item.speed_limit_kmh} კმ/სთ)` : '📷 რადარი / კამერა',
      categoryBadgeClass: 'bg-red-100 text-red-950 border border-red-300',
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#1E3A8A"/><path d="M18 6L26 9.5V17C26 22.5 22.5 26.5 18 29C13.5 26.5 10 22.5 10 17V9.5L18 6Z" fill="#2563EB" stroke="#F59E0B" stroke-width="1.5"/><path d="M18 11.5L19.5 15.2L23.5 15.5L20.4 18L21.5 22L18 19.8L14.5 22L15.6 18L12.5 15.5L16.5 15.2L18 11.5Z" fill="#F59E0B"/></svg>`
    };
  }

  // 6. SHOWROOM / DEALERS
  if (item.type === 'showroom' || combined.includes('mercedes') || combined.includes('bmw') || combined.includes('toyota') || combined.includes('audi') || combined.includes('hyundai') || combined.includes('ford') || combined.includes('porsche')) {
    const matchedBrand =
      combined.includes('bmw') ? 'BMW' :
      combined.includes('mercedes') ? 'Mercedes-Benz' :
      combined.includes('toyota') ? 'Toyota' :
      combined.includes('audi') ? 'Audi' :
      combined.includes('hyundai') ? 'Hyundai' :
      combined.includes('porsche') ? 'Porsche' :
      combined.includes('ford') ? 'Ford' :
      (item.brand || 'ავტოსალონი');
    return {
      brandName: `${matchedBrand} • ოფიციალური დილერი`,
      categoryLabel: '🏢 ავტოსალონი',
      categoryBadgeClass: 'bg-slate-100 text-slate-950 border border-slate-300',
      phone: item.phone,
      website: item.website,
      logoSvg: `<svg viewBox="0 0 36 36" class="w-full h-full"><rect width="36" height="36" rx="8" fill="#18181B"/><circle cx="18" cy="18" r="11" fill="none" stroke="#F59E0B" stroke-width="2"/><text x="18" y="22" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#F59E0B" text-anchor="middle">★</text></svg>`
    };
  }

  // 7. CAR WASH / JAMS / REPAIR / HAZARDS
  const fallbackIcons: Record<string, { label: string; bg: string; color: string; icon: string }> = {
    car_wash: { label: '🧼 ავტოსამრეცხაო', bg: 'bg-sky-100 text-sky-950 border border-sky-300', color: '#0284C7', icon: '🧼' },
    traffic_jam: { label: '🔴 საგზაო საცობი', bg: 'bg-rose-100 text-rose-950 border border-rose-300', color: '#E11D48', icon: '🔴' },
    road_repair: { label: '🚧 საგზაო სამუშაოები', bg: 'bg-amber-100 text-amber-950 border border-amber-300', color: '#D97706', icon: '🚧' },
    hazard: { label: '⚠️ საგზაო საფრთხე', bg: 'bg-red-100 text-red-950 border border-red-300', color: '#DC2626', icon: '⚠️' }
  };
  const fb = fallbackIcons[item.type] || { label: item.title, bg: 'bg-slate-100 text-slate-800 border border-slate-300', color: '#475569', icon: '📍' };

  return {
    brandName: item.brand || item.title || 'საგზაო ობიექტი',
    categoryLabel: fb.label,
    categoryBadgeClass: fb.bg,
    phone: item.phone,
    website: item.website,
    logoSvg: `<div class="w-full h-full flex items-center justify-center text-base bg-slate-50">${fb.icon}</div>`
  };
}
