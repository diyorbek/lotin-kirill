import { createTransliterator } from '../src';
import { exceptions } from '../src/exceptions';

const transliterator = createTransliterator({ exceptions });
const toCyrillic = (text: string) =>
  transliterator.transliterate(text, { from: 'latin1995', to: 'cyrillic' });
const toLatin = (text: string) =>
  transliterator.transliterate(text, { from: 'cyrillic', to: 'latin1995' });

describe('The list of exceptions', () => {
  test('every word, both ways', () => {
    // A Cyrillic word with two Latin spellings goes back to the first one
    const latinOf = new Map<string, string>();

    for (const { latin1995, cyrillic } of exceptions) {
      if (!latinOf.has(cyrillic)) {
        latinOf.set(cyrillic, latin1995);
      }

      expect(toCyrillic(latin1995)).toBe(cyrillic);
      expect(toLatin(cyrillic)).toBe(latinOf.get(cyrillic));
    }
  });

  test.each`
    latin            | cyrillic
    ${'keltirish'}   | ${'келтириш'}
    ${'keltlar'}     | ${'кельтлар'}
    ${'sirka'}       | ${'сирка'}
    ${'sirkda'}      | ${'циркда'}
    ${'sentimental'} | ${'сентиментал'}
    ${'sentlar'}     | ${'центлар'}
    ${'pulsiz'}      | ${'пулсиз'}
    ${'pulsni'}      | ${'пульсни'}
    ${'alfavit'}     | ${'алфавит'}
    ${'tush'}        | ${'туш'}
    ${'tol'}         | ${'тол'}
  `(
    'a native word that starts like an exception: $latin → $cyrillic',
    ({ latin, cyrillic }) => {
      expect(toCyrillic(latin)).toBe(cyrillic);
    },
  );

  test('variant spellings', () => {
    expect(toCyrillic('oktyabrda')).toBe('октябрда');
    expect(toLatin('октябрда')).toBe('oktabrda');
  });
});
