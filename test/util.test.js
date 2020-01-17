const { slice } = require('../src/util');

test('slice', () => {
  const bigInt = (BigInt(0x01234567) << BigInt(32)) | BigInt(0x89abcdef);

  expect(slice(bigInt)).toEqual(bigInt);
  expect(slice(bigInt, 48)).toEqual(BigInt(0xcdef));
  expect(slice(bigInt, 8, 16)).toEqual(BigInt(0x23));
  expect(() => slice(bigInt, 16, 8)).toThrow('Invalid value');
  expect(slice(bigInt, -24)).toEqual(BigInt(0xabcdef));
  expect(slice(bigInt, -24, -8)).toEqual(BigInt(0xabcd));
  expect(() => slice(bigInt, -8, -16)).toThrow('Invalid value');
});
