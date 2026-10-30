import { ServiceCategory, ServiceVariantKey, ServiceItem } from '../types';

export interface CategoryDefinition {
  id: ServiceCategory;
  name_ge: string;
  name_en: string;
  subtitle_ge: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
}

export interface VariantDefinition {
  key: ServiceVariantKey;
  categoryId: ServiceCategory;
  title_ge: string;
  title_en: string;
  shortDesc_ge: string;
  defaultIntervalKm: number;
  defaultIntervalDays?: number;
  defaultCostGel: number;
  iconName: string;
  recommendedBrands?: string[];
  specsExample?: string;
  defaultValues: Partial<ServiceItem>;
}

export const SERVICE_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'chassis',
    name_ge: 'სავალი ნაწილი და ბორბლები',
    name_en: 'Chassis & Wheels',
    subtitle_ge: 'საბურავები, რაზვალი, ხუნდები, დისკები, ამორტიზატორები & გიტარები',
    color: 'text-blue-500',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200',
    iconName: 'CircleDot'
  },
  {
    id: 'fluids',
    name_ge: 'ზეთები და ტექნიკური სითხეები',
    name_en: 'Fluids',
    subtitle_ge: 'ძრავი, ATF კოლოფი, ანტიფრიზი, DOT 4, ჰიდრავლიკა & დიფერენციალი',
    color: 'text-amber-500',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-200',
    iconName: 'Droplets'
  },
  {
    id: 'filters',
    name_ge: 'ფილტრები და ჰაერის მიწოდება',
    name_en: 'Filters',
    subtitle_ge: 'ძრავის ჰაერის, სალონის მიკროფილტრი & საწვავის ფილტრაცია',
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    iconName: 'Filter'
  },
  {
    id: 'engine',
    name_ge: 'ძრავი და აალების სისტემა',
    name_en: 'Engine & Ignition',
    subtitle_ge: 'სვეჩები, ბაბინები, ღვედი/ცეპი, დამჭიმები & დროსელის წმენდა',
    color: 'text-rose-500',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-200',
    iconName: 'Gauge'
  },
  {
    id: 'electrical',
    name_ge: 'ელექტროობა და კლიმატი',
    name_en: 'Electrical & AC',
    subtitle_ge: 'აკუმულატორი, ფრეონი & კომპრესორი, გენერატორი & სტარტერი',
    color: 'text-indigo-500',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    iconName: 'Zap'
  },
  {
    id: 'legal',
    name_ge: 'ტექ-დათვალიერება (PTI) & იურიდიული',
    name_en: 'PTI & Legal',
    subtitle_ge: 'ტექ-ინსპექტირება PTI, კასკო/სავალდებულო, პარკირება & მართვის მოწმობა',
    color: 'text-teal-600',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-700',
    borderColor: 'border-teal-200',
    iconName: 'ShieldCheck'
  }
];

export const SERVICE_VARIANTS: VariantDefinition[] = [
  // ================= 1. სავალი ნაწილი და ბორბლები (Chassis & Wheels) =================
  {
    key: 'tires',
    categoryId: 'chassis',
    title_ge: 'საბურავები',
    title_en: 'Tires',
    shortDesc_ge: 'ზომა, სეზონი (ზაფხული/ზამთარი/M+S), პროტექტორის სიღრმე (მმ) და წნევა (Bar/PSI)',
    defaultIntervalKm: 40000,
    defaultCostGel: 950,
    iconName: 'CircleDot',
    recommendedBrands: ['Michelin', 'Continental', 'Bridgestone', 'Pirelli', 'Goodyear', 'Hankook'],
    specsExample: '225/45 R18 • 2.3 Bar • 7.0 მმ',
    defaultValues: {
      category: 'chassis',
      variant_key: 'tires',
      variant_name_ge: 'საბურავები',
      title_ge: 'საბურავები (Michelin Pilot Sport 5)',
      interval_km: 40000,
      cost_gel: 950,
      tire_size: '225/45 R18',
      tire_season: 'summer',
      tire_brand: 'Michelin Pilot Sport 5',
      tread_depth_mm: 7.0,
      tire_pressure_bar: 2.3
    }
  },
  {
    key: 'wheel_alignment',
    categoryId: 'chassis',
    title_ge: 'თვლების გეომეტრია (რაზვალი/ბალანსირება)',
    title_en: 'Wheel Alignment & Balancing',
    shortDesc_ge: 'სეზონური შემოწმების რესურსი, 3D ლაზერული გასწორება და ბალანსი',
    defaultIntervalKm: 15000,
    defaultCostGel: 70,
    iconName: 'Compass',
    recommendedBrands: ['Hunter 3D HawkEye', 'Corghi', 'Hofmann'],
    specsExample: '3D რაზვალი • წინა/უკანა ღერძი',
    defaultValues: {
      category: 'chassis',
      variant_key: 'wheel_alignment',
      variant_name_ge: 'თვლების გეომეტრია',
      title_ge: 'თვლების გეომეტრია (3D რაზვალი & ბალანსირება)',
      interval_km: 15000,
      cost_gel: 70,
      alignment_type: 'both',
      alignment_axle: 'both'
    }
  },
  {
    key: 'brake_pads',
    categoryId: 'chassis',
    title_ge: 'სამუხრუჭე ხუნდები (წინა/უკანა)',
    title_en: 'Brake Pads (Front/Rear)',
    shortDesc_ge: 'ცვეთის პროცენტი და რესურსი კილომეტრებში, კერამიკა/მეტალო-კერამიკა',
    defaultIntervalKm: 25000,
    defaultCostGel: 260,
    iconName: 'Disc',
    recommendedBrands: ['Brembo', 'Textar', 'TRW', 'Ferodo', 'ATE', 'Bosch'],
    specsExample: 'Brembo Ceramic • წინა ხუნდები',
    defaultValues: {
      category: 'chassis',
      variant_key: 'brake_pads',
      variant_name_ge: 'სამუხრუჭე ხუნდები',
      title_ge: 'სამუხრუჭე ხუნდები (Brembo Ceramic - წინა)',
      interval_km: 25000,
      cost_gel: 260,
      brake_position: 'front',
      brake_brand: 'Brembo',
      brake_wear_pct: 25,
      brake_fluid_checked: true
    }
  },
  {
    key: 'brake_discs',
    categoryId: 'chassis',
    title_ge: 'სამუხრუჭე დისკები',
    title_en: 'Brake Rotors / Discs',
    shortDesc_ge: 'სისქის კონტროლი (მმ), მოხეხვა/გაჩარხვა და შეცვლის ინტერვალი',
    defaultIntervalKm: 60000,
    defaultCostGel: 480,
    iconName: 'Disc',
    recommendedBrands: ['Brembo', 'Zimmermann', 'ATE', 'TRW', 'Textar'],
    specsExample: '28.0 მმ • ახალი დისკები',
    defaultValues: {
      category: 'chassis',
      variant_key: 'brake_discs',
      variant_name_ge: 'სამუხრუჭე დისკები',
      title_ge: 'სამუხრუჭე დისკები (Zimmermann ვენტილირებადი)',
      interval_km: 60000,
      cost_gel: 480,
      brake_position: 'front',
      brake_disc_thickness_mm: 28.0,
      brake_disc_status: 'good'
    }
  },
  {
    key: 'shocks_mounts',
    categoryId: 'chassis',
    title_ge: 'ამორტიზატორები და საყრდენი ბალიშები (ჩაშკები)',
    title_en: 'Shock Absorbers & Strut Mounts',
    shortDesc_ge: 'მუშაობის რესურსი, გაჟონვის კონტროლი და საყრდენი საკისრები',
    defaultIntervalKm: 80000,
    defaultCostGel: 650,
    iconName: 'Wrench',
    recommendedBrands: ['Bilstein', 'Sachs', 'KYB (Kayaba)', 'Monroe'],
    specsExample: 'Bilstein B4 • გაჟონვის გარეშე',
    defaultValues: {
      category: 'chassis',
      variant_key: 'shocks_mounts',
      variant_name_ge: 'ამორტიზატორები & ჩაშკები',
      title_ge: 'ამორტიზატორები და საყრდენი ჩაშკები (Bilstein)',
      interval_km: 80000,
      cost_gel: 650,
      shocks_condition: 'good',
      shocks_brand: 'Bilstein'
    }
  },
  {
    key: 'suspension_arms',
    categoryId: 'chassis',
    title_ge: 'გიტარები, შარავოები და ვტულკები',
    title_en: 'Control Arms, Ball Joints & Bushings',
    shortDesc_ge: 'პერიოდული დიაგნოსტიკის ინტერვალი, სტაბილიზატორის ტიაგები და რეზინები',
    defaultIntervalKm: 20000,
    defaultCostGel: 210,
    iconName: 'Wrench',
    recommendedBrands: ['Lemförder', 'Meyle HD', 'TRW', 'Sidem', 'Moog'],
    specsExample: 'Lemförder • ლუფტი არ აქვს',
    defaultValues: {
      category: 'chassis',
      variant_key: 'suspension_arms',
      variant_name_ge: 'სავალის დეტალები',
      title_ge: 'გიტარები, შარავოები & ვტულკები (დიაგნოსტიკა)',
      interval_km: 20000,
      cost_gel: 210,
      suspension_parts_checked: 'გიტარები, შარავოები, სტაბილიზატორის რეზინები შემოწმებულია'
    }
  },

  // ================= 2. ზეთები და ტექნიკური სითხეები (Fluids) =================
  {
    key: 'engine_oil',
    categoryId: 'fluids',
    title_ge: 'ძრავის ზეთი და ზეთის ფილტრი',
    title_en: 'Engine Oil & Filter',
    shortDesc_ge: 'მარკა/სიბლანტე, მოცულობა და გარბენის ინტერვალი (8,000 კმ)',
    defaultIntervalKm: 8000,
    defaultCostGel: 240,
    iconName: 'Droplets',
    recommendedBrands: ['Motul', 'Liqui Moly', 'Castrol', 'Mobil 1', 'Shell Helix', 'Ravenol', 'BMW TwinPower'],
    specsExample: '5W-30 • 5.2 ლ • Motul 8100',
    defaultValues: {
      category: 'fluids',
      variant_key: 'engine_oil',
      variant_name_ge: 'ძრავის ზეთი',
      title_ge: 'ძრავის ზეთი (Motul 5W-30) & ზეთის ფილტრი',
      interval_km: 8000,
      cost_gel: 240,
      oil_viscosity: '5W-30',
      oil_brand: 'Motul',
      oil_liters: 5.2,
      oil_filter_replaced: true
    }
  },
  {
    key: 'transmission_fluid',
    categoryId: 'fluids',
    title_ge: 'გადაცემათა კოლოფის ზეთი (ATF)',
    title_en: 'Transmission Fluid (ATF)',
    shortDesc_ge: 'სრული ან ნაწილობრივი შეცვლის რესურსი (50,000–60,000 კმ), კოლოფის ფილტრი',
    defaultIntervalKm: 60000,
    defaultCostGel: 680,
    iconName: 'Droplets',
    recommendedBrands: ['ZF Lifeguard 8', 'Motul ATF VI', 'Liqui Moly Top Tec', 'Ravenol ATF', 'Toyota WS'],
    specsExample: 'ZF 8HP სრული შეცვლა • ახალი პადდონი/ფილტრი',
    defaultValues: {
      category: 'fluids',
      variant_key: 'transmission_fluid',
      variant_name_ge: 'კოლოფის ზეთი ATF',
      title_ge: 'გადაცემათა კოლოფის ზეთი (ATF ZF 8HP & ფილტრი)',
      interval_km: 60000,
      cost_gel: 680,
      transmission_fluid_type: 'full',
      transmission_type: 'zf8hp',
      transmission_filter_replaced: true,
      transmission_fluid_brand: 'ZF Lifeguard 8'
    }
  },
  {
    key: 'coolant',
    categoryId: 'fluids',
    title_ge: 'გამაგრილებელი სითხე (ანტიფრიზი)',
    title_en: 'Coolant / Antifreeze',
    shortDesc_ge: 'გაყინვის წერტილი (°C), ფერი/სპეციფიკაცია და შეცვლის ტაიმერი (2–3 წელი)',
    defaultIntervalKm: 60000,
    defaultIntervalDays: 730,
    defaultCostGel: 130,
    iconName: 'Droplets',
    recommendedBrands: ['HEPU G12+', 'Liqui Moly KFS', 'Motul Auto Cool', 'Febi Bilstein'],
    specsExample: '-35°C გაყინვის წერტილი • G12+ წითელი',
    defaultValues: {
      category: 'fluids',
      variant_key: 'coolant',
      variant_name_ge: 'ანტიფრიზი',
      title_ge: 'გამაგრილებელი სითხე - ანტიფრიზი (HEPU G12+ -35°C)',
      interval_km: 60000,
      cost_gel: 130,
      coolant_freezing_point_c: -35,
      coolant_spec: 'G12+ (წითელი)'
    }
  },
  {
    key: 'brake_fluid',
    categoryId: 'fluids',
    title_ge: 'სამუხრუჭე სითხე (DOT 4 / 5.1)',
    title_en: 'Brake Fluid (DOT 4 / 5.1)',
    shortDesc_ge: 'ტენიანობის პროცენტი (< 2%) და შეცვლის ვადა (2 წელი)',
    defaultIntervalKm: 40000,
    defaultIntervalDays: 730,
    defaultCostGel: 90,
    iconName: 'Droplets',
    recommendedBrands: ['Brembo DOT 4 LV', 'Motul DOT 5.1', 'ATE SL.6', 'Bosch DOT 4'],
    specsExample: 'DOT 4 LV • ტენიანობა 0.6% (ნორმაშია)',
    defaultValues: {
      category: 'fluids',
      variant_key: 'brake_fluid',
      variant_name_ge: 'სამუხრუჭე სითხე',
      title_ge: 'სამუხრუჭე სითხე (Brembo DOT 4 Low Viscosity)',
      interval_km: 40000,
      cost_gel: 90,
      brake_fluid_moisture_pct: 0.6,
      brake_fluid_dot: 'DOT 4'
    }
  },
  {
    key: 'power_steering_fluid',
    categoryId: 'fluids',
    title_ge: 'ჰიდრავლიკის სითხე (Power Steering Fluid)',
    title_en: 'Power Steering Fluid',
    shortDesc_ge: 'საჭის მექანიზმის ჰიდრავლიკური სითხის რესურსი და შემოწმება',
    defaultIntervalKm: 50000,
    defaultCostGel: 110,
    iconName: 'Droplets',
    recommendedBrands: ['Pentosin CHF 11S', 'Liqui Moly Zentralhydrauliköl', 'Ravenol SSF'],
    specsExample: 'Pentosin CHF 11S სინთეტიკა',
    defaultValues: {
      category: 'fluids',
      variant_key: 'power_steering_fluid',
      variant_name_ge: 'ჰიდრავლიკის სითხე',
      title_ge: 'საჭის ჰიდრავლიკის სითხე (Pentosin CHF 11S)',
      interval_km: 50000,
      cost_gel: 110,
      power_steering_fluid_spec: 'Pentosin CHF 11S'
    }
  },
  {
    key: 'differential_oil',
    categoryId: 'fluids',
    title_ge: 'ხიდებისა და რაზდატკის ზეთი (დიფერენციალი / AWD)',
    title_en: 'Differential & Transfer Case Oil',
    shortDesc_ge: '4MATIC, AWD, xDrive, Quattro სისტემებისთვის (წინა/უკანა ხიდი & რაზდატკა)',
    defaultIntervalKm: 60000,
    defaultCostGel: 290,
    iconName: 'Droplets',
    recommendedBrands: ['Motul Gear 300 75W-90', 'Castrol Syntrax', 'Liqui Moly GL-5', 'Ravenol DGL'],
    specsExample: '75W-90 GL-5 სინთეტიკა • AWD სისტემა',
    defaultValues: {
      category: 'fluids',
      variant_key: 'differential_oil',
      variant_name_ge: 'დიფერენციალის ზეთი',
      title_ge: 'ხიდებისა და რაზდატკის ზეთი (Motul 75W-90 GL-5 AWD)',
      interval_km: 60000,
      cost_gel: 290,
      differential_system: '4matic_awd',
      differential_spec: '75W-90 GL-5'
    }
  },

  // ================= 3. ფილტრები და ჰაერის მიწოდება (Filters) =================
  {
    key: 'engine_air_filter',
    categoryId: 'filters',
    title_ge: 'ჰაერის ფილტრი (ძრავის)',
    title_en: 'Engine Air Filter',
    shortDesc_ge: 'გამტარობა და შეცვლის ინტერვალი (10,000–15,000 კმ)',
    defaultIntervalKm: 15000,
    defaultCostGel: 65,
    iconName: 'Filter',
    recommendedBrands: ['MANN-Filter', 'Mahle Original', 'Bosch', 'Filtron', 'K&N'],
    specsExample: 'MANN-Filter C27 • გამტარობა 100%',
    defaultValues: {
      category: 'filters',
      variant_key: 'engine_air_filter',
      variant_name_ge: 'ჰაერის ფილტრი',
      title_ge: 'ძრავის ჰაერის ფილტრი (MANN-Filter)',
      interval_km: 15000,
      cost_gel: 65,
      filter_air: true,
      filter_brand: 'MANN-Filter'
    }
  },
  {
    key: 'cabin_filter',
    categoryId: 'filters',
    title_ge: 'სალონის მიკროფილტრი',
    title_en: 'Cabin Microfilter (A/C)',
    shortDesc_ge: 'სეზონური შეცვლა (მტვრისა და აქტივირებული ნახშირის ანტიალერგიული ფილტრები)',
    defaultIntervalKm: 15000,
    defaultCostGel: 75,
    iconName: 'Filter',
    recommendedBrands: ['MANN FreciousPlus', 'Mahle CareMetix', 'Bosch Filter+'],
    specsExample: 'ნახშირის ანტიალერგიული ფილტრი',
    defaultValues: {
      category: 'filters',
      variant_key: 'cabin_filter',
      variant_name_ge: 'სალონის ფილტრი',
      title_ge: 'სალონის ნახშირის მიკროფილტრი (MANN FreciousPlus)',
      interval_km: 15000,
      cost_gel: 75,
      filter_cabin: true,
      filter_cabin_type: 'carbon',
      filter_brand: 'MANN-Filter'
    }
  },
  {
    key: 'fuel_filter',
    categoryId: 'filters',
    title_ge: 'საწვავის ფილტრი',
    title_en: 'Fuel Filter',
    shortDesc_ge: 'ძრავის ტიპის მიხედვით (ბენზინის მაგისტრალური / დიზელის წყალგამყოფით)',
    defaultIntervalKm: 40000,
    defaultCostGel: 140,
    iconName: 'Filter',
    recommendedBrands: ['Bosch', 'MANN-Filter', 'Mahle', 'Delphi', 'UFI'],
    specsExample: 'Bosch High Flow • წნევის რეგულატორით',
    defaultValues: {
      category: 'filters',
      variant_key: 'fuel_filter',
      variant_name_ge: 'საწვავის ფილტრი',
      title_ge: 'საწვავის ფილტრი (Bosch High Flow)',
      interval_km: 40000,
      cost_gel: 140,
      filter_fuel: true,
      filter_fuel_engine: 'petrol',
      filter_brand: 'Bosch'
    }
  },

  // ================= 4. ძრავი და აალების სისტემა (Engine & Ignition) =================
  {
    key: 'spark_plugs',
    categoryId: 'engine',
    title_ge: 'აალების სანთლები (სვეჩები)',
    title_en: 'Spark Plugs',
    shortDesc_ge: 'ჩვეულებრივი, პლატინა თუ ირიდიუმი (რესურსი 30,000–100,000 კმ)',
    defaultIntervalKm: 60000,
    defaultCostGel: 280,
    iconName: 'Zap',
    recommendedBrands: ['NGK Laser Iridium', 'Bosch Double Platinum', 'Denso Iridium TT', 'Champion'],
    specsExample: 'NGK Laser Iridium (6 ცალი)',
    defaultValues: {
      category: 'engine',
      variant_key: 'spark_plugs',
      variant_name_ge: 'აალების სანთლები',
      title_ge: 'აალების სანთლები - სვეჩები (NGK Laser Iridium)',
      interval_km: 60000,
      cost_gel: 280,
      spark_plug_type: 'iridium',
      spark_plug_count: 4,
      spark_plug_brand: 'NGK Laser Iridium'
    }
  },
  {
    key: 'ignition_coils',
    categoryId: 'engine',
    title_ge: 'აალების კოჭები (ბაბინები)',
    title_en: 'Ignition Coils',
    shortDesc_ge: 'მუშაობის სტატუსი, Misfire დიაგნოსტიკის ისტორია და შემოწმება',
    defaultIntervalKm: 80000,
    defaultCostGel: 360,
    iconName: 'Zap',
    recommendedBrands: ['Bosch', 'Delphi', 'NGK', 'Eldor OEM', 'Denso'],
    specsExample: 'Bosch OEM • 0 Misfire',
    defaultValues: {
      category: 'engine',
      variant_key: 'ignition_coils',
      variant_name_ge: 'აალების ბაბინები',
      title_ge: 'აალების კოჭები - ბაბინები (Bosch OEM შემოწმებული)',
      interval_km: 80000,
      cost_gel: 360,
      ignition_coils_status: 'ყველა ცილინდრის კოჭა უდეფექტოა (0 Misfire)'
    }
  },
  {
    key: 'timing_belt_chain',
    categoryId: 'engine',
    title_ge: 'ძრავის ღვედი / ცეპი (Timing Belt / Chain)',
    title_en: 'Timing Belt / Chain & Water Pump',
    shortDesc_ge: 'კრიტიკული რესურსის მთვლელი, დამჭიმები და წყლის ტუმბო (პომპა)',
    defaultIntervalKm: 90000,
    defaultCostGel: 850,
    iconName: 'Gauge',
    recommendedBrands: ['Continental ContiTech Kit', 'Gates PowerGrip', 'INA', 'SKF'],
    specsExample: 'ცეპის / ღვედის კომპლექტი + წყლის ტუმბო',
    defaultValues: {
      category: 'engine',
      variant_key: 'timing_belt_chain',
      variant_name_ge: 'ძრავის ღვედი/ცეპი',
      title_ge: 'ძრავის ღვედის კომპლექტი & წყლის ტუმბო (ContiTech Kit)',
      interval_km: 90000,
      cost_gel: 850,
      timing_type: 'belt',
      water_pump_replaced: true
    }
  },
  {
    key: 'serpentine_belt',
    categoryId: 'engine',
    title_ge: 'გენერატორის დამხმარე ღვედი და დამჭიმები',
    title_en: 'Serpentine Belt & Tensioners',
    shortDesc_ge: 'ცვეთის კონტროლი, დამჭიმი მექანიზმი და პარაზიტი როლიკები',
    defaultIntervalKm: 60000,
    defaultCostGel: 220,
    iconName: 'Gauge',
    recommendedBrands: ['Continental ContiTech', 'Gates Micro-V', 'INA', 'Dayco'],
    specsExample: 'დამხმარე ღვედი + როლიკები',
    defaultValues: {
      category: 'engine',
      variant_key: 'serpentine_belt',
      variant_name_ge: 'გენერატორის ღვედი',
      title_ge: 'გენერატორის დამხმარე ღვედი და როლიკები (Gates Micro-V)',
      interval_km: 60000,
      cost_gel: 220,
      serpentine_belt_parts: 'ღვედი + დამჭიმი + 2 პარაზიტი როლიკი'
    }
  },
  {
    key: 'throttle_cleaning',
    categoryId: 'engine',
    title_ge: 'დროსელის და კოლექტორის წმენდა',
    title_en: 'Throttle Body & Intake Cleaning',
    shortDesc_ge: 'პროფილაქტიკის ინტერვალი, ნადებისგან გაწმენდა და ელექტრონული ადაპტაცია',
    defaultIntervalKm: 35000,
    defaultCostGel: 120,
    iconName: 'Wrench',
    recommendedBrands: ['Liqui Moly Drosselklappen-Reiniger', 'Wynn\'s', 'CRC'],
    specsExample: 'დროსელი გაწმენდილია + კომპიუტერული ადაპტაცია',
    defaultValues: {
      category: 'engine',
      variant_key: 'throttle_cleaning',
      variant_name_ge: 'დროსელის წმენდა',
      title_ge: 'დროსელის ზასლონკისა და კოლექტორის წმენდა',
      interval_km: 35000,
      cost_gel: 120,
      throttle_adapted: true
    }
  },

  // ================= 5. ელექტროობა და კლიმატი (Electrical & AC) =================
  {
    key: 'battery',
    categoryId: 'electrical',
    title_ge: 'აკუმულატორი',
    title_en: 'Car Battery',
    shortDesc_ge: 'ტევადობა (Ah), დამზადების თარიღი, ძაბვა (V) და ექსპლუატაციის ვადა (3–4 წელი)',
    defaultIntervalKm: 60000,
    defaultIntervalDays: 1095, // 3 years
    defaultCostGel: 360,
    iconName: 'BatteryCharging',
    recommendedBrands: ['Varta Silver Dynamic AGM', 'Bosch S5', 'Banner Running Bull', 'Exide Premium'],
    specsExample: '80 Ah • 12.6V • AGM ტექნოლოგია',
    defaultValues: {
      category: 'electrical',
      variant_key: 'battery',
      variant_name_ge: 'აკუმულატორი',
      title_ge: 'აკუმულატორი (Varta Silver Dynamic AGM 80Ah)',
      interval_km: 60000,
      cost_gel: 360,
      battery_capacity_ah: 80,
      battery_voltage: 12.6,
      battery_mfg_date: '2025/11',
      battery_brand: 'Varta AGM'
    }
  },
  {
    key: 'ac_system',
    categoryId: 'electrical',
    title_ge: 'კონდიციონერის ფრეონი და კომპრესორის ზეთი',
    title_en: 'AC Freon & Compressor Oil',
    shortDesc_ge: 'სისტემის წნევა, ფრეონის დატუმბვა და გამართვა ზაფხულის სეზონისთვის',
    defaultIntervalKm: 40000,
    defaultIntervalDays: 730,
    defaultCostGel: 120,
    iconName: 'Wind',
    recommendedBrands: ['R134a DuPont', 'R1234yf Honeywell', 'PAG 46 Oil'],
    specsExample: '550 გრ ფრეონი R134a • წნევა ნორმაშია',
    defaultValues: {
      category: 'electrical',
      variant_key: 'ac_system',
      variant_name_ge: 'კონდიციონერი & ფრეონი',
      title_ge: 'კონდიციონერის ფრეონის დატენვა & კომპრესორის ზეთი',
      interval_km: 40000,
      cost_gel: 120,
      ac_freon_grams: 550,
      ac_freon_type: 'R134a',
      ac_compressor_oil_checked: true
    }
  },
  {
    key: 'alternator_starter',
    categoryId: 'electrical',
    title_ge: 'გენერატორი და სტარტერი',
    title_en: 'Alternator & Starter',
    shortDesc_ge: 'დიაგნოსტიკის ისტორია, დატენვის ძაბვა (14.2V), ნახშირები და რელე',
    defaultIntervalKm: 100000,
    defaultCostGel: 240,
    iconName: 'Zap',
    recommendedBrands: ['Bosch', 'Valeo', 'Denso', 'Delco Remy'],
    specsExample: '14.2V დატენვა • სტარტერის ტესტი OK',
    defaultValues: {
      category: 'electrical',
      variant_key: 'alternator_starter',
      variant_name_ge: 'გენერატორი/სტარტერი',
      title_ge: 'გენერატორისა და სტარტერის დიაგნოსტიკა (14.2V)',
      interval_km: 100000,
      cost_gel: 240,
      alternator_voltage_output: 14.2
    }
  },

  // ================= 6. იურიდიული, სავალდებულო და სადაზღვევო ვადები (Legal) =================
  {
    key: 'pti',
    categoryId: 'legal',
    title_ge: 'პერიოდული ტექ-ინსპექტირება (PTI Georgia)',
    title_en: 'Periodic Technical Inspection (PTI)',
    shortDesc_ge: 'თარიღი და შეხსენების ტაიმერი (საქართველოში 1 წელი / 365 დღე)',
    defaultIntervalKm: 30000,
    defaultIntervalDays: 365,
    defaultCostGel: 60,
    iconName: 'FileCheck',
    recommendedBrands: ['Greenway Georgia', 'AutoTest დიღომი', 'PTI Tbilisi'],
    specsExample: 'Greenway დიღომი • 🇬🇪 ვადა: 1 წელი',
    defaultValues: {
      category: 'legal',
      variant_key: 'pti',
      variant_name_ge: 'ტექ-დათვალიერება PTI',
      title_ge: 'პერიოდული ტექ-დათვალიერება (PTI Georgia)',
      interval_km: 30000,
      cost_gel: 60,
      pti_reminder_enabled: true,
      pti_reminder_days: 30,
      pti_center: 'თბილისი, Greenway დიღომი',
      pti_cert_number: 'PTI-GE-98432',
      pti_status: 'passed'
    }
  },
  {
    key: 'insurance',
    categoryId: 'legal',
    title_ge: 'სავალდებულო / კასკო დაზღვევა',
    title_en: 'Auto Insurance (CASCO / MTPL)',
    shortDesc_ge: 'პოლისის მოქმედების ვადა და კომპანია (ალდაგი, TBC, GPI, არდი, ირაო)',
    defaultIntervalKm: 25000,
    defaultIntervalDays: 365,
    defaultCostGel: 1250,
    iconName: 'ShieldCheck',
    recommendedBrands: ['ალდაგი (Aldagi)', 'TBC დაზღვევა', 'GPI Holding', 'არდი (Ardi)', 'ირაო (Irao)'],
    specsExample: 'ალდაგი (კასკო სრული) • POL-2026-9812',
    defaultValues: {
      category: 'legal',
      variant_key: 'insurance',
      variant_name_ge: 'ავტოდაზღვევა',
      title_ge: 'ავტომობილის კასკო დაზღვევა (ალდაგი)',
      interval_km: 25000,
      cost_gel: 1250,
      insurance_company: 'ალდაგი (Aldagi)',
      insurance_type: 'casco',
      insurance_policy_number: 'POL-2026-9812'
    }
  },
  {
    key: 'parking_permit',
    categoryId: 'legal',
    title_ge: 'პარკირების საშვი (თბილისის პარკირება)',
    title_en: 'Tbilisi Parking Permit',
    shortDesc_ge: 'თბილისის ზონალურ-საათობრივი ან წლიური აბონემენტის ვადა (ზონა A/B/C)',
    defaultIntervalKm: 20000,
    defaultIntervalDays: 365,
    defaultCostGel: 50,
    iconName: 'FileCheck',
    recommendedBrands: ['თბილისის პარკინგი', 'ზონა A (ვაკე/საბურთალო)', 'ზონა B (ჩუღურეთი)', 'წლიური 50₾'],
    specsExample: 'ზონალურ-საათობრივი საშვი • 1 წელი',
    defaultValues: {
      category: 'legal',
      variant_key: 'parking_permit',
      variant_name_ge: 'პარკირების საშვი',
      title_ge: 'თბილისის ზონალური პარკირების წლიური საშვი',
      interval_km: 20000,
      cost_gel: 50,
      parking_permit_zone: 'თბილისის წლიური საშვი (ზონა A/B)'
    }
  },
  {
    key: 'driving_license',
    categoryId: 'legal',
    title_ge: 'მართვის მოწმობის ვადა',
    title_en: 'Driver\'s License Renewal',
    shortDesc_ge: 'მძღოლის დოკუმენტის განახლების თარიღი, კატეგორიები (B, B1)',
    defaultIntervalKm: 150000,
    defaultIntervalDays: 3650, // 10 years
    defaultCostGel: 50,
    iconName: 'FileCheck',
    recommendedBrands: ['შსს მომსახურების სააგენტო'],
    specsExample: 'კატეგორია B, B1 • 10-წლიანი ვადა',
    defaultValues: {
      category: 'legal',
      variant_key: 'driving_license',
      variant_name_ge: 'მართვის მოწმობა',
      title_ge: 'მართვის მოწმობის განახლების ვადა',
      interval_km: 150000,
      cost_gel: 50,
      license_categories: 'B, B1'
    }
  }
];

/**
 * Normalizes legacy or mixed category keys to the canonical 6 categories
 */
export function normalizeCategory(cat: ServiceCategory | string): ServiceCategory {
  switch (cat) {
    case 'oil':
      return 'fluids';
    case 'tires':
    case 'brakes':
      return 'chassis';
    case 'filter':
      return 'filters';
    case 'pti':
      return 'legal';
    case 'chassis':
    case 'fluids':
    case 'filters':
    case 'engine':
    case 'electrical':
    case 'legal':
      return cat as ServiceCategory;
    default:
      return 'chassis';
  }
}

export function getCategoryDefinition(cat: ServiceCategory | string): CategoryDefinition {
  const normalized = normalizeCategory(cat);
  const found = SERVICE_CATEGORIES.find(c => c.id === normalized);
  return found || SERVICE_CATEGORIES[0];
}

export function getVariantDefinition(key?: ServiceVariantKey | string): VariantDefinition | undefined {
  if (!key) return undefined;
  return SERVICE_VARIANTS.find(v => v.key === key);
}

export function getVariantsByCategory(cat: ServiceCategory | string): VariantDefinition[] {
  const normalized = normalizeCategory(cat);
  return SERVICE_VARIANTS.filter(v => v.categoryId === normalized);
}
