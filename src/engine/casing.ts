import type { Entry } from './lexicon';

const hasCase = (c: string) => c.toLowerCase() !== c.toUpperCase();
const isUpper = (c?: string) => c !== undefined && c !== c.toLowerCase();
const isCasedLetter = (c?: string) => c !== undefined && hasCase(c);

// First letter uppercase, the rest lowercase. "First letter" is the first
// character that has a case, so leading digits or apostrophes are skipped:
// "3dmax" → "3Dmax", where a plain capitalize would leave it unchanged.
function capitalize(s: string): string {
  let i = 0;

  while (i < s.length && !hasCase(s[i])) {
    i++;
  }

  return (
    s.slice(0, i) +
    s.slice(i, i + 1).toUpperCase() +
    s.slice(i + 1).toLowerCase()
  );
}

// Lowercase without changing the length, so positions in the original stay valid
export function lower(s: string): string {
  const lowered = s.toLowerCase();

  if (lowered.length === s.length) {
    return lowered;
  }

  // Only one character changes length: İ (U+0130) lowercases to "i̇", an i plus
  // a combining dot, which would shift every position after it. Keep such a
  // character as it is and lowercase the others one by one.
  return Array.from(s, (c) => {
    const lc = c.toLowerCase();
    return lc.length === c.length ? lc : c;
  }).join('');
}

/** Put the original capitals back on the lowercase replacement for `word[start..end)`. */
export function restoreLetterCase(
  replacement: string,
  word: string,
  start: number,
  end: number,
): string {
  if (!replacement) {
    return replacement;
  }

  const source = word.slice(start, end);
  const cased = Array.from(source).filter(hasCase);

  // Nothing to copy (e.g. an apostrophe): follow the next character, else the previous
  if (!cased.length) {
    return isUpper(word[end] ?? word[start - 1])
      ? replacement.toUpperCase()
      : replacement;
  }

  if (!cased.some(isUpper)) {
    return replacement;
  }

  // Same length: copy the case letter by letter (ee → еэ, eE → еЭ)
  if (source.length > 1 && source.length === replacement.length) {
    return Array.from(replacement, (c, i) =>
      isUpper(source[i]) ? c.toUpperCase() : c,
    ).join('');
  }

  if (source.length > 1) {
    if (cased.every(isUpper)) {
      return replacement.toUpperCase();
    }

    return isUpper(cased[0]) ? capitalize(replacement) : replacement;
  }

  // One capital becoming several letters (Ш → sh): SH inside an uppercase word, Sh otherwise
  if (Array.from(replacement).filter(hasCase).length < 2) {
    return replacement.toUpperCase();
  }

  const next = word[end];

  if (isCasedLetter(next)) {
    return isUpper(next) ? replacement.toUpperCase() : capitalize(replacement);
  }

  return isCasedLetter(word[start - 1])
    ? replacement.toUpperCase()
    : capitalize(replacement);
}

/** Put the original capitals back on an exception: as written, lower, UPPER or Capitalized. */
export function restoreWordCase(entry: Entry, source: string): string {
  if (source === entry.key) {
    return entry.target;
  }

  const cased = Array.from(source).filter(hasCase);

  if (cased.length && cased.every(isUpper)) {
    return entry.lower.toUpperCase();
  }

  return isUpper(cased[0]) ? capitalize(entry.lower) : entry.lower;
}
