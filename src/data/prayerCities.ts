import type { PrayerCity, PrayerMethodId } from '../types/quran';

export const PRAYER_CALCULATION_METHODS: {
  id: PrayerMethodId;
  labelAr: string;
}[] = [
  { id: 'Morocco', labelAr: 'وزارة الأوقاف والشؤون الإسلامية (المغرب)' },
  { id: 'UmmAlQura', labelAr: 'تقويم أم القرى (المملكة العربية السعودية)' },
  { id: 'Egyptian', labelAr: 'الهيئة المصرية العامة للمساحة' },
  { id: 'MuslimWorldLeague', labelAr: 'رابطة العالم الإسلامي' },
  { id: 'Dubai', labelAr: 'دائرة الشؤون الإسلامية (الإمارات)' },
  { id: 'Kuwait', labelAr: 'وزارة الأوقاف (الكويت)' },
  { id: 'Qatar', labelAr: 'التقويم القطري' },
  { id: 'Turkey', labelAr: 'رئاسة الشؤون الدينية (تركيا)' },
  { id: 'Karachi', labelAr: 'جامعة العلوم الإسلامية (كراتشي)' },
  { id: 'NorthAmerica', labelAr: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
];

export const PRAYER_CITIES: PrayerCity[] = [
  { id: 'casablanca', nameAr: 'الدار البيضاء', countryAr: 'المغرب', latitude: 33.5731, longitude: -7.5898, defaultMethod: 'Morocco' },
  { id: 'rabat', nameAr: 'الرباط', countryAr: 'المغرب', latitude: 34.0209, longitude: -6.8416, defaultMethod: 'Morocco' },
  { id: 'marrakech', nameAr: 'مراكش', countryAr: 'المغرب', latitude: 31.6295, longitude: -7.9811, defaultMethod: 'Morocco' },
  { id: 'fes', nameAr: 'فاس', countryAr: 'المغرب', latitude: 34.0181, longitude: -5.0078, defaultMethod: 'Morocco' },
  { id: 'tangier', nameAr: 'طنجة', countryAr: 'المغرب', latitude: 35.7595, longitude: -5.834, defaultMethod: 'Morocco' },
  { id: 'agadir', nameAr: 'أكادير', countryAr: 'المغرب', latitude: 30.4278, longitude: -9.5981, defaultMethod: 'Morocco' },
  { id: 'oujda', nameAr: 'وجدة', countryAr: 'المغرب', latitude: 34.6814, longitude: -1.9086, defaultMethod: 'Morocco' },
  { id: 'meknes', nameAr: 'مكناس', countryAr: 'المغرب', latitude: 33.873, longitude: -5.5407, defaultMethod: 'Morocco' },
  { id: 'makkah', nameAr: 'مكة المكرمة', countryAr: 'السعودية', latitude: 21.3891, longitude: 39.8579, defaultMethod: 'UmmAlQura' },
  { id: 'madinah', nameAr: 'المدينة المنورة', countryAr: 'السعودية', latitude: 24.5247, longitude: 39.5692, defaultMethod: 'UmmAlQura' },
  { id: 'riyadh', nameAr: 'الرياض', countryAr: 'السعودية', latitude: 24.7136, longitude: 46.6753, defaultMethod: 'UmmAlQura' },
  { id: 'cairo', nameAr: 'القاهرة', countryAr: 'مصر', latitude: 30.0444, longitude: 31.2357, defaultMethod: 'Egyptian' },
  { id: 'alexandria', nameAr: 'الإسكندرية', countryAr: 'مصر', latitude: 31.2001, longitude: 29.9187, defaultMethod: 'Egyptian' },
  { id: 'algiers', nameAr: 'الجزائر', countryAr: 'الجزائر', latitude: 36.7538, longitude: 3.0588, defaultMethod: 'MuslimWorldLeague' },
  { id: 'tunis', nameAr: 'تونس', countryAr: 'تونس', latitude: 36.8065, longitude: 10.1815, defaultMethod: 'MuslimWorldLeague' },
  { id: 'amman', nameAr: 'عمّان', countryAr: 'الأردن', latitude: 31.9454, longitude: 35.9284, defaultMethod: 'MuslimWorldLeague' },
  { id: 'baghdad', nameAr: 'بغداد', countryAr: 'العراق', latitude: 33.3152, longitude: 44.3661, defaultMethod: 'MuslimWorldLeague' },
  { id: 'doha', nameAr: 'الدوحة', countryAr: 'قطر', latitude: 25.2854, longitude: 51.531, defaultMethod: 'Qatar' },
  { id: 'abudhabi', nameAr: 'أبو ظبي', countryAr: 'الإمارات', latitude: 24.4539, longitude: 54.3773, defaultMethod: 'Dubai' },
  { id: 'kuwait', nameAr: 'مدينة الكويت', countryAr: 'الكويت', latitude: 29.3759, longitude: 47.9774, defaultMethod: 'Kuwait' },
  { id: 'istanbul', nameAr: 'إسطنبول', countryAr: 'تركيا', latitude: 41.0082, longitude: 28.9784, defaultMethod: 'Turkey' },
];
