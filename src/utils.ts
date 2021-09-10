import anchorme from 'anchorme';

export function isLowerCase(char: string): boolean {
  return char.toLowerCase() === char;
}

export function normalizeCase(char: string, assimilateTo: string): string {
  return isLowerCase(assimilateTo) ? char.toLowerCase() : char.toUpperCase();
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
}

// Detect only alphabetical letters, excluding apostrophe(')
export function isLetter(char: unknown): boolean {
  if (typeof char === 'string') {
    return /^[a-z\u0400-\u04FF]+$/i.test(char);
  }

  return false;
}

export function isVovel(char: string): boolean {
  return /[аоэеиуўёюяaeiou]/i.test(char);
}

export function isURL(word: string): boolean {
  return anchorme.list(word).length > 0;
}

export function escapeRegex(expString: string): string {
  return expString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function endsWithSoftSign(word: string): boolean {
  return /ь$/i.test(word);
}

export function isRomanNumber(word: string): boolean {
  return /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})(\.|\))?$/.test(
    word,
  );
}
