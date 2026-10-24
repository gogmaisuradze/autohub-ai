export interface DelineatedParkingZone {
  id: string;
  zoneNumber: string; // Official Zone ID: '01', '02', '03', '05', etc.
  city: 'tbilisi' | 'batumi' | 'kutaisi';
  category: 'A' | 'B' | 'C';
  categoryName_ge: string;
  title_ge: string;
  street_name_ge: string;
  bounds_description_ge: string;
  hourly_rate_gel: number;
  free_minutes: number;
  total_spots: number;
  occupied_spots: number;
  center: [number, number];
  polygon: [number, number][];
  color: string;
  fillColor: string;
}

export const DELINEATED_PARKING_ZONES: DelineatedParkingZone[] = [
  // ==========================================
  // TBILISI ZONAL-HOURLY PARKING (თბილისი)
  // ==========================================
  {
    id: 'tb_01',
    zoneNumber: '01',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #01 — კოტე აფხაზის ქუჩა (სოლოლაკი)',
    street_name_ge: 'კოტე აფხაზის ქუჩა (ყოფილი ლესელიძე)',
    bounds_description_ge: 'თავისუფლების მოედნიდან ვახტანგ გორგასლის მოედნამდე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 48,
    occupied_spots: 32,
    center: [41.6930, 44.8028],
    polygon: [
      [41.6912, 44.8040],
      [41.6938, 44.8015],
      [41.6946, 44.8028],
      [41.6922, 44.8052]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_02',
    zoneNumber: '02',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #02 — ბარათაშვილის ქ. & ორბელიანი',
    street_name_ge: 'ნიკოლოზ ბარათაშვილის ქუჩა',
    bounds_description_ge: 'პუშკინის სკვერი — კოლმეურნეობის მოედანი — ორბელიანი',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 55,
    occupied_spots: 39,
    center: [41.6968, 44.8040],
    polygon: [
      [41.6952, 44.8020],
      [41.6980, 44.8035],
      [41.6975, 44.8062],
      [41.6948, 44.8045]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_03',
    zoneNumber: '03',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #03 — შოთა რუსთაველის გამზირი',
    street_name_ge: 'შოთა რუსთაველის გამზირი',
    bounds_description_ge: 'თავისუფლების მოედნიდან პირველი რესპუბლიკის მოედნამდე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 72,
    occupied_spots: 58,
    center: [41.6988, 44.7965],
    polygon: [
      [41.6958, 44.7995],
      [41.7012, 44.7928],
      [41.7020, 44.7942],
      [41.6968, 44.8010]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_04',
    zoneNumber: '04',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #04 — მელიქიშვილის გამზირი & ვერა',
    street_name_ge: 'პეტრე მელიქიშვილის გამზირი',
    bounds_description_ge: 'კოსტავას ქუჩის კვეთიდან თსუ-ს 1-ელ კორპუსამდე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 44,
    occupied_spots: 28,
    center: [41.7092, 44.7818],
    polygon: [
      [41.7075, 44.7838],
      [41.7105, 44.7795],
      [41.7115, 44.7808],
      [41.7088, 44.7850]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_05',
    zoneNumber: '05',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #05 — ილია ჭავჭავაძის გამზირი (ვაკე)',
    street_name_ge: 'ილია ჭავჭავაძის გამზირი',
    bounds_description_ge: 'თსუ-დან ვაკის პარკამდე (მზიურის გასწვრივ)',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 96,
    occupied_spots: 68,
    center: [41.7098, 44.7685],
    polygon: [
      [41.7112, 44.7780],
      [41.7085, 44.7590],
      [41.7098, 44.7585],
      [41.7125, 44.7775]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_06',
    zoneNumber: '06',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #06 — ირაკლი აბაშიძის ქუჩა (ვაკე)',
    street_name_ge: 'ირაკლი აბაშიძის ქუჩა',
    bounds_description_ge: 'მრგვალი ბაღიდან ვაკის პარკამდე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 60,
    occupied_spots: 45,
    center: [41.7082, 44.7640],
    polygon: [
      [41.7095, 44.7715],
      [41.7072, 44.7565],
      [41.7082, 44.7558],
      [41.7105, 44.7710]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_07',
    zoneNumber: '07',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #07 — პეკინის გამზირი (საბურთალო)',
    street_name_ge: 'პეკინის გამზირი',
    bounds_description_ge: '26 მაისის მოედნიდან ვაჟა-ფშაველას გამზირამდე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 84,
    occupied_spots: 52,
    center: [41.7235, 44.7690],
    polygon: [
      [41.7218, 44.7755],
      [41.7248, 44.7625],
      [41.7258, 44.7630],
      [41.7228, 44.7762]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_08',
    zoneNumber: '08',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #08 — ალექსანდრე ყაზბეგის გამზირი',
    street_name_ge: 'ალექსანდრე ყაზბეგის გამზირი',
    bounds_description_ge: 'პეკინის კვეთიდან დელისის მეტროსადგურამდე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 68,
    occupied_spots: 41,
    center: [41.7258, 44.7580],
    polygon: [
      [41.7242, 44.7655],
      [41.7270, 44.7505],
      [41.7280, 44.7510],
      [41.7252, 44.7662]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_09',
    zoneNumber: '09',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #09 — ვაჟა-ფშაველას გამზირი',
    street_name_ge: 'ვაჟა-ფშაველას გამზირი',
    bounds_description_ge: 'სამედიცინო უნივერსიტეტი — დელისი — ქავთარაძე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 75,
    occupied_spots: 50,
    center: [41.7245, 44.7535],
    polygon: [
      [41.7260, 44.7625],
      [41.7228, 44.7450],
      [41.7238, 44.7445],
      [41.7270, 44.7618]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_10',
    zoneNumber: '10',
    city: 'tbilisi',
    category: 'B',
    categoryName_ge: 'ზონა B (2.00 ₾/სთ)',
    title_ge: 'ზონა #10 — დავით აღმაშენებლის გამზირი',
    street_name_ge: 'დავით აღმაშენებლის გამზირი (ჩუღურეთი)',
    bounds_description_ge: 'საარბრიუკენის მოედნიდან მარჯანიშვილის მოედნამდე',
    hourly_rate_gel: 2.0,
    free_minutes: 15,
    total_spots: 65,
    occupied_spots: 47,
    center: [41.7075, 44.7978],
    polygon: [
      [41.7028, 44.7985],
      [41.7122, 44.7965],
      [41.7128, 44.7980],
      [41.7035, 44.8000]
    ],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.35)'
  },
  {
    id: 'tb_11',
    zoneNumber: '11',
    city: 'tbilisi',
    category: 'B',
    categoryName_ge: 'ზონა B (2.00 ₾/სთ)',
    title_ge: 'ზონა #11 — კოტე მარჯანიშვილის ქუჩა',
    street_name_ge: 'კოტე მარჯანიშვილის ქუჩა',
    bounds_description_ge: 'მარჯანიშვილის მოედანი — რკინიგზის სადგურის მიმართულება',
    hourly_rate_gel: 2.0,
    free_minutes: 15,
    total_spots: 50,
    occupied_spots: 36,
    center: [41.7100, 44.8010],
    polygon: [
      [41.7088, 44.7970],
      [41.7108, 44.8052],
      [41.7118, 44.8048],
      [41.7098, 44.7965]
    ],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.35)'
  },
  {
    id: 'tb_12',
    zoneNumber: '12',
    city: 'tbilisi',
    category: 'B',
    categoryName_ge: 'ზონა B (2.00 ₾/სთ)',
    title_ge: 'ზონა #12 — აკაკი წერეთლის გამზირი (დიდუბე)',
    street_name_ge: 'აკაკი წერეთლის გამზირი',
    bounds_description_ge: 'დიდუბის ხიდიდან ექსპო ჯორჯიამდე',
    hourly_rate_gel: 2.0,
    free_minutes: 15,
    total_spots: 88,
    occupied_spots: 55,
    center: [41.7350, 44.7865],
    polygon: [
      [41.7248, 44.7905],
      [41.7452, 44.7825],
      [41.7458, 44.7840],
      [41.7255, 44.7920]
    ],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.35)'
  },
  {
    id: 'tb_14',
    zoneNumber: '14',
    city: 'tbilisi',
    category: 'B',
    categoryName_ge: 'ზონა B (2.00 ₾/სთ)',
    title_ge: 'ზონა #14 — ისანი / ნავთლუღის ტერიტორია',
    street_name_ge: 'ქეთევან დედოფლის გამზირი (ისანი)',
    bounds_description_ge: 'ისნის მეტრო — ნავთლუღის ბაზრობის მიმდებარე',
    hourly_rate_gel: 2.0,
    free_minutes: 15,
    total_spots: 70,
    occupied_spots: 44,
    center: [41.6875, 44.8420],
    polygon: [
      [41.6882, 44.8350],
      [41.6860, 44.8485],
      [41.6872, 44.8490],
      [41.6894, 44.8355]
    ],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.35)'
  },
  {
    id: 'tb_21',
    zoneNumber: '21',
    city: 'tbilisi',
    category: 'B',
    categoryName_ge: 'ზონა B (2.00 ₾/სთ)',
    title_ge: 'ზონა #21 — ორთაჭალა / გორგასლის გამზირი',
    street_name_ge: 'ვახტანგ გორგასლის გამზირი',
    bounds_description_ge: 'აბანოთუბანი — სამინისტროების ქუჩა — ორთაჭალის ტურგენევი',
    hourly_rate_gel: 2.0,
    free_minutes: 15,
    total_spots: 60,
    occupied_spots: 35,
    center: [41.6785, 44.8230],
    polygon: [
      [41.6822, 44.8152],
      [41.6748, 44.8305],
      [41.6760, 44.8315],
      [41.6834, 44.8162]
    ],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.35)'
  },
  {
    id: 'tb_25',
    zoneNumber: '25',
    city: 'tbilisi',
    category: 'A',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    title_ge: 'ზონა #25 — ავლაბარი & მეტეხი',
    street_name_ge: 'მეტეხის აღმართი & ევროპის მოედანი',
    bounds_description_ge: 'რიყის პარკი — ევროპის მოედანი — მეტეხის ეკლესია',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 45,
    occupied_spots: 38,
    center: [41.6925, 44.8150],
    polygon: [
      [41.6908, 44.8125],
      [41.6938, 44.8182],
      [41.6948, 44.8172],
      [41.6918, 44.8115]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'tb_30',
    zoneNumber: '30',
    city: 'tbilisi',
    category: 'C',
    categoryName_ge: 'ზონა C (3.00 ₾/სთ)',
    title_ge: 'ზონა #30 — გლდანი (ახმეტელის მეტრო)',
    street_name_ge: 'ომარ ხიზანიშვილის ქუჩა',
    bounds_description_ge: 'ახმეტელის თეატრის მეტრო — გლდანი მოლის მიმდებარე',
    hourly_rate_gel: 3.0,
    free_minutes: 15,
    total_spots: 110,
    occupied_spots: 78,
    center: [41.7990, 44.8200],
    polygon: [
      [41.7948, 44.8182],
      [41.8022, 44.8232],
      [41.8032, 44.8218],
      [41.7958, 44.8168]
    ],
    color: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.35)'
  },
  {
    id: 'tb_31',
    zoneNumber: '31',
    city: 'tbilisi',
    category: 'C',
    categoryName_ge: 'ზონა C (3.00 ₾/სთ)',
    title_ge: 'ზონა #31 — ვარკეთილი (ჯავახეთის ქუჩა)',
    street_name_ge: 'ჯავახეთის ქუჩა',
    bounds_description_ge: 'ვარკეთილის მეტროსადგურის მიმდებარე მოედანი',
    hourly_rate_gel: 3.0,
    free_minutes: 15,
    total_spots: 85,
    occupied_spots: 60,
    center: [41.7040, 44.8845],
    polygon: [
      [41.7052, 44.8778],
      [41.7018, 44.8902],
      [41.7028, 44.8912],
      [41.7062, 44.8788]
    ],
    color: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.35)'
  },

  // ==========================================
  // BATUMI MUNICIPAL PARKING (ბათუმი)
  // ==========================================
  {
    id: 'bat_101',
    zoneNumber: '101',
    city: 'batumi',
    category: 'A',
    categoryName_ge: 'ბულვარის ზონა (1.00 ₾/სთ)',
    title_ge: 'ზონა #101 — ბათუმის ბულვარი & რუსთაველი',
    street_name_ge: 'შოთა რუსთაველის გამზირი',
    bounds_description_ge: 'ზღვისპირა პარკი — პორტის მიმართულება',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 65,
    occupied_spots: 45,
    center: [41.6530, 41.6375],
    polygon: [
      [41.6510, 41.6358],
      [41.6552, 41.6392],
      [41.6560, 41.6378],
      [41.6518, 41.6344]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'bat_102',
    zoneNumber: '102',
    city: 'batumi',
    category: 'A',
    categoryName_ge: 'ძველი ბათუმი (1.50 ₾/სთ)',
    title_ge: 'ზონა #102 — ძველი ბათუმი & ევროპის მოედანი',
    street_name_ge: 'მემედ აბაშიძის ქუჩა',
    bounds_description_ge: 'ევროპის მოედანი — პიაცას მიმდებარე',
    hourly_rate_gel: 1.5,
    free_minutes: 15,
    total_spots: 50,
    occupied_spots: 40,
    center: [41.6505, 41.6435],
    polygon: [
      [41.6488, 41.6418],
      [41.6522, 41.6452],
      [41.6530, 41.6438],
      [41.6496, 41.6404]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'bat_103',
    zoneNumber: '103',
    city: 'batumi',
    category: 'A',
    categoryName_ge: 'კომერციული ზონა (1.00 ₾/სთ)',
    title_ge: 'ზონა #103 — ზურაბ გორგილაძის ქუჩა',
    street_name_ge: 'ზურაბ გორგილაძის ქუჩა',
    bounds_description_ge: 'ჭავჭავაძის გამზირის პარალელური მონაკვეთი',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 55,
    occupied_spots: 33,
    center: [41.6465, 41.6410],
    polygon: [
      [41.6448, 41.6378],
      [41.6482, 41.6442],
      [41.6490, 41.6430],
      [41.6456, 41.6366]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },

  // ==========================================
  // KUTAISI MUNICIPAL PARKING (ქუთაისი)
  // ==========================================
  {
    id: 'kut_201',
    zoneNumber: '201',
    city: 'kutaisi',
    category: 'A',
    categoryName_ge: 'ცენტრალური ზონა (1.00 ₾/სთ)',
    title_ge: 'ზონა #201 — დავით აღმაშენებლის მოედანი',
    street_name_ge: 'დავით აღმაშენებლის მოედანი & წერეთელი',
    bounds_description_ge: 'ცენტრალური მოედანი — თეატრის მიმდებარე',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 60,
    occupied_spots: 38,
    center: [42.2695, 42.7070],
    polygon: [
      [42.2678, 42.7048],
      [42.2712, 42.7092],
      [42.2720, 42.7080],
      [42.2686, 42.7036]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  },
  {
    id: 'kut_202',
    zoneNumber: '202',
    city: 'kutaisi',
    category: 'A',
    categoryName_ge: 'ისტორიული ზონა (1.00 ₾/სთ)',
    title_ge: 'ზონა #202 — თეთრი ხიდი & რუსთაველი',
    street_name_ge: 'შოთა რუსთაველის ქუჩა (ქუთაისი)',
    bounds_description_ge: 'თეთრი ხიდის მიმდებარე სანაპირო ტერიტორია',
    hourly_rate_gel: 1.0,
    free_minutes: 15,
    total_spots: 45,
    occupied_spots: 25,
    center: [42.2715, 42.7005],
    polygon: [
      [42.2698, 42.6978],
      [42.2732, 42.7032],
      [42.2740, 42.7020],
      [42.2706, 42.6966]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)'
  }
];

export const getParkingZonesByCity = (city: 'tbilisi' | 'batumi' | 'kutaisi'): DelineatedParkingZone[] => {
  return DELINEATED_PARKING_ZONES.filter(z => z.city === city);
};

export const getParkingZoneByNumber = (zoneNum: string, city: 'tbilisi' | 'batumi' | 'kutaisi' = 'tbilisi'): DelineatedParkingZone | undefined => {
  const clean = zoneNum.replace('#', '').trim();
  return DELINEATED_PARKING_ZONES.find(z => z.city === city && (z.zoneNumber === clean || z.zoneNumber === clean.padStart(2, '0')));
};
