# Lotin-Kirill

[![](https://github.com/diyorbek/lotin-kirill/workflows/Build/badge.svg?branch=main)](https://github.com/diyorbek/lotin-kirill/actions)
[![](https://codecov.io/gh/diyorbek/lotin-kirill/branch/main/graph/badge.svg)](https://codecov.io/gh/diyorbek/lotin-kirill)
[![](https://img.shields.io/npm/v/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/npm/types/lotin-kirill)](https://npmjs.com/lotin-kirill)
[![](https://img.shields.io/bundlephobia/minzip/lotin-kirill)](https://bundlephobia.com/result?p=lotin-kirill)
[![](https://img.shields.io/npm/l/lotin-kirill)](https://npmjs.com/lotin-kirill)

O‘zbek tilidagi so‘zlarni yuqori aniqlikda transliteratsiya qiluvchi kutubxona. So‘zlarni lotin alifbosidan kirillga va aksincha o‘girish.

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
<script src="https://unpkg.com/lotin-kirill/dist-umd/index.min.js"></script>
```

## Foydalanish

Initsializatsiya:

```js
import Transliterator from 'lotin-kirill';

const transliterator = new Transliterator();
```

UNPKG orqali ulaganda:

```html
<script src="https://unpkg.com/lotin-kirill/dist-umd/index.min.js"></script>
<script>
  const Transliterator = lotinKirill.default;
  const transliterator = new Transliterator();
</script>
```

### So‘zma-so‘z o‘girish:

`toLatin(word: string): string`

`toCyrillic(word: string): string`

Naʼmuna

```js
const latinWord = transliterator.toLatin('мотивация');
console.log(latinWord); // -> 'motivatsiya'

const cyrillicWord = transliterator.toCyrillic("e'lon");
console.log(cyrillicWord); // -> 'эълон'
```

### Tekstni (bir necha so‘zdan iborat) o‘girish:

`textToLatin(text: string): string`

`textToCyrillic(text: string): string`

Naʼmuna

```js
const latinText = transliterator.textToLatin('Жуда узун кириллча текст.');
console.log(latinText); // -> 'Juda uzun kirillcha tekst.'

const cyrillicText = transliterator.textToCyrillic('Juda uzun lotincha tekst.');
console.log(cyrillicText); // -> 'Жуда узун лотинча текст.'
```

### Istisno so‘zlar

Transliterator obyektini istisno so‘zlar ro‘yhati bilan initsializatsiya qilishingiz mumkin:

```js
import Transliterator from 'lotin-kirill';

const transliterator = new Transliterator([
  // [lotincha, kirillcha]
  ['oktabr', 'октябрь'],
  ['Google', 'Google'],
]);

const cyrillicWord = transliterator.toCyrillic('oktabr');
console.log(cyrillicWord); // -> 'октябрь' ('октабр' emas)
```

Bir istisno juftligi kirill va lotin transliteratsiyasi uchun yetarli.

```js
// Bu ham ishlaydi
const latinWord = transliterator.toLatin('октябрь');
console.log(latinWord); // -> 'oktabr' (not 'oktyabr')
```

Agar istisno jusfligi bir xil so‘zlardan iborat bo‘lsa, o‘sha so‘z o‘girilmaydi.

```js
const cyrillicWord = transliterator.toCyrillic('Google');
console.log(cyrillicWord); // -> 'Google'
```

Istisnoli so‘zlar qo‘shimcha qo‘shilgan holatida ham to‘g‘ri o‘giriladi.

**Faqat old qo'shimchalar bundan mustasno!** So‘zning old qo‘shimcha qo‘shilgan varianti alohida istisno sifatida qo‘shilishi kerak.

```js
// Bu ham ishlaydi
const latinWord = transliterator.toLatin('октябрда');
console.log(latinWord); // -> 'oktabrda' ('oktyabrda' emas)
```

Istisno ro‘yhatini initsializatsiyadan keyin ham kengaytirish mumkin.

```js
transliterator.extendExceptionals([['nol', 'ноль']]);
```

Yoki ro‘yhatni butunlay tozalash mumkin.

```js
transliterator.purgeExceptionals();
```

### Asl transliteratsiya funksiyalari

Kutubxonada so‘zlarni transliteratsiyaning faqat fundamental qoidalari asosoida ishlovchi asl transliteratsiya funksiyalari mavjud. Bu funksiyalar berilgan so‘zni istisno ro‘yhati bilan solishtirmaydi.

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
