import type { Definition } from '../engine';
import { isURL, ROMAN_NUMBER } from '../skip';
import { APOSTROPHE, TURNED_COMMA, unifyApostrophes } from './latin';

// The 2026 alphabet replaces sh, ch, oʻ, gʻ with ş, ç, ö, ğ
export const LATIN_TO_NEW_LATIN: Definition = {
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

export const NEW_LATIN_TO_LATIN: Definition = {
  letters: [
    ['ş', 'sh'],
    ['ç', 'ch'],
    ['ö', `o${TURNED_COMMA}`],
    ['ğ', `g${TURNED_COMMA}`],
  ],
  rules: [[/(?<=s)h/, `${APOSTROPHE}h`]], // s + h must not read as sh
  skip: [ROMAN_NUMBER, isURL],
};
