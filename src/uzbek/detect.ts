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

const hasLetters = (text: string) => text.toLowerCase() !== text.toUpperCase();

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
  if (!winner && hasLetters(text)) {
    return 'latin1995';
  }

  return winner;
}

/**
 * The text in runs of words written in one alphabet, so that rules across words
 * still apply. A word that reads the same in both Latin alphabets counts as
 * latin1995, with the same result; spaces, numbers and punctuation join the run
 * of the word after them: 25 март stays together.
 *
 * Each line is split on its own, so a text gives the same runs whole and line
 * by line. A line without letters has no alphabet (undefined): nothing tells
 * what to transliterate it from. A blank line joins the run before it.
 */
export function splitByAlphabet(
  text: string,
): [Alphabet | undefined, string][] {
  const starts: [Alphabet | undefined, number][] = []; // where each run starts
  const tokens = /\S+/g;
  let match = tokens.exec(text);
  let lineStart = 0;

  // Runs of the same alphabet on neighbouring lines join: no rule reads across
  // a line break. Blank lines before the first run join it.
  const startRun = (alphabet: Alphabet | undefined, index: number) => {
    const last = starts[starts.length - 1];

    if (!last) {
      starts.push([alphabet, 0]);
    } else if (last[0] !== alphabet) {
      starts.push([alphabet, index]);
    }
  };

  while (lineStart < text.length) {
    const newline = text.indexOf('\n', lineStart);
    const lineEnd = newline === -1 ? text.length : newline + 1;
    let current: Alphabet | undefined;
    let end = lineStart; // where the last word of the current run ends
    let blank = true;

    while (match && match.index < lineEnd) {
      const word = match[0];

      blank = false;

      if (hasLetters(word)) {
        const alphabet = detectWord(word) ?? 'latin1995';

        if (!current) {
          startRun(alphabet, lineStart);
        } else if (alphabet !== current) {
          startRun(alphabet, end);
        }

        current = alphabet;
        end = match.index + word.length;
      }

      match = tokens.exec(text);
    }

    if (!current && !blank) {
      startRun(undefined, lineStart);
    }

    lineStart = lineEnd;
  }

  // Only blank lines, or spaces
  if (!starts.length && text) {
    starts.push([undefined, 0]);
  }

  return starts.map(([alphabet, start], index) => [
    alphabet,
    text.slice(start, starts[index + 1]?.[1] ?? text.length),
  ]);
}
