import { lower, restoreLetterCase, restoreWordCase } from './casing';
import { Lexicon } from './lexicon';
import type { Definition, Exceptions, Rule } from './types';

const DEFAULT_WORD = /[\p{L}\p{M}ʻʼ’'`‘´]+/u;

export class Transliteration {
  private normalize: (word: string) => string;
  private letters: Map<string, string>;
  private longestLetter: number;
  private rules: Rule[];
  private skip: Array<(token: string) => boolean>;
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
      definition.letters.map(([k, v]) => [this.prepare(k), v]),
    );
    this.longestLetter = Math.max(
      0,
      ...Array.from(this.letters.keys(), (k) => k.length),
    );
    this.rules = (definition.rules ?? []).map(([re, to]) => [
      new RegExp(re.source, flags(re, 'g')),
      to,
    ]);
    this.skip = (definition.skip ?? []).map((skip) => {
      if (typeof skip === 'function') return skip;
      const re = new RegExp(skip.source, flags(skip));
      return (token) => re.test(token);
    });
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
    if (this.skip.some((skip) => skip(token))) return token;

    const found = this.tokenExceptions.find(this.prepare(token));
    if (found) {
      const [entry, n] = found;
      return (
        restoreWordCase(entry, token.slice(0, n)) +
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
      out = restoreWordCase(found[0], word.slice(0, found[1]));
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
        out += restoreLetterCase(to, word, i, i + n);
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
export function chain(
  ...steps: Array<(text: string) => string>
): (text: string) => string {
  return (text) => steps.reduce((t, step) => step(t), text);
}
