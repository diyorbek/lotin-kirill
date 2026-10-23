import fs from 'fs';
import { createUzbek } from '../src/uzbek';

const uzbek = createUzbek();

const latinText = fs
  .readFileSync(`${__dirname}/fixtures/latinText.txt`, 'utf-8')
  .toString();

describe('New Latin (2026)', () => {
  test.each`
    latin            | newLatin        | cyrillic
    ${'O‘zbekiston'} | ${'Özbekiston'} | ${'Ўзбекистон'}
    ${'SHAHAR'}      | ${'ŞAHAR'}      | ${'ШАҲАР'}
    ${'Choʻl'}       | ${'Çöl'}        | ${'Чўл'}
    ${'tog‘'}        | ${'toğ'}        | ${'тоғ'}
    ${'Yo‘q'}        | ${'Yöq'}        | ${'Йўқ'}
    ${"Is'hoq"}      | ${'Ishoq'}      | ${'Исҳоқ'}
    ${'yaʼni'}       | ${'yaʼni'}      | ${'яъни'}
  `('$latin → $newLatin ⇄ $cyrillic', ({ latin, newLatin, cyrillic }) => {
    expect(uzbek.latinToNewLatin.transliterate(latin)).toBe(newLatin);
    expect(uzbek.newLatinToCyrillic.transliterate(newLatin)).toBe(cyrillic);
    expect(uzbek.cyrillicToNewLatin.transliterate(cyrillic)).toBe(newLatin);
  });

  test('back to Latin', () => {
    expect(
      uzbek.newLatinToLatin.transliterate('Özbekiston şahrida çoy içdik'),
    ).toBe('O‘zbekiston shahrida choy ichdik');
    expect(uzbek.newLatinToLatin.transliterate('Ishoq')).toBe('Isʼhoq');
  });

  test('long text', () => {
    const newLatin = uzbek.latinToNewLatin.transliterate(latinText);

    expect(uzbek.newLatinToLatin.transliterate(newLatin)).toBe(latinText);
    expect(uzbek.newLatinToCyrillic.transliterate(newLatin)).toBe(
      uzbek.latinToCyrillic.transliterate(latinText),
    );
  });
});
