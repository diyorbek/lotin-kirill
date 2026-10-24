import { chain, Transliteration } from '../engine';
import { CYRILLIC_TO_LATIN, LATIN_TO_CYRILLIC } from './cyrillic';
import { libraryLatin } from './latin';
import { LATIN_TO_NEW_LATIN, NEW_LATIN_TO_LATIN } from './newLatin';

export { CYRILLIC_TO_LATIN, LATIN_TO_CYRILLIC } from './cyrillic';
export { APOSTROPHE, TURNED_COMMA } from './latin';
export { LATIN_TO_NEW_LATIN, NEW_LATIN_TO_LATIN } from './newLatin';

/** A word that doesn't follow the rules, spelled in at least two alphabets. */
export type ExceptionalWord =
  | { latin: string; cyrillic: string; newLatin?: string }
  | { latin: string; newLatin: string; cyrillic?: string }
  | { cyrillic: string; newLatin: string; latin?: string };

export interface Uzbek {
  latinToCyrillic(text: string): string;
  cyrillicToLatin(text: string): string;
  latinToNewLatin(text: string): string;
  newLatinToLatin(text: string): string;
  newLatinToCyrillic(text: string): string;
  cyrillicToNewLatin(text: string): string;
  addExceptions(words: ExceptionalWord[]): void;
  clearExceptions(): void;
}

// The current Latin script is the hub: New Latin ⇄ Latin ⇄ Cyrillic
export function createUzbek(): Uzbek {
  const edges = {
    latinToCyrillic: new Transliteration(LATIN_TO_CYRILLIC),
    cyrillicToLatin: new Transliteration(CYRILLIC_TO_LATIN),
    latinToNewLatin: new Transliteration(LATIN_TO_NEW_LATIN),
    newLatinToLatin: new Transliteration(NEW_LATIN_TO_LATIN),
  };
  const latinToCyrillic = (text: string) =>
    edges.latinToCyrillic.transliterate(text);
  const cyrillicToLatin = (text: string) =>
    edges.cyrillicToLatin.transliterate(text);
  const latinToNewLatin = (text: string) =>
    edges.latinToNewLatin.transliterate(text);
  const newLatinToLatin = (text: string) =>
    edges.newLatinToLatin.transliterate(text);

  return {
    latinToCyrillic,
    cyrillicToLatin,
    latinToNewLatin,
    newLatinToLatin,
    newLatinToCyrillic: chain(newLatinToLatin, latinToCyrillic),
    cyrillicToNewLatin: chain(cyrillicToLatin, latinToNewLatin),

    // Each word becomes exceptions on the edges to and from Latin
    addExceptions(words: ExceptionalWord[]): void {
      for (const word of words) {
        const { cyrillic, newLatin } = word;

        if ([word.latin, cyrillic, newLatin].filter(Boolean).length < 2) {
          throw new Error(`Invalid exceptional word ${JSON.stringify(word)}`);
        }

        // Every path goes through Latin, so a missing Latin spelling comes from the rules
        const latin = word.latin || newLatinToLatin(newLatin as string);
        const latinOut = libraryLatin(latin);

        if (cyrillic) {
          const stem = cyrillic.replace(/ь$/i, ''); // октябрь, but октябрда

          edges.latinToCyrillic.addExceptions({
            words: [[latin, cyrillic]],
            stems: [[latin, stem]],
          });
          edges.cyrillicToLatin.addExceptions({
            words: [[cyrillic, latinOut]],
            stems: [
              [cyrillic, latinOut],
              [stem, latinOut],
            ],
          });
        }

        if (newLatin) {
          edges.latinToNewLatin.addExceptions({ stems: [[latin, newLatin]] });
          edges.newLatinToLatin.addExceptions({
            stems: [[newLatin, latinOut]],
          });
        }
      }
    },

    clearExceptions(): void {
      for (const edge of Object.values(edges)) {
        edge.clearExceptions();
      }
    },
  };
}
