import React from 'react';
import { BookOpen, Clock, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import type { AppTab } from '../types/quran';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

const MOBILE_TABS: { id: AppTab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'quran', label: 'المصحف', Icon: BookOpen },
  { id: 'prayers', label: 'المواقيت', Icon: Clock },
  { id: 'roqya', label: 'الرقية', Icon: ShieldCheck },
  { id: 'duas', label: 'الأدعية', Icon: HeartHandshake },
  { id: 'names', label: 'الأسماء', Icon: Sparkles },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      aria-label="شريط التنقل السفلي"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F4]/95 dark:bg-[#071411]/95 backdrop-blur-md border-t border-[#E6E2D8] dark:border-[#1A352E] pb-safe"
    >
      <div className="grid grid-cols-5 h-16">
        {MOBILE_TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#0C4A3E] dark:text-[#D4AF37] font-bold'
                  : 'text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
