import { createTransliterator, type Direction } from '../src';
import { exceptions } from '../src/exceptions';

const transliterator = createTransliterator();
const withExceptions = createTransliterator({ exceptions });

const cyrillicToLatin: Direction = { from: 'cyrillic', to: 'latin1995' };
const latinToCyrillic: Direction = { from: 'latin1995', to: 'cyrillic' };
const latin2026ToCyrillic: Direction = { from: 'latin2026', to: 'cyrillic' };

describe('Text in pieces', () => {
  test.each`
    parts                      | direction              | expected
    ${['ҳ', 'еч ким']}         | ${cyrillicToLatin}     | ${['h', 'ech kim']}
    ${['Ҳ', 'еч ким']}         | ${cyrillicToLatin}     | ${['H', 'ech kim']}
    ${['объ', 'ект']}          | ${cyrillicToLatin}     | ${['ob', 'yekt']}
    ${['Ш', 'аҳар']}           | ${cyrillicToLatin}     | ${['Sh', 'ahar']}
    ${['s', 'hahar']}          | ${latinToCyrillic}     | ${['ш', 'аҳар']}
    ${['S', 'hahar']}          | ${latinToCyrillic}     | ${['Ш', 'аҳар']}
    ${['o', 'ʻ', 'zbek']}      | ${latinToCyrillic}     | ${['ў', '', 'збек']}
    ${['ko', 'ʻ', 'rsatish']}  | ${latinToCyrillic}     | ${['кў', '', 'рсатиш']}
    ${['Is', 'ʼhoq']}          | ${latin2026ToCyrillic} | ${['Ис', 'ҳоқ']}
    ${['2026', ' йил']}        | ${cyrillicToLatin}     | ${['2026', '-yil']}
    ${['2026-', 'yil']}        | ${latinToCyrillic}     | ${['2026 ', 'йил']}
    ${['25 ', 'мартда']}       | ${cyrillicToLatin}     | ${['25-', 'martda']}
    ${['Salom ', 'dunyo']}     | ${latinToCyrillic}     | ${['Салом ', 'дунё']}
    ${['https://exa', 'mple']} | ${latinToCyrillic}     | ${['https://exa', 'mple']}
  `('$parts → $expected', ({ parts, direction, expected }) => {
    expect(transliterator.transliterateParts(parts, direction)).toEqual(
      expected,
    );
  });

  test('a cut inside an exception lands where it reads the same as by the rules', () => {
    // By the rules okt|abr → окт|абр, so октябрь is cut after окт
    expect(
      withExceptions.transliterateParts(['okt', 'abr'], latinToCyrillic),
    ).toEqual(['окт', 'ябрь']);
    expect(
      withExceptions.transliterateParts(['L', 'itsey'], latinToCyrillic),
    ).toEqual(['Л', 'ицей']);
    expect(
      withExceptions.transliterateParts(['lit', 'sey'], latinToCyrillic),
    ).toEqual(['лиц', 'ей']);
    expect(
      withExceptions.transliterateParts(['О', 'ктябрь'], cyrillicToLatin),
    ).toEqual(['O', 'ktabr']);
    expect(
      withExceptions.transliterateParts(['октя', 'брь'], cyrillicToLatin),
    ).toEqual(['okta', 'br']);
    expect(
      withExceptions.transliterateParts(['oktabr', 'da'], latinToCyrillic),
    ).toEqual(['октябр', 'да']);
  });

  test('empty pieces, one piece and no pieces', () => {
    expect(transliterator.transliterateParts([], latinToCyrillic)).toEqual([]);
    expect(transliterator.transliterateParts([''], latinToCyrillic)).toEqual([
      '',
    ]);
    expect(
      transliterator.transliterateParts(['Salom'], latinToCyrillic),
    ).toEqual(['Салом']);
    expect(
      transliterator.transliterateParts(['', 'Salom', '', ''], latinToCyrillic),
    ).toEqual(['', 'Салом', '', '']);
  });

  test('the same alphabet on both sides leaves the pieces unchanged', () => {
    const parts = ['Sa', 'lom, ', 'dunyo'];

    expect(
      transliterator.transliterateParts(parts, {
        from: 'latin1995',
        to: 'latin1995',
      }),
    ).toEqual(parts);
  });

  test('an unknown alphabet throws', () => {
    const unknown = { from: 'latin', to: 'cyrillic' } as unknown as Direction;

    expect(() =>
      transliterator.transliterateParts(['Salom'], unknown),
    ).toThrowError(new Error('Unknown alphabet: latin'));
  });

  test('with auto, the pieces follow the whole text', () => {
    // One Cyrillic letter makes the whole word Cyrillic, so it stays as it is
    const auto: Direction = { from: 'auto', to: 'cyrillic' };

    expect(
      transliterator.transliterateParts(['masla', 'х', 'at'], auto),
    ).toEqual(['masla', 'х', 'at']);
    expect(
      transliterator.transliterateParts(['Bugun 25', ' март, ', 'ç', 'oy'], {
        from: 'auto',
        to: 'latin1995',
      }),
    ).toEqual(['Bugun 25', '-mart, ', 'ch', 'oy']);
  });
});

// Cut anywhere into two pieces, or into three with a short one in the middle
// (a letter or a few in a format of their own), the pieces give the whole output
describe('Pieces join to the whole text', () => {
  const texts = {
    latin1995:
      "Oʻzbekiston 1991-yil 31-avgustda mustaqil bo'ldi. Shahar, Isʼhoq, poeziya, yoʻq; OKTABRDA litsey XXI asr https://kun.uz",
    cyrillic:
      'Ўзбекистон 1991 йил 31 августда мустақил бўлди. Ҳеч ким, ОБЪЕКТ, съезд, Исҳоқ; октябрда лицей XXI аср https://kun.uz',
    latin2026:
      'Özbekiston 1991-yil 31-avgustda mustaqil böldi. Şahar, Isʼhoq, Çoy, ğalaba; OKTABRDA litsey XXI asr https://kun.uz',
    auto: 'Bugun 25 март, ertaga 26-mart. Çoy ichdik, Ҳеч ким maslaхat; oktabrda лицей',
  };
  const alphabets = ['latin1995', 'latin2026', 'cyrillic'] as const;
  const directions = Object.keys(texts).flatMap((from) =>
    alphabets
      .filter((to) => to !== from)
      .map((to) => ({ from, to }) as Direction),
  );

  test.each(directions)('$from → $to', (direction) => {
    const text = texts[direction.from];

    for (const instance of [transliterator, withExceptions]) {
      const whole = instance.transliterate(text, direction);

      for (let first = 0; first <= text.length; first++) {
        const last = Math.min(text.length, first + 10);

        // first === second is a single cut with an empty piece in the middle
        for (let second = first; second <= last; second++) {
          const parts = [
            text.slice(0, first),
            text.slice(first, second),
            text.slice(second),
          ];
          const result = instance.transliterateParts(parts, direction);

          expect(result).toHaveLength(3);
          expect(result.join('')).toBe(whole);
        }
      }
    }
  });
});
