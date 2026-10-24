# Lotin-Kirill

[![](https://github.com/diyorbek/lotin-kirill/workflows/Build/badge.svg?branch=main)](https://github.com/diyorbek/lotin-kirill/actions)
[![](https://codecov.io/gh/diyorbek/lotin-kirill/branch/main/graph/badge.svg)](https://codecov.io/gh/diyorbek/lotin-kirill)
[![](https://img.shields.io/npm/v/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/npm/types/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/bundlephobia/minzip/lotin-kirill)](https://bundlephobia.com/result?p=lotin-kirill)
[![](https://img.shields.io/npm/l/lotin-kirill)](https://npmjs.com/lotin-kirill)

Oʻzbek tilidagi soʻzlarni yuqori aniqlikda transliteratsiya qiluvchi kutubxona. Soʻzlarni 1995 va 2026 yilgi lotin alifbolari hamda kirill alifbosi oʻrtasida oʻgirish.

### [Read in English](https://github.com/diyorbek/lotin-kirill/blob/master/README.md)

## Oʻrnatish

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
| `latin1995` | 1995-yildan beri qoʻllanilayotgan lotin alifbosi (`sh`, `ch`, `oʻ`, `gʻ`) |
| `latin2026` | 2026-yilgi lotin alifbosi (`ş`, `ç`, `ö`, `ğ`)                            |
| `cyrillic`  | kirill alifbosi                                                           |

Istalgan yoʻnalishda oʻgirish mumkin, masalan `{ from: 'latin2026', to: 'cyrillic' }`.

Kutubxona `oʻ` va `gʻ` harflarini `ʻ` (U+02BB), tutuq belgisini esa `ʼ` (U+02BC) bilan yozadi, imlo qoidalari shuni talab qiladi. Kiritilgan matnda ularga oʻxshash istalgan belgi boʻlishi mumkin: `'`, `‘`, `’`, `` ` ``.

### Alifboni aniqlash

`from: 'auto'` berilsa, har bir soʻz oʻzi yozilgan alifbodan oʻgiriladi:

```js
transliterator.transliterate('Çoy ichdik', { from: 'auto', to: 'cyrillic' }); // -> 'Чой ичдик'
```

Soʻz oʻz alifbosini faqat oʻsha alifboda bor harflar orqali koʻrsatadi: istalgan kirill harfi; `latin2026` uchun `ş`, `ç`, `ö`, `ğ`; `latin1995` uchun `sh`, `ch`, `oʻ`, `gʻ`. Bunday harflari yoʻq soʻz, masalan `kitob`, ikkala lotin alifbosida bir xil yoziladi. Bitta noaniqlik qoladi: `latin2026` da `sh` `s` + `h` ham boʻlishi mumkin, shuning uchun `Ishoq` kabi soʻzlar uchun manba alifboni koʻrsating:

```js
transliterator.transliterate('Ishoq', { from: 'auto', to: 'cyrillic' }); // -> 'Ишоқ'
transliterator.transliterate('Ishoq', { from: 'latin2026', to: 'cyrillic' }); // -> 'Исҳоқ'
```

`detect` matn qaysi alifboda yozilganini, buni koʻrsatadigan soʻzlar boʻyicha aniqlaydi:

```js
transliterator.detect('Men bugun kitob öqidim'); // -> 'latin2026'
transliterator.detect('Салом'); // -> 'cyrillic'
transliterator.detect('Salom'); // -> 'latin1995', ikkala lotin alifbosida bir xil
transliterator.detect('2026'); // -> undefined
```

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

### Istisno soʻzlar

Baʼzi soʻzlar, asosan oʻzlashma soʻzlar, qoidalarga boʻysunmaydi. Transliteratorni ularning roʻyxati bilan yarating. Har bir soʻz kamida ikki alifbodagi yozilishi bilan beriladi:

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

Bitta yozuv ikkala yoʻnalish uchun yetarli:

```js
transliterator.transliterate('октябрь', { from: 'cyrillic', to: 'latin1995' }); // -> 'oktabr' ('oktyabr' emas)
```

Ikki alifboda bir xil yoziladigan soʻz ular orasida oʻgirilmaydi:

```js
transliterator.transliterate('Chrome', { from: 'latin1995', to: 'latin2026' }); // -> 'Chrome' ('Çrome' emas)
```

Istisno soʻzlar qoʻshimcha qoʻshilgan holatda ham toʻgʻri oʻgiriladi.

**Faqat old qoʻshimchalar bundan mustasno!** Soʻzning old qoʻshimcha qoʻshilgan varianti alohida istisno sifatida qoʻshilishi kerak.

```js
transliterator.transliterate('октябрда', { from: 'cyrillic', to: 'latin1995' }); // -> 'oktabrda' ('oktyabrda' emas)
```

Istisnolarni keyinroq qoʻshish yoki hammasini oʻchirish mumkin:

```js
transliterator.addExceptions([{ latin1995: 'nol', cyrillic: 'ноль' }]);
transliterator.clearExceptions();
```

### 0.x versiyadan oʻtish

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
