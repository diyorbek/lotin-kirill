import {
  chain,
  Definition,
  Exceptions,
  Pair,
  Transliterate,
  Transliteration,
} from './engine';

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
  skip: [ROMAN_NUMBER],
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
  skip: [ROMAN_NUMBER],
};

// The 2026 alphabet replaces sh, ch, oʻ, gʻ with ş, ç, ö, ğ
export const LATIN_TO_NEW_LATIN: Definition = {
  letters: { sh: 'ş', ch: 'ç', oʼ: 'ö', gʼ: 'ğ' },
  rules: [[/(?<=s)ʼ(?=h)/, '']], // with ş, s + h no longer needs an apostrophe
  normalize: unifyApostrophes,
  skip: [ROMAN_NUMBER],
};

export const NEW_LATIN_TO_LATIN: Definition = {
  letters: {
    ş: 'sh',
    ç: 'ch',
    ö: `o${TURNED_COMMA}`,
    ğ: `g${TURNED_COMMA}`,
  },
  rules: [[/(?<=s)h/, `${APOSTROPHE}h`]], // s + h must not read as sh
  skip: [ROMAN_NUMBER],
};

export interface Uzbek {
  latinToCyrillic: Transliteration;
  cyrillicToLatin: Transliteration;
  latinToNewLatin: Transliteration;
  newLatinToLatin: Transliteration;
  newLatinToCyrillic: Transliterate;
  cyrillicToNewLatin: Transliterate;
}

// The current Latin script is the hub: New Latin ⇄ Latin ⇄ Cyrillic
export function createUzbek(): Uzbek {
  const latinToCyrillic = new Transliteration(LATIN_TO_CYRILLIC);
  const cyrillicToLatin = new Transliteration(CYRILLIC_TO_LATIN);
  const latinToNewLatin = new Transliteration(LATIN_TO_NEW_LATIN);
  const newLatinToLatin = new Transliteration(NEW_LATIN_TO_LATIN);

  return {
    latinToCyrillic,
    cyrillicToLatin,
    latinToNewLatin,
    newLatinToLatin,
    newLatinToCyrillic: chain(newLatinToLatin, latinToCyrillic),
    cyrillicToNewLatin: chain(cyrillicToLatin, latinToNewLatin),
  };
}

/** Turn [latin, cyrillic] pairs into exceptions for both directions. */
export function exceptionsFromPairs(pairs: Pair[]): {
  toCyrillic: Exceptions;
  toLatin: Exceptions;
} {
  const toCyrillic = { words: [] as Pair[], stems: [] as Pair[] };
  const toLatin = { words: [] as Pair[], stems: [] as Pair[] };

  for (const pair of pairs) {
    if (!pair?.[0] || !pair?.[1]) {
      throw new Error(`Invalid exceptional pair ${pair}`);
    }

    const [latin, cyrillic] = pair;
    const latinOut = unifyApostrophes(latin).replace(
      /([og])ʼ/gi,
      `$1${TURNED_COMMA}`,
    );
    const stem = cyrillic.replace(/ь$/i, ''); // октябрь, but октябрда

    toCyrillic.words.push([latin, cyrillic]);
    toCyrillic.stems.push([latin, stem]);
    toLatin.words.push([cyrillic, latinOut]);
    toLatin.stems.push([cyrillic, latinOut], [stem, latinOut]);
  }
  return { toCyrillic, toLatin };
}
