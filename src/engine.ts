import anchorme from 'anchorme';

/**
 * A context rule: [pattern, replacement].
 * Patterns are matched against the lowercased original word, so lookbehind and
 * lookahead always see the source text, never a half-transliterated one.
 * `^` and `$` are the edges of the word.
 */
export type Rule = [RegExp, string | ((match: RegExpExecArray) => string)];

/** [source, target] */
export type Pair = [string, string];

export interface Exceptions {
  /** Must match the whole word. */
  words?: Pair[];
  /** Match the beginning of a word; the rest is transliterated as usual. */
  stems?: Pair[];
}

export interface Definition extends Exceptions {
  /** Letters and letter groups, lowercase. The longest match wins. */
  letters: Record<string, string>;
  /** Checked before `letters`; the first rule that matches at a position wins. */
  rules?: Rule[];
  /** Tokens to leave as they are. URLs are always left as they are. */
  skip?: RegExp[];
  /** What a word is. Default: letters, combining marks and apostrophes. */
  word?: RegExp;
  /** Clean-up of the lowercased word before matching. Must keep the length. */
  normalize?: (word: string) => string;
}

export interface Transliterate {
  transliterate(text: string): string;
}

const DEFAULT_WORD = /[\p{L}\p{M}ʻʼ’'`‘´]+/u;
const URL_HINT = /[.:@/]/;

const hasCase = (c: string) => c.toLowerCase() !== c.toUpperCase();
const isUpper = (c?: string) => c !== undefined && c !== c.toLowerCase();
const isCasedLetter = (c?: string) => c !== undefined && hasCase(c);
const isURL = (token: string) =>
  URL_HINT.test(token) && anchorme.list(token).length > 0;

function capitalize(s: string): string {
  for (let i = 0; i < s.length; i++) {
    if (hasCase(s[i])) {
      return s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1).toLowerCase();
    }
  }
  return s;
}

// Lowercase without changing the length, so positions in the original stay valid
function lower(s: string): string {
  const l = s.toLowerCase();
  if (l.length === s.length) return l;
  return Array.from(s, (c) => {
    const lc = c.toLowerCase();
    return lc.length === c.length ? lc : c;
  }).join('');
}

/** Case `out` like the source characters `word[s..e)` it replaces. */
function caseLikeSource(out: string, word: string, s: number, e: number) {
  if (!out) return out;
  const src = word.slice(s, e);
  const cased = Array.from(src).filter(hasCase);

  // Nothing to copy (e.g. an apostrophe): follow the next character, else the previous
  if (!cased.length) {
    return isUpper(word[e] ?? word[s - 1]) ? out.toUpperCase() : out;
  }
  if (!cased.some(isUpper)) return out;

  // Same length: copy the case letter by letter (ee → еэ, eE → еЭ)
  if (src.length > 1 && src.length === out.length) {
    return Array.from(out, (c, i) =>
      isUpper(src[i]) ? c.toUpperCase() : c,
    ).join('');
  }
  if (src.length > 1) {
    if (cased.every(isUpper)) return out.toUpperCase();
    return isUpper(cased[0]) ? capitalize(out) : out;
  }

  // One capital becoming several letters (Ш → sh): SH inside an uppercase word, Sh otherwise
  if (Array.from(out).filter(hasCase).length < 2) return out.toUpperCase();
  const next = word[e];
  if (isCasedLetter(next))
    return isUpper(next) ? out.toUpperCase() : capitalize(out);
  return isCasedLetter(word[s - 1]) ? out.toUpperCase() : capitalize(out);
}

interface Entry {
  key: string;
  target: string;
  lower: string;
}

/** Case an exception like the word it replaces: as written, lower, UPPER or Capitalized. */
function caseLikeWord(entry: Entry, src: string) {
  if (src === entry.key) return entry.target;
  const cased = Array.from(src).filter(hasCase);
  if (cased.length && cased.every(isUpper)) return entry.lower.toUpperCase();
  return isUpper(cased[0]) ? capitalize(entry.lower) : entry.lower;
}

class Lexicon {
  private words = new Map<string, Entry>();
  private stems = new Map<string, Entry>();
  private longestStem = 0;

  add(kind: 'words' | 'stems', prepared: string, [key, target]: Pair) {
    const map = this[kind];
    if (map.has(prepared)) return; // the first definition wins
    map.set(prepared, { key, target, lower: target.toLowerCase() });
    if (kind === 'stems')
      this.longestStem = Math.max(this.longestStem, prepared.length);
  }

  /** The whole word, or else the longest stem it starts with. */
  find(word: string): [Entry, number] | undefined {
    const exact = this.words.get(word);
    if (exact) return [exact, word.length];

    for (let n = Math.min(word.length, this.longestStem); n > 0; n--) {
      const stem = this.stems.get(word.slice(0, n));
      if (stem) return [stem, n];
    }
  }

  clear() {
    this.words.clear();
    this.stems.clear();
    this.longestStem = 0;
  }
}

export class Transliteration implements Transliterate {
  private normalize: (word: string) => string;
  private letters: Map<string, string>;
  private longestLetter: number;
  private rules: Rule[];
  private skip: RegExp[];
  private word: RegExp;
  private isWord: RegExp;
  private wordExceptions = new Lexicon();
  private tokenExceptions = new Lexicon(); // keys that aren't plain words, e.g. "U+00D3"

  constructor(definition: Definition) {
    const word = definition.word ?? DEFAULT_WORD;
    const flags = (re: RegExp, extra = '') =>
      re.flags.replace(/[gy]/g, '') + extra;

    this.normalize = definition.normalize ?? ((w) => w);
    this.letters = new Map(
      Object.entries(definition.letters).map(([k, v]) => [this.prepare(k), v]),
    );
    this.longestLetter = Math.max(
      0,
      ...Array.from(this.letters.keys(), (k) => k.length),
    );
    this.rules = (definition.rules ?? []).map(([re, to]) => [
      new RegExp(re.source, flags(re, 'g')),
      to,
    ]);
    this.skip = (definition.skip ?? []).map(
      (re) => new RegExp(re.source, flags(re)),
    );
    this.word = new RegExp(word.source, flags(word, 'g'));
    this.isWord = new RegExp(`^(?:${word.source})$`, flags(word));
    this.addExceptions(definition);
  }

  addExceptions({ words = [], stems = [] }: Exceptions): void {
    for (const [kind, pairs] of [
      ['words', words],
      ['stems', stems],
    ] as const) {
      for (const pair of pairs) {
        const key = this.prepare(pair[0]);
        const lexicon = this.isWord.test(key)
          ? this.wordExceptions
          : this.tokenExceptions;
        lexicon.add(kind, key, pair);
      }
    }
  }

  clearExceptions(): void {
    this.wordExceptions.clear();
    this.tokenExceptions.clear();
  }

  transliterate(text: string): string {
    return text.replace(/\S+/g, (token) => this.transliterateToken(token));
  }

  private transliterateToken(token: string) {
    if (this.skip.some((re) => re.test(token)) || isURL(token)) return token;

    const found = this.tokenExceptions.find(this.prepare(token));
    if (found) {
      const [entry, n] = found;
      return (
        caseLikeWord(entry, token.slice(0, n)) +
        this.transliterateWords(token.slice(n))
      );
    }
    return this.transliterateWords(token);
  }

  private transliterateWords(text: string) {
    return text.replace(this.word, (word) => this.transliterateWord(word));
  }

  private transliterateWord(word: string) {
    const src = this.prepare(word);
    let out = '';
    let i = 0;

    const found = this.wordExceptions.find(src);
    if (found) {
      out = caseLikeWord(found[0], word.slice(0, found[1]));
      i = found[1];
    }

    const ruleHits = this.matchRules(src, i);

    while (i < src.length) {
      let n = 0;
      let to: string | undefined;
      const hit = ruleHits?.get(i);

      if (hit) {
        [n, to] = hit;
      } else {
        for (n = Math.min(this.longestLetter, src.length - i); n > 0; n--) {
          to = this.letters.get(src.slice(i, i + n));
          if (to !== undefined) break;
        }
      }

      if (to === undefined) {
        out += word[i++]; // unknown character: keep it
      } else {
        out += caseLikeSource(to, word, i, i + n);
        i += n;
      }
    }
    return out;
  }

  /** Where rules match: position → [length, replacement]. The first rule wins. */
  private matchRules(src: string, from: number) {
    let hits: Map<number, [number, string]> | undefined;

    for (const [re, to] of this.rules) {
      re.lastIndex = from;
      for (let m = re.exec(src); m; m = re.exec(src)) {
        if (m[0] && !hits?.has(m.index)) {
          if (!hits) hits = new Map();
          hits.set(m.index, [
            m[0].length,
            typeof to === 'function' ? to(m) : to,
          ]);
        }
        re.lastIndex = m.index + 1; // let matches overlap; the scan decides which apply
      }
    }
    return hits;
  }

  private prepare(s: string) {
    const prepared = this.normalize(lower(s));
    if (prepared.length !== s.length) {
      throw new Error('normalize() must not change the length of a word');
    }
    return prepared;
  }
}

/** Run several transliterations one after another, e.g. through a hub script. */
export function chain(...steps: Transliterate[]): Transliterate {
  return {
    transliterate: (text) =>
      steps.reduce((t, step) => step.transliterate(t), text),
  };
}
