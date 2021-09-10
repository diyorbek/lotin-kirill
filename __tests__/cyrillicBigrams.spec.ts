import Transliterator from '../src';

const t = new Transliterator();

describe('E cases', () => {
  test.each`
    cyrillic   | latin
    ${'дае'}   | ${'daye'}
    ${'даЕ'}   | ${'daYE'}
    ${'дАе'}   | ${'dAye'}
    ${'дое'}   | ${'doye'}
    ${'дэе'}   | ${'deye'}
    ${'дее'}   | ${'deye'}
    ${'деее'}  | ${'deee'}
    ${'дееее'} | ${'deeee'}
    ${'дие'}   | ${'diye'}
    ${'дуе'}   | ${'duye'}
    ${'ёе'}    | ${'yoye'}
    ${'юе'}    | ${'yuye'}
    ${'яе'}    | ${'yaye'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
    expect(t.toLatin(cyrillic.toUpperCase())).toBe(latin.toUpperCase());
    expect(t.toLatin(cyrillic + cyrillic)).toBe(latin + latin);
    expect(t.toLatin((cyrillic + cyrillic).toUpperCase())).toBe(
      (latin + latin).toUpperCase(),
    );
  });

  test.each`
    cyrillic | latin
    ${'Е'}   | ${'Ye'}
    ${'е'}   | ${'ye'}
    ${'е'}   | ${'ye'}
    ${'ЕД'}  | ${'YED'}
    ${'ДЕ'}  | ${'DE'}
    ${'ДЬЕ'} | ${'DYE'}
    ${'ДЪЕ'} | ${'DYE'}
    ${'Ед'}  | ${'Yed'}
    ${'дьЕ'} | ${'dYE'}
    ${'дъЕ'} | ${'dYE'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Ё cases', () => {
  test.each`
    cyrillic | latin
    ${'Ё'}   | ${'Yo'}
    ${'ё'}   | ${'yo'}
    ${'ЁД'}  | ${'YOD'}
    ${'ДЁ'}  | ${'DYO'}
    ${'Ёд'}  | ${'Yod'}
    ${'дЁ'}  | ${'dYO'}
    ${'ьо'}  | ${'yo'}
    ${'ьО'}  | ${'YO'}
    ${'Ьо'}  | ${'yo'}
    ${'ЬО'}  | ${'YO'}
  `('$cyrillic => $latin', ({ latin, cyrillic }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Ч cases', () => {
  test.each`
    cyrillic | latin
    ${'Ч'}   | ${'Ch'}
    ${'ч'}   | ${'ch'}
    ${'ЧА'}  | ${'CHA'}
    ${'АЧ'}  | ${'ACH'}
    ${'Ча'}  | ${'Cha'}
    ${'аЧ'}  | ${'aCH'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Ш cases', () => {
  test.each`
    cyrillic | latin
    ${'Ш'}   | ${'Sh'}
    ${'ш'}   | ${'sh'}
    ${'ША'}  | ${'SHA'}
    ${'АШ'}  | ${'ASH'}
    ${'Ша'}  | ${'Sha'}
    ${'аШ'}  | ${'aSH'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Ю cases', () => {
  test.each`
    cyrillic | latin
    ${'Ю'}   | ${'Yu'}
    ${'ю'}   | ${'yu'}
    ${'ЮБ'}  | ${'YUB'}
    ${'БЮ'}  | ${'BYU'}
    ${'Юб'}  | ${'Yub'}
    ${'бЮ'}  | ${'bYU'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Я cases', () => {
  test.each`
    cyrillic | latin
    ${'Я'}   | ${'Ya'}
    ${'я'}   | ${'ya'}
    ${'ЯБ'}  | ${'YAB'}
    ${'БЯ'}  | ${'BYA'}
    ${'Яб'}  | ${'Yab'}
    ${'бЯ'}  | ${'bYA'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Ў cases', () => {
  test.each`
    cyrillic | latin
    ${'Ў'}   | ${'O‘'}
    ${'ў'}   | ${'o‘'}
    ${'Ўъ'}  | ${'O‘'}
    ${'ўъ'}  | ${'o‘'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Ғ cases', () => {
  test.each`
    cyrillic | latin
    ${'Ғ'}   | ${'G‘'}
    ${'ғ'}   | ${'g‘'}
    ${'Ғъ'}  | ${'G‘'}
    ${'ғъ'}  | ${'g‘'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});

describe('Ц cases', () => {
  test.each`
    cyrillic   | latin
    ${'ц'}     | ${'s'}
    ${'цц'}    | ${'ss'}
    ${'Ц'}     | ${'S'}
    ${'ЦЦ'}    | ${'SS'}
    ${'пица'}  | ${'pitsa'}
    ${'аца'}   | ${'atsa'}
    ${'aцi'}   | ${'atsi'}
    ${'пицца'} | ${'pitssa'}
    ${'iцц'}   | ${'itss'}
    ${'iцЦ'}   | ${'itsS'}
    ${'aЦц'}   | ${'aTSs'}
    ${'aЦЦ'}   | ${'aTSS'}
  `('$cyrillic => $latin', ({ cyrillic, latin }) => {
    expect(t.toLatin(cyrillic)).toBe(latin);
  });
});
