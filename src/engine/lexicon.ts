import type { Pair } from './types';

export interface Entry {
  key: string;
  target: string;
  lower: string;
}

export class Lexicon {
  private words = new Map<string, Entry>();
  private stems = new Map<string, Entry>();
  private longestStem = 0;

  add(kind: 'words' | 'stems', prepared: string, [key, target]: Pair): void {
    const map = this[kind];

    // The first definition wins
    if (map.has(prepared)) {
      return;
    }

    map.set(prepared, { key, target, lower: target.toLowerCase() });

    if (kind === 'stems') {
      this.longestStem = Math.max(this.longestStem, prepared.length);
    }
  }

  /** The whole word, or else the longest stem it starts with. */
  find(word: string): [Entry, number] | undefined {
    const exact = this.words.get(word);

    if (exact) {
      return [exact, word.length];
    }

    for (let n = Math.min(word.length, this.longestStem); n > 0; n--) {
      const stem = this.stems.get(word.slice(0, n));

      if (stem) {
        return [stem, n];
      }
    }
  }

  clear(): void {
    this.words.clear();
    this.stems.clear();
    this.longestStem = 0;
  }
}
