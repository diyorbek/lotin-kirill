import { chain, Transliteration } from '../engine';
import { CYRILLIC_TO_LATIN1995, LATIN1995_TO_CYRILLIC } from './cyrillic';
import { detectText, splitByAlphabet } from './detect';
import { libraryLatin } from './latin1995';
import { LATIN1995_TO_LATIN2026, LATIN2026_TO_LATIN1995 } from './latin2026';

export { CYRILLIC_TO_LATIN1995, LATIN1995_TO_CYRILLIC } from './cyrillic';
export { APOSTROPHE, TURNED_COMMA } from './latin1995';
export { LATIN1995_TO_LATIN2026, LATIN2026_TO_LATIN1995 } from './latin2026';

const ALPHABETS = ['latin1995', 'latin2026', 'cyrillic'] as const;

export type Alphabet = (typeof ALPHABETS)[number];

export interface Direction {
  /** 'auto' detects the alphabet of each word. */
  from: Alphabet | 'auto';
  to: Alphabet;
}

/** A word that doesn't follow the rules, spelled in at least two alphabets. */
export type ExceptionalWord =
  | { latin1995: string; cyrillic: string; latin2026?: string }
  | { latin1995: string; latin2026: string; cyrillic?: string }
  | { cyrillic: string; latin2026: string; latin1995?: string };

export interface Transliterator {
  transliterate(text: string, direction: Direction): string;
  /** The alphabet a text is written in; undefined if it has no letters. */
  detect(text: string): Alphabet | undefined;
  addExceptions(words: ExceptionalWord[]): void;
  clearExceptions(): void;
}

export interface TransliteratorOptions {
  exceptions?: ExceptionalWord[];
}

// latin1995 is the hub: latin2026 ⇄ latin1995 ⇄ cyrillic
export function createTransliterator({
  exceptions = [],
}: TransliteratorOptions = {}): Transliterator {
  const edges = {
    latin1995ToCyrillic: new Transliteration(LATIN1995_TO_CYRILLIC),
    cyrillicToLatin1995: new Transliteration(CYRILLIC_TO_LATIN1995),
    latin1995ToLatin2026: new Transliteration(LATIN1995_TO_LATIN2026),
    latin2026ToLatin1995: new Transliteration(LATIN2026_TO_LATIN1995),
  };
  const latin1995ToCyrillic = (text: string) =>
    edges.latin1995ToCyrillic.transliterate(text);
  const cyrillicToLatin1995 = (text: string) =>
    edges.cyrillicToLatin1995.transliterate(text);
  const latin1995ToLatin2026 = (text: string) =>
    edges.latin1995ToLatin2026.transliterate(text);
  const latin2026ToLatin1995 = (text: string) =>
    edges.latin2026ToLatin1995.transliterate(text);

  const unchanged = (text: string) => text;

  // Every direction; latin2026 ⇄ cyrillic goes through latin1995
  const paths: Record<Alphabet, Record<Alphabet, (text: string) => string>> = {
    latin1995: {
      latin1995: unchanged,
      latin2026: latin1995ToLatin2026,
      cyrillic: latin1995ToCyrillic,
    },
    latin2026: {
      latin1995: latin2026ToLatin1995,
      latin2026: unchanged,
      cyrillic: chain(latin2026ToLatin1995, latin1995ToCyrillic),
    },
    cyrillic: {
      latin1995: cyrillicToLatin1995,
      latin2026: chain(cyrillicToLatin1995, latin1995ToLatin2026),
      cyrillic: unchanged,
    },
  };

  const transliterator: Transliterator = {
    transliterate(text: string, { from, to }: Direction): string {
      if (from !== 'auto' && !ALPHABETS.includes(from)) {
        throw new Error(`Unknown alphabet: ${from}`);
      }

      if (!ALPHABETS.includes(to)) {
        throw new Error(`Unknown alphabet: ${to}`);
      }

      if (from === 'auto') {
        return splitByAlphabet(text)
          .map(([alphabet, run]) => paths[alphabet][to](run))
          .join('');
      }

      return paths[from][to](text);
    },

    detect(text: string): Alphabet | undefined {
      return detectText(text);
    },

    // Each word becomes exceptions on the edges to and from latin1995
    addExceptions(words: ExceptionalWord[]): void {
      for (const word of words) {
        const { cyrillic, latin2026 } = word;

        if ([word.latin1995, cyrillic, latin2026].filter(Boolean).length < 2) {
          throw new Error(`Invalid exceptional word ${JSON.stringify(word)}`);
        }

        // Every path goes through latin1995, so a missing latin1995 spelling comes from the rules
        const latin1995 =
          word.latin1995 || latin2026ToLatin1995(latin2026 as string);
        const latin1995Out = libraryLatin(latin1995);

        if (cyrillic) {
          const stem = cyrillic.replace(/ь$/i, ''); // октябрь, but октябрда

          edges.latin1995ToCyrillic.addExceptions({
            words: [[latin1995, cyrillic]],
            stems: [[latin1995, stem]],
          });
          edges.cyrillicToLatin1995.addExceptions({
            words: [[cyrillic, latin1995Out]],
            stems: [
              [cyrillic, latin1995Out],
              [stem, latin1995Out],
            ],
          });
        }

        if (latin2026) {
          edges.latin1995ToLatin2026.addExceptions({
            stems: [[latin1995, latin2026]],
          });
          edges.latin2026ToLatin1995.addExceptions({
            stems: [[latin2026, latin1995Out]],
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

  transliterator.addExceptions(exceptions);

  return transliterator;
}
