import fs from 'node:fs';
import { createUzbek, type ExceptionalWord } from '../src/uzbek';

const uzbek = createUzbek();

const latinText = fs
  .readFileSync(`${__dirname}/fixtures/latinText.txt`, 'utf-8')
  .toString();

describe('latin2026', () => {
  test.each`
    latin1995        | latin2026       | cyrillic
    ${'O‘zbekiston'} | ${'Özbekiston'} | ${'Ўзбекистон'}
    ${'SHAHAR'}      | ${'ŞAHAR'}      | ${'ШАҲАР'}
    ${'Choʻl'}       | ${'Çöl'}        | ${'Чўл'}
    ${'tog‘'}        | ${'toğ'}        | ${'тоғ'}
    ${'Yo‘q'}        | ${'Yöq'}        | ${'Йўқ'}
    ${"Is'hoq"}      | ${'Ishoq'}      | ${'Исҳоқ'}
    ${'yaʼni'}       | ${'yaʼni'}      | ${'яъни'}
  `(
    '$latin1995 → $latin2026 ⇄ $cyrillic',
    ({ latin1995, latin2026, cyrillic }) => {
      expect(uzbek.latin1995ToLatin2026(latin1995)).toBe(latin2026);
      expect(uzbek.latin2026ToCyrillic(latin2026)).toBe(cyrillic);
      expect(uzbek.cyrillicToLatin2026(cyrillic)).toBe(latin2026);
    },
  );

  test('back to latin1995', () => {
    expect(uzbek.latin2026ToLatin1995('Özbekiston şahrida çoy içdik')).toBe(
      'O‘zbekiston shahrida choy ichdik',
    );
    expect(uzbek.latin2026ToLatin1995('Ishoq')).toBe('Isʼhoq');
  });

  test('long text', () => {
    const latin2026 = uzbek.latin1995ToLatin2026(latinText);

    expect(uzbek.latin2026ToLatin1995(latin2026)).toBe(latinText);
    expect(uzbek.latin2026ToCyrillic(latin2026)).toBe(
      uzbek.latin1995ToCyrillic(latinText),
    );
  });

  test('exceptions across three alphabets', () => {
    const uz = createUzbek();
    uz.addExceptions([
      { latin1995: 'Chrome', cyrillic: 'Chrome', latin2026: 'Chrome' },
      { cyrillic: 'октябрь', latin2026: 'oktabr' },
    ]);

    expect(uzbek.latin1995ToLatin2026('Chrome')).toBe('Çrome'); // the rules alone
    expect(uz.latin1995ToLatin2026('Chrome')).toBe('Chrome');
    expect(uz.cyrillicToLatin2026('Chrome')).toBe('Chrome');
    expect(uz.cyrillicToLatin2026('октябрда')).toBe('oktabrda');
    expect(uz.latin2026ToCyrillic('oktabr')).toBe('октябрь');
    expect(uz.cyrillicToLatin1995('октябрь')).toBe('oktabr');

    uz.clearExceptions();
    expect(uz.latin1995ToLatin2026('Chrome')).toBe('Çrome');
  });

  test('an exceptional word needs at least two spellings', () => {
    // The type rules this out; plain JavaScript callers can still pass it
    const word = { latin1995: 'Chrome' } as unknown as ExceptionalWord;

    expect(() => uzbek.addExceptions([word])).toThrowError(
      new Error('Invalid exceptional word {"latin1995":"Chrome"}'),
    );
  });
});
