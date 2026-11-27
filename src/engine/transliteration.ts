import { lower, restoreLetterCase, restoreWordCase } from './casing';
import { Lexicon } from './lexicon';
import { Output } from './output';
import type { Definition, Exceptions, Path, Rule } from './types';

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
    return this.transliterateWithCuts(text, [])[0];
  }

  /** Transliterates a text and finds where offsets into it (cuts) land in the output. */
  transliterateWithCuts(
    text: string,
    cuts: readonly number[],
  ): [string, number[]] {
    let rewritten = text;
    let rewrittenCuts = cuts;

    for (const [re, replacement] of this.textRules) {
      const output = new Output(rewritten, rewrittenCuts);

      for (const match of rewritten.matchAll(re)) {
        output.keep(match.index);
        output.replace(match.index + match[0].length, replacement);
      }

      [rewritten, rewrittenCuts] = output.finish();
    }

    const output = new Output(rewritten, rewrittenCuts);
    const tokens = /\S+/g;

    // exec, not matchAll: matchAll copies the regex for every call
    for (
      let match = tokens.exec(rewritten);
      match;
      match = tokens.exec(rewritten)
    ) {
      output.keep(match.index);
      this.transliterateToken(output, match[0], match.index);
    }

    return output.finish();
  }

  /** Writes a token that starts at `start` in the source of `output`. */
  private transliterateToken(output: Output, token: string, start: number) {
    if (this.skip.some((skip) => skip(token))) {
      output.keep(start + token.length);

      return;
    }

    const found = this.tokenExceptions.find(this.prepare(token));
    let from = 0;

    if (found) {
      const [entry, length] = found;
      const source = token.slice(0, length);

      this.writeException(
        output,
        source,
        start,
        restoreWordCase(entry, source),
      );
      from = length;
    }

    this.transliterateWords(output, token.slice(from), start + from);
  }

  private transliterateWords(output: Output, text: string, start: number) {
    const words = this.word;

    words.lastIndex = 0;

    for (let match = words.exec(text); match; match = words.exec(text)) {
      output.keep(start + match.index);
      this.transliterateWord(output, match[0], start + match.index);
    }
  }

  private transliterateWord(output: Output, word: string, start: number) {
    const prepared = this.prepare(word);
    const found = this.wordExceptions.find(prepared);
    let from = 0;

    if (found) {
      const [entry, length] = found;
      const source = word.slice(0, length);

      this.writeException(
        output,
        source,
        start,
        restoreWordCase(entry, source),
      );
      from = length;
    }

    this.writeLetters(output, word, prepared, start, from);
  }

  /** Writes a word from `from` on by its letters and rules. */
  private writeLetters(
    output: Output,
    word: string,
    prepared: string,
    start: number,
    from: number,
  ) {
    const ruleHits = this.matchRules(prepared, from);
    const end = start + prepared.length;
    const cuts = output.cutsBefore(end); // counted from `from`: the output is written up to there
    const inside: number[] = [];
    let out = '';
    let i = from;

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
        length = 1;
        replacement = word[i]; // unknown character: keep it
      } else {
        replacement = restoreLetterCase(replacement, word, i, i + length);
      }

      // A cut inside the letters goes after what they give
      while (
        inside.length < cuts.length &&
        from + cuts[inside.length] < i + length
      ) {
        inside.push(
          from + cuts[inside.length] <= i
            ? out.length
            : out.length + replacement.length,
        );
      }

      out += replacement;
      i += length;
    }

    output.replace(end, out, inside);
  }

  /**
   * Writes the exception `target` for `source`, which starts at `start`. A cut
   * inside goes where the exception reads the same as what the rules give, from
   * the start or from the end: okt|abr → окт|ябрь, by the rules окт|абр.
   */
  private writeException(
    output: Output,
    source: string,
    start: number,
    target: string,
  ) {
    const end = start + source.length;
    const cuts = output.cutsBefore(end);

    if (!cuts.length) {
      output.replace(end, target);

      return;
    }

    const [byRules, cutsByRules] = this.byRules(source, cuts);

    output.replace(end, target, align(byRules, cutsByRules, target));
  }

  /** What the letters and rules give for a text, without exceptions. */
  private byRules(text: string, cuts: readonly number[]): [string, number[]] {
    const output = new Output(text, cuts);

    // A copy: this.word can be in the middle of a scan in transliterateWords
    for (const match of text.matchAll(new RegExp(this.word))) {
      const word = match[0];

      output.keep(match.index);
      this.writeLetters(output, word, this.prepare(word), match.index, 0);
    }

    return output.finish();
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

/**
 * Where cuts in what the rules give for some letters land in an exception for
 * them: in place where the two read the same from the start or from the end,
 * else after the part where they differ.
 */
function align(
  byRules: string,
  cuts: readonly number[],
  target: string,
): number[] {
  const ruled = lower(byRules);
  const listed = lower(target);
  let prefix = 0;
  let suffix = 0;

  while (
    prefix < ruled.length &&
    prefix < listed.length &&
    ruled[prefix] === listed[prefix]
  ) {
    prefix++;
  }

  while (
    suffix < ruled.length - prefix &&
    suffix < listed.length - prefix &&
    ruled[ruled.length - 1 - suffix] === listed[listed.length - 1 - suffix]
  ) {
    suffix++;
  }

  return cuts.map((cut) => {
    if (cut <= prefix) {
      return cut;
    }

    if (cut >= ruled.length - suffix) {
      return cut - ruled.length + listed.length;
    }

    return listed.length - suffix;
  });
}

/** Runs several transliterations one after another, e.g. through a hub alphabet. */
export function chain(...paths: Path[]): Path {
  return (text, cuts) =>
    paths.reduce<[string, readonly number[]]>(
      ([result, resultCuts], path) => path(result, resultCuts),
      [text, cuts],
    );
}
