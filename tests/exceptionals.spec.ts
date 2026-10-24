import { createTransliterator } from '../src';
import { APOSTROPHE, TURNED_COMMA } from '../src/uzbek';
import { type LatinCyrillicPair, latin1995Cyrillic } from './helpers';

const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();

describe('Extending exceptions', () => {
  test('random words', () => {
    const exceptionals: LatinCyrillicPair[] = [
      ['\\//*^/', '\\///'],
      ['ad\\//as*^/dh', 'mf\\/u?^/pw'],
      ['asdf', 'сдсдфг'],
      ['ffff', 'дд'],
      ['rhrh', 'tvtvt'],
      ['number', 'miff'],
    ];
    const t = latin1995Cyrillic(exceptionals);

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
    expect(() =>
      createTransliterator({ exceptions: [{ latin1995: '', cyrillic: 'a' }] }),
    ).toThrowError(
      new Error('Invalid exceptional word {"latin1995":"","cyrillic":"a"}'),
    );
  });
});

describe('Exceptions', () => {
  test('URLs', () => {
    const t = latin1995Cyrillic();

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
    const t = latin1995Cyrillic([['vaksina', 'вакцина']]);

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
    const t = latin1995Cyrillic([
      ['oktabr', 'октябрь'],
      ['dekabr', 'декабрь'],
      ['asdefgu', 'декьабрь'],
    ]);

    expect(t.toCyrillic('oktabr')).toBe('октябрь');
    expect(t.toCyrillic('oktabrda')).toBe('октябрда');
    expect(t.toCyrillic('Oktabrda')).toBe('Октябрда');
    expect(t.toCyrillic('OKTABRDAGI')).toBe('ОКТЯБРДАГИ');
    expect(t.toCyrillic('dekabr')).toBe('декабрь');
    expect(t.toCyrillic('dekabrda')).toBe('декабрда');
    expect(t.toCyrillic('asdefgu')).toBe('декьабрь');
    expect(t.toCyrillic('(asdefgu)')).toBe('(декьабрь)');
    expect(t.toCyrillic('asdefgularingning')).toBe('декьабрларингнинг');

    expect(t.toLatin('октябрь')).toBe('oktabr');
    expect(t.toLatin('октябрда')).toBe('oktabrda');
    expect(t.toLatin('Октябрда')).toBe('Oktabrda');
    expect(t.toLatin('ОКТЯБРДАГИ')).toBe('OKTABRDAGI');
    expect(t.toLatin('октябрда')).toBe('oktabrda');
    expect(t.toLatin('декабрь')).toBe('dekabr');
    expect(t.toLatin('декабрда')).toBe('dekabrda');
    expect(t.toLatin('декьабрь')).toBe('asdefgu');
    expect(t.toLatin('(декьабрь)')).toBe('(asdefgu)');
    expect(t.toLatin('декьабрларингнинг')).toBe('asdefgularingning');
  });

  test.each`
    cyrillic | latin
    ${'СҲ'}  | ${'SʼH'}
    ${'Сҳ'}  | ${'Sʼh'}
    ${'сҲ'}  | ${'sʼH'}
    ${'сҳ'}  | ${'sʼh'}
  `('$cyrillic => $latin', ({ latin, cyrillic }) => {
    const t = latin1995Cyrillic();

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
    const t = latin1995Cyrillic();

    expect(t.toCyrillic(latin)).toBe(cyrillic);
  });

  test('Detect turned comma + apostrope exception', () => {
    const t = latin1995Cyrillic([["lo'bat", 'лўъбат']]);

    expect(t.toCyrillic('loʻbat')).toBe('лўъбат');
    expect(t.toLatin('лўъбат')).toBe(`lo${TURNED_COMMA}bat`);
    expect(t.toCyrillic("lo'bat")).toBe('лўъбат');
  });

  test('Apostroped exceptional', () => {
    const t = latin1995Cyrillic([
      ["la'bas", 'лaъбaц'], // not a real word
      ["g'aderb", 'ғадэрб'], // not a real word
      ["a'metssa", 'аъмецца'], // not a real word
    ]);

    expect(t.toCyrillic("g'aderb")).toBe('ғадэрб');
    expect(t.toCyrillic("la'bas")).toBe('лaъбaц');
    expect(t.toCyrillic("a'metssa")).toBe('аъмецца');
    expect(t.toLatin('ғадэрб')).toBe(`g${TURNED_COMMA}aderb`);
    expect(t.toLatin('лaъбaц')).toBe(`la${APOSTROPHE}bas`);
    expect(t.toLatin('аъмецца')).toBe(`a${APOSTROPHE}metssa`);
  });
});
