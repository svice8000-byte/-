import { RECITERS, getSurahAudioUrl } from '../data/reciters';
import { audioStorage } from './quranAudioStorage';
import { loadCachedSurahKeys, saveCachedSurahKeys } from './storage';

const LEGACY_AUDIO_CACHE_NAME = 'abu-hussein-quran-audio-v1';

export function makeCacheKey(reciterId: string, surahNumber: number): string {
  return `${reciterId}:${surahNumber}`;
}

export async function syncCachedSurahKeys(): Promise<string[]> {
  try {
    const keys = await audioStorage.listKeys();
    saveCachedSurahKeys(keys);
    return keys;
  } catch {
    return loadCachedSurahKeys();
  }
}

export async function getOfflineAudioTotalMB(): Promise<number> {
  try {
    const bytes = await audioStorage.getTotalBytes();
    return Number((bytes / (1024 * 1024)).toFixed(1));
  } catch {
    return 0;
  }
}

export async function isSurahAudioCached(
  reciterId: string,
  surahNumber: number
): Promise<boolean> {
  const key = makeCacheKey(reciterId, surahNumber);
  try {
    return await audioStorage.hasAudio(key);
  } catch {
    return false;
  }
}

export async function downloadAndSaveAudio(
  surahId: string | number,
  audioUrl: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<Blob> {
  const response = await fetch(audioUrl, { mode: 'cors', signal });
  if (!response.ok) {
    throw new Error('فشل الاتصال بالخادم لتحميل التلاوة');
  }

  const contentLength = response.headers.get('content-length');
  if (!contentLength || !response.body) {
    const blob = await response.blob();
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      await audioStorage.saveAudio(surahId, blob);
    } catch {
      // Ignore storage quota failures while still returning blob
    }
    onProgress?.(100);
    return blob;
  }

  const total = parseInt(contentLength, 10);
  if (!Number.isFinite(total) || total <= 0) {
    const blob = await response.blob();
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      await audioStorage.saveAudio(surahId, blob);
    } catch {
      // ignore
    }
    onProgress?.(100);
    return blob;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let loaded = 0;

  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      throw new DOMException('Aborted', 'AbortError');
    }
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(new Uint8Array(value));
      loaded += value.length;
      const percentComplete = Math.min(100, Math.round((loaded / total) * 100));
      onProgress?.(percentComplete);
    }
  }

  const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
  try {
    await audioStorage.saveAudio(surahId, audioBlob);
  } catch {
    // Allow playback even if IndexedDB quota is exceeded
  }
  onProgress?.(100);
  return audioBlob;
}

export async function cacheSurahAudio(
  reciterId: string,
  surahNumber: number,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const url = getSurahAudioUrl(reciter, surahNumber);
  const key = makeCacheKey(reciter.id, surahNumber);

  try {
    await downloadAndSaveAudio(key, url, onProgress);
    const existing = loadCachedSurahKeys();
    if (!existing.includes(key)) {
      saveCachedSurahKeys([...existing, key]);
    }
    return true;
  } catch {
    return false;
  }
}

export async function removeCachedSurahAudio(
  reciterId: string,
  surahNumber: number
): Promise<void> {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const key = makeCacheKey(reciter.id, surahNumber);
  try {
    await audioStorage.deleteAudio(key);
  } catch {
    // ignore
  }
  const existing = loadCachedSurahKeys().filter((k) => k !== key);
  saveCachedSurahKeys(existing);
}

export interface ResolveAudioOptions {
  storageKey?: string;
  autoSave?: boolean;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
  onSaved?: () => void;
}

export async function resolvePlayableAudioSrc(
  url: string,
  options: ResolveAudioOptions = {}
): Promise<{ src: string; isObjectUrl: boolean; fromCache: boolean }> {
  const { storageKey, autoSave = false, signal, onProgress, onSaved } = options;

  // 1. Check IndexedDB QuranOfflineDB first
  if (storageKey) {
    try {
      const cachedBlob = await audioStorage.getAudio(storageKey);
      if (cachedBlob) {
        const localObjectURL = URL.createObjectURL(cachedBlob);
        return { src: localObjectURL, isObjectUrl: true, fromCache: true };
      }
    } catch {
      // Continue to fallback checks
    }
  }

  // 2. Check legacy CacheStorage if present
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(LEGACY_AUDIO_CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        const blob = await cached.blob();
        const objectUrl = URL.createObjectURL(blob);
        return { src: objectUrl, isObjectUrl: true, fromCache: true };
      }
    } catch {
      // Continue
    }
  }

  // 3. Stream download with ReadableStream progress, save into IndexedDB, and play ObjectURL
  if (autoSave && storageKey) {
    try {
      const audioBlob = await downloadAndSaveAudio(storageKey, url, onProgress, signal);
      const existing = loadCachedSurahKeys();
      if (!existing.includes(storageKey)) {
        saveCachedSurahKeys([...existing, storageKey]);
      }
      onSaved?.();

      const onlineObjectURL = URL.createObjectURL(audioBlob);
      return { src: onlineObjectURL, isObjectUrl: true, fromCache: false };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      // Graceful fallback to direct stream URL
    }
  }

  return { src: url, isObjectUrl: false, fromCache: false };
}

export async function clearAllOfflineAudioCache(): Promise<void> {
  try {
    await audioStorage.clearAll();
  } catch {
    // ignore
  }
  if (typeof caches !== 'undefined') {
    try {
      await caches.delete(LEGACY_AUDIO_CACHE_NAME);
    } catch {
      // ignore
    }
  }
  saveCachedSurahKeys([]);
}
