import { VehicleProfile } from '../types';

// =========================================================================
// 1. OWNER ACCOUNT VEHICLES (ჩემი ექაუნთი - მფლობელის ავტომობილები)
// =========================================================================
export const OWNER_VEHICLES: VehicleProfile[] = [
  // 1. პირველი მანქანა (სამუშაო სატესტო მოდელი რეალური ჯარიმებით)
  {
    id: 'CAR_01',
    brand: 'Mercedes-Benz',
    model: 'GLA 250',
    year: 2016,
    engine: '2.0L Turbo M270 (1991 cm³ / 208 HP)',
    vin: 'WDCTG4GB2GJ193791',
    plate_number: 'FR-282-EE',
    tech_passport: '22-3999',
    mileage_km: 78400,
    fuel_type: 'petrol',
    obd_ip: '192.168.0.10',
    obd_port: 35000,
    horsepower: 208,
    last_oil_change_km: 73200,
    pti_expiry_date: '2027-02-15',
    driver_license_points: 90,
    driver_personal_number: '01024085432',
    driver_name: 'გიორგი მაისურაძე',
    driver_phone: '+995 599 12 34 56'
  },
  // 2. მეორე მანქანა (ჩანს მხოლოდ ჩემს ექაუნთში)
  {
    id: 'CAR_02',
    brand: 'BMW',
    model: '330i M-Sport',
    year: 2023,
    engine: '2.0L TwinPower Turbo (255 HP)',
    vin: 'WBA5R1C50NFP12345',
    plate_number: 'GE-777-AA',
    tech_passport: 'AA9876543',
    mileage_km: 48200,
    fuel_type: 'petrol',
    obd_ip: '192.168.0.10',
    obd_port: 35000,
    horsepower: 255,
    driver_license_points: 100,
    driver_personal_number: '01024085432',
    driver_name: 'გიორგი მაისურაძე',
    driver_phone: '+995 599 12 34 56'
  }
];

// Default export for backward compatibility
export const VEHICLE_PRESETS: VehicleProfile[] = OWNER_VEHICLES;

// =========================================================================
// 2. VISITOR / GUEST VEHICLE (შემოსული სტუმრის საწყისი სუფთა პროფილი)
// ვინც შევა, შეავსებს საკუთარი ავტომობილის მიხედვით.
// =========================================================================
export const VISITOR_INITIAL_VEHICLE: VehicleProfile = {
  id: 'VISITOR_CAR_01',
  brand: 'ჩემი ავტომობილი',
  model: '',
  year: 2020,
  engine: '2.0L',
  vin: '',
  plate_number: '',
  tech_passport: '',
  mileage_km: 50000,
  fuel_type: 'petrol',
  obd_ip: '192.168.0.10',
  obd_port: 35000,
  driver_license_points: 100,
  driver_personal_number: '',
  driver_name: '',
  driver_phone: ''
};
