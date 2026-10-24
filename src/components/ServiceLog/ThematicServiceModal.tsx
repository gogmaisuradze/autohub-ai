import React, { useState, useEffect } from 'react';
import { ServiceItem, ServiceCategory, ServiceVariantKey, VehicleProfile } from '../../types';
import { sounds } from '../../services/soundEffects';
import {
  SERVICE_CATEGORIES,
  SERVICE_VARIANTS,
  normalizeCategory,
  getVariantDefinition,
  getVariantsByCategory
} from '../../constants/serviceCatalog';
import {
  X,
  Droplets,
  Disc,
  Filter,
  CircleDot,
  FileCheck,
  Wrench,
  Check,
  Calendar,
  Gauge,
  BellRing,
  ShieldCheck,
  Sparkles,
  Info,
  Compass,
  Zap,
  BatteryCharging,
  Wind,
  Sliders,
  Calculator,
  TrendingUp,
  RotateCcw,
  Activity,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Layers,
  Cpu,
  RefreshCw
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceItem) => void;
  serviceToEdit?: ServiceItem | null;
  currentVehicleMileage: number;
  initialCategory?: ServiceCategory;
  initialVariantKey?: ServiceVariantKey;
  vehicle?: VehicleProfile;
}

export const ThematicServiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  serviceToEdit,
  currentVehicleMileage,
  initialCategory,
  initialVariantKey,
  vehicle
}) => {
  const isEditing = Boolean(serviceToEdit);

  // Modal Mode: 'view' for unified passport view of filled services, 'wizard' for step-by-step wizard
  const [modalMode, setModalMode] = useState<'view' | 'wizard'>('wizard');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [obdSyncedNotice, setObdSyncedNotice] = useState<string | null>(null);

  // Allow closing via Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sounds.playClick();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 1. Primary Category & Variant Selection
  const [category, setCategory] = useState<ServiceCategory>('fluids');
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariantKey>('engine_oil');

  // General fields
  const [title, setTitle] = useState('');
  const [costGel, setCostGel] = useState<number>(240);
  const [partCostGel, setPartCostGel] = useState<number>(180);
  const [laborCostGel, setLaborCostGel] = useState<number>(60);
  const [customBrand, setCustomBrand] = useState<string>('');
  const [customPartNumber, setCustomPartNumber] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [lastServiceKm, setLastServiceKm] = useState<number>(currentVehicleMileage);
  const [intervalKm, setIntervalKm] = useState<number>(8000);

  // ================= 1. Chassis & Wheels State =================
  // Tires
  const [tireSize, setTireSize] = useState('225/45 R18');
  const [tireSeason, setTireSeason] = useState<'summer' | 'winter' | 'all_season'>('summer');
  const [tireBrand, setTireBrand] = useState('Michelin Pilot Sport 5');
  const [treadDepthMm, setTreadDepthMm] = useState<number>(7.0);
  const [tirePressureBar, setTirePressureBar] = useState<number>(2.3);

  // Wheel Alignment
  const [alignmentType, setAlignmentType] = useState<'alignment' | 'balancing' | 'both'>('both');
  const [alignmentAxle, setAlignmentAxle] = useState<'front' | 'both'>('both');

  // Brakes
  const [brakePosition, setBrakePosition] = useState<'front' | 'rear' | 'both'>('front');
  const [brakeBrand, setBrakeBrand] = useState('Brembo');
  const [brakeWearPct, setBrakeWearPct] = useState<number>(25);
  const [brakeDiscThicknessMm, setBrakeDiscThicknessMm] = useState<number>(28.0);
  const [brakeDiscStatus, setBrakeDiscStatus] = useState<'new' | 'good' | 'turned' | 'replace_soon'>('good');
  const [brakeFluidChecked, setBrakeFluidChecked] = useState(true);

  // Shocks & Mounts
  const [shocksCondition, setShocksCondition] = useState<'good' | 'leaking' | 'weak'>('good');
  const [shocksBrand, setShocksBrand] = useState('Bilstein B4');

  // Suspension control arms & bushings
  const [suspensionPartsChecked, setSuspensionPartsChecked] = useState(
    'გიტარები, შარავოები და ვტულკები შემოწმებულია (ლუფტი არ შეინიშნება)'
  );

  // ================= 2. Fluids State =================
  // Engine Oil
  const [oilViscosity, setOilViscosity] = useState('5W-30');
  const [oilBrand, setOilBrand] = useState('Motul');
  const [oilLiters, setOilLiters] = useState<number>(5.2);
  const [oilFilterReplaced, setOilFilterReplaced] = useState(true);

  // Transmission Oil (ATF)
  const [transmissionFluidType, setTransmissionFluidType] = useState<'full' | 'partial'>('full');
  const [transmissionType, setTransmissionType] = useState<'atf' | 'zf8hp' | 'dsg' | 'cvt' | 'manual'>('zf8hp');
  const [transmissionFilterReplaced, setTransmissionFilterReplaced] = useState(true);
  const [transmissionFluidBrand, setTransmissionFluidBrand] = useState('ZF Lifeguard 8');

  // Coolant / Antifreeze
  const [coolantFreezingPointC, setCoolantFreezingPointC] = useState<number>(-35);
  const [coolantSpec, setCoolantSpec] = useState('G12+ (წითელი)');

  // Brake Fluid
  const [brakeFluidMoisturePct, setBrakeFluidMoisturePct] = useState<number>(0.6);
  const [brakeFluidDot, setBrakeFluidDot] = useState('DOT 4');

  // Power steering fluid
  const [powerSteeringFluidSpec, setPowerSteeringFluidSpec] = useState('Pentosin CHF 11S');

  // Differential & AWD
  const [differentialSystem, setDifferentialSystem] = useState<'4matic_awd' | 'rear_diff' | 'front_diff' | 'transfer_case'>('4matic_awd');
  const [differentialSpec, setDifferentialSpec] = useState('75W-90 GL-5');

  // ================= 3. Filters State =================
  const [filterAir, setFilterAir] = useState(true);
  const [filterCabin, setFilterCabin] = useState(true);
  const [filterFuel, setFilterFuel] = useState(false);
  const [filterBrand, setFilterBrand] = useState('MANN-Filter');
  const [filterCabinType, setFilterCabinType] = useState<'carbon' | 'standard'>('carbon');
  const [filterFuelEngine, setFilterFuelEngine] = useState<'petrol' | 'diesel'>('petrol');

  // ================= 4. Engine & Ignition State =================
  const [sparkPlugType, setSparkPlugType] = useState<'iridium' | 'platinum' | 'standard'>('iridium');
  const [sparkPlugCount, setSparkPlugCount] = useState<number>(4);
  const [sparkPlugBrand, setSparkPlugBrand] = useState('NGK Laser Iridium');
  const [ignitionCoilsStatus, setIgnitionCoilsStatus] = useState('ყველა ცილინდრის კოჭა უდეფექტოა (0 Misfire)');
  const [timingType, setTimingType] = useState<'belt' | 'chain'>('belt');
  const [waterPumpReplaced, setWaterPumpReplaced] = useState(true);
  const [serpentineBeltParts, setSerpentineBeltParts] = useState('ღვედი + დამჭიმი + 2 პარაზიტი როლიკი');
  const [throttleAdapted, setThrottleAdapted] = useState(true);

  // ================= 5. Electrical & AC State =================
  const [batteryCapacityAh, setBatteryCapacityAh] = useState<number>(80);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12.6);
  const [batteryMfgDate, setBatteryMfgDate] = useState('2025/11');
  const [batteryBrand, setBatteryBrand] = useState('Varta Silver Dynamic AGM');
  const [acFreonGrams, setAcFreonGrams] = useState<number>(550);
  const [acFreonType, setAcFreonType] = useState('R134a');
  const [acCompressorOilChecked, setAcCompressorOilChecked] = useState(true);
  const [alternatorVoltageOutput, setAlternatorVoltageOutput] = useState<number>(14.2);

  // ================= 6. Legal, PTI & Insurance State =================
  const [ptiExpiryDate, setPtiExpiryDate] = useState('');
  const [ptiReminderEnabled, setPtiReminderEnabled] = useState(true);
  const [ptiReminderDays, setPtiReminderDays] = useState(30);
  const [ptiCenter, setPtiCenter] = useState('თბილისი, Greenway დიღომი');
  const [ptiCertNumber, setPtiCertNumber] = useState('PTI-GE-98432');
  const [ptiStatus, setPtiStatus] = useState<'passed' | 'warning' | 'due'>('passed');

  const [insuranceCompany, setInsuranceCompany] = useState('ალდაგი (Aldagi)');
  const [insuranceType, setInsuranceType] = useState<'casco' | 'mtpl'>('casco');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('POL-2026-9812');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('');

  const [parkingPermitZone, setParkingPermitZone] = useState('თბილისის წლიური საშვი (ზონა A/B)');
  const [parkingPermitExpiry, setParkingPermitExpiry] = useState('');

  const [licenseNumber, setLicenseNumber] = useState('DL-GE-984210');
  const [licenseCategories, setLicenseCategories] = useState('B, B1');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');

  // Helper to calculate 1 year expiry date (+365 days)
  const calculateDefaultExpiry = (baseDateStr: string, yearsToAdd = 1) => {
    try {
      const d = new Date(baseDateStr);
      if (!isNaN(d.getTime())) {
        d.setFullYear(d.getFullYear() + yearsToAdd);
        return d.toISOString().split('T')[0];
      }
    } catch (e) {
      // ignore
    }
    return '';
  };

  // Synchronize state when modal opens or serviceToEdit changes
  useEffect(() => {
    if (serviceToEdit) {
      setModalMode('view'); // Show unified passport view for filled services!
      setCurrentStep(1);
      const normCat = normalizeCategory(serviceToEdit.category);
      setCategory(normCat);
      
      // Determine variant key if saved or guess from fields
      let variantKey: ServiceVariantKey = serviceToEdit.variant_key || 'engine_oil';
      if (!serviceToEdit.variant_key) {
        if (serviceToEdit.category === 'oil') variantKey = 'engine_oil';
        else if (serviceToEdit.category === 'tires') variantKey = 'tires';
        else if (serviceToEdit.category === 'brakes') variantKey = 'brake_pads';
        else if (serviceToEdit.category === 'filter') variantKey = 'cabin_filter';
        else if (serviceToEdit.category === 'pti') variantKey = 'pti';
      }
      setSelectedVariant(variantKey);

      setTitle(serviceToEdit.title_ge);
      const totalAmount = serviceToEdit.cost_gel ?? 240;
      setCostGel(totalAmount);
      setPartCostGel(serviceToEdit.part_cost_gel ?? Math.round(totalAmount * 0.75));
      setLaborCostGel(serviceToEdit.labor_cost_gel ?? Math.round(totalAmount * 0.25));
      setCustomBrand(serviceToEdit.custom_brand || '');
      setCustomPartNumber(serviceToEdit.custom_part_number || '');
      setNotes(serviceToEdit.notes || '');
      setLastServiceDate(serviceToEdit.last_service_date || new Date().toISOString().split('T')[0]);
      setLastServiceKm(serviceToEdit.last_service_km ?? currentVehicleMileage);
      setIntervalKm(serviceToEdit.interval_km || 8000);

      // Chassis
      if (serviceToEdit.tire_size) setTireSize(serviceToEdit.tire_size);
      if (serviceToEdit.tire_season) setTireSeason(serviceToEdit.tire_season);
      if (serviceToEdit.tire_brand) setTireBrand(serviceToEdit.tire_brand);
      if (serviceToEdit.tread_depth_mm !== undefined) setTreadDepthMm(serviceToEdit.tread_depth_mm);
      if (serviceToEdit.tire_pressure_bar !== undefined) setTirePressureBar(serviceToEdit.tire_pressure_bar);
      if (serviceToEdit.alignment_type) setAlignmentType(serviceToEdit.alignment_type);
      if (serviceToEdit.alignment_axle) setAlignmentAxle(serviceToEdit.alignment_axle);
      if (serviceToEdit.brake_position) setBrakePosition(serviceToEdit.brake_position);
      if (serviceToEdit.brake_brand) setBrakeBrand(serviceToEdit.brake_brand);
      if (serviceToEdit.brake_wear_pct !== undefined) setBrakeWearPct(serviceToEdit.brake_wear_pct);
      if (serviceToEdit.brake_disc_thickness_mm !== undefined) setBrakeDiscThicknessMm(serviceToEdit.brake_disc_thickness_mm);
      if (serviceToEdit.brake_disc_status) setBrakeDiscStatus(serviceToEdit.brake_disc_status);
      if (serviceToEdit.brake_fluid_checked !== undefined) setBrakeFluidChecked(serviceToEdit.brake_fluid_checked);
      if (serviceToEdit.shocks_condition) setShocksCondition(serviceToEdit.shocks_condition);
      if (serviceToEdit.shocks_brand) setShocksBrand(serviceToEdit.shocks_brand);
      if (serviceToEdit.suspension_parts_checked) setSuspensionPartsChecked(serviceToEdit.suspension_parts_checked);

      // Fluids
      if (serviceToEdit.oil_viscosity) setOilViscosity(serviceToEdit.oil_viscosity);
      if (serviceToEdit.oil_brand) setOilBrand(serviceToEdit.oil_brand);
      if (serviceToEdit.oil_liters !== undefined) setOilLiters(serviceToEdit.oil_liters);
      if (serviceToEdit.oil_filter_replaced !== undefined) setOilFilterReplaced(serviceToEdit.oil_filter_replaced);
      if (serviceToEdit.transmission_fluid_type) setTransmissionFluidType(serviceToEdit.transmission_fluid_type);
      if (serviceToEdit.transmission_type) setTransmissionType(serviceToEdit.transmission_type);
      if (serviceToEdit.transmission_filter_replaced !== undefined) setTransmissionFilterReplaced(serviceToEdit.transmission_filter_replaced);
      if (serviceToEdit.transmission_fluid_brand) setTransmissionFluidBrand(serviceToEdit.transmission_fluid_brand);
      if (serviceToEdit.coolant_freezing_point_c !== undefined) setCoolantFreezingPointC(serviceToEdit.coolant_freezing_point_c);
      if (serviceToEdit.coolant_spec) setCoolantSpec(serviceToEdit.coolant_spec);
      if (serviceToEdit.brake_fluid_moisture_pct !== undefined) setBrakeFluidMoisturePct(serviceToEdit.brake_fluid_moisture_pct);
      if (serviceToEdit.brake_fluid_dot) setBrakeFluidDot(serviceToEdit.brake_fluid_dot);
      if (serviceToEdit.power_steering_fluid_spec) setPowerSteeringFluidSpec(serviceToEdit.power_steering_fluid_spec);
      if (serviceToEdit.differential_system) setDifferentialSystem(serviceToEdit.differential_system);
      if (serviceToEdit.differential_spec) setDifferentialSpec(serviceToEdit.differential_spec);

      // Filters
      if (serviceToEdit.filter_air !== undefined) setFilterAir(serviceToEdit.filter_air);
      if (serviceToEdit.filter_cabin !== undefined) setFilterCabin(serviceToEdit.filter_cabin);
      if (serviceToEdit.filter_fuel !== undefined) setFilterFuel(serviceToEdit.filter_fuel);
      if (serviceToEdit.filter_brand) setFilterBrand(serviceToEdit.filter_brand);
      if (serviceToEdit.filter_cabin_type) setFilterCabinType(serviceToEdit.filter_cabin_type);
      if (serviceToEdit.filter_fuel_engine) setFilterFuelEngine(serviceToEdit.filter_fuel_engine);

      // Engine
      if (serviceToEdit.spark_plug_type) setSparkPlugType(serviceToEdit.spark_plug_type);
      if (serviceToEdit.spark_plug_count !== undefined) setSparkPlugCount(serviceToEdit.spark_plug_count);
      if (serviceToEdit.spark_plug_brand) setSparkPlugBrand(serviceToEdit.spark_plug_brand);
      if (serviceToEdit.ignition_coils_status) setIgnitionCoilsStatus(serviceToEdit.ignition_coils_status);
      if (serviceToEdit.timing_type) setTimingType(serviceToEdit.timing_type);
      if (serviceToEdit.water_pump_replaced !== undefined) setWaterPumpReplaced(serviceToEdit.water_pump_replaced);
      if (serviceToEdit.serpentine_belt_parts) setSerpentineBeltParts(serviceToEdit.serpentine_belt_parts);
      if (serviceToEdit.throttle_adapted !== undefined) setThrottleAdapted(serviceToEdit.throttle_adapted);

      // Electrical
      if (serviceToEdit.battery_capacity_ah !== undefined) setBatteryCapacityAh(serviceToEdit.battery_capacity_ah);
      if (serviceToEdit.battery_voltage !== undefined) setBatteryVoltage(serviceToEdit.battery_voltage);
      if (serviceToEdit.battery_mfg_date) setBatteryMfgDate(serviceToEdit.battery_mfg_date);
      if (serviceToEdit.battery_brand) setBatteryBrand(serviceToEdit.battery_brand);
      if (serviceToEdit.ac_freon_grams !== undefined) setAcFreonGrams(serviceToEdit.ac_freon_grams);
      if (serviceToEdit.ac_freon_type) setAcFreonType(serviceToEdit.ac_freon_type);
      if (serviceToEdit.ac_compressor_oil_checked !== undefined) setAcCompressorOilChecked(serviceToEdit.ac_compressor_oil_checked);
      if (serviceToEdit.alternator_voltage_output !== undefined) setAlternatorVoltageOutput(serviceToEdit.alternator_voltage_output);

      // Legal
      if (serviceToEdit.pti_expiry_date) setPtiExpiryDate(serviceToEdit.pti_expiry_date);
      if (serviceToEdit.pti_reminder_enabled !== undefined) setPtiReminderEnabled(serviceToEdit.pti_reminder_enabled);
      if (serviceToEdit.pti_reminder_days) setPtiReminderDays(serviceToEdit.pti_reminder_days);
      if (serviceToEdit.pti_center) setPtiCenter(serviceToEdit.pti_center);
      if (serviceToEdit.pti_cert_number) setPtiCertNumber(serviceToEdit.pti_cert_number);
      if (serviceToEdit.pti_status) setPtiStatus(serviceToEdit.pti_status);

      if (serviceToEdit.insurance_company) setInsuranceCompany(serviceToEdit.insurance_company);
      if (serviceToEdit.insurance_type) setInsuranceType(serviceToEdit.insurance_type);
      if (serviceToEdit.insurance_policy_number) setInsurancePolicyNumber(serviceToEdit.insurance_policy_number);
      if (serviceToEdit.insurance_expiry_date) setInsuranceExpiryDate(serviceToEdit.insurance_expiry_date);

      if (serviceToEdit.parking_permit_zone) setParkingPermitZone(serviceToEdit.parking_permit_zone);
      if (serviceToEdit.parking_permit_expiry) setParkingPermitExpiry(serviceToEdit.parking_permit_expiry);

      if (serviceToEdit.license_number) setLicenseNumber(serviceToEdit.license_number);
      if (serviceToEdit.license_categories) setLicenseCategories(serviceToEdit.license_categories);
      if (serviceToEdit.license_expiry_date) setLicenseExpiryDate(serviceToEdit.license_expiry_date);

    } else {
      // New item initialization (Wizard Mode)
      setModalMode('wizard');
      setCurrentStep(1);
      const catToSet = initialCategory || 'fluids';
      setCategory(catToSet);
      
      const variants = getVariantsByCategory(catToSet);
      const variantToSet = initialVariantKey || (variants[0] ? variants[0].key : 'engine_oil');
      applyVariantPreset(variantToSet, catToSet);
      
      const today = new Date().toISOString().split('T')[0];
      setLastServiceDate(today);
      const effectiveKm = vehicle?.mileage_km || currentVehicleMileage;
      setLastServiceKm(effectiveKm);
      setPtiExpiryDate(calculateDefaultExpiry(today, 1));
      setInsuranceExpiryDate(calculateDefaultExpiry(today, 1));
      setParkingPermitExpiry(calculateDefaultExpiry(today, 1));
      setLicenseExpiryDate(calculateDefaultExpiry(today, 10));
    }
  }, [serviceToEdit, isOpen, currentVehicleMileage, initialCategory, initialVariantKey, vehicle]);

  // Apply a variant's preset defaults (with OBD integration)
  const applyVariantPreset = (vKey: ServiceVariantKey, catId?: ServiceCategory) => {
    sounds.playClick();
    setSelectedVariant(vKey);
    const def = getVariantDefinition(vKey);
    if (!def) return;

    if (catId) {
      setCategory(catId);
    } else if (def.categoryId) {
      setCategory(def.categoryId);
    }

    setTitle(def.title_ge);
    setIntervalKm(def.defaultIntervalKm);
    const defCost = def.defaultCostGel || 240;
    setCostGel(defCost);
    setPartCostGel(Math.round(defCost * 0.75));
    setLaborCostGel(Math.round(defCost * 0.25));

    // Apply specific preset defaults
    if (def.defaultValues) {
      const v = def.defaultValues;
      if (v.tire_size) setTireSize(v.tire_size);
      if (v.tire_season) setTireSeason(v.tire_season);
      if (v.tire_brand) setTireBrand(v.tire_brand);
      if (v.tread_depth_mm !== undefined) setTreadDepthMm(v.tread_depth_mm);
      if (v.tire_pressure_bar !== undefined) setTirePressureBar(v.tire_pressure_bar);
      if (v.oil_viscosity) setOilViscosity(v.oil_viscosity);
      if (v.oil_brand) setOilBrand(v.oil_brand);
      if (v.oil_liters !== undefined) setOilLiters(v.oil_liters);
      if (v.spark_plug_brand) setSparkPlugBrand(v.spark_plug_brand);
      if (v.spark_plug_type) setSparkPlugType(v.spark_plug_type);
      if (v.battery_capacity_ah !== undefined) setBatteryCapacityAh(v.battery_capacity_ah);
      if (v.coolant_freezing_point_c !== undefined) setCoolantFreezingPointC(v.coolant_freezing_point_c);
      if (v.brake_fluid_dot) setBrakeFluidDot(v.brake_fluid_dot);
      if (v.insurance_company) setInsuranceCompany(v.insurance_company);
    }

    // Auto-integrate vehicle OBD specs if vehicle profile exists
    if (vehicle) {
      if (vehicle.mileage_km) {
        setLastServiceKm(vehicle.mileage_km);
      }
      if (vKey === 'engine_oil') {
        const brandL = (vehicle.brand || '').toLowerCase();
        const modelL = (vehicle.model || '').toLowerCase();
        if (brandL.includes('mercedes') || modelL.includes('gla') || modelL.includes('c-class')) {
          setOilViscosity('5W-30');
          setOilBrand('Motul');
          setOilLiters(5.2);
          setCustomBrand('Motul 8100 X-clean EFE (MB 229.52)');
          setCustomPartNumber('OEM-A0009897902');
        } else if (brandL.includes('bmw')) {
          setOilViscosity('5W-30');
          setOilBrand('Castrol');
          setOilLiters(5.0);
          setCustomBrand('Castrol Edge LL-04');
        } else if (brandL.includes('toyota') || brandL.includes('lexus')) {
          setOilViscosity('0W-20');
          setOilBrand('Toyota OEM');
          setOilLiters(4.2);
        }
      } else if (vKey === 'pti' && vehicle.pti_expiry_date) {
        setPtiExpiryDate(vehicle.pti_expiry_date);
        if (vehicle.tech_passport) setPtiCertNumber(`PTI-${vehicle.tech_passport}`);
      } else if (vKey === 'fuel_filter') {
        setFilterFuelEngine(vehicle.fuel_type === 'diesel' ? 'diesel' : 'petrol');
      }
    }
  };

  // OBD-II Data Auto-fill action
  const applyObdAutoFill = (forceVehicleSpecs = true) => {
    sounds.playClick();
    if (!vehicle) {
      setObdSyncedNotice('ავტომობილის OBD პროფილი მიუწვდომელია');
      setTimeout(() => setObdSyncedNotice(null), 3000);
      return;
    }

    const syncedItems: string[] = [];

    // 1. Mileage sync
    if (vehicle.mileage_km) {
      setLastServiceKm(vehicle.mileage_km);
      syncedItems.push(`გარბენი (${vehicle.mileage_km.toLocaleString()} კმ)`);
    }

    // 2. Fluids / Engine Oil
    if (category === 'fluids' && selectedVariant === 'engine_oil') {
      const b = (vehicle.brand || '').toLowerCase();
      const m = (vehicle.model || '').toLowerCase();
      if (b.includes('mercedes') || m.includes('gla') || m.includes('cla') || m.includes('c-class')) {
        setOilViscosity('5W-30');
        setOilBrand('Motul');
        setOilLiters(5.2);
        setCustomBrand('Motul 8100 X-clean EFE (MB 229.52)');
        setCustomPartNumber('OEM-A0009897902');
        syncedItems.push('MB 229.52 5W-30, 5.2ლ');
      } else if (b.includes('bmw')) {
        setOilViscosity('5W-30');
        setOilBrand('Castrol Edge LL-04');
        setOilLiters(5.0);
        setCustomPartNumber('OEM-83212365934');
        syncedItems.push('BMW LL-04 5W-30, 5.0ლ');
      } else if (b.includes('toyota') || b.includes('lexus')) {
        setOilViscosity('0W-20');
        setOilBrand('Toyota OEM Hybrid');
        setOilLiters(4.2);
        setCustomPartNumber('OEM-08880-80845');
        syncedItems.push('Toyota 0W-20, 4.2ლ');
      } else {
        setOilViscosity('5W-30');
        setOilLiters(5.0);
        syncedItems.push('5W-30 სინთეტიკა, 5.0ლ');
      }
      setOilFilterReplaced(true);
    }

    // 3. Transmission Fluid
    if (category === 'fluids' && selectedVariant === 'transmission_fluid') {
      setTransmissionType('zf8hp');
      setTransmissionFluidType('full');
      setTransmissionFluidBrand('ZF Lifeguard 8');
      setTransmissionFilterReplaced(true);
      syncedItems.push('ZF Lifeguard 8');
    }

    // 4. Coolant / Antifreeze
    if (category === 'fluids' && selectedVariant === 'coolant') {
      setCoolantFreezingPointC(-35);
      setCoolantSpec('G12+ (Mercedes MB 325.0)');
      syncedItems.push('G12+ (-35°C)');
    }

    // 5. Brake fluid
    if (category === 'fluids' && selectedVariant === 'brake_fluid') {
      setBrakeFluidDot('DOT 4');
      setBrakeFluidMoisturePct(0.5);
      syncedItems.push('DOT 4 (0.5% ტენიანობა)');
    }

    // 6. Tires
    if (category === 'chassis' && selectedVariant === 'tires') {
      setTirePressureBar(2.3);
      setTreadDepthMm(7.2);
      syncedItems.push('2.3 bar, 7.2 მმ');
    }

    // 7. Brakes
    if (category === 'chassis' && (selectedVariant === 'brake_pads' || selectedVariant === 'brake_discs')) {
      setBrakeWearPct(25);
      setBrakeDiscThicknessMm(28.0);
      setBrakeDiscStatus('good');
      setBrakeFluidChecked(true);
      syncedItems.push('ხუნდები: 25%, დისკი: 28 მმ');
    }

    // 8. Filters
    if (category === 'filters') {
      setFilterAir(true);
      setFilterCabin(true);
      setFilterCabinType('carbon');
      setFilterBrand('MANN-Filter');
      if (vehicle.fuel_type === 'diesel') {
        setFilterFuelEngine('diesel');
        setFilterFuel(true);
      } else {
        setFilterFuelEngine('petrol');
      }
      syncedItems.push(`MANN-Filter (${vehicle.fuel_type === 'diesel' ? 'დიზელის' : 'სალონის & ჰაერის'})`);
    }

    // 9. Spark plugs
    if (category === 'engine' && selectedVariant === 'spark_plugs') {
      setSparkPlugType('iridium');
      setSparkPlugCount(4);
      setSparkPlugBrand('NGK Laser Iridium');
      syncedItems.push('NGK Iridium (4 ცალი)');
    }

    // 10. Electrical / Battery
    if (category === 'electrical' && selectedVariant === 'battery') {
      setBatteryVoltage(12.6);
      setAlternatorVoltageOutput(14.2);
      setBatteryCapacityAh(80);
      setBatteryBrand('Varta Silver Dynamic AGM');
      syncedItems.push('Varta AGM 80Ah (12.6V / 14.2V)');
    }

    // 11. AC System
    if (category === 'electrical' && selectedVariant === 'ac_system') {
      setAcFreonGrams(550);
      setAcFreonType('R134a');
      setAcCompressorOilChecked(true);
      syncedItems.push('R134a (550 გრამი)');
    }

    // 12. Legal / PTI / Insurance
    if (category === 'legal') {
      if (vehicle.pti_expiry_date) {
        setPtiExpiryDate(vehicle.pti_expiry_date);
        syncedItems.push(`PTI ვადა: ${vehicle.pti_expiry_date}`);
      }
      if (vehicle.tech_passport) {
        setPtiCertNumber(`PTI-${vehicle.tech_passport}`);
      }
      if (vehicle.driver_personal_number) {
        setLicenseNumber(`DL-GE-${vehicle.driver_personal_number.slice(0, 6)}`);
      }
    }

    setObdSyncedNotice(`⚡ OBD მონაცემები წარმატებით შევსებულია: ${syncedItems.join(' • ')}`);
    setTimeout(() => setObdSyncedNotice(null), 5000);
  };

  // Quick Renew Today action in Unified View
  const handleQuickRenewToday = () => {
    sounds.playSuccess();
    const today = new Date().toISOString().split('T')[0];
    const currentKm = vehicle?.mileage_km || currentVehicleMileage;

    const renewedService: ServiceItem = {
      ...(serviceToEdit || {}),
      id: serviceToEdit ? serviceToEdit.id : `srv_${Date.now()}`,
      title_ge: title.trim() || 'ავტო სერვისი',
      category,
      variant_key: selectedVariant,
      variant_name_ge: getVariantDefinition(selectedVariant)?.variant_name_ge || title,
      current_km: currentKm,
      last_service_date: today,
      last_service_km: currentKm,
      interval_km: intervalKm,
      remaining_km: intervalKm,
      remaining_days: Math.round(intervalKm / 35),
      health_percentage: 100,
      cost_gel: costGel,
      part_cost_gel: partCostGel,
      labor_cost_gel: laborCostGel,
      custom_brand: customBrand || undefined,
      custom_part_number: customPartNumber || undefined,
      is_custom_built: true,
      notes: notes ? `${notes} (განახლდა დღეს: ${today})` : `განახლდა დღეს (${today}) 100% რესურსით`
    };

    onSave(renewedService);
    onClose();
  };

  const handleCategoryChange = (cat: ServiceCategory) => {
    sounds.playClick();
    setCategory(cat);
    const variantsInCat = getVariantsByCategory(cat);
    if (variantsInCat.length > 0) {
      applyVariantPreset(variantsInCat[0].key, cat);
    }
  };

  if (!isOpen) return null;

  // Render variant-specific icon helper
  const renderVariantIcon = (vKey: ServiceVariantKey, size = 16) => {
    switch (vKey) {
      case 'tires':
        return <CircleDot size={size} />;
      case 'wheel_alignment':
        return <Compass size={size} />;
      case 'brake_pads':
      case 'brake_discs':
        return <Disc size={size} />;
      case 'shocks_mounts':
      case 'suspension_arms':
      case 'throttle_cleaning':
        return <Wrench size={size} />;
      case 'engine_oil':
      case 'transmission_fluid':
      case 'coolant':
      case 'brake_fluid':
      case 'power_steering_fluid':
      case 'differential_oil':
        return <Droplets size={size} />;
      case 'engine_air_filter':
      case 'cabin_filter':
      case 'fuel_filter':
        return <Filter size={size} />;
      case 'spark_plugs':
      case 'ignition_coils':
      case 'alternator_starter':
        return <Zap size={size} />;
      case 'timing_belt_chain':
      case 'serpentine_belt':
        return <Gauge size={size} />;
      case 'battery':
        return <BatteryCharging size={size} />;
      case 'ac_system':
        return <Wind size={size} />;
      case 'pti':
        return <FileCheck size={size} />;
      case 'insurance':
      case 'parking_permit':
      case 'driving_license':
        return <ShieldCheck size={size} />;
      default:
        return <Wrench size={size} />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();

    // 1. Calculate remaining and health percentage
    const drivenSinceService = Math.max(0, currentVehicleMileage - lastServiceKm);
    let remainingKm = Math.max(0, intervalKm - drivenSinceService);
    let healthPct = Math.max(0, Math.min(100, Math.round((remainingKm / Math.max(intervalKm, 1)) * 100)));
    let remainingDays = Math.round(remainingKm / 35);

    // 2. Specialized calculation for date-based legal items (PTI, Insurance, Parking, License)
    if (category === 'legal') {
      let targetExpiry = ptiExpiryDate;
      let totalSpanDays = 365;

      if (selectedVariant === 'insurance') {
        targetExpiry = insuranceExpiryDate;
      } else if (selectedVariant === 'parking_permit') {
        targetExpiry = parkingPermitExpiry;
      } else if (selectedVariant === 'driving_license') {
        targetExpiry = licenseExpiryDate;
        totalSpanDays = 3650; // 10 years
      }

      if (targetExpiry) {
        const expTime = new Date(targetExpiry).getTime();
        const now = Date.now();
        const diffDays = Math.round((expTime - now) / (1000 * 60 * 60 * 24));
        remainingDays = Math.max(0, diffDays);
        healthPct = Math.max(0, Math.min(100, Math.round((remainingDays / totalSpanDays) * 100)));
        remainingKm = Math.round(remainingDays * 35);
      }
    }

    const currentVariantDef = getVariantDefinition(selectedVariant);
    const fallbackTitle = currentVariantDef ? currentVariantDef.title_ge : 'ავტო სერვისი';

    const updatedService: ServiceItem = {
      id: serviceToEdit ? serviceToEdit.id : `srv_${Date.now()}`,
      title_ge: title.trim() || fallbackTitle,
      category,
      variant_key: selectedVariant,
      variant_name_ge: currentVariantDef?.variant_name_ge || currentVariantDef?.title_ge,
      current_km: currentVehicleMileage,
      interval_km: intervalKm,
      remaining_km: remainingKm,
      remaining_days: remainingDays,
      last_service_date: lastServiceDate,
      last_service_km: lastServiceKm,
      health_percentage: healthPct,
      cost_gel: costGel,
      part_cost_gel: Number(partCostGel) || 0,
      labor_cost_gel: Number(laborCostGel) || 0,
      custom_brand: customBrand.trim() || undefined,
      custom_part_number: customPartNumber.trim() || undefined,
      is_custom_built: true,
      notes: notes.trim() || undefined,

      // 1. Chassis
      tire_size: category === 'chassis' && selectedVariant === 'tires' ? tireSize : undefined,
      tire_season: category === 'chassis' && selectedVariant === 'tires' ? tireSeason : undefined,
      tire_brand: category === 'chassis' && selectedVariant === 'tires' ? tireBrand : undefined,
      tread_depth_mm: category === 'chassis' && selectedVariant === 'tires' ? treadDepthMm : undefined,
      tire_pressure_bar: category === 'chassis' && selectedVariant === 'tires' ? tirePressureBar : undefined,
      alignment_type: category === 'chassis' && selectedVariant === 'wheel_alignment' ? alignmentType : undefined,
      alignment_axle: category === 'chassis' && selectedVariant === 'wheel_alignment' ? alignmentAxle : undefined,
      brake_position: category === 'chassis' && (selectedVariant === 'brake_pads' || selectedVariant === 'brake_discs') ? brakePosition : undefined,
      brake_brand: category === 'chassis' && selectedVariant === 'brake_pads' ? brakeBrand : undefined,
      brake_wear_pct: category === 'chassis' && selectedVariant === 'brake_pads' ? brakeWearPct : undefined,
      brake_disc_thickness_mm: category === 'chassis' && selectedVariant === 'brake_discs' ? brakeDiscThicknessMm : undefined,
      brake_disc_status: category === 'chassis' && selectedVariant === 'brake_discs' ? brakeDiscStatus : undefined,
      brake_fluid_checked: category === 'chassis' && selectedVariant === 'brake_pads' ? brakeFluidChecked : undefined,
      shocks_condition: category === 'chassis' && selectedVariant === 'shocks_mounts' ? shocksCondition : undefined,
      shocks_brand: category === 'chassis' && selectedVariant === 'shocks_mounts' ? shocksBrand : undefined,
      suspension_parts_checked: category === 'chassis' && selectedVariant === 'suspension_arms' ? suspensionPartsChecked : undefined,

      // 2. Fluids
      oil_viscosity: category === 'fluids' && selectedVariant === 'engine_oil' ? oilViscosity : undefined,
      oil_brand: category === 'fluids' && selectedVariant === 'engine_oil' ? oilBrand : undefined,
      oil_liters: category === 'fluids' && selectedVariant === 'engine_oil' ? oilLiters : undefined,
      oil_filter_replaced: category === 'fluids' && selectedVariant === 'engine_oil' ? oilFilterReplaced : undefined,
      transmission_fluid_type: category === 'fluids' && selectedVariant === 'transmission_fluid' ? transmissionFluidType : undefined,
      transmission_type: category === 'fluids' && selectedVariant === 'transmission_fluid' ? transmissionType : undefined,
      transmission_filter_replaced: category === 'fluids' && selectedVariant === 'transmission_fluid' ? transmissionFilterReplaced : undefined,
      transmission_fluid_brand: category === 'fluids' && selectedVariant === 'transmission_fluid' ? transmissionFluidBrand : undefined,
      coolant_freezing_point_c: category === 'fluids' && selectedVariant === 'coolant' ? coolantFreezingPointC : undefined,
      coolant_spec: category === 'fluids' && selectedVariant === 'coolant' ? coolantSpec : undefined,
      brake_fluid_moisture_pct: category === 'fluids' && selectedVariant === 'brake_fluid' ? brakeFluidMoisturePct : undefined,
      brake_fluid_dot: category === 'fluids' && selectedVariant === 'brake_fluid' ? brakeFluidDot : undefined,
      power_steering_fluid_spec: category === 'fluids' && selectedVariant === 'power_steering_fluid' ? powerSteeringFluidSpec : undefined,
      differential_system: category === 'fluids' && selectedVariant === 'differential_oil' ? differentialSystem : undefined,
      differential_spec: category === 'fluids' && selectedVariant === 'differential_oil' ? differentialSpec : undefined,

      // 3. Filters
      filter_air: category === 'filters' && selectedVariant === 'engine_air_filter' ? filterAir : undefined,
      filter_cabin: category === 'filters' && selectedVariant === 'cabin_filter' ? filterCabin : undefined,
      filter_fuel: category === 'filters' && selectedVariant === 'fuel_filter' ? filterFuel : undefined,
      filter_brand: category === 'filters' ? filterBrand : undefined,
      filter_cabin_type: category === 'filters' && selectedVariant === 'cabin_filter' ? filterCabinType : undefined,
      filter_fuel_engine: category === 'filters' && selectedVariant === 'fuel_filter' ? filterFuelEngine : undefined,

      // 4. Engine
      spark_plug_type: category === 'engine' && selectedVariant === 'spark_plugs' ? sparkPlugType : undefined,
      spark_plug_count: category === 'engine' && selectedVariant === 'spark_plugs' ? sparkPlugCount : undefined,
      spark_plug_brand: category === 'engine' && selectedVariant === 'spark_plugs' ? sparkPlugBrand : undefined,
      ignition_coils_status: category === 'engine' && selectedVariant === 'ignition_coils' ? ignitionCoilsStatus : undefined,
      timing_type: category === 'engine' && selectedVariant === 'timing_belt_chain' ? timingType : undefined,
      water_pump_replaced: category === 'engine' && selectedVariant === 'timing_belt_chain' ? waterPumpReplaced : undefined,
      serpentine_belt_parts: category === 'engine' && selectedVariant === 'serpentine_belt' ? serpentineBeltParts : undefined,
      throttle_adapted: category === 'engine' && selectedVariant === 'throttle_cleaning' ? throttleAdapted : undefined,

      // 5. Electrical
      battery_capacity_ah: category === 'electrical' && selectedVariant === 'battery' ? batteryCapacityAh : undefined,
      battery_voltage: category === 'electrical' && selectedVariant === 'battery' ? batteryVoltage : undefined,
      battery_mfg_date: category === 'electrical' && selectedVariant === 'battery' ? batteryMfgDate : undefined,
      battery_brand: category === 'electrical' && selectedVariant === 'battery' ? batteryBrand : undefined,
      ac_freon_grams: category === 'electrical' && selectedVariant === 'ac_system' ? acFreonGrams : undefined,
      ac_freon_type: category === 'electrical' && selectedVariant === 'ac_system' ? acFreonType : undefined,
      ac_compressor_oil_checked: category === 'electrical' && selectedVariant === 'ac_system' ? acCompressorOilChecked : undefined,
      alternator_voltage_output: category === 'electrical' && selectedVariant === 'alternator_starter' ? alternatorVoltageOutput : undefined,

      // 6. Legal
      pti_expiry_date: category === 'legal' && selectedVariant === 'pti' ? ptiExpiryDate : undefined,
      pti_reminder_enabled: category === 'legal' && selectedVariant === 'pti' ? ptiReminderEnabled : undefined,
      pti_reminder_days: category === 'legal' && selectedVariant === 'pti' ? ptiReminderDays : undefined,
      pti_center: category === 'legal' && selectedVariant === 'pti' ? ptiCenter : undefined,
      pti_cert_number: category === 'legal' && selectedVariant === 'pti' ? ptiCertNumber : undefined,
      pti_status: category === 'legal' && selectedVariant === 'pti' ? ptiStatus : undefined,

      insurance_company: category === 'legal' && selectedVariant === 'insurance' ? insuranceCompany : undefined,
      insurance_type: category === 'legal' && selectedVariant === 'insurance' ? insuranceType : undefined,
      insurance_policy_number: category === 'legal' && selectedVariant === 'insurance' ? insurancePolicyNumber : undefined,
      insurance_expiry_date: category === 'legal' && selectedVariant === 'insurance' ? insuranceExpiryDate : undefined,

      parking_permit_zone: category === 'legal' && selectedVariant === 'parking_permit' ? parkingPermitZone : undefined,
      parking_permit_expiry: category === 'legal' && selectedVariant === 'parking_permit' ? parkingPermitExpiry : undefined,

      license_number: category === 'legal' && selectedVariant === 'driving_license' ? licenseNumber : undefined,
      license_categories: category === 'legal' && selectedVariant === 'driving_license' ? licenseCategories : undefined,
      license_expiry_date: category === 'legal' && selectedVariant === 'driving_license' ? licenseExpiryDate : undefined
    };

    onSave(updatedService);
    onClose();
  };

  const currentCategoryVariants = getVariantsByCategory(category);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/60 backdrop-blur-sm animate-fade-in cursor-pointer overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl neu-card rounded-3xl shadow-neu-modal border border-white max-h-[92vh] flex flex-col overflow-hidden cursor-default my-auto"
      >
        
        {/* Sticky Header with Permanent Close Button & Mode Switch */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-white border-b border-slate-200 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm shrink-0">
              <Wrench className="w-5 h-5 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-navy">
                  {modalMode === 'view'
                    ? 'ერთიანი სერვისის პასპორტი'
                    : isEditing
                      ? 'სერვისის ეტაპობრივი რედაქტირება'
                      : 'ახალი სერვისის შექმნა (3 ეტაპი)'}
                </h3>
                {vehicle && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 items-center gap-1">
                    <Cpu size={11} className="text-blue-600" />
                    <span>{vehicle.brand} {vehicle.model}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {modalMode === 'view'
                  ? 'ტექნიკური დოსიე, რესურსის ცოცხალი მდგომარეობა და ხარჯთაღრიცხვა'
                  : currentStep === 1
                    ? 'ნაბიჯი 1/3: სერვისის კატეგორია, კომპონენტი და დასახელება'
                    : currentStep === 2
                      ? 'ნაბიჯი 2/3: ტექნიკური პარამეტრები & OBD ავტო-შევსება'
                      : 'ნაბიჯი 3/3: გარბენი, შეცვლის ინტერვალი & რესურსის კალკულატორი'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && modalMode === 'wizard' && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setModalMode('view');
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy text-xs font-bold transition-all"
                title="ერთიან ხედზე დაბრუნება"
              >
                <Layers size={13} className="text-gold" />
                <span>ერთიანი ხედი</span>
              </button>
            )}

            {modalMode === 'view' && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setModalMode('wizard');
                  setCurrentStep(1);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy text-gold text-xs font-bold hover:bg-navy/90 shadow-sm transition-all"
                title="ეტაპობრივი რედაქტირების დაწყება"
              >
                <Edit3 size={13} />
                <span>✎ რედაქტირება</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy hover:scale-105 transition-all shadow-sm shrink-0"
              title="ფანჯრის დახურვა (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stepper Navigation Bar (Only in Wizard Mode) */}
        {modalMode === 'wizard' && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 z-10 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-3 text-xs w-full sm:w-auto overflow-x-auto py-0.5">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCurrentStep(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
                  currentStep === 1
                    ? 'bg-navy text-gold shadow-sm scale-105'
                    : 'bg-white text-slate-600 hover:text-navy border border-slate-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep === 1 ? 'bg-gold text-navy font-black' : 'bg-slate-100 text-slate-700'
                }`}>1</span>
                <span>ტიპი & კატეგორია</span>
              </button>

              <span className="text-slate-300 font-bold hidden sm:inline">➔</span>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCurrentStep(2);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
                  currentStep === 2
                    ? 'bg-navy text-gold shadow-sm scale-105'
                    : 'bg-white text-slate-600 hover:text-navy border border-slate-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep === 2 ? 'bg-gold text-navy font-black' : 'bg-slate-100 text-slate-700'
                }`}>2</span>
                <span>ტექნიკური & OBD</span>
              </button>

              <span className="text-slate-300 font-bold hidden sm:inline">➔</span>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCurrentStep(3);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
                  currentStep === 3
                    ? 'bg-navy text-gold shadow-sm scale-105'
                    : 'bg-white text-slate-600 hover:text-navy border border-slate-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  currentStep === 3 ? 'bg-gold text-navy font-black' : 'bg-slate-100 text-slate-700'
                }`}>3</span>
                <span>რესურსი & შემოწმება</span>
              </button>
            </div>

            <span className="hidden md:inline text-[11px] font-mono text-slate-400">
              ეტაპი {currentStep} / 3
            </span>
          </div>
        )}

        {/* Unified Passport View (When Already Filled / Completed) */}
        {modalMode === 'view' ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
            {/* 1. Master Passport Hero Card */}
            <div className="p-5 rounded-3xl bg-linear-to-br from-navy via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-gold border border-white/15 shadow-inner shrink-0">
                    {renderVariantIcon(selectedVariant, 26)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/30">
                        {SERVICE_CATEGORIES.find(c => c.id === category)?.name_ge}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        OBD პროფილი
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white mt-1 leading-tight">
                      {title || getVariantDefinition(selectedVariant)?.title_ge}
                    </h2>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      {vehicle?.brand} {vehicle?.model} • {getVariantDefinition(selectedVariant)?.variant_name_ge || selectedVariant}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  {(() => {
                    const driven = Math.max(0, currentVehicleMileage - lastServiceKm);
                    const remaining = Math.max(0, intervalKm - driven);
                    const health = intervalKm > 0 ? Math.max(0, Math.min(100, Math.round((remaining / intervalKm) * 100))) : 100;
                    const isCrit = health <= 20;
                    const isWarn = health <= 50 && !isCrit;
                    return (
                      <div className={`px-4 py-2 rounded-2xl font-black text-sm border flex items-center gap-2 ${
                        isCrit ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        isWarn ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        <Activity size={16} />
                        <span>{health}% რესურსი ({isCrit ? 'შეცვლა!' : isWarn ? 'ყურადღება' : 'ნორმა'})</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Health progress bar & 4 stats */}
              {(() => {
                const driven = Math.max(0, currentVehicleMileage - lastServiceKm);
                const remaining = Math.max(0, intervalKm - driven);
                const health = intervalKm > 0 ? Math.max(0, Math.min(100, Math.round((remaining / intervalKm) * 100))) : 100;
                const wear = 100 - health;
                const days = Math.round(remaining / 35);
                const isCrit = health <= 20;
                const isWarn = health <= 50 && !isCrit;

                return (
                  <div className="pt-4 space-y-3">
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCrit ? 'bg-rose-500' : isWarn ? 'bg-gold' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.max(5, health)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block font-sans">ბოლო სერვისი</span>
                        <span className="font-bold text-white">{lastServiceKm.toLocaleString()} კმ</span>
                        <span className="text-[10px] text-slate-400 block font-sans mt-0.5">{lastServiceDate}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block font-sans">ინტერვალი</span>
                        <span className="font-bold text-gold">{intervalKm.toLocaleString()} კმ</span>
                        <span className="text-[10px] text-slate-400 block font-sans mt-0.5">გეგმიური</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block font-sans">დარჩა რესურსი</span>
                        <span className={`font-black ${isCrit ? 'text-rose-400' : 'text-emerald-300'}`}>
                          ~{remaining.toLocaleString()} კმ
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans mt-0.5">ცვეთა: {wear}%</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 block font-sans">სავარაუდო ვადა</span>
                        <span className="font-bold text-white">~{days} დღე</span>
                        <span className="text-[10px] text-slate-400 block font-sans mt-0.5">35 კმ/დღე</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2. Unified Technical Parameters Section */}
            <div className="p-5 rounded-3xl neu-surface border border-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center">
                    <Sliders size={18} className="text-navy" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-navy uppercase tracking-wider">
                      შევსებული ტექნიკური პარამეტრები & სპეციფიკაციები
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      სერვისის სრული დოსიე და მწარმოებლის მონაცემები
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setModalMode('wizard');
                    setCurrentStep(2);
                  }}
                  className="text-[11px] font-bold text-navy hover:text-amber-600 flex items-center gap-1"
                >
                  <Edit3 size={13} />
                  <span>შეცვლა</span>
                </button>
              </div>

              {/* Render populated spec tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {category === 'fluids' && selectedVariant === 'engine_oil' && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ზეთის სიბლანტე</span>
                      <span className="font-extrabold text-navy font-mono">{oilViscosity}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">მოცულობა</span>
                      <span className="font-extrabold text-navy font-mono">{oilLiters} ლიტრი</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ზეთის ბრენდი</span>
                      <span className="font-extrabold text-navy">{oilBrand}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ზეთის ფილტრი</span>
                      <span className="font-extrabold text-emerald-600">{oilFilterReplaced ? '✓ შეცვლილია' : 'ძველი'}</span>
                    </div>
                  </>
                )}

                {category === 'fluids' && selectedVariant === 'transmission_fluid' && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">გადაცემათა კოლოფი</span>
                      <span className="font-extrabold text-navy font-mono uppercase">{transmissionType}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">შეცვლის ტიპი</span>
                      <span className="font-extrabold text-navy">{transmissionFluidType === 'full' ? 'სრული' : 'ნაწილობრივი'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">სითხის ბრენდი</span>
                      <span className="font-extrabold text-navy">{transmissionFluidBrand}</span>
                    </div>
                  </>
                )}

                {category === 'fluids' && selectedVariant === 'coolant' && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">გაყინვის წერტილი</span>
                      <span className="font-extrabold text-blue-600 font-mono">{coolantFreezingPointC} °C</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
                      <span className="text-[10px] text-slate-400 block">ანტიფრიზის სპეციფიკაცია</span>
                      <span className="font-extrabold text-navy">{coolantSpec}</span>
                    </div>
                  </>
                )}

                {category === 'fluids' && selectedVariant === 'brake_fluid' && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">სითხის ტიპი</span>
                      <span className="font-extrabold text-navy font-mono">{brakeFluidDot}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ტენიანობის დონე</span>
                      <span className="font-extrabold text-emerald-600 font-mono">{brakeFluidMoisturePct} %</span>
                    </div>
                  </>
                )}

                {category === 'chassis' && selectedVariant === 'tires' && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">საბურავის ზომა</span>
                      <span className="font-extrabold text-navy font-mono">{tireSize}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">სეზონი</span>
                      <span className="font-extrabold text-navy capitalize">{tireSeason}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">პროტექტორის სიღრმე</span>
                      <span className="font-extrabold text-navy font-mono">{treadDepthMm} მმ</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">წნევა</span>
                      <span className="font-extrabold text-navy font-mono">{tirePressureBar} bar</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
                      <span className="text-[10px] text-slate-400 block">ბრენდი</span>
                      <span className="font-extrabold text-navy">{tireBrand}</span>
                    </div>
                  </>
                )}

                {category === 'chassis' && (selectedVariant === 'brake_pads' || selectedVariant === 'brake_discs') && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">პოზიცია</span>
                      <span className="font-extrabold text-navy capitalize">{brakePosition}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ხუნდის ცვეთა</span>
                      <span className="font-extrabold text-navy font-mono">{brakeWearPct} %</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">დისკის სისქე</span>
                      <span className="font-extrabold text-navy font-mono">{brakeDiscThicknessMm} მმ</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">დისკის სტატუსი</span>
                      <span className="font-extrabold text-navy capitalize">{brakeDiscStatus}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
                      <span className="text-[10px] text-slate-400 block">ბრენდი</span>
                      <span className="font-extrabold text-navy">{brakeBrand}</span>
                    </div>
                  </>
                )}

                {category === 'filters' && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ჰაერის ფილტრი</span>
                      <span className="font-extrabold text-navy">{filterAir ? '✓ შეცვლილია' : 'არა'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">სალონის ფილტრი</span>
                      <span className="font-extrabold text-navy">{filterCabin ? `✓ ${filterCabinType}` : 'არა'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">საწვავის ფილტრი</span>
                      <span className="font-extrabold text-navy">{filterFuel ? `✓ ${filterFuelEngine}` : 'არა'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-3">
                      <span className="text-[10px] text-slate-400 block">მწარმოებელი / ბრენდი</span>
                      <span className="font-extrabold text-navy">{filterBrand}</span>
                    </div>
                  </>
                )}

                {category === 'electrical' && selectedVariant === 'battery' && (
                  <>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ტევადობა</span>
                      <span className="font-extrabold text-navy font-mono">{batteryCapacityAh} Ah</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">ძაბვა (Resting)</span>
                      <span className="font-extrabold text-navy font-mono">{batteryVoltage} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">გენერატორის ძაბვა</span>
                      <span className="font-extrabold text-navy font-mono">{alternatorVoltageOutput} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
                      <span className="text-[10px] text-slate-400 block">აკუმულატორის ბრენდი</span>
                      <span className="font-extrabold text-navy">{batteryBrand}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">გამოშვების თარიღი</span>
                      <span className="font-extrabold text-navy font-mono">{batteryMfgDate}</span>
                    </div>
                  </>
                )}

                {category === 'legal' && (
                  <>
                    {ptiExpiryDate && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
                        <span className="text-[10px] text-slate-400 block">ტექდათვალიერების ვადა</span>
                        <span className="font-extrabold text-navy font-mono">{ptiExpiryDate} ({ptiCenter})</span>
                      </div>
                    )}
                    {insuranceCompany && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
                        <span className="text-[10px] text-slate-400 block">დაზღვევა</span>
                        <span className="font-extrabold text-navy">{insuranceCompany} ({insuranceType?.toUpperCase()})</span>
                      </div>
                    )}
                  </>
                )}

                {customPartNumber && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">ნაწილის კოდი (OEM)</span>
                    <span className="font-extrabold text-navy font-mono">{customPartNumber}</span>
                  </div>
                )}

                {customBrand && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">არჩეული ბრენდი</span>
                    <span className="font-extrabold text-navy">{customBrand}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Financial Breakdown Card */}
            <div className="p-5 rounded-3xl neu-surface border border-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={15} className="text-gold" />
                  <span>ფინანსური ხარჯთაღრიცხვა</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ჯამური ღირებულება
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-sans">ნაწილები / მასალები</span>
                  <span className="font-black text-navy text-sm font-mono">{partCostGel} ₾</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-sans">ხელობა / სერვისი</span>
                  <span className="font-black text-navy text-sm font-mono">{laborCostGel} ₾</span>
                </div>
                <div className="p-3 rounded-2xl bg-gold/15 border-2 border-gold/40">
                  <span className="text-[11px] text-slate-700 block font-sans font-bold">სულ ჯამი</span>
                  <span className="font-black text-navy text-base font-mono">{costGel} ₾</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>1,000 კმ-ის ექსპლუატაციის ხარჯი:</span>
                <span className="font-mono font-bold text-navy">
                  ~{intervalKm > 0 ? Math.round(((costGel || 0) / intervalKm) * 1000) : 0} ₾ / 1,000 კმ
                </span>
              </div>
            </div>

            {/* 4. Notes & Warranty Card if present */}
            {notes && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">
                  🛡️ შენიშვნა & საგარანტიო პირობა
                </span>
                <p className="text-navy font-medium">{notes}</p>
              </div>
            )}
          </div>
        ) : (
          /* ================= 3-STEP WIZARD FORM ================= */
          <form id="thematic-service-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
            
            {/* ================= STEP 1: CATEGORY, VARIANT & TITLE ================= */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                {/* 1. Six Primary Categories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-navy uppercase tracking-wider">
                      1. აირჩიეთ სერვისის კატეგორია (6 ძირითადი კატეგორია)
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      სრული ჩამონათვალი
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SERVICE_CATEGORIES.map(c => {
                      const isSelected = category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCategoryChange(c.id)}
                          className={`p-2.5 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-navy text-white border-navy shadow-sm scale-[1.02]'
                              : 'bg-white hover:bg-slate-50 text-navy border-slate-200'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-gold text-navy' : c.badgeBg + ' ' + c.color
                          }`}>
                            {renderVariantIcon(c.id === 'chassis' ? 'tires' : c.id === 'fluids' ? 'engine_oil' : c.id === 'filters' ? 'cabin_filter' : c.id === 'engine' ? 'timing_belt_chain' : c.id === 'electrical' ? 'battery' : 'pti', 16)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-xs truncate leading-tight">{c.name_ge}</div>
                            <div className="text-[10px] opacity-70 font-mono truncate">{c.name_en}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Components & Service Variants Selection */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-gold" />
                      <span>2. კომპონენტის / სერვისის ვარიანტი:</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">
                      დააკლიკეთ სწრაფი შევსებისთვის
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {currentCategoryVariants.map(v => {
                      const isSelected = selectedVariant === v.key;
                      return (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => applyVariantPreset(v.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-navy text-gold shadow-sm scale-105 border border-navy'
                              : 'bg-white text-navy border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {renderVariantIcon(v.key, 13)}
                          <span>{v.title_ge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Service Title & Recommended Names */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                    3. სერვისის დასახელება (სათაური) *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="მაგ: ძრავის ზეთი (Motul 5W-30) & ზეთის ფილტრი"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />

                  {/* Preset Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">რეკომენდებული:</span>
                    {currentCategoryVariants.slice(0, 3).map(v => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setTitle(v.title_ge);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-all"
                      >
                        {v.title_ge}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: TECHNICAL SPECIFICATIONS & OBD AUTO-FILL ================= */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                {/* OBD Auto-fill Banner & Status */}
                <div className="p-3.5 rounded-2xl bg-linear-to-r from-blue-900 via-navy to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-blue-400/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center shrink-0 shadow-inner">
                      <Cpu className="w-5 h-5 animate-pulse text-gold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wide text-white uppercase">
                          OBD-II ცოცხალი მონაცემები & სპეციფიკაციები
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ● დაკავშირებულია
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {vehicle ? (
                          <>
                            <span className="text-gold font-bold">{vehicle.brand} {vehicle.model}</span> ({vehicle.year}) • 
                            გარბენი: <span className="text-white font-bold">{vehicle.mileage_km.toLocaleString()} კმ</span> • 
                            ძრავი: <span className="text-slate-200">{vehicle.engine}</span>
                          </>
                        ) : (
                          'ავტომობილის OBD პროფილი აქტიურია'
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => applyObdAutoFill(true)}
                    className="px-3.5 py-2 rounded-xl bg-gold hover:bg-amber-400 text-navy text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm whitespace-nowrap self-end sm:self-auto"
                  >
                    <Zap size={14} className="fill-navy" />
                    <span>⚡ OBD ავტო-შევსება</span>
                  </button>
                </div>

                {obdSyncedNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{obdSyncedNotice}</span>
                  </div>
                )}

                {/* 3. DEDICATED THEMATIC CONFIGURATION PANEL */}

          {/* ================= CATEGORY 1: CHASSIS & WHEELS ================= */}
          {category === 'chassis' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-300/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-950 uppercase tracking-wider">
                  {renderVariantIcon(selectedVariant, 16)}
                  <span>1. სავალი ნაწილი და ბორბლები — {getVariantDefinition(selectedVariant)?.title_ge}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Chassis & Wheels
                </span>
              </div>

              {/* A. TIRES */}
              {selectedVariant === 'tires' && (
                <div className="space-y-4">
                  {/* Tire Size Chips */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      საბურავის ზომა (Tire Size):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['205/55 R16', '215/55 R16', '225/45 R17', '225/45 R18', '245/40 R19', '235/60 R18'].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setTireSize(s)}
                          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                            tireSize === s
                              ? 'bg-navy text-gold shadow-sm'
                              : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                      <input
                        type="text"
                        placeholder="სხვა..."
                        value={['205/55 R16', '215/55 R16', '225/45 R17', '225/45 R18', '245/40 R19', '235/60 R18'].includes(tireSize) ? '' : tireSize}
                        onChange={(e) => setTireSize(e.target.value)}
                        className="w-28 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Season Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      სეზონი:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'summer' as const, label: '☀️ ზაფხული' },
                        { key: 'winter' as const, label: '❄️ ზამთარი' },
                        { key: 'all_season' as const, label: '🍂 M+S ყველა სეზონი' }
                      ].map(season => (
                        <button
                          key={season.key}
                          type="button"
                          onClick={() => setTireSeason(season.key)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                            tireSeason === season.key
                              ? 'bg-navy text-gold shadow-sm'
                              : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {season.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tread Depth & Pressure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">
                          პროტექტორის სიღრმე:
                        </label>
                        <span className="font-mono text-xs font-bold text-navy">
                          {treadDepthMm.toFixed(1)} მმ
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.6"
                        max="9.0"
                        step="0.1"
                        value={treadDepthMm}
                        onChange={(e) => setTreadDepthMm(parseFloat(e.target.value))}
                        className="w-full accent-navy cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                        <span className="text-rose-500">1.6 მმ (კრიტიკული)</span>
                        <span className="text-emerald-600">8.0 მმ (ახალი)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        საბურავის წნევა (Bar / PSI):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={tirePressureBar}
                          onChange={(e) => setTirePressureBar(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                        />
                        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                          ≈ {(tirePressureBar * 14.5038).toFixed(1)} PSI
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      მწარმოებელი ბრენდი:
                    </label>
                    <input
                      type="text"
                      value={tireBrand}
                      onChange={(e) => setTireBrand(e.target.value)}
                      placeholder="მაგ: Michelin Pilot Sport 5"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* B. WHEEL ALIGNMENT */}
              {selectedVariant === 'wheel_alignment' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/80 border border-blue-200 text-xs text-slate-600">
                    თვლების სწორი გეომეტრია უზრუნველყოფს მანქანის სტაბილურობას, საწვავის ეკონომიას და საბურავების თანაბარ ცვეთას. რეკომენდებულია ყოველ 15,000 კმ-ზე ან სეზონურ შეცვლაზე.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        შესრულებული პროცედურა:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'alignment' as const, label: 'რაზვალი' },
                          { key: 'balancing' as const, label: 'ბალანსი' },
                          { key: 'both' as const, label: 'ორივე ✔' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setAlignmentType(opt.key)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                              alignmentType === opt.key
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        ღერძი:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: 'front' as const, label: 'წინა ღერძი' },
                          { key: 'both' as const, label: '4-ვე თვალი (ორივე)' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setAlignmentAxle(opt.key)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                              alignmentAxle === opt.key
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* C. BRAKE PADS */}
              {selectedVariant === 'brake_pads' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      ხუნდების პოზიცია:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'front' as const, label: 'წინა ხუნდები' },
                        { key: 'rear' as const, label: 'უკანა ხუნდები' },
                        { key: 'both' as const, label: 'ორივე (წინა+უკანა)' }
                      ].map(pos => (
                        <button
                          key={pos.key}
                          type="button"
                          onClick={() => setBrakePosition(pos.key)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                            brakePosition === pos.key
                              ? 'bg-navy text-gold shadow-sm'
                              : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ხუნდების ბრენდი:
                      </label>
                      <input
                        type="text"
                        value={brakeBrand}
                        onChange={(e) => setBrakeBrand(e.target.value)}
                        placeholder="მაგ: Brembo, Textar, TRW, Ferodo"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">
                          ხუნდების ცვეთის პროცენტი:
                        </label>
                        <span className="font-mono text-xs font-bold text-navy">
                          {brakeWearPct}% ცვეთა
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={brakeWearPct}
                        onChange={(e) => setBrakeWearPct(parseInt(e.target.value))}
                        className="w-full accent-navy cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                        <span className="text-emerald-600">0% (ახალი)</span>
                        <span className="text-rose-500">100% (გამოცვლა)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                      <input
                        type="checkbox"
                        checked={brakeFluidChecked}
                        onChange={(e) => setBrakeFluidChecked(e.target.checked)}
                        className="w-4 h-4 rounded text-gold focus:ring-gold"
                      />
                      <span>სამუხრუჭე სითხე (DOT 4 / 5.1) შემოწმებულია</span>
                    </label>
                  </div>
                </div>
              )}

              {/* D. BRAKE DISCS */}
              {selectedVariant === 'brake_discs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        დისკის სისქის კონტროლი (მმ):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={brakeDiscThicknessMm}
                        onChange={(e) => setBrakeDiscThicknessMm(parseFloat(e.target.value))}
                        placeholder="მაგ: 28.0"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        მწარმოებლის მინიმალური დასაშვები ზღვარი მითითებულია დისკზე
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        სამუხრუჭე დისკების მდგომარეობა:
                      </label>
                      <select
                        value={brakeDiscStatus}
                        onChange={(e) => setBrakeDiscStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      >
                        <option value="new">ახალი დისკები</option>
                        <option value="good">კარგი / უდეფექტო</option>
                        <option value="turned">გაიჩარხა (მოხეხვა)</option>
                        <option value="replace_soon">შესაცვლელია მალე</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* E. SHOCKS & MOUNTS */}
              {selectedVariant === 'shocks_mounts' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ამორტიზატორების მდგომარეობა:
                      </label>
                      <select
                        value={shocksCondition}
                        onChange={(e) => setShocksCondition(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      >
                        <option value="good">უდეფექტო / მშრალი</option>
                        <option value="leaking">შეიმჩნევა ზეთის გაჟონვა</option>
                        <option value="weak">დასუსტებული / ლაფსუსი</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ბრენდი / მოდელი:
                      </label>
                      <input
                        type="text"
                        value={shocksBrand}
                        onChange={(e) => setShocksBrand(e.target.value)}
                        placeholder="მაგ: Bilstein B4, Sachs, KYB"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* F. SUSPENSION ARMS */}
              {selectedVariant === 'suspension_arms' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      შემოწმებული დეტალები & დიაგნოსტიკის სტატუსი:
                    </label>
                    <input
                      type="text"
                      value={suspensionPartsChecked}
                      onChange={(e) => setSuspensionPartsChecked(e.target.value)}
                      placeholder="მაგ: გიტარები, შარავოები და ვტულკები შემოწმებულია"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= CATEGORY 2: FLUIDS ================= */}
          {category === 'fluids' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-300/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-950 uppercase tracking-wider">
                  {renderVariantIcon(selectedVariant, 16)}
                  <span>2. ზეთები და ტექნიკური სითხეები — {getVariantDefinition(selectedVariant)?.title_ge}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Fluids
                </span>
              </div>

              {/* A. ENGINE OIL */}
              {selectedVariant === 'engine_oil' && (
                <div className="space-y-4">
                  {/* Viscosity Quick Chips */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      ზეთის სიბლანტე (Viscosity):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['0W-20', '0W-30', '5W-30', '5W-40', '10W-40'].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setOilViscosity(v)}
                          className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                            oilViscosity === v
                              ? 'bg-navy text-gold shadow-sm'
                              : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                      <input
                        type="text"
                        placeholder="სხვა..."
                        value={['0W-20', '0W-30', '5W-30', '5W-40', '10W-40'].includes(oilViscosity) ? '' : oilViscosity}
                        onChange={(e) => setOilViscosity(e.target.value)}
                        className="w-24 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Brand Quick Chips */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      ზეთის მწარმოებელი ბრენდი:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Motul', 'Liqui Moly', 'Castrol', 'Mobil 1', 'Shell Helix', 'Ravenol', 'BMW TwinPower'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setOilBrand(b)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            oilBrand === b
                              ? 'bg-navy text-gold shadow-sm'
                              : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ჩასხმული მოცულობა (ლიტრი)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={oilLiters}
                        onChange={(e) => setOilLiters(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4 sm:pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                        <input
                          type="checkbox"
                          checked={oilFilterReplaced}
                          onChange={(e) => setOilFilterReplaced(e.target.checked)}
                          className="w-4 h-4 rounded text-gold focus:ring-gold"
                        />
                        <span>ზეთის ფილტრი შეიცვალა</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* B. TRANSMISSION FLUID (ATF) */}
              {selectedVariant === 'transmission_fluid' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        შეცვლის მეთოდი:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'full' as const, label: 'სრული (აპარატით)' },
                          { key: 'partial' as const, label: 'ნაწილობრივი (ჩამოღვრა)' }
                        ].map(m => (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setTransmissionFluidType(m.key)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                              transmissionFluidType === m.key
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        კოლოფის ტიპი & ზეთის ბრენდი:
                      </label>
                      <input
                        type="text"
                        value={transmissionFluidBrand}
                        onChange={(e) => setTransmissionFluidBrand(e.target.value)}
                        placeholder="მაგ: ZF Lifeguard 8, Motul ATF VI"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                      <input
                        type="checkbox"
                        checked={transmissionFilterReplaced}
                        onChange={(e) => setTransmissionFilterReplaced(e.target.checked)}
                        className="w-4 h-4 rounded text-gold focus:ring-gold"
                      />
                      <span>კოლოფის ფილტრი / პადდონი შეიცვალა</span>
                    </label>
                  </div>
                </div>
              )}

              {/* C. COOLANT / ANTIFREEZE */}
              {selectedVariant === 'coolant' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        გაყინვის წერტილი (°C):
                      </label>
                      <div className="flex items-center gap-2">
                        {[-30, -35, -40, -45].map(deg => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => setCoolantFreezingPointC(deg)}
                            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                              coolantFreezingPointC === deg
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {deg}°C
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ფერი / სპეციფიკაცია:
                      </label>
                      <input
                        type="text"
                        value={coolantSpec}
                        onChange={(e) => setCoolantSpec(e.target.value)}
                        placeholder="მაგ: G12+ (წითელი), G13"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* D. BRAKE FLUID */}
              {selectedVariant === 'brake_fluid' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        სპეციფიკაცია:
                      </label>
                      <div className="flex gap-2">
                        {['DOT 4', 'DOT 4 LV', 'DOT 5.1'].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setBrakeFluidDot(d)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              brakeFluidDot === d
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ტენიანობის პროცენტი (%):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={brakeFluidMoisturePct}
                        onChange={(e) => setBrakeFluidMoisturePct(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        ნორმა: &lt; 1.5%. &gt; 3.0%-ზე აუცილებელია შეცვლა
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* E. POWER STEERING FLUID */}
              {selectedVariant === 'power_steering_fluid' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      საჭის ჰიდრავლიკის სითხის სპეციფიკაცია:
                    </label>
                    <input
                      type="text"
                      value={powerSteeringFluidSpec}
                      onChange={(e) => setPowerSteeringFluidSpec(e.target.value)}
                      placeholder="მაგ: Pentosin CHF 11S, Dexron VI"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* F. DIFFERENTIAL & AWD */}
              {selectedVariant === 'differential_oil' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        სისტემა / ხიდი:
                      </label>
                      <select
                        value={differentialSystem}
                        onChange={(e) => setDifferentialSystem(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      >
                        <option value="4matic_awd">4MATIC / AWD / xDrive / Quattro</option>
                        <option value="rear_diff">უკანა ხიდი (Rear Differential)</option>
                        <option value="front_diff">წინა ხიდი (Front Differential)</option>
                        <option value="transfer_case">რაზდატკა (Transfer Case)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ზეთის სიბლანტე & კლასი:
                      </label>
                      <input
                        type="text"
                        value={differentialSpec}
                        onChange={(e) => setDifferentialSpec(e.target.value)}
                        placeholder="მაგ: 75W-90 GL-5 სინთეტიკა"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= CATEGORY 3: FILTERS ================= */}
          {category === 'filters' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-300/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-950 uppercase tracking-wider">
                  {renderVariantIcon(selectedVariant, 16)}
                  <span>3. ფილტრები და ჰაერის მიწოდება — {getVariantDefinition(selectedVariant)?.title_ge}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Filters
                </span>
              </div>

              {/* A. ENGINE AIR FILTER */}
              {selectedVariant === 'engine_air_filter' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 text-xs text-slate-600">
                    ძრავის სუფთა ჰაერის ფილტრი იცავს ცილინდრებს მტვრისგან და უზრუნველყოფს საწვავის ოპტიმალურ წვას. შეცვლის რეკომენდებული ინტერვალი: 10,000–15,000 კმ.
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      ფილტრის მწარმოებელი ბრენდი:
                    </label>
                    <input
                      type="text"
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      placeholder="მაგ: MANN-Filter, Mahle, Bosch, Filtron"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* B. CABIN FILTER */}
              {selectedVariant === 'cabin_filter' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      სალონის ფილტრის ტიპი:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'carbon' as const, label: 'აქტივირებული ნახშირის (ანტიალერგიული)' },
                        { key: 'standard' as const, label: 'სტანდარტული მტვრის' }
                      ].map(t => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setFilterCabinType(t.key)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                            filterCabinType === t.key
                              ? 'bg-navy text-gold shadow-sm'
                              : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      ბრენდი:
                    </label>
                    <input
                      type="text"
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      placeholder="მაგ: MANN FreciousPlus, Mahle CareMetix"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* C. FUEL FILTER */}
              {selectedVariant === 'fuel_filter' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        ძრავის საწვავის ტიპი:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'petrol' as const, label: 'ბენზინი' },
                          { key: 'diesel' as const, label: 'დიზელი (წყალგამყოფით)' }
                        ].map(f => (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setFilterFuelEngine(f.key)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                              filterFuelEngine === f.key
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ბრენდი:
                      </label>
                      <input
                        type="text"
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                        placeholder="მაგ: Bosch, MANN, Mahle"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= CATEGORY 4: ENGINE & IGNITION ================= */}
          {category === 'engine' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-300/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-950 uppercase tracking-wider">
                  {renderVariantIcon(selectedVariant, 16)}
                  <span>4. ძრავი და აალების სისტემა — {getVariantDefinition(selectedVariant)?.title_ge}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  Engine & Ignition
                </span>
              </div>

              {/* A. SPARK PLUGS */}
              {selectedVariant === 'spark_plugs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        სანთლების ტიპი (რესურსი 30-100k კმ):
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'iridium' as const, label: 'ირიდიუმი' },
                          { key: 'platinum' as const, label: 'პლატინა' },
                          { key: 'standard' as const, label: 'სტანდარტ.' }
                        ].map(t => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setSparkPlugType(t.key)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                              sparkPlugType === t.key
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ცილინდრების რაოდენობა:
                      </label>
                      <div className="flex gap-2">
                        {[4, 6, 8, 12].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setSparkPlugCount(n)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                              sparkPlugCount === n
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {n} ცალი
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      ბრენდი & მოდელი:
                    </label>
                    <input
                      type="text"
                      value={sparkPlugBrand}
                      onChange={(e) => setSparkPlugBrand(e.target.value)}
                      placeholder="მაგ: NGK Laser Iridium, Bosch Double Platinum"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* B. IGNITION COILS */}
              {selectedVariant === 'ignition_coils' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      მუშაობის სტატუსი & Misfire დიაგნოსტიკა:
                    </label>
                    <input
                      type="text"
                      value={ignitionCoilsStatus}
                      onChange={(e) => setIgnitionCoilsStatus(e.target.value)}
                      placeholder="მაგ: ყველა ცილინდრის კოჭა უდეფექტოა (0 Misfire)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* C. TIMING BELT / CHAIN */}
              {selectedVariant === 'timing_belt_chain' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        სისტემის ტიპი:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'belt' as const, label: 'კბილანა ღვედი (Belt)' },
                          { key: 'chain' as const, label: 'ძრავის ჯაჭვი (Chain)' }
                        ].map(t => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setTimingType(t.key)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                              timingType === t.key
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 sm:pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                        <input
                          type="checkbox"
                          checked={waterPumpReplaced}
                          onChange={(e) => setWaterPumpReplaced(e.target.checked)}
                          className="w-4 h-4 rounded text-gold focus:ring-gold"
                        />
                        <span>წყლის ტუმბო (პომპა) შეიცვალა</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* D. SERPENTINE BELT */}
              {selectedVariant === 'serpentine_belt' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      შეცვლილი კომპონენტები:
                    </label>
                    <input
                      type="text"
                      value={serpentineBeltParts}
                      onChange={(e) => setSerpentineBeltParts(e.target.value)}
                      placeholder="მაგ: დამხმარე ღვედი + დამჭიმი + 2 პარაზიტი როლიკი"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* E. THROTTLE CLEANING */}
              {selectedVariant === 'throttle_cleaning' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/80 border border-rose-200 text-xs text-slate-600">
                    დროსელის ზასლონკისა და შემშვები კოლექტორის გაწმენდა აუმჯობესებს აქსელერაციას, აქრობს ხალასტოი ხოდის (RPM) თამაშს და ამცირებს საწვავის ხარჯს.
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                      <input
                        type="checkbox"
                        checked={throttleAdapted}
                        onChange={(e) => setThrottleAdapted(e.target.checked)}
                        className="w-4 h-4 rounded text-gold focus:ring-gold"
                      />
                      <span>დროსელის ელექტრონული კომპიუტერული ადაპტაცია შესრულებულია</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= CATEGORY 5: ELECTRICAL & AC ================= */}
          {category === 'electrical' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-300/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-950 uppercase tracking-wider">
                  {renderVariantIcon(selectedVariant, 16)}
                  <span>5. ელექტროობა და კლიმატი — {getVariantDefinition(selectedVariant)?.title_ge}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Electrical & AC
                </span>
              </div>

              {/* A. BATTERY */}
              {selectedVariant === 'battery' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ტევადობა (Ah):
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {[60, 70, 80, 95, 105].map(ah => (
                          <button
                            key={ah}
                            type="button"
                            onClick={() => setBatteryCapacityAh(ah)}
                            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                              batteryCapacityAh === ah
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {ah}Ah
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ძაბვა მოსვენებისას (V):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={batteryVoltage}
                        onChange={(e) => setBatteryVoltage(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        დამზადების თარიღი:
                      </label>
                      <input
                        type="text"
                        value={batteryMfgDate}
                        onChange={(e) => setBatteryMfgDate(e.target.value)}
                        placeholder="მაგ: 2025/11"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      აკუმულატორის ბრენდი & ტიპი:
                    </label>
                    <input
                      type="text"
                      value={batteryBrand}
                      onChange={(e) => setBatteryBrand(e.target.value)}
                      placeholder="მაგ: Varta Silver Dynamic AGM, Bosch S5"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* B. AC & FREON */}
              {selectedVariant === 'ac_system' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ფრეონის ტიპი & რაოდენობა:
                      </label>
                      <div className="flex items-center gap-2">
                        {['R134a', 'R1234yf'].map(ft => (
                          <button
                            key={ft}
                            type="button"
                            onClick={() => setAcFreonType(ft)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              acFreonType === ft
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {ft}
                          </button>
                        ))}
                        <input
                          type="number"
                          value={acFreonGrams}
                          onChange={(e) => setAcFreonGrams(Number(e.target.value))}
                          placeholder="გრ"
                          className="w-24 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                        />
                        <span className="text-xs font-mono text-slate-500">გრამი</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 sm:pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                        <input
                          type="checkbox"
                          checked={acCompressorOilChecked}
                          onChange={(e) => setAcCompressorOilChecked(e.target.checked)}
                          className="w-4 h-4 rounded text-gold focus:ring-gold"
                        />
                        <span>კომპრესორის ზეთი (PAG 46) დამატებულია</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* C. ALTERNATOR & STARTER */}
              {selectedVariant === 'alternator_starter' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      გენერატორის გამომავალი ძაბვა (V):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={alternatorVoltageOutput}
                      onChange={(e) => setAlternatorVoltageOutput(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      ნორმა დატვირთვის ქვეშ: 13.8V – 14.4V
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= CATEGORY 6: LEGAL & INSURANCE ================= */}
          {category === 'legal' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-500/10 border border-teal-300/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-teal-950 uppercase tracking-wider">
                  {renderVariantIcon(selectedVariant, 16)}
                  <span>6. იურიდიული და სადაზღვევო ვადები — {getVariantDefinition(selectedVariant)?.title_ge}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Legal & PTI
                </span>
              </div>

              {/* A. PTI */}
              {selectedVariant === 'pti' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ბოლო გავლის თარიღი:
                      </label>
                      <input
                        type="date"
                        value={lastServiceDate}
                        onChange={(e) => {
                          setLastServiceDate(e.target.value);
                          setPtiExpiryDate(calculateDefaultExpiry(e.target.value, 1));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        მომდევნო გავლის ვადა (1 წელი):
                      </label>
                      <input
                        type="date"
                        value={ptiExpiryDate}
                        onChange={(e) => setPtiExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-teal-400 text-xs font-mono font-bold text-teal-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        ტექ-ინსპექტირების ცენტრი:
                      </label>
                      <input
                        type="text"
                        value={ptiCenter}
                        onChange={(e) => setPtiCenter(e.target.value)}
                        placeholder="მაგ: თბილისი, Greenway დიღომი"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        სერტიფიკატის / აქტის #:
                      </label>
                      <input
                        type="text"
                        value={ptiCertNumber}
                        onChange={(e) => setPtiCertNumber(e.target.value)}
                        placeholder="PTI-GE-98432"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                      <BellRing size={15} className="text-gold" />
                      <span>შეხსენების გააქტიურება (30 დღით ადრე)</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={ptiReminderEnabled}
                      onChange={(e) => setPtiReminderEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-gold focus:ring-gold"
                    />
                  </div>
                </div>
              )}

              {/* B. INSURANCE */}
              {selectedVariant === 'insurance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        დაზღვევის ტიპი:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'casco' as const, label: 'კასკო (სრული)' },
                          { key: 'mtpl' as const, label: 'სავალდებულო (MTPL)' }
                        ].map(t => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setInsuranceType(t.key)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                              insuranceType === t.key
                                ? 'bg-navy text-gold shadow-sm'
                                : 'bg-white text-navy border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        სადაზღვევო კომპანია:
                      </label>
                      <input
                        type="text"
                        value={insuranceCompany}
                        onChange={(e) => setInsuranceCompany(e.target.value)}
                        placeholder="მაგ: ალდაგი, TBC დაზღვევა, GPI Holding"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        პოლისის ნომერი:
                      </label>
                      <input
                        type="text"
                        value={insurancePolicyNumber}
                        onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                        placeholder="მაგ: POL-2026-9812"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        პოლისის მოქმედების ვადა:
                      </label>
                      <input
                        type="date"
                        value={insuranceExpiryDate}
                        onChange={(e) => setInsuranceExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-teal-400 text-xs font-mono font-bold text-teal-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* C. PARKING PERMIT */}
              {selectedVariant === 'parking_permit' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        საშვის ზონა / ტიპი:
                      </label>
                      <input
                        type="text"
                        value={parkingPermitZone}
                        onChange={(e) => setParkingPermitZone(e.target.value)}
                        placeholder="მაგ: თბილისის წლიური საშვი (ზონა A/B)"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        საშვის მოქმედების ვადა:
                      </label>
                      <input
                        type="date"
                        value={parkingPermitExpiry}
                        onChange={(e) => setParkingPermitExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-teal-400 text-xs font-mono font-bold text-teal-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* D. DRIVING LICENSE */}
              {selectedVariant === 'driving_license' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        მოწმობის ნომერი:
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="DL-GE-984210"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        კატეგორიები:
                      </label>
                      <input
                        type="text"
                        value={licenseCategories}
                        onChange={(e) => setLicenseCategories(e.target.value)}
                        placeholder="B, B1, BE"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        განახლების თარიღი:
                      </label>
                      <input
                        type="date"
                        value={licenseExpiryDate}
                        onChange={(e) => setLicenseExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-teal-400 text-xs font-mono font-bold text-teal-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OEM Part Number & Brand Selection (Step 2) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <Wrench size={13} className="text-gold" />
                <span>მწარმოებელი, ბრენდი & ნაწილის კოდი</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">არასავალდებულო</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ნაწილის კოდი / არტიკული (OEM #)
                </label>
                <input
                  type="text"
                  value={customPartNumber}
                  onChange={(e) => setCustomPartNumber(e.target.value)}
                  placeholder="OEM-11427566327"
                  className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono font-bold text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  არჩეული ბრენდი / მომწოდებელი
                </label>
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Motul, Brembo, OEM..."
                  className="w-full px-3.5 py-2 rounded-xl neu-inset font-bold text-xs text-navy focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Brand selection */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold mr-1">სწრაფი ბრენდი:</span>
              {['Motul', 'Brembo', 'Bosch', 'Bilstein', 'NGK', 'MANN-Filter', 'Liqui Moly', 'Varta', 'OEM'].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCustomBrand(b);
                    if (!title.includes(b)) {
                      setTitle(prev => prev ? `${prev} (${b})` : b);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    customBrand === b
                      ? 'bg-navy text-gold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Financial Calculator (Part + Labor = Total) (Step 2) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-navy flex items-center gap-1.5">
                <TrendingUp size={14} className="text-gold" />
                <span>ფინანსური კალკულატორი (ხარჯთაღრიცხვა)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ავტომატური ჯამური კალკულაცია
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ნაწილის / მასალის ფასი (₾)
                </label>
                <input
                  type="number"
                  value={partCostGel}
                  onChange={(e) => {
                    const p = Number(e.target.value) || 0;
                    setPartCostGel(p);
                    setCostGel(p + (Number(laborCostGel) || 0));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono font-bold text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ხელობის / სერვისის ფასი (₾)
                </label>
                <input
                  type="number"
                  value={laborCostGel}
                  onChange={(e) => {
                    const l = Number(e.target.value) || 0;
                    setLaborCostGel(l);
                    setCostGel((Number(partCostGel) || 0) + l);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono font-bold text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  სულ ჯამი (₾ GEL)
                </label>
                <input
                  type="number"
                  value={costGel}
                  onChange={(e) => {
                    const total = Number(e.target.value) || 0;
                    setCostGel(total);
                    setPartCostGel(Math.round(total * 0.75));
                    setLaborCostGel(Math.round(total * 0.25));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-gold/15 border-2 border-gold/40 font-mono font-black text-sm text-navy focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
              <span>1,000 კმ-ის თვითღირებულება:</span>
              <span className="font-mono font-bold text-navy">
                ~{intervalKm > 0 ? Math.round(((costGel || 0) / intervalKm) * 1000) : 0} ₾ / 1,000 კმ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: MILEAGE, INTERVAL, WEAR & REVIEW ================= */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fade-in">
          {/* C. ცოცხალი გარბენისა და რესურსის კალკულატორი */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-navy flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-600" />
                <span>გარბენისა და რესურსის ცოცხალი კალკულატორი</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                ავტომობილის გარბენი: {currentVehicleMileage.toLocaleString()} კმ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    ბოლო სერვისის გარბენი (კმ)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setLastServiceKm(vehicle?.mileage_km || currentVehicleMileage);
                    }}
                    className="text-[10px] text-gold hover:text-amber-600 font-bold underline"
                  >
                    დღევანდელი OBD გარბენი ({(vehicle?.mileage_km || currentVehicleMileage).toLocaleString()})
                  </button>
                </div>
                <input
                  type="number"
                  value={lastServiceKm}
                  onChange={(e) => setLastServiceKm(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono font-bold text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  შეცვლის ინტერვალი (კმ)
                </label>
                <input
                  type="number"
                  value={intervalKm}
                  onChange={(e) => setIntervalKm(Number(e.target.value) || 1000)}
                  className="w-full px-3.5 py-2 rounded-xl neu-inset font-mono font-bold text-xs text-navy focus:outline-none"
                />
              </div>
            </div>

            {/* Quick interval chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-bold mr-1">სწრაფი ინტერვალი:</span>
              {[5000, 8000, 10000, 15000, 30000, 60000, 100000].map(km => (
                <button
                  key={km}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIntervalKm(km);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    intervalKm === km
                      ? 'bg-navy text-gold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {km.toLocaleString()} კმ
                </button>
              ))}
            </div>

            {/* LIVE MATHEMATICAL CALCULATION PREVIEW BOX */}
            {(() => {
              const drivenKm = Math.max(0, currentVehicleMileage - lastServiceKm);
              const remainingKm = Math.max(0, intervalKm - drivenKm);
              const healthPct = intervalKm > 0 ? Math.max(0, Math.min(100, Math.round((remainingKm / intervalKm) * 100))) : 100;
              const wearPct = 100 - healthPct;
              const daysLeft = Math.round(remainingKm / 35);
              const isCrit = healthPct <= 20;
              const isWarn = healthPct <= 50 && !isCrit;

              return (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-navy">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className={isCrit ? 'text-rose-500' : isWarn ? 'text-amber-500' : 'text-emerald-500'} />
                      <span>გამოთვლილი რესურსის სტატუსი:</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                      isCrit ? 'bg-rose-100 text-rose-700' : isWarn ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {healthPct}% რესურსი (ცვეთა: {wearPct}%)
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCrit ? 'bg-rose-500' : isWarn ? 'bg-gold' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(5, healthPct)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-sans">გავლილია</span>
                      <span className="font-bold text-navy">{drivenKm.toLocaleString()} კმ</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-sans">დარჩა რესურსი</span>
                      <span className={`font-black ${isCrit ? 'text-rose-600' : 'text-navy'}`}>
                        {remainingKm.toLocaleString()} კმ
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-sans">პროგნოზი</span>
                      <span className="font-bold text-navy">~{daysLeft} დღე</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 block font-sans">სტატუსი</span>
                      <span className={`font-bold ${isCrit ? 'text-rose-600' : isWarn ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {isCrit ? 'შეცვლა!' : isWarn ? 'ყურადღება' : 'ნორმა'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* D. შენიშვნა / საგარანტიო პირობა */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <label className="block text-[11px] font-bold text-slate-600">
              შენიშვნა, სერვის-ცენტრი & გარანტია
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="მაგ: შეცვლილია თეგეტა მოტორსში, გაცემულია 1-წლიანი გარანტია..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {/* Step 3 Final Review Card */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-slate-900 to-navy text-white shadow-lg border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gold/20 text-gold flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-gold">სერვისის შეჯამება შენახვამდე</span>
                  <div className="text-[11px] text-slate-300 font-bold">{title || 'ავტო სერვისი'}</div>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-gold bg-gold/10 px-2.5 py-1 rounded-lg border border-gold/20">
                სულ: {costGel} ₾
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-sans">კატეგორია</span>
                <span className="font-bold text-white truncate block">{SERVICE_CATEGORIES.find(c => c.id === category)?.name_ge}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-sans">ბრენდი / კოდი</span>
                <span className="font-bold text-white truncate block">{customBrand || 'სტანდარტული'}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-sans">ბოლო შეცვლა</span>
                <span className="font-bold text-white">{lastServiceKm.toLocaleString()} კმ</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block font-sans">შემდეგი შეცვლა</span>
                <span className="font-bold text-gold">{(lastServiceKm + intervalKm).toLocaleString()} კმ</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </form>
  )}

  {/* Sticky Footer Actions Bar */}
  {modalMode === 'view' ? (
    <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 z-20 shrink-0">
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          onClose();
        }}
        className="px-5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-slate-600 hover:text-navy active:scale-95 transition-all"
      >
        დახურვა
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => applyObdAutoFill(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          title="OBD მონაცემების ხელახალი სინქრონიზაცია"
        >
          <Cpu size={14} className="text-blue-600" />
          <span>OBD განახლება</span>
        </button>

        <button
          type="button"
          onClick={handleQuickRenewToday}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          title="დღეს შეცვლილად მონიშვნა (100% რესურსი)"
        >
          <CheckCircle2 size={14} />
          <span>✔ დღეს განახლება (100%)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setModalMode('wizard');
            setCurrentStep(1);
          }}
          className="px-5 py-2.5 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Edit3 size={14} />
          <span>✎ ეტაპობრივი რედაქტირება</span>
        </button>
      </div>
    </div>
  ) : (
    <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 z-20 shrink-0">
      <div>
        {currentStep === 1 ? (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (isEditing) {
                setModalMode('view');
              } else {
                onClose();
              }
            }}
            className="px-5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-slate-600 hover:text-navy active:scale-95 transition-all"
          >
            {isEditing ? 'ერთიანი ხედი' : 'გაუქმება'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1));
            }}
            className="px-5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-slate-700 hover:text-navy active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>უკან</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {currentStep === 2 && (
          <button
            type="button"
            onClick={() => applyObdAutoFill(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span>⚡ OBD შევსება</span>
          </button>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setCurrentStep((prev) => ((prev + 1) as 1 | 2 | 3));
            }}
            className="px-6 py-2.5 rounded-2xl bg-navy hover:bg-navy/90 text-gold font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>შემდეგი ეტაპი</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="submit"
            form="thematic-service-form"
            className="px-6 py-2.5 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-2 transition-all active:scale-95"
          >
            <Check size={16} />
            <span>{isEditing ? '💾 სერვისის განახლება' : '💾 სერვისის დამახსოვრება & შენახვა'}</span>
          </button>
        )}
      </div>
    </div>
  )}

      </div>
    </div>
  );
};

export default ThematicServiceModal;
