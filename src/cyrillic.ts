import {
  APOSTROPHE,
  CYRILLIC_CHARACTER,
  CYRILLIC_CHARACTERS,
} from './characters';
import { capitalize, isLetter, isLowerCase, normalizeCase } from './utils';

const CH_MATCHER = /Ч/gi;
const SH_MATCHER = /Ш/gi;
const YE_START_MATCHER = /^Е/gi;
const YE_MATCHER = /Е/gi;
const YO_MATCHER = /Ё/gi;
const YU_MATCHER = /Ю/gi;
const YA_MATCHER = /Я/gi;
const YE_REPETITIVE = /е{3,}/gi;
const YE_AFTER_SOFT_MATCHER = /[ьъ]е/gi;
const YE_AFTER_VOWEL_MATCHER = /[аоэеиуўёюяaeiou]е/gi;
const TS_AFTER_VOWEL_MATCHER = /[аоэеиуўёюяaeiou]ц/gi;
const O_AFTER_SOFT_MATCHER = /ьо/gi;
const S_H_MATCHER = /сҳ/gi;
const APOSTROPHE_COLLISION_MATCHER = /[ўғ]ъ/gi;

function normalizeYeRepetitive(matchString: string) {
  return matchString.replace(
    YE_MATCHER,
    (str) => CYRILLIC_CHARACTERS[str as CYRILLIC_CHARACTER] || str,
  );
}

function normalizeYeAfterSoft(matchString: string) {
  return normalizeCase('ye', matchString.charAt(1));
}

function normalizeYeAfterVowel(matchString: string) {
  return matchString.charAt(0) + normalizeCase('ye', matchString.charAt(1));
}

function normalizeYoAfterSoft(matchString: string) {
  return normalizeCase('yo', matchString.charAt(1));
}

function normalizeApostropheCollision(matchString: string) {
  return matchString.charAt(0);
}

function normalizeTsAfterVowel(matchString: string) {
  return matchString.charAt(0) + normalizeCase('ts', matchString.charAt(1));
}

function normalizeS_H(matchString: string) {
  return (
    normalizeCase('s', matchString.charAt(0)) +
    APOSTROPHE +
    normalizeCase('h', matchString.charAt(1))
  );
}

function normalizeBigramCasing(
  word: string,
  matcher: RegExp,
  latinBigram: string,
) {
  return word.replace(matcher, (matchString, index) => {
    if (isLowerCase(matchString)) {
      return latinBigram.toLowerCase();
    }

    if (!isLetter(word[index - 1]) && !isLetter(word[index + 1])) {
      return capitalize(latinBigram);
    }

    // Assimilate to the next letter
    const assimilator = isLetter(word[index + 1]) && word[index + 1];

    if (assimilator) {
      return isLowerCase(assimilator)
        ? capitalize(latinBigram)
        : latinBigram.toUpperCase();
    }

    return latinBigram.toUpperCase();
  });
}

function replaceSpecials(word: string) {
  word = normalizeBigramCasing(word, CH_MATCHER, 'CH');
  word = normalizeBigramCasing(word, SH_MATCHER, 'SH');
  word = normalizeBigramCasing(word, YE_START_MATCHER, 'YE');
  word = normalizeBigramCasing(word, YO_MATCHER, 'YO');
  word = normalizeBigramCasing(word, YU_MATCHER, 'YU');
  word = normalizeBigramCasing(word, YA_MATCHER, 'YA');

  // Don't split into bigram if repetitive sequence of `e`s is 3+
  word = word.replace(YE_REPETITIVE, normalizeYeRepetitive);

  return word
    .replace(YE_AFTER_SOFT_MATCHER, normalizeYeAfterSoft)
    .replace(YE_AFTER_VOWEL_MATCHER, normalizeYeAfterVowel)
    .replace(O_AFTER_SOFT_MATCHER, normalizeYoAfterSoft)
    .replace(APOSTROPHE_COLLISION_MATCHER, normalizeApostropheCollision)
    .replace(TS_AFTER_VOWEL_MATCHER, normalizeTsAfterVowel)
    .replace(S_H_MATCHER, normalizeS_H);
}

export function cyrillicToLatin(word: string): string {
  const escapedWord = replaceSpecials(word);
  let out = '';

  for (const char of escapedWord) {
    if (char in CYRILLIC_CHARACTERS) {
      out += CYRILLIC_CHARACTERS[char as CYRILLIC_CHARACTER];
    } else {
      out += char;
    }
  }

  return out;
}
