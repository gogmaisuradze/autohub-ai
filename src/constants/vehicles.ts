import { VehicleProfile } from '../types';

export const VEHICLE_PRESETS: VehicleProfile[] = [
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
    driver_personal_number: '01024085521',
    driver_name: 'გიორგი მაისურაძე'
  },
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
    obd_port: 35000
  },
  {
    id: 'CAR_03',
    brand: 'Porsche',
    model: 'Taycan 4S',
    year: 2024,
    engine: 'Dual Electric AWD (530 HP)',
    vin: 'WP0AB2Y15PSA99881',
    plate_number: 'POR-911-GE',
    tech_passport: 'BB4455667',
    mileage_km: 19400,
    fuel_type: 'electric',
    obd_ip: '192.168.0.10',
    obd_port: 35000
  },
  {
    id: 'CAR_04',
    brand: 'Toyota',
    model: 'RAV4 Hybrid AWD',
    year: 2022,
    engine: '2.5L Dynamic Force Hybrid (219 HP)',
    vin: '2T3C1RFV8NC223344',
    plate_number: 'TOY-555-TT',
    tech_passport: 'CC1122334',
    mileage_km: 67300,
    fuel_type: 'hybrid',
    obd_ip: '192.168.0.10',
    obd_port: 35000
  }
];
