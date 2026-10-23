import { chain, Definition, Transliteration } from './engine';
import { isURL } from './url';

export const APOSTROPHE = 'ʼ'; // U+02BC
export const TURNED_COMMA = '‘'; // U+2018, what the library outputs after o and g

const ROMAN_NUMBER =
  /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})(\.|\))?$/;
const VOWELS = 'аоэеиуўёюя';
const unifyApostrophes = (word: string): string =>
  word.replace(/[ʻʼ’'`‘´]/g, APOSTROPHE);

export const LATIN_TO_CYRILLIC: Definition = {
  letters: {
    a: 'а',
    b: 'б',
    d: 'д',
    e: 'е',
    f: 'ф',
    g: 'г',
    h: 'ҳ',
    i: 'и',
    j: 'ж',
    k: 'к',
    l: 'л',
    m: 'м',
    n: 'н',
    o: 'о',
    p: 'п',
    q: 'қ',
    r: 'р',
    s: 'с',
    t: 'т',
    u: 'у',
    v: 'в',
    x: 'х',
    y: 'й',
    z: 'з',
    sh: 'ш',
    ch: 'ч',
    oʼ: 'ў',
    gʼ: 'ғ',
    ye: 'е',
    yo: 'ё',
    yu: 'ю',
    ya: 'я',
    ʼ: 'ъ',
    ee: 'еэ', // the second e of a pair is э: reemigratsiya → реэмиграция
    yee: 'еэ',
    yoʼ: 'йў', // yo‘q → йўқ, not ёъқ
  },
  rules: [
    [/^e/, 'э'],
    [/ts(?=i(on|ya))/, 'ц'], // motivatsiya → мотивация
    [/(?<=s)ʼ(?=h)/, ''], // sʼh is с + ҳ, not ш
  ],
  normalize: unifyApostrophes,
  skip: [ROMAN_NUMBER, isURL],
};

export const CYRILLIC_TO_LATIN: Definition = {
  letters: {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'j',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'x',
    ц: 's',
    ч: 'ch',
    ш: 'sh',
    ъ: APOSTROPHE,
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    ў: `o${TURNED_COMMA}`,
    қ: 'q',
    ғ: `g${TURNED_COMMA}`,
    ҳ: 'h',
  },
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

// The 2026 alphabet replaces sh, ch, oʻ, gʻ with ş, ç, ö, ğ
export const LATIN_TO_NEW_LATIN: Definition = {
  letters: { sh: 'ş', ch: 'ç', oʼ: 'ö', gʼ: 'ğ' },
  rules: [[/(?<=s)ʼ(?=h)/, '']], // with ş, s + h no longer needs an apostrophe
  normalize: unifyApostrophes,
  skip: [ROMAN_NUMBER, isURL],
};

export const NEW_LATIN_TO_LATIN: Definition = {
  letters: {
    ş: 'sh',
    ç: 'ch',
    ö: `o${TURNED_COMMA}`,
    ğ: `g${TURNED_COMMA}`,
  },
  rules: [[/(?<=s)h/, `${APOSTROPHE}h`]], // s + h must not read as sh
  skip: [ROMAN_NUMBER, isURL],
};

/** A word that doesn't follow the rules, spelled in at least two alphabets. */
export type ExceptionalWord =
  | { latin: string; cyrillic: string; newLatin?: string }
  | { latin: string; newLatin: string; cyrillic?: string }
  | { cyrillic: string; newLatin: string; latin?: string };

export interface Uzbek {
  latinToCyrillic(text: string): string;
  cyrillicToLatin(text: string): string;
  latinToNewLatin(text: string): string;
  newLatinToLatin(text: string): string;
  newLatinToCyrillic(text: string): string;
  cyrillicToNewLatin(text: string): string;
  addExceptions(words: ExceptionalWord[]): void;
  clearExceptions(): void;
}

// How the library writes Latin: ʼ, except o‘ and g‘
const libraryLatin = (latin: string): string =>
  unifyApostrophes(latin).replace(/([og])ʼ/gi, `$1${TURNED_COMMA}`);

// The current Latin script is the hub: New Latin ⇄ Latin ⇄ Cyrillic
export function createUzbek(): Uzbek {
  const edges = {
    latinToCyrillic: new Transliteration(LATIN_TO_CYRILLIC),
    cyrillicToLatin: new Transliteration(CYRILLIC_TO_LATIN),
    latinToNewLatin: new Transliteration(LATIN_TO_NEW_LATIN),
    newLatinToLatin: new Transliteration(NEW_LATIN_TO_LATIN),
  };
  const latinToCyrillic = (text: string) =>
    edges.latinToCyrillic.transliterate(text);
  const cyrillicToLatin = (text: string) =>
    edges.cyrillicToLatin.transliterate(text);
  const latinToNewLatin = (text: string) =>
    edges.latinToNewLatin.transliterate(text);
  const newLatinToLatin = (text: string) =>
    edges.newLatinToLatin.transliterate(text);

  return {
    latinToCyrillic,
    cyrillicToLatin,
    latinToNewLatin,
    newLatinToLatin,
    newLatinToCyrillic: chain(newLatinToLatin, latinToCyrillic),
    cyrillicToNewLatin: chain(cyrillicToLatin, latinToNewLatin),

    // Each word becomes exceptions on the edges to and from Latin
    addExceptions(words: ExceptionalWord[]): void {
      for (const word of words) {
        const { cyrillic, newLatin } = word;
        if ([word.latin, cyrillic, newLatin].filter(Boolean).length < 2) {
          throw new Error(`Invalid exceptional word ${JSON.stringify(word)}`);
        }

        // Every path goes through Latin, so a missing Latin spelling comes from the rules
        const latin = word.latin || newLatinToLatin(newLatin as string);
        const latinOut = libraryLatin(latin);

        if (cyrillic) {
          const stem = cyrillic.replace(/ь$/i, ''); // октябрь, but октябрда
          edges.latinToCyrillic.addExceptions({
            words: [[latin, cyrillic]],
            stems: [[latin, stem]],
          });
          edges.cyrillicToLatin.addExceptions({
            words: [[cyrillic, latinOut]],
            stems: [
              [cyrillic, latinOut],
              [stem, latinOut],
            ],
          });
        }

        if (newLatin) {
          edges.latinToNewLatin.addExceptions({ stems: [[latin, newLatin]] });
          edges.newLatinToLatin.addExceptions({
            stems: [[newLatin, latinOut]],
          });
        }
      }
    },

    clearExceptions(): void {
      Object.values(edges).forEach((edge) => edge.clearExceptions());
    },
  };
}
