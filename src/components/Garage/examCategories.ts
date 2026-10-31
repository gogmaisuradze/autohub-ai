// Question selection is an AutoHub training simulation, not an official draw.
export const EXAM_CATEGORIES = [
  {
    "cat": "B",
    "label": "B / B1",
    "desc": "მსუბუქი",
    "icon": "🚗",
    "size": 30,
    "maxErrors": 5,
    "minutes": 30,
    "count": 921,
    "verified": true
  },
  {
    "cat": "A",
    "label": "A / A1",
    "desc": "მოტოციკლი",
    "icon": "🏍️",
    "size": 30,
    "maxErrors": 3,
    "minutes": 30,
    "count": 864,
    "verified": true
  },
  {
    "cat": "AM",
    "label": "AM",
    "desc": "მოპედი",
    "icon": "🛵",
    "size": 20,
    "maxErrors": 2,
    "minutes": 20,
    "count": 338,
    "verified": true
  },
  {
    "cat": "C",
    "label": "C",
    "desc": "სატვირთო",
    "icon": "🚚",
    "size": 40,
    "maxErrors": 4,
    "minutes": 40,
    "count": 1085,
    "verified": true
  },
  {
    "cat": "C1",
    "label": "C1",
    "desc": "მსუბუქი სატვირთო",
    "icon": "🚛",
    "size": 35,
    "maxErrors": 3,
    "minutes": 35,
    "count": 1073,
    "verified": true
  },
  {
    "cat": "D",
    "label": "D",
    "desc": "ავტობუსი",
    "icon": "🚌",
    "size": 40,
    "maxErrors": 4,
    "minutes": 40,
    "count": 983,
    "verified": true
  },
  {
    "cat": "D1",
    "label": "D1",
    "desc": "მიკროავტობუსი",
    "icon": "🚐",
    "size": 35,
    "maxErrors": 3,
    "minutes": 35,
    "count": 966,
    "verified": true
  },
  {
    "cat": "TS",
    "label": "T / S",
    "desc": "სპეცტექნიკა",
    "icon": "🚜",
    "size": 30,
    "maxErrors": 3,
    "minutes": 30,
    "count": 1021,
    "verified": true
  },
  {
    "cat": "Tram",
    "label": "Tram",
    "desc": "ტრამვაი",
    "icon": "🚋",
    "size": 40,
    "maxErrors": 4,
    "minutes": 40,
    "count": 999,
    "verified": false
  },
  {
    "cat": "Mil",
    "label": "B + C1 Mil",
    "desc": "სამხედრო",
    "icon": "🛡️",
    "size": 40,
    "maxErrors": 4,
    "minutes": 40,
    "count": 1452,
    "verified": false
  }
] as const;
export type ExamCategory = typeof EXAM_CATEGORIES[number]['cat'];
export const examCategory = (category: ExamCategory) => EXAM_CATEGORIES.find(c => c.cat === category)!;
