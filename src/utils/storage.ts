import type { Bookmark, PlaybackMode, PrayerLocationConfig, ThemeMode } from '../types/quran';

const KEYS = {
  THEME: 'abu_hussein_theme',
  RECITER: 'abu_hussein_reciter',
  PLAYBACK_MODE: 'abu_hussein_playback_mode',
  FONT_SIZE: 'abu_hussein_font_size',
  LAST_READ: 'abu_hussein_last_read',
  BOOKMARKS: 'abu_hussein_bookmarks',
  DUA_COUNTERS: 'abu_hussein_dua_counters',
  CACHED_SURAHS: 'abu_hussein_cached_surahs',
  AUTO_CACHE_ON_PLAY: 'abu_hussein_auto_cache_on_play',
  PRAYER_CONFIG: 'abu_hussein_prayer_config',
} as const;

export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  updatedAt: number;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or restricted
  }
}

export function loadTheme(): ThemeMode {
  try {
    const val = localStorage.getItem(KEYS.THEME);
    if (val === 'dark' || val === 'light') return val;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // ignore
  }
  return 'light';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function loadReciterId(): string {
  try {
    return localStorage.getItem(KEYS.RECITER) || 'alafasy';
  } catch {
    return 'alafasy';
  }
}

export function saveReciterId(reciterId: string): void {
  try {
    localStorage.setItem(KEYS.RECITER, reciterId);
  } catch {
    // ignore
  }
}

export function loadPlaybackMode(): PlaybackMode {
  try {
    const val = localStorage.getItem(KEYS.PLAYBACK_MODE);
    if (val === 'sequential' || val === 'shuffle' || val === 'repeat-one') return val;
  } catch {
    // ignore
  }
  return 'sequential';
}

export function savePlaybackMode(mode: PlaybackMode): void {
  try {
    localStorage.setItem(KEYS.PLAYBACK_MODE, mode);
  } catch {
    // ignore
  }
}

export function loadFontSize(): number {
  const size = safeGet<number>(KEYS.FONT_SIZE, 26);
  return Math.min(40, Math.max(18, size));
}

export function saveFontSize(size: number): void {
  safeSet(KEYS.FONT_SIZE, size);
}

export function loadLastRead(): LastReadPosition {
  return safeGet<LastReadPosition>(KEYS.LAST_READ, {
    surahNumber: 1,
    ayahNumber: 1,
    updatedAt: Date.now(),
  });
}

export function saveLastRead(surahNumber: number, ayahNumber: number): void {
  safeSet(KEYS.LAST_READ, {
    surahNumber,
    ayahNumber,
    updatedAt: Date.now(),
  });
}

export function loadBookmarks(): Bookmark[] {
  return safeGet<Bookmark[]>(KEYS.BOOKMARKS, []);
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  safeSet(KEYS.BOOKMARKS, bookmarks);
}

export function loadDuaCounters(): Record<string, number> {
  return safeGet<Record<string, number>>(KEYS.DUA_COUNTERS, {});
}

export function saveDuaCounters(counters: Record<string, number>): void {
  safeSet(KEYS.DUA_COUNTERS, counters);
}

export function loadCachedSurahKeys(): string[] {
  return safeGet<string[]>(KEYS.CACHED_SURAHS, []);
}

export function saveCachedSurahKeys(keys: string[]): void {
  safeSet(KEYS.CACHED_SURAHS, keys);
}

export function loadAutoCacheOnPlay(): boolean {
  return safeGet<boolean>(KEYS.AUTO_CACHE_ON_PLAY, true);
}

export function saveAutoCacheOnPlay(enabled: boolean): void {
  safeSet(KEYS.AUTO_CACHE_ON_PLAY, enabled);
}

export function loadPrayerConfig(): PrayerLocationConfig {
  return safeGet<PrayerLocationConfig>(KEYS.PRAYER_CONFIG, {
    cityId: 'casablanca',
    label: 'الدار البيضاء، المغرب',
    latitude: 33.5731,
    longitude: -7.5898,
    method: 'Morocco',
    madhab: 'shafi',
    hour12: false,
    isCustomGps: false,
  });
}

export function savePrayerConfig(config: PrayerLocationConfig): void {
  safeSet(KEYS.PRAYER_CONFIG, config);
}
