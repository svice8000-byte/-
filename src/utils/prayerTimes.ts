import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  Prayer,
  PrayerTimes,
  Qibla,
} from 'adhan';
import type { PrayerMethodId } from '../types/quran';

export interface PrayerTimingsFormatted {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface LocalPrayerSummary {
  timings: PrayerTimingsFormatted;
  nextPrayer: {
    id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    name: string;
    time: string;
    rawTime: Date;
    isTomorrow: boolean;
  };
  qiblaDegrees: number;
  hijriDate: string;
  gregorianDate: string;
}

function resolveCalculationParams(
  method: PrayerMethodId,
  madhab: 'shafi' | 'hanafi'
): CalculationParameters {
  let params: CalculationParameters;

  switch (method) {
    case 'Morocco':
      // Official Moroccan Ministry of Habous and Islamic Affairs parameters (Fajr 19°, Isha 17°, +5m Dhuhr/Maghrib)
      params = CalculationMethod.Other();
      params.fajrAngle = 19;
      params.ishaAngle = 17;
      params.adjustments = {
        ...params.adjustments,
        dhuhr: 5,
        maghrib: 5,
      };
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'MuslimWorldLeague':
    default:
      params = CalculationMethod.MuslimWorldLeague();
      break;
  }

  params.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return params;
}

export function getLocalPrayerTimes(
  latitude = 33.5731,
  longitude = -7.5898,
  method: PrayerMethodId = 'Morocco',
  options: { hour12?: boolean; madhab?: 'shafi' | 'hanafi'; date?: Date } = {}
): LocalPrayerSummary {
  const { hour12 = false, madhab = 'shafi', date = new Date() } = options;
  const coordinates = new Coordinates(latitude, longitude);
  const params = resolveCalculationParams(method, madhab);
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const formatTime = (timeObj: Date) =>
    timeObj.toLocaleTimeString('ar-MA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12,
    });

  const nextPrayerEnum = prayerTimes.nextPrayer(date);
  let nextPrayerId: LocalPrayerSummary['nextPrayer']['id'] = 'fajr';
  let nextPrayerName = 'الفجر';
  let nextPrayerRawTime: Date;
  let isTomorrow = false;

  switch (nextPrayerEnum) {
    case Prayer.Fajr:
      nextPrayerId = 'fajr';
      nextPrayerName = 'الفجر';
      nextPrayerRawTime = prayerTimes.fajr;
      break;
    case Prayer.Sunrise:
      nextPrayerId = 'sunrise';
      nextPrayerName = 'الشروق';
      nextPrayerRawTime = prayerTimes.sunrise;
      break;
    case Prayer.Dhuhr:
      nextPrayerId = 'dhuhr';
      nextPrayerName = 'الظهر';
      nextPrayerRawTime = prayerTimes.dhuhr;
      break;
    case Prayer.Asr:
      nextPrayerId = 'asr';
      nextPrayerName = 'العصر';
      nextPrayerRawTime = prayerTimes.asr;
      break;
    case Prayer.Maghrib:
      nextPrayerId = 'maghrib';
      nextPrayerName = 'المغرب';
      nextPrayerRawTime = prayerTimes.maghrib;
      break;
    case Prayer.Isha:
      nextPrayerId = 'isha';
      nextPrayerName = 'العشاء';
      nextPrayerRawTime = prayerTimes.isha;
      break;
    case Prayer.None:
    default: {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
      nextPrayerId = 'fajr';
      nextPrayerName = 'الفجر (غدًا)';
      nextPrayerRawTime = tomorrowTimes.fajr;
      isTomorrow = true;
      break;
    }
  }

  let hijriDate = '';
  try {
    hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    hijriDate = '';
  }

  let gregorianDate = '';
  try {
    gregorianDate = new Intl.DateTimeFormat('ar-MA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    gregorianDate = date.toLocaleDateString('ar');
  }

  return {
    timings: {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
    },
    nextPrayer: {
      id: nextPrayerId,
      name: nextPrayerName,
      time: formatTime(nextPrayerRawTime),
      rawTime: nextPrayerRawTime,
      isTomorrow,
    },
    qiblaDegrees: Math.round(Qibla(coordinates)),
    hijriDate,
    gregorianDate,
  };
}

export function formatCountdownTo(targetDate: Date, now: Date): string {
  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
  const totalSec = Math.floor(diffMs / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export function getPrayerTimes24h(
  latitude = 33.5731,
  longitude = -7.5898,
  method: PrayerMethodId = 'Morocco',
  madhab: 'shafi' | 'hanafi' = 'shafi',
  date: Date = new Date()
): Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', string> {
  const coordinates = new Coordinates(latitude, longitude);
  const params = resolveCalculationParams(method, madhab);
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const fmt24 = (d: Date) =>
    d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  return {
    fajr: fmt24(prayerTimes.fajr),
    dhuhr: fmt24(prayerTimes.dhuhr),
    asr: fmt24(prayerTimes.asr),
    maghrib: fmt24(prayerTimes.maghrib),
    isha: fmt24(prayerTimes.isha),
  };
}
