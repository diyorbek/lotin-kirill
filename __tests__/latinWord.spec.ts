import Transliterator from '../src';
import { LATIN_CHARACTERS } from '../src/characters';

const t = new Transliterator();

describe('Apostrophe latin to cyrillic', () => {
  test('detects apostrophe and character-casing', () => {
    const apostropheInputVariants = "ʻʼ’'`‘".split('');

    apostropheInputVariants.forEach((v) => {
      expect(t.toCyrillic(v)).toBe('ъ');
    });

    Object.entries(LATIN_CHARACTERS).forEach(([latin, cyrillic], i) => {
      apostropheInputVariants.forEach((tick) => {
        const output = t.toCyrillic(`${latin}${tick}`);

        if (/g/i.test(latin)) {
          expect(output).toBe(i % 2 === 1 ? 'ғ' : 'Ғ');
        } else if (/o/i.test(latin)) {
          expect(output).toBe(i % 2 === 1 ? 'ў' : 'Ў');
        } else if (/e/i.test(latin)) {
          expect(output).toBe(i % 2 === 1 ? 'эъ' : 'ЭЪ');
        } else {
          expect(output).toBe(`${cyrillic}${i % 2 === 1 ? 'ъ' : 'Ъ'}`);
        }
      });
    });
  });

  test.each`
    latin      | cyrillic
    ${"A'LO"}  | ${'АЪЛО'}
    ${"A'lo"}  | ${'Аъло'}
    ${"a'lo"}  | ${'аъло'}
    ${"a'LO"}  | ${'аЪЛО'}
    ${"e'lon"} | ${'эълон'}
    ${"E'lon"} | ${'Эълон'}
    ${"ad'ho"} | ${'адъҳо'}
    ${"aD'ho"} | ${'аДъҳо'}
    ${"S'H"}   | ${'СҲ'}
    ${"S'h"}   | ${'Сҳ'}
    ${"s'H"}   | ${'сҲ'}
    ${"s'h"}   | ${'сҳ'}
  `('$latin => $cyrillic', ({ latin, cyrillic }) => {
    expect(t.toCyrillic(latin)).toBe(cyrillic);
  });
});

describe('Bigrams latin to cyrillic', () => {
  test('Detect bigrams and character-casing', () => {
    const bigrams = [
      ['CH', 'Ч'],
      ['Ch', 'Ч'],
      ['cH', 'ч'],
      ['ch', 'ч'],

      ['SH', 'Ш'],
      ['Sh', 'Ш'],
      ['sH', 'ш'],
      ['sh', 'ш'],

      ['YE', 'Е'],
      ['Ye', 'Е'],
      ['yE', 'е'],
      ['ye', 'е'],

      ['YO', 'Ё'],
      ['Yo', 'Ё'],
      ['yO', 'ё'],
      ['yo', 'ё'],

      ['YU', 'Ю'],
      ['Yu', 'Ю'],
      ['yU', 'ю'],
      ['yu', 'ю'],

      ['YA', 'Я'],
      ['Ya', 'Я'],
      ['yA', 'я'],
      ['ya', 'я'],

      ["O'", 'Ў'],
      ["o'", 'ў'],

      ["G'", 'Ғ'],
      ["g'", 'ғ'],
    ];

    bigrams.forEach(([latin, cyrillic]) => {
      expect(t.toCyrillic(latin)).toBe(cyrillic);
    });
  });
});

describe('Detect Э', () => {
  test('detect inside text', () => {
    expect(t.toCyrillic('eski')).toBe('эски');
    expect(t.toCyrillic('eski-tuski')).toBe('эски-туски');
    expect(t.toCyrillic('energiya')).toBe('энергия');
    expect(t.toCyrillic('ee-ee')).toBe('эе-эе');
    expect(t.toCyrillic('eee-eee')).toBe('эеэ-эеэ');
    expect(t.toCyrillic('eeeeee')).toBe('эеэеэе');
    expect(t.toCyrillic('re-er')).toBe('ре-эр');
    expect(t.toCyrillic('e-e')).toBe('э-э');
    expect(t.toCyrillic('e e')).toBe('э э');
    expect(t.toCyrillic('e.e')).toBe('э.э');
    expect(t.toCyrillic('e,e')).toBe('э,э');
    expect(t.toCyrillic('e:e')).toBe('э:э');
    expect(t.toCyrillic('e;e')).toBe('э;э');
  });

  test('correct character casing', () => {
    expect(t.toCyrillic('e-e')).toBe('э-э');
    expect(t.toCyrillic('E-e')).toBe('Э-э');
    expect(t.toCyrillic('e-E')).toBe('э-Э');
    expect(t.toCyrillic('E-E')).toBe('Э-Э');
    expect(t.toCyrillic('e e')).toBe('э э');
    expect(t.toCyrillic('E e')).toBe('Э э');
    expect(t.toCyrillic('e E')).toBe('э Э');
    expect(t.toCyrillic('E E')).toBe('Э Э');
    expect(t.toCyrillic('EeEeeE')).toBe('ЭеЭеэЕ');
  });

  test('special combinations', () => {
    expect(t.toCyrillic(['reemigiratsiya', 'reyester', 'dee'])).toEqual([
      'реэмигирация',
      'реестер',
      'деэ',
    ]);
  });
});

describe('Detect Ц', () => {
  test('usual suffixes', () => {
    expect(t.toCyrillic('motivatsiya')).toBe('мотивация');
    expect(t.toCyrillic('motivatsion')).toBe('мотивацион');
    expect(t.toCyrillic('motivaTsion')).toBe('мотиваЦион');
    expect(t.toCyrillic('MOTIVATSIYA')).toBe('МОТИВАЦИЯ');
    expect(t.toCyrillic('mOtIvAtSiOn')).toBe('мОтИвАциОн');
  });
});
