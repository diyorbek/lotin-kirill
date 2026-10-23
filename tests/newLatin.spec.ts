import fs from 'fs';
import { createUzbek, ExceptionalWord } from '../src/uzbek';

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
    expect(uzbek.latinToNewLatin(latin)).toBe(newLatin);
    expect(uzbek.newLatinToCyrillic(newLatin)).toBe(cyrillic);
    expect(uzbek.cyrillicToNewLatin(cyrillic)).toBe(newLatin);
  });

  test('back to Latin', () => {
    expect(uzbek.newLatinToLatin('Özbekiston şahrida çoy içdik')).toBe(
      'O‘zbekiston shahrida choy ichdik',
    );
    expect(uzbek.newLatinToLatin('Ishoq')).toBe('Isʼhoq');
  });

  test('long text', () => {
    const newLatin = uzbek.latinToNewLatin(latinText);

    expect(uzbek.newLatinToLatin(newLatin)).toBe(latinText);
    expect(uzbek.newLatinToCyrillic(newLatin)).toBe(
      uzbek.latinToCyrillic(latinText),
    );
  });

  test('exceptions across three alphabets', () => {
    const uz = createUzbek();
    uz.addExceptions([
      { latin: 'Chrome', cyrillic: 'Chrome', newLatin: 'Chrome' },
      { cyrillic: 'октябрь', newLatin: 'oktabr' },
    ]);

    expect(uzbek.latinToNewLatin('Chrome')).toBe('Çrome'); // the rules alone
    expect(uz.latinToNewLatin('Chrome')).toBe('Chrome');
    expect(uz.cyrillicToNewLatin('Chrome')).toBe('Chrome');
    expect(uz.cyrillicToNewLatin('октябрда')).toBe('oktabrda');
    expect(uz.newLatinToCyrillic('oktabr')).toBe('октябрь');
    expect(uz.cyrillicToLatin('октябрь')).toBe('oktabr');

    uz.clearExceptions();
    expect(uz.latinToNewLatin('Chrome')).toBe('Çrome');
  });

  test('an exceptional word needs at least two spellings', () => {
    // The type rules this out; plain JavaScript callers can still pass it
    const word = { latin: 'Chrome' } as unknown as ExceptionalWord;

    expect(() => uzbek.addExceptions([word])).toThrowError(
      new Error('Invalid exceptional word {"latin":"Chrome"}'),
    );
  });
});
