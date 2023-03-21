import Transliterator from '../src';
import { APOSTROPHE, TURNED_COMMA } from '../src/characters';
import { ExceptionalPair } from '../src/exceptionalsCollection';
import { capitalize } from '../src/utils';

describe('Extending exceptions', () => {
  test('random words', () => {
    const exceptionals: ExceptionalPair[] = [
      ['\\//*^/', '\\///'],
      ['ad\\//as*^/dh', 'mf\\/u?^/pw'],
      ['asdf', 'сдсдфг'],
      ['ffff', 'дд'],
      ['rhrh', 'tvtvt'],
      ['number', 'miff'],
    ];
    const t = new Transliterator(exceptionals);

    exceptionals.forEach(([latin, cyrillic]) => {
      expect(t.toCyrillic(latin)).toBe(cyrillic);
      expect(t.toCyrillic(latin.toUpperCase())).toBe(cyrillic.toUpperCase());
      expect(t.toCyrillic(capitalize(latin))).toBe(capitalize(cyrillic));
      expect(t.toCyrillic(`${latin}larning`)).toBe(`${cyrillic}ларнинг`);

      expect(t.toLatin(cyrillic)).toBe(latin);
      expect(t.toLatin(cyrillic.toUpperCase())).toBe(latin.toUpperCase());
      expect(t.toLatin(capitalize(cyrillic))).toBe(capitalize(latin));
      expect(t.toLatin(`${cyrillic}ларнинг`)).toBe(`${latin}larning`);
    });
  });

  test('Invalid exceptional', () => {
    expect(() => new Transliterator([['', 'a']])).toThrowError(
      new Error('Invalid exceptional pair ,a'),
    );
  });
});

describe('Exceptions', () => {
  test('URLs', () => {
    const t = new Transliterator();

    [
      `file:///some/file/path/filename.pdf`,
      `mailto:e+_mail.me@sub.domain.com`,
      `http://sub.domain.co.uk:3000/p/a/t/h_(asd)/h?q=abc123#dfdf`,
      `http://www.عربي.com`,
      `http://127.0.0.1:3000/p/a/t_(asd)/h?q=abc123#dfdf`,
      `http://[2a00:1450:4025:401::67]/k/something`,
      `a.org/abc/ი_გგ`,
      `me.de`,
    ].forEach((url) => {
      expect(t.toCyrillic(url)).toBe(url);
      expect(t.toCyrillic(`(${url})`)).toBe(`(${url})`);
      expect(t.toCyrillic(`"${url}"`)).toBe(`"${url}"`);
      expect(t.toCyrillic(`'${url}'`)).toBe(`'${url}'`);
      expect(t.toCyrillic(`\`${url}\``)).toBe(`\`${url}\``);
      expect(t.toCyrillic(`${url}.`)).toBe(`${url}.`);
      expect(t.toCyrillic(`.${url},`)).toBe(`.${url},`);
      expect(t.toCyrillic(`,${url},`)).toBe(`,${url},`);
      expect(t.toCyrillic(`,${url}.`)).toBe(`,${url}.`);

      expect(t.toLatin(url)).toBe(url);
      expect(t.toLatin(`(${url})`)).toBe(`(${url})`);
      expect(t.toLatin(`"${url}"`)).toBe(`"${url}"`);
      expect(t.toLatin(`'${url}'`)).toBe(`'${url}'`);
      expect(t.toLatin(`\`${url}\``)).toBe(`\`${url}\``);
      expect(t.toLatin(`${url}.`)).toBe(`${url}.`);
      expect(t.toLatin(`.${url},`)).toBe(`.${url},`);
      expect(t.toLatin(`,${url},`)).toBe(`,${url},`);
      expect(t.toLatin(`,${url}.`)).toBe(`,${url}.`);
    });
  });

  test('Ц exceptions', () => {
    const t = new Transliterator([['vaksina', 'вакцина']]);

    expect(t.toCyrillic('vaksina')).toBe('вакцина');
    expect(t.toCyrillic('Vaksina')).toBe('Вакцина');
    expect(t.toCyrillic('vAkSinA')).toBe('вакцина');
    expect(t.toCyrillic('VaKsIna')).toBe('Вакцина');
    expect(t.toCyrillic('vAKsinaTORLARining-vaKSInaTORLARining')).toBe(
      'вакцинаТОРЛАРининг-вакцинаТОРЛАРининг',
    );

    expect(t.toLatin('вакцина')).toBe('vaksina');
    expect(t.toLatin('Вакцина')).toBe('Vaksina');
    expect(t.toLatin('вАкЦинА')).toBe('vaksina');
    expect(t.toLatin('ВаКцИна')).toBe('Vaksina');
    expect(t.toLatin('вАКцинаТОРЛАРининг-ваКЦИнаТОРЛАРининг')).toBe(
      'vaksinaTORLARining-vaksinaTORLARining',
    );
  });

  test('Ь-ended exceptions', () => {
    const t = new Transliterator([
      ['oktabr', 'октябрь'],
      ['dekabr', 'декабрь'],
      ['asdefgu', 'декьабрь'],
    ]);

    expect(t.toCyrillic('oktabr')).toBe('октябрь');
    expect(t.toCyrillic('oktabrda')).toBe('октябрда');
    expect(t.toCyrillic('dekabr')).toBe('декабрь');
    expect(t.toCyrillic('dekabrda')).toBe('декабрда');
    expect(t.toCyrillic('asdefgu')).toBe('декьабрь');
    expect(t.toCyrillic('(asdefgu)')).toBe('(декьабрь)');
    expect(t.toCyrillic('asdefgularingning')).toBe('декьабрларингнинг');
  });

  test.each`
    cyrillic | latin
    ${'СҲ'}  | ${'SʼH'}
    ${'Сҳ'}  | ${'Sʼh'}
    ${'сҲ'}  | ${'sʼH'}
    ${'сҳ'}  | ${'sʼh'}
  `('$cyrillic => $latin', ({ latin, cyrillic }) => {
    const t = new Transliterator();

    expect(t.toLatin(cyrillic)).toBe(latin);
  });

  test.each`
    latin    | cyrillic
    ${'SʼH'} | ${'СҲ'}
    ${'Sʼh'} | ${'Сҳ'}
    ${'sʼH'} | ${'сҲ'}
    ${'sʼh'} | ${'сҳ'}
    ${"S'H"} | ${'СҲ'}
    ${"S'h"} | ${'Сҳ'}
    ${"s'H"} | ${'сҲ'}
    ${"s'h"} | ${'сҳ'}
  `('$latin => $cyrillic', ({ latin, cyrillic }) => {
    const t = new Transliterator();

    expect(t.toCyrillic(latin)).toBe(cyrillic);
  });

  test('Detect turned comma + apostrope exception', () => {
    const t = new Transliterator([["lo'bat", 'лўъбат']]);

    expect(t.textToCyrillic('loʻbat')).toBe('лўъбат');
    expect(t.textToLatin('лўъбат')).toBe(`lo${TURNED_COMMA}bat`);
    expect(t.textToCyrillic("lo'bat")).toBe('лўъбат');
  });

  test('Apostroped exceptional', () => {
    const t = new Transliterator([
      ["la'bas", 'лaъбaц'], // not a real word
      ["g'aderb", 'ғадэрб'], // not a real word
      ["a'metssa", 'аъмецца'], // not a real word
    ]);

    expect(t.textToCyrillic("g'aderb")).toBe('ғадэрб');
    expect(t.textToCyrillic("la'bas")).toBe('лaъбaц');
    expect(t.textToCyrillic("a'metssa")).toBe('аъмецца');
    expect(t.textToLatin('ғадэрб')).toBe(`g${TURNED_COMMA}aderb`);
    expect(t.textToLatin('лaъбaц')).toBe(`la${APOSTROPHE}bas`);
    expect(t.textToLatin('аъмецца')).toBe(`a${APOSTROPHE}metssa`);
  });
});
