import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { RECITERS } from '../data/reciters';
import type { PlaybackMode } from '../types/quran';
import { formatDuration } from '../utils/arabicNormalize';
import { makeCacheKey } from '../utils/offlineAudioCache';

interface AudioPlayerBarProps {
  onOpenSurahFromPlayer?: (surahNumber: number, ayahNumber?: number) => void;
}

const MODE_LABELS: Record<PlaybackMode, string> = {
  sequential: 'تشغيل متتابع للسور',
  shuffle: 'تشغيل عشوائي',
  'repeat-one': 'تكرار السورة الحالية',
};

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ onOpenSurahFromPlayer }) => {
  const {
    reciter,
    setReciterId,
    playbackMode,
    setPlaybackMode,
    isPlaying,
    isLoading,
    error,
    activeTrack,
    currentTime,
    duration,
    playbackRate,
    setPlaybackRate,
    volume,
    setVolume,
    isPlayerExpanded,
    setIsPlayerExpanded,
    downloadProgress,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    stopAudio,
  } = useAudioPlayer();

  if (!activeTrack) return null;

  const activeCacheKey =
    activeTrack.kind === 'surah' && activeTrack.surahNumber
      ? makeCacheKey(reciter.id, activeTrack.surahNumber)
      : null;
  const activeDownloadPct =
    activeCacheKey && typeof downloadProgress[activeCacheKey] === 'number'
      ? downloadProgress[activeCacheKey]
      : null;

  const cycleMode = () => {
    const order: PlaybackMode[] = ['sequential', 'shuffle', 'repeat-one'];
    const idx = order.indexOf(playbackMode);
    setPlaybackMode(order[(idx + 1) % order.length]);
  };

  const ModeIcon =
    playbackMode === 'shuffle'
      ? Shuffle
      : playbackMode === 'repeat-one'
        ? Repeat1
        : Repeat;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      {/* Expanded Full-Sanctuary Audio Sheet */}
      {isPlayerExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsPlayerExpanded(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FAF8F4] dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37]">
                مشغل التلاوة المتواصلة · يعمل في الخلفية
              </span>
              <button
                type="button"
                onClick={() => setIsPlayerExpanded(false)}
                aria-label="تصغير المشغل"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Artwork + Track Title */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#D4AF37]/40 bg-[#0B2420] shrink-0">
                <img
                  src="/assets/aistudio/Ic_ne_coranique_islamique_dor_e_et_verte_5b3d814c.png"
                  alt="شعار القرآن الكريم لأبي الحسين"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="font-quran text-2xl font-bold text-[#10241E] dark:text-[#F5F2EB] truncate">
                  {activeTrack.title}
                </h2>
                <p className="text-sm text-[#4A5D56] dark:text-[#9FB3AC] truncate tabular-nums">
                  {activeDownloadPct !== null
                    ? `جاري التحميل والحفظ في جهازك... ${activeDownloadPct}%`
                    : `${activeTrack.subtitle}${activeTrack.fromCache ? ' · من الذاكرة المحلية' : ''}`}
                </p>
                {activeTrack.surahNumber && onOpenSurahFromPlayer && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSurahFromPlayer(activeTrack.surahNumber!, activeTrack.ayahNumber);
                      setIsPlayerExpanded(false);
                    }}
                    className="text-xs font-medium text-[#0C4A3E] dark:text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    عرض النص القرآني للسورة
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-700 dark:text-red-400 bg-red-500/10 rounded-xl p-3">
                {error}
              </p>
            )}

            {/* Scrubber */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={Math.min(currentTime, duration || 100)}
                onChange={(e) => seekTo(Number(e.target.value))}
                aria-label="تقديم أو تأخير التلاوة"
                className="w-full quran-scrubber bg-[#E6E2D8] dark:bg-[#1A352E] rounded-full h-1.5"
                style={{
                  background: `linear-gradient(to left, #D4AF37 ${progressPct}%, rgba(180,170,150,0.25) ${progressPct}%)`,
                }}
              />
              <div className="flex items-center justify-between text-xs text-[#4A5D56] dark:text-[#9FB3AC] tabular-nums">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={cycleMode}
                title={MODE_LABELS[playbackMode]}
                aria-label={MODE_LABELS[playbackMode]}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-[#0C4A3E] dark:text-[#D4AF37] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <ModeIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="السورة السابقة"
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full border border-[#E6E2D8] dark:border-[#1A352E] text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37] cursor-pointer"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => void togglePlayPause()}
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  className="w-14 h-14 flex items-center justify-center rounded-full bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411] shadow-md hover:opacity-95 transition-opacity cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="السورة التالية"
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full border border-[#E6E2D8] dark:border-[#1A352E] text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37] cursor-pointer"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={stopAudio}
                aria-label="إيقاف وإغلاق المشغل"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC] hover:text-red-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reciter & Speed & Volume */}
            <div className="space-y-4 pt-4 border-t border-[#E6E2D8] dark:border-[#1A352E]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#4A5D56] dark:text-[#9FB3AC]">القارئ</span>
                <select
                  value={reciter.id}
                  onChange={(e) => setReciterId(e.target.value)}
                  className="min-h-[40px] px-3 rounded-xl bg-white dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] text-xs sm:text-sm text-[#10241E] dark:text-[#F5F2EB] cursor-pointer"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#4A5D56] dark:text-[#9FB3AC]">
                  سرعة التلاوة
                </span>
                <div className="flex items-center gap-1.5">
                  {[0.75, 1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPlaybackRate(rate)}
                      className={`min-h-[34px] px-2.5 rounded-lg text-xs font-medium tabular-nums cursor-pointer ${
                        playbackRate === rate
                          ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                          : 'bg-white dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC]'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37] shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="مستوى الصوت"
                  className="w-full quran-scrubber h-1.5 rounded-full bg-[#E6E2D8] dark:bg-[#1A352E]"
                />
              </div>

              <p className="text-center text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
                الوضع الحالي: {MODE_LABELS[playbackMode]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Docked Compact Mini Player */}
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 md:left-4 md:right-4 z-30 pointer-events-none">
        <div className="max-w-5xl mx-auto pointer-events-auto">
          <div className="bg-white/95 dark:bg-[#0D1F1B]/95 backdrop-blur-md border-t md:border border-[#E6E2D8] dark:border-[#1A352E] md:rounded-2xl shadow-lg px-3 sm:px-5 py-2">
            {/* Thin progress bar at top of mini-player */}
            <div className="w-full h-0.5 bg-[#EFECE3] dark:bg-[#1A352E] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Track Info (click to expand) */}
              <button
                type="button"
                onClick={() => setIsPlayerExpanded(true)}
                className="flex items-center gap-3 min-w-0 flex-1 text-right cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0B2420] border border-[#D4AF37]/40 shrink-0">
                  <img
                    src="/assets/aistudio/Ic_ne_coranique_islamique_dor_e_et_verte_5b3d814c.png"
                    alt="شعار القرآن الكريم لأبي الحسين"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-quran text-base font-bold text-[#10241E] dark:text-[#F5F2EB] truncate">
                    {activeTrack.title}
                  </p>
                  <p className="text-[11px] text-[#4A5D56] dark:text-[#9FB3AC] truncate tabular-nums">
                    {error
                      ? error
                      : activeDownloadPct !== null
                        ? `جاري التحميل والحفظ محليًا... ${activeDownloadPct}%`
                        : `${activeTrack.subtitle} · ${formatDuration(currentTime)} / ${formatDuration(duration)}`}
                  </p>
                </div>
              </button>

              {/* Compact Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={cycleMode}
                  aria-label={MODE_LABELS[playbackMode]}
                  title={MODE_LABELS[playbackMode]}
                  className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#4A5D56] dark:text-[#9FB3AC] hover:text-[#0C4A3E] dark:hover:text-[#D4AF37] cursor-pointer"
                >
                  <ModeIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="السابق"
                  className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#10241E] dark:text-[#F5F2EB] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void togglePlayPause()}
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411] cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="التالي"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#10241E] dark:text-[#F5F2EB] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlayerExpanded(true)}
                  aria-label="توسيع المشغل"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={stopAudio}
                  aria-label="إغلاق المشغل"
                  className="hidden sm:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#4A5D56] dark:text-[#9FB3AC] hover:text-red-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
