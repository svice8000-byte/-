import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
  const [fadingOut, setFadingOut] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    let displayTimer: number | undefined;
    let removeTimer: number | undefined;

    const scheduleDismiss = () => {
      // Hold splash screen for 2000ms, then fade out (700ms) and unmount completely
      displayTimer = window.setTimeout(() => {
        setFadingOut(true);
        removeTimer = window.setTimeout(() => {
          setUnmounted(true);
        }, 700);
      }, 2000);
    };

    if (document.readyState === 'complete') {
      scheduleDismiss();
    } else {
      window.addEventListener('load', scheduleDismiss, { once: true });
    }

    return () => {
      window.removeEventListener('load', scheduleDismiss);
      if (displayTimer !== undefined) window.clearTimeout(displayTimer);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, []);

  if (unmounted) return null;

  return (
    <div
      id="splash-screen"
      role="status"
      aria-label="جاري تهيئة تطبيق القرآن الكريم"
      aria-hidden={fadingOut}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F172A] text-white transition-opacity duration-700 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center px-4 text-center">
        <div className="w-28 h-28 mb-6 rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl shadow-[#D4AF37]/25 animate-pulse bg-[#071411]">
          <img
            src="/assets/aistudio/Ic_ne_coranique_islamique_dor_e_et_verte_5b3d814c.png"
            alt="شعار القرآن الكريم لأبي الحسين"
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="font-quran text-3xl sm:text-4xl font-bold tracking-wide text-[#D4AF37] mb-2">
          القرآن الكريم
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 tracking-wide">
          لأبي الحسين • تجربة روحانية متكاملة
        </p>
      </div>

      <div className="absolute bottom-12 w-28 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-[#D4AF37] animate-pulse w-full rounded-full" />
      </div>
    </div>
  );
};
