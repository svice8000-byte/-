import React, { useMemo, useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  BookOpen,
  Download,
  Loader2,
  Moon,
  Pause,
  Play,
  Search,
  Sun,
  Trash2,
  Volume2,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { RECITERS } from '../data/reciters';
import { SURAH_INDEX } from '../data/surahIndex';
import type { AyahSearchResult } from '../hooks/useQuranData';
import type { Bookmark, Surah, ThemeMode } from '../types/quran';
import { normalizeArabicForSearch, toArabicIndicDigits } from '../utils/arabicNormalize';
import { makeCacheKey } from '../utils/offlineAudioCache';
import type { LastReadPosition } from '../utils/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { SurahReader } from './SurahReader';

interface QuranSectionProps {
  surahs: Surah[] | null;
  loading: boolean;
  error: string | null;
  searchAyahs: (query: string, limit?: number) => AyahSearchResult[];
  selectedSurahNumber: number | null;
  highlightAyah: number | null;
  onOpenSurah: (surahNumber: number, ayahNumber?: number) => void;
  onCloseSurah: () => void;
  lastRead: LastReadPosition;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

type SurahFilter = 'all' | 'Meccan' | 'Medinan' | 'cached' | 'bookmarks';

export const QuranSection: React.FC<QuranSectionProps> = ({
  surahs,
  loading,
  error,
  searchAyahs,
  selectedSurahNumber,
  highlightAyah,
  onOpenSurah,
  onCloseSurah,
  lastRead,
  bookmarks,
  onToggleBookmark,
  fontSize,
  onChangeFontSize,
  theme,
  onToggleTheme,
}) => {
  const {
    reciter,
    setReciterId,
    isPlaying,
    activeTrack,
    downloadingKeys,
    downloadProgress,
    playSurah,
    togglePlayPause,
    downloadSurahOffline,
    deleteSurahOffline,
    isSurahCachedForReciter,
  } = useAudioPlayer();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SurahFilter>('all');
  const [heroImageError, setHeroImageError] = useState(false);

  const selectedSurah = useMemo(() => {
    if (!selectedSurahNumber || !surahs) return undefined;
    return surahs.find((s) => s.number === selectedSurahNumber);
  }, [selectedSurahNumber, surahs]);

  const filteredSurahs = useMemo(() => {
    const normQuery = normalizeArabicForSearch(query);
    return SURAH_INDEX.filter((item) => {
      if (filter === 'Meccan' && item.revelationType !== 'Meccan') return false;
      if (filter === 'Medinan' && item.revelationType !== 'Medinan') return false;
      if (filter === 'cached' && !isSurahCachedForReciter(item.number)) return false;
      if (!normQuery) return true;
      return (
        normalizeArabicForSearch(item.name).includes(normQuery) ||
        item.englishName.toLowerCase().includes(normQuery) ||
        String(item.number) === normQuery
      );
    });
  }, [filter, isSurahCachedForReciter, query]);

  const ayahMatches = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchAyahs(query, 24);
  }, [query, searchAyahs]);

  const lastReadMeta = useMemo(
    () => SURAH_INDEX.find((s) => s.number === lastRead.surahNumber) || SURAH_INDEX[0],
    [lastRead.surahNumber]
  );

  if (selectedSurahNumber !== null) {
    return (
      <SurahReader
        surah={selectedSurah}
        loading={loading}
        error={error}
        highlightAyah={highlightAyah}
        fontSize={fontSize}
        onChangeFontSize={onChangeFontSize}
        bookmarks={bookmarks}
        onToggleBookmark={onToggleBookmark}
        onSelectSurah={(num) => onOpenSurah(num)}
        onBackToIndex={onCloseSurah}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Sanctuary Split Banner */}
      <section className="rounded-3xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37]">
                مصحف رقمي هادئ · يعمل دون إنترنت وبخصوصية تامة
              </p>
              <h1
                className="font-quran text-3xl sm:text-4xl lg:text-5xl font-bold text-[#10241E] dark:text-[#F5F2EB] leading-snug"
                style={{ textWrap: 'balance' }}
              >
                القرآن الكريم لأبي الحسين
              </h1>
              <p className="text-sm sm:text-base text-[#4A5D56] dark:text-[#9FB3AC] max-w-2xl leading-relaxed">
                تلاوة متواصلة بانتقال تلقائي بين السور، وخط عربي واضح، مع حفظ السور للاستماع
                بدون إنترنت وتشغيلٍ مستمر في الخلفية — دون أي تتبع أو جمع بيانات.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenSurah(lastReadMeta.number, lastRead.ayahNumber)}
                className="inline-flex items-center gap-2.5 min-h-[48px] px-5 py-2.5 rounded-xl bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411] text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>متابعة القراءة: {lastReadMeta.name}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeTrack) {
                    void togglePlayPause();
                  } else {
                    void playSurah(lastReadMeta.number);
                  }
                }}
                className="inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] bg-[#FAF8F4] dark:bg-[#071411] text-sm font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isPlaying && activeTrack ? (
                  <Pause className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37]" />
                ) : (
                  <Play className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37]" />
                )}
                <span>{isPlaying && activeTrack ? 'إيقاف التلاوة' : 'استماع متواصل'}</span>
              </button>

              <PWAInstallButton variant="subtle" />
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full bg-[#0C4A3E]">
            {!heroImageError ? (
              <img
                src="/src/assets/images/mushaf_hero_sanctuary_1794821183411.jpg"
                alt="عمارة إسلامية هادئة بنور الصباح"
                referrerPolicy="no-referrer"
                onError={() => setHeroImageError(true)}
                className="w-full h-full object-cover lg:absolute lg:inset-0"
              />
            ) : (
              <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-gradient-to-br from-[#0C4A3E] to-[#071411] p-8 text-center">
                <span className="font-quran text-2xl text-[#D4AF37]">
                  ﴿ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ ﴾
                </span>
              </div>
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#071411]/70 via-[#071411]/20 to-transparent"
            />
            <div className="absolute bottom-4 right-5 left-5 text-white">
              <p className="font-quran text-lg sm:text-xl leading-relaxed">
                ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Controls: Search, Reciter, Theme, Filter Tabs */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-[#4A5D56] dark:text-[#9FB3AC] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم السورة، رقمها، أو بكلمات الآيات..."
              className="w-full min-h-[46px] pr-11 pl-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] text-sm text-[#10241E] dark:text-[#F5F2EB] placeholder:text-[#4A5D56]/70 dark:placeholder:text-[#9FB3AC]/70 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Reciter selector + Quick Theme Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] text-sm">
              <Volume2 className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37] shrink-0" />
              <select
                value={reciter.id}
                onChange={(e) => setReciterId(e.target.value)}
                aria-label="اختيار القارئ"
                className="bg-transparent text-sm font-medium text-[#10241E] dark:text-[#F5F2EB] focus:outline-none cursor-pointer"
              >
                {RECITERS.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                    className="bg-white dark:bg-[#0D1F1B] text-[#10241E] dark:text-[#F5F2EB]"
                  >
                    {r.nameAr}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] text-sm font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 transition-colors cursor-pointer whitespace-nowrap"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-[#D4AF37]" />
                  <span>نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#0C4A3E]" />
                  <span>ليلي</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Segmented Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: `كل السور (${SURAH_INDEX.length})` },
              { id: 'Meccan', label: 'مكية' },
              { id: 'Medinan', label: 'مدنية' },
              { id: 'cached', label: 'محفوظة بلا إنترنت' },
              { id: 'bookmarks', label: `العلامات المرجعية (${bookmarks.length})` },
            ] as { id: SurahFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                  : 'bg-white dark:bg-[#0D1F1B] text-[#4A5D56] dark:text-[#9FB3AC] border border-[#E6E2D8] dark:border-[#1A352E] hover:text-[#10241E] dark:hover:text-[#F5F2EB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Ayah Search Results (when query >= 2 chars) */}
      {ayahMatches.length > 0 && filter !== 'bookmarks' && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">
            نتائج مطابقة في آيات القرآن الكريم ({toArabicIndicDigits(ayahMatches.length)})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ayahMatches.map((match) => (
              <button
                key={`${match.surahNumber}-${match.ayahNumber}`}
                type="button"
                onClick={() => onOpenSurah(match.surahNumber, match.ayahNumber)}
                className="text-right rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-4 hover:border-[#D4AF37]/60 transition-colors cursor-pointer space-y-2"
              >
                <div className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37] tabular-nums">
                  {match.surahName} · الآية {toArabicIndicDigits(match.ayahNumber)}
                </div>
                <p className="font-quran text-lg leading-loose text-[#10241E] dark:text-[#F5F2EB] line-clamp-2">
                  {match.text}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Bookmarks Tab View */}
      {filter === 'bookmarks' ? (
        <section className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-10 text-center space-y-2">
              <BookmarkIcon className="w-7 h-7 mx-auto text-[#B88A1E] dark:text-[#D4AF37]" />
              <p className="text-sm font-medium text-[#10241E] dark:text-[#F5F2EB]">
                لا توجد علامات مرجعية محفوظة بعد
              </p>
              <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
                افتح أي سورة واضغط على أيقونة الحفظ بجانب الآية للعودة إليها سريعًا (تُحفظ محليًا على جهازك فقط).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bm) => (
                <div
                  key={`${bm.surahNumber}-${bm.ayahNumber}`}
                  className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-5 flex flex-col justify-between gap-4"
                >
                  <button
                    type="button"
                    onClick={() => onOpenSurah(bm.surahNumber, bm.ayahNumber)}
                    className="text-right space-y-2 cursor-pointer"
                  >
                    <p className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37] tabular-nums">
                      {bm.surahName} · الآية {toArabicIndicDigits(bm.ayahNumber)}
                    </p>
                    <p className="font-quran text-xl leading-loose text-[#10241E] dark:text-[#F5F2EB]">
                      {bm.excerpt}...
                    </p>
                  </button>
                  <div className="flex items-center justify-between pt-3 border-t border-[#EFECE3] dark:border-[#163029]">
                    <button
                      type="button"
                      onClick={() => onOpenSurah(bm.surahNumber, bm.ayahNumber)}
                      className="text-xs font-medium text-[#0C4A3E] dark:text-[#D4AF37] hover:underline cursor-pointer min-h-[36px]"
                    >
                      الانتقال إلى الآية
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(bm)}
                      className="inline-flex items-center gap-1 text-xs text-[#4A5D56] dark:text-[#9FB3AC] hover:text-red-600 cursor-pointer min-h-[36px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إزالة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* 114 Surah Grid */
        <section>
          {filteredSurahs.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-10 text-center space-y-2">
              <p className="text-sm font-medium text-[#10241E] dark:text-[#F5F2EB]">
                {filter === 'cached'
                  ? `لم يتم حفظ أي سورة محليًا للقارئ ${reciter.nameAr} حتى الآن`
                  : 'لا توجد سورة مطابقة لعبارة البحث'}
              </p>
              <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
                {filter === 'cached'
                  ? 'اضغط على أيقونة التحميل بجانب أي سورة لحفظها للاستماع دون اتصال بالإنترنت.'
                  : 'جرّب البحث باسم سورة أخرى أو امسح مربع البحث.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurahs.map((item) => {
                const isThisPlaying =
                  isPlaying &&
                  activeTrack?.kind === 'surah' &&
                  activeTrack.surahNumber === item.number;
                const isThisActive =
                  activeTrack?.kind === 'surah' && activeTrack.surahNumber === item.number;
                const cacheKey = makeCacheKey(reciter.id, item.number);
                const isCached = isSurahCachedForReciter(item.number);
                const isDownloading = downloadingKeys.includes(cacheKey);
                const progress = downloadProgress[cacheKey] ?? 0;

                return (
                  <div
                    key={item.number}
                    className={`rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-3 transition-colors ${
                      isThisActive
                        ? 'bg-[#F6F1E2] dark:bg-[#132C25] border-[#D4AF37]/60'
                        : 'bg-white dark:bg-[#0D1F1B] border-[#E6E2D8] dark:border-[#1A352E] hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenSurah(item.number)}
                      className="flex items-center gap-3.5 text-right flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#0C4A3E] dark:text-[#D4AF37] tabular-nums">
                          {item.number}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-quran text-xl font-bold text-[#10241E] dark:text-[#F5F2EB] truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC] tabular-nums truncate">
                          {item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} ·{' '}
                          {toArabicIndicDigits(item.ayahCount)} آية
                          {isCached ? ' · محفوظة' : ''}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCached) {
                            void deleteSurahOffline(item.number);
                          } else if (!isDownloading) {
                            void downloadSurahOffline(item.number);
                          }
                        }}
                        disabled={isDownloading}
                        aria-label={isCached ? 'حذف النسخة المحفوظة' : 'حفظ للاستماع بدون إنترنت'}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                          isCached
                            ? 'text-[#0C4A3E] dark:text-[#D4AF37] bg-[#0C4A3E]/10 dark:bg-[#D4AF37]/10'
                            : 'text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {isDownloading ? (
                          <span className="text-[11px] font-bold text-[#B88A1E] dark:text-[#D4AF37] tabular-nums">
                            {progress > 0 ? `${progress}%` : <Loader2 className="w-4 h-4 animate-spin" />}
                          </span>
                        ) : isCached ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isThisActive) {
                            void togglePlayPause();
                          } else {
                            void playSurah(item.number);
                          }
                        }}
                        aria-label={isThisPlaying ? 'إيقاف التلاوة' : `تشغيل ${item.name}`}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#0C4A3E]/10 dark:bg-[#D4AF37]/15 text-[#0C4A3E] dark:text-[#D4AF37] hover:bg-[#0C4A3E] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#071411] transition-colors cursor-pointer"
                      >
                        {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
