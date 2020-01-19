const BigFixed = require('../src');

// ================= Show BigFixed structure in binary data ===================
function dump(bigFixed) {
  let bigInt = bigFixed.fixed;

  return [
    BigInt.asUintN(64, bigInt >> BigInt(64)), // integer
    BigInt.asUintN(64, bigInt), // frac
  ].map(bi => bi.toString(2).padStart(64, '0')).join('|');
}

console.log(dump(BigFixed(1)));
// 0000000000000000000000000000000000000000000000000000000000000001|0000000000000000000000000000000000000000000000000000000000000000

console.log(dump(BigFixed(0.125)));
// 0000000000000000000000000000000000000000000000000000000000000000|0010000000000000000000000000000000000000000000000000000000000000

console.log(dump(BigFixed(-1)));
// 1111111111111111111111111111111111111111111111111111111111111111|0000000000000000000000000000000000000000000000000000000000000000

console.log(dump(BigFixed(-0.125)));
// 1111111111111111111111111111111111111111111111111111111111111111|1110000000000000000000000000000000000000000000000000000000000000

console.log(dump(BigFixed(3.14)));
// 0000000000000000000000000000000000000000000000000000000000000011|0010001111010111000010100011110101110000101000111110000000000000

// ============================================================================
console.log(Object.getOwnPropertyNames(BigFixed.prototype));
/*
[
  'constructor', 'clone',     'isZero',
  'isNegative',  'isInteger', 'eq',
  'lt',          'lte',       'gt',
  'gte',         'neg',       'abs',
  'add',         'sub',       'mul',
  'div',         'mod',       'pow',
  'not',         'and',       'or',
  'xor',         'lShift',    'rShift',
  'toInteger',   'toNumber',  'toJSON',
  'toString'
]
 */

// ============================================================================
console.log(BigFixed(-3.14));
// BigFixed { fixed: -57922776391447994368n }

console.log(new BigFixed(-3.14));
// BigFixed { fixed: -57922776391447994368n }

console.log(BigFixed(-3.14).toString());
// -3.14000000000000012

console.log(BigFixed(-3.14).toNumber());
// -3.14

console.log(BigFixed(-3.14).toString(2));
// -11.001000111101011100001010001111010111000010100011111

console.log(BigFixed(-3.14).toString(8));
// -3.10753412172702437

console.log(BigFixed(-3.14).toString(16));
// -3.23d70a3d70a3e

console.log(BigFixed(' -3.14 ').toString());
// -3.14

console.log(BigFixed('0b0111').toString());
// 7

console.log(BigFixed('0xff').toString());
// 255

console.log(BigFixed(true).toString());
// 1

console.log(BigFixed(false).toString());
// 0

// ============================= Arithmetic ===================================
console.log(BigFixed(125.25).add(100).toString());
// 225.25
console.log(BigFixed(Number.MAX_SAFE_INTEGER).add(Number.MAX_SAFE_INTEGER).toString());
// 18014398509481982

console.log(BigFixed(125.25).sub(0.125).toString());
// 125.125
console.log(BigFixed(Number.MAX_SAFE_INTEGER).sub(Number.MAX_SAFE_INTEGER).toString());
// 0

console.log(BigFixed(125.25).mul(100).toString());
// 12525
console.log(BigFixed(Number.MAX_SAFE_INTEGER).mul(Number.MAX_SAFE_INTEGER).toString());
// 81129638414606663681390495662081

console.log(BigFixed(125.25).div(8).toString());
// 15.65625
console.log(BigFixed(2).div(3).toString());
// 0.6666666666666666

console.log(BigFixed(8).mod(3).toString());
// 2
console.log(BigFixed(0.8).mod(0.3).toString());
// 0.20000000000000007

console.log(BigFixed(5).pow(2).toString());
// 25
console.log(BigFixed(3.14).pow(100).toString());
// 49313384166056347098523752010452971971940876154701.02980356808155629

// ============================= Logical ===================================
console.log(BigFixed(0x0f).not().toString(16));
// -f.0000000000000001

console.log(BigFixed(0x0f).not().not().toString(16));
// f

console.log(BigFixed(0x0f).and(0xf0).toString(16));
// 0

console.log(BigFixed(0x0f).or(0xf0).toString(16));
// ff

console.log(BigFixed(0x0f).xor(0xf0).toString(16));
// ff

console.log(BigFixed(0x0f).lShift(1).toString(16));
// 1e

console.log(BigFixed(0x0f).rShift(1).toString(16));
// 7.8

// ============================================================================
console.log(BigFixed(3.51).toInteger(BigFixed.CEIL).toString());
// 4
console.log(BigFixed(3.51).toInteger().toString());
// 4
console.log(BigFixed(3.51).toInteger(BigFixed.FLOOR).toString());
// 3

console.log(BigFixed(3.49).toInteger(BigFixed.CEIL).toString());
// 4
console.log(BigFixed(3.49).toInteger().toString());
// 3
console.log(BigFixed(3.49).toInteger(BigFixed.FLOOR).toString());
// 3
