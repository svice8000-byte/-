import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { AppTab } from '../types/quran';

interface TopBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenSettings: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'quran', label: 'المصحف الشريف' },
  { id: 'prayers', label: 'مواقيت الصلاة' },
  { id: 'roqya', label: 'الرقية الشرعية' },
  { id: 'duas', label: 'أدعية مختارة' },
  { id: 'names', label: 'أسماء الله الحسنى' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#FAF8F4]/90 dark:bg-[#071411]/90 backdrop-blur-md border-b border-[#E6E2D8] dark:border-[#1A352E]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand logo & wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('quran')}
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-xl px-1 py-0.5"
        >
          <img
            src="/assets/aistudio/Ic_ne_coranique_islamique_dor_e_et_verte_5b3d814c.png"
            alt="شعار القرآن الكريم لأبي الحسين"
            className="w-9 h-9 rounded-xl object-cover border border-[#D4AF37]/50 shadow-sm shrink-0"
          />
          <span className="font-quran text-lg sm:text-xl font-bold text-[#0C4A3E] dark:text-[#D4AF37]">
            القرآن الكريم لأبي الحسين
          </span>
        </button>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-sm ${
                  isActive
                    ? 'text-[#0C4A3E] dark:text-[#D4AF37] font-bold'
                    : 'text-[#4A5D56] dark:text-[#9FB3AC] hover:text-[#10241E] dark:hover:text-[#F5F2EB]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-[#D4AF37] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] bg-white dark:bg-[#0D1F1B] text-xs sm:text-sm font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37]" />
            <span>الإعدادات</span>
          </button>
        </div>
      </div>
    </header>
  );
};
