import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellOff, Shield, Volume2, X } from 'lucide-react';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { DownloadProgressToast } from './components/DownloadProgressToast';
import { DuasSection } from './components/DuasSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NamesOfAllahSection } from './components/NamesOfAllahSection';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { PWAInstallButton } from './components/PWAInstallButton';
import { QuranSection } from './components/QuranSection';
import { RoqyaSection } from './components/RoqyaSection';
import { SettingsDrawer } from './components/SettingsDrawer';
import { SplashScreen } from './components/SplashScreen';
import { TopBar } from './components/TopBar';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';
import { useQuranData } from './hooks/useQuranData';
import type { AppTab, Bookmark, ThemeMode } from './types/quran';
import {
  AdhanNotifier,
  getBrowserNotificationPermission,
  requestNotificationPermission,
  type AdhanPrayerKey,
  type NotificationPermissionStatus,
} from './utils/adhanNotifier';
import { getPrayerTimes24h } from './utils/prayerTimes';
import {
  loadBookmarks,
  loadFontSize,
  loadLastRead,
  loadPrayerConfig,
  loadTheme,
  saveBookmarks,
  saveFontSize,
  saveLastRead,
  saveTheme,
  type LastReadPosition,
} from './utils/storage';

interface ActiveAdhanBanner {
  prayerKey: AdhanPrayerKey;
  prayerNameAr: string;
  blockedByAutoplay: boolean;
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>('quran');
  const [theme, setThemeState] = useState<ThemeMode>(() => loadTheme());
  const [fontSize, setFontSizeState] = useState<number>(() => loadFontSize());
  const [lastRead, setLastRead] = useState<LastReadPosition>(() => loadLastRead());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks());
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [highlightAyah, setHighlightAyah] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isAdhanMuted, setIsAdhanMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('adhan_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [adhanBanner, setAdhanBanner] = useState<ActiveAdhanBanner | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermissionStatus>(() =>
    getBrowserNotificationPermission()
  );
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);

  const { surahs, loading, error, searchAyahs } = useQuranData();
  const { isPlaying: isQuranPlaying, activeTrack, togglePlayPause } = useAudioPlayer();

  const isQuranPlayingRef = useRef(isQuranPlaying);
  const togglePlayPauseRef = useRef(togglePlayPause);
  const notifierRef = useRef<AdhanNotifier | null>(null);

  useEffect(() => {
    isQuranPlayingRef.current = isQuranPlaying;
  }, [isQuranPlaying]);

  useEffect(() => {
    togglePlayPauseRef.current = togglePlayPause;
  }, [togglePlayPause]);

  useEffect(() => {
    const notifier = new AdhanNotifier(
      () => {
        const cfg = loadPrayerConfig();
        return getPrayerTimes24h(cfg.latitude, cfg.longitude, cfg.method, cfg.madhab);
      },
      {
        onAdhanTriggered: (prayerKey, prayerNameAr) => {
          if (isQuranPlayingRef.current) {
            void togglePlayPauseRef.current();
          }
          setIsAdhanPlaying(true);
          setAdhanBanner({ prayerKey, prayerNameAr, blockedByAutoplay: false });
        },
        onAdhanEnded: () => {
          setIsAdhanPlaying(false);
          setAdhanBanner((prev) => (prev && !prev.blockedByAutoplay ? null : prev));
        },
        onAutoplayBlocked: (prayerKey, prayerNameAr) => {
          setIsAdhanPlaying(false);
          setAdhanBanner({ prayerKey, prayerNameAr, blockedByAutoplay: true });
        },
        onMuteChange: (muted) => {
          setIsAdhanMuted(muted);
        },
      }
    );

    notifierRef.current = notifier;
    setIsAdhanMuted(notifier.isMuted);

    return () => {
      notifier.destroy();
      notifierRef.current = null;
    };
  }, []);

  const handleRequestNotifications = useCallback(async () => {
    const result = await requestNotificationPermission();
    setNotificationStatus(result.status);
    if (result.granted) {
      setNotificationFeedback('تم تفعيل إشعارات سطح المكتب لمواقيت الصلاة بنجاح.');
      await notifierRef.current?.showDesktopNotification(
        'إشعارات مواقيت الصلاة مفعّلة',
        'سيصلك تنبيه محلي عند دخول وقت كل صلاة بإذن الله.'
      );
    } else {
      setNotificationFeedback(result.message ?? null);
    }
  }, []);

  const handleToggleAdhanMute = useCallback(() => {
    if (!notifierRef.current) return;
    const next = notifierRef.current.toggleMute();
    setIsAdhanMuted(next);
    if (next) {
      setIsAdhanPlaying(false);
      setAdhanBanner(null);
    } else if (getBrowserNotificationPermission() === 'default') {
      void handleRequestNotifications();
    }
  }, [handleRequestNotifications]);

  const handleTestAdhan = useCallback(async () => {
    if (!notifierRef.current) return;
    if (isQuranPlayingRef.current) {
      await togglePlayPauseRef.current();
    }
    const playing = await notifierRef.current.testAdhan();
    setIsAdhanPlaying(playing);
  }, []);

  const handleStopAdhan = useCallback(() => {
    notifierRef.current?.stopAdhan();
    setIsAdhanPlaying(false);
    setAdhanBanner(null);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleChangeFontSize = useCallback((next: number) => {
    setFontSizeState(next);
    saveFontSize(next);
  }, []);

  const handleOpenSurah = useCallback((surahNumber: number, ayahNumber?: number) => {
    setActiveTab('quran');
    setSelectedSurahNumber(surahNumber);
    setHighlightAyah(ayahNumber ?? null);
    const ayahToSave = ayahNumber ?? 1;
    saveLastRead(surahNumber, ayahToSave);
    setLastRead({ surahNumber, ayahNumber: ayahToSave, updatedAt: Date.now() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCloseSurah = useCallback(() => {
    setSelectedSurahNumber(null);
    setHighlightAyah(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) =>
          b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
      );
      const next = exists
        ? prev.filter(
            (b) =>
              !(b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber)
          )
        : [bookmark, ...prev];
      saveBookmarks(next);
      return next;
    });
  }, []);

  const handleSelectTab = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    if (tab !== 'quran') {
      setSelectedSurahNumber(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] dark:bg-[#071411] text-[#10241E] dark:text-[#F5F2EB]">
      <SplashScreen />

      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <OfflineIndicator />

      {/* Live Adhan Banner */}
      {adhanBanner && (
        <div
          role="alert"
          className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-md rounded-2xl bg-[#0C4A3E] text-[#F5F2EB] border border-[#D4AF37] p-4 shadow-xl flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
              {isAdhanMuted ? (
                <BellOff className="w-5 h-5 text-[#D4AF37]" />
              ) : (
                <Bell className="w-5 h-5 text-[#D4AF37]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-quran text-lg font-bold truncate">
                حان الآن وقت صلاة {adhanBanner.prayerNameAr}
              </p>
              <p className="text-xs text-white/80">
                {adhanBanner.blockedByAutoplay
                  ? 'اضغط لتشغيل الأذان بصوت مكة المكرمة'
                  : 'يُرفع الآن صوت الأذان'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {adhanBanner.blockedByAutoplay ? (
              <button
                type="button"
                onClick={() => {
                  notifierRef.current?.triggerAdhan(adhanBanner.prayerKey);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-[#071411] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>تشغيل الأذان</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopAdhan}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium cursor-pointer"
              >
                إيقاف الأذان
              </button>
            )}
            <button
              type="button"
              onClick={handleStopAdhan}
              aria-label="إغلاق تنبيه الأذان"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pb-36 md:pb-28">
        {activeTab === 'quran' && (
          <QuranSection
            surahs={surahs}
            loading={loading}
            error={error}
            searchAyahs={searchAyahs}
            selectedSurahNumber={selectedSurahNumber}
            highlightAyah={highlightAyah}
            onOpenSurah={handleOpenSurah}
            onCloseSurah={handleCloseSurah}
            lastRead={lastRead}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            fontSize={fontSize}
            onChangeFontSize={handleChangeFontSize}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {activeTab === 'prayers' && (
          <PrayerTimesSection
            isAdhanMuted={isAdhanMuted}
            isAdhanPlaying={isAdhanPlaying}
            onToggleAdhanMute={handleToggleAdhanMute}
            onTestAdhan={() => void handleTestAdhan()}
            onStopAdhan={handleStopAdhan}
            notificationStatus={notificationStatus}
            notificationFeedback={notificationFeedback}
            onRequestNotifications={() => void handleRequestNotifications()}
          />
        )}
        {activeTab === 'roqya' && <RoqyaSection />}
        {activeTab === 'duas' && <DuasSection />}
        {activeTab === 'names' && <NamesOfAllahSection />}
      </main>

      <footer className="border-t border-[#E6E2D8] dark:border-[#1A352E] py-6 px-4 sm:px-6 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4A5D56] dark:text-[#9FB3AC]">
          <p className="font-quran text-base font-bold text-[#0C4A3E] dark:text-[#D4AF37]">
            القرآن الكريم لأبي الحسين
          </p>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 hover:text-[#10241E] dark:hover:text-[#F5F2EB] transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#B88A1E] dark:text-[#D4AF37]" />
            <span>خصوصية تامة: صفر بيانات مجمّعة · جميع التفضيلات محفوظة على جهازك فقط</span>
          </button>
        </div>
      </footer>

      <DownloadProgressToast />

      <PWAInstallButton variant="floating" hasActiveAudioBar={!!activeTrack} />

      <AudioPlayerBar onOpenSurahFromPlayer={handleOpenSurah} />

      <MobileBottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onSetTheme={setThemeState}
        fontSize={fontSize}
        onChangeFontSize={handleChangeFontSize}
        isAdhanMuted={isAdhanMuted}
        onToggleAdhanMute={handleToggleAdhanMute}
        notificationStatus={notificationStatus}
        notificationFeedback={notificationFeedback}
        onRequestNotifications={() => void handleRequestNotifications()}
      />
    </div>
  );
}

export default function App() {
  return (
    <AudioPlayerProvider>
      <AppShell />
    </AudioPlayerProvider>
  );
}
