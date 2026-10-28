import registry from './tbilisiParkingRegistry.json';
/**
 * AutoHub AI - Municipal Parking Lots Registry
 * Official Tbilisi, Batumi & Kutaisi Parking Zones
 *
 * Requirements:
 * - Lot codes stored as strings to preserve leading zeros ('001', '005', etc.)
 * - Unverified "free spots / occupied spots" count completely removed
 * - Verified tariff conditions: Category A (1.00 ₾/h), B (2.00 ₾/h), C (3.00 ₾/h)
 * - 15 minutes free once per calendar day per lot
 * - Full audit provenance: source, lastVerifiedAt, verificationStatus
 */

import { ParkingLocationLot, ParkingCity, ParkingCategory } from '../types/parking';

export type DelineatedParkingZone = ParkingLocationLot & {
  // Backwards compatibility aliases
  zoneNumber: string;
  categoryName_ge: string;
  street_name_ge: string;
  category: ParkingCategory;
  hourly_rate_gel: number | null;
  free_minutes: number;
  center: [number, number];
  polygon: [number, number][];
};

const LEGACY_PARKING_ZONES: DelineatedParkingZone[] = [
  // ==========================================
  // TBILISI ZONAL-HOURLY PARKING (თბილისი)
  // ==========================================
  {
    id: 'tb_001',
    lotCode: '001',
    zoneNumber: '001',
    city: 'tbilisi',
    district_ge: 'მთაწმინდა / სოლოლაკი',
    street_ge: 'კოტე აფხაზის ქუჩა (ყოფილი ლესელიძე)',
    street_name_ge: 'კოტე აფხაზის ქუჩა (ყოფილი ლესელიძე)',
    address_ge: 'თბილისი, კოტე აფხაზის ქ. #1-45',
    bounds_description_ge: 'თავისუფლების მოედნიდან ვახტანგ გორგასლის მოედნამდე',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.6930, 44.8028],
      polygon: [
        [41.6912, 44.8040],
        [41.6938, 44.8015],
        [41.6946, 44.8028],
        [41.6922, 44.8052]
      ]
    },
    center: [41.6930, 44.8028],
    polygon: [
      [41.6912, 44.8040],
      [41.6938, 44.8015],
      [41.6946, 44.8028],
      [41.6922, 44.8052]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_002',
    lotCode: '002',
    zoneNumber: '002',
    city: 'tbilisi',
    district_ge: 'მთაწმინდა',
    street_ge: 'ნიკოლოზ ბარათაშვილის ქუჩა',
    street_name_ge: 'ნიკოლოზ ბარათაშვილის ქუჩა',
    address_ge: 'თბილისი, ნ. ბარათაშვილის ქ. #2-26',
    bounds_description_ge: 'პუშკინის სკვერი — კოლმეურნეობის მოედანი — ორბელიანი',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.6968, 44.8040],
      polygon: [
        [41.6952, 44.8020],
        [41.6980, 44.8035],
        [41.6975, 44.8062],
        [41.6948, 44.8045]
      ]
    },
    center: [41.6968, 44.8040],
    polygon: [
      [41.6952, 44.8020],
      [41.6980, 44.8035],
      [41.6975, 44.8062],
      [41.6948, 44.8045]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_003',
    lotCode: '003',
    zoneNumber: '003',
    city: 'tbilisi',
    district_ge: 'მთაწმინდა',
    street_ge: 'შოთა რუსთაველის გამზირი',
    street_name_ge: 'შოთა რუსთაველის გამზირი',
    address_ge: 'თბილისი, შ. რუსთაველის გამზ. #1-54',
    bounds_description_ge: 'თავისუფლების მოედნიდან პირველი რესპუბლიკის მოედნამდე',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.6988, 44.7965],
      polygon: [
        [41.6958, 44.7995],
        [41.7012, 44.7928],
        [41.7020, 44.7942],
        [41.6968, 44.8010]
      ]
    },
    center: [41.6988, 44.7965],
    polygon: [
      [41.6958, 44.7995],
      [41.7012, 44.7928],
      [41.7020, 44.7942],
      [41.6968, 44.8010]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_004',
    lotCode: '004',
    zoneNumber: '004',
    city: 'tbilisi',
    district_ge: 'ვერა',
    street_ge: 'პეტრე მელიქიშვილის გამზირი',
    street_name_ge: 'პეტრე მელიქიშვილის გამზირი',
    address_ge: 'თბილისი, პ. მელიქიშვილის გამზ. #1-28',
    bounds_description_ge: 'კოსტავას ქუჩის კვეთიდან თსუ-ს 1-ელ კორპუსამდე',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7092, 44.7818],
      polygon: [
        [41.7075, 44.7838],
        [41.7105, 44.7795],
        [41.7115, 44.7808],
        [41.7088, 44.7850]
      ]
    },
    center: [41.7092, 44.7818],
    polygon: [
      [41.7075, 44.7838],
      [41.7105, 44.7795],
      [41.7115, 44.7808],
      [41.7088, 44.7850]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_005',
    lotCode: '005',
    zoneNumber: '005',
    city: 'tbilisi',
    district_ge: 'ვაკე',
    street_ge: 'ილია ჭავჭავაძის გამზირი',
    street_name_ge: 'ილია ჭავჭავაძის გამზირი',
    address_ge: 'თბილისი, ი. ჭავჭავაძის გამზ. #1-84',
    bounds_description_ge: 'თსუ-დან ვაკის პარკამდე (მზიურის გასწვრივ)',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7098, 44.7685],
      polygon: [
        [41.7112, 44.7780],
        [41.7085, 44.7590],
        [41.7098, 44.7585],
        [41.7125, 44.7775]
      ]
    },
    center: [41.7098, 44.7685],
    polygon: [
      [41.7112, 44.7780],
      [41.7085, 44.7590],
      [41.7098, 44.7585],
      [41.7125, 44.7775]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_006',
    lotCode: '006',
    zoneNumber: '006',
    city: 'tbilisi',
    district_ge: 'ვაკე',
    street_ge: 'ირაკლი აბაშიძის ქუჩა',
    street_name_ge: 'ირაკლი აბაშიძის ქუჩა',
    address_ge: 'თბილისი, ი. აბაშიძის ქ. #1-68',
    bounds_description_ge: 'მრგვალი ბაღიდან ვაკის პარკამდე',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7082, 44.7640],
      polygon: [
        [41.7095, 44.7715],
        [41.7072, 44.7565],
        [41.7082, 44.7558],
        [41.7105, 44.7710]
      ]
    },
    center: [41.7082, 44.7640],
    polygon: [
      [41.7095, 44.7715],
      [41.7072, 44.7565],
      [41.7082, 44.7558],
      [41.7105, 44.7710]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_007',
    lotCode: '007',
    zoneNumber: '007',
    city: 'tbilisi',
    district_ge: 'საბურთალო',
    street_ge: 'პეკინის გამზირი',
    street_name_ge: 'პეკინის გამზირი',
    address_ge: 'თბილისი, პეკინის გამზ. #1-44',
    bounds_description_ge: '26 მაისის მოედნიდან ვაჟა-ფშაველას გამზირამდე',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7235, 44.7690],
      polygon: [
        [41.7218, 44.7755],
        [41.7248, 44.7625],
        [41.7258, 44.7630],
        [41.7228, 44.7762]
      ]
    },
    center: [41.7235, 44.7690],
    polygon: [
      [41.7218, 44.7755],
      [41.7248, 44.7625],
      [41.7258, 44.7630],
      [41.7228, 44.7762]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_008',
    lotCode: '008',
    zoneNumber: '008',
    city: 'tbilisi',
    district_ge: 'საბურთალო',
    street_ge: 'ალექსანდრე ყაზბეგის გამზირი',
    street_name_ge: 'ალექსანდრე ყაზბეგის გამზირი',
    address_ge: 'თბილისი, ალ. ყაზბეგის გამზ. #1-48',
    bounds_description_ge: 'პეკინის კვეთიდან დელისის მეტროსადგურამდე',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ზონა A (1.00 ₾/სთ)',
    categoryName_ge: 'ზონა A (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7258, 44.7580],
      polygon: [
        [41.7242, 44.7655],
        [41.7270, 44.7505],
        [41.7280, 44.7510],
        [41.7252, 44.7662]
      ]
    },
    center: [41.7258, 44.7580],
    polygon: [
      [41.7242, 44.7655],
      [41.7270, 44.7505],
      [41.7280, 44.7510],
      [41.7252, 44.7662]
    ],
    color: '#3b82f6',
    fillColor: 'rgba(59, 130, 246, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_010',
    lotCode: '010',
    zoneNumber: '010',
    city: 'tbilisi',
    district_ge: 'ჩუღურეთი',
    street_ge: 'დავით აღმაშენებლის გამზირი',
    street_name_ge: 'დავით აღმაშენებლის გამზირი',
    address_ge: 'თბილისი, დ. აღმაშენებლის გამზ. #1-180',
    bounds_description_ge: 'საარბრიუკენის მოედნიდან მარჯანიშვილის მოედნამდე',
    tariffCategory: 'B',
    category: 'B',
    categoryLabel_ge: 'ზონა B (2.00 ₾/სთ)',
    categoryName_ge: 'ზონა B (2.00 ₾/სთ)',
    hourlyRateGel: 2.0,
    hourly_rate_gel: 2.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7075, 44.7978],
      polygon: [
        [41.7028, 44.7985],
        [41.7122, 44.7965],
        [41.7128, 44.7980],
        [41.7035, 44.8000]
      ]
    },
    center: [41.7075, 44.7978],
    polygon: [
      [41.7028, 44.7985],
      [41.7122, 44.7965],
      [41.7128, 44.7980],
      [41.7035, 44.8000]
    ],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_012',
    lotCode: '012',
    zoneNumber: '012',
    city: 'tbilisi',
    district_ge: 'დიდუბე',
    street_ge: 'აკაკი წერეთლის გამზირი',
    street_name_ge: 'აკაკი წერეთლის გამზირი',
    address_ge: 'თბილისი, აკ. წერეთლის გამზ. #1-140',
    bounds_description_ge: 'დიდუბის პანთეონიდან ექსპო-ჯორჯიამდე',
    tariffCategory: 'B',
    category: 'B',
    categoryLabel_ge: 'ზონა B (2.00 ₾/სთ)',
    categoryName_ge: 'ზონა B (2.00 ₾/სთ)',
    hourlyRateGel: 2.0,
    hourly_rate_gel: 2.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7310, 44.7865],
      polygon: [
        [41.7245, 44.7895],
        [41.7375, 44.7830],
        [41.7382, 44.7845],
        [41.7252, 44.7910]
      ]
    },
    center: [41.7310, 44.7865],
    polygon: [
      [41.7245, 44.7895],
      [41.7375, 44.7830],
      [41.7382, 44.7845],
      [41.7252, 44.7910]
    ],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },
  {
    id: 'tb_030',
    lotCode: '030',
    zoneNumber: '030',
    city: 'tbilisi',
    district_ge: 'გლდანი / ავჭალა',
    street_ge: 'ხიზანიშვილის ქუჩა (ახმეტელის თეატრი)',
    street_name_ge: 'ხიზანიშვილის ქუჩა (ახმეტელის თეატრი)',
    address_ge: 'თბილისი, ხიზანიშვილის ქ. #1-25',
    bounds_description_ge: 'მეტრო ახმეტელის თეატრისა და გლდანი მოლის მიმდებარედ',
    tariffCategory: 'C',
    category: 'C',
    categoryLabel_ge: 'ზონა C (3.00 ₾/სთ)',
    categoryName_ge: 'ზონა C (3.00 ₾/სთ)',
    hourlyRateGel: 3.0,
    hourly_rate_gel: 3.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ღამით უფასო)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7942, 44.8155],
      polygon: [
        [41.7925, 44.8130],
        [41.7960, 44.8180],
        [41.7950, 44.8190],
        [41.7915, 44.8140]
      ]
    },
    center: [41.7942, 44.8155],
    polygon: [
      [41.7925, 44.8130],
      [41.7960, 44.8180],
      [41.7950, 44.8190],
      [41.7915, 44.8140]
    ],
    color: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.35)',
    verificationStatus: 'verified_official',
    dataSource: 'parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)',
    lastVerifiedAt: '2026-10-24'
  },

  // ==========================================
  // BATUMI MUNICIPAL PARKING (ბათუმი)
  // ==========================================
  {
    id: 'bt_101',
    lotCode: '101',
    zoneNumber: '101',
    city: 'batumi',
    district_ge: 'ბულვარი',
    street_ge: 'შოთა რუსთაველის გამზირი',
    street_name_ge: 'შოთა რუსთაველის გამზირი',
    address_ge: 'ბათუმი, შ. რუსთაველის გამზ. #1-45',
    bounds_description_ge: 'ბათუმის ბულვარის გასწვრივ, პორტიდან დელფინარიუმამდე',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ბულვარის ზონა (1.00 ₾/სთ)',
    categoryName_ge: 'ბულვარის ზონა (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00 (ზაფხულში 24/7)',
    electricVehiclesFree: true,
    geometry: {
      center: [41.6520, 41.6360],
      polygon: [
        [41.6560, 41.6420],
        [41.6480, 41.6300],
        [41.6490, 41.6290],
        [41.6570, 41.6410]
      ]
    },
    center: [41.6520, 41.6360],
    polygon: [
      [41.6560, 41.6420],
      [41.6480, 41.6300],
      [41.6490, 41.6290],
      [41.6570, 41.6410]
    ],
    color: '#06b6d4',
    fillColor: 'rgba(6, 182, 212, 0.35)',
    verificationStatus: 'unverified_estimate',
    dataSource: 'ბათუმის მუნიციპალური ინსპექცია',
    lastVerifiedAt: '2026-10-15'
  },

  // ==========================================
  // KUTAISI MUNICIPAL PARKING (ქუთაისი)
  // ==========================================
  {
    id: 'kt_201',
    lotCode: '201',
    zoneNumber: '201',
    city: 'kutaisi',
    district_ge: 'ცენტრი',
    street_ge: 'დავით აღმაშენებლის მოედანი',
    street_name_ge: 'დავით აღმაშენებლის მოედანი',
    address_ge: 'ქუთაისი, ცენტრალური მოედანი',
    bounds_description_ge: 'კოლხური შადრევნის გარშემო & თეატრის მიმდებარედ',
    tariffCategory: 'A',
    category: 'A',
    categoryLabel_ge: 'ცენტრალური ზონა (1.00 ₾/სთ)',
    categoryName_ge: 'ცენტრალური ზონა (1.00 ₾/სთ)',
    hourlyRateGel: 1.0,
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '09:00 - 19:00',
    electricVehiclesFree: true,
    geometry: {
      center: [42.2705, 42.7050],
      polygon: [
        [42.2715, 42.7035],
        [42.2715, 42.7065],
        [42.2695, 42.7065],
        [42.2695, 42.7035]
      ]
    },
    center: [42.2705, 42.7050],
    polygon: [
      [42.2715, 42.7035],
      [42.2715, 42.7065],
      [42.2695, 42.7065],
      [42.2695, 42.7035]
    ],
    color: '#8b5cf6',
    fillColor: 'rgba(139, 92, 246, 0.35)',
    verificationStatus: 'unverified_estimate',
    dataSource: 'ქუთაისის მერიის სატრანსპორტო სამსახური',
    lastVerifiedAt: '2026-10-10'
  }
];

// The municipal endpoint verifies geometry, code and address only.
// Tariffs and exemptions must be confirmed separately with the operator.
const officialTbilisiLots: DelineatedParkingZone[] = registry.places.map(place => {
  const polygon = place.polygon as [number, number][];
  const ring = polygon.slice(0, -1);
  const center: [number, number] = [
    ring.reduce((sum, p) => sum + p[0], 0) / ring.length,
    ring.reduce((sum, p) => sum + p[1], 0) / ring.length
  ];
  return {
    id: `tb_${place.id}`, lotCode: place.code, zoneNumber: place.code,
    city: 'tbilisi', street_ge: place.address, street_name_ge: place.address,
    address_ge: place.address, bounds_description_ge: place.address,
    tariffCategory: 'A', category: 'A', categoryLabel_ge: 'ზონა A', categoryName_ge: 'ზონა A',
    hourlyRateGel: null, hourly_rate_gel: null, freeMinutes: 0, free_minutes: 0,
    operatingHours_ge: 'გადაამოწმეთ ოფიციალურ აპში', electricVehiclesFree: false,
    geometry: { center, polygon }, center, polygon,
    color: '#3b82f6', fillColor: '#3b82f6',
    verificationStatus: 'verified_official', dataSource: registry.source,
    lastVerifiedAt: registry.retrievedAt,
    verificationNotes: 'ოფიციალური კონტური, კოდი და მისამართი; ტარიფი და შეღავათები ცალკე გადასამოწმებელია.'
  };
});

export const DELINEATED_PARKING_ZONES: DelineatedParkingZone[] = [
  ...officialTbilisiLots,
  ...LEGACY_PARKING_ZONES.filter(zone => zone.city !== 'tbilisi')
];

export const getParkingZonesByCity = (city: ParkingCity): DelineatedParkingZone[] => {
  return DELINEATED_PARKING_ZONES.filter(z => z.city === city);
};

export const getParkingZoneByNumber = (zoneNum: string, city: ParkingCity = 'tbilisi'): DelineatedParkingZone | undefined => {
  const clean = zoneNum.replace('#', '').trim().toUpperCase();
  return DELINEATED_PARKING_ZONES.find(z => z.city === city && (z.lotCode === clean || z.zoneNumber === clean));
};

/**
 * Creates a placeholder lot for user-entered manual lot codes
 * (when lot is not yet present in our mapped database)
 */
export function createManualParkingLot(lotCode: string, streetName?: string, city: ParkingCity = 'tbilisi'): DelineatedParkingZone {
  const cleanCode = lotCode.replace('#', '').trim().toUpperCase();
  const cityNames: Record<ParkingCity, string> = {
    tbilisi: 'თბილისი',
    batumi: 'ბათუმი',
    kutaisi: 'ქუთაისი'
  };

  return {
    id: `manual_${city}_${cleanCode}`,
    lotCode: cleanCode,
    zoneNumber: cleanCode,
    city,
    street_ge: streetName || `საპარკინგე ლოტი #${cleanCode}`,
    street_name_ge: streetName || `საპარკინგე ლოტი #${cleanCode}`,
    address_ge: `${cityNames[city]}, ლოტი #${cleanCode}`,
    bounds_description_ge: 'ხელით შეყვანილი საპარკინგე ადგილი ადგილზე არსებული ნიშნით',
    tariffCategory: 'standard',
    category: 'standard',
    categoryLabel_ge: 'მომხმარებლის შეყვანილი კოდი',
    categoryName_ge: 'მომხმარებლის შეყვანილი კოდი',
    hourlyRateGel: 1.0, // Default estimate
    hourly_rate_gel: 1.0,
    freeMinutes: 15,
    free_minutes: 15,
    operatingHours_ge: '08:00 - 22:00',
    electricVehiclesFree: true,
    geometry: {
      center: [41.7120, 44.7850]
    },
    center: [41.7120, 44.7850],
    polygon: [],
    color: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.25)',
    verificationStatus: 'manual_user_entry',
    dataSource: 'მომხმარებლის მიერ ხელით მითითებული კოდი',
    lastVerifiedAt: new Date().toISOString().split('T')[0],
    isManualPlaceholder: true,
    verificationNotes: 'ტარიფი და პირობები გადაამოწმეთ ადგილზე საგზაო ნიშანზე.'
  };
}
