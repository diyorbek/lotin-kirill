import * as api from '../src';
import { createTransliterator, type Direction } from '../src';

describe('API', () => {
  test('createTransliterator is the only export', () => {
    expect(Object.keys(api)).toEqual(['createTransliterator']);
  });

  test('the same alphabet on both sides leaves the text unchanged', () => {
    const transliterator = createTransliterator();

    expect(
      transliterator.transliterate('Salom, dunyo!', {
        from: 'latin1995',
        to: 'latin1995',
      }),
    ).toBe('Salom, dunyo!');
  });

  test('an unknown alphabet throws', () => {
    // The type rules these out; plain JavaScript callers can still pass them
    const transliterator = createTransliterator();
    const unknownFrom = {
      from: 'latin',
      to: 'cyrillic',
    } as unknown as Direction;
    const unknownTo = {
      from: 'cyrillic',
      to: 'newLatin',
    } as unknown as Direction;

    expect(() =>
      transliterator.transliterate('Salom', unknownFrom),
    ).toThrowError(new Error('Unknown alphabet: latin'));
    expect(() => transliterator.transliterate('Салом', unknownTo)).toThrowError(
      new Error('Unknown alphabet: newLatin'),
    );
  });

  test('exceptions given to createTransliterator are used', () => {
    const withExceptions = createTransliterator({
      exceptions: [{ latin1995: 'oktabr', cyrillic: 'октябрь' }],
    });
    const withoutExceptions = createTransliterator();
    const direction: Direction = { from: 'latin1995', to: 'cyrillic' };

    expect(withExceptions.transliterate('oktabrda', direction)).toBe(
      'октябрда',
    );
    expect(withoutExceptions.transliterate('oktabrda', direction)).toBe(
      'октабрда',
    );
  });
});
