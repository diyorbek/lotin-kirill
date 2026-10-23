import { createUzbek, exceptionsFromPairs } from './uzbek';

export type ExceptionalPair = [latin: string, cyrillic: string];

export default class Transliterator {
  private uzbek = createUzbek();

  constructor(exceptions: ExceptionalPair[] = []) {
    this.extendExceptionals(exceptions);
  }

  extendExceptionals(exceptions: ExceptionalPair[]): void {
    const { toCyrillic, toLatin } = exceptionsFromPairs(exceptions);
    this.uzbek.latinToCyrillic.addExceptions(toCyrillic);
    this.uzbek.cyrillicToLatin.addExceptions(toLatin);
  }

  purgeExceptionals(): void {
    this.uzbek.latinToCyrillic.clearExceptions();
    this.uzbek.cyrillicToLatin.clearExceptions();
  }

  toCyrillic(word: string): string;
  toCyrillic(words: string[]): string[];
  toCyrillic(word: unknown): unknown {
    if (word instanceof Array) {
      return word.map((w) => this.textToCyrillic(w));
    } else if (typeof word === 'string') {
      return this.textToCyrillic(word);
    }
  }

  toLatin(word: string): string;
  toLatin(words: string[]): string[];
  toLatin(word: unknown): unknown {
    if (word instanceof Array) {
      return word.map((w) => this.textToLatin(w));
    } else if (typeof word === 'string') {
      return this.textToLatin(word);
    }
  }

  textToCyrillic(text: string): string {
    return this.uzbek.latinToCyrillic.transliterate(text);
  }

  textToLatin(text: string): string {
    return this.uzbek.cyrillicToLatin.transliterate(text);
  }
}

const defaults = createUzbek();

export function latinToCyrillic(word: string): string {
  return defaults.latinToCyrillic.transliterate(word);
}

export function cyrillicToLatin(word: string): string {
  return defaults.cyrillicToLatin.transliterate(word);
}
