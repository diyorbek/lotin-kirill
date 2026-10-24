import { createTransliterator } from '../src';
import { latin1995Cyrillic } from './helpers';

const t = latin1995Cyrillic();

describe('Dates', () => {
  test.each`
    cyrillic                         | latin
    ${'25 март'}                     | ${'25-mart'}
    ${'1991 йилнинг 1 майи'}         | ${'1991-yilning 1-mayi'}
    ${'25 мартдан 30 апрелгача'}     | ${'25-martdan 30-aprelgacha'}
    ${'2018 йил 13 декабрда'}        | ${'2018-yil 13-dekabrda'}
    ${'1993 йилги'}                  | ${'1993-yilgi'}
    ${'1990 йилларда, 60 йиллар'}    | ${'1990-yillarda, 60-yillar'}
    ${'2004-05 йиллардаги'}          | ${'2004-05-yillardagi'}
    ${'25 МАРТ'}                     | ${'25-MART'}
    ${'(1 май)'}                     | ${'(1-may)'}
    ${'5 йил'}                       | ${'5 yil'}
    ${'100 йилда'}                   | ${'100 yilda'}
    ${'3 марта'}                     | ${'3 marta'}
    ${'5 йиллик'}                    | ${'5 yillik'}
    ${'2,5 май'}                     | ${'2,5 may'}
    ${'189-масжид, 5-йил'}           | ${'189-masjid, 5-yil'}
    ${'Шанба, 25. Март 1 – апрелда'} | ${'Shanba, 25. Mart 1 – aprelda'}
  `('$cyrillic ⇄ $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
    expect(t.toCyrillic(latin)).toBe(cyrillic);
  });

  test('Latin without the hyphen', () => {
    expect(t.toCyrillic('25 mart 1991 yil')).toBe('25 март 1991 йил');
  });

  test('every direction', () => {
    const transliterator = createTransliterator();

    expect(
      transliterator.transliterate('1991 йил 1 сентябрда', {
        from: 'cyrillic',
        to: 'latin2026',
      }),
    ).toBe('1991-yil 1-sentyabrda');
    expect(
      transliterator.transliterate('1991-yil 1-sentyabrda', {
        from: 'latin2026',
        to: 'cyrillic',
      }),
    ).toBe('1991 йил 1 сентябрда');
    expect(
      transliterator.transliterate('Bugun 25 март, ertaga 26-mart', {
        from: 'auto',
        to: 'latin1995',
      }),
    ).toBe('Bugun 25-mart, ertaga 26-mart');
  });
});
