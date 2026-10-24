import { createTransliterator } from '../src';

export type LatinCyrillicPair = [latin1995: string, cyrillic: string];

// Most tests cover latin1995 ⇄ cyrillic, with exceptions as [latin1995, cyrillic] pairs
export function latin1995Cyrillic(pairs: LatinCyrillicPair[] = []) {
  const transliterator = createTransliterator({
    exceptions: pairs.map(([latin1995, cyrillic]) => ({ latin1995, cyrillic })),
  });

  return {
    toCyrillic: (text: string) =>
      transliterator.transliterate(text, { from: 'latin1995', to: 'cyrillic' }),
    toLatin: (text: string) =>
      transliterator.transliterate(text, { from: 'cyrillic', to: 'latin1995' }),
  };
}
