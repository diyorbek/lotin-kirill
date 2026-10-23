import type { Definition } from '../engine';
import { isURL, ROMAN_NUMBER } from '../skip';
import { APOSTROPHE, TURNED_COMMA, unifyApostrophes } from './latin';

const VOWELS = 'аоэеиуўёюя';

export const LATIN_TO_CYRILLIC: Definition = {
  letters: [
    ['a', 'а'],
    ['b', 'б'],
    ['d', 'д'],
    ['e', 'е'],
    ['f', 'ф'],
    ['g', 'г'],
    ['h', 'ҳ'],
    ['i', 'и'],
    ['j', 'ж'],
    ['k', 'к'],
    ['l', 'л'],
    ['m', 'м'],
    ['n', 'н'],
    ['o', 'о'],
    ['p', 'п'],
    ['q', 'қ'],
    ['r', 'р'],
    ['s', 'с'],
    ['t', 'т'],
    ['u', 'у'],
    ['v', 'в'],
    ['x', 'х'],
    ['y', 'й'],
    ['z', 'з'],
    ['sh', 'ш'],
    ['ch', 'ч'],
    ['oʼ', 'ў'],
    ['gʼ', 'ғ'],
    ['ye', 'е'],
    ['yo', 'ё'],
    ['yu', 'ю'],
    ['ya', 'я'],
    ['ʼ', 'ъ'],
    ['ee', 'еэ'], // the second e of a pair is э: reemigratsiya → реэмиграция
    ['yee', 'еэ'],
    ['yoʼ', 'йў'], // yo‘q → йўқ, not ёъқ
  ],
  rules: [
    [/^e/, 'э'],
    [/ts(?=i(on|ya))/, 'ц'], // motivatsiya → мотивация
    [/(?<=s)ʼ(?=h)/, ''], // sʼh is с + ҳ, not ш
  ],
  normalize: unifyApostrophes,
  skip: [ROMAN_NUMBER, isURL],
};

export const CYRILLIC_TO_LATIN: Definition = {
  letters: [
    ['а', 'a'],
    ['б', 'b'],
    ['в', 'v'],
    ['г', 'g'],
    ['д', 'd'],
    ['е', 'e'],
    ['ё', 'yo'],
    ['ж', 'j'],
    ['з', 'z'],
    ['и', 'i'],
    ['й', 'y'],
    ['к', 'k'],
    ['л', 'l'],
    ['м', 'm'],
    ['н', 'n'],
    ['о', 'o'],
    ['п', 'p'],
    ['р', 'r'],
    ['с', 's'],
    ['т', 't'],
    ['у', 'u'],
    ['ф', 'f'],
    ['х', 'x'],
    ['ц', 's'],
    ['ч', 'ch'],
    ['ш', 'sh'],
    ['ъ', APOSTROPHE],
    ['ь', ''],
    ['э', 'e'],
    ['ю', 'yu'],
    ['я', 'ya'],
    ['ў', `o${TURNED_COMMA}`],
    ['қ', 'q'],
    ['ғ', `g${TURNED_COMMA}`],
    ['ҳ', 'h'],
  ],
  rules: [
    [/^е/, 'ye'],
    [/е{3,}/, (m: RegExpExecArray): string => 'e'.repeat(m[0].length)], // a run of 3+ е stays e
    [new RegExp(`(?<=[${VOWELS}ьъ])е`), 'ye'],
    [/(?<=[ўғ])ъ|ъ(?=е)/, ''], // ўъ → o‘, ъе → ye
    [/(?<=ь)о/, 'yo'],
    [new RegExp(`(?<=[${VOWELS}aeiou])ц`), 'ts'], // Latin vowels too: some tests mix scripts
    [/(?<=с)ҳ/, `${APOSTROPHE}h`], // сҳ → sʼh, not sh
  ],
  skip: [ROMAN_NUMBER, isURL],
};
