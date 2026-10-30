import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sounds } from '../../services/soundEffects';
import { TabType } from '../Navigation';
import {
  Bot,
  Zap,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Compass,
  Car,
  Layers,
  Activity,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  Move,
  Cpu,
  FileText,
  ParkingSquare,
  Navigation as NavigationIcon,
  Wrench,
  GraduationCap,
  Award,
  Trash2,
  Construction,
  ShieldCheck,
  MapPin,
  Calendar,
  MessageSquare,
  CreditCard
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  requiredTab?: TabType;
  placement?: 'bottom' | 'top' | 'center-bottom' | 'bottom-right' | 'top-right' | 'left-bottom' | 'left' | 'auto';
}

export interface TabMeta {
  id: TabType;
  name_ge: string;
  icon: string;
  summary: string;
}

export const TAB_TOUR_METADATA: Record<TabType, TabMeta> = {
  home: {
    id: 'home',
    name_ge: 'მთავარი გვერდი',
    icon: '🏠',
    summary: 'თქვენ გაეცანით AutoHub-ის მთავარი გვერდის ყველა ძირითად სერვისსა და შესაძლებლობას.'
  },
  obd: {
    id: 'obd',
    name_ge: 'OBD-II დიაგნოსტიკა',
    icon: '⚡',
    summary: 'თქვენ გაეცანით 3D ინტერაქტიულ დიაგნოსტიკას, Check Engine-ის ჩაქრობას, DTC კოდებსა და ცოცხალ ტელემეტრიას.'
  },
  fines: {
    id: 'fines',
    name_ge: 'საპატრულო ჯარიმები & მართვის მოწმობა',
    icon: '🛡️',
    summary: 'თქვენ გაეცანით საპატრულო ჯარიმების 20%-იან ფასდაკლებას, 100-ქულიან ციფრულ პასპორტსა და საგამოცდო ბილეთებს.'
  },
  parking: {
    id: 'parking',
    name_ge: 'მუნიციპალური პარკინგი',
    icon: '🅿️',
    summary: 'თქვენ გაეცანით მუნიციპალური პარკირების ზონების რუკას (A, B, C), ქალაქების არჩევასა და ცოცხალ ტაიმერს.'
  },
  map: {
    id: 'map',
    name_ge: 'ცოცხალი საგზაო რუკა & რადარები',
    icon: '🗺️',
    summary: 'თქვენ გაეცანით ცოცხალ საგზაო რუკას, საცობების 12 Live წერტილს, ალტერნატიულ მოკლე გზებსა და რადარებს.'
  },
  service: {
    id: 'service',
    name_ge: 'სერვის-წიგნაკი & OEM კატალოგი',
    icon: '🔧',
    summary: 'თქვენ გაეცანით ციფრულ სერვის-წიგნაკს, რესურსების კალკულატორსა და PTI ტექ-დათვალიერების მართვას.'
  },
  exam: {
    id: 'exam',
    name_ge: 'მართვის მოწმობის ბილეთები 2026',
    icon: '🎓',
    summary: 'თქვენ გაეცანით მართვის მოწმობის 2026 წლის ოფიციალურ ბილეთებს, აკადემიურ რანგებსა და რეალურ სიმულატორს.'
  },
  ai: {
    id: 'ai',
    name_ge: 'AI მექანიკოსი 24/7',
    icon: '🤖',
    summary: 'თქვენ გაეცანით AI მექანიკოსთან კონსულტაციას, ხმოვან ასისტენტსა და მზა შეკითხვებს.'
  },
  garage: {
    id: 'garage',
    name_ge: 'ჩემი გარაჟი',
    icon: '🚗',
    summary: 'თქვენ გაეცანით ავტოპარკის მართვასა და ავტომობილის დეტალურ პროფილს.'
  },
  settings: {
    id: 'settings',
    name_ge: 'პარამეტრები',
    icon: '⚙️',
    summary: 'თქვენ გაეცანით სისტემურ პარამეტრებსა და კონფიგურაციას.'
  }
};

export const PAGE_TOUR_STEPS: Record<TabType, TourStep[]> = {
  // 1. HOME DASHBOARD TOUR (7 STEPS)
  home: [
    {
      id: 'vehicle-profile',
      targetSelector: '[data-tour="header-vehicle"]',
      title: 'ავტომობილის პროფილი & გარაჟი',
      subtitle: 'GARAGE & VEHICLE SWITCHER',
      badge: '1 / 7',
      description: 'აქ ჩანს თქვენი არჩეული ავტომობილი. დაწკაპუნებით შეგიძლიათ გადართოთ მანქანები, შეცვალოთ სახელმწიფო ნომერი, გარბენი ან დაამატოთ ახალი ავტომობილი გარაჟში.',
      icon: Car,
      requiredTab: 'home',
      placement: 'bottom'
    },
    {
      id: 'navigation-menu',
      targetSelector: '[data-tour="navigation-menu"]',
      title: 'ნავიგაციის მენიუ & განყოფილებები',
      subtitle: 'MAIN NAVIGATION BAR',
      badge: '2 / 7',
      description: 'მთავარი მენიუს ღილაკებით მყისიერად გადადიხართ ნებისმიერ განყოფილებაზე: მთავარი, OBD დიაგნოსტიკა, საპატრულო ჯარიმები, პარკინგი, სერვის-დღიური, რადარების რუკა და მეტი.',
      icon: Compass,
      requiredTab: 'home',
      placement: 'bottom'
    },
    {
      id: 'cover-banner',
      targetSelector: '[data-tour="cover-banner"]',
      title: 'ციფრული სერვისების ქავერ-ბანერი',
      subtitle: '7 DIGITAL SERVICES & GLAMOUR COVERS',
      badge: '3 / 7',
      description: 'AutoHub-ის 7 ძირითადი ციფრული სერვისი თემატური ავტო-ფოტოებითა და ცოცხალი ვიჯეტებით. ზედა ღილაკებით შეგიძლიათ სწრაფად გადართოთ სერვისები და გახსნათ შესაბამისი მოდული.',
      icon: Layers,
      requiredTab: 'home',
      placement: 'bottom-right'
    },
    {
      id: 'orbit-carousel',
      targetSelector: '[data-tour="orbit-carousel"]',
      title: 'სერვისების ორბიტალური მართვა',
      subtitle: 'INTERACTIVE ORBIT TRACK',
      badge: '4 / 7',
      description: 'დაატრიალეთ სერვისების მოცულობითი ბურთები, ცენტრალურ ფანჯარაში იხილეთ სტატუსი და გადადით შესაბამის მოდულში ღილაკით "გადასვლა".',
      icon: Sparkles,
      requiredTab: 'home',
      placement: 'bottom-right'
    },
    {
      id: 'department-cards',
      targetSelector: '[data-tour="department-cards"]',
      title: 'განყოფილებების ბარათები & სტატუსი',
      subtitle: 'DEPARTMENT HUBS & SHORTCUTS',
      badge: '5 / 7',
      description: 'თქვენი ავტომობილის ცოცხალი მონაცემები: Check Engine შეცდომების რაოდენობა, გადასახდელი საპატრულო ჯარიმები 20%-იანი ფასდაკლებით და ძრავის ზეთის დარჩენილი რესურსი.',
      icon: ShieldAlert,
      requiredTab: 'home',
      placement: 'bottom-right'
    },
    {
      id: 'obd-status',
      targetSelector: '[data-tour="obd-status"]',
      title: 'OBD-II ადაპტერის დაკავშირება',
      subtitle: 'BLUETOOTH / WI-FI SCANNER',
      badge: '6 / 7',
      description: 'ამ ღილაკით აკავშირებთ Bluetooth ან Wi-Fi ELM327 ადაპტერს. ჩართვისას ინდიკატორი მწვანედ აინთება და პირდაპირ ამოიკითხავს შეცდომებს.',
      icon: Activity,
      requiredTab: 'home',
      placement: 'bottom-right'
    },
    {
      id: 'ai-floating-widget',
      targetSelector: '[data-tour="ai-floating-widget"]',
      title: 'AI მექანიკოსი & ასისტენტი 24/7',
      subtitle: '24/7 SMART AUTO ASSISTANT',
      badge: '7 / 7',
      description: 'თქვენი პერსონალური ხელოვნური ინტელექტი: დააჭირეთ ქვედა მარჯვენა ღილაკს ნებისმიერ დროს, ჰკითხეთ ნაწილების ფასები, შეცდომების მიზეზები და მიიღეთ რჩევები ქართულად!',
      icon: Bot,
      requiredTab: 'home',
      placement: 'left-bottom'
    }
  ],

  // 2. OBD-II DIAGNOSTICS TOUR (5 STEPS)
  obd: [
    {
      id: 'obd-studio',
      targetSelector: '[data-tour="obd-studio"]',
      title: '3D ინტერაქტიული სტუდია & სკანირება',
      subtitle: '3D CAR SCANNING & DIAGNOSTICS',
      badge: '1 / 5',
      description: 'ავტომობილის რეალურ-დროში 3D მოდელი. დააწკაპუნეთ მანქანის ნებისმიერ კვანძზე (ძრავი, მუხრუჭები, გამონაბოლქვი, ელექტროობა) ან გაუშვით სრული სკანირება One-Touch Scan ღილაკით.',
      icon: Cpu,
      requiredTab: 'obd',
      placement: 'bottom'
    },
    {
      id: 'obd-results',
      targetSelector: '[data-tour="obd-results"]',
      title: 'დიაგნოსტიკის პასუხები & Check Engine',
      subtitle: 'DIAGNOSTIC RESULTS & FAULT ANALYSIS',
      badge: '2 / 5',
      description: 'სისტემა დეტალურად აანალიზებს ბორტ-კომპიუტერის შეცდომებს. ნახავთ კონკრეტულ ხარვეზს, სიმძიმის დონეს, რჩევებსა და სავარაუდო შეკეთების ხარჯს ლარებში.',
      icon: ShieldAlert,
      requiredTab: 'obd',
      placement: 'bottom'
    },
    {
      id: 'obd-action-buttons',
      targetSelector: '[data-tour="obd-action-buttons"]',
      title: 'ჩეკის ჩაქრობა & AI კონსულტაცია',
      subtitle: 'ECU RESET & AI DIAGNOSIS',
      badge: '3 / 5',
      description: 'ღილაკით "გასუფთავება" შეგიძლიათ წაშალოთ დაგროვილი DTC შეცდომები და ჩააქროთ Check Engine. AI მექანიკოსთან კონსულტაცია კი მოგცემთ ზუსტ რეკომენდაციებს ქართულად.',
      icon: Trash2,
      requiredTab: 'obd',
      placement: 'top'
    },
    {
      id: 'obd-telemetry',
      targetSelector: '[data-tour="obd-telemetry"]',
      title: 'ცოცხალი ტელემეტრია & მაჩვენებლები',
      subtitle: 'LIVE SENSORS & PIDS',
      badge: '4 / 5',
      description: '10 Hz სიხშირით განახლებადი ცოცხალი სენსორები: ძრავის ბრუნი (RPM), სიჩქარე, გამაგრილებელი სითხის ტემპერატურა, ზეთის წნევა და აკუმულატორის ვოლტაჟი.',
      icon: Activity,
      requiredTab: 'obd',
      placement: 'top'
    },
    {
      id: 'obd-dtc-board',
      targetSelector: '[data-tour="obd-dtc-board"]',
      title: 'DTC ხარვეზების დაფა',
      subtitle: 'DIAGNOSTIC TROUBLE CODES',
      badge: '5 / 5',
      description: 'სტანდარტული OBD-II კოდების სრული ჩამონათვალი (P, B, C, U ჯგუფები). თითოეულ კოდზე დაჭერით იხილავთ აღწერას, სიმძიმესა და გადაჭრის გზებს.',
      icon: Layers,
      requiredTab: 'obd',
      placement: 'top'
    }
  ],

  // 3. TRAFFIC FINES & DRIVER PROFILE TOUR (4 STEPS)
  fines: [
    {
      id: 'fines-passport',
      targetSelector: '[data-tour="fines-passport"]',
      title: 'მართვის მოწმობის ციფრული პასპორტი',
      subtitle: 'DRIVER BIOMETRIC PASSPORT',
      badge: '1 / 4',
      description: 'ოფიციალური ქართული მართვის მოწმობის ბარათი: მძღოლის ფოტო, პირადი ნომერი, კატეგორიები (B, A, C) და 100-ქულიანი საპატრულო ბალანსის წრიული ინდიკატორი.',
      icon: ShieldCheck,
      requiredTab: 'fines',
      placement: 'bottom'
    },
    {
      id: 'fines-summary',
      targetSelector: '[data-tour="fines-summary"]',
      title: 'ჯარიმების სწრაფი გადახდა & ფასდაკლება',
      subtitle: 'QUICK PAY & 20% DISCOUNT',
      badge: '2 / 4',
      description: 'საპატრულო პოლიციისა და ქალაქის კამერების ჯარიმების გადახდის პანელი. იხილეთ ჯამური თანხა და გამოიყენეთ კანონით გათვალისწინებული 20%-იანი ფასდაკლება.',
      icon: CreditCard,
      requiredTab: 'fines',
      placement: 'bottom'
    },
    {
      id: 'fines-exam',
      targetSelector: '[data-tour="fines-exam"]',
      title: 'მართვის მოწმობის ბილეთები & სიმულატორი',
      subtitle: 'DRIVING EXAM 2026 PLATFORM',
      badge: '3 / 4',
      description: 'შსს მომსახურების სააგენტოს 921 ოფიციალური საგამოცდო ბილეთი, ადაპტური სწავლება, აკადემიური რეგალიები და 30-წუთიანი რეალური საგამოცდო სიმულატორი.',
      icon: GraduationCap,
      requiredTab: 'fines',
      placement: 'bottom'
    },
    {
      id: 'fines-list',
      targetSelector: '[data-tour="fines-list"]',
      title: 'ჯარიმების დეტალური სია & ქვითრები',
      subtitle: 'ACTIVE FINES & PHOTO EVIDENCE',
      badge: '4 / 4',
      description: 'თითოეული ჯარიმის ქვითარი: დარღვევის ფოტო-ვიდეო მასალა, ადგილი, სიჩქარის გადაჭარბება, ქულების ჩამოჭრა და გასაჩივრების ოფცია.',
      icon: FileText,
      requiredTab: 'fines',
      placement: 'top'
    }
  ],

  // 4. MUNICIPAL PARKING TOUR (4 STEPS)
  parking: [
    {
      id: 'parking-monitor',
      targetSelector: '[data-tour="parking-monitor"]',
      title: 'ცოცხალი პარკირების ტაიმერი & დაწყება',
      subtitle: 'LIVE PARKING SESSION & TIMER',
      badge: '1 / 4',
      description: 'ერთი დაჭერით იწყებთ ან წყვეტთ პარკირებას. ცოცხალი ტაიმერი გიჩვენებთ გასულ წუთებს, 15 უფასო წუთის ლიმიტსა და დარიცხულ საფასურს რეალურ დროში.',
      icon: ParkingSquare,
      requiredTab: 'parking',
      placement: 'bottom'
    },
    {
      id: 'parking-map',
      targetSelector: '[data-tour="parking-map"]',
      title: 'პარკირების ზონების ინტერაქტიული რუკა',
      subtitle: 'INTERACTIVE PARKING ZONES MAP',
      badge: '2 / 4',
      description: 'რუკაზე მკაფიოდ ჩანს საათობრივი ზონალური პარკირების A, B და C ზონები, ფერადი შემოხაზულობები, თავისუფალი ადგილები და საპარკინგე სლოტები.',
      icon: MapPin,
      requiredTab: 'parking',
      placement: 'bottom'
    },
    {
      id: 'parking-city',
      targetSelector: '[data-tour="parking-city"]',
      title: 'ქალაქის არჩევა (თბილისი, ბათუმი, ქუთაისი)',
      subtitle: 'MUNICIPAL CITIES & REGIONS',
      badge: '3 / 4',
      description: 'ოფიციალური გერბებითა და ლოგოებით შეგიძლიათ მყისიერად გადართოთ ქალაქები: თბილისის სატრანსპორტო კომპანია (TTC), ბათუმის ავტოტრანსპორტი და ქუთაისის პარკინგი.',
      icon: Compass,
      requiredTab: 'parking',
      placement: 'top'
    },
    {
      id: 'parking-profile-passes',
      targetSelector: '[data-tour="parking-profile-passes"]',
      title: 'საპარკინგე პროფილი & აბონემენტები',
      subtitle: 'TARIFFS & SUBSCRIPTION PASSES',
      badge: '4 / 4',
      description: 'აქტიური ავტომობილის პარკირების სტატუსი, დღიური, კვირის, 6-თვიანი და 1-წლიანი მუნიციპალური საშვები შეღავათიანი პაკეტებით.',
      icon: Layers,
      requiredTab: 'parking',
      placement: 'top'
    }
  ],

  // 5. LIVE TRAFFIC MAP & RADARS TOUR (4 STEPS)
  map: [
    {
      id: 'map-controls',
      targetSelector: '[data-tour="map-controls"]',
      title: 'რუკის მართვა & სატელიტი',
      subtitle: 'MAP CONTROLS & SATELLITE SWITCHER',
      badge: '1 / 4',
      description: 'გადართეთ ხედები: ჩვეულებრივი რუკა, Dark Matter ღამის რეჟიმი და მაღალი რეზოლუციის Google Satellite სატელიტური ხედი ქართული ქუჩების წარწერებით.',
      icon: NavigationIcon,
      requiredTab: 'map',
      placement: 'bottom'
    },
    {
      id: 'map-traffic-filters',
      targetSelector: '[data-tour="map-traffic-filters"]',
      title: 'საცობები, ქუჩის რემონტი & ალტერნატივები',
      subtitle: 'TRAFFIC JAMS, REPAIRS & SHORTCUTS',
      badge: '2 / 4',
      description: 'სპეციალური ღილაკებით ჩართეთ საცობების 12 Live ლოკაცია, 14 ქუჩის სარემონტო ზონა და მწვანე უმოკლესი ალტერნატიული შემოვლითი გზები!',
      icon: Construction,
      requiredTab: 'map',
      placement: 'bottom'
    },
    {
      id: 'map-canvas',
      targetSelector: '[data-tour="map-canvas"]',
      title: 'ინტერაქტიული რუკა & რადარები',
      subtitle: 'RADARS, CAMERAS & STATIONS',
      badge: '3 / 4',
      description: 'თბილისისა და საქართველოს გზების 9,000-ზე მეტი ობიექტი: სიჩქარის მზომი რადარები, სექციური კამერები, Wissol/Gulf/Rompetrol საწვავის ფასები და EV დამტენები.',
      icon: MapPin,
      requiredTab: 'map',
      placement: 'top'
    },
    {
      id: 'map-report-btn',
      targetSelector: '[data-tour="map-report-btn"]',
      title: 'საგზაო შეტყობინების დამატება',
      subtitle: 'COMMUNITY REPORTING & HAZARDS',
      badge: '4 / 4',
      description: 'გააფრთხილეთ სხვა მძღოლები! დააჭირეთ "+ შეტყობინებას" პატრულის ეკიპაჟის, ავარიის, საცობის ან გზის დაზიანების დასაფიქსირებლად.',
      icon: Zap,
      requiredTab: 'map',
      placement: 'bottom-right'
    }
  ],

  // 6. SERVICE LOG & OEM CATALOG TOUR (4 STEPS)
  service: [
    {
      id: 'service-header-stats',
      targetSelector: '[data-tour="service-header-stats"]',
      title: 'ციფრული სერვის-წიგნაკი & გარბენი',
      subtitle: 'SERVICE DECK & MILEAGE',
      badge: '1 / 4',
      description: 'ავტომობილის გეგმიური მომსახურება ქარხნული OEM ინტერვალებით. აქ ჩანს მიმდინარე გარბენი და მომსახურების კალენდარი.',
      icon: Wrench,
      requiredTab: 'service',
      placement: 'bottom'
    },
    {
      id: 'service-deck-cards',
      targetSelector: '[data-tour="service-deck-cards"]',
      title: '4 ინტერაქტიული ბარათი',
      subtitle: 'SMART SERVICE MANAGEMENT CARDS',
      badge: '2 / 4',
      description: 'მანქანის ქარხნული პროფილი, რესურსების AI კალკულატორი, ოფიციალური PTI ტექ-დათვალიერება და ავტო-ექიმთან ონლაინ ჩაწერა.',
      icon: Layers,
      requiredTab: 'service',
      placement: 'bottom'
    },
    {
      id: 'service-category-filter',
      targetSelector: '[data-tour="service-category-filter"]',
      title: 'კატეგორიების ფილტრი & მზა პასუხები',
      subtitle: 'CATEGORIES & PRESET ANSWERS',
      badge: '3 / 4',
      description: 'ძრავი და ზეთი, სამუხრუჭე სისტემა, სავალი ნაწილი, ელექტროობა და სითხეები. შეგიძლიათ ჩართოთ/გამორთოთ მზა პასუხები და გამორთული ფანჯრები.',
      icon: Sparkles,
      requiredTab: 'service',
      placement: 'top'
    },
    {
      id: 'service-cards-grid',
      targetSelector: '[data-tour="service-cards-grid"]',
      title: 'სერვის-კომპონენტების ბარათები & რესურსი',
      subtitle: 'SERVICE ITEMS & RESOURCE TRACKER',
      badge: '4 / 4',
      description: 'თითოეული დეტალის დარჩენილი რესურსი (%), გამოცვლის თარიღი, შეხსენების ზარი და AI ოსტატთან კონსულტაციის ღილაკი.',
      icon: Activity,
      requiredTab: 'service',
      placement: 'top'
    }
  ],

  // 7. DRIVING EXAM TICKETS 2026 PLATFORM TOUR (4 STEPS)
  exam: [
    {
      id: 'exam-academic-analysis',
      targetSelector: '[data-tour="exam-academic-analysis"]',
      title: 'აკადემიური რანგი & პროგრესის ანალიზი',
      subtitle: 'ACADEMIC RANK & KNOWLEDGE MATRIX',
      badge: '1 / 4',
      description: 'ინტელექტუალური ალგორითმი ამოიცნობს თქვენს მომზადების დონეს: მაგისტრი, დოქტორი, აკადემიკოსი ან ჩაინიკი! იხილეთ ცოდნის პროცენტი და შეცდომების გამეორება.',
      icon: Award,
      requiredTab: 'exam',
      placement: 'bottom'
    },
    {
      id: 'exam-category-tabs',
      targetSelector: '[data-tour="exam-category-tabs"]',
      title: 'კატეგორიების პაკეტები (B, A, C, D, AM)',
      subtitle: 'OFFICIAL 2026 QUESTION PACKS',
      badge: '2 / 4',
      description: 'შსს მომსახურების სააგენტოს ოფიციალური ბაზა. მარტივად გადართეთ მსუბუქი (B - 921 ბილეთი), მოტოციკლი (A - 760), სატვირთო (C) თუ მოპედი.',
      icon: Layers,
      requiredTab: 'exam',
      placement: 'bottom'
    },
    {
      id: 'exam-modes-grid',
      targetSelector: '[data-tour="exam-modes-grid"]',
      title: '4 საგამოცდო რეჟიმი & სიმულაცია',
      subtitle: 'EXAM MODES & ADAPTIVE STUDY',
      badge: '3 / 4',
      description: 'რეალური გამოცდა (30 წთ / 30 კითხვა / მაქს. 3 შეცდომა), ადაპტური სწავლება 15 კითხვა, შეცდომების გამეორება და მონიშნული თემების ვარჯიში.',
      icon: GraduationCap,
      requiredTab: 'exam',
      placement: 'bottom'
    },
    {
      id: 'exam-topics-grid',
      targetSelector: '[data-tour="exam-topics-grid"]',
      title: '32 ოფიციალური თემა (prava.ge)',
      subtitle: '32 THEMATIC SUBJECTS PRAVA.GE',
      badge: '4 / 4',
      description: 'მოძრაობის წესები, მაფრთხილებელი, პრიორიტეტისა და ამკრძალავი ნიშნები, შუქნიშნები, მანევრირება და უსაფრთხოება.',
      icon: Compass,
      requiredTab: 'exam',
      placement: 'top'
    }
  ],

  // 8. AI MECHANIC ASSISTANT TOUR (3 STEPS)
  ai: [
    {
      id: 'ai-chat-header',
      targetSelector: '[data-tour="ai-chat-header"]',
      title: 'AI მექანიკოსი 24/7',
      subtitle: 'AI CHAT & VEHICLE CONTEXT',
      badge: '1 / 3',
      description: 'თქვენი პირადი ციფრული ოსტატი. ფლობს სრულ ინფორმაციას თქვენი ავტომობილის მოდელზე, შეცდომის კოდებსა და სერვისებზე.',
      icon: Bot,
      requiredTab: 'ai',
      placement: 'bottom'
    },
    {
      id: 'ai-chat-presets',
      targetSelector: '[data-tour="ai-chat-presets"]',
      title: 'სწრაფი შეკითხვები & თემები',
      subtitle: 'QUICK AUTO PROMPTS',
      badge: '2 / 3',
      description: 'ერთი დაჭერით გაიგეთ ნაწილების ფასები, სერვისცენტრების მისამართები და დიაგნოსტიკის რჩევები ქართულ ენაზე.',
      icon: Sparkles,
      requiredTab: 'ai',
      placement: 'bottom'
    },
    {
      id: 'ai-chat-input',
      targetSelector: '[data-tour="ai-chat-input"]',
      title: 'შეკითხვის დასმა & ხმოვანი მართვა',
      subtitle: 'ASK QUESTION & VOICE ASSISTANT',
      badge: '3 / 3',
      description: 'ჩაწერეთ შეკითხვა, ისაუბრეთ ხმით მიკროფონის ღილაკით და მოუსმინეთ მექანიკოსის პასუხს ქართულად!',
      icon: MessageSquare,
      requiredTab: 'ai',
      placement: 'top'
    }
  ],

  // 9. GARAGE & VEHICLE FLEET TOUR (3 STEPS)
  garage: [
    {
      id: 'garage-header',
      targetSelector: '[data-tour="garage-header"]',
      title: 'ჩემი გარაჟი & ავტოპარკი',
      subtitle: 'GARAGE & VEHICLE FLEET',
      badge: '1 / 3',
      description: 'თქვენი ავტოპარკის მართვის ცენტრი: აქ შეგიძლიათ გადართოთ ავტომობილები და მართვის მოწმობის პროფილი.',
      icon: Car,
      requiredTab: 'garage',
      placement: 'bottom'
    },
    {
      id: 'garage-add-car',
      targetSelector: '[data-tour="garage-add-car"]',
      title: 'ახალი მანქანის დამატება',
      subtitle: 'ADD NEW VEHICLE',
      badge: '2 / 3',
      description: 'დაამატეთ ახალი ავტომობილი მარკის, მოდელის, გამოშვების წლისა და სახელმწიფო ნომრის მითითებით.',
      icon: Layers,
      requiredTab: 'garage',
      placement: 'bottom-right'
    },
    {
      id: 'garage-profile',
      targetSelector: '[data-tour="garage-profile"]',
      title: 'ავტომობილის პროფილი & მონაცემები',
      subtitle: 'ACTIVE VEHICLE SPECIFICATIONS',
      badge: '3 / 3',
      description: 'აქტიური ავტომობილის სრული მონაცემები: გარბენი, ძრავი, VIN კოდი და ტექნიკური პარამეტრები.',
      icon: ShieldCheck,
      requiredTab: 'garage',
      placement: 'top'
    }
  ],

  // 10. SETTINGS (FALLBACK TO GARAGE STEPS)
  settings: [
    {
      id: 'garage-header',
      targetSelector: '[data-tour="garage-header"]',
      title: 'ჩემი გარაჟი & პარამეტრები',
      subtitle: 'GARAGE & SETTINGS',
      badge: '1 / 3',
      description: 'თქვენი ავტოპარკის მართვის ცენტრი: აქ შეგიძლიათ გადართოთ ავტომობილები და მართვის მოწმობის პროფილი.',
      icon: Car,
      requiredTab: 'garage',
      placement: 'bottom'
    },
    {
      id: 'garage-add-car',
      targetSelector: '[data-tour="garage-add-car"]',
      title: 'ახალი მანქანის დამატება',
      subtitle: 'ADD NEW VEHICLE',
      badge: '2 / 3',
      description: 'დაამატეთ ახალი ავტომობილი მარკის, მოდელის, გამოშვების წლისა და სახელმწიფო ნომრის მითითებით.',
      icon: Layers,
      requiredTab: 'garage',
      placement: 'bottom-right'
    },
    {
      id: 'garage-profile',
      targetSelector: '[data-tour="garage-profile"]',
      title: 'ავტომობილის პროფილი & მონაცემები',
      subtitle: 'ACTIVE VEHICLE SPECIFICATIONS',
      badge: '3 / 3',
      description: 'აქტიური ავტომობილის სრული მონაცემები: გარბენი, ძრავი, VIN კოდი და ტექნიკური პარამეტრები.',
      icon: ShieldCheck,
      requiredTab: 'garage',
      placement: 'top'
    }
  ]
};

const EXPLORE_TABS: { id: TabType; name_ge: string; icon: string }[] = [
  { id: 'home', name_ge: 'მთავარი', icon: '🏠' },
  { id: 'obd', name_ge: 'დიაგნოსტიკა', icon: '⚡' },
  { id: 'fines', name_ge: 'ჯარიმები', icon: '🛡️' },
  { id: 'parking', name_ge: 'პარკინგი', icon: '🅿️' },
  { id: 'map', name_ge: 'რუკა', icon: '🗺️' },
  { id: 'service', name_ge: 'სერვისი', icon: '🔧' },
  { id: 'exam', name_ge: 'ბილეთები', icon: '🎓' }
];

interface Props {
  currentTab?: TabType;
  onNavigateTab: (tab: TabType) => void;
  externalTrigger?: number;
  onTourActiveChange?: (active: boolean) => void;
  onTourCompleted?: () => void;
}

export const InteractiveSiteTour: React.FC<Props> = ({
  currentTab,
  onNavigateTab,
  externalTrigger,
  onTourActiveChange,
  onTourCompleted
}) => {
  // Draggable constraint container ref (locks window strictly inside viewport)
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(280);
  const [userCustomPos, setUserCustomPos] = useState<{ x: number; y: number } | null>(null);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);

  // State: Active tab being toured
  const [activeTourTab, setActiveTourTab] = useState<TabType>(currentTab || 'home');

  // State: Cloud Bot Prompt (ღრუბლის ფანჯარა ბოტი)
  const [isCloudPromptOpen, setIsCloudPromptOpen] = useState(false);
  
  // State: Google-style Interactive Tour
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Helper to get steps for any tab safely
  const getStepsForTab = useCallback((tab?: TabType): TourStep[] => {
    const key = tab || 'home';
    return PAGE_TOUR_STEPS[key] || PAGE_TOUR_STEPS.home;
  }, []);

  const activeSteps = getStepsForTab(activeTourTab);
  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];
  const StepIcon = currentStep?.icon || Sparkles;

  // Notify parent of tour state changes
  useEffect(() => {
    onTourActiveChange?.(isTourActive);
  }, [isTourActive, onTourActiveChange]);

  // Measure actual rendered height of the card dynamically to guarantee it fits on screen
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const measure = () => {
      if (el) {
        const h = el.offsetHeight;
        if (h > 100 && Math.abs(h - cardHeight) > 3) {
          setCardHeight(h);
        }
      }
    };

    measure();

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [currentStepIndex, isTourActive, cardHeight]);

  // Trigger initial Cloud Bot after 1.5s delay if not dismissed in this session
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('autohub_cloud_guide_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsCloudPromptOpen(true);
        }, 1400);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Helper to find visible target element even if multiple elements share a data-tour attribute
  const findVisibleTarget = useCallback((selector: string): HTMLElement | null => {
    const list = document.querySelectorAll(selector);
    for (let i = 0; i < list.length; i++) {
      const el = list[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return el;
    }
    return document.querySelector(selector) as HTMLElement | null;
  }, []);

  // Start tour for the CURRENT page or an explicitly requested tab
  const startTour = useCallback((targetTab?: TabType) => {
    sounds.playSuccess();
    const tabToStart = targetTab || currentTab || 'home';
    setActiveTourTab(tabToStart);
    const steps = getStepsForTab(tabToStart);

    setIsCloudPromptOpen(false);
    setIsCompletedModalOpen(false);
    setCurrentStepIndex(0);
    setUserCustomPos(null);
    setIsTourActive(true);

    if (currentTab !== tabToStart) {
      onNavigateTab(tabToStart);
    }

    setTimeout(() => {
      const el = findVisibleTarget(steps[0].targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    }, 150);
  }, [currentTab, onNavigateTab, findVisibleTarget, getStepsForTab]);

  // Respond to manual external triggers (from Header "გიდი" button)
  useEffect(() => {
    if (externalTrigger && externalTrigger > 0) {
      startTour(currentTab || 'home');
    }
  }, [externalTrigger]);

  const dismissCloudPrompt = () => {
    sounds.playClick();
    setIsCloudPromptOpen(false);
    try {
      localStorage.setItem('autohub_cloud_guide_dismissed', 'true');
    } catch {}
  };

  const closeTour = () => {
    sounds.playClick();
    setIsTourActive(false);
    setTargetRect(null);
  };

  // Update target element's bounding rectangle on step change, resize, or scroll
  const updateTargetRect = useCallback(() => {
    if (!isTourActive) return;

    const steps = getStepsForTab(activeTourTab);
    const step = steps[currentStepIndex];
    if (!step) return;

    const el = findVisibleTarget(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [isTourActive, activeTourTab, currentStepIndex, findVisibleTarget, getStepsForTab]);

  // Handle smooth element transitions when step changes
  useEffect(() => {
    if (!isTourActive) return;

    setIsStepTransitioning(true);
    const transitionTimer = setTimeout(() => {
      setIsStepTransitioning(false);
      updateTargetRect();
    }, 450);

    const steps = getStepsForTab(activeTourTab);
    const step = steps[currentStepIndex];
    if (!step) return () => clearTimeout(transitionTimer);

    // Only switch tabs if the step requires a different tab
    if (step.requiredTab && currentTab && currentTab !== step.requiredTab) {
      onNavigateTab(step.requiredTab);
    }

    const alignToTarget = () => {
      const el = findVisibleTarget(step.targetSelector);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      const stickyHeader = document.getElementById('sticky-header');
      const headerH = stickyHeader ? stickyHeader.offsetHeight : 120;

      const minVisibleTop = headerH + 12;
      const isComfortable = rect.top >= minVisibleTop && rect.top <= window.innerHeight * 0.45;

      if (!isComfortable) {
        const currentY = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = Math.max(0, currentY + rect.top - headerH - 20);

        if (Math.abs(currentY - targetY) > 25) {
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        }
      }
    };

    // Immediate alignment
    alignToTarget();

    // Re-check after 200ms in case element rendered dynamically
    const recheckTimer = setTimeout(alignToTarget, 220);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(recheckTimer);
    };
  }, [isTourActive, currentStepIndex, activeTourTab, currentTab, onNavigateTab, updateTargetRect, findVisibleTarget, getStepsForTab]);

  // Recalculate position on scroll & resize smoothly using requestAnimationFrame
  useEffect(() => {
    if (!isTourActive) return;

    let rafId: number | null = null;
    const handleScrollOrResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateTargetRect();
        rafId = null;
      });
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [isTourActive, updateTargetRect]);

  // Global Keyboard ArrowLeft / ArrowRight Navigation for Tour Steps
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, currentStepIndex, activeTourTab]);

  const handleNext = () => {
    sounds.playClick();
    const steps = getStepsForTab(activeTourTab);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    sounds.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const completeTour = () => {
    sounds.playSuccess();
    setIsTourActive(false);
    setTargetRect(null);
    setIsCompletedModalOpen(true);

    try {
      sessionStorage.setItem('autohub_cloud_guide_dismissed', 'true');
      localStorage.setItem(`autohub_tour_completed_${activeTourTab}`, 'true');
    } catch {}

    // Confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // Calculate Popover Position with smooth, stable coordinates that never flip or jump
  const getPopoverCoords = () => {
    const popoverWidth = Math.min(370, window.innerWidth - 32);
    const popoverHeight = Math.max(270, cardHeight);
    const margin = 14;
    const pad = 16;

    const maxTop = Math.max(pad, window.innerHeight - popoverHeight - pad);
    const maxLeft = Math.max(pad, window.innerWidth - popoverWidth - pad);

    if (!targetRect) {
      return {
        top: maxTop,
        left: Math.max(pad, (window.innerWidth - popoverWidth) / 2),
        width: popoverWidth
      };
    }

    const preferredPlacement = currentStep?.placement || 'auto';

    let left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
    let top = 0;

    if (preferredPlacement === 'left-bottom' || preferredPlacement === 'left') {
      left = targetRect.left - popoverWidth - margin;
      top = maxTop;
      if (left < pad) {
        left = pad;
        top = Math.max(pad, targetRect.top - popoverHeight - margin);
      }
    } else if (preferredPlacement === 'bottom-right') {
      top = maxTop;
      left = maxLeft;
    } else if (preferredPlacement === 'bottom') {
      top = targetRect.bottom + margin;
      if (top > maxTop) {
        if (targetRect.top > popoverHeight + margin + pad) {
          top = targetRect.top - popoverHeight - margin;
        } else {
          top = maxTop;
        }
      }
    } else if (preferredPlacement === 'top' || preferredPlacement === 'top-right') {
      top = targetRect.top - popoverHeight - margin;
      if (preferredPlacement === 'top-right') {
        left = targetRect.right - popoverWidth;
      }
      if (top < pad) {
        top = Math.min(targetRect.bottom + margin, maxTop);
      }
    } else if (preferredPlacement === 'center-bottom') {
      top = maxTop;
      left = (window.innerWidth - popoverWidth) / 2;
    } else {
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;

      if (spaceBelow >= popoverHeight + margin || spaceBelow >= spaceAbove) {
        top = targetRect.bottom + margin;
        if (top > maxTop) {
          top = maxTop;
        }
      } else {
        top = targetRect.top - popoverHeight - margin;
        if (top < pad) {
          top = pad;
        }
      }
    }

    top = Math.max(pad, Math.min(top, maxTop));
    left = Math.max(pad, Math.min(left, maxLeft));

    return {
      top,
      left,
      width: popoverWidth
    };
  };

  const popoverCoords = getPopoverCoords();
  const currentTabMeta = TAB_TOUR_METADATA[activeTourTab] || TAB_TOUR_METADATA.home;

  return (
    <>
      {/* 1. INITIAL CLOUD BOT PROMPT (ღრუბლის ფანჯარა ბოტი) */}
      <AnimatePresence>
        {isCloudPromptOpen && !isTourActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] select-none"
          >
            {/* Cloud Speech Bubble Container */}
            <div className="relative rounded-3xl p-5 sm:p-6 bg-slate-900/90 backdrop-blur-2xl border-2 border-gold shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
              
              {/* Header with Bot Mascot & Close Button */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy to-navy-700 text-gold flex items-center justify-center shadow-md relative border border-gold/40 shrink-0 ai-lightning-btn overflow-hidden"
                  >
                    <div className="ai-lightning-flash" />
                    <Bot size={26} className="relative z-10" />
                    <Zap size={12} className="absolute -bottom-1 -left-1 text-gold fill-gold animate-bounce z-20" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gold"></span>
                    </span>
                  </motion.div>

                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold border border-gold/40">
                      AutoHub AI გიდი
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight flex items-center gap-1.5">
                      <span>გამარჯობა!</span>
                      <span className="inline-block animate-bounce">👋</span>
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={dismissCloudPrompt}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/20"
                  title="დახურვა"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Bot Question / Cloud Text */}
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed mb-4">
                მე ვარ თქვენი პერსონალური ასისტენტი. გსურთ ჩავატარო {TAB_TOUR_METADATA[currentTab || 'home']?.name_ge || 'ამ გვერდის'}-ის ინტერაქტიული ტური და გაჩვენოთ ყველა ფუნქცია?
              </p>

              {/* Action Buttons: "არა, მადლობა" vs "დიახ, დავიწყოთ!" */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/15">
                <button
                  type="button"
                  onClick={dismissCloudPrompt}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all text-center border border-white/15"
                >
                  არა, მადლობა
                </button>

                <button
                  type="button"
                  onClick={() => startTour(currentTab || 'home')}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs font-black shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>დავიწყოთ!</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Speech Cloud Pointer Tail */}
              <div className="absolute -bottom-3 right-8 w-6 h-6 bg-slate-900 border-r-2 border-b-2 border-gold transform rotate-45 shadow-sm"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. GOOGLE-STYLE INTERACTIVE WALKTHROUGH OVERLAY */}
      {isTourActive && currentStep && (
        <>
          {/* Full-Screen Darkened Spotlight Mask SVG with Smooth Spring Transition */}
          <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9985]">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <motion.rect
                  initial={false}
                  animate={{
                    x: targetRect ? targetRect.left - 8 : window.innerWidth / 2 - 100,
                    y: targetRect ? targetRect.top - 8 : window.innerHeight / 2 - 50,
                    width: targetRect ? targetRect.width + 16 : 200,
                    height: targetRect ? targetRect.height + 16 : 100,
                    opacity: targetRect ? 1 : 0
                  }}
                  transition={
                    isStepTransitioning
                      ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.35 }
                      : { duration: 0 }
                  }
                  rx={18}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(15, 23, 42, 0.72)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Interactive Backdrop Clickcatcher to avoid accidental outside interactions */}
          <div
            className="fixed inset-0 z-[9986] autohub-tour-active"
            onClick={closeTour}
          />

          {/* Viewport Bounds Container for Drag Constraints */}
          <div
            ref={dragConstraintsRef}
            className="fixed inset-3 sm:inset-4 pointer-events-none z-[9987]"
          />

          {/* Smooth Gliding Golden Halo Border Around Target Element */}
          <motion.div
            initial={false}
            animate={{
              x: targetRect ? targetRect.left - 8 : 0,
              y: targetRect ? targetRect.top - 8 : 0,
              width: targetRect ? targetRect.width + 16 : 0,
              height: targetRect ? targetRect.height + 16 : 0,
              opacity: targetRect ? 1 : 0
            }}
            transition={
              isStepTransitioning
                ? { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.35 }
                : { duration: 0 }
            }
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              borderRadius: '18px',
              zIndex: 9988
            }}
            className="border-2 border-gold shadow-[0_0_20px_rgba(252,163,17,0.55)] pointer-events-none"
          />

          {/* Floating Explanation Card */}
          <motion.div
            ref={cardRef}
            drag
            dragConstraints={dragConstraintsRef}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={() => {
              const el = cardRef.current;
              if (el) {
                const rect = el.getBoundingClientRect();
                const pad = 16;
                const clampedX = Math.max(pad, Math.min(rect.left, window.innerWidth - rect.width - pad));
                const clampedY = Math.max(pad, Math.min(rect.top, window.innerHeight - rect.height - pad));
                setUserCustomPos({ x: clampedX, y: clampedY });
              }
            }}
            initial={{
              opacity: 0,
              scale: 0.96,
              top: userCustomPos ? userCustomPos.y : popoverCoords.top,
              left: userCustomPos ? userCustomPos.x : popoverCoords.left,
              width: popoverCoords.width
            }}
            animate={{
              opacity: targetRect ? 1 : 0,
              scale: 1,
              top: userCustomPos ? userCustomPos.y : popoverCoords.top,
              left: userCustomPos ? userCustomPos.x : popoverCoords.left,
              width: popoverCoords.width
            }}
            transition={{
              type: 'tween',
              ease: [0.16, 1, 0.3, 1],
              duration: 0.28
            }}
            style={{
              position: 'fixed',
              zIndex: 9999,
              cursor: 'grab'
            }}
            whileDrag={{
              cursor: 'grabbing',
              scale: 1.02,
              boxShadow: '0 30px 70px rgba(0,0,0,0.85)'
            }}
            className="rounded-3xl p-3 sm:p-3.5 bg-slate-900/95 backdrop-blur-2xl border-2 border-gold shadow-[0_25px_60px_rgba(0,0,0,0.75)] text-white pointer-events-auto max-h-[min(520px,calc(100vh-32px))] overflow-y-auto select-none touch-none flex flex-col justify-between"
          >
            {/* Top Drag Grip Handle & Move Indicator */}
            <div
              className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 cursor-grab active:cursor-grabbing text-slate-400 select-none group shrink-0"
              title="დააჭირეთ და გადააადგილეთ ფანჯარა ნებისმიერ ადგილას"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 group-hover:text-gold transition-colors">
                <Move size={12} className="text-gold/80 group-hover:scale-110 transition-transform" />
                <span className="uppercase tracking-wider">{currentTabMeta.name_ge}</span>
                {userCustomPos && (
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      setUserCustomPos(null);
                    }}
                    className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-white/10 hover:bg-gold/20 text-slate-300 hover:text-gold flex items-center gap-0.5 transition-colors border border-white/10"
                    title="ავტო-პოზიციაზე დაბრუნება"
                  >
                    <RotateCcw size={9} />
                    <span>საწყისზე</span>
                  </button>
                )}
              </div>
              <div className="w-8 h-1 rounded-full bg-white/20 group-hover:bg-gold/60 transition-colors" />
              <span className="text-[10px] font-mono font-bold text-gold/80">{currentStep.badge}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {/* Popover Header: Step Indicator, Category Badge & Skip Button */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-gold text-slate-950 shadow-xs">
                      {currentStep.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider truncate max-w-[200px]">
                      {currentStep.subtitle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={closeTour}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer shrink-0"
                    title="ტურიდან გასვლა"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Step Title with Icon */}
                <div className="flex items-center gap-2 my-1.5">
                  <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/40 shadow-xs">
                    <StepIcon size={16} />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-snug drop-shadow-sm">
                    {currentStep.title}
                  </h3>
                </div>

                {/* Step Explanation */}
                <p className="text-xs sm:text-[13px] text-slate-100 font-medium leading-relaxed my-1.5 drop-shadow-sm">
                  {currentStep.description}
                </p>

                {/* Progress Dots Indicator */}
                <div className="flex items-center justify-center gap-1.5 py-1 mb-1">
                  {activeSteps.map((s, idx) => (
                    <span
                      key={s.id}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentStepIndex
                          ? 'w-6 bg-gold shadow-[0_0_8px_rgba(252,163,17,0.7)]'
                          : idx < currentStepIndex
                          ? 'w-2 bg-gold/60'
                          : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons: [ Back ] & [ Next / Finish ] */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15">
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      currentStepIndex === 0
                        ? 'opacity-30 cursor-not-allowed text-slate-500'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 cursor-pointer'
                    }`}
                  >
                    <ArrowLeft size={13} />
                    <span>უკან</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={closeTour}
                      className="text-xs text-slate-400 hover:text-white font-bold px-2 py-1 transition-colors cursor-pointer"
                    >
                      გამოტოვება
                    </button>

                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={handleNext}
                      className="px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs font-black shadow-md hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentStepIndex === activeSteps.length - 1 ? 'დასრულება 🎉' : 'შემდეგი'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {/* 3. TOUR COMPLETED CELEBRATION MODAL */}
      <AnimatePresence>
        {isCompletedModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full rounded-3xl p-6 bg-slate-900/90 backdrop-blur-2xl text-white shadow-2xl border-2 border-gold text-center relative"
            >
              <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto mb-3 border border-gold/40 shadow-md">
                <Sparkles size={32} />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ტური წარმატებით დასრულდა
              </span>

              <h3 className="text-xl font-black text-white mt-2">
                გილოცავთ! {currentTabMeta.name_ge} ათვისებულია 🚀
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed my-3">
                {currentTabMeta.summary} ნებისმიერ დროს შეგიძლიათ ხელახლა ჩართოთ ტური ზედა მენიუს "გიდი" ღილაკით.
              </p>

              <button
                type="button"
                onClick={() => {
                  sounds.playSuccess();
                  setIsCompletedModalOpen(false);
                  onTourCompleted?.();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-sm font-black shadow-lg hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                მშვენიერია, დავიწყოთ!
              </button>

              {/* Other Pages Tour Shortcuts */}
              <div className="pt-4 mt-4 border-t border-white/10 text-left">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  გსურთ სხვა გვერდის ტურის გავლაც?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {EXPLORE_TABS.filter(t => t.id !== activeTourTab).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setIsCompletedModalOpen(false);
                        startTour(t.id);
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/10 hover:bg-gold/20 hover:text-gold text-slate-200 border border-white/15 transition-all flex items-center gap-1 cursor-pointer hover:border-gold/50"
                    >
                      <span>{t.icon}</span>
                      <span>{t.name_ge}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InteractiveSiteTour;
