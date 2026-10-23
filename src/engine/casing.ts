import type { Entry } from './lexicon';

const hasCase = (c: string) => c.toLowerCase() !== c.toUpperCase();
const isUpper = (c?: string) => c !== undefined && c !== c.toLowerCase();
const isCasedLetter = (c?: string) => c !== undefined && hasCase(c);

function capitalize(s: string): string {
  for (let i = 0; i < s.length; i++) {
    if (hasCase(s[i])) {
      return s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1).toLowerCase();
    }
  }
  return s;
}

// Lowercase without changing the length, so positions in the original stay valid
export function lower(s: string): string {
  const l = s.toLowerCase();
  if (l.length === s.length) return l;
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
  if (!replacement) return replacement;
  const source = word.slice(start, end);
  const cased = Array.from(source).filter(hasCase);

  // Nothing to copy (e.g. an apostrophe): follow the next character, else the previous
  if (!cased.length) {
    return isUpper(word[end] ?? word[start - 1])
      ? replacement.toUpperCase()
      : replacement;
  }
  if (!cased.some(isUpper)) return replacement;

  // Same length: copy the case letter by letter (ee → еэ, eE → еЭ)
  if (source.length > 1 && source.length === replacement.length) {
    return Array.from(replacement, (c, i) =>
      isUpper(source[i]) ? c.toUpperCase() : c,
    ).join('');
  }
  if (source.length > 1) {
    if (cased.every(isUpper)) return replacement.toUpperCase();
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
  if (source === entry.key) return entry.target;
  const cased = Array.from(source).filter(hasCase);
  if (cased.length && cased.every(isUpper)) return entry.lower.toUpperCase();
  return isUpper(cased[0]) ? capitalize(entry.lower) : entry.lower;
}
