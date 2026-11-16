export type AppTab = 'quran' | 'prayers' | 'roqya' | 'duas' | 'names';

export type ThemeMode = 'light' | 'dark';

export type PlaybackMode = 'sequential' | 'shuffle' | 'repeat-one';

export type PrayerMethodId =
  | 'Morocco'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'MuslimWorldLeague'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'Karachi'
  | 'Turkey'
  | 'NorthAmerica';

export interface PrayerCity {
  id: string;
  nameAr: string;
  countryAr: string;
  latitude: number;
  longitude: number;
  defaultMethod: PrayerMethodId;
}

export interface PrayerLocationConfig {
  cityId: string;
  label: string;
  latitude: number;
  longitude: number;
  method: PrayerMethodId;
  madhab: 'shafi' | 'hanafi';
  hour12: boolean;
  isCustomGps: boolean;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
  sajda: boolean;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  nameAr: string;
  nameEn: string;
  styleAr: string;
  surahBaseUrl: string;
  ayahBaseUrl: string;
}

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  excerpt: string;
  createdAt: number;
}

export interface AudioTrack {
  id: string;
  kind: 'surah' | 'ayah' | 'roqya';
  title: string;
  subtitle: string;
  url: string;
  surahNumber?: number;
  ayahNumber?: number;
  reciterId: string;
}

export interface RoqyaItem {
  id: string;
  title: string;
  source: string;
  category: 'quran' | 'sunnah';
  text: string;
  repeatRecommended: number;
  note: string;
  audioSpecs?: {
    surahNumber: number;
    ayahs: number[];
  };
}

export type DuaCategory =
  | 'morning'
  | 'evening'
  | 'quranic'
  | 'prophetic'
  | 'sleep'
  | 'relief';

export interface DuaItem {
  id: string;
  title: string;
  category: DuaCategory;
  text: string;
  source: string;
  repeatCount: number;
  virtue?: string;
}

export interface NameOfAllah {
  id: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  description: string;
  theme: 'mercy' | 'majesty' | 'knowledge' | 'provision' | 'guidance';
}
