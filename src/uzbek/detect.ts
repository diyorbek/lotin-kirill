import type { Alphabet } from '.';
import { CYRILLIC_TO_LATIN1995 } from './cyrillic';
import { unifyApostrophes } from './latin1995';
import { LATIN1995_TO_LATIN2026, LATIN2026_TO_LATIN1995 } from './latin2026';

// Letters only one alphabet uses, taken from the letter tables. The order
// matters: a word with any Cyrillic letter is Cyrillic, even if it mixes in Latin.
const SIGNS: [Alphabet, string[]][] = [
  ['cyrillic', CYRILLIC_TO_LATIN1995.letters.map(([source]) => source)],
  ['latin2026', LATIN2026_TO_LATIN1995.letters.map(([source]) => source)],
  ['latin1995', LATIN1995_TO_LATIN2026.letters.map(([source]) => source)],
];

/**
 * The alphabet a word is written in, or undefined if nothing in it tells the
 * alphabets apart: "Salom" reads the same in both Latin alphabets.
 */
export function detectWord(word: string): Alphabet | undefined {
  const prepared = unifyApostrophes(word.toLowerCase());

  for (const [alphabet, signs] of SIGNS) {
    if (signs.some((sign) => prepared.includes(sign))) {
      return alphabet;
    }
  }
}

/**
 * The alphabet most of a text's telling words are written in; ties go to the
 * one seen first. Words that read the same in both Latin alphabets don't vote,
 * because most words of a 2026 text look like 1995 ones.
 */
export function detectText(text: string): Alphabet | undefined {
  const votes = new Map<Alphabet, number>();

  for (const word of text.split(/\s+/)) {
    const alphabet = detectWord(word);

    if (alphabet) {
      votes.set(alphabet, (votes.get(alphabet) ?? 0) + 1);
    }
  }

  let winner: Alphabet | undefined;
  let winnerVotes = 0;

  for (const [alphabet, count] of votes) {
    if (count > winnerVotes) {
      winner = alphabet;
      winnerVotes = count;
    }
  }

  // Letters, but none that tell the two Latin alphabets apart
  if (!winner && text.toLowerCase() !== text.toUpperCase()) {
    return 'latin1995';
  }

  return winner;
}
