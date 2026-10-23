import anchorme from 'anchorme';

// URLs and emails always contain one of these; a cheap check before anchorme
const URL_HINT = /[.:@/]/;

/** Whether a token contains a URL or an email address. */
export function isURL(token: string): boolean {
  return URL_HINT.test(token) && anchorme.list(token).length > 0;
}
