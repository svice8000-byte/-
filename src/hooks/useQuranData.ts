import { useCallback, useEffect, useState } from 'react';
import type { Surah } from '../types/quran';
import { normalizeArabicForSearch } from '../utils/arabicNormalize';

let cachedSurahs: Surah[] | null = null;
let inflightPromise: Promise<Surah[]> | null = null;

async function fetchQuranDataset(): Promise<Surah[]> {
  if (cachedSurahs) return cachedSurahs;
  if (!inflightPromise) {
    inflightPromise = fetch('/data/quran-uthmani.json')
      .then((res) => {
        if (!res.ok) throw new Error('تعذر تحميل المصحف الشريف');
        return res.json() as Promise<{ surahs: Surah[] }>;
      })
      .then((data) => {
        cachedSurahs = data.surahs;
        return cachedSurahs;
      })
      .catch((err) => {
        inflightPromise = null;
        throw err;
      });
  }
  return inflightPromise;
}

export interface AyahSearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
}

export function useQuranData() {
  const [surahs, setSurahs] = useState<Surah[] | null>(cachedSurahs);
  const [loading, setLoading] = useState(!cachedSurahs);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedSurahs) {
      setSurahs(cachedSurahs);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    fetchQuranDataset()
      .then((list) => {
        if (mounted) {
          setSurahs(list);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحميل');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getSurah = useCallback(
    (surahNumber: number): Surah | undefined => {
      return surahs?.find((s) => s.number === surahNumber);
    },
    [surahs]
  );

  const searchAyahs = useCallback(
    (query: string, limit = 30): AyahSearchResult[] => {
      if (!surahs) return [];
      const normalizedQuery = normalizeArabicForSearch(query);
      if (normalizedQuery.length < 2) return [];

      const results: AyahSearchResult[] = [];
      for (const surah of surahs) {
        for (const ayah of surah.ayahs) {
          if (normalizeArabicForSearch(ayah.text).includes(normalizedQuery)) {
            results.push({
              surahNumber: surah.number,
              surahName: surah.name,
              ayahNumber: ayah.numberInSurah,
              text: ayah.text,
            });
            if (results.length >= limit) return results;
          }
        }
      }
      return results;
    },
    [surahs]
  );

  return {
    surahs,
    loading,
    error,
    getSurah,
    searchAyahs,
  };
}
