# Lotin-Kirill

[![](https://github.com/diyorbek/lotin-kirill/workflows/Build/badge.svg?branch=main)](https://github.com/diyorbek/lotin-kirill/actions)
[![](https://codecov.io/gh/diyorbek/lotin-kirill/branch/main/graph/badge.svg)](https://codecov.io/gh/diyorbek/lotin-kirill)
[![](https://img.shields.io/npm/v/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/npm/types/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/bundlephobia/minzip/lotin-kirill)](https://bundlephobia.com/result?p=lotin-kirill)
[![](https://img.shields.io/npm/l/lotin-kirill)](https://npmjs.com/lotin-kirill)

O‘zbek tilidagi so‘zlarni yuqori aniqlikda transliteratsiya qiluvchi kutubxona. So‘zlarni 1995 va 2026 yilgi lotin alifbolari hamda kirill alifbosi o‘rtasida o‘girish.

### [Read in English](https://github.com/diyorbek/lotin-kirill/blob/master/README.md)

## O‘rnatish

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

## Foydalanish

```js
import { createTransliterator } from 'lotin-kirill';

const transliterator = createTransliterator();

transliterator.transliterate('Salom', { from: 'latin1995', to: 'cyrillic' }); // -> 'Салом'
transliterator.transliterate('Тошкент', { from: 'cyrillic', to: 'latin2026' }); // -> 'Toşkent'
```

Alifbolar:

| Nomi        | Alifbo                                                                    |
| ----------- | ------------------------------------------------------------------------- |
| `latin1995` | 1995-yildan beri qo‘llanilayotgan lotin alifbosi (`sh`, `ch`, `o‘`, `g‘`) |
| `latin2026` | 2026-yilgi lotin alifbosi (`ş`, `ç`, `ö`, `ğ`)                            |
| `cyrillic`  | kirill alifbosi                                                           |

Istalgan yo‘nalishda o‘girish mumkin, masalan `{ from: 'latin2026', to: 'cyrillic' }`.

CommonJS:

```js
const { createTransliterator } = require('lotin-kirill');
```

UNPKG orqali ulaganda:

```html
<script src="https://unpkg.com/lotin-kirill/dist/index.umd.js"></script>
<script>
  const transliterator = lotinKirill.createTransliterator();

  transliterator.transliterate('Salom', { from: 'latin1995', to: 'cyrillic' }); // -> 'Салом'
</script>
```

### Istisno so‘zlar

Ba’zi so‘zlar, asosan o‘zlashma so‘zlar, qoidalarga bo‘ysunmaydi. Transliteratorni ularning ro‘yxati bilan yarating. Har bir so‘z kamida ikki alifbodagi yozilishi bilan beriladi:

```js
import { createTransliterator } from 'lotin-kirill';

const transliterator = createTransliterator({
  exceptions: [
    { latin1995: 'oktabr', cyrillic: 'октябрь' },
    { latin1995: 'Chrome', cyrillic: 'Chrome', latin2026: 'Chrome' },
  ],
});

transliterator.transliterate('oktabr', { from: 'latin1995', to: 'cyrillic' }); // -> 'октябрь' ('октабр' emas)
```

Bitta yozuv ikkala yo‘nalish uchun yetarli:

```js
transliterator.transliterate('октябрь', { from: 'cyrillic', to: 'latin1995' }); // -> 'oktabr' ('oktyabr' emas)
```

Ikki alifboda bir xil yoziladigan so‘z ular orasida o‘girilmaydi:

```js
transliterator.transliterate('Chrome', { from: 'latin1995', to: 'latin2026' }); // -> 'Chrome' ('Çrome' emas)
```

Istisno so‘zlar qo‘shimcha qo‘shilgan holatda ham to‘g‘ri o‘giriladi.

**Faqat old qo‘shimchalar bundan mustasno!** So‘zning old qo‘shimcha qo‘shilgan varianti alohida istisno sifatida qo‘shilishi kerak.

```js
transliterator.transliterate('октябрда', { from: 'cyrillic', to: 'latin1995' }); // -> 'oktabrda' ('oktyabrda' emas)
```

Istisnolarni keyinroq qo‘shish yoki hammasini o‘chirish mumkin:

```js
transliterator.addExceptions([{ latin1995: 'nol', cyrillic: 'ноль' }]);
transliterator.clearExceptions();
```

### 0.x versiyadan o‘tish

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
