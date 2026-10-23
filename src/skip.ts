import anchorme from 'anchorme';

// URLs and emails always contain one of these; a cheap check before anchorme
const URL_HINT = /[.:@/]/;

/** Whether a token contains a URL or an email address. */
export function isURL(token: string): boolean {
  return URL_HINT.test(token) && anchorme.list(token).length > 0;
}

/** Roman numerals, also as list numbers: IV. or IV) */
export const ROMAN_NUMBER =
  /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})(\.|\))?$/;
