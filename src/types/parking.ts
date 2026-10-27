/**
 * AutoHub AI - Tbilisi & Municipal Parking Types
 * Strictly distinguishes official lot codes, tariff categories, geometry, and verification provenance.
 */

export type ParkingCity = 'tbilisi' | 'batumi' | 'kutaisi';

export type ParkingCategory = 'A' | 'B' | 'C' | 'standard';

export type ParkingVerificationStatus =
  | 'verified_official'      // გადამოწმებულია ოფიციალური რეესტრიდან
  | 'operator_feed'          // ოპერატორის პირდაპირი არხი
  | 'manual_user_entry'      // მომხმარებლის მიერ ხელით შეყვანილი
  | 'unverified_estimate';   // დაუდასტურებელი მიახლოებითი გეომეტრია

export interface ParkingLocationLot {
  id: string;
  lotCode: string; // Saved as STRING to preserve leading zeros, e.g. "001", "005", "034"
  city: ParkingCity;
  district_ge?: string; // e.g. "ვაკე", "მთაწმინდა", "საბურთალო"
  street_ge: string;
  address_ge: string;
  bounds_description_ge: string;
  tariffCategory: ParkingCategory;
  categoryLabel_ge: string;
  hourlyRateGel: number | null; // e.g. 1.0, 2.0, 3.0 or null if unverified
  freeMinutes: number; // e.g. 15 (municipal rule: 15 minutes free once per day per lot)
  operatingHours_ge: string; // e.g. "08:00 - 22:00 (ღამით უფასო)"
  electricVehiclesFree: boolean;
  geometry: {
    center: [number, number]; // [latitude, longitude]
    polygon?: [number, number][]; // optional polygon bounds
  };
  color: string;
  fillColor: string;

  // Provenance & Audit fields:
  verificationStatus: ParkingVerificationStatus;
  dataSource: string; // e.g. "parking.tbilisi.gov.ge (მუნიციპალური რეესტრი)"
  lastVerifiedAt: string; // ISO date, e.g. "2026-10-24"
  verificationNotes?: string;
  isManualPlaceholder?: boolean;
}

export interface ParkingOperatorRequirements {
  title: string;
  items: {
    code: string;
    label_ge: string;
    description_ge: string;
    priority: 'critical' | 'high' | 'medium';
  }[];
}

export const TBILISI_OPERATOR_REQUIREMENTS: ParkingOperatorRequirements = {
  title: 'თბილისის სატრანსპორტო კომპანიასთან (TTC) და მერიასთან შეთანხმების მოთხოვნები',
  items: [
    {
      code: 'API_LOT_REGISTRY',
      label_ge: 'ოფიციალური ლოტების რეესტრი & GeoJSON',
      description_ge: 'ყველა ზონალური ლოტის ID, კოდი წამყვანი ნულებით, ზუსტი პოლიგონები WGS84 ფორმატში და სატარიფო კატეგორია.',
      priority: 'critical'
    },
    {
      code: 'API_PARKING_ACTIVATION',
      label_ge: 'სესიის აქტივაციის B2B ენდფოინთი',
      description_ge: 'ავტომობილის ნომრითა და ლოტის კოდით პარკირების დაწყება, გაგრძელება და შეწყვეტა ოფიციალური ტრანზაქციის ID-ით.',
      priority: 'critical'
    },
    {
      code: 'API_FREE_LIMIT_CHECK',
      label_ge: '15-წუთიანი უფასო ლიმიტის სტატუსი',
      description_ge: 'შემოწმება: გამოიყენა თუ არა მოცემულმა ავტომობილმა დღიური 15-წუთიანი უფასო ლიმიტი ამ კონკრეტულ ლოტზე.',
      priority: 'high'
    },
    {
      code: 'DATA_COMMERCIAL_LICENSE',
      label_ge: 'მონაცემთა კომერციული გამოყენების ლიცენზია',
      description_ge: 'ოფიციალური ხელშეკრულება მუნიციპალიტეტთან, რადგან საჯარო რუკის (msmap) სკრეიპინგი არ იძლევა კომერციულ ნებართვას.',
      priority: 'critical'
    },
    {
      code: 'API_REALTIME_SENSORS',
      label_ge: 'IoT ცოცხალი სენსორების სტრიმინგი',
      description_ge: 'თუ მუნიციპალიტეტი დაამონტაჟებს ადგილზე სენსორებს, თავისუფალი ადგილების რეალურ დროში მიღება (ამჟამად საჯაროდ არ არსებობს).',
      priority: 'medium'
    }
  ]
};
