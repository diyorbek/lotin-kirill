import type { Definition } from '../engine';
import { isURL, ROMAN_NUMBER } from '../skip';
import { APOSTROPHE, TURNED_COMMA, unifyApostrophes } from './latin1995';

// The 2026 alphabet replaces sh, ch, oʻ, gʻ with ş, ç, ö, ğ
export const LATIN1995_TO_LATIN2026: Definition = {
  letters: [
    ['sh', 'ş'],
    ['ch', 'ç'],
    ['oʼ', 'ö'],
    ['gʼ', 'ğ'],
  ],
  rules: [[/(?<=s)ʼ(?=h)/, '']], // with ş, s + h no longer needs an apostrophe
  normalize: unifyApostrophes,
  skip: [ROMAN_NUMBER, isURL],
};

export const LATIN2026_TO_LATIN1995: Definition = {
  letters: [
    ['ş', 'sh'],
    ['ç', 'ch'],
    ['ö', `o${TURNED_COMMA}`],
    ['ğ', `g${TURNED_COMMA}`],
  ],
  rules: [[/(?<=s)h/, `${APOSTROPHE}h`]], // s + h must not read as sh
  skip: [ROMAN_NUMBER, isURL],
};
