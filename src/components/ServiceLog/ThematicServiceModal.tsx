import React, { useState, useEffect } from 'react';
import { ServiceItem, ServiceCategory, ServiceVariantKey } from '../../types';
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
  CheckCircle2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceItem) => void;
  serviceToEdit?: ServiceItem | null;
  currentVehicleMileage: number;
  initialCategory?: ServiceCategory;
  initialVariantKey?: ServiceVariantKey;
}

export const ThematicServiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  serviceToEdit,
  currentVehicleMileage,
  initialCategory,
  initialVariantKey
}) => {
  const isEditing = Boolean(serviceToEdit);

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
      // New item initialization
      const catToSet = initialCategory || 'fluids';
      setCategory(catToSet);
      
      const variants = getVariantsByCategory(catToSet);
      const variantToSet = initialVariantKey || (variants[0] ? variants[0].key : 'engine_oil');
      applyVariantPreset(variantToSet, catToSet);
      
      const today = new Date().toISOString().split('T')[0];
      setLastServiceDate(today);
      setLastServiceKm(currentVehicleMileage);
      setPtiExpiryDate(calculateDefaultExpiry(today, 1));
      setInsuranceExpiryDate(calculateDefaultExpiry(today, 1));
      setParkingPermitExpiry(calculateDefaultExpiry(today, 1));
      setLicenseExpiryDate(calculateDefaultExpiry(today, 10));
    }
  }, [serviceToEdit, isOpen, currentVehicleMileage, initialCategory, initialVariantKey]);

  // Apply a variant's preset defaults
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
        
        {/* Sticky Header with Permanent Close Button */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-white border-b border-slate-200 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm shrink-0">
              <Wrench className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-navy">
                {isEditing ? 'სერვისის რედაქტირება & კალკულატორი' : 'ინდივიდუალური სერვისის შექმნა & კალკულატორი'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                სერვისის ინდივიდუალური აწყობა, რესურსის ცოცხალი კალკულაცია და დამახსოვრება
              </p>
            </div>
          </div>
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

        <form id="thematic-service-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          
          {/* 1. Six Primary Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-navy uppercase tracking-wider">
                1. აირჩიეთ სერვისის კატეგორია (6 კატეგორია)
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

          {/* 4. ინდივიდუალური აწყობა & ცოცხალი კალკულატორი */}
          <div className="p-5 rounded-3xl neu-surface border border-white space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center">
                  <Calculator size={18} className="text-navy" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-navy uppercase tracking-wider">
                    4. ინდივიდუალური აწყობა & ცოცხალი კალკულატორი
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    რესურსის, ცვეთის %, დარჩენილი კმ-ებისა და ხარჯების ავტომატური კალკულაცია
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-navy text-gold">
                LIVE CALCULATOR
              </span>
            </div>

            {/* A. სერვისის სათაური და კომპონენტის ბრენდი / კოდი */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  სერვისის დასახელება (სათაური) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="მაგ: ძრავის ზეთი (Motul 5W-30) & ზეთის ფილტრი"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ნაწილის კოდი / არტიკული (OEM #)
                </label>
                <input
                  type="text"
                  value={customPartNumber}
                  onChange={(e) => setCustomPartNumber(e.target.value)}
                  placeholder="OEM-11427566327"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-navy focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Brand selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-600">
                  მწარმოებელი / ბრენდი:
                </label>
                <span className="text-[10px] text-slate-400">სწრაფი არჩევა</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
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
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="სხვა ბრენდი..."
                  className="w-28 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-navy focus:outline-none"
                />
              </div>
            </div>

            {/* B. ფინანსური კალკულატორი (ნაწილი + ხელობა = სულ) */}
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

            {/* C. ცოცხალი გარბენისა და რესურსის კალკულატორი */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-navy flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-600" />
                  <span>გარბენისა და რესურსის ცოცხალი კალკულატორი</span>
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                  მანქანის გარბენი: {currentVehicleMileage.toLocaleString()} კმ
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
                        setLastServiceKm(currentVehicleMileage);
                      }}
                      className="text-[10px] text-gold hover:text-amber-600 font-bold underline"
                    >
                      დღევანდელი გარბენი ({currentVehicleMileage.toLocaleString()})
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
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
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
          </div>

        </form>

        {/* Sticky Footer Actions Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-end gap-3 z-20 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-slate-600 hover:text-navy active:scale-95 transition-all"
          >
            გაუქმება / დახურვა
          </button>
          <button
            type="submit"
            form="thematic-service-form"
            className="px-6 py-2.5 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-2 transition-all active:scale-95"
          >
            <Check size={16} />
            <span>{isEditing ? '💾 სერვისის განახლება' : '💾 სერვისის დამახსოვრება & შენახვა'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ThematicServiceModal;
