import { createUzbek } from './uzbek';

export type ExceptionalPair = [latin: string, cyrillic: string];

export default class Transliterator {
  private uzbek = createUzbek();

  constructor(exceptions: ExceptionalPair[] = []) {
    this.extendExceptionals(exceptions);
  }

  extendExceptionals(exceptions: ExceptionalPair[]): void {
    this.uzbek.addExceptions(
      exceptions.map((pair) => {
        if (!pair?.[0] || !pair?.[1]) {
          throw new Error(`Invalid exceptional pair ${pair}`);
        }
        return { latin: pair[0], cyrillic: pair[1] };
      }),
    );
  }

  purgeExceptionals(): void {
    this.uzbek.clearExceptions();
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
    return this.uzbek.latinToCyrillic(text);
  }

  textToLatin(text: string): string {
    return this.uzbek.cyrillicToLatin(text);
  }
}

const defaults = createUzbek();

export function latinToCyrillic(word: string): string {
  return defaults.latinToCyrillic(word);
}

export function cyrillicToLatin(word: string): string {
  return defaults.cyrillicToLatin(word);
}
