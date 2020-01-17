/*
 [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754)

 float64: S EEEEEEEEEEE DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
          1     11                              52
 */

const FLOAT64_EXP_OFFSET = BigInt(1023); // (2**11/2 - 1)
const UINT64_SIGN = BigInt(1) << BigInt(63);

const VIEW64 = new DataView(new ArrayBuffer(8)); // 8=64/8

function float64ToUInt64(number) {
  VIEW64.setFloat64(0, number);
  return VIEW64.getBigUint64(0);
}

function uInt64ToFloat64(bUInt64) {
  VIEW64.setBigUint64(0, bUInt64);
  return VIEW64.getFloat64(0);
}

// ----------------------------------------------------------------------------
function slice(uInt64, startBit = 0, stopBit = 64) {
  startBit = startBit >= 0 ? startBit : 64 + startBit;
  stopBit = stopBit >= 0 ? stopBit : 64 + stopBit;
  return BigInt.asUintN(stopBit - startBit, uInt64 >> BigInt(64 - stopBit));
}

function abs(bigInt) {
  return bigInt < BigInt(0) ? -bigInt : bigInt;
}

// ============================================================================
/**
 * Get BigFixed fraction part as number (for toString).
 *
 * @param bUInt64 {BigInt}
 * @return {number}
 */
function fractionNumber(bUInt64) {
  let exp = FLOAT64_EXP_OFFSET;

  if (bUInt64) {
    while (!(bUInt64 & UINT64_SIGN)) {
      bUInt64 <<= BigInt(1);
      exp -= BigInt(1);
    }
    bUInt64 <<= BigInt(1);
    exp -= BigInt(1);
  } else {
    exp = BigInt(0);
  }

  const fraction = slice(bUInt64, 0, 52);
  return uInt64ToFloat64(exp << BigInt(52) | fraction);
}

// ----------------------------------------------------------------------------
function compileBigInt(bigInt) {
  return bigInt << BigInt(64);
}

function compileBoolean(boolean) {
  return boolean ? BigInt(1) << BigInt(64) : BigInt(0);
}

/**
 * Compile IEEE 754 float64 to fixed64 BigInt
 * @param number {number}
 * @return {BigInt}
 */
function compileNumber(number) {
  const uInt64 = float64ToUInt64(number);

  const sign = (uInt64 & UINT64_SIGN) ? 1 : 0;
  const exp = slice(uInt64, 1, 12);
  let fraction = slice(uInt64, 12, 64);

  if (exp) {
    fraction |= BigInt(1) << BigInt(52);
  }

  return (sign ? -fraction : fraction) << (exp - FLOAT64_EXP_OFFSET + BigInt(12));
}

/**
 * Compile string to fixed64 BigInt
 * @param string {string}
 * @return {BigInt}
 */
function compileString(string) {
  // integer:  HEX | OCT | BIN | DEC
  if (/^\s*(0x[0-9a-f]+|0o[0-7]+|0b[01]+|[+-]?[0-9]+)\s*$/i.test(string)) {
    return BigInt(string) << BigInt(64);
  }

  // float
  if (/^\s*[+-]?[0-9]*\.[0-9]+\s*$/i.test(string)) {
    const [intString, fracString] = string.split('.');

    const int = BigInt(intString);
    const frac = compileNumber(Number(`0.${fracString}`));
    const fixed = abs(int) << BigInt(64) | frac;

    return int < BigInt(0) ? -fixed : fixed;
  }

  throw new Error(`unexpected "${string}"`);
}

// ============================================================================
module.exports = {
  abs,
  slice,
  fractionNumber,
  compileBoolean,
  compileBigInt,
  compileNumber,
  compileString,
};
