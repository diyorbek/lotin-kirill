import anchorme from 'anchorme';
import { APOSTROPHE, TURNED_COMMA } from './characters';

const TURNED_COMMA_MATCHER = /[og][ʻʼ’'`‘´]/gi;
const APOSTROPHE_MATCHER = /[ʻʼ’'`‘´]/gi;
const VOVEL_MATCHER = /[аоэеиуўёюяaeiou]/i;
const REGEXP_ESC_MATCHER = /[-\/\\^$*+?.()|[\]{}]/g;
const ROMAN_NUMBER_MATCHER =
  /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})(\.|\))?$/;

export function isLowerCase(char: string): boolean {
  return char.toLowerCase() === char;
}

export function normalizeCase(char: string, assimilateTo: string): string {
  return isLowerCase(assimilateTo) ? char.toLowerCase() : char.toUpperCase();
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
}

// Detect only alphabetical letters, excluding apostrophe(')
export function isLetter(char: unknown): boolean {
  if (typeof char === 'string') {
    return /^[a-z\u0400-\u04FF]+$/i.test(char);
  }

  return false;
}

export function isVovel(char: string): boolean {
  return VOVEL_MATCHER.test(char);
}

export function isURL(word: string): boolean {
  return anchorme.list(word).length > 0;
}

export function escapeRegex(expString: string): string {
  return expString.replace(REGEXP_ESC_MATCHER, '\\$&');
}

export function endsWithSoftSign(word: string): boolean {
  return /ь$/i.test(word);
}

export function isRomanNumber(word: string): boolean {
  return ROMAN_NUMBER_MATCHER.test(word);
}

export function normalizeTurnedComma(word: string): string {
  return word.replace(
    TURNED_COMMA_MATCHER,
    (matched) => matched.charAt(0) + TURNED_COMMA,
  );
}

export function normalizeApostrophe(word: string): string {
  return word.replace(APOSTROPHE_MATCHER, APOSTROPHE);
}
