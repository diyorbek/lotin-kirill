import fs from 'fs';
import Transliterator from '../src';

const cyrillicLongText = fs
  .readFileSync(`${__dirname}/fixtures/cyrillicText.txt`, 'utf-8')
  .toString();

const latinLongText = fs
  .readFileSync(`${__dirname}/fixtures/latinText.txt`, 'utf-8')
  .toString();

const t = new Transliterator([
  ['vaksina', 'вакцина'],
  ['bevaksina', 'бевакцина'],
  ['budjet', 'бюджет'],
  ['sivilizatsiya', 'цивилизация'],
  ['konferensiya', 'конференция'],
  ['yoga', 'йога'],
  ['loʻbat', 'лўъбат'],

  ['iyun', 'июнь'],
  ['iyul', 'июль'],
  ['oktabr', 'октябрь'],
  ['oktyabr', 'октябрь'],
  ['dekabr', 'декабрь'],
  ['dekabr', 'декабрь'],

  ['U+00D3', 'U+00D3'],
]);

describe('General text transliteration', () => {
  test('casing', () => {
    expect(
      t.toCyrillic("AaBio uHkIb'By. AYuYEejln Lposh! ShCHg'O'RD'B, Lm."),
    ).toBe('АаБио уҲкИбЪБй. АЮЕэжлн Лпош! ШЧғЎРДЪБ, Лм.');
  });

  test('text', () => {
    expect(
      t.textToCyrillic(
        ` yoga bevaksina. VAKSINA Vaksina, Yogadan "vaksinator" vaksinatsiya YOGAning`,
      ),
    ).toBe(
      ` йога бевакцина. ВАКЦИНА Вакцина, Йогадан "вакцинатор" вакцинация ЙОГАнинг`,
    );

    expect(
      t.textToCyrillic(
        `O‘zbekistonda emlash jarayoniga 3138ta emlash punktlari, 862ta mobil brigadalar (har birida 1 nafar oilaviy shifokor, 1 nafar vaksinator va 1 nafar muolaja hamshirasi mavjud) jalb etilgan. Vaksina olib kelinishi ko‘paygach, xususiy klinikalarda ham emlash ishlari amalga oshiriladi.`,
      ),
    ).toBe(
      `Ўзбекистонда эмлаш жараёнига 3138та эмлаш пунктлари, 862та мобил бригадалар (ҳар бирида 1 нафар оилавий шифокор, 1 нафар вакцинатор ва 1 нафар муолажа ҳамшираси мавжуд) жалб этилган. Вакцина олиб келиниши кўпайгач, хусусий клиникаларда ҳам эмлаш ишлари амалга оширилади.`,
    );

    expect(
      t.textToCyrillic(
        `"Bu dargoh viloyatdagi 189-masjid bo‘lib, bu yerda namozxonlar uchun barcha qulayliklar hozirlangan. Ushbu masjidda ilk bora o‘qilgan juma namozida bu kabi maskanlar ko‘plab bunyod etilishini niyat qildik", — deydi «Yusufxon o‘g‘li Qosimxon» masjidi imom-xatibi Musoxon Abbasiddinov.`,
      ),
    ).toBe(
      `"Бу даргоҳ вилоятдаги 189-масжид бўлиб, бу ерда намозхонлар учун барча қулайликлар ҳозирланган. Ушбу масжидда илк бора ўқилган жума намозида бу каби масканлар кўплаб бунёд этилишини ният қилдик", — дейди «Юсуфхон ўғли Қосимхон» масжиди имом-хатиби Мусохон Аббасиддинов.`,
    );
  });

  test('roman numbers', () => {
    expect(
      t.textToCyrillic(`
I. Bizdan ii ning v sida
III) keyingi vii da xiv
IV. yuqoriga V asr CXX dan MXV gacha
XX ) oxiri
XX . oxiri
`),
    ).toBe(`
I. Биздан ии нинг в сида
III) кейинги вии да хив
IV. юқорига V аср CXX дан MXV гача
XX ) охири
XX . охири
`);
  });

  test('long text', () => {
    expect(t.textToCyrillic(latinLongText)).toBe(cyrillicLongText);
    expect(t.textToLatin(cyrillicLongText)).toBe(latinLongText);

    expect(t.textToCyrillic(t.textToLatin(cyrillicLongText))).toBe(
      cyrillicLongText,
    );
    expect(t.textToLatin(t.textToCyrillic(latinLongText))).toBe(latinLongText);
  });
});
