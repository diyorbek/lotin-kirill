import { LATIN_CHARACTER, LATIN_CHARACTERS } from './characters';
import { normalizeCase } from './utils';

function transliterateBigram(
  word: string,
  matcher: RegExp,
  cyrillicBigram: string,
) {
  return word.replace(matcher, (matchString) => {
    return normalizeCase(cyrillicBigram, matchString[0]);
  });
}

function transliterateApostrophe(word: string) {
  const apostrophe = 'ъ';

  return word.replace(/[ʻʼ’'`‘´]/g, (_, index) => {
    // Prioritize assimilation to the next letter
    const assimilator: string | undefined = word[index + 1] || word[index - 1];

    if (assimilator) {
      return normalizeCase(apostrophe, assimilator);
    }

    return apostrophe.toLowerCase();
  });
}

function transliterateSpecialLetters(word: string) {
  word = word.replace(/tsi(on|ya)/gi, (matchString) => {
    return transliterateBigram(matchString, /ts/i, 'ц');
  });

  /* 
  Replace with 'Э' if:
    1. word starts with 'E'
    2. 'E' comes after non-letter symbol
    3. cyrillic letter 
  */
  word = word.replace(/^e|[\W]e/gi, (matchString) => {
    return transliterateBigram(matchString, /e/i, 'э');
  });

  word = word.replace(/e{2}/gi, (matchString) => {
    return matchString[0] + normalizeCase('э', matchString[1]);
  });

  word = transliterateBigram(word, /ch/gi, 'ч');
  word = transliterateBigram(word, /sh/gi, 'ш');
  word = transliterateBigram(word, /g[ʻʼ’'`‘´]/gi, 'ғ');
  word = transliterateBigram(word, /o[ʻʼ’'`‘´]/gi, 'ў');
  word = transliterateBigram(word, /ye/gi, 'е');
  word = transliterateBigram(word, /yo/gi, 'ё');
  word = transliterateBigram(word, /yu/gi, 'ю');
  word = transliterateBigram(word, /ya/gi, 'я');

  // handle non-bigram "S'H" => "СҲ" combination
  word = word.replace(/s[ʻʼ’'`‘´]h/gi, (matchString) => {
    const s =
      LATIN_CHARACTERS[matchString[0] as LATIN_CHARACTER] || matchString[0];
    const h =
      LATIN_CHARACTERS[matchString[2] as LATIN_CHARACTER] || matchString[2];

    return s + h;
  });

  word = transliterateApostrophe(word);

  return word;
}

export function latinToCyrillic(word: string): string {
  const escapedWord = transliterateSpecialLetters(word);
  let out = '';

  for (const char of escapedWord) {
    if (char in LATIN_CHARACTERS) {
      out += LATIN_CHARACTERS[char as LATIN_CHARACTER];
    } else {
      out += char;
    }
  }

  return out;
}
