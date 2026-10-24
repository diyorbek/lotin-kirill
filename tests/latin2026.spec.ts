import fs from 'node:fs';
import { createTransliterator, type ExceptionalWord } from '../src';

const transliterator = createTransliterator();

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
      expect(
        transliterator.transliterate(latin1995, {
          from: 'latin1995',
          to: 'latin2026',
        }),
      ).toBe(latin2026);
      expect(
        transliterator.transliterate(latin2026, {
          from: 'latin2026',
          to: 'cyrillic',
        }),
      ).toBe(cyrillic);
      expect(
        transliterator.transliterate(cyrillic, {
          from: 'cyrillic',
          to: 'latin2026',
        }),
      ).toBe(latin2026);
    },
  );

  test('back to latin1995', () => {
    expect(
      transliterator.transliterate('Özbekiston şahrida çoy içdik', {
        from: 'latin2026',
        to: 'latin1995',
      }),
    ).toBe('Oʻzbekiston shahrida choy ichdik');
    expect(
      transliterator.transliterate('Ishoq', {
        from: 'latin2026',
        to: 'latin1995',
      }),
    ).toBe('Isʼhoq');
  });

  test('long text', () => {
    const latin2026 = transliterator.transliterate(latinText, {
      from: 'latin1995',
      to: 'latin2026',
    });

    expect(
      transliterator.transliterate(latin2026, {
        from: 'latin2026',
        to: 'latin1995',
      }),
    ).toBe(latinText);
    expect(
      transliterator.transliterate(latin2026, {
        from: 'latin2026',
        to: 'cyrillic',
      }),
    ).toBe(
      transliterator.transliterate(latinText, {
        from: 'latin1995',
        to: 'cyrillic',
      }),
    );
  });

  test('exceptions across three alphabets', () => {
    const uz = createTransliterator();

    uz.addExceptions([
      { latin1995: 'Chrome', cyrillic: 'Chrome', latin2026: 'Chrome' },
      { cyrillic: 'октябрь', latin2026: 'oktabr' },
    ]);

    // The rules alone
    expect(
      transliterator.transliterate('Chrome', {
        from: 'latin1995',
        to: 'latin2026',
      }),
    ).toBe('Çrome');

    expect(
      uz.transliterate('Chrome', { from: 'latin1995', to: 'latin2026' }),
    ).toBe('Chrome');
    expect(
      uz.transliterate('Chrome', { from: 'cyrillic', to: 'latin2026' }),
    ).toBe('Chrome');
    expect(
      uz.transliterate('октябрда', { from: 'cyrillic', to: 'latin2026' }),
    ).toBe('oktabrda');
    expect(
      uz.transliterate('oktabr', { from: 'latin2026', to: 'cyrillic' }),
    ).toBe('октябрь');
    expect(
      uz.transliterate('октябрь', { from: 'cyrillic', to: 'latin1995' }),
    ).toBe('oktabr');

    uz.clearExceptions();

    expect(
      uz.transliterate('Chrome', { from: 'latin1995', to: 'latin2026' }),
    ).toBe('Çrome');
  });

  test('an exceptional word needs at least two spellings', () => {
    // The type rules this out; plain JavaScript callers can still pass it
    const word = { latin1995: 'Chrome' } as unknown as ExceptionalWord;

    expect(() => createTransliterator().addExceptions([word])).toThrowError(
      new Error('Invalid exceptional word {"latin1995":"Chrome"}'),
    );
  });
});
