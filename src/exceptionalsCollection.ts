import {
  capitalize,
  endsWithSoftSign,
  escapeRegex,
  isLowerCase,
  normalizeApostrophe,
  normalizeTurnedComma,
} from './utils';

/*
  Exceptional word pairs works bidirectional even if
  transliteration from cyrillic to latin is usually
  possible without exceptions list. Sepatating list 
  into 2 (one for latin, the other for cyrillc) make
  things complicated. 
  
  Proposal can be introducing optional 3rd item to 
  `ExceptionalWordPair` which will indicate 
  bidirectional, only `latin->cyrillic` or only 
  `cyrillic->latin` transliteration. This way look-ups 
  in exceptionals list can be avoided where unecessary.
*/

export type ExceptionalPair = [latin: string, cyrillic: string];
type WordCasingVariants = [ExceptionalPair, ExceptionalPair, ExceptionalPair];
type ExceptionalCase = { exceptionalWord: string; replacement: string };
type ExceptionalMatcher = { matcher: string | RegExp; replacement: string };

export type TransliterationSource = 'cyrillic' | 'latin';

export class ExceptionalsCollection {
  private collection: ExceptionalPair[] = [];

  constructor(exceptions: ExceptionalPair[] = []) {
    this.extend(exceptions);
  }

  extend(exceptions: ExceptionalPair[]): void {
    // TODO: Optimize for duplicates
    exceptions.forEach((pair) => {
      if (pair && pair[0] && pair[1]) {
        const normalizedPair = this.normalizeCharactersForLatin(pair);
        this.collection.push(
          ...this.generateWordCasingVariants(normalizedPair),
        );
      } else {
        throw new Error(`Invalid exceptional pair ${pair}`);
      }
    });
  }

  purge(): void {
    this.collection = [];
  }

  private normalizeCharactersForLatin([
    latin,
    cyrillic,
  ]: ExceptionalPair): ExceptionalPair {
    const normalizedLatin = normalizeTurnedComma(normalizeApostrophe(latin));
    return [normalizedLatin, cyrillic];
  }

  private generateWordCasingVariants([
    latin,
    cyrillic,
  ]: ExceptionalPair): WordCasingVariants {
    return [
      [latin.toLowerCase(), cyrillic.toLowerCase()],
      [latin.toUpperCase(), cyrillic.toUpperCase()],
      [capitalize(latin), capitalize(cyrillic)],
    ];
  }

  private getCase(
    exceptionalPair: ExceptionalPair,
    source: TransliterationSource,
  ): ExceptionalCase {
    const exceptionSource = source === 'latin' ? 0 : 1;
    const exceptionTarget = source === 'latin' ? 1 : 0;

    return {
      exceptionalWord: exceptionalPair[exceptionSource],
      replacement: exceptionalPair[exceptionTarget],
    };
  }

  private normalizeEndSoftSign(exceptional: ExceptionalCase) {
    const { replacement } = exceptional;
    exceptional.replacement = replacement.substring(0, replacement.length - 1);
  }

  private findInCollection(word: string, source: TransliterationSource) {
    let exceptional: ExceptionalCase;
    let alternative: ExceptionalCase | undefined;

    // If the word is typed with wrong letter-casing, default to lower-case or capitalize
    const shouldDefaultToLowerCase = isLowerCase(word.charAt(0));
    const altCasingMatch = shouldDefaultToLowerCase
      ? word.toLowerCase()
      : capitalize(word);

    for (const exceptionalPair of this.collection) {
      const { exceptionalWord, replacement } = this.getCase(
        exceptionalPair,
        source,
      );

      if (word.startsWith(exceptionalWord)) {
        exceptional = { exceptionalWord, replacement };

        if (
          source === 'latin' &&
          endsWithSoftSign(replacement) &&
          word.length !== exceptionalWord.length
        ) {
          this.normalizeEndSoftSign(exceptional);
        }

        return { exceptional };
      }

      if (altCasingMatch.startsWith(exceptionalWord)) {
        alternative = { exceptionalWord, replacement };
      }
    }

    return { alternative };
  }

  private decideMatcher(
    exceptional: ExceptionalCase | undefined,
    alternative: ExceptionalCase | undefined,
  ) {
    if (exceptional !== undefined) {
      return exceptional.exceptionalWord;
    }

    if (alternative !== undefined) {
      // Using RegExp in "case-insensetive" mode to match exceptional
      // with its alternative casing
      return new RegExp(escapeRegex(alternative.exceptionalWord), 'gi');
    }
  }

  findCase(
    word: string,
    source: TransliterationSource,
  ): ExceptionalMatcher | undefined {
    const { exceptional, alternative } = this.findInCollection(word, source);
    const matcher = this.decideMatcher(exceptional, alternative);
    const replacement = exceptional?.replacement || alternative?.replacement;

    if (matcher && replacement) {
      return { matcher, replacement };
    }
  }
}
