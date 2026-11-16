const BISMILLAH_PREFIX = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ';

export function stripBismillahFromFirstAyah(
  surahNumber: number,
  ayahNumberInSurah: number,
  text: string
): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumberInSurah !== 1) {
    return text;
  }
  if (text.startsWith(BISMILLAH_PREFIX)) {
    return text.slice(BISMILLAH_PREFIX.length).trim();
  }
  // Fallback for slight Unicode variants
  const altPrefix = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ';
  if (text.startsWith(altPrefix)) {
    return text.slice(altPrefix.length).trim();
  }
  return text;
}

export function normalizeArabicForSearch(input: string): string {
  return input
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Strip tashkeel & Quranic marks
    .replace(/\u0671/g, 'ا') // Alif Wasla -> Alif
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .trim()
    .toLowerCase();
}

export function toArabicIndicDigits(num: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? digits[Number(ch)] : ch))
    .join('');
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}
