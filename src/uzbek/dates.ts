// Latin writes a hyphen after the number of a date, Cyrillic a space: 25-mart and
// 25 март, 1991-yil and 1991 йил, 1990-yillar and 1990 йиллар. Only a day before
// a month, a year before yil and a number before yillar are dates: 5 yil is five
// years, 3 marta is three times.

const WORD_END = "(?![\\p{L}\\p{M}ʻʼ’'`‘´])";

interface DateWords {
  months: string;
  year: string;
  plural: string;
  suffixes: string;
}

/** Matches the separator between the number and the word of a date. */
function dateSeparator(
  separator: string,
  { months, year, plural, suffixes }: DateWords,
): RegExp {
  const day = `(?<=(?<![\\d.,])\\d{1,2})${separator}(?=(?:${months})${suffixes}${WORD_END})`;
  const yearNumber = `(?<=(?<![\\d.,])\\d{4})${separator}(?=${year}${suffixes}${WORD_END})`;
  const decade = `(?<=\\d)${separator}(?=${year}${plural}${suffixes}${WORD_END})`;

  return new RegExp(`${day}|${yearNumber}|${decade}`, 'iu');
}

export const CYRILLIC_DATE = dateSeparator('[ \\u00a0]', {
  months:
    '(?:январ|феврал|март|апрел|май|июн|июл|август|сентябр|октябр|ноябр|декабр)ь?',
  year: 'йил',
  plural: 'лар',
  suffixes: 'и?(?:ни|нинг|га|гача|да|дан|даги|дагина|ги)?',
});

export const LATIN_DATE = dateSeparator('-', {
  months:
    'yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|sentyabr|oktabr|oktyabr|noyabr|dekabr',
  year: 'yil',
  plural: 'lar',
  suffixes: 'i?(?:ni|ning|ga|gacha|da|dan|dagi|dagina|gi)?',
});
