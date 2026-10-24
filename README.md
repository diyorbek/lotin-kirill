# Lotin-Kirill

[![](https://github.com/diyorbek/lotin-kirill/workflows/Build/badge.svg?branch=main)](https://github.com/diyorbek/lotin-kirill/actions)
[![](https://codecov.io/gh/diyorbek/lotin-kirill/branch/main/graph/badge.svg)](https://codecov.io/gh/diyorbek/lotin-kirill)
[![](https://img.shields.io/npm/v/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/npm/types/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/bundlephobia/minzip/lotin-kirill)](https://bundlephobia.com/result?p=lotin-kirill)
[![](https://img.shields.io/npm/l/lotin-kirill)](https://npmjs.com/lotin-kirill)

Transliterator for Uzbek text with high accuracy, between the 1995 and 2026 Latin alphabets and Cyrillic. Used at [transliterator.uz](https://transliterator.uz/)

### [O‘zbek tilida o‘qish](https://github.com/diyorbek/lotin-kirill/blob/master/README_UZ.md)

## Installation

NPM

```
npm install lotin-kirill --save
```

Yarn

```bash
yarn add lotin-kirill
```

UNPKG

```html
<script src="https://unpkg.com/lotin-kirill/dist/index.umd.js"></script>
```

## Usage

```js
import { createTransliterator } from 'lotin-kirill';

const transliterator = createTransliterator();

transliterator.transliterate('Salom', { from: 'latin1995', to: 'cyrillic' }); // -> 'Салом'
transliterator.transliterate('Тошкент', { from: 'cyrillic', to: 'latin2026' }); // -> 'Toşkent'
```

The alphabets:

| Name        | Alphabet                                                      |
| ----------- | ------------------------------------------------------------- |
| `latin1995` | the Latin alphabet in use since 1995 (`sh`, `ch`, `o‘`, `g‘`) |
| `latin2026` | the 2026 Latin alphabet (`ş`, `ç`, `ö`, `ğ`)                  |
| `cyrillic`  | Cyrillic                                                      |

Any direction works, for example `{ from: 'latin2026', to: 'cyrillic' }`.

### Detecting the alphabet

With `from: 'auto'`, each word is transliterated from the alphabet it's written in:

```js
transliterator.transliterate('Çoy ichdik', { from: 'auto', to: 'cyrillic' }); // -> 'Чой ичдик'
```

A word shows its alphabet through letters only that alphabet uses: any Cyrillic letter; `ş`, `ç`, `ö`, `ğ` for `latin2026`; `sh`, `ch`, `o‘`, `g‘` for `latin1995`. A word without them, like `kitob`, reads the same in both Latin alphabets. One ambiguity remains: in `latin2026`, `sh` can also be `s` + `h`, so give the source for words like `Ishoq`:

```js
transliterator.transliterate('Ishoq', { from: 'auto', to: 'cyrillic' }); // -> 'Ишоқ'
transliterator.transliterate('Ishoq', { from: 'latin2026', to: 'cyrillic' }); // -> 'Исҳоқ'
```

`detect` tells which alphabet a text is written in, going by the words that show it:

```js
transliterator.detect('Men bugun kitob öqidim'); // -> 'latin2026'
transliterator.detect('Салом'); // -> 'cyrillic'
transliterator.detect('Salom'); // -> 'latin1995', the same in both Latin alphabets
transliterator.detect('2026'); // -> undefined
```

CommonJS:

```js
const { createTransliterator } = require('lotin-kirill');
```

When using UNPKG distribution:

```html
<script src="https://unpkg.com/lotin-kirill/dist/index.umd.js"></script>
<script>
  const transliterator = lotinKirill.createTransliterator();

  transliterator.transliterate('Salom', { from: 'latin1995', to: 'cyrillic' }); // -> 'Салом'
</script>
```

### Exceptional words

Some words, mostly loanwords, don't follow the rules. Create a transliterator with a list of them. Each word gives its spelling in at least two alphabets:

```js
import { createTransliterator } from 'lotin-kirill';

const transliterator = createTransliterator({
  exceptions: [
    { latin1995: 'oktabr', cyrillic: 'октябрь' },
    { latin1995: 'Chrome', cyrillic: 'Chrome', latin2026: 'Chrome' },
  ],
});

transliterator.transliterate('oktabr', { from: 'latin1995', to: 'cyrillic' }); // -> 'октябрь' (not 'октабр')
```

One entry works in both directions:

```js
transliterator.transliterate('октябрь', { from: 'cyrillic', to: 'latin1995' }); // -> 'oktabr' (not 'oktyabr')
```

A word spelled the same in two alphabets isn't transliterated between them:

```js
transliterator.transliterate('Chrome', { from: 'latin1995', to: 'latin2026' }); // -> 'Chrome' (not 'Çrome')
```

Exceptional words with suffixes are also detected.

**Variants of a word with prefixes should be added as separate exceptions!**

```js
transliterator.transliterate('октябрда', { from: 'cyrillic', to: 'latin1995' }); // -> 'oktabrda' (not 'oktyabrda')
```

You can add exceptions later, or remove all of them:

```js
transliterator.addExceptions([{ latin1995: 'nol', cyrillic: 'ноль' }]);
transliterator.clearExceptions();
```

### Migrating from 0.x

| 0.x                                              | 1.0                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `new Transliterator([['oktabr', 'октябрь']])`    | `createTransliterator({ exceptions: [{ latin1995: 'oktabr', cyrillic: 'октябрь' }] })` |
| `t.toCyrillic(text)`, `t.textToCyrillic(text)`   | `t.transliterate(text, { from: 'latin1995', to: 'cyrillic' })`                         |
| `t.toLatin(text)`, `t.textToLatin(text)`         | `t.transliterate(text, { from: 'cyrillic', to: 'latin1995' })`                         |
| `t.toCyrillic(['…', '…'])`                       | `words.map((word) => t.transliterate(word, { from, to }))`                             |
| `t.extendExceptionals(pairs)`                    | `t.addExceptions(words)`                                                               |
| `t.purgeExceptionals()`                          | `t.clearExceptions()`                                                                  |
| `latinToCyrillic(word)`, `cyrillicToLatin(word)` | `createTransliterator().transliterate(word, { from, to })`                             |
| `lotinKirill.default` (UNPKG)                    | `lotinKirill.createTransliterator`                                                     |
