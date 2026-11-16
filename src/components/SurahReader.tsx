import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark as BookmarkIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  Minus,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { SURAH_INDEX } from '../data/surahIndex';
import type { Bookmark, Surah } from '../types/quran';
import { stripBismillahFromFirstAyah, toArabicIndicDigits } from '../utils/arabicNormalize';
import { makeCacheKey } from '../utils/offlineAudioCache';

interface SurahReaderProps {
  surah: Surah | undefined;
  loading: boolean;
  error: string | null;
  highlightAyah?: number | null;
  fontSize: number;
  onChangeFontSize: (next: number) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
  onSelectSurah: (surahNumber: number) => void;
  onBackToIndex: () => void;
}

export const SurahReader: React.FC<SurahReaderProps> = ({
  surah,
  loading,
  error,
  highlightAyah,
  fontSize,
  onChangeFontSize,
  bookmarks,
  onToggleBookmark,
  onSelectSurah,
  onBackToIndex,
}) => {
  const {
    reciter,
    isPlaying,
    activeTrack,
    downloadingKeys,
    downloadProgress,
    downloadNotice,
    playSurah,
    playAyah,
    togglePlayPause,
    downloadSurahOffline,
    deleteSurahOffline,
    isSurahCachedForReciter,
  } = useAudioPlayer();

  const [viewMode, setViewMode] = useState<'ayahs' | 'mushaf'>('ayahs');
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});

  // Scroll to highlighted or currently playing ayah
  const activePlayingAyah =
    surah &&
    activeTrack?.kind === 'ayah' &&
    activeTrack.surahNumber === surah.number
      ? activeTrack.ayahNumber
      : null;

  const targetAyah = activePlayingAyah ?? highlightAyah ?? null;

  useEffect(() => {
    if (targetAyah && ayahRefs.current[targetAyah]) {
      ayahRefs.current[targetAyah]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [targetAyah, surah?.number]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#B88A1E] dark:text-[#D4AF37]" />
        <p className="text-sm text-[#4A5D56] dark:text-[#9FB3AC]">جاري تهيئة السورة الشريفة...</p>
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-base font-medium text-[#10241E] dark:text-[#F5F2EB]">
          {error || 'تعذر العثور على السورة المطلوبة'}
        </p>
        <button
          type="button"
          onClick={onBackToIndex}
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-xl bg-[#0C4A3E] text-white text-sm font-medium cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى فهرس السور</span>
        </button>
      </div>
    );
  }

  const isThisSurahPlaying =
    isPlaying &&
    activeTrack?.kind === 'surah' &&
    activeTrack.surahNumber === surah.number;

  const isThisSurahActive =
    activeTrack?.kind === 'surah' && activeTrack.surahNumber === surah.number;

  const cacheKey = makeCacheKey(reciter.id, surah.number);
  const isDownloading = downloadingKeys.includes(cacheKey);
  const progress = downloadProgress[cacheKey] ?? 0;
  const isCached = isSurahCachedForReciter(surah.number);
  const showBismillahBanner = surah.number !== 1 && surah.number !== 9;

  const handleCopyAyah = async (ayahNum: number, text: string) => {
    try {
      await navigator.clipboard.writeText(`${text} ﴿${toArabicIndicDigits(ayahNum)}﴾ [${surah.name}]`);
      setCopiedAyah(ayahNum);
      setTimeout(() => setCopiedAyah(null), 1800);
    } catch {
      // ignore
    }
  };

  const prevSurahMeta = surah.number > 1 ? SURAH_INDEX[surah.number - 2] : null;
  const nextSurahMeta = surah.number < 114 ? SURAH_INDEX[surah.number] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Reader Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E6E2D8] dark:border-[#1A352E]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToIndex}
            className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] bg-white dark:bg-[#0D1F1B] text-sm font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowRight className="w-4 h-4" />
            <span>فهرس السور</span>
          </button>

          <div>
            <h1 className="font-quran text-xl sm:text-2xl font-bold text-[#10241E] dark:text-[#F5F2EB] leading-tight">
              {surah.name}
            </h1>
            <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC] tabular-nums">
              {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} ·{' '}
              {toArabicIndicDigits(surah.ayahs.length)} آية · ترتيب {surah.number}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Font size adjuster */}
          <div className="inline-flex items-center rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] bg-white dark:bg-[#0D1F1B]">
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.max(18, fontSize - 2))}
              aria-label="تصغير الخط"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A5D56] dark:text-[#9FB3AC] hover:text-[#10241E] dark:hover:text-[#F5F2EB] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium text-[#4A5D56] dark:text-[#9FB3AC] tabular-nums select-none">
              {fontSize}
            </span>
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.min(40, fontSize + 2))}
              aria-label="تكبير الخط"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A5D56] dark:text-[#9FB3AC] hover:text-[#10241E] dark:hover:text-[#F5F2EB] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* View mode toggle */}
          <div className="inline-flex p-1 rounded-xl bg-[#EFECE3] dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E]">
            <button
              type="button"
              onClick={() => setViewMode('ayahs')}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'ayahs'
                  ? 'bg-white dark:bg-[#143029] text-[#0C4A3E] dark:text-[#D4AF37] shadow-xs'
                  : 'text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              آية بآية
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mushaf')}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'mushaf'
                  ? 'bg-white dark:bg-[#143029] text-[#0C4A3E] dark:text-[#D4AF37] shadow-xs'
                  : 'text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              قراءة المصحف
            </button>
          </div>

          {/* Offline cache button */}
          <button
            type="button"
            onClick={() => {
              if (isCached) {
                void deleteSurahOffline(surah.number);
              } else if (!isDownloading) {
                void downloadSurahOffline(surah.number);
              }
            }}
            disabled={isDownloading}
            title={isCached ? 'إزالة التلاوة المحفوظة' : 'حفظ السورة للاستماع دون إنترنت'}
            className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isCached
                ? 'border-[#0C4A3E]/30 dark:border-[#D4AF37]/40 bg-[#0C4A3E]/10 dark:bg-[#D4AF37]/10 text-[#0C4A3E] dark:text-[#D4AF37]'
                : 'border-[#E6E2D8] dark:border-[#1A352E] bg-white dark:bg-[#0D1F1B] text-[#4A5D56] dark:text-[#9FB3AC] hover:border-[#D4AF37]/60'
            }`}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCached ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isDownloading
                ? `جاري الحفظ ${progress > 0 ? `${progress}%` : '...'}`
                : isCached
                  ? 'محفوظة محليًا'
                  : 'حفظ بلا إنترنت'}
            </span>
          </button>

          {/* Play Full Surah */}
          <button
            type="button"
            onClick={() => {
              if (isThisSurahActive) {
                void togglePlayPause();
              } else {
                void playSurah(surah.number);
              }
            }}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411] text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
          >
            {isThisSurahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isThisSurahPlaying ? 'إيقاف مؤقت' : 'تشغيل السورة'}</span>
          </button>
        </div>
      </div>

      {/* Inline Download Progress / Status Bar */}
      {(isDownloading ||
        (downloadNotice && downloadNotice.surahNumber === surah.number)) && (
        <div className="w-full p-4 bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] rounded-2xl">
          <div className="flex items-center justify-between mb-2 text-sm font-medium text-[#10241E] dark:text-[#F5F2EB]">
            <span>
              {downloadNotice?.surahNumber === surah.number
                ? downloadNotice.message
                : 'جاري التحميل والحفظ محليًا...'}
            </span>
            {downloadNotice?.status !== 'error' && (
              <span className="font-bold text-[#B88A1E] dark:text-[#D4AF37] tabular-nums">
                {downloadNotice?.surahNumber === surah.number
                  ? downloadNotice.percent
                  : progress}
                %
              </span>
            )}
          </div>
          {downloadNotice?.status !== 'error' && (
            <div className="w-full bg-[#EFECE3] dark:bg-[#1A352E] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#D4AF37] h-2.5 rounded-full transition-all duration-150"
                style={{
                  width: `${
                    downloadNotice?.surahNumber === surah.number
                      ? downloadNotice.percent
                      : progress
                  }%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Ornamental Surah Banner & Bismillah */}
      <div className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] px-6 py-7 text-center space-y-3">
        <div className="inline-flex items-center justify-center gap-3 text-[#B88A1E] dark:text-[#D4AF37]">
          <span className="h-px w-10 bg-[#D4AF37]/40" />
          <span className="font-quran text-2xl sm:text-3xl font-bold text-[#10241E] dark:text-[#F5F2EB]">
            {surah.name}
          </span>
          <span className="h-px w-10 bg-[#D4AF37]/40" />
        </div>
        {showBismillahBanner && (
          <p className="font-quran text-2xl sm:text-3xl text-[#0C4A3E] dark:text-[#D4AF37] pt-2 leading-loose">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        )}
      </div>

      {/* Verses Rendering */}
      {viewMode === 'mushaf' ? (
        <article className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 sm:p-10">
          <p
            className="font-quran text-right text-[#10241E] dark:text-[#F5F2EB]"
            style={{ fontSize: `${fontSize}px`, lineHeight: 2.25 }}
          >
            {surah.ayahs.map((ayah) => {
              const cleanText = stripBismillahFromFirstAyah(
                surah.number,
                ayah.numberInSurah,
                ayah.text
              );
              const isCurrentAyah = activePlayingAyah === ayah.numberInSurah;
              return (
                <span
                  key={ayah.number}
                  ref={(el) => {
                    ayahRefs.current[ayah.numberInSurah] = el;
                  }}
                  onClick={() => void playAyah(surah.number, ayah.numberInSurah)}
                  className={`inline cursor-pointer rounded-md px-1 transition-colors ${
                    isCurrentAyah
                      ? 'bg-[#D4AF37]/20 text-[#0C4A3E] dark:text-[#F5E09B]'
                      : 'hover:bg-[#D4AF37]/10'
                  }`}
                >
                  {cleanText}{' '}
                  <span className="inline-flex items-center justify-center text-[#B88A1E] dark:text-[#D4AF37] text-[0.78em] mx-1 select-none">
                    ﴿{toArabicIndicDigits(ayah.numberInSurah)}﴾
                  </span>{' '}
                </span>
              );
            })}
          </p>
        </article>
      ) : (
        <div className="space-y-3">
          {surah.ayahs.map((ayah) => {
            const cleanText = stripBismillahFromFirstAyah(
              surah.number,
              ayah.numberInSurah,
              ayah.text
            );
            const isBookmarked = bookmarks.some(
              (b) => b.surahNumber === surah.number && b.ayahNumber === ayah.numberInSurah
            );
            const isCurrentAyah = activePlayingAyah === ayah.numberInSurah;
            const isAyahPlayingNow = isCurrentAyah && isPlaying;

            return (
              <article
                key={ayah.number}
                ref={(el) => {
                  ayahRefs.current[ayah.numberInSurah] = el;
                }}
                className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
                  isCurrentAyah
                    ? 'bg-[#F6F1E2] dark:bg-[#132C25] border-[#D4AF37]/60'
                    : 'bg-white dark:bg-[#0D1F1B] border-[#E6E2D8] dark:border-[#1A352E]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-[#EFECE3] dark:border-[#163029]">
                  <div className="flex items-center gap-2 text-xs text-[#4A5D56] dark:text-[#9FB3AC] tabular-nums">
                    <span className="font-semibold text-[#0C4A3E] dark:text-[#D4AF37]">
                      الآية {toArabicIndicDigits(ayah.numberInSurah)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>الجزء {toArabicIndicDigits(ayah.juz)}</span>
                    <span aria-hidden="true">·</span>
                    <span>صفحة {toArabicIndicDigits(ayah.page)}</span>
                    {ayah.sajda && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#B88A1E] dark:text-[#D4AF37] font-medium">سجدة</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCurrentAyah) {
                          void togglePlayPause();
                        } else {
                          void playAyah(surah.number, ayah.numberInSurah);
                        }
                      }}
                      aria-label={isAyahPlayingNow ? 'إيقاف الآية' : 'استماع للآية'}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#0C4A3E] dark:text-[#D4AF37] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {isAyahPlayingNow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onToggleBookmark({
                          surahNumber: surah.number,
                          surahName: surah.name,
                          ayahNumber: ayah.numberInSurah,
                          excerpt: cleanText.slice(0, 90),
                          createdAt: Date.now(),
                        })
                      }
                      aria-label={isBookmarked ? 'إزالة العلامة المرجعية' : 'حفظ علامة مرجعية'}
                      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-[#B88A1E] dark:text-[#D4AF37]'
                          : 'text-[#4A5D56] dark:text-[#9FB3AC]'
                      }`}
                    >
                      <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleCopyAyah(ayah.numberInSurah, cleanText)}
                      aria-label="نسخ الآية"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {copiedAyah === ayah.numberInSurah ? (
                        <Check className="w-4 h-4 text-[#0C4A3E] dark:text-[#D4AF37]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p
                  className="font-quran text-right text-[#10241E] dark:text-[#F5F2EB]"
                  style={{ fontSize: `${fontSize}px`, lineHeight: 2.15 }}
                >
                  {cleanText}{' '}
                  <span className="text-[#B88A1E] dark:text-[#D4AF37] text-[0.8em] select-none">
                    ﴿{toArabicIndicDigits(ayah.numberInSurah)}﴾
                  </span>
                </p>
              </article>
            );
          })}
        </div>
      )}

      {/* Surah Footer Navigation */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-[#E6E2D8] dark:border-[#1A352E]">
        {prevSurahMeta ? (
          <button
            type="button"
            onClick={() => onSelectSurah(prevSurahMeta.number)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] bg-white dark:bg-[#0D1F1B] text-sm font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37]" />
            <span>السابقة: {prevSurahMeta.name}</span>
          </button>
        ) : (
          <div />
        )}

        {nextSurahMeta ? (
          <button
            type="button"
            onClick={() => onSelectSurah(nextSurahMeta.number)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] bg-white dark:bg-[#0D1F1B] text-sm font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 transition-colors cursor-pointer"
          >
            <span>التالية: {nextSurahMeta.name}</span>
            <ChevronLeft className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37]" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
