import { lower, restoreLetterCase, restoreWordCase } from './casing';
import { Lexicon } from './lexicon';
import type { Definition, Exceptions, Rule } from './types';

const DEFAULT_WORD = /[\p{L}\p{M}ʻʼ’'`‘´]+/u;

export class Transliteration {
  private normalize: (word: string) => string;
  private letters: Map<string, string>;
  private longestLetter: number;
  private rules: Rule[];
  private textRules: Array<[RegExp, string]>;
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
      definition.letters.map(([source, target]) => [
        this.prepare(source),
        target,
      ]),
    );
    this.longestLetter = Math.max(
      0,
      ...Array.from(this.letters.keys(), (source) => source.length),
    );
    this.rules = (definition.rules ?? []).map(([re, replacement]) => [
      new RegExp(re.source, flags(re, 'g')),
      replacement,
    ]);
    this.textRules = (definition.textRules ?? []).map(([re, replacement]) => [
      new RegExp(re.source, flags(re, 'g')),
      replacement,
    ]);
    this.skip = (definition.skip ?? []).map((skip) => {
      if (typeof skip === 'function') {
        return skip;
      }

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
    const rewritten = this.textRules.reduce(
      (result, [re, replacement]) => result.replace(re, replacement),
      text,
    );

    return rewritten.replace(/\S+/g, (token) => this.transliterateToken(token));
  }

  private transliterateToken(token: string) {
    if (this.skip.some((skip) => skip(token))) {
      return token;
    }

    const found = this.tokenExceptions.find(this.prepare(token));

    if (found) {
      const [entry, length] = found;

      return (
        restoreWordCase(entry, token.slice(0, length)) +
        this.transliterateWords(token.slice(length))
      );
    }

    return this.transliterateWords(token);
  }

  private transliterateWords(text: string) {
    return text.replace(this.word, (word) => this.transliterateWord(word));
  }

  private transliterateWord(word: string) {
    const prepared = this.prepare(word);
    let out = '';
    let i = 0;

    const found = this.wordExceptions.find(prepared);

    if (found) {
      const [entry, length] = found;

      out = restoreWordCase(entry, word.slice(0, length));
      i = length;
    }

    const ruleHits = this.matchRules(prepared, i);

    while (i < prepared.length) {
      let length = 0;
      let replacement: string | undefined;
      const hit = ruleHits?.get(i);

      if (hit) {
        [length, replacement] = hit;
      } else {
        for (
          length = Math.min(this.longestLetter, prepared.length - i);
          length > 0;
          length--
        ) {
          replacement = this.letters.get(prepared.slice(i, i + length));

          if (replacement !== undefined) {
            break;
          }
        }
      }

      if (replacement === undefined) {
        out += word[i++]; // unknown character: keep it
      } else {
        out += restoreLetterCase(replacement, word, i, i + length);
        i += length;
      }
    }

    return out;
  }

  /** Where rules match: position → [length, replacement]. The first rule wins. */
  private matchRules(prepared: string, from: number) {
    let hits: Map<number, [number, string]> | undefined;

    for (const [re, replacement] of this.rules) {
      re.lastIndex = from;

      for (let match = re.exec(prepared); match; match = re.exec(prepared)) {
        if (match[0] && !hits?.has(match.index)) {
          if (!hits) {
            hits = new Map();
          }

          hits.set(match.index, [
            match[0].length,
            typeof replacement === 'function'
              ? replacement(match)
              : replacement,
          ]);
        }

        re.lastIndex = match.index + 1; // let matches overlap; the scan decides which apply
      }
    }

    return hits;
  }

  private prepare(text: string) {
    const prepared = this.normalize(lower(text));

    if (prepared.length !== text.length) {
      throw new Error('normalize() must not change the length of a word');
    }

    return prepared;
  }
}

/** Run several transliterations one after another, e.g. through a hub script. */
export function chain(
  ...steps: Array<(text: string) => string>
): (text: string) => string {
  return (text) => steps.reduce((result, step) => step(result), text);
}
