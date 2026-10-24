import { ServiceItem, VehicleProfile } from '../types';
import { decodeVin } from './vinServiceEngine';

export interface ServiceTierOption {
  id: 'budget' | 'optimal' | 'premium';
  name_ge: string;
  name_en: string;
  tagline_ge: string;
  badge: string;
  badgeColor: string;
  price_gel: number;
  parts_brand: string;
  warranty: string;
  duration: string;
  features: string[];
  recommended?: boolean;
}

export interface ServiceProviderOption {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  location_badge: string;
  perks: string[];
  discount_badge?: string;
  available_today: boolean;
}

export interface ServiceComparisonResult {
  serviceId: string;
  serviceTitle: string;
  vehicleDesc: string;
  vin: string;
  urgency: 'critical' | 'warning' | 'normal';
  urgency_reason: string;
  tiers: ServiceTierOption[];
  providers: ServiceProviderOption[];
}

export const GEORGIAN_SERVICE_PROVIDERS: ServiceProviderOption[] = [
  {
    id: 'tegeta_motors',
    name: 'თეგეტა მოტორსი (ცენტრალური ფილიალი)',
    address: 'დ. აღმაშენებლის ხეივანი მე-12 კმ, თბილისი',
    phone: '032 2 26 44 44',
    rating: 4.8,
    reviewsCount: 1420,
    location_badge: 'დიღომი • 24 ბოქსი',
    perks: ['12 თვე გარანტია', 'უფასო შეცვლა ზეთის შეძენისას', 'კომფორტული მოსაცდელი'],
    discount_badge: 'Tegeta Card -10%',
    available_today: true
  },
  {
    id: 'amboli',
    name: 'ამბოლი (საბურთალოს ცენტრი)',
    address: 'ვაჟა-ფშაველას გამზ. #71, თბილისი',
    phone: '032 2 15 40 40',
    rating: 4.7,
    reviewsCount: 890,
    location_badge: 'საბურთალო • სწრაფი სერვისი',
    perks: ['სწრაფი ექსპრეს-ბოქსები', 'Brembo & Motul ოფიციალური დილერი', 'უფასო დიაგნოსტიკა'],
    discount_badge: 'Amboli Club -15%',
    available_today: true
  },
  {
    id: 'autohub_mobile_doc',
    name: 'AutoHub VIP მობილური ექიმი (ადგილზე მოსვლით)',
    address: 'ადგილზე მომსახურება თბილისის მასშტაბით (სახლთან/ოფისთან)',
    phone: '+995 599 00 11 22',
    rating: 5.0,
    reviewsCount: 310,
    location_badge: 'გამოძახებით • VIP 1 საათში',
    perks: ['არ გჭირდებათ სერვისცენტრში მისვლა', 'სრული ტექ-აღჭურვილობა ბორტზე', 'ვიდეო-ფიქსაცია'],
    discount_badge: 'უფასო გამოძახება',
    available_today: true
  },
  {
    id: 'greenway_pti',
    name: 'Greenway Georgia (ტექ-დათვალიერება PTI)',
    address: 'დიღმის მასივი, რობაქიძის გამზ. #7 (და 20+ ფილიალი)',
    phone: '032 2 99 77 77',
    rating: 4.9,
    reviewsCount: 2200,
    location_badge: 'აკრედიტებული PTI ლაბორატორია',
    perks: ['ოფიციალური სახელმწიფო სერტიფიკატი', 'რიგის გარეშე ჯავშანი', 'SMS შეხსენება'],
    discount_badge: 'ოფიციალური 60 ₾',
    available_today: true
  },
  {
    id: 'autoexpert_vashlijvari',
    name: 'ავტოექსპერტი (ვაშლიჯვრის ცენტრი)',
    address: 'გოძიაშვილის ქ. #23, თბილისი',
    phone: '032 2 55 11 22',
    rating: 4.8,
    reviewsCount: 540,
    location_badge: 'ვაშლიჯვარი • გერმანული/იაპონური ძრავები',
    perks: ['ZF & Aisin კოლოფების სპეციალიზაცია', 'კომპიუტერული სტენდი', 'სათადარიგო ნაწილების საწყობი'],
    discount_badge: '-10% სრულ პაკეტზე',
    available_today: true
  }
];

/**
 * Calculates tailored comparison tiers based on the specific vehicle and service need
 */
export function getComparisonForService(
  service: ServiceItem,
  vehicle: VehicleProfile
): ServiceComparisonResult {
  const decoded = decodeVin(vehicle.vin, vehicle);
  const health = service.health_percentage ?? 50;

  const urgency: 'critical' | 'warning' | 'normal' =
    health <= 20 ? 'critical' : health <= 45 ? 'warning' : 'normal';

  const urgency_reason =
    health <= 20
      ? `რესურსი კრიტიკულია (${health}%). რეკომენდებულია დაუყოვნებლივი შეცვლა უსაფრთხოებისა და ძრავის დაზიანების თავიდან ასაცილებლად.`
      : health <= 45
      ? `რესურსი იწურება (${health}%). დარჩა ~${service.remaining_km.toLocaleString()} კმ. შეარჩიეთ საუკეთესო ვარიანტი წინასწარ.`
      : `რეგლამენტი ნორმაშია (${health}%). შეგიძლიათ გაეცნოთ მომავალი სერვისის შეთავაზებებსა და ფასებს.`;

  const vKey = service.variant_key || '';
  const titleLower = service.title_ge.toLowerCase();

  // 1. ENGINE OIL (ძრავის ზეთი)
  if (vKey === 'engine_oil' || titleLower.includes('ზეთ')) {
    const liters = decoded.factory_specs.oil_capacity_liters || 5.0;
    const spec = decoded.factory_specs.oil_spec;
    const visc = decoded.factory_specs.oil_viscosity;

    const basePrice = Math.round(liters * 38 + 50);

    return {
      serviceId: service.id,
      serviceTitle: `ძრავის ზეთის & ფილტრის შეცვლა (${liters} ლ • ${visc})`,
      vehicleDesc: `${decoded.brand} ${decoded.model} (${decoded.year}) • ${decoded.engine_desc}`,
      vin: decoded.vin,
      urgency,
      urgency_reason,
      tiers: [
        {
          id: 'budget',
          name_ge: 'ეკონომიური (Standard)',
          name_en: 'Budget',
          tagline_ge: 'სანდო ხარისხი საუკეთესო საბაზრო ფასად',
          badge: 'ხელმისაწვდომი',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          price_gel: Math.round(basePrice * 0.72),
          parts_brand: `Mannol / Febi Full Synthetic (${visc}) + Bosch ფილტრი`,
          warranty: '6 თვე / 5,000 კმ',
          duration: '30 წუთი',
          features: [
            `${liters} ლ სინთეტიკური ზეთი (${visc})`,
            'ზეთის ფილტრის შეცვლა',
            'ძრავის ვიზუალური დათვალიერება',
            'სტანდარტული გარანტია 6 თვე'
          ]
        },
        {
          id: 'optimal',
          name_ge: 'ოპტიმალური (Best Value)',
          name_en: 'Optimal',
          tagline_ge: '100% ქარხნული დაშვება & წამყვანი ევროპული ბრენდი',
          badge: '★ რეკომენდებული',
          badgeColor: 'bg-gold text-navy font-bold border-gold shadow-sm',
          price_gel: basePrice,
          parts_brand: `Motul 8100 X-cess (${spec}) + Mann-Filter OEM`,
          warranty: '1 წელი / 10,000 კმ',
          duration: '40 წუთი',
          recommended: true,
          features: [
            `${liters} ლ Motul პრემიუმ სინთეტიკა (${spec})`,
            'გერმანული Mann-Filter ორიგინალი ფილტრი',
            'სერვის-ინტერვალის კომპიუტერული განულება (Reset)',
            'სითხეების (ანტიფრიზი, ტორმუზი) უფასო შემოწმება',
            '1-წლიანი სრული გარანტია'
          ]
        },
        {
          id: 'premium',
          name_ge: 'პრემიუმ დილერი (Dealer OEM)',
          name_en: 'Premium OEM',
          tagline_ge: 'ოფიციალური დილერის ორიგინალი ნაწილები & სრული სერვისი',
          badge: 'OEM დილერი',
          badgeColor: 'bg-navy text-gold border-navy font-bold',
          price_gel: Math.round(basePrice * 1.55),
          parts_brand: `${decoded.brand} Genuine OEM Oil (${spec}) + OEM Filter`,
          warranty: '2 წელი / 15,000 კმ',
          duration: '60 წუთი',
          features: [
            `ორიგინალი ${decoded.brand} Genuine OEM ზეთი`,
            `ორიგინალი ${decoded.brand} ქარხნული ფილტრი`,
            '30-წერტილიანი სრული ელექტრონული დიაგნოსტიკა',
            'ციფრული სერვის-წიგნაკის ოფიციალური დამოწმება',
            'უფასო გამოძახება AutoHub VIP მობილური ექიმით'
          ]
        }
      ],
      providers: GEORGIAN_SERVICE_PROVIDERS.filter(p => p.id !== 'greenway_pti')
    };
  }

  // 2. BRAKES (სამუხრუჭე ხუნდები & დისკები)
  if (vKey === 'brake_pads' || vKey === 'brake_discs' || titleLower.includes('ხუნდ') || titleLower.includes('მუხრუჭ')) {
    const isPerformance = decoded.brand === 'BMW' || decoded.brand === 'Porsche';
    const basePrice = isPerformance ? 260 : 190;

    return {
      serviceId: service.id,
      serviceTitle: `სამუხრუჭე ხუნდების შეცვლა (${decoded.factory_specs.brake_spec})`,
      vehicleDesc: `${decoded.brand} ${decoded.model} • სამუხრუჭე სისტემის რეგლამენტი`,
      vin: decoded.vin,
      urgency,
      urgency_reason,
      tiers: [
        {
          id: 'budget',
          name_ge: 'ეკონომიური (Standard)',
          name_en: 'Budget',
          tagline_ge: 'უსაფრთხო სამუხრუჭე ხუნდები ეკონომ ფასად',
          badge: 'ეკონომია',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          price_gel: Math.round(basePrice * 0.68),
          parts_brand: 'Ferodo / LPR Semi-Metallic',
          warranty: '6 თვე / 10,000 კმ',
          duration: '40 წუთი',
          features: [
            'წინა ან უკანა ღერძის ხუნდები',
            'სუპორტების გაწმენდა მტვრისგან',
            'სამუხრუჭე დისკების ვიზუალური შემოწმება'
          ]
        },
        {
          id: 'optimal',
          name_ge: 'ოპტიმალური (Brembo Ceramic)',
          name_en: 'Optimal',
          tagline_ge: 'Brembo კერამიკული ხუნდები — არ ჭრაჭუნებს, არ აშავებს დისკებს',
          badge: '★ რეკომენდებული',
          badgeColor: 'bg-gold text-navy font-bold border-gold shadow-sm',
          price_gel: basePrice,
          parts_brand: 'Brembo Ceramic + ელექტრონული სენსორი',
          warranty: '1 წელი / 20,000 კმ',
          duration: '50 წუთი',
          recommended: true,
          features: [
            'Brembo კერამიკული ხუნდების კომპლექტი',
            'ახალი ელექტრონული ცვეთის სენსორი',
            'სუპორტის მიმმართველების მაღალტემპერატურული შეზეთვა',
            'სამუხრუჭე სითხის დუღილის ტემპერატურის ტესტი',
            'გარანტია ჭრაჭუნსა და ვიბრაციაზე'
          ]
        },
        {
          id: 'premium',
          name_ge: 'პრემიუმ OEM (Performance)',
          name_en: 'Premium OEM',
          tagline_ge: 'მაქსიმალური სამუხრუჭე ძალა & ორიგინალი დილერის ხუნდები',
          badge: 'M-Sport / AMG Grade',
          badgeColor: 'bg-navy text-gold border-navy font-bold',
          price_gel: Math.round(basePrice * 1.65),
          parts_brand: `${decoded.brand} Original OEM Performance Pads`,
          warranty: '2 წელი / 30,000 კმ',
          duration: '70 წუთი',
          features: [
            `ორიგინალი ${decoded.brand} ქარხნული ხუნდები`,
            'სამუხრუჭე დისკების ლაზერული გეომეტრიის შემოწმება',
            'სამუხრუჭე სისტემის კომპიუტერული ადაპტაცია (OBD-II)',
            '2-წლიანი სრული გარანტია'
          ]
        }
      ],
      providers: GEORGIAN_SERVICE_PROVIDERS.filter(p => p.id !== 'greenway_pti')
    };
  }

  // 3. TRANSMISSION FLUID (გადაცემათა კოლოფი)
  if (vKey === 'transmission_fluid' || titleLower.includes('კოლოფ') || titleLower.includes('atf') || titleLower.includes('dct')) {
    const isDctOrZf = decoded.factory_specs.transmission_type === '7g_dct' || decoded.factory_specs.transmission_type === 'zf8hp';
    const basePrice = isDctOrZf ? 580 : 380;

    return {
      serviceId: service.id,
      serviceTitle: `გადაცემათა კოლოფის ზეთი & ფილტრი (${decoded.factory_specs.transmission_fluid})`,
      vehicleDesc: `${decoded.brand} ${decoded.model} • ${decoded.transmission_desc}`,
      vin: decoded.vin,
      urgency,
      urgency_reason,
      tiers: [
        {
          id: 'budget',
          name_ge: 'ნაწილობრივი შეცვლა (Partial Refresh)',
          name_en: 'Budget',
          tagline_ge: 'ზეთის ნაწილობრივი განახლება კარტერიდან დაღვრით',
          badge: 'ნაწილობრივი',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          price_gel: Math.round(basePrice * 0.65),
          parts_brand: 'Mannol / Febi ATF Synthetic (4-5 ლ)',
          warranty: '6 თვე / 15,000 კმ',
          duration: '1 საათი',
          features: [
            '4-5 ლიტრი ზეთის განახლება',
            'კარტერის მაგნიტების გაწმენდა',
            'დონის შემოწმება სამუშაო ტემპერატურაზე'
          ]
        },
        {
          id: 'optimal',
          name_ge: 'სრული აპარატული შეცვლა (Recommended)',
          name_en: 'Optimal',
          tagline_ge: 'სრული აპარატული ჩარეცხვა 100% ახალი ზეთით + ახალი ფილტრი',
          badge: '★ რეკომენდებული',
          badgeColor: 'bg-gold text-navy font-bold border-gold shadow-sm',
          price_gel: basePrice,
          parts_brand: `${decoded.factory_specs.transmission_fluid} + OEM პადდონი`,
          warranty: '1 წელი / 40,000 კმ',
          duration: '2 საათი',
          recommended: true,
          features: [
            'სრული 100%-იანი აპარატული გამორეცხვა (Flushing)',
            'ახალი ორიგინალი პადდონი ინტეგრირებული ფილტრით',
            'ჰიდროტრანსფორმატორის სრული სითხის განახლება',
            'ტემპერატურული კალიბრაცია და ადაპტაცია',
            '1-წლიანი სრული გარანტია'
          ]
        },
        {
          id: 'premium',
          name_ge: 'პრემიუმ დილერი + ადაპტაცია',
          name_en: 'Premium OEM',
          tagline_ge: 'ოფიციალური დილერის ორიგინალი სითხე და TCM კომპიუტერული რე-ადაპტაცია',
          badge: 'Dealer OEM',
          badgeColor: 'bg-navy text-gold border-navy font-bold',
          price_gel: Math.round(basePrice * 1.45),
          parts_brand: `${decoded.brand} Genuine Transmission Fluid + OEM Pan Kit`,
          warranty: '2 წელი / 60,000 კმ',
          duration: '2.5 საათი',
          features: [
            `ოფიციალური ${decoded.brand} ქარხნული სითხე`,
            'გადაცემათა კოლოფის კომპიუტერული დიაგნოსტიკა (Clutch wear test)',
            'სრული ადაპტაცია საგზაო ტესტით',
            '2-წლიანი გარანტია'
          ]
        }
      ],
      providers: GEORGIAN_SERVICE_PROVIDERS.filter(p => p.id === 'tegeta_motors' || p.id === 'autoexpert_vashlijvari' || p.id === 'autohub_mobile_doc')
    };
  }

  // 4. PTI INSPECTION (ტექ-ინსპექტირება)
  if (vKey === 'pti' || titleLower.includes('ტექ') || titleLower.includes('pti')) {
    return {
      serviceId: service.id,
      serviceTitle: 'სავალდებულო პერიოდული ტექ-ინსპექტირება (PTI Georgia)',
      vehicleDesc: `${decoded.brand} ${decoded.model} • წლიური სავალდებულო შემოწმება`,
      vin: decoded.vin,
      urgency,
      urgency_reason,
      tiers: [
        {
          id: 'budget',
          name_ge: 'სტანდარტული PTI (რიგით)',
          name_en: 'Standard PTI',
          tagline_ge: 'ოფიციალური სახელმწიფო ტექინსპექტირება ცენტრში',
          badge: 'სახელმწიფო ტარიფი',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
          price_gel: 60,
          parts_brand: 'Greenway Georgia სახელმწიფო ხაზი',
          warranty: '1 წელი ოფიციალური ვადა',
          duration: '35 წუთი',
          features: [
            'გამონაბოლქვის (CO/CH) ტესტირება',
            'სამუხრუჭე სტენდის შემოწმება',
            'სავალი ნაწილის ლაზერული დეტექცია',
            'შუქურების (ფარების) სიმაღლის რეგულირება'
          ]
        },
        {
          id: 'optimal',
          name_ge: 'Greenway VIP (რიგის გარეშე ჯავშანი)',
          name_en: 'VIP Express',
          tagline_ge: 'დაჯავშნილი ზუსტი დროით რიგის გარეშე + SMS შეხსენება',
          badge: '★ რეკომენდებული',
          badgeColor: 'bg-gold text-navy font-bold border-gold shadow-sm',
          price_gel: 60,
          parts_brand: 'Greenway VIP დაჯავშნილი ბოქსი',
          warranty: '1 წელი ოფიციალური ვადა',
          duration: '15 წუთი',
          recommended: true,
          features: [
            'რიგის გარეშე პირდაპირი შესვლა ბოქსში',
            'ოფიციალური სახელმწიფო სერტიფიკატი',
            'ციფრული ანგარიშის ბაზაში ატვირთვა',
            'AutoHub-ის წლიური ავტო-შეხსენება'
          ]
        },
        {
          id: 'premium',
          name_ge: 'PTI + წინასწარი პრე-ტესტი (Pre-Check)',
          name_en: 'Pre-Check VIP',
          tagline_ge: 'წინასწარი შემოწმება და ხარვეზების აღმოფხვრა ხაზზე გასვლამდე',
          badge: '100% გარანტირებული ჩაბარება',
          badgeColor: 'bg-navy text-gold border-navy font-bold',
          price_gel: 95,
          parts_brand: 'Greenway VIP + AutoHub ექიმის წინასწარი ტესტი',
          warranty: 'გარანტირებული ჩაბარება',
          duration: '45 წუთი',
          features: [
            'წინასწარი გამონაბოლქვის და მუხრუჭების ტესტი',
            'ფარების ნათების კორექცია ადგილზე',
            'ჩაუბარებლობის რისკის 0%-მდე შემცირება',
            'ოფიციალური PTI სერტიფიკატი 1 წლით'
          ]
        }
      ],
      providers: GEORGIAN_SERVICE_PROVIDERS.filter(p => p.id === 'greenway_pti' || p.id === 'tegeta_motors')
    };
  }

  // 5. GENERIC / OTHER SERVICES (Coolant, Spark Plugs, Battery, Filters)
  const basePrice = service.cost_gel || 180;

  return {
    serviceId: service.id,
    serviceTitle: service.title_ge,
    vehicleDesc: `${decoded.brand} ${decoded.model} (${decoded.year})`,
    vin: decoded.vin,
    urgency,
    urgency_reason,
    tiers: [
      {
        id: 'budget',
        name_ge: 'ეკონომიური (Standard)',
        name_en: 'Budget',
        tagline_ge: 'სანდო ხარისხის კომპონენტები ხელმისაწვდომ ფასად',
        badge: 'საბაზრო ფასი',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
        price_gel: Math.round(basePrice * 0.75),
        parts_brand: 'სერტიფიცირებული ევროპული ბრენდი',
        warranty: '6 თვე / 10,000 კმ',
        duration: '40 წუთი',
        features: [
          'სერტიფიცირებული ნაწილები',
          'კვალიფიციური ხელოსნის მომსახურება',
          'სტანდარტული გარანტია'
        ]
      },
      {
        id: 'optimal',
        name_ge: 'ოპტიმალური (Recommended)',
        name_en: 'Optimal',
        tagline_ge: 'პრემიუმ OEM ბრენდები 1-წლიანი სრული გარანტიით',
        badge: '★ რეკომენდებული',
        badgeColor: 'bg-gold text-navy font-bold border-gold shadow-sm',
        price_gel: basePrice,
        parts_brand: 'OEM პრემიუმ მწარმოებელი (Bosch / Mann / NGK)',
        warranty: '1 წელი / 20,000 კმ',
        duration: '50 წუთი',
        recommended: true,
        features: [
          'OEM დონის ორიგინალი კომპონენტები',
          'კომპიუტერული ტესტირება და ადაპტაცია',
          '1-წლიანი სრული გარანტია',
          'უფასო ტექნიკური შემოწმება'
        ]
      },
      {
        id: 'premium',
        name_ge: 'პრემიუმ დილერი (Dealer Grade)',
        name_en: 'Premium OEM',
        tagline_ge: 'ოფიციალური დილერის ორიგინალი ნაწილები & გარანტია',
        badge: 'ორიგინალი OEM',
        badgeColor: 'bg-navy text-gold border-navy font-bold',
        price_gel: Math.round(basePrice * 1.5),
        parts_brand: `${decoded.brand} Genuine OEM Parts`,
        warranty: '2 წელი / 40,000 კმ',
        duration: '1 საათი',
        features: [
          `ოფიციალური ${decoded.brand} ქარხნული ნაწილები`,
          'სრული ელექტრონული დიაგნოსტიკა',
          '2-წლიანი ოფიციალური გარანტია',
          'უფასო გამოძახება AutoHub VIP მობილური ექიმით'
        ]
      }
    ],
    providers: GEORGIAN_SERVICE_PROVIDERS.filter(p => p.id !== 'greenway_pti')
  };
}
