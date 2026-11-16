import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'subtle' | 'floating';
  hasActiveAudioBar?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  hasActiveAudioBar = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (variant === 'floating') {
    if (isDismissed || (!isInstallable && !isIOS)) {
      return null;
    }

    const positionClass = hasActiveAudioBar
      ? 'bottom-40 md:bottom-24 left-4 sm:left-6'
      : 'bottom-20 md:bottom-6 left-4 sm:left-6';

    return (
      <>
        <div
          className={`fixed ${positionClass} z-40 flex items-center gap-1.5 rounded-2xl bg-[#B88A1E] hover:bg-[#9E7516] dark:bg-[#D4AF37] dark:hover:bg-[#C49E2A] text-white dark:text-[#071411] shadow-xl transition-all`}
        >
          <button
            id="install-btn"
            type="button"
            onClick={() => {
              if (isInstallable) {
                void install();
              } else if (isIOS) {
                setShowIOSGuide(true);
              }
            }}
            className="min-h-[48px] pr-4 pl-2 py-2.5 inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
          >
            {isIOS && !isInstallable ? (
              <Share className="w-4 h-4 shrink-0" />
            ) : (
              <Download className="w-4 h-4 shrink-0" />
            )}
            <span>تثبيت تطبيق القرآن الكريم</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="إخفاء زر التثبيت"
            className="min-h-[44px] min-w-[36px] pl-2 pr-1 flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#10241E] dark:text-[#F5F2EB]">
                  تثبيت التطبيق على iPhone و iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="space-y-2.5 text-sm text-[#4A5D56] dark:text-[#9FB3AC] leading-relaxed list-decimal list-inside">
                <li>اضغط على زر المشاركة (Share) في شريط متصفح Safari بالأسفل.</li>
                <li>مرّر للأسفل واختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
                <li>اضغط «إضافة» ليظهر التطبيق كبرنامج مستقل يعمل دون إنترنت.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-[#0C4A3E] text-white text-sm font-medium hover:bg-[#09382F] transition-colors cursor-pointer"
              >
                حسنًا
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={
          variant === 'primary'
            ? 'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#071411] font-medium text-sm hover:bg-[#c49f2c] transition-colors whitespace-nowrap shrink-0 cursor-pointer'
            : 'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#D4AF37]/50 text-[#8F6B14] dark:text-[#D4AF37] font-medium text-sm hover:bg-[#D4AF37]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer'
        }
      >
        <Download className="w-4 h-4" />
        <span>تثبيت تطبيق القرآن الكريم</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#D4AF37]/40 text-[#8F6B14] dark:text-[#D4AF37] font-medium text-sm hover:bg-[#D4AF37]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Share className="w-4 h-4" />
          <span>تثبيت على آيفون</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#10241E] dark:text-[#F5F2EB]">
                  تثبيت التطبيق على iPhone و iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#4A5D56] dark:text-[#9FB3AC] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="space-y-2.5 text-sm text-[#4A5D56] dark:text-[#9FB3AC] leading-relaxed list-decimal list-inside">
                <li>اضغط على زر المشاركة (Share) في شريط متصفح Safari بالأسفل.</li>
                <li>مرّر للأسفل واختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
                <li>اضغط «إضافة» ليظهر التطبيق كبرنامج مستقل يعمل دون إنترنت.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-[#0C4A3E] text-white text-sm font-medium hover:bg-[#09382F] transition-colors cursor-pointer"
              >
                حسنًا
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
