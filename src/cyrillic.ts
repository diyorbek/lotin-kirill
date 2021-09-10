import { CYRILLIC_CHARACTER, CYRILLIC_CHARACTERS } from './characters';
import { capitalize, isLetter, isLowerCase, normalizeCase } from './utils';

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
  word = normalizeBigramCasing(word, /Ч/gi, 'CH');
  word = normalizeBigramCasing(word, /Ш/gi, 'SH');
  word = normalizeBigramCasing(word, /^Е/gi, 'YE');
  word = normalizeBigramCasing(word, /Ё/gi, 'YO');
  word = normalizeBigramCasing(word, /Ю/gi, 'YU');
  word = normalizeBigramCasing(word, /Я/gi, 'YA');

  // Don't split into bigram if repetitive sequence of `e`s is 3+
  word = word.replace(/е{3,}/gi, (matchString) =>
    matchString.replace(
      /е/gi,
      (str) => CYRILLIC_CHARACTERS[str as CYRILLIC_CHARACTER] || str,
    ),
  );

  return word
    .replace(/[ьъ]е/gi, (str) => normalizeCase('ye', str.charAt(1)))
    .replace(
      /[аоэеиуўёюяaeiou]е/gi,
      (str) => str.charAt(0) + normalizeCase('ye', str.charAt(1)),
    )
    .replace(/ьо/gi, (matchString) =>
      normalizeCase('yo', matchString.charAt(1)),
    )
    .replace(/[ўғ]ъ/gi, (matchString) => matchString.charAt(0))
    .replace(
      /[аоэеиуўёюяaeiou]ц/gi,
      (str) => str.charAt(0) + normalizeCase('ts', str.charAt(1)),
    );
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
