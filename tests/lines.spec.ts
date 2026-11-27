import { type Alphabet, createTransliterator, type Direction } from '../src';
import { exceptions } from '../src/exceptions';

const transliterator = createTransliterator();
const withExceptions = createTransliterator({ exceptions });

const texts: Record<Alphabet | 'auto', string> = {
  latin1995:
    "Oʻzbekiston 1991-yil 31-avgustda mustaqil bo'ldi. Isʼhoq, poeziya, yoʻq; OKTABRDA litsey XXI asr https://kun.uz 25 mart",
  cyrillic:
    'Ўзбекистон 1991 йил 31 августда мустақил бўлди. Ҳеч ким, ОБЪЕКТ, съезд, Исҳоқ; октябрда лицей XXI аср https://kun.uz 25 март',
  latin2026:
    'Özbekiston 1991-yil 31-avgustda mustaqil böldi. Şahar, Isʼhoq, Çoy, ğalaba; OKTABRDA litsey XXI asr https://kun.uz 25-mart',
  auto: "Bugun 25 март, ertaga 26-mart ' Çoy ichdik ` Ҳеч ким ʼ maslaхat; 2026 йил oktabrda 7 лицей",
};
const alphabets: Alphabet[] = ['latin1995', 'latin2026', 'cyrillic'];
const directions: Direction[] = (
  Object.keys(texts) as Direction['from'][]
).flatMap((from) => alphabets.map((to) => ({ from, to })));

const byLines = (
  text: string,
  convert: (line: string) => string,
  lineBreak = '\n',
) => text.split(lineBreak).map(convert).join(lineBreak);

describe('A text converted line by line', () => {
  // Break the line at each space in turn, and at all of them
  test.each(directions)('$from → $to', (direction) => {
    const text = texts[direction.from];
    const breaks = [...text.matchAll(/ /g)].map((match) => match.index);
    const variants = [
      ...breaks.map(
        (index) => `${text.slice(0, index)}\n${text.slice(index + 1)}`,
      ),
      text.replaceAll(' ', '\n'),
      text.replaceAll(' ', ' \n'),
      text.replaceAll(' ', '\r\n'),
    ];

    for (const instance of [transliterator, withExceptions]) {
      const convert = (part: string) => instance.transliterate(part, direction);

      for (const variant of variants) {
        expect(byLines(variant, convert)).toBe(convert(variant));
      }
    }
  });

  test('a date is not read across a line break', () => {
    const toLatin: Direction = { from: 'cyrillic', to: 'latin1995' };
    const toCyrillic: Direction = { from: 'latin1995', to: 'cyrillic' };

    expect(transliterator.transliterate('2026\nйил', toLatin)).toBe(
      '2026\nyil',
    );
    expect(transliterator.transliterate('25\nмарт', toLatin)).toBe('25\nmart');
    expect(transliterator.transliterate('2026-\nyil', toCyrillic)).toBe(
      '2026-\nйил',
    );
  });

  test.each`
    text                 | to             | expected
    ${'Салом\nʼ\nдунё'}  | ${'cyrillic'}  | ${'Салом\nʼ\nдунё'}
    ${'Salom\nʼ\nСалом'} | ${'cyrillic'}  | ${'Салом\nʼ\nСалом'}
    ${'Салом\nʼ\nSalom'} | ${'cyrillic'}  | ${'Салом\nʼ\nСалом'}
    ${"'"}               | ${'cyrillic'}  | ${"'"}
    ${'```\nkod\n```'}   | ${'cyrillic'}  | ${'```\nкод\n```'}
    ${'ʼ 2026\n'}        | ${'latin2026'} | ${'ʼ 2026\n'}
    ${'Bugun\n25 март'}  | ${'latin1995'} | ${'Bugun\n25-mart'}
    ${'Салом ʼ\nSalom'}  | ${'latin1995'} | ${'Salom ʼ\nSalom'}
  `(
    "with from: 'auto', a line without letters stays as it is: $text",
    ({ text, to, expected }) => {
      expect(transliterator.transliterate(text, { from: 'auto', to })).toBe(
        expected,
      );
    },
  );
});
