export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahCount: number;
  juzStart: number;
  pageStart: number;
}

export const SURAH_INDEX: SurahMeta[] = [
  {
    "number": 1,
    "name": "سُورَةُ ٱلْفَاتِحَةِ",
    "englishName": "Al-Faatiha",
    "revelationType": "Meccan",
    "ayahCount": 7,
    "juzStart": 1,
    "pageStart": 1
  },
  {
    "number": 2,
    "name": "سُورَةُ البَقَرَةِ",
    "englishName": "Al-Baqara",
    "revelationType": "Medinan",
    "ayahCount": 286,
    "juzStart": 1,
    "pageStart": 2
  },
  {
    "number": 3,
    "name": "سُورَةُ آلِ عِمۡرَانَ",
    "englishName": "Aal-i-Imraan",
    "revelationType": "Medinan",
    "ayahCount": 200,
    "juzStart": 3,
    "pageStart": 50
  },
  {
    "number": 4,
    "name": "سُورَةُ النِّسَاءِ",
    "englishName": "An-Nisaa",
    "revelationType": "Medinan",
    "ayahCount": 176,
    "juzStart": 4,
    "pageStart": 77
  },
  {
    "number": 5,
    "name": "سُورَةُ المَائـِدَةِ",
    "englishName": "Al-Maaida",
    "revelationType": "Medinan",
    "ayahCount": 120,
    "juzStart": 6,
    "pageStart": 106
  },
  {
    "number": 6,
    "name": "سُورَةُ الأَنۡعَامِ",
    "englishName": "Al-An'aam",
    "revelationType": "Meccan",
    "ayahCount": 165,
    "juzStart": 7,
    "pageStart": 128
  },
  {
    "number": 7,
    "name": "سُورَةُ الأَعۡرَافِ",
    "englishName": "Al-A'raaf",
    "revelationType": "Meccan",
    "ayahCount": 206,
    "juzStart": 8,
    "pageStart": 151
  },
  {
    "number": 8,
    "name": "سُورَةُ الأَنفَالِ",
    "englishName": "Al-Anfaal",
    "revelationType": "Medinan",
    "ayahCount": 75,
    "juzStart": 9,
    "pageStart": 177
  },
  {
    "number": 9,
    "name": "سُورَةُ التَّوۡبَةِ",
    "englishName": "At-Tawba",
    "revelationType": "Medinan",
    "ayahCount": 129,
    "juzStart": 10,
    "pageStart": 187
  },
  {
    "number": 10,
    "name": "سُورَةُ يُونُسَ",
    "englishName": "Yunus",
    "revelationType": "Meccan",
    "ayahCount": 109,
    "juzStart": 11,
    "pageStart": 208
  },
  {
    "number": 11,
    "name": "سُورَةُ هُودٍ",
    "englishName": "Hud",
    "revelationType": "Meccan",
    "ayahCount": 123,
    "juzStart": 11,
    "pageStart": 221
  },
  {
    "number": 12,
    "name": "سُورَةُ يُوسُفَ",
    "englishName": "Yusuf",
    "revelationType": "Meccan",
    "ayahCount": 111,
    "juzStart": 12,
    "pageStart": 235
  },
  {
    "number": 13,
    "name": "سُورَةُ الرَّعۡدِ",
    "englishName": "Ar-Ra'd",
    "revelationType": "Medinan",
    "ayahCount": 43,
    "juzStart": 13,
    "pageStart": 249
  },
  {
    "number": 14,
    "name": "سُورَةُ إِبۡرَاهِيمَ",
    "englishName": "Ibrahim",
    "revelationType": "Meccan",
    "ayahCount": 52,
    "juzStart": 13,
    "pageStart": 255
  },
  {
    "number": 15,
    "name": "سُورَةُ الحِجۡرِ",
    "englishName": "Al-Hijr",
    "revelationType": "Meccan",
    "ayahCount": 99,
    "juzStart": 14,
    "pageStart": 262
  },
  {
    "number": 16,
    "name": "سُورَةُ النَّحۡلِ",
    "englishName": "An-Nahl",
    "revelationType": "Meccan",
    "ayahCount": 128,
    "juzStart": 14,
    "pageStart": 267
  },
  {
    "number": 17,
    "name": "سُورَةُ الإِسۡرَاءِ",
    "englishName": "Al-Israa",
    "revelationType": "Meccan",
    "ayahCount": 111,
    "juzStart": 15,
    "pageStart": 282
  },
  {
    "number": 18,
    "name": "سُورَةُ الكَهۡفِ",
    "englishName": "Al-Kahf",
    "revelationType": "Meccan",
    "ayahCount": 110,
    "juzStart": 15,
    "pageStart": 293
  },
  {
    "number": 19,
    "name": "سُورَةُ مَرۡيَمَ",
    "englishName": "Maryam",
    "revelationType": "Meccan",
    "ayahCount": 98,
    "juzStart": 16,
    "pageStart": 305
  },
  {
    "number": 20,
    "name": "سُورَةُ طه",
    "englishName": "Taa-Haa",
    "revelationType": "Meccan",
    "ayahCount": 135,
    "juzStart": 16,
    "pageStart": 312
  },
  {
    "number": 21,
    "name": "سُورَةُ الأَنبِيَاءِ",
    "englishName": "Al-Anbiyaa",
    "revelationType": "Meccan",
    "ayahCount": 112,
    "juzStart": 17,
    "pageStart": 322
  },
  {
    "number": 22,
    "name": "سُورَةُ الحَجِّ",
    "englishName": "Al-Hajj",
    "revelationType": "Medinan",
    "ayahCount": 78,
    "juzStart": 17,
    "pageStart": 332
  },
  {
    "number": 23,
    "name": "سُورَةُ المُؤۡمِنُونَ",
    "englishName": "Al-Muminoon",
    "revelationType": "Meccan",
    "ayahCount": 118,
    "juzStart": 18,
    "pageStart": 342
  },
  {
    "number": 24,
    "name": "سُورَةُ النُّورِ",
    "englishName": "An-Noor",
    "revelationType": "Medinan",
    "ayahCount": 64,
    "juzStart": 18,
    "pageStart": 350
  },
  {
    "number": 25,
    "name": "سُورَةُ الفُرۡقَانِ",
    "englishName": "Al-Furqaan",
    "revelationType": "Meccan",
    "ayahCount": 77,
    "juzStart": 18,
    "pageStart": 359
  },
  {
    "number": 26,
    "name": "سُورَةُ الشُّعَرَاءِ",
    "englishName": "Ash-Shu'araa",
    "revelationType": "Meccan",
    "ayahCount": 227,
    "juzStart": 19,
    "pageStart": 367
  },
  {
    "number": 27,
    "name": "سُورَةُ النَّمۡلِ",
    "englishName": "An-Naml",
    "revelationType": "Meccan",
    "ayahCount": 93,
    "juzStart": 19,
    "pageStart": 377
  },
  {
    "number": 28,
    "name": "سُورَةُ القَصَصِ",
    "englishName": "Al-Qasas",
    "revelationType": "Meccan",
    "ayahCount": 88,
    "juzStart": 20,
    "pageStart": 385
  },
  {
    "number": 29,
    "name": "سُورَةُ العَنكَبُوتِ",
    "englishName": "Al-Ankaboot",
    "revelationType": "Meccan",
    "ayahCount": 69,
    "juzStart": 20,
    "pageStart": 396
  },
  {
    "number": 30,
    "name": "سُورَةُ الرُّومِ",
    "englishName": "Ar-Room",
    "revelationType": "Meccan",
    "ayahCount": 60,
    "juzStart": 21,
    "pageStart": 404
  },
  {
    "number": 31,
    "name": "سُورَةُ لُقۡمَانَ",
    "englishName": "Luqman",
    "revelationType": "Meccan",
    "ayahCount": 34,
    "juzStart": 21,
    "pageStart": 411
  },
  {
    "number": 32,
    "name": "سُورَةُ السَّجۡدَةِ",
    "englishName": "As-Sajda",
    "revelationType": "Meccan",
    "ayahCount": 30,
    "juzStart": 21,
    "pageStart": 415
  },
  {
    "number": 33,
    "name": "سُورَةُ الأَحۡزَابِ",
    "englishName": "Al-Ahzaab",
    "revelationType": "Medinan",
    "ayahCount": 73,
    "juzStart": 21,
    "pageStart": 418
  },
  {
    "number": 34,
    "name": "سُورَةُ سَبَإٍ",
    "englishName": "Saba",
    "revelationType": "Meccan",
    "ayahCount": 54,
    "juzStart": 22,
    "pageStart": 428
  },
  {
    "number": 35,
    "name": "سُورَةُ فَاطِرٍ",
    "englishName": "Faatir",
    "revelationType": "Meccan",
    "ayahCount": 45,
    "juzStart": 22,
    "pageStart": 434
  },
  {
    "number": 36,
    "name": "سُورَةُ يسٓ",
    "englishName": "Yaseen",
    "revelationType": "Meccan",
    "ayahCount": 83,
    "juzStart": 22,
    "pageStart": 440
  },
  {
    "number": 37,
    "name": "سُورَةُ الصَّافَّاتِ",
    "englishName": "As-Saaffaat",
    "revelationType": "Meccan",
    "ayahCount": 182,
    "juzStart": 23,
    "pageStart": 446
  },
  {
    "number": 38,
    "name": "سُورَةُ صٓ",
    "englishName": "Saad",
    "revelationType": "Meccan",
    "ayahCount": 88,
    "juzStart": 23,
    "pageStart": 453
  },
  {
    "number": 39,
    "name": "سُورَةُ الزُّمَرِ",
    "englishName": "Az-Zumar",
    "revelationType": "Meccan",
    "ayahCount": 75,
    "juzStart": 23,
    "pageStart": 458
  },
  {
    "number": 40,
    "name": "سُورَةُ غَافِرٍ",
    "englishName": "Ghafir",
    "revelationType": "Meccan",
    "ayahCount": 85,
    "juzStart": 24,
    "pageStart": 467
  },
  {
    "number": 41,
    "name": "سُورَةُ فُصِّلَتۡ",
    "englishName": "Fussilat",
    "revelationType": "Meccan",
    "ayahCount": 54,
    "juzStart": 24,
    "pageStart": 477
  },
  {
    "number": 42,
    "name": "سُورَةُ الشُّورَىٰ",
    "englishName": "Ash-Shura",
    "revelationType": "Meccan",
    "ayahCount": 53,
    "juzStart": 25,
    "pageStart": 483
  },
  {
    "number": 43,
    "name": "سُورَةُ الزُّخۡرُفِ",
    "englishName": "Az-Zukhruf",
    "revelationType": "Meccan",
    "ayahCount": 89,
    "juzStart": 25,
    "pageStart": 489
  },
  {
    "number": 44,
    "name": "سُورَةُ الدُّخَانِ",
    "englishName": "Ad-Dukhaan",
    "revelationType": "Meccan",
    "ayahCount": 59,
    "juzStart": 25,
    "pageStart": 496
  },
  {
    "number": 45,
    "name": "سُورَةُ الجَاثِيَةِ",
    "englishName": "Al-Jaathiya",
    "revelationType": "Meccan",
    "ayahCount": 37,
    "juzStart": 25,
    "pageStart": 499
  },
  {
    "number": 46,
    "name": "سُورَةُ الأَحۡقَافِ",
    "englishName": "Al-Ahqaf",
    "revelationType": "Meccan",
    "ayahCount": 35,
    "juzStart": 26,
    "pageStart": 502
  },
  {
    "number": 47,
    "name": "سُورَةُ مُحَمَّدٍ",
    "englishName": "Muhammad",
    "revelationType": "Medinan",
    "ayahCount": 38,
    "juzStart": 26,
    "pageStart": 507
  },
  {
    "number": 48,
    "name": "سُورَةُ الفَتۡحِ",
    "englishName": "Al-Fath",
    "revelationType": "Medinan",
    "ayahCount": 29,
    "juzStart": 26,
    "pageStart": 511
  },
  {
    "number": 49,
    "name": "سُورَةُ الحُجُرَاتِ",
    "englishName": "Al-Hujuraat",
    "revelationType": "Medinan",
    "ayahCount": 18,
    "juzStart": 26,
    "pageStart": 515
  },
  {
    "number": 50,
    "name": "سُورَةُ قٓ",
    "englishName": "Qaaf",
    "revelationType": "Meccan",
    "ayahCount": 45,
    "juzStart": 26,
    "pageStart": 518
  },
  {
    "number": 51,
    "name": "سُورَةُ الذَّارِيَاتِ",
    "englishName": "Adh-Dhaariyat",
    "revelationType": "Meccan",
    "ayahCount": 60,
    "juzStart": 26,
    "pageStart": 520
  },
  {
    "number": 52,
    "name": "سُورَةُ الطُّورِ",
    "englishName": "At-Tur",
    "revelationType": "Meccan",
    "ayahCount": 49,
    "juzStart": 27,
    "pageStart": 523
  },
  {
    "number": 53,
    "name": "سُورَةُ النَّجۡمِ",
    "englishName": "An-Najm",
    "revelationType": "Meccan",
    "ayahCount": 62,
    "juzStart": 27,
    "pageStart": 526
  },
  {
    "number": 54,
    "name": "سُورَةُ القَمَرِ",
    "englishName": "Al-Qamar",
    "revelationType": "Meccan",
    "ayahCount": 55,
    "juzStart": 27,
    "pageStart": 528
  },
  {
    "number": 55,
    "name": "سُورَةُ الرَّحۡمَٰن",
    "englishName": "Ar-Rahmaan",
    "revelationType": "Medinan",
    "ayahCount": 78,
    "juzStart": 27,
    "pageStart": 531
  },
  {
    "number": 56,
    "name": "سُورَةُ الوَاقِعَةِ",
    "englishName": "Al-Waaqia",
    "revelationType": "Meccan",
    "ayahCount": 96,
    "juzStart": 27,
    "pageStart": 534
  },
  {
    "number": 57,
    "name": "سُورَةُ الحَدِيدِ",
    "englishName": "Al-Hadid",
    "revelationType": "Medinan",
    "ayahCount": 29,
    "juzStart": 27,
    "pageStart": 537
  },
  {
    "number": 58,
    "name": "سُورَةُ المُجَادلَةِ",
    "englishName": "Al-Mujaadila",
    "revelationType": "Medinan",
    "ayahCount": 22,
    "juzStart": 28,
    "pageStart": 542
  },
  {
    "number": 59,
    "name": "سُورَةُ الحَشۡرِ",
    "englishName": "Al-Hashr",
    "revelationType": "Medinan",
    "ayahCount": 24,
    "juzStart": 28,
    "pageStart": 545
  },
  {
    "number": 60,
    "name": "سُورَةُ المُمۡتَحنَةِ",
    "englishName": "Al-Mumtahana",
    "revelationType": "Medinan",
    "ayahCount": 13,
    "juzStart": 28,
    "pageStart": 549
  },
  {
    "number": 61,
    "name": "سُورَةُ الصَّفِّ",
    "englishName": "As-Saff",
    "revelationType": "Medinan",
    "ayahCount": 14,
    "juzStart": 28,
    "pageStart": 551
  },
  {
    "number": 62,
    "name": "سُورَةُ الجُمُعَةِ",
    "englishName": "Al-Jumu'a",
    "revelationType": "Medinan",
    "ayahCount": 11,
    "juzStart": 28,
    "pageStart": 553
  },
  {
    "number": 63,
    "name": "سُورَةُ المُنَافِقُونَ",
    "englishName": "Al-Munaafiqoon",
    "revelationType": "Medinan",
    "ayahCount": 11,
    "juzStart": 28,
    "pageStart": 554
  },
  {
    "number": 64,
    "name": "سُورَةُ التَّغَابُنِ",
    "englishName": "At-Taghaabun",
    "revelationType": "Medinan",
    "ayahCount": 18,
    "juzStart": 28,
    "pageStart": 556
  },
  {
    "number": 65,
    "name": "سُورَةُ الطَّلَاقِ",
    "englishName": "At-Talaaq",
    "revelationType": "Medinan",
    "ayahCount": 12,
    "juzStart": 28,
    "pageStart": 558
  },
  {
    "number": 66,
    "name": "سُورَةُ التَّحۡرِيمِ",
    "englishName": "At-Tahrim",
    "revelationType": "Medinan",
    "ayahCount": 12,
    "juzStart": 28,
    "pageStart": 560
  },
  {
    "number": 67,
    "name": "سُورَةُ المُلۡكِ",
    "englishName": "Al-Mulk",
    "revelationType": "Meccan",
    "ayahCount": 30,
    "juzStart": 29,
    "pageStart": 562
  },
  {
    "number": 68,
    "name": "سُورَةُ القَلَمِ",
    "englishName": "Al-Qalam",
    "revelationType": "Meccan",
    "ayahCount": 52,
    "juzStart": 29,
    "pageStart": 564
  },
  {
    "number": 69,
    "name": "سُورَةُ الحَاقَّةِ",
    "englishName": "Al-Haaqqa",
    "revelationType": "Meccan",
    "ayahCount": 52,
    "juzStart": 29,
    "pageStart": 566
  },
  {
    "number": 70,
    "name": "سُورَةُ المَعَارِجِ",
    "englishName": "Al-Ma'aarij",
    "revelationType": "Meccan",
    "ayahCount": 44,
    "juzStart": 29,
    "pageStart": 568
  },
  {
    "number": 71,
    "name": "سُورَةُ نُوحٍ",
    "englishName": "Nooh",
    "revelationType": "Meccan",
    "ayahCount": 28,
    "juzStart": 29,
    "pageStart": 570
  },
  {
    "number": 72,
    "name": "سُورَةُ الجِنِّ",
    "englishName": "Al-Jinn",
    "revelationType": "Meccan",
    "ayahCount": 28,
    "juzStart": 29,
    "pageStart": 572
  },
  {
    "number": 73,
    "name": "سُورَةُ المُزَّمِّلِ",
    "englishName": "Al-Muzzammil",
    "revelationType": "Meccan",
    "ayahCount": 20,
    "juzStart": 29,
    "pageStart": 574
  },
  {
    "number": 74,
    "name": "سُورَةُ المُدَّثِّرِ",
    "englishName": "Al-Muddaththir",
    "revelationType": "Meccan",
    "ayahCount": 56,
    "juzStart": 29,
    "pageStart": 575
  },
  {
    "number": 75,
    "name": "سُورَةُ القِيَامَةِ",
    "englishName": "Al-Qiyaama",
    "revelationType": "Meccan",
    "ayahCount": 40,
    "juzStart": 29,
    "pageStart": 577
  },
  {
    "number": 76,
    "name": "سُورَةُ الإِنسَانِ",
    "englishName": "Al-Insaan",
    "revelationType": "Medinan",
    "ayahCount": 31,
    "juzStart": 29,
    "pageStart": 578
  },
  {
    "number": 77,
    "name": "سُورَةُ المُرۡسَلَاتِ",
    "englishName": "Al-Mursalaat",
    "revelationType": "Meccan",
    "ayahCount": 50,
    "juzStart": 29,
    "pageStart": 580
  },
  {
    "number": 78,
    "name": "سُورَةُ النَّبَإِ",
    "englishName": "An-Naba",
    "revelationType": "Meccan",
    "ayahCount": 40,
    "juzStart": 30,
    "pageStart": 582
  },
  {
    "number": 79,
    "name": "سُورَةُ النَّازِعَاتِ",
    "englishName": "An-Naazi'aat",
    "revelationType": "Meccan",
    "ayahCount": 46,
    "juzStart": 30,
    "pageStart": 583
  },
  {
    "number": 80,
    "name": "سُورَةُ عَبَسَ",
    "englishName": "Abasa",
    "revelationType": "Meccan",
    "ayahCount": 42,
    "juzStart": 30,
    "pageStart": 585
  },
  {
    "number": 81,
    "name": "سُورَةُ التَّكۡوِيرِ",
    "englishName": "At-Takwir",
    "revelationType": "Meccan",
    "ayahCount": 29,
    "juzStart": 30,
    "pageStart": 586
  },
  {
    "number": 82,
    "name": "سُورَةُ الانفِطَارِ",
    "englishName": "Al-Infitaar",
    "revelationType": "Meccan",
    "ayahCount": 19,
    "juzStart": 30,
    "pageStart": 587
  },
  {
    "number": 83,
    "name": "سُورَةُ المُطَفِّفِينَ",
    "englishName": "Al-Mutaffifin",
    "revelationType": "Meccan",
    "ayahCount": 36,
    "juzStart": 30,
    "pageStart": 587
  },
  {
    "number": 84,
    "name": "سُورَةُ الانشِقَاقِ",
    "englishName": "Al-Inshiqaaq",
    "revelationType": "Meccan",
    "ayahCount": 25,
    "juzStart": 30,
    "pageStart": 589
  },
  {
    "number": 85,
    "name": "سُورَةُ البُرُوجِ",
    "englishName": "Al-Burooj",
    "revelationType": "Meccan",
    "ayahCount": 22,
    "juzStart": 30,
    "pageStart": 590
  },
  {
    "number": 86,
    "name": "سُورَةُ الطَّارِقِ",
    "englishName": "At-Taariq",
    "revelationType": "Meccan",
    "ayahCount": 17,
    "juzStart": 30,
    "pageStart": 591
  },
  {
    "number": 87,
    "name": "سُورَةُ الأَعۡلَىٰ",
    "englishName": "Al-A'laa",
    "revelationType": "Meccan",
    "ayahCount": 19,
    "juzStart": 30,
    "pageStart": 591
  },
  {
    "number": 88,
    "name": "سُورَةُ الغَاشِيَةِ",
    "englishName": "Al-Ghaashiya",
    "revelationType": "Meccan",
    "ayahCount": 26,
    "juzStart": 30,
    "pageStart": 592
  },
  {
    "number": 89,
    "name": "سُورَةُ الفَجۡرِ",
    "englishName": "Al-Fajr",
    "revelationType": "Meccan",
    "ayahCount": 30,
    "juzStart": 30,
    "pageStart": 593
  },
  {
    "number": 90,
    "name": "سُورَةُ البَلَدِ",
    "englishName": "Al-Balad",
    "revelationType": "Meccan",
    "ayahCount": 20,
    "juzStart": 30,
    "pageStart": 594
  },
  {
    "number": 91,
    "name": "سُورَةُ الشَّمۡسِ",
    "englishName": "Ash-Shams",
    "revelationType": "Meccan",
    "ayahCount": 15,
    "juzStart": 30,
    "pageStart": 595
  },
  {
    "number": 92,
    "name": "سُورَةُ اللَّيۡلِ",
    "englishName": "Al-Lail",
    "revelationType": "Meccan",
    "ayahCount": 21,
    "juzStart": 30,
    "pageStart": 595
  },
  {
    "number": 93,
    "name": "سُورَةُ الضُّحَىٰ",
    "englishName": "Ad-Dhuhaa",
    "revelationType": "Meccan",
    "ayahCount": 11,
    "juzStart": 30,
    "pageStart": 596
  },
  {
    "number": 94,
    "name": "سُورَةُ الشَّرۡحِ",
    "englishName": "Ash-Sharh",
    "revelationType": "Meccan",
    "ayahCount": 8,
    "juzStart": 30,
    "pageStart": 596
  },
  {
    "number": 95,
    "name": "سُورَةُ التِّينِ",
    "englishName": "At-Tin",
    "revelationType": "Meccan",
    "ayahCount": 8,
    "juzStart": 30,
    "pageStart": 597
  },
  {
    "number": 96,
    "name": "سُورَةُ العَلَقِ",
    "englishName": "Al-Alaq",
    "revelationType": "Meccan",
    "ayahCount": 19,
    "juzStart": 30,
    "pageStart": 597
  },
  {
    "number": 97,
    "name": "سُورَةُ القَدۡرِ",
    "englishName": "Al-Qadr",
    "revelationType": "Meccan",
    "ayahCount": 5,
    "juzStart": 30,
    "pageStart": 598
  },
  {
    "number": 98,
    "name": "سُورَةُ البَيِّنَةِ",
    "englishName": "Al-Bayyina",
    "revelationType": "Medinan",
    "ayahCount": 8,
    "juzStart": 30,
    "pageStart": 598
  },
  {
    "number": 99,
    "name": "سُورَةُ الزَّلۡزَلَةِ",
    "englishName": "Az-Zalzala",
    "revelationType": "Medinan",
    "ayahCount": 8,
    "juzStart": 30,
    "pageStart": 599
  },
  {
    "number": 100,
    "name": "سُورَةُ العَادِيَاتِ",
    "englishName": "Al-Aadiyaat",
    "revelationType": "Meccan",
    "ayahCount": 11,
    "juzStart": 30,
    "pageStart": 599
  },
  {
    "number": 101,
    "name": "سُورَةُ القَارِعَةِ",
    "englishName": "Al-Qaari'a",
    "revelationType": "Meccan",
    "ayahCount": 11,
    "juzStart": 30,
    "pageStart": 600
  },
  {
    "number": 102,
    "name": "سُورَةُ التَّكَاثُرِ",
    "englishName": "At-Takaathur",
    "revelationType": "Meccan",
    "ayahCount": 8,
    "juzStart": 30,
    "pageStart": 600
  },
  {
    "number": 103,
    "name": "سُورَةُ العَصۡرِ",
    "englishName": "Al-Asr",
    "revelationType": "Meccan",
    "ayahCount": 3,
    "juzStart": 30,
    "pageStart": 601
  },
  {
    "number": 104,
    "name": "سُورَةُ الهُمَزَةِ",
    "englishName": "Al-Humaza",
    "revelationType": "Meccan",
    "ayahCount": 9,
    "juzStart": 30,
    "pageStart": 601
  },
  {
    "number": 105,
    "name": "سُورَةُ الفِيلِ",
    "englishName": "Al-Fil",
    "revelationType": "Meccan",
    "ayahCount": 5,
    "juzStart": 30,
    "pageStart": 601
  },
  {
    "number": 106,
    "name": "سُورَةُ قُرَيۡشٍ",
    "englishName": "Quraish",
    "revelationType": "Meccan",
    "ayahCount": 4,
    "juzStart": 30,
    "pageStart": 602
  },
  {
    "number": 107,
    "name": "سُورَةُ المَاعُونِ",
    "englishName": "Al-Maa'un",
    "revelationType": "Meccan",
    "ayahCount": 7,
    "juzStart": 30,
    "pageStart": 602
  },
  {
    "number": 108,
    "name": "سُورَةُ الكَوۡثَرِ",
    "englishName": "Al-Kawthar",
    "revelationType": "Meccan",
    "ayahCount": 3,
    "juzStart": 30,
    "pageStart": 602
  },
  {
    "number": 109,
    "name": "سُورَةُ الكَافِرُونَ",
    "englishName": "Al-Kaafiroon",
    "revelationType": "Meccan",
    "ayahCount": 6,
    "juzStart": 30,
    "pageStart": 603
  },
  {
    "number": 110,
    "name": "سُورَةُ النَّصۡرِ",
    "englishName": "An-Nasr",
    "revelationType": "Medinan",
    "ayahCount": 3,
    "juzStart": 30,
    "pageStart": 603
  },
  {
    "number": 111,
    "name": "سُورَةُ المَسَدِ",
    "englishName": "Al-Masad",
    "revelationType": "Meccan",
    "ayahCount": 5,
    "juzStart": 30,
    "pageStart": 603
  },
  {
    "number": 112,
    "name": "سُورَةُ الإِخۡلَاصِ",
    "englishName": "Al-Ikhlaas",
    "revelationType": "Meccan",
    "ayahCount": 4,
    "juzStart": 30,
    "pageStart": 604
  },
  {
    "number": 113,
    "name": "سُورَةُ الفَلَقِ",
    "englishName": "Al-Falaq",
    "revelationType": "Meccan",
    "ayahCount": 5,
    "juzStart": 30,
    "pageStart": 604
  },
  {
    "number": 114,
    "name": "سُورَةُ النَّاسِ",
    "englishName": "An-Naas",
    "revelationType": "Meccan",
    "ayahCount": 6,
    "juzStart": 30,
    "pageStart": 604
  }
];
