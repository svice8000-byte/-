import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RECITERS, getAyahAudioUrl, getSurahAudioUrl } from '../data/reciters';
import { ROQYA_ITEMS } from '../data/roqyaData';
import { SURAH_INDEX } from '../data/surahIndex';
import type { PlaybackMode, Reciter } from '../types/quran';
import {
  cacheSurahAudio,
  clearAllOfflineAudioCache,
  getOfflineAudioTotalMB,
  makeCacheKey,
  removeCachedSurahAudio,
  resolvePlayableAudioSrc,
  syncCachedSurahKeys,
} from '../utils/offlineAudioCache';
import {
  loadAutoCacheOnPlay,
  loadCachedSurahKeys,
  loadPlaybackMode,
  loadReciterId,
  saveAutoCacheOnPlay,
  savePlaybackMode,
  saveReciterId,
} from '../utils/storage';

export interface ActiveAudioState {
  kind: 'surah' | 'ayah' | 'roqya';
  title: string;
  subtitle: string;
  surahNumber?: number;
  ayahNumber?: number;
  roqyaId?: string;
  fromCache?: boolean;
}

interface RoqyaQueueStep {
  roqyaId: string;
  title: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface DownloadNotice {
  key: string;
  surahNumber: number;
  status: 'downloading' | 'completed' | 'error';
  percent: number;
  message: string;
}

interface AudioPlayerContextValue {
  reciter: Reciter;
  setReciterId: (id: string) => void;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  activeTrack: ActiveAudioState | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: (expanded: boolean) => void;
  cachedSurahKeys: string[];
  offlineStorageMB: number;
  autoCacheOnPlay: boolean;
  setAutoCacheOnPlay: (enabled: boolean) => void;
  downloadingKeys: string[];
  downloadProgress: Record<string, number>;
  downloadNotice: DownloadNotice | null;
  dismissDownloadNotice: () => void;
  playSurah: (surahNumber: number) => Promise<void>;
  playAyah: (surahNumber: number, ayahNumber: number) => Promise<void>;
  playRoqyaItem: (roqyaId: string) => Promise<void>;
  playRoqyaAll: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seekTo: (seconds: number) => void;
  stopAudio: () => void;
  downloadSurahOffline: (surahNumber: number) => Promise<boolean>;
  deleteSurahOffline: (surahNumber: number) => Promise<void>;
  clearOfflineAudio: () => Promise<void>;
  isSurahCachedForReciter: (surahNumber: number) => boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

function buildRoqyaSteps(startRoqyaId?: string): RoqyaQueueStep[] {
  const quranItems = ROQYA_ITEMS.filter((item) => item.audioSpecs);
  const steps: RoqyaQueueStep[] = [];
  let started = !startRoqyaId;

  for (const item of quranItems) {
    if (!started && item.id === startRoqyaId) {
      started = true;
    }
    if (started && item.audioSpecs) {
      for (const ayah of item.audioSpecs.ayahs) {
        steps.push({
          roqyaId: item.id,
          title: item.title,
          surahNumber: item.audioSpecs.surahNumber,
          ayahNumber: ayah,
        });
      }
    }
  }
  return steps;
}

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reciterId, setReciterIdState] = useState<string>(() => loadReciterId());
  const [playbackMode, setPlaybackModeState] = useState<PlaybackMode>(() => loadPlaybackMode());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<ActiveAudioState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [cachedSurahKeys, setCachedSurahKeys] = useState<string[]>(() => loadCachedSurahKeys());
  const [offlineStorageMB, setOfflineStorageMB] = useState<number>(0);
  const [autoCacheOnPlay, setAutoCacheOnPlayState] = useState<boolean>(() =>
    loadAutoCacheOnPlay()
  );
  const [downloadingKeys, setDownloadingKeys] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadNotice, setDownloadNotice] = useState<DownloadNotice | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceConnectedRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const shuffleHistoryRef = useRef<number[]>([]);
  const roqyaQueueRef = useRef<RoqyaQueueStep[]>([]);
  const roqyaIndexRef = useRef<number>(0);

  // Refs to access latest state inside native audio event listeners
  const activeTrackRef = useRef<ActiveAudioState | null>(null);
  const playbackModeRef = useRef<PlaybackMode>(playbackMode);
  const reciterRef = useRef<Reciter>(RECITERS[0]);
  const autoCacheOnPlayRef = useRef<boolean>(autoCacheOnPlay);

  const reciter = useMemo(
    () => RECITERS.find((r) => r.id === reciterId) || RECITERS[0],
    [reciterId]
  );

  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  useEffect(() => {
    reciterRef.current = reciter;
  }, [reciter]);

  useEffect(() => {
    autoCacheOnPlayRef.current = autoCacheOnPlay;
  }, [autoCacheOnPlay]);

  const ensureWebAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }
      if (!sourceConnectedRef.current) {
        const source = audioCtxRef.current.createMediaElementSource(audio);
        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);
        gainNodeRef.current = gainNode;
        sourceConnectedRef.current = true;
      }
    } catch {
      // Fallback safely to native HTMLAudioElement output if Web Audio API fails
    }
  }, [volume]);

  const revokePreviousObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const updateMediaSession = useCallback(
    (track: ActiveAudioState, playing: boolean) => {
      if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: reciterRef.current.nameAr,
          album: 'القرآن الكريم لأبي الحسين',
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        });
        navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
      } catch {
        // Ignore on unsupported browsers
      }
    },
    []
  );

  const loadAndPlayUrl = useCallback(
    async (rawUrl: string, track: ActiveAudioState, storageKey?: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setActiveTrack(track);
      activeTrackRef.current = track;

      try {
        revokePreviousObjectUrl();
        if (storageKey && autoCacheOnPlayRef.current) {
          setDownloadingKeys((prev) => (prev.includes(storageKey) ? prev : [...prev, storageKey]));
          setDownloadProgress((prev) => ({ ...prev, [storageKey]: 0 }));
        }
        const resolved = await resolvePlayableAudioSrc(rawUrl, {
          storageKey,
          autoSave: Boolean(storageKey && autoCacheOnPlayRef.current),
          signal: controller.signal,
          onProgress: (percent) => {
            if (storageKey) {
              setDownloadProgress((prev) => ({ ...prev, [storageKey]: percent }));
            }
          },
          onSaved: () => {
            void (async () => {
              setCachedSurahKeys(await syncCachedSurahKeys());
              setOfflineStorageMB(await getOfflineAudioTotalMB());
            })();
          },
        });
        if (storageKey) {
          setDownloadingKeys((prev) => prev.filter((k) => k !== storageKey));
          setDownloadProgress((prev) => {
            const next = { ...prev };
            delete next[storageKey];
            return next;
          });
        }

        if (controller.signal.aborted) return;

        if (resolved.isObjectUrl) {
          objectUrlRef.current = resolved.src;
        }
        const finalTrack = { ...track, fromCache: resolved.fromCache };
        setActiveTrack(finalTrack);
        activeTrackRef.current = finalTrack;

        audio.src = resolved.src;
        audio.playbackRate = playbackRate;
        audio.volume = volume;
        ensureWebAudioGraph();

        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
        updateMediaSession(finalTrack, true);
      } catch (err) {
        if (storageKey) {
          setDownloadingKeys((prev) => prev.filter((k) => k !== storageKey));
          setDownloadProgress((prev) => {
            const next = { ...prev };
            delete next[storageKey];
            return next;
          });
        }
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        // Fallback to direct streaming URL on unexpected ObjectURL/WebAudio failure
        try {
          if (audio.src !== rawUrl) {
            audio.src = rawUrl;
            audio.playbackRate = playbackRate;
            audio.volume = volume;
            await audio.play();
            setIsPlaying(true);
            setIsLoading(false);
            updateMediaSession(track, true);
            return;
          }
        } catch {
          // Fall through to error UI
        }
        setIsLoading(false);
        setIsPlaying(false);
        setError('تعذر تشغيل التلاوة حاليًا. تحقق من الاتصال بالإنترنت أو اختر سورة محفوظة محليًا.');
      }
    },
    [ensureWebAudioGraph, playbackRate, revokePreviousObjectUrl, updateMediaSession, volume]
  );

  const playSurah = useCallback(
    async (surahNumber: number) => {
      const meta = SURAH_INDEX.find((s) => s.number === surahNumber);
      if (!meta) return;
      roqyaQueueRef.current = [];
      const url = getSurahAudioUrl(reciterRef.current, surahNumber);
      const storageKey = makeCacheKey(reciterRef.current.id, surahNumber);
      await loadAndPlayUrl(
        url,
        {
          kind: 'surah',
          title: meta.name,
          subtitle: `${reciterRef.current.nameAr} · ${meta.ayahCount} آية`,
          surahNumber,
        },
        storageKey
      );
    },
    [loadAndPlayUrl]
  );

  const playAyah = useCallback(
    async (surahNumber: number, ayahNumber: number) => {
      const meta = SURAH_INDEX.find((s) => s.number === surahNumber);
      if (!meta) return;
      roqyaQueueRef.current = [];
      const url = getAyahAudioUrl(reciterRef.current, surahNumber, ayahNumber);
      await loadAndPlayUrl(url, {
        kind: 'ayah',
        title: `${meta.name} · آية ${ayahNumber}`,
        subtitle: reciterRef.current.nameAr,
        surahNumber,
        ayahNumber,
      });
    },
    [loadAndPlayUrl]
  );

  const playRoqyaStepAt = useCallback(
    async (index: number) => {
      const step = roqyaQueueRef.current[index];
      if (!step) {
        setIsPlaying(false);
        return;
      }
      roqyaIndexRef.current = index;
      const url = getAyahAudioUrl(reciterRef.current, step.surahNumber, step.ayahNumber);
      await loadAndPlayUrl(url, {
        kind: 'roqya',
        title: step.title,
        subtitle: `${reciterRef.current.nameAr} · الرقية الشرعية`,
        surahNumber: step.surahNumber,
        ayahNumber: step.ayahNumber,
        roqyaId: step.roqyaId,
      });
    },
    [loadAndPlayUrl]
  );

  const playRoqyaItem = useCallback(
    async (roqyaId: string) => {
      const steps = buildRoqyaSteps(roqyaId);
      if (steps.length === 0) return;
      roqyaQueueRef.current = steps;
      await playRoqyaStepAt(0);
    },
    [playRoqyaStepAt]
  );

  const playRoqyaAll = useCallback(async () => {
    const steps = buildRoqyaSteps();
    if (steps.length === 0) return;
    roqyaQueueRef.current = steps;
    await playRoqyaStepAt(0);
  }, [playRoqyaStepAt]);

  const getNextSurahNumber = useCallback((current: number): number => {
    const mode = playbackModeRef.current;
    if (mode === 'repeat-one') return current;
    if (mode === 'shuffle') {
      shuffleHistoryRef.current.push(current);
      if (shuffleHistoryRef.current.length > 50) {
        shuffleHistoryRef.current.shift();
      }
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * 114) + 1;
      }
      return next;
    }
    return current >= 114 ? 1 : current + 1;
  }, []);

  const nextTrack = useCallback(async () => {
    const track = activeTrackRef.current;
    if (!track) {
      await playSurah(1);
      return;
    }

    if (track.kind === 'roqya' && roqyaQueueRef.current.length > 0) {
      const nextIdx = roqyaIndexRef.current + 1;
      if (nextIdx < roqyaQueueRef.current.length) {
        await playRoqyaStepAt(nextIdx);
      } else if (playbackModeRef.current === 'repeat-one') {
        await playRoqyaStepAt(0);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    if (track.kind === 'ayah' && track.surahNumber && track.ayahNumber) {
      const meta = SURAH_INDEX.find((s) => s.number === track.surahNumber);
      if (meta && track.ayahNumber < meta.ayahCount) {
        await playAyah(track.surahNumber, track.ayahNumber + 1);
        return;
      }
      const nextSurah = getNextSurahNumber(track.surahNumber);
      await playAyah(nextSurah, 1);
      return;
    }

    if (track.surahNumber) {
      const nextSurah =
        playbackModeRef.current === 'repeat-one'
          ? track.surahNumber >= 114
            ? 1
            : track.surahNumber + 1
          : getNextSurahNumber(track.surahNumber);
      await playSurah(nextSurah);
    }
  }, [getNextSurahNumber, playAyah, playRoqyaStepAt, playSurah]);

  const prevTrack = useCallback(async () => {
    const track = activeTrackRef.current;
    if (!track) return;

    if (audioRef.current && audioRef.current.currentTime > 4) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (track.kind === 'roqya' && roqyaQueueRef.current.length > 0) {
      const prevIdx = Math.max(0, roqyaIndexRef.current - 1);
      await playRoqyaStepAt(prevIdx);
      return;
    }

    if (track.kind === 'ayah' && track.surahNumber && track.ayahNumber) {
      if (track.ayahNumber > 1) {
        await playAyah(track.surahNumber, track.ayahNumber - 1);
      } else {
        const prevSurah = track.surahNumber <= 1 ? 114 : track.surahNumber - 1;
        await playAyah(prevSurah, 1);
      }
      return;
    }

    if (track.surahNumber) {
      if (playbackModeRef.current === 'shuffle' && shuffleHistoryRef.current.length > 0) {
        const prev = shuffleHistoryRef.current.pop()!;
        await playSurah(prev);
      } else {
        const prev = track.surahNumber <= 1 ? 114 : track.surahNumber - 1;
        await playSurah(prev);
      }
    }
  }, [playAyah, playRoqyaStepAt, playSurah]);

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!activeTrackRef.current) {
      await playSurah(1);
      return;
    }
    if (audio.paused) {
      ensureWebAudioGraph();
      try {
        await audio.play();
        setIsPlaying(true);
        if (activeTrackRef.current) {
          updateMediaSession(activeTrackRef.current, true);
        }
      } catch {
        setError('تعذر استئناف التلاوة.');
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      if (activeTrackRef.current) {
        updateMediaSession(activeTrackRef.current, false);
      }
    }
  }, [ensureWebAudioGraph, playSurah, updateMediaSession]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || seconds));
    setCurrentTime(audio.currentTime);
  }, []);

  const stopAudio = useCallback(() => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
      fetchAbortRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    revokePreviousObjectUrl();
    roqyaQueueRef.current = [];
    setIsPlaying(false);
    setActiveTrack(null);
    activeTrackRef.current = null;
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsPlayerExpanded(false);
  }, [revokePreviousObjectUrl]);

  const setReciterId = useCallback(
    (id: string) => {
      setReciterIdState(id);
      saveReciterId(id);
      const nextReciter = RECITERS.find((r) => r.id === id) || RECITERS[0];
      reciterRef.current = nextReciter;

      const current = activeTrackRef.current;
      if (current) {
        if (current.kind === 'surah' && current.surahNumber) {
          void playSurah(current.surahNumber);
        } else if (current.kind === 'ayah' && current.surahNumber && current.ayahNumber) {
          void playAyah(current.surahNumber, current.ayahNumber);
        } else if (current.kind === 'roqya') {
          void playRoqyaStepAt(roqyaIndexRef.current);
        }
      }
    },
    [playAyah, playRoqyaStepAt, playSurah]
  );

  const setPlaybackMode = useCallback((mode: PlaybackMode) => {
    setPlaybackModeState(mode);
    savePlaybackMode(mode);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clamped;
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  // Initialize hidden <audio> element & wire Media Session + auto-transition
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      if (
        typeof navigator !== 'undefined' &&
        'mediaSession' in navigator &&
        typeof navigator.mediaSession.setPositionState === 'function' &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(audio.currentTime || 0, audio.duration),
          });
        } catch {
          // ignore
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (activeTrackRef.current) {
        updateMediaSession(activeTrackRef.current, true);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (activeTrackRef.current) {
        updateMediaSession(activeTrackRef.current, false);
      }
    };

    const handleEnded = async () => {
      const track = activeTrackRef.current;
      if (!track) return;

      if (track.kind === 'roqya' && roqyaQueueRef.current.length > 0) {
        const nextIdx = roqyaIndexRef.current + 1;
        if (nextIdx < roqyaQueueRef.current.length) {
          await playRoqyaStepAt(nextIdx);
        } else {
          setIsPlaying(false);
        }
        return;
      }

      if (track.kind === 'ayah' && track.surahNumber && track.ayahNumber) {
        const meta = SURAH_INDEX.find((s) => s.number === track.surahNumber);
        if (meta && track.ayahNumber < meta.ayahCount) {
          await playAyah(track.surahNumber, track.ayahNumber + 1);
        } else {
          const nextSurah = getNextSurahNumber(track.surahNumber);
          await playAyah(nextSurah, 1);
        }
        return;
      }

      if (track.kind === 'surah' && track.surahNumber) {
        if (playbackModeRef.current === 'repeat-one') {
          audio.currentTime = 0;
          void audio.play();
          return;
        }
        const nextSurah = getNextSurahNumber(track.surahNumber);
        await playSurah(nextSurah);
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('تعذر تحميل ملف التلاوة. يرجى التحقق من الشبكة أو اختيار سورة محفوظة.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Media Session action handlers for lock-screen / background controls
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      const ms = navigator.mediaSession;
      try {
        ms.setActionHandler('play', () => {
          void togglePlayPause();
        });
        ms.setActionHandler('pause', () => {
          void togglePlayPause();
        });
        ms.setActionHandler('nexttrack', () => {
          void nextTrack();
        });
        ms.setActionHandler('previoustrack', () => {
          void prevTrack();
        });
        ms.setActionHandler('seekbackward', (details) => {
          seekTo((audio.currentTime || 0) - (details.seekOffset || 10));
        });
        ms.setActionHandler('seekforward', (details) => {
          seekTo((audio.currentTime || 0) + (details.seekOffset || 10));
        });
        ms.setActionHandler('seekto', (details) => {
          if (typeof details.seekTime === 'number') {
            seekTo(details.seekTime);
          }
        });
      } catch {
        // ignore unsupported handlers
      }
    }

    const handleVisibilityChange = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended' && !audio.paused) {
        void audioCtxRef.current.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      revokePreviousObjectUrl();
    };
  }, [
    getNextSurahNumber,
    nextTrack,
    playAyah,
    playRoqyaStepAt,
    playSurah,
    prevTrack,
    revokePreviousObjectUrl,
    seekTo,
    togglePlayPause,
    updateMediaSession,
  ]);

  useEffect(() => {
    void (async () => {
      const synced = await syncCachedSurahKeys();
      setCachedSurahKeys(synced);
      const mb = await getOfflineAudioTotalMB();
      setOfflineStorageMB(mb);
    })();
  }, []);

  const dismissDownloadNotice = useCallback(() => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
    setDownloadNotice(null);
  }, []);

  const downloadSurahOffline = useCallback(
    async (surahNumber: number) => {
      const key = makeCacheKey(reciter.id, surahNumber);
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = null;
      }

      setDownloadingKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
      setDownloadProgress((prev) => ({ ...prev, [key]: 0 }));
      setDownloadNotice({
        key,
        surahNumber,
        status: 'downloading',
        percent: 0,
        message: 'جاري التحميل والحفظ محليًا...',
      });

      const ok = await cacheSurahAudio(reciter.id, surahNumber, (percent) => {
        setDownloadProgress((prev) => ({ ...prev, [key]: percent }));
        setDownloadNotice((prev) =>
          prev && prev.key === key
            ? { ...prev, percent, message: 'جاري التحميل والحفظ محليًا...' }
            : prev
        );
      });

      setDownloadingKeys((prev) => prev.filter((k) => k !== key));
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      if (ok) {
        setCachedSurahKeys(await syncCachedSurahKeys());
        setOfflineStorageMB(await getOfflineAudioTotalMB());
        setDownloadNotice({
          key,
          surahNumber,
          status: 'completed',
          percent: 100,
          message: 'اكتمل التحميل وأصبح متاحًا بدون إنترنت!',
        });
        noticeTimerRef.current = window.setTimeout(() => {
          setDownloadNotice((prev) => (prev?.key === key ? null : prev));
        }, 3000);
      } else {
        setDownloadNotice({
          key,
          surahNumber,
          status: 'error',
          percent: 0,
          message: 'فشل التحميل، يُرجى التحقق من الاتصال.',
        });
        noticeTimerRef.current = window.setTimeout(() => {
          setDownloadNotice((prev) => (prev?.key === key ? null : prev));
        }, 4500);
      }

      return ok;
    },
    [reciter.id]
  );

  const deleteSurahOffline = useCallback(
    async (surahNumber: number) => {
      await removeCachedSurahAudio(reciter.id, surahNumber);
      setCachedSurahKeys(await syncCachedSurahKeys());
      setOfflineStorageMB(await getOfflineAudioTotalMB());
    },
    [reciter.id]
  );

  const clearOfflineAudio = useCallback(async () => {
    await clearAllOfflineAudioCache();
    setCachedSurahKeys([]);
    setOfflineStorageMB(0);
  }, []);

  const setAutoCacheOnPlay = useCallback((enabled: boolean) => {
    setAutoCacheOnPlayState(enabled);
    saveAutoCacheOnPlay(enabled);
  }, []);

  const isSurahCachedForReciter = useCallback(
    (surahNumber: number) => {
      return cachedSurahKeys.includes(makeCacheKey(reciter.id, surahNumber));
    },
    [cachedSurahKeys, reciter.id]
  );

  const value: AudioPlayerContextValue = {
    reciter,
    setReciterId,
    playbackMode,
    setPlaybackMode,
    isPlaying,
    isLoading,
    error,
    activeTrack,
    currentTime,
    duration,
    playbackRate,
    setPlaybackRate,
    volume,
    setVolume,
    isPlayerExpanded,
    setIsPlayerExpanded,
    cachedSurahKeys,
    offlineStorageMB,
    autoCacheOnPlay,
    setAutoCacheOnPlay,
    downloadingKeys,
    downloadProgress,
    downloadNotice,
    dismissDownloadNotice,
    playSurah,
    playAyah,
    playRoqyaItem,
    playRoqyaAll,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    stopAudio,
    downloadSurahOffline,
    deleteSurahOffline,
    clearOfflineAudio,
    isSurahCachedForReciter,
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}
