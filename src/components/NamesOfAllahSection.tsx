import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { NAMES_OF_ALLAH } from '../data/namesOfAllah';
import type { NameOfAllah } from '../types/quran';
import { normalizeArabicForSearch, toArabicIndicDigits } from '../utils/arabicNormalize';

type ThemeFilter = 'all' | NameOfAllah['theme'];

const THEME_FILTERS: { id: ThemeFilter; label: string }[] = [
  { id: 'all', label: 'الأسماء التسعة والتسعون' },
  { id: 'mercy', label: 'الرحمة واللطف' },
  { id: 'majesty', label: 'العظمة والجلال' },
  { id: 'knowledge', label: 'العلم والحكمة' },
  { id: 'provision', label: 'الرزق والغنى' },
  { id: 'guidance', label: 'الهداية والعدل' },
];

export const NamesOfAllahSection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>('all');
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  const filteredNames = useMemo(() => {
    const normQuery = normalizeArabicForSearch(query);
    return NAMES_OF_ALLAH.filter((item) => {
      if (themeFilter !== 'all' && item.theme !== themeFilter) return false;
      if (!normQuery) return true;
      return (
        normalizeArabicForSearch(item.arabic).includes(normQuery) ||
        normalizeArabicForSearch(item.meaning).includes(normQuery) ||
        item.transliteration.toLowerCase().includes(normQuery) ||
        String(item.id) === normQuery
      );
    });
  }, [query, themeFilter]);

  const handleStep = (delta: number) => {
    if (!selectedName) return;
    const nextId = selectedName.id + delta;
    if (nextId < 1 || nextId > 99) return;
    const found = NAMES_OF_ALLAH.find((n) => n.id === nextId);
    if (found) setSelectedName(found);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <section className="rounded-3xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 sm:p-8 space-y-2">
        <p className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37]">
          ﴿ وَلِلَّهِ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ فَٱدْعُوهُ بِهَا ﴾
        </p>
        <h1
          className="font-quran text-3xl sm:text-4xl font-bold text-[#10241E] dark:text-[#F5F2EB]"
          style={{ textWrap: 'balance' }}
        >
          أسماء الله الحسنى
        </h1>
        <p className="text-sm text-[#4A5D56] dark:text-[#9FB3AC] max-w-2xl leading-relaxed">
          تأمّل في معاني أسماء الله الحسنى التسعة والتسعين ودلالاتها الإيمانية. اضغط على أي اسم
          لقراءة شرحه والتفكر فيه.
        </p>
      </section>

      {/* Search + Theme Tabs */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#4A5D56] dark:text-[#9FB3AC] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو المعنى أو الرقم..."
            className="w-full min-h-[44px] pr-11 pl-4 py-2 rounded-xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] text-sm text-[#10241E] dark:text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {THEME_FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setThemeFilter(t.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                themeFilter === t.id
                  ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                  : 'bg-white dark:bg-[#0D1F1B] text-[#4A5D56] dark:text-[#9FB3AC] border border-[#E6E2D8] dark:border-[#1A352E]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 99 Names */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredNames.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedName(item)}
            className="group text-right rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] hover:border-[#D4AF37]/70 p-5 transition-colors flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-[#B88A1E] dark:text-[#D4AF37] tabular-nums">
              <span>{toArabicIndicDigits(item.id)}</span>
              <span className="text-[11px] text-[#4A5D56] dark:text-[#9FB3AC]">
                {item.transliteration}
              </span>
            </div>

            <div className="py-1 text-center">
              <h2 className="font-quran text-3xl sm:text-4xl font-bold text-[#0C4A3E] dark:text-[#F5F2EB] group-hover:text-[#B88A1E] dark:group-hover:text-[#D4AF37] transition-colors">
                {item.arabic}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#4A5D56] dark:text-[#9FB3AC] text-center line-clamp-2">
              {item.meaning}
            </p>
          </button>
        ))}
      </div>

      {/* Contemplation Detail Modal */}
      {selectedName && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedName(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#FAF8F4] dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37] tabular-nums">
                الاسم {toArabicIndicDigits(selectedName.id)} من ٩٩ · {selectedName.transliteration}
              </span>
              <button
                type="button"
                onClick={() => setSelectedName(null)}
                aria-label="إغلاق"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4 border-y border-[#E6E2D8] dark:border-[#1A352E] space-y-2">
              <h3 className="font-quran text-5xl sm:text-6xl font-bold text-[#0C4A3E] dark:text-[#D4AF37]">
                {selectedName.arabic}
              </h3>
              <p className="text-base font-bold text-[#10241E] dark:text-[#F5F2EB]">
                {selectedName.meaning}
              </p>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-[#4A5D56] dark:text-[#9FB3AC] text-center">
              {selectedName.description}
            </p>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={selectedName.id <= 1}
                onClick={() => handleStep(-1)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-xs font-medium text-[#10241E] dark:text-[#F5F2EB] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                disabled={selectedName.id >= 99}
                onClick={() => handleStep(1)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-xs font-medium text-[#10241E] dark:text-[#F5F2EB] disabled:opacity-40 cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
