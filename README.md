# Lotin-Kirill

Transliterator for uzbek words with high accuracy.

## Installation

NPM

```
npm install lotin-kirill --save
```

Yarn

```bash
yarn add lotin-kirill
```

## Usage

Initialize the engine:

```js
import Transliterator from 'lotin-kirill';

const transliterator = new Transliterator();
```

### Single word transliteration:

`toLatin(word: string): string`

`toCyrillic(word: string): string`

Example

```js
const latinWord = transliterator.toLatin('мотивация');
console.log(latinWord); // -> 'motivatsiya'

const cyrillicWord = transliterator.toCyrillic("e'lon");
console.log(cyrillicWord); // -> 'эълон'
```

### Text (multiple words) tranliteration:

`textToLatin(text: string): string`

`textToCyrillic(text: string): string`

Example

```js
const latinText = transliterator.textToLatin('Жуда узун кириллча текст.');
console.log(latinText); // -> 'Juda uzun kirillcha tekst.'

const cyrillicText = transliterator.textToCyrillic('Juda uzun lotincha tekst.');
console.log(cyrillicText); // -> 'Жуда узун лотинча текст.'
```

### Exceptional words

You can initialize the transliterator object with exceptional words list:

```js
import Transliterator from 'lotin-kirill';

const transliterator = new Transliterator([
  // [latinWord, cyrillicWord]
  ['oktabr', 'октябрь'],
  ['Google', 'Google'],
]);

const cyrillicWord = transliterator.toCyrillic('oktabr');
console.log(cyrillicWord); // -> 'октябрь' (not 'октабр')
```

One exceptional pair is enough for both cyrilllic and latin transliterations.

```js
// This also works
const latinWord = transliterator.toLatin('октябрь');
console.log(latinWord); // -> 'oktabr' (not 'oktyabr')
```

If exceptional pair is a pair of same words, the word is not transliterated.

```js
const cyrillicWord = transliterator.toCyrillic('Google');
console.log(cyrillicWord); // -> 'Google'
```

Exceptional words with sufixes are also detected.

```js
// This also works
const latinWord = transliterator.toLatin('октябрда');
console.log(latinWord); // -> 'oktabrda' (not 'oktyabrda')
```

You can extend the exceptionals list after initialization of the transliterator.

```js
transliterator.extendExceptionals([['nol', 'ноль']]);
```

Or purge all of the exceptionals added to trasnliterator.

```js
transliterator.purgeExceptionals();
```

### Pure trasnliterator functions

There are pure transliterator functions which operates only on basic transliteration rules. These functions don't lookup words in exceptionals list.

`cyrillicToLatin(word: string): string`

`latinToCyrillic(word: string): string`

```js
import Transliterator, { cyrillicToLatin, latinToCyrillic } from 'lotin-kirill';

const transliterator = new Transliterator([['oktabr', 'октябрь']]);

console.log(transliterator.toLatin('октябрь')); // -> 'oktabr'
console.log(cyrillicToLatin('октябрь')); // -> 'oktyabr'

console.log(transliterator.toCyrillic('oktabr')); // -> 'октябрь'
console.log(latinToCyrillic('oktabr')); // -> 'октабр'
```
