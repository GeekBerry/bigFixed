/*
  BigFixed 是基于 BigInt 实现的定点数, 小数部分保留 64 bit,
  即类比于 fixed = float << 64

  BigFixed range: ( -Inf, -(2**(-64)) ] & 0 & [ 2**(-64), +Inf )

  BigFixed struct:
    +--------------------------------+----------------------------------+
    | signed N bits for integer part | signed 64 bits for fraction part |
    +--------------------------------+----------------------------------+
 */

const { BIG_INT_0, BIG_INT_64, UINT64_SIGN, UINT64_TWOS, UINT64_TWOS_NUMBER } = require('./util');
const { abs, slice, compileBigInt, compileBoolean, compileNumber, compileString } = require('./util');

// --------------------------------------------------------------------------
/**
 * @private
 * @param fracNumber {Number}
 * @return {string}
 *
 * @example
 * > _positiveFractionToString(0.1235)
 ".1235"
 * > _positiveFractionToString(1.1e-9)
 ".0000000011"
 * > _positiveFractionToString(1e-18)
 ".000000000000000001"
 */
function _positiveFractionToString(fracNumber) {
  if (fracNumber === 0) {
    return '';
  }

  const string = fracNumber.toString();
  const [matchExp, i, f, e] = string.match(/^(\d)\.?(\d*)e-(\d+)$/) || [];
  if (!matchExp) {
    return string.slice(1); // slice 1 to skip starts '0'
  }
  return '.' + `${i}${f}`.padStart(Number(e) + f.length, '0');
}

/**
 * Cause javascript use float64 to implement `Number`,
 * if value is number, `BigFixed` parse number binary data by **ieee-754**
 *
 * @param value {number|boolean|BigInt|string|BigFixed}
 * @return {BigInt}
 */
function toFixed(value) {
  if (value === undefined || value === null) {
    throw new Error(`unexpected type ${value}`);
  }

  if (value instanceof BigFixed) {
    return value.fixed;
  }

  if (Number.isFinite(value)) {
    return compileNumber(value);
  }

  if (value === false || value === true) {
    return compileBoolean(value);
  }

  if (value.constructor === BigInt) {
    return compileBigInt(value);
  }

  return compileString(`${value}`);
}

// ============================================================================
class BigFixed {
  constructor(value) {
    this.fixed = toFixed(value);
  }

  clone() {
    return new this.constructor(this);
  }

  // --------------------------------------------------------------------------
  isZero() {
    return this.fixed === BIG_INT_0;
  }

  isNegative() {
    return this.fixed < BIG_INT_0;
  }

  isInteger() {
    return slice(this.fixed, -64) === BIG_INT_0;
  }

  eq(value) {
    return this.fixed === toFixed(value);
  }

  lt(value) {
    return this.fixed < toFixed(value);
  }

  lte(value) {
    return this.fixed <= toFixed(value);
  }

  gt(value) {
    return this.fixed > toFixed(value);
  }

  gte(value) {
    return this.fixed >= toFixed(value);
  }

  // -------------------------------  Arithmetic  -----------------------------
  neg() {
    const bn = this.clone();
    bn.fixed = -bn.fixed;
    return bn;
  }

  abs() {
    const bn = this.clone();
    bn.fixed = abs(bn.fixed);
    return bn;
  }

  add(value) {
    const bn = this.clone();
    bn.fixed += toFixed(value);
    return bn;
  }

  sub(value) {
    const bn = this.clone();
    bn.fixed -= toFixed(value);
    return bn;
  }

  mul(value) {
    const bn = this.clone();
    bn.fixed *= toFixed(value);
    return bn.rShift(BIG_INT_64);
  }

  div(value) {
    const bn = this.lShift(BIG_INT_64);
    bn.fixed /= toFixed(value);
    return bn;
  }

  mod(value) {
    value = toFixed(value);

    const bn = this.clone();
    bn.fixed -= (bn.fixed / value) * value;
    return bn;
  }

  pow(value) {
    value = BigInt(value);

    const bn = this.clone();
    bn.fixed = (bn.fixed ** value) >> (BIG_INT_64 * value - BIG_INT_64);
    return bn;
  }

  // --------------------------------  Logical  -------------------------------
  not() {
    const bn = this.clone();
    bn.fixed = ~bn.fixed;
    return bn;
  }

  and(value) {
    const bn = this.clone();
    bn.fixed &= toFixed(value);
    return bn;
  }

  or(value) {
    const bn = this.clone();
    bn.fixed |= toFixed(value);
    return bn;
  }

  xor(value) {
    const bn = this.clone();
    bn.fixed ^= toFixed(value);
    return bn;
  }

  lShift(count) {
    const bn = this.clone();
    bn.fixed <<= BigInt(count);
    return bn;
  }

  rShift(count) {
    const bn = this.clone();

    if (bn.isNegative()) {
      bn.fixed = -((-bn.fixed) >> BigInt(count));
    } else {
      bn.fixed >>= BigInt(count);
    }

    return bn;
  }

  // --------------------------------------------------------------------------
  /**
   * @param [mode=BigFixed.ROUND] {string} - Round mode, enum [BigFixed.CEIL, BigFixed.ROUND, BigFixed.FLOOR]
   * @return {BigFixed}
   */
  toInteger(mode = BigFixed.ROUND) {
    const bn = this.clone();

    const frac = slice(bn.fixed, -64);
    bn.fixed ^= frac;

    switch (mode) {
      case BigFixed.CEIL:
        if (frac) {
          bn.fixed += UINT64_TWOS;
        }
        break;

      case BigFixed.ROUND:
        if (frac >= UINT64_SIGN) {
          bn.fixed += UINT64_TWOS;
        }
        break;

      case BigFixed.FLOOR:
        break;

      default:
        throw new Error(`unexpected round mode "${mode}"`);
    }

    return bn;
  }

  /**
   * @return {number}
   */
  toNumber() {
    return Number(this.fixed >> BIG_INT_64) + Number(slice(this.fixed, -64)) / UINT64_TWOS_NUMBER;
  }

  toJSON() {
    return this.toString();
  }

  /**
   * @param [radix=10] {number}
   * @return {string}
   */
  toString(radix = 10) {
    const absFixed = abs(this.fixed);

    const signString = this.isNegative() ? '-' : '';
    const bigInt = absFixed >> BIG_INT_64;
    const fracNumber = Number(slice(absFixed, -64)) / UINT64_TWOS_NUMBER;

    if (radix === 10) {
      // trans exponential string to digit string
      return `${signString}${bigInt.toString(radix)}${_positiveFractionToString(fracNumber)}`;
    } else {
      return `${signString}${bigInt.toString(radix)}${fracNumber.toString(radix).slice(1)}`;
    }
  }
}

BigFixed.CEIL = 'ceil';
BigFixed.ROUND = 'round';
BigFixed.FLOOR = 'floor';

module.exports = BigFixed;
