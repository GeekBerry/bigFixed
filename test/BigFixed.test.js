const BigFixed = require('../src');

describe('constructor', () => {
  test('empty', () => {
    expect(() => BigFixed()).toThrow('unexpected type undefined');
    expect(() => BigFixed(null)).toThrow('unexpected type null');
    expect(() => BigFixed([])).toThrow('unexpected ""');
    expect(() => BigFixed({})).toThrow('unexpected "[object Object]"');
  });

  test('number', () => {
    expect(BigFixed(0).toNumber()).toEqual(0);
    expect(BigFixed(1).toNumber()).toEqual(1);

    expect(BigFixed(2 / 3).toNumber()).toEqual(2 / 3);

    expect(BigFixed(-3.14).toNumber()).toEqual(-3.14);
    expect(BigFixed(3.14).toNumber()).toEqual(3.14);

    expect(BigFixed(Number.MAX_SAFE_INTEGER).toNumber()).toEqual(Number.MAX_SAFE_INTEGER);
    expect(BigFixed(Number.MIN_SAFE_INTEGER).toNumber()).toEqual(Number.MIN_SAFE_INTEGER);

    expect(() => BigFixed(Infinity)).toThrow('unexpected "Infinity"');
    expect(() => BigFixed(NaN)).toThrow('unexpected "NaN"');
  });

  test('boolean', () => {
    expect(BigFixed(true)).toEqual(BigFixed(1));
    expect(BigFixed(false)).toEqual(BigFixed(0));
  });

  test('BigInt', () => {
    expect(BigFixed(BigInt(-100))).toEqual(BigFixed(-100));
    expect(BigFixed(BigInt(0))).toEqual(BigFixed(0));
    expect(BigFixed(BigInt(1))).toEqual(BigFixed(1));
    expect(BigFixed(BigInt(1024))).toEqual(BigFixed(1024));
  });

  test('BigFixed', () => {
    expect(BigFixed(100)).toEqual(BigFixed(100));
    expect(new BigFixed(100)).toEqual(BigFixed(100));
    expect(BigFixed(BigFixed(100))).toEqual(BigFixed(100));
  });

  test('string', () => {
    expect(() => BigFixed('')).toThrow('unexpected ""');

    expect(BigFixed('0b1101')).toEqual(BigFixed(0b1101));
    expect(() => BigFixed('-0b1101')).toThrow('unexpected "-0b1101"');
    expect(() => BigFixed('0b1102')).toThrow('unexpected "0b1102"');

    expect(BigFixed('0o1101')).toEqual(BigFixed(0o1101));
    expect(() => BigFixed('-0o1101')).toThrow('unexpected "-0o1101"');
    expect(() => BigFixed('0o1109')).toThrow('unexpected "0o1109"');

    expect(BigFixed('0X1101')).toEqual(BigFixed(0x1101));
    expect(BigFixed('0X1A0f')).toEqual(BigFixed(0x1a0f));
    expect(() => BigFixed('-0X1A0f')).toThrow('unexpected "-0X1A0f"');
    expect(() => BigFixed('0X1Y0f')).toThrow('unexpected "0X1Y0f"');

    expect(BigFixed('0')).toEqual(BigFixed(0));
    expect(BigFixed('-0')).toEqual(BigFixed(0));
    expect(BigFixed('+0')).toEqual(BigFixed(0));
    expect(BigFixed('0 ')).toEqual(BigFixed(0));
    expect(BigFixed(' 0')).toEqual(BigFixed(0));
    expect(BigFixed('\t 0 \n')).toEqual(BigFixed(0));

    expect(BigFixed(' 1024 ')).toEqual(BigFixed(1024));
    expect(BigFixed('128.125')).toEqual(BigFixed(128.125)); // 除净
    expect(BigFixed('-1.5')).toEqual(BigFixed(-1.5));
    expect(BigFixed('.5')).toEqual(BigFixed(0.5));
    expect(() => BigFixed('-.5')).toThrow('Cannot convert');

    expect(BigFixed('3.14')).not.toEqual(BigFixed(3.14)); // 除不净
    expect(BigFixed('3.14').toNumber()).toEqual(3.14); // 近似相等

    // not accept scientific notation now
    expect(() => BigFixed('1e6')).toThrow('unexpected "1e6"');
    expect(() => BigFixed('-1.1e-6')).toThrow('unexpected "-1.1e-6"');

    expect(BigFixed(['123'])).toEqual(BigFixed(123)); // ['123'].toString() === '123' => BigFixed(123)
    expect(() => BigFixed(['123', '456'])).toThrow('unexpected "123,456"');
  });
});

describe('check', () => {
  test('isZero', () => {
    expect(BigFixed(0).isZero()).toEqual(true);
    expect(BigFixed(-0).isZero()).toEqual(true);
  });

  test('isNegative', () => {
    expect(BigFixed(1).isNegative()).toEqual(false);
    expect(BigFixed(0).isNegative()).toEqual(false);
    expect(BigFixed(-0).isNegative()).toEqual(false);
    expect(BigFixed(-1).isNegative()).toEqual(true);
  });

  test('isInteger', () => {
    expect(BigFixed(1.1).isInteger()).toEqual(false);
    expect(BigFixed(1.0).isInteger()).toEqual(true);
    expect(BigFixed(0.0).isInteger()).toEqual(true);
    expect(BigFixed(-1.0).isInteger()).toEqual(true);
    expect(BigFixed(-1.1).isInteger()).toEqual(false);
  });

  test('lt', () => {
    expect(BigFixed(-1).lt(0)).toEqual(true);
    expect(BigFixed(0).lt(0)).toEqual(false);
    expect(BigFixed(1).lt(0)).toEqual(false);
  });

  test('lte', () => {
    expect(BigFixed(-1).lte(0)).toEqual(true);
    expect(BigFixed(0).lte(0)).toEqual(true);
    expect(BigFixed(1).lte(0)).toEqual(false);
  });

  test('eq', () => {
    expect(BigFixed(-1).eq(0)).toEqual(false);
    expect(BigFixed(0).eq(0)).toEqual(true);
    expect(BigFixed(1).eq(0)).toEqual(false);
  });

  test('gte', () => {
    expect(BigFixed(-1).gte(0)).toEqual(false);
    expect(BigFixed(0).gte(0)).toEqual(true);
    expect(BigFixed(1).gte(0)).toEqual(true);
  });

  test('gt', () => {
    expect(BigFixed(-1).gt(0)).toEqual(false);
    expect(BigFixed(0).gt(0)).toEqual(false);
    expect(BigFixed(1).gt(0)).toEqual(true);
  });
});

describe('arithmetic operate', () => {
  test('not', () => {
    const number = Math.random();
    expect(BigFixed(number).neg().toNumber()).toEqual(-number);

    expect(BigFixed(0).neg()).toEqual(BigFixed(0));
    expect(BigFixed(1).neg()).toEqual(BigFixed(-1));
    expect(BigFixed(-1).neg()).toEqual(BigFixed(1));
    expect(BigFixed(1.25).neg()).toEqual(BigFixed(-1.25));
    expect(BigFixed(-1.25).neg()).toEqual(BigFixed(1.25));
  });

  test('abs', () => {
    const number = Math.random();
    expect(BigFixed(-number).abs().toNumber()).toEqual(number);

    expect(BigFixed(0).abs()).toEqual(BigFixed(0));
    expect(BigFixed(1).abs()).toEqual(BigFixed(1));
    expect(BigFixed(-1).abs()).toEqual(BigFixed(1));
    expect(BigFixed(1.25).abs()).toEqual(BigFixed(1.25));
    expect(BigFixed(-1.25).neg()).toEqual(BigFixed(1.25));
  });

  test('add', () => {
    const number = Math.random();
    expect(BigFixed(-number).add(number)).toEqual(BigFixed(0));

    expect(BigFixed(0.1).add(0.2).toString()).toEqual('0.3');
  });

  test('sub', () => {
    const number = Math.random();
    expect(BigFixed(number).sub(number)).toEqual(BigFixed(0));
  });

  test('mul', () => {
    expect(BigFixed(2).mul(3).toString()).toEqual('6');
    expect(BigFixed(-0.2).mul(3).toString()).toEqual('-0.6');
    expect(BigFixed(2).mul(-30).toString()).toEqual('-60');
    expect(BigFixed(-20).mul(-30).toString()).toEqual('600');
  });

  test('div', () => {
    expect(() => BigFixed(0).div(0)).toThrow('Division by zero');

    expect(BigFixed(2).div(3).toString()).toEqual('0.6666666666666666');
    expect(BigFixed(-20).div(3).toString()).toEqual('-6.6666666666666666');
    expect(BigFixed(2).div(-30).toString()).toEqual('-0.06666666666666667');
    expect(BigFixed(-0.2).div(-30).toString()).toEqual('0.006666666666666666');
  });

  test('mod', () => {
    expect(() => BigFixed(8).mod(0)).toThrow('Division by zero');

    expect(BigFixed(8).mod(1).toString()).toEqual('0');
    expect(BigFixed(8).mod(3).toString()).toEqual('2');
    expect(BigFixed(8).mod(-3).toString()).toEqual('2');
    expect(BigFixed(-8).mod(3).toString()).toEqual('-2');
    expect(BigFixed(-8).mod(-3).toString()).toEqual('-2');

    expect(BigFixed(0.8).mod(0.3).toString()).toEqual('0.20000000000000007'); //  8.0 = 0.3 * 2 + 0.2
  });

  test('pow', () => {
    expect(() => BigFixed(8).pow(0.5)).toThrow('it is not an integer');
    expect(() => BigFixed(8).pow(-2)).toThrow('must be positive');

    expect(BigFixed(8).pow(2).toString()).toEqual('64');
    expect(BigFixed(-8).pow(3).toString()).toEqual('-512');
    expect(BigFixed(-0.5).pow(2).toString()).toEqual('0.25');
  });
});

describe('logical operate', () => {
  test('not', () => {
    const number = Math.random();

    expect(BigFixed(number).not().not().toNumber()).toEqual(number);
  });

  test('and', () => {
    expect(BigFixed(0b00001111).and(0b00001111)).toEqual(BigFixed(0b00001111));
    expect(BigFixed(0b11111111).and(0b00001111)).toEqual(BigFixed(0b00001111));
    expect(BigFixed(0b11111111).and(0b11110000)).toEqual(BigFixed(0b11110000));
    expect(BigFixed(0b11110000).and(0b00001111)).toEqual(BigFixed(0b00000000));
  });

  test('or', () => {
    expect(BigFixed(0b00001111).or(0b00001111)).toEqual(BigFixed(0b00001111));
    expect(BigFixed(0b11111111).or(0b00001111)).toEqual(BigFixed(0b11111111));
    expect(BigFixed(0b11111111).or(0b11110000)).toEqual(BigFixed(0b11111111));
    expect(BigFixed(0b11110000).or(0b00001111)).toEqual(BigFixed(0b11111111));
  });

  test('xor', () => {
    expect(BigFixed(0b00001111).xor(0b00001111)).toEqual(BigFixed(0b00000000));
    expect(BigFixed(0b11111111).xor(0b00001111)).toEqual(BigFixed(0b11110000));
    expect(BigFixed(0b00000000).xor(0b11110000)).toEqual(BigFixed(0b11110000));
    expect(BigFixed(0b11110000).xor(0b00001111)).toEqual(BigFixed(0b11111111));
  });

  test('lShift', () => {
    expect(BigFixed(0b00001111).lShift(2)).toEqual(BigFixed(0b00111100));
    expect(BigFixed(0b00001111).lShift(1)).toEqual(BigFixed(0b00011110));
    expect(BigFixed(0b00001111).lShift(0)).toEqual(BigFixed(0b00001111));

    expect(BigFixed(0b00001111).lShift(-1)).not.toEqual(BigFixed(0b00000111)); // shift include frac part

    expect(BigFixed(-7).lShift(-1)).toEqual(BigFixed(-7 / 2));
    expect(BigFixed(-7).lShift(-2)).toEqual(BigFixed(-7 / 4));
  });

  test('rShift', () => {
    expect(BigFixed(-7).rShift(2)).toEqual(BigFixed(-7 / 4));
    expect(BigFixed(-7).rShift(1)).toEqual(BigFixed(-7 / 2));

    expect(BigFixed(0b11110000).rShift(2)).toEqual(BigFixed(0b00111100));
    expect(BigFixed(0b11110000).rShift(1)).toEqual(BigFixed(0b01111000));
    expect(BigFixed(0b11110000).rShift(0)).toEqual(BigFixed(0b11110000));
    expect(BigFixed(0b11110000).rShift(-1)).toEqual(BigFixed(0b111100000));
  });
});

describe('toInteger', () => {
  test('round', () => {
    expect(BigFixed(0).toInteger()).toEqual(BigFixed(0));

    expect(BigFixed(-3.51).toInteger()).toEqual(BigFixed(-4));
    expect(BigFixed(-3.5).toInteger()).toEqual(BigFixed(-3));
    expect(BigFixed(-3.4).toInteger()).toEqual(BigFixed(-3));
    expect(BigFixed(3.4).toInteger()).toEqual(BigFixed(3));
    expect(BigFixed(3.5).toInteger()).toEqual(BigFixed(4));
    expect(BigFixed(3.51).toInteger()).toEqual(BigFixed(4));
  });

  test('ceil', () => {
    expect(BigFixed(0).toInteger(BigFixed.CEIL)).toEqual(BigFixed(0));

    expect(BigFixed(-3.51).toInteger(BigFixed.CEIL)).toEqual(BigFixed(-3));
    expect(BigFixed(-3.5).toInteger(BigFixed.CEIL)).toEqual(BigFixed(-3));
    expect(BigFixed(-3.4).toInteger(BigFixed.CEIL)).toEqual(BigFixed(-3));
    expect(BigFixed(3.4).toInteger(BigFixed.CEIL)).toEqual(BigFixed(4));
    expect(BigFixed(3.5).toInteger(BigFixed.CEIL)).toEqual(BigFixed(4));
    expect(BigFixed(3.51).toInteger(BigFixed.CEIL)).toEqual(BigFixed(4));
  });

  test('floor', () => {
    expect(BigFixed(0).toInteger(BigFixed.FLOOR)).toEqual(BigFixed(0));

    expect(BigFixed(-3.51).toInteger(BigFixed.FLOOR)).toEqual(BigFixed(-4));
    expect(BigFixed(-3.5).toInteger(BigFixed.FLOOR)).toEqual(BigFixed(-4));
    expect(BigFixed(-3.4).toInteger(BigFixed.FLOOR)).toEqual(BigFixed(-4));
    expect(BigFixed(3.4).toInteger(BigFixed.FLOOR)).toEqual(BigFixed(3));
    expect(BigFixed(3.5).toInteger(BigFixed.FLOOR)).toEqual(BigFixed(3));
    expect(BigFixed(3.51).toInteger(BigFixed.FLOOR)).toEqual(BigFixed(3));
  });

  test('summary', () => {
    expect(BigFixed(3.5).toInteger('ceil')).toEqual(BigFixed(4));
    expect(BigFixed(3.5).toInteger('round')).toEqual(BigFixed(4));
    expect(BigFixed(3.5).toInteger('floor')).toEqual(BigFixed(3));
    expect(() => BigFixed(3.5).toInteger('xxx')).toThrow('unexpected round mode "xxx"');
  });
});

test('toJSON', () => {
  expect(JSON.stringify(BigFixed(7.125))).toEqual('"7.125"');
});
