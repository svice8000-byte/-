import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, Clock, Compass, LocateFixed, MapPin, Shield, Square, Volume2, VolumeX } from 'lucide-react';
import { PRAYER_CALCULATION_METHODS, PRAYER_CITIES } from '../data/prayerCities';
import type { PrayerLocationConfig, PrayerMethodId } from '../types/quran';
import type { NotificationPermissionStatus } from '../utils/adhanNotifier';
import { formatCountdownTo, getLocalPrayerTimes } from '../utils/prayerTimes';
import { loadPrayerConfig, savePrayerConfig } from '../utils/storage';

const PRAYER_CARDS: {
  id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  label: string;
}[] = [
  { id: 'fajr', label: 'الفجر' },
  { id: 'sunrise', label: 'الشروق' },
  { id: 'dhuhr', label: 'الظهر' },
  { id: 'asr', label: 'العصر' },
  { id: 'maghrib', label: 'المغرب' },
  { id: 'isha', label: 'العشاء' },
];

interface PrayerTimesSectionProps {
  isAdhanMuted: boolean;
  isAdhanPlaying: boolean;
  onToggleAdhanMute: () => void;
  onTestAdhan: () => void;
  onStopAdhan: () => void;
  notificationStatus: NotificationPermissionStatus;
  notificationFeedback: string | null;
  onRequestNotifications: () => void;
}

export const PrayerTimesSection: React.FC<PrayerTimesSectionProps> = ({
  isAdhanMuted,
  isAdhanPlaying,
  onToggleAdhanMute,
  onTestAdhan,
  onStopAdhan,
  notificationStatus,
  notificationFeedback,
  onRequestNotifications,
}) => {
  const [config, setConfig] = useState<PrayerLocationConfig>(() => loadPrayerConfig());
  const [now, setNow] = useState<Date>(() => new Date());
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const updateConfig = (updater: (prev: PrayerLocationConfig) => PrayerLocationConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      savePrayerConfig(next);
      return next;
    });
  };

  const summary = useMemo(
    () =>
      getLocalPrayerTimes(config.latitude, config.longitude, config.method, {
        hour12: config.hour12,
        madhab: config.madhab,
        date: now,
      }),
    [config.hour12, config.latitude, config.longitude, config.madhab, config.method, now]
  );

  const countdown = formatCountdownTo(summary.nextPrayer.rawTime, now);

  const handleSelectCity = (cityId: string) => {
    const city = PRAYER_CITIES.find((c) => c.id === cityId);
    if (!city) return;
    setGpsError(null);
    updateConfig((prev) => ({
      ...prev,
      cityId: city.id,
      label: `${city.nameAr}، ${city.countryAr}`,
      latitude: city.latitude,
      longitude: city.longitude,
      method: city.defaultMethod,
      isCustomGps: false,
    }));
  };

  const handleUseLocalGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('متصفحك لا يدعم تحديد الموقع الجغرافي.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        updateConfig((prev) => ({
          ...prev,
          cityId: 'gps',
          label: `موقعي المحلي (${lat}°, ${lng}°)`,
          latitude: lat,
          longitude: lng,
          isCustomGps: true,
        }));
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setGpsError('تعذر الوصول إلى الموقع. يمكنك اختيار المدينة من القائمة المحلية.');
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hero Next Prayer Sanctuary */}
      <section className="rounded-3xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#B88A1E] dark:text-[#D4AF37]">
              حساب فلكي محلي ١٠٠٪ بدون إنترنت أو إرسال إحداثيات
            </p>
            <h1
              className="font-quran text-3xl sm:text-4xl font-bold text-[#10241E] dark:text-[#F5F2EB]"
              style={{ textWrap: 'balance' }}
            >
              مواقيت الصلاة
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5D56] dark:text-[#9FB3AC]">
              {summary.gregorianDate}
              {summary.hijriDate ? ` · ${summary.hijriDate}` : ''}
            </p>
          </div>

          {/* Upcoming Prayer Countdown Box */}
          <div className="rounded-2xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] px-6 py-4 flex items-center justify-between gap-6 min-w-[260px]">
            <div className="space-y-1">
              <span className="text-xs text-[#4A5D56] dark:text-[#9FB3AC]">الصلاة القادمة</span>
              <div className="font-quran text-2xl font-bold text-[#0C4A3E] dark:text-[#D4AF37]">
                {summary.nextPrayer.name}
              </div>
              <span className="text-xs font-medium text-[#10241E] dark:text-[#F5F2EB] tabular-nums">
                الأذان: {summary.nextPrayer.time}
              </span>
            </div>

            <div className="text-left space-y-1">
              <span className="text-xs text-[#4A5D56] dark:text-[#9FB3AC] block">الوقت المتبقي</span>
              <span className="text-xl sm:text-2xl font-bold text-[#B88A1E] dark:text-[#D4AF37] tabular-nums font-mono" dir="ltr">
                {countdown}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Method Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#EFECE3] dark:border-[#163029]">
          {/* City Picker */}
          <label className="flex flex-col gap-1.5 text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#B88A1E] dark:text-[#D4AF37]" />
              <span>المدينة</span>
            </span>
            <select
              value={config.isCustomGps ? 'gps' : config.cityId}
              onChange={(e) => {
                if (e.target.value !== 'gps') handleSelectCity(e.target.value);
              }}
              className="min-h-[44px] px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] text-sm text-[#10241E] dark:text-[#F5F2EB] cursor-pointer"
            >
              {config.isCustomGps && <option value="gps">{config.label}</option>}
              {PRAYER_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr} — {city.countryAr}
                </option>
              ))}
            </select>
          </label>

          {/* Calculation Method */}
          <label className="flex flex-col gap-1.5 text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#B88A1E] dark:text-[#D4AF37]" />
              <span>طريقة الحساب</span>
            </span>
            <select
              value={config.method}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  method: e.target.value as PrayerMethodId,
                }))
              }
              className="min-h-[44px] px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] text-sm text-[#10241E] dark:text-[#F5F2EB] cursor-pointer"
            >
              {PRAYER_CALCULATION_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.labelAr}
                </option>
              ))}
            </select>
          </label>

          {/* Madhab + Time Format */}
          <div className="flex flex-col gap-1.5 text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
            <span className="font-medium">مذهب العصر والتنسيق</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    madhab: prev.madhab === 'shafi' ? 'hanafi' : 'shafi',
                  }))
                }
                className="min-h-[44px] px-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] text-xs font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 cursor-pointer"
              >
                {config.madhab === 'shafi' ? 'الجمهور' : 'الحنفي'}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    hour12: !prev.hour12,
                  }))
                }
                className="min-h-[44px] px-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] text-xs font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 cursor-pointer tabular-nums"
              >
                {config.hour12 ? '١٢ ساعة' : '٢٤ ساعة'}
              </button>
            </div>
          </div>

          {/* Local GPS Button */}
          <div className="flex flex-col gap-1.5 text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
            <span className="font-medium">الموقع الفعلي (اختياري)</span>
            <button
              type="button"
              onClick={handleUseLocalGps}
              disabled={gpsLoading}
              className="min-h-[44px] px-3 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-xs font-medium text-[#8F6B14] dark:text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LocateFixed className="w-4 h-4 shrink-0" />
              <span>{gpsLoading ? 'جاري التحديد...' : 'تحديد موقعي محليًا'}</span>
            </button>
          </div>
        </div>

        {gpsError && (
          <p className="text-xs text-red-700 dark:text-red-400">{gpsError}</p>
        )}
      </section>

      {/* 6 Daily Prayer Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {PRAYER_CARDS.map((prayer) => {
          const isNext = !summary.nextPrayer.isTomorrow && summary.nextPrayer.id === prayer.id;
          const timeValue = summary.timings[prayer.id];

          return (
            <div
              key={prayer.id}
              className={`rounded-2xl border p-5 text-center space-y-2 transition-colors ${
                isNext
                  ? 'bg-[#0C4A3E] dark:bg-[#132C25] border-[#D4AF37] text-white'
                  : 'bg-white dark:bg-[#0D1F1B] border-[#E6E2D8] dark:border-[#1A352E] text-[#10241E] dark:text-[#F5F2EB]'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isNext ? 'text-[#D4AF37]' : 'text-[#4A5D56] dark:text-[#9FB3AC]'
                }`}
              >
                {prayer.label}
              </p>
              <p className="text-2xl font-bold tabular-nums" dir="ltr">
                {timeValue}
              </p>
              <p
                className={`text-[11px] ${
                  isNext ? 'text-white/85' : 'text-[#4A5D56]/80 dark:text-[#9FB3AC]/80'
                }`}
              >
                {isNext ? 'الصلاة القادمة' : config.label.split('،')[0]}
              </p>
            </div>
          );
        })}
      </section>

      {/* Adhan Audio Notification Controls */}
      <section
        aria-label="التحكم بتنبيهات الأذان التلقائية"
        className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-4 sm:p-5 shadow-sm space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] flex items-center justify-center shrink-0">
              {isAdhanMuted ? (
                <BellOff className="w-5 h-5 text-[#4A5D56] dark:text-[#9FB3AC]" />
              ) : (
                <Bell className="w-5 h-5 text-[#B88A1E] dark:text-[#D4AF37]" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#10241E] dark:text-[#F5F2EB]">
                تنبيهات الأذان التلقائية
              </h2>
              <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
                تشغيل صوت الأذان وإرسال تنبيه المتصفح عند دخول وقت الصلاة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onRequestNotifications}
              disabled={notificationStatus === 'granted'}
              className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap ${
                notificationStatus === 'granted'
                  ? 'border-[#0C4A3E]/30 dark:border-[#D4AF37]/40 bg-[#F6F1E2]/70 dark:bg-[#132C25] text-[#0C4A3E] dark:text-[#D4AF37] cursor-default'
                  : 'border-[#E6E2D8] dark:border-[#1A352E] bg-[#FAF8F4] dark:bg-[#071411] text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 cursor-pointer'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>
                {notificationStatus === 'granted'
                  ? 'إشعارات المتصفح مفعّلة'
                  : notificationStatus === 'denied'
                    ? 'إذن الإشعارات مرفوض'
                    : 'تفعيل إشعارات المتصفح'}
              </span>
            </button>

            <button
              type="button"
              onClick={isAdhanPlaying ? onStopAdhan : onTestAdhan}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#E6E2D8] dark:border-[#1A352E] bg-[#FAF8F4] dark:bg-[#071411] text-xs font-medium text-[#10241E] dark:text-[#F5F2EB] hover:border-[#D4AF37]/60 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isAdhanPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 text-[#B88A1E] dark:text-[#D4AF37]" />
                  <span>إيقاف الأذان</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37]" />
                  <span>تجربة صوت الأذان</span>
                </>
              )}
            </button>

            <button
              id="adhan-mute-btn"
              type="button"
              aria-pressed={!isAdhanMuted}
              onClick={onToggleAdhanMute}
              className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isAdhanMuted
                  ? 'border border-[#E6E2D8] dark:border-[#1A352E] bg-[#FAF8F4] dark:bg-[#071411] text-[#4A5D56] dark:text-[#9FB3AC] hover:border-[#D4AF37]/60'
                  : 'bg-[#B88A1E] hover:bg-[#9E7516] dark:bg-[#D4AF37] dark:hover:bg-[#C49E2A] text-white dark:text-[#071411]'
              }`}
            >
              {isAdhanMuted ? (
                <VolumeX className="w-4 h-4 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 shrink-0" />
              )}
              <span>{isAdhanMuted ? 'التنبيهات مكتومة' : 'التنبيهات مفعلة'}</span>
            </button>
          </div>
        </div>

        {notificationFeedback && (
          <p
            className={`text-xs pt-2 border-t border-[#EFECE3] dark:border-[#163029] ${
              notificationStatus === 'granted'
                ? 'text-[#0C4A3E] dark:text-[#D4AF37]'
                : 'text-[#8F6B14] dark:text-[#D4AF37]'
            }`}
          >
            {notificationFeedback}
          </p>
        )}
      </section>

      {/* Qibla & Offline Privacy Footer Card */}
      <section className="rounded-2xl bg-white dark:bg-[#0D1F1B] border border-[#E6E2D8] dark:border-[#1A352E] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F4] dark:bg-[#071411] border border-[#E6E2D8] dark:border-[#1A352E] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-[#B88A1E] dark:text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#10241E] dark:text-[#F5F2EB] tabular-nums">
              اتجاه القبلة: {summary.qiblaDegrees}° من الشمال الجغرافي
            </h2>
            <p className="text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
              محسوب فلكيًا وفق إحداثيات {config.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
          <Shield className="w-4 h-4 text-[#B88A1E] dark:text-[#D4AF37] shrink-0" />
          <span>حساب محلي بالكامل — لا يُرسل موقعك إلى أي خادم</span>
        </div>
      </section>
    </div>
  );
};
