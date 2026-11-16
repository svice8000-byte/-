import React, { useMemo, useState } from 'react';
import { Check, Copy, RotateCcw, Search } from 'lucide-react';
import { DUAS_LIST, DUA_CATEGORIES } from '../data/duasData';
import { normalizeArabicForSearch, toArabicIndicDigits } from '../utils/arabicNormalize';
import { loadDuaCounters, saveDuaCounters } from '../utils/storage';

export const DuasSection: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [counters, setCounters] = useState<Record<string, number>>(() => loadDuaCounters());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDuas = useMemo(() => {
    const normQuery = normalizeArabicForSearch(query);
    return DUAS_LIST.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!normQuery) return true;
      return (
        normalizeArabicForSearch(item.title).includes(normQuery) ||
        normalizeArabicForSearch(item.text).includes(normQuery)
      );
    });
  }, [category, query]);

  const handleTapCounter = (id: string, target: number) => {
    setCounters((prev) => {
      const current = prev[id] || 0;
      const next = current >= target ? 0 : current + 1;
      const updated = { ...prev, [id]: next };
      saveDuaCounters(updated);
      return updated;
    });
  };

  const handleResetCounter = (id: string) => {
    setCounters((prev) => {
      const updated = { ...prev, [id]: 0 };
      saveDuaCounters(updated);
      return updated;
    });
  };

  const handleResetAll = () => {
    setCounters({});
    saveDuaCounters({});
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
      {/* Header */}
      <section className="rounded-3xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37]">
            حصن المسلم اليومي · تُحفظ العدادات محليًا على جهازك
          </p>
          <h1
            className="font-quran text-3xl sm:text-4xl font-bold text-[#10241E] dark:text-[#F5F2EB]"
            style={{ textWrap: 'balance' }}
          >
            أدعية مختارة وأذكار يومية
          </h1>
          <p className="text-sm text-[#4A5D56] dark:text-[#9FB3AC] leading-relaxed">
            مجموعة منتقاة من أذكار الصباح والمساء والأدعية القرآنية والنبوية الصحيحة بتشكيل واضح
            وعدّاد تسبيح تفاعلي.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-xs font-medium text-[#4A5D56] dark:text-[#9FB3AC] hover:border-[#D4AF37]/60 cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>تصفير جميع العدادات</span>
        </button>
      </section>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#4A5D56] dark:text-[#9FB3AC] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأدعية والأذكار..."
            className="w-full min-h-[44px] pr-11 pl-4 py-2 rounded-xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] text-sm text-[#10241E] dark:text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DUA_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat.id
                  ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                  : 'bg-white dark:bg-[#0D1F1B] text-[#4A5D56] dark:text-[#9FB3AC] border border-[#E6E2D8] dark:border-[#1A352E]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duas List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDuas.map((dua) => {
          const count = counters[dua.id] || 0;
          const isDone = count >= dua.repeatCount;

          return (
            <article
              key={dua.id}
              className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-5 sm:p-7 space-y-4"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EFECE3] dark:border-[#163029]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#10241E] dark:text-[#F5F2EB]">
                    {dua.title}
                  </h2>
                  <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC] mt-0.5">
                    {dua.source} · التكرار: {toArabicIndicDigits(dua.repeatCount)}{' '}
                    {dua.repeatCount === 1 ? 'مرة' : 'مرات'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCopy(dua.id, dua.title, dua.text)}
                  aria-label="نسخ الدعاء"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC] hover:border-[#D4AF37]/60 cursor-pointer shrink-0"
                >
                  {copiedId === dua.id ? (
                    <Check className="w-4 h-4 text-[#0C4A3E] dark:text-[#D4AF37]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="font-quran text-2xl sm:text-[26px] leading-[2.15] text-[#10241E] dark:text-[#F5F2EB] text-right">
                {dua.text}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs sm:text-sm text-[#4A5D56] dark:text-[#9FB3AC] max-w-xl">
                  {dua.virtue || 'من جوامع الأذكار والأدعية المأثورة.'}
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTapCounter(dua.id, dua.repeatCount)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                        : 'border border-[#E6E2D8] dark:border-[#1A352E] bg-[#FAF8F4] dark:bg-[#071411] text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60'
                    }`}
                  >
                    {isDone
                      ? `مكتمل (${toArabicIndicDigits(count)} / ${toArabicIndicDigits(dua.repeatCount)})`
                      : `تسبيح: ${toArabicIndicDigits(count)} / ${toArabicIndicDigits(dua.repeatCount)}`}
                  </button>

                  {count > 0 && (
                    <button
                      type="button"
                      onClick={() => handleResetCounter(dua.id)}
                      aria-label="إعادة التصفير"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC] cursor-pointer"
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
