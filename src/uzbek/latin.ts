// Latin is the hub every path goes through; these are its spelling conventions

export const APOSTROPHE = 'ʼ'; // U+02BC
export const TURNED_COMMA = '‘'; // U+2018, what the library outputs after o and g

export const unifyApostrophes = (word: string): string =>
  word.replace(/[ʻʼ’'`‘´]/g, APOSTROPHE);

// How the library writes Latin: ʼ, except o‘ and g‘
export const libraryLatin = (latin: string): string =>
  unifyApostrophes(latin).replace(/([og])ʼ/gi, `$1${TURNED_COMMA}`);
