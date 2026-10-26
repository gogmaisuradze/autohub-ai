export interface DtcCode {
  code: string;
  title_ge: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  safe_to_drive: boolean;
  advice: string;
  estimated_cost_gel?: number;
  category: 'engine' | 'emissions' | 'brakes' | 'transmission' | 'electrical';
  timestamp?: string;
}

export interface TelemetryData {
  rpm: number;
  speed: number;
  coolant_temp: number;
  battery_voltage: number;
  fuel_trim_st: number; // Short term fuel trim %
  fuel_trim_lt: number; // Long term fuel trim %
  throttle_position: number; // %
  intake_air_temp: number; // °C
  oil_pressure_psi: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  car_context?: any;
}

export interface FinePaymentReceipt {
  txn_id: string;
  ticket_number: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  auth_code: string;
  card_last4?: string;
  payer_name?: string;
}

export interface FineItem {
  id: string;
  ticket_number?: string;
  amount_gel: number;
  discounted_amount_gel: number;
  discount_expires_days: number;
  date: string;
  location: string;
  violation_type: string;
  plate_number: string;
  status: 'pending' | 'paid';
  photo_url?: string;
  points_deducted?: number; // e.g. 10, 5, 15, 0
  points_status?: 'deducted' | 'video_exempt' | 'warning';
  points_explanation_ge?: string;
  article_law_ge?: string; // მაგ: "მუხლი 125, ნაწილი 1"
  payment_receipt?: FinePaymentReceipt;
}

export interface ParkingFineItem {
  id: string;
  city: 'tbilisi' | 'batumi' | 'kutaisi' | 'rustavi';
  fine_type: 'zone_overtime' | 'illegal_parking' | 'sidewalk' | 'bus_lane';
  title_ge: string;
  amount_gel: number;
  penalty_date: string;
  due_days_left: number; // Days before 150 GEL sauravi applies
  status: 'pending' | 'paid';
  location: string;
  photo_url?: string;
  ticket_number: string;
}

export interface ActiveParkingSession {
  isActive: boolean;
  city: 'tbilisi' | 'batumi' | 'kutaisi' | 'rustavi';
  zone: 'zone_a' | 'zone_b' | 'zone_c' | 'batumi_center' | 'kutaisi' | 'rustavi_center';
  zoneName_ge: string;
  hourlyRateGel: number;
  startTime: number; // timestamp
  elapsedSeconds: number;
  accumulatedCostGel: number;
  isFree15MinActive: boolean;
  freeMinRemaining: number;
  plateNumber: string;
}

export interface ParkingPermitItem {
  id: string;
  title_ge: string;
  city: 'tbilisi' | 'batumi' | 'kutaisi' | 'rustavi';
  permitType: 'annual_standard' | 'resident_free' | 'zone_pass' | 'batumi_annual' | 'rustavi_annual';
  cost_gel: number;
  expiryDate: string;
  isActive: boolean;
  plateNumber: string;
}

export type ServiceCategory =
  | 'chassis'    // 1. სავალი ნაწილი და ბორბლები (Chassis & Wheels)
  | 'fluids'     // 2. ზეთები და ტექნიკური სითხეები (Fluids)
  | 'filters'    // 3. ფილტრები და ჰაერის მიწოდება (Filters)
  | 'engine'     // 4. ძრავი და აალების სისტემა (Engine & Ignition)
  | 'electrical' // 5. ელექტროობა და კლიმატი (Electrical & AC)
  | 'legal'      // 6. იურიდიული, სავალდებულო და სადაზღვევო ვადები (Legal)
  | 'oil' | 'brakes' | 'filter' | 'tires' | 'pti' | 'other'; // legacy support

export type ServiceVariantKey =
  // 1. Chassis & Wheels
  | 'tires'
  | 'wheel_alignment'
  | 'brake_pads'
  | 'brake_discs'
  | 'shocks_mounts'
  | 'suspension_arms'
  // 2. Fluids
  | 'engine_oil'
  | 'transmission_fluid'
  | 'coolant'
  | 'brake_fluid'
  | 'power_steering_fluid'
  | 'differential_oil'
  // 3. Filters
  | 'engine_air_filter'
  | 'cabin_filter'
  | 'fuel_filter'
  // 4. Engine & Ignition
  | 'spark_plugs'
  | 'ignition_coils'
  | 'timing_belt_chain'
  | 'serpentine_belt'
  | 'throttle_cleaning'
  // 5. Electrical & AC
  | 'battery'
  | 'ac_system'
  | 'alternator_starter'
  // 6. Legal
  | 'pti'
  | 'insurance'
  | 'parking_permit'
  | 'driving_license'
  | 'custom'
  | 'other';

export interface ServiceItem {
  id: string;
  title_ge: string;
  category: ServiceCategory;
  variant_key?: ServiceVariantKey;
  variant_name_ge?: string;
  current_km: number;
  interval_km: number;
  remaining_km: number;
  remaining_days: number;
  last_service_date: string;
  last_service_km?: number;
  health_percentage: number;
  cost_gel?: number;
  part_cost_gel?: number; // ნაწილის/მასალის ღირებულება
  labor_cost_gel?: number; // ხელოსნის/მომსახურების ღირებულება
  custom_brand?: string; // ბრენდი/მწარმოებელი
  custom_part_number?: string; // არტიკული / ნაწილის კოდი
  is_custom_built?: boolean; // ინდივიდუალურად აწყობილი სერვისი
  notes?: string;

  // 1. Chassis & Wheels (სავალი ნაწილი და ბორბლები)
  tire_size?: string; // e.g. "225/45 R18"
  tire_season?: 'summer' | 'winter' | 'all_season';
  tire_brand?: string;
  tread_depth_mm?: number; // e.g. 7.0 mm
  tire_pressure_bar?: number; // e.g. 2.3 Bar / 33 PSI
  alignment_type?: 'alignment' | 'balancing' | 'both';
  alignment_axle?: 'front' | 'both';
  brake_position?: 'front' | 'rear' | 'both';
  brake_brand?: string;
  brake_wear_pct?: number; // e.g. 30% wear
  brake_disc_thickness_mm?: number; // e.g. 28 mm
  brake_disc_status?: 'new' | 'good' | 'turned' | 'replace_soon';
  brake_fluid_checked?: boolean;
  shocks_condition?: 'good' | 'leaking' | 'weak';
  shocks_brand?: string;
  suspension_parts_checked?: string;

  // 2. Fluids (ზეთები და ტექნიკური სითხეები)
  oil_viscosity?: string; // e.g. "5W-30"
  oil_brand?: string; // e.g. "Motul", "Liqui Moly"
  oil_liters?: number; // e.g. 5.2
  oil_filter_replaced?: boolean;
  transmission_fluid_type?: 'full' | 'partial';
  transmission_type?: 'atf' | 'zf8hp' | 'dsg' | 'cvt' | 'manual';
  transmission_filter_replaced?: boolean;
  transmission_fluid_brand?: string;
  coolant_freezing_point_c?: number; // e.g. -35°C
  coolant_spec?: string; // e.g. "G12+ (წითელი)", "G13"
  brake_fluid_moisture_pct?: number; // e.g. 0.8%
  brake_fluid_dot?: string; // "DOT 4", "DOT 5.1"
  power_steering_fluid_spec?: string; // e.g. "Pentosin CHF 11S"
  differential_system?: '4matic_awd' | 'rear_diff' | 'front_diff' | 'transfer_case';
  differential_spec?: string; // e.g. "75W-90 GL-5"

  // 3. Filters (ფილტრები და ჰაერის მიწოდება)
  filter_air?: boolean;
  filter_cabin?: boolean;
  filter_fuel?: boolean;
  filter_brand?: string;
  filter_cabin_type?: 'carbon' | 'standard';
  filter_fuel_engine?: 'petrol' | 'diesel';

  // 4. Engine & Ignition (ძრავი და აალების სისტემა)
  spark_plug_type?: 'iridium' | 'platinum' | 'standard';
  spark_plug_count?: number;
  spark_plug_brand?: string;
  ignition_coils_status?: string;
  timing_type?: 'belt' | 'chain';
  water_pump_replaced?: boolean;
  serpentine_belt_parts?: string;
  throttle_adapted?: boolean;

  // 5. Electrical & AC (ელექტროობა და კლიმატი)
  battery_capacity_ah?: number; // e.g. 80 Ah
  battery_voltage?: number; // e.g. 12.6 V
  battery_mfg_date?: string; // e.g. "2025/11"
  battery_brand?: string;
  ac_freon_grams?: number; // e.g. 550 g
  ac_freon_type?: string; // "R134a", "R1234yf"
  ac_compressor_oil_checked?: boolean;
  alternator_voltage_output?: number; // e.g. 14.2 V

  // 6. Legal, PTI & Insurance (იურიდიული, სავალდებულო და სადაზღვევო ვადები)
  pti_expiry_date?: string;
  pti_reminder_enabled?: boolean;
  pti_reminder_days?: number;
  pti_center?: string;
  pti_cert_number?: string;
  pti_status?: 'passed' | 'warning' | 'due';
  insurance_company?: string;
  insurance_type?: 'casco' | 'mtpl';
  insurance_policy_number?: string;
  insurance_expiry_date?: string;
  parking_permit_zone?: string;
  parking_permit_expiry?: string;
  license_number?: string;
  license_categories?: string;
  license_expiry_date?: string;
}

export interface VehicleProfile {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  vin: string;
  plate_number: string;
  tech_passport: string;
  mileage_km: number;
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  obd_ip: string;
  obd_port: number;
  last_oil_change_km?: number;
  pti_expiry_date?: string;
  horsepower?: number;
  driver_license_points?: number; // 100-point Georgian license system (default 85/100)
  driver_personal_number?: string; // პირადი ნომერი
  driver_name?: string; // მძღოლის სახელი და გვარი
  driver_phone?: string; // მძღოლის საკონტაქტო ნომერი
  driver_photo_url?: string; // მძღოლის ფოტო / პასპორტის ავატარი
}

export interface ServiceBookingItem {
  id: string;
  service_type: 'doctor_mechanic' | 'oil_fluids' | 'brakes_chassis' | 'pti_inspection' | 'obd_diagnostics' | 'ac_climate' | 'custom';
  title_ge: string;
  provider_name: string; // e.g. "თეგეტა მოტორსი (დიღომი)", "Greenway PTI"
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:mm
  vehicle_id: string;
  plate_number: string;
  driver_name: string;
  driver_phone: string;
  status: 'pending' | 'clarified_by_ai' | 'confirmed' | 'completed' | 'cancelled';
  complaint_or_goal?: string;
  related_dtc_codes?: string[];
  estimated_cost_gel?: number;
  ai_clarification_notes?: string;
  voucher_code?: string;
  accumulated_snapshot?: {
    mileage_km: number;
    active_dtc_count: number;
    oil_health_pct?: number;
    pending_fines_count?: number;
  };
  created_at: string;
}

export interface N8nConfig {
  baseUrl: string;
  scanEndpoint: string;
  clearEndpoint: string;
  chatEndpoint: string;
  finesEndpoint: string;
  reportsEndpoint: string;
  addReportEndpoint: string;
  useLiveWebhook: boolean;
}

export type MapPointType = 'radar' | 'patrol' | 'hazard' | 'fuel' | 'showroom' | 'parking';

export interface FuelPrices {
  super_98?: number;
  premium_95?: number;
  regular_92?: number;
  diesel?: number;
  lpg?: number;
  ev_kwh?: number;
}

export interface MapReport {
  id: string;
  type: MapPointType;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  timestamp: number;
  confirmations: number;
  dismissals?: number;
  brand?: string; // e.g. "Wissol", "Gulf", "Porsche", "Tegeta"
  fuel_prices?: FuelPrices;
  rating?: number;
  phone?: string;
  address?: string;
  active: boolean;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: 'success' | 'simulated' | 'error';
  payload: any;
  response: any;
}
