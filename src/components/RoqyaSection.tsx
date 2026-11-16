import React, { useMemo, useState } from 'react';
import { Check, Copy, Pause, Play, RotateCcw } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { ROQYA_ITEMS } from '../data/roqyaData';
import { toArabicIndicDigits } from '../utils/arabicNormalize';

type RoqyaFilter = 'all' | 'quran' | 'sunnah';

export const RoqyaSection: React.FC = () => {
  const { isPlaying, activeTrack, playRoqyaAll, playRoqyaItem, togglePlayPause } = useAudioPlayer();
  const [filter, setFilter] = useState<RoqyaFilter>('all');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleItems = useMemo(() => {
    if (filter === 'all') return ROQYA_ITEMS;
    return ROQYA_ITEMS.filter((item) => item.category === filter);
  }, [filter]);

  const isRoqyaPlayingAll = activeTrack?.kind === 'roqya' && isPlaying;

  const incrementCount = (id: string, max: number) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      const next = current >= max ? 0 : current + 1;
      return { ...prev, [id]: next };
    });
  };

  const resetCount = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleCopy = async (id: string, title: string, text: string) => {
    try {
      await navigator.clipboard.writeText(`${title}\n${text}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Sanctuary Card */}
      <section className="rounded-3xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37]">
            من الكتاب والسنة النبوية الصحيحة
          </p>
          <h1
            className="font-quran text-3xl sm:text-4xl font-bold text-[#10241E] dark:text-[#F5F2EB]"
            style={{ textWrap: 'balance' }}
          >
            الرقية الشرعية
          </h1>
          <p className="text-sm text-[#4A5D56] dark:text-[#9FB3AC] leading-relaxed">
            آيات الشفاء والحفظ والأدعية النبوية المأثورة للتحصين والسكينة، مع إمكانية الاستماع
            المتواصل للآيات القرآنية وتتبع عدد القراءة الموصى به.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeTrack?.kind === 'roqya') {
              void togglePlayPause();
            } else {
              void playRoqyaAll();
            }
          }}
          className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 rounded-xl bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411] text-sm font-medium hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isRoqyaPlayingAll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRoqyaPlayingAll ? 'إيقاف الرقية مؤقتًا' : 'تشغيل الرقية الشرعية كاملة'}</span>
        </button>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'all', label: `الكل (${ROQYA_ITEMS.length})` },
            { id: 'quran', label: 'الآيات القرآنية' },
            { id: 'sunnah', label: 'الأدعية النبوية' },
          ] as { id: RoqyaFilter; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filter === tab.id
                ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                : 'bg-white dark:bg-[#0D1F1B] text-[#4A5D56] dark:text-[#9FB3AC] border border-[#E6E2D8] dark:border-[#1A352E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Roqya Items */}
      <div className="space-y-4">
        {visibleItems.map((item) => {
          const currentCount = counts[item.id] || 0;
          const isCompleted = currentCount >= item.repeatRecommended;
          const isItemActive = activeTrack?.kind === 'roqya' && activeTrack.roqyaId === item.id;
          const isItemPlaying = isItemActive && isPlaying;

          return (
            <article
              key={item.id}
              className={`rounded-2xl border p-5 sm:p-7 space-y-4 transition-colors ${
                isItemActive
                  ? 'bg-[#F6F1E2] dark:bg-[#132C25] border-[#D4AF37]/60'
                  : 'bg-white dark:bg-[#0D1F1B] border-[#E6E2D8] dark:border-[#1A352E]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#EFECE3] dark:border-[#163029]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#10241E] dark:text-[#F5F2EB]">
                    {item.title}
                  </h2>
                  <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC] mt-0.5">
                    {item.source} · التكرار الموصى به: {toArabicIndicDigits(item.repeatRecommended)}{' '}
                    {item.repeatRecommended === 1 ? 'مرة' : 'مرات'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.audioSpecs && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isItemActive) {
                          void togglePlayPause();
                        } else {
                          void playRoqyaItem(item.id);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0C4A3E]/10 dark:bg-[#D4AF37]/15 text-[#0C4A3E] dark:text-[#D4AF37] text-xs font-medium hover:bg-[#0C4A3E] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-[#071411] transition-colors cursor-pointer"
                    >
                      {isItemPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isItemPlaying ? 'إيقاف' : 'استماع'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleCopy(item.id, item.title, item.text)}
                    aria-label="نسخ النص"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC] hover:border-[#D4AF37]/60 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-[#0C4A3E] dark:text-[#D4AF37]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="font-quran text-2xl sm:text-[26px] leading-[2.15] text-[#10241E] dark:text-[#F5F2EB] text-right">
                {item.text}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs sm:text-sm text-[#4A5D56] dark:text-[#9FB3AC] max-w-xl">
                  {item.note}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => incrementCount(item.id, item.repeatRecommended)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                        : 'border border-[#E6E2D8] dark:border-[#1A352E] bg-[#FAF8F4] dark:bg-[#071411] text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60'
                    }`}
                  >
                    {isCompleted
                      ? `أُتمّت (${toArabicIndicDigits(currentCount)} / ${toArabicIndicDigits(item.repeatRecommended)})`
                      : `عدّاد القراءة: ${toArabicIndicDigits(currentCount)} / ${toArabicIndicDigits(item.repeatRecommended)}`}
                  </button>

                  {currentCount > 0 && (
                    <button
                      type="button"
                      onClick={() => resetCount(item.id)}
                      aria-label="إعادة ضبط العداد"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC] hover:text-[#10241E] dark:hover:text-[#F5F2EB] cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
