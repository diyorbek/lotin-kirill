import fs from 'node:fs';
import { createTransliterator, type Direction } from '../src';

const transliterator = createTransliterator();

const latinText = fs
  .readFileSync(`${__dirname}/fixtures/latinText.txt`, 'utf-8')
  .toString();
const cyrillicText = fs
  .readFileSync(`${__dirname}/fixtures/cyrillicText.txt`, 'utf-8')
  .toString();

describe('detect', () => {
  test.each`
    text             | alphabet
    ${'Салом'}       | ${'cyrillic'}
    ${'Toşkent'}     | ${'latin2026'}
    ${'Özbekiston'}  | ${'latin2026'}
    ${'Toshkent'}    | ${'latin1995'}
    ${'O‘zbekiston'} | ${'latin1995'}
    ${'Salom'}       | ${'latin1995'}
    ${'2026'}        | ${undefined}
  `('$text → $alphabet', ({ text, alphabet }) => {
    expect(transliterator.detect(text)).toBe(alphabet);
  });

  test('only words that tell an alphabet vote', () => {
    expect(transliterator.detect('Men bugun kitob öqidim')).toBe('latin2026');
    expect(transliterator.detect('Salom, Тошкент шаҳри')).toBe('cyrillic');
  });

  test('a tie goes to the alphabet seen first', () => {
    expect(transliterator.detect('Toşkent Toshkent')).toBe('latin2026');
  });

  test('the fixture texts', () => {
    const latin2026Text = transliterator.transliterate(latinText, {
      from: 'latin1995',
      to: 'latin2026',
    });

    expect(transliterator.detect(latinText)).toBe('latin1995');
    expect(transliterator.detect(latin2026Text)).toBe('latin2026');
    expect(transliterator.detect(cyrillicText)).toBe('cyrillic');
  });
});

describe("from: 'auto'", () => {
  test.each`
    text                        | to             | expected
    ${'Çoy ichdik'}             | ${'cyrillic'}  | ${'Чой ичдик'}
    ${'Men bugun kitob öqidim'} | ${'cyrillic'}  | ${'Мен бугун китоб ўқидим'}
    ${'Тошкент shahri'}         | ${'latin2026'} | ${'Toşkent şahri'}
    ${'Toşkent'}                | ${'latin2026'} | ${'Toşkent'}
    ${'2026-yil, 7-iyul'}       | ${'cyrillic'}  | ${'2026-йил, 7-июл'}
  `('$text → $to: $expected', ({ text, to, expected }) => {
    expect(transliterator.transliterate(text, { from: 'auto', to })).toBe(
      expected,
    );
  });

  test('long texts come out the same as with an explicit source', () => {
    const latin2026Text = transliterator.transliterate(latinText, {
      from: 'latin1995',
      to: 'latin2026',
    });
    const cases: [string, Direction][] = [
      [latinText, { from: 'latin1995', to: 'cyrillic' }],
      [latin2026Text, { from: 'latin2026', to: 'cyrillic' }],
      [latin2026Text, { from: 'latin2026', to: 'latin1995' }],
      [cyrillicText, { from: 'cyrillic', to: 'latin1995' }],
      [cyrillicText, { from: 'cyrillic', to: 'latin2026' }],
    ];

    for (const [text, { from, to }] of cases) {
      expect(transliterator.transliterate(text, { from: 'auto', to })).toBe(
        transliterator.transliterate(text, { from, to }),
      );
    }
  });

  test('a 2026 word with s + h needs an explicit source', () => {
    expect(
      transliterator.transliterate('Ishoq', { from: 'auto', to: 'cyrillic' }),
    ).toBe('Ишоқ');
    expect(
      transliterator.transliterate('Ishoq', {
        from: 'latin2026',
        to: 'cyrillic',
      }),
    ).toBe('Исҳоқ');
  });
});
