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
  /** Letters and letter groups, lowercase. The longest match wins; a later duplicate overrides. */
  letters: Pair[];
  /** Checked before `letters`; the first rule that matches at a position wins. */
  rules?: Rule[];
  /** Tokens to leave as they are, e.g. Roman numerals or URLs. */
  skip?: Array<RegExp | ((token: string) => boolean)>;
  /** What a word is. Default: letters, combining marks and apostrophes. */
  word?: RegExp;
  /** Clean-up of the lowercased word before matching. Must keep the length. */
  normalize?: (word: string) => string;
}
