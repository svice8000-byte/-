import React from 'react';
import { Bell, Moon, Shield, Sun, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { RECITERS } from '../data/reciters';
import type { ThemeMode } from '../types/quran';
import type { NotificationPermissionStatus } from '../utils/adhanNotifier';
import { toArabicIndicDigits } from '../utils/arabicNormalize';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  isAdhanMuted: boolean;
  onToggleAdhanMute: () => void;
  notificationStatus: NotificationPermissionStatus;
  notificationFeedback: string | null;
  onRequestNotifications: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  onSetTheme,
  fontSize,
  onChangeFontSize,
  isAdhanMuted,
  onToggleAdhanMute,
  notificationStatus,
  notificationFeedback,
  onRequestNotifications,
}) => {
  const {
    reciter,
    setReciterId,
    cachedSurahKeys,
    offlineStorageMB,
    autoCacheOnPlay,
    setAutoCacheOnPlay,
    clearOfflineAudio,
  } = useAudioPlayer();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <aside
        aria-label="الإعدادات والخصوصية"
        className="w-full max-w-md h-full overflow-y-auto bg-[#FAF8F4] dark:bg-[#0D1F1B] border-r border-[#E6E2D8] dark:border-[#1A352E] p-6 space-y-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E2D8] dark:border-[#1A352E]">
          <h2 className="text-lg font-bold text-[#10241E] dark:text-[#F5F2EB]">
            الإعدادات والخصوصية
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق الإعدادات"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Switcher */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">مظهر القراءة</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onSetTheme('light')}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-[#0C4A3E] text-white border-[#0C4A3E]'
                  : 'bg-white dark:bg-[#071411] border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>الوضع النهاري</span>
            </button>
            <button
              type="button"
              onClick={() => onSetTheme('dark')}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#D4AF37] text-[#071411] border-[#D4AF37]'
                  : 'bg-white dark:bg-[#071411] border-[#E6E2D8] dark:border-[#1A352E] text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>الوضع الليلي</span>
            </button>
          </div>
        </section>

        {/* Quran Font Size */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">
              حجم الخط القرآني
            </h3>
            <span className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37] tabular-nums">
              {fontSize}px
            </span>
          </div>
          <input
            type="range"
            min={18}
            max={40}
            step={2}
            value={fontSize}
            onChange={(e) => onChangeFontSize(Number(e.target.value))}
            aria-label="حجم الخط القرآني"
            className="w-full quran-scrubber h-1.5 rounded-full bg-[#E6E2D8] dark:bg-[#1A352E]"
          />
          <p
            className="font-quran text-center p-4 rounded-xl bg-white dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] text-[#10241E] dark:text-[#F5F2EB]"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.9 }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        </section>

        {/* Preferred Reciter */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">القارئ المفضل</h3>
          <div className="space-y-2">
            {RECITERS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReciterId(r.id)}
                className={`w-full text-right min-h-[48px] px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                  reciter.id === r.id
                    ? 'bg-[#F6F1E2] dark:bg-[#132C25] border-[#D4AF37]/70 text-[#0C4A3E] dark:text-[#D4AF37]'
                    : 'bg-white dark:bg-[#071411] border-[#E6E2D8] dark:border-[#1A352E] text-[#10241E] dark:text-[#F5F2EB]'
                }`}
              >
                <div className="text-sm font-bold">{r.nameAr}</div>
                <div className="text-xs text-[#4A5D56] dark:text-[#9FB3AC]">{r.styleAr}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Offline Audio Cache */}
        <section className="space-y-3 pt-4 border-t border-[#E6E2D8] dark:border-[#1A352E]">
          <h3 className="text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">
            العمل دون إنترنت والتخزين المحلي
          </h3>
          <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC] leading-relaxed tabular-nums">
            نص القرآن الكريم بالكامل محفوظ محليًا للعمل دون اتصال. السور الصوتية المحفوظة في
            IndexedDB على جهازك: {toArabicIndicDigits(cachedSurahKeys.length)} سورة
            {offlineStorageMB > 0 ? ` (${offlineStorageMB} ميجابايت)` : ''}.
          </p>

          <button
            type="button"
            onClick={() => setAutoCacheOnPlay(!autoCacheOnPlay)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] flex items-center justify-between gap-3 text-right cursor-pointer"
          >
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">
                الحفظ التلقائي عند التشغيل
              </div>
              <div className="text-[11px] text-[#4A5D56] dark:text-[#9FB3AC]">
                حفظ السورة تلقائيًا في IndexedDB عند سماعها لأول مرة
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
                autoCacheOnPlay
                  ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                  : 'bg-[#EFECE3] dark:bg-[#143029] text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              {autoCacheOnPlay ? 'مفعّل' : 'متوقف'}
            </span>
          </button>

          <button
            type="button"
            aria-pressed={!isAdhanMuted}
            onClick={onToggleAdhanMute}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] flex items-center justify-between gap-3 text-right cursor-pointer"
          >
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">
                تنبيهات الأذان التلقائية
              </div>
              <div className="text-[11px] text-[#4A5D56] dark:text-[#9FB3AC]">
                تشغيل صوت الأذان عند دخول وقت الصلاة
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
                !isAdhanMuted
                  ? 'bg-[#B88A1E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                  : 'bg-[#EFECE3] dark:bg-[#143029] text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              {!isAdhanMuted ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span>{!isAdhanMuted ? 'التنبيهات مفعلة' : 'التنبيهات مكتومة'}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onRequestNotifications}
            disabled={notificationStatus === 'granted'}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] flex items-center justify-between gap-3 text-right cursor-pointer disabled:cursor-default"
          >
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">
                إشعارات سطح المكتب والمتصفح
              </div>
              <div className="text-[11px] text-[#4A5D56] dark:text-[#9FB3AC]">
                {notificationFeedback ?? 'إظهار إشعار نظامي على الجهاز عند دخول وقت الصلاة'}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
                notificationStatus === 'granted'
                  ? 'bg-[#0C4A3E] dark:bg-[#D4AF37] text-white dark:text-[#071411]'
                  : 'bg-[#EFECE3] dark:bg-[#143029] text-[#4A5D56] dark:text-[#9FB3AC]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {notificationStatus === 'granted'
                  ? 'مفعّلة'
                  : notificationStatus === 'denied'
                    ? 'مرفوضة'
                    : notificationStatus === 'unsupported'
                      ? 'غير مدعومة'
                      : 'تفعيل'}
              </span>
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <PWAInstallButton variant="primary" />
            {cachedSurahKeys.length > 0 && (
              <button
                type="button"
                onClick={() => void clearOfflineAudio()}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] text-xs font-medium text-[#4A5D56] dark:text-[#9FB3AC] hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح التلاوات المحفوظة</span>
              </button>
            )}
          </div>
        </section>

        {/* Strict Zero-Data-Collection Privacy Guarantee */}
        <section className="rounded-2xl bg-white dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0C4A3E] dark:text-[#D4AF37]">
            <Shield className="w-4 h-4 shrink-0" />
            <span>ميثاق الخصوصية التامة</span>
          </div>
          <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC] leading-relaxed">
            تطبيق «القرآن الكريم لأبي الحسين» لا يجمع أي بيانات شخصية أو إحصائية إطلاقًا: لا توجد
            أدوات تتبع، ولا ملفات تعريف ارتباط إعلانية، ولا أي إرسال لبيانات المستخدم إلى خوادم
            خارجية. تُحفظ العلامات المرجعية، وموضع القراءة، وتفضيلاتك محليًا في متصفحك فقط.
          </p>
        </section>
      </aside>
    </div>
  );
};
