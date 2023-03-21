import { cyrillicToLatin } from './cyrillic';
import {
  ExceptionalPair,
  ExceptionalsCollection,
  TransliterationSource,
} from './exceptionalsCollection';
import { latinToCyrillic } from './latin';
import {
  isRomanNumber,
  isURL,
  normalizeApostrophe,
  normalizeTurnedComma,
} from './utils';

export default class Transliterator {
  private exceptionalsCollection = new ExceptionalsCollection();

  constructor(exceptions: ExceptionalPair[] = []) {
    this.extendExceptionals(exceptions);
  }

  extendExceptionals(exceptions: ExceptionalPair[]): void {
    this.exceptionalsCollection.extend(exceptions);
  }

  purgeExceptionals(): void {
    this.exceptionalsCollection.purge();
  }

  private getTransliterator(source: TransliterationSource) {
    return source === 'latin' ? latinToCyrillic : cyrillicToLatin;
  }

  private replaceExceptionals(
    word: string,
    exceptional: string | RegExp,
    replacement: string,
    transliterator: (word: string) => string,
  ) {
    let chunks = word.split(exceptional);

    chunks = chunks.map((chunk, i) => {
      const isLastChunk = i === chunks.length - 1;
      return transliterator(chunk) + (isLastChunk ? '' : replacement);
    });

    return chunks.join('');
  }

  private handleExceptional(word: string, source: TransliterationSource) {
    if (source === 'latin') {
      word = normalizeTurnedComma(normalizeApostrophe(word));
    }

    const exceptional = this.exceptionalsCollection.findCase(word, source);

    if (exceptional) {
      return this.replaceExceptionals(
        word,
        exceptional.matcher,
        exceptional.replacement,
        this.getTransliterator(source),
      );
    }
  }

  private transliteratePureWord(word: string, source: TransliterationSource) {
    const transliterator = this.getTransliterator(source);

    return word.replace(/[ʻʼ’'`´‘a-z\u0400-\u04FF\-]+/gi, (pureWord) => {
      const exceptionalWord = this.handleExceptional(pureWord, source);

      if (exceptionalWord) {
        return exceptionalWord;
      }

      return transliterator(pureWord);
    });
  }

  private transliterateWord(word: string, source: TransliterationSource) {
    if (isURL(word)) {
      return word;
    }

    if (isRomanNumber(word)) {
      return word;
    }

    const exceptionalWord = this.handleExceptional(word, source);

    if (exceptionalWord) {
      return exceptionalWord;
    }

    return this.transliteratePureWord(word, source);
  }

  toCyrillic(word: string): string;
  toCyrillic(words: string[]): string[];
  toCyrillic(word: unknown): unknown {
    if (word instanceof Array) {
      return word.map((w) => this.transliterateWord(w, 'latin'));
    } else if (typeof word === 'string') {
      return this.transliterateWord(word, 'latin');
    }
  }

  toLatin(word: string): string;
  toLatin(words: string[]): string[];
  toLatin(word: unknown): unknown {
    if (word instanceof Array) {
      return word.map((w) => this.transliterateWord(w, 'cyrillic'));
    } else if (typeof word === 'string') {
      return this.transliterateWord(word, 'cyrillic');
    }
  }

  textToCyrillic(text: string): string {
    return text.replace(/\S+/g, (word) =>
      this.transliterateWord(word, 'latin'),
    );
  }

  textToLatin(text: string): string {
    return text.replace(/\S+/g, (word) =>
      this.transliterateWord(word, 'cyrillic'),
    );
  }
}

export { cyrillicToLatin, latinToCyrillic };
