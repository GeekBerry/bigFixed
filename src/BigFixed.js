/*
  BigFixed 是基于 BigInt 实现的定点数, 小数部分保留 64 bit,
  即类比于 fixed = float << 64

  BigFixed range: ( -Inf, -(2**(-64)) ] & 0 & [ 2**(-64), +Inf )

  BigFixed struct:
    +--------------------------------+----------------------------------+
    | signed N bits for integer part | signed 64 bits for fraction part |
    +--------------------------------+----------------------------------+
 */

const {
  abs,
  slice,
  fractionNumber,
  compileBigInt,
  compileBoolean,
  compileNumber,
  compileString,
} = require('./util');

const UINT64_HALF = BigInt(1) << BigInt(63);
const UINT64_TWOS = BigInt(1) << BigInt(64);

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
    return this.fixed === BigInt(0);
  }

  isNegative() {
    return this.fixed < BigInt(0);
  }

  isInteger() {
    return slice(this.fixed, -64) === BigInt(0);
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
    return bn.rShift(64);
  }

  div(value) {
    const bn = this.lShift(64);
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
    bn.fixed = (bn.fixed ** value) >> (BigInt(64) * value - BigInt(64));
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
        if (frac >= UINT64_HALF) {
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
    return Number(this.toString());
  }

  toJSON() {
    return this.toString();
  }

  /**
   * @param [base=10] {number}
   * @return {string}
   */
  toString(base = 10) {
    const absFixed = abs(this.fixed);

    const signString = this.isNegative() ? '-' : '';
    const int = (absFixed >> BigInt(64));
    const fracNumber = fractionNumber(slice(absFixed, -64));

    return `${signString}${int.toString(base)}${fracNumber.toString(base).slice(1)}`; // slice 1 to skip '0'
  }
}

BigFixed.CEIL = 'ceil';
BigFixed.ROUND = 'round';
BigFixed.FLOOR = 'floor';

module.exports = BigFixed;
