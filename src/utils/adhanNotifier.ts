export type AdhanPrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationPermissionResult {
  granted: boolean;
  status: NotificationPermissionStatus;
  message?: string;
}

export interface AdhanNotifierCallbacks {
  onAdhanTriggered?: (prayerKey: AdhanPrayerKey, prayerNameAr: string) => void;
  onAdhanEnded?: () => void;
  onAutoplayBlocked?: (prayerKey: AdhanPrayerKey, prayerNameAr: string) => void;
  onMuteChange?: (isMuted: boolean) => void;
}

const PRAYER_NAMES_AR: Record<AdhanPrayerKey, string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

const MUTE_STORAGE_KEY = 'adhan_muted';
const LOCAL_ADHAN_URL = '/audio/adhan.mp3';
const REMOTE_ADHAN_URL = 'https://www.islamcan.com/audio/adhan/azan1.mp3';

export function getBrowserNotificationPermission(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      granted: false,
      status: 'unsupported',
      message: 'عذراً، متصفحك لا يدعم إشعارات سطح المكتب.',
    };
  }

  let permission: NotificationPermission = Notification.permission;

  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      return {
        granted: false,
        status: Notification.permission,
        message: 'تعذر طلب إذن الإشعارات من المتصفح.',
      };
    }
  }

  if (permission === 'granted') {
    return { granted: true, status: 'granted' };
  }

  return {
    granted: false,
    status: permission,
    message: 'تم رفض إذن الإشعارات؛ يمكنك تفعيله من إعدادات المتصفح.',
  };
}

export class AdhanNotifier {
  private getTimes: () => Record<AdhanPrayerKey, string>;
  private callbacks: AdhanNotifierCallbacks;
  private audio: HTMLAudioElement;
  public isMuted: boolean;
  private lastPlayedKey: string | null = null;
  private timerId: number | null = null;
  private isTesting = false;

  constructor(
    getPrayerTimesCallback: () => Record<AdhanPrayerKey, string>,
    callbacks: AdhanNotifierCallbacks = {}
  ) {
    this.getTimes = getPrayerTimesCallback;
    this.callbacks = callbacks;

    this.audio = new Audio(LOCAL_ADHAN_URL);
    this.audio.preload = 'auto';

    this.audio.addEventListener('error', () => {
      if (this.audio.src && !this.audio.src.includes('islamcan.com')) {
        this.audio.src = REMOTE_ADHAN_URL;
      }
    });

    this.audio.addEventListener('ended', () => {
      this.isTesting = false;
      this.callbacks.onAdhanEnded?.();
    });

    try {
      this.isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    } catch {
      this.isMuted = false;
    }

    this.startTimer();
  }

  setCallbacks(callbacks: AdhanNotifierCallbacks): void {
    this.callbacks = callbacks;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(this.isMuted));
    } catch {
      // ignore
    }
    if (this.isMuted) {
      this.stopAdhan();
    } else {
      this.unlockAudio();
    }
    this.callbacks.onMuteChange?.(this.isMuted);
    return this.isMuted;
  }

  /**
   * Unlocks browser autoplay policy via user-gesture priming when enabling Adhan alerts.
   */
  unlockAudio(): void {
    if (this.isPlaying()) return;
    this.audio
      .play()
      .then(() => {
        if (!this.isTesting) {
          this.audio.pause();
          this.audio.currentTime = 0;
        }
      })
      .catch(() => {
        // Ignore if browser rejects silent priming
      });
  }

  async showDesktopNotification(
    title: string,
    body: string,
    persistent = false
  ): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const options: NotificationOptions & { renotify?: boolean } = {
      body,
      icon: '/assets/icon-192.png',
      badge: '/assets/icon-192.png',
      tag: 'prayer-time-alert',
      dir: 'rtl',
      lang: 'ar',
      ...(persistent ? { renotify: true, requireInteraction: true } : {}),
    };

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && typeof reg.showNotification === 'function') {
          await reg.showNotification(title, options);
          return;
        }
      }
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Fallback if environment restricts Notification options
    }
  }

  startTimer(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
    // Check every 30 seconds for prayer time entry
    this.timerId = window.setInterval(() => {
      this.checkAndPlayAdhan();
    }, 30000);
  }

  destroy(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.stopAdhan();
  }

  checkAndPlayAdhan(): void {
    if (this.isMuted) return;

    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const prayerTimes = this.getTimes();

    for (const [prayerName, timeStr] of Object.entries(prayerTimes) as [
      AdhanPrayerKey,
      string,
    ][]) {
      const playKey = `${prayerName}-${timeStr}-${now.toDateString()}`;

      if (timeStr === currentTimeStr && this.lastPlayedKey !== playKey) {
        this.lastPlayedKey = playKey;
        this.triggerAdhanAndNotification(prayerName);
        break;
      }
    }
  }

  triggerAdhanAndNotification(prayerName: AdhanPrayerKey): void {
    const labelAr = PRAYER_NAMES_AR[prayerName] || 'الصلاة';

    // 1. Play Adhan audio
    this.isTesting = false;
    this.audio.currentTime = 0;

    this.audio
      .play()
      .then(() => {
        this.callbacks.onAdhanTriggered?.(prayerName, labelAr);
      })
      .catch(() => {
        this.callbacks.onAutoplayBlocked?.(prayerName, labelAr);
      });

    // 2. Send persistent desktop/mobile notification if granted
    void this.showDesktopNotification(
      `وقت صلاة ${labelAr}`,
      `حانت الآن صلاة ${labelAr} حسب التوقيت المحلي. تقبل الله طاعتكم.`,
      true
    );
  }

  triggerAdhan(prayerName: AdhanPrayerKey): void {
    this.triggerAdhanAndNotification(prayerName);
  }

  async testAdhan(): Promise<boolean> {
    if (this.isTesting && !this.audio.paused) {
      this.stopAdhan();
      return false;
    }
    this.isTesting = true;
    this.audio.currentTime = 0;
    try {
      await this.audio.play();
      return true;
    } catch {
      this.isTesting = false;
      return false;
    }
  }

  stopAdhan(): void {
    this.isTesting = false;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.callbacks.onAdhanEnded?.();
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }
}

export default AdhanNotifier;
