// latin1995 is the hub every path goes through; these are its spelling conventions

export const APOSTROPHE = 'ʼ'; // U+02BC
export const TURNED_COMMA = 'ʻ'; // U+02BB, what the library outputs after o and g

export const unifyApostrophes = (word: string): string =>
  word.replace(/[ʻʼ’'`‘´]/g, APOSTROPHE);

// How the library writes Latin: ʼ, except o‘ and g‘
export const libraryLatin = (latin1995: string): string =>
  unifyApostrophes(latin1995).replace(/([og])ʼ/gi, `$1${TURNED_COMMA}`);
