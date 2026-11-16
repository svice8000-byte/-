import type { Reciter } from '../types/quran';

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    nameAr: 'مشاري راشد العفاسي',
    nameEn: 'Mishary Rashid Alafasy',
    styleAr: 'حفص عن عاصم · مرتل',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1',
    ayahBaseUrl: 'https://everyayah.com/data/Alafasy_128kbps',
  },
  {
    id: 'husary',
    nameAr: 'محمود خليل الحصري',
    nameEn: 'Mahmoud Khalil Al-Husary',
    styleAr: 'حفص عن عاصم · مجود ومرتل',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r1',
    ayahBaseUrl: 'https://everyayah.com/data/Husary_128kbps',
  },
  {
    id: 'abdulbasit',
    nameAr: 'عبد الباسط عبد الصمد',
    nameEn: 'Abdul Basit Abdul Samad',
    styleAr: 'حفص عن عاصم · مرتل',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3',
    ayahBaseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'minshawi',
    nameAr: 'محمد صديق المنشاوي',
    nameEn: 'Muhammad Siddiq Al-Minshawi',
    styleAr: 'حفص عن عاصم · مرتل',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r1',
    ayahBaseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps',
  },
  {
    id: 'sudais',
    nameAr: 'عبد الرحمن السديس',
    nameEn: 'Abdurrahman As-Sudais',
    styleAr: 'حفص عن عاصم · الحرم المكي',
    surahBaseUrl: 'https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1',
    ayahBaseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps',
  },
];

export function padThreeDigits(num: number): string {
  return String(num).padStart(3, '0');
}

export function getSurahAudioUrl(reciter: Reciter, surahNumber: number): string {
  return `${reciter.surahBaseUrl}/${padThreeDigits(surahNumber)}.mp3`;
}

export function getAyahAudioUrl(reciter: Reciter, surahNumber: number, ayahNumber: number): string {
  return `${reciter.ayahBaseUrl}/${padThreeDigits(surahNumber)}${padThreeDigits(ayahNumber)}.mp3`;
}
