import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { SURAH_INDEX } from '../data/surahIndex';

export const DownloadProgressToast: React.FC = () => {
  const {
    downloadingKeys,
    downloadProgress,
    downloadNotice,
    dismissDownloadNotice,
    activeTrack,
  } = useAudioPlayer();

  // Prefer explicit manual downloadNotice when present; otherwise show active background auto-cache
  let surahNumber: number | null = null;
  let status: 'downloading' | 'completed' | 'error' = 'downloading';
  let percent = 0;
  let message = 'جاري التحميل والحفظ محليًا...';

  if (downloadNotice) {
    surahNumber = downloadNotice.surahNumber;
    status = downloadNotice.status;
    percent = downloadNotice.percent;
    message = downloadNotice.message;
  } else if (downloadingKeys.length > 0) {
    const latestKey = downloadingKeys[downloadingKeys.length - 1];
    const parts = latestKey.split(':');
    surahNumber = Number(parts[1]);
    percent = Math.min(100, Math.max(0, downloadProgress[latestKey] ?? 0));
  } else {
    return null;
  }

  const surahMeta = SURAH_INDEX.find((s) => s.number === surahNumber);
  const titleText = surahMeta ? `${surahMeta.name} — ${message}` : message;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-4 right-4 z-40 pointer-events-none ${
        activeTrack ? 'bottom-36 md:bottom-28' : 'bottom-20 md:bottom-6'
      }`}
    >
      <div className="w-full max-w-md mx-auto p-4 bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] rounded-2xl shadow-xl pointer-events-auto space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-sm font-medium text-[#10241E] dark:text-[#F5F2EB]">
          <div className="flex items-center gap-2 min-w-0">
            {status === 'completed' && (
              <CheckCircle2 className="w-4 h-4 text-[#0C4A3E] dark:text-[#D4AF37] shrink-0" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span className="truncate">{titleText}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {status !== 'error' && (
              <span className="text-[#B88A1E] dark:text-[#D4AF37] font-bold tabular-nums">
                {percent}%
              </span>
            )}
            {status !== 'downloading' && (
              <button
                type="button"
                onClick={dismissDownloadNotice}
                aria-label="إغلاق الإشعار"
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-lg text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {status !== 'error' && (
          <div className="w-full bg-[#EFECE3] dark:bg-[#1A352E] rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-150 ${
                status === 'completed'
                  ? 'bg-[#0C4A3E] dark:bg-[#D4AF37]'
                  : 'bg-[#D4AF37]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
