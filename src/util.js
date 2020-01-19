const BIG_INT_0 = BigInt(0);
const BIG_INT_64 = BigInt(64);

const UINT64_SIGN = BigInt(1) << BigInt(63);
const UINT64_TWOS = BigInt(1) << BigInt(64);
const UINT64_TWOS_NUMBER = Number(UINT64_TWOS);

const FLOAT64_FRAC_TOWS = BigInt(1) << BigInt(52);
const FLOAT64_EXP_OFFSET = BigInt(1023); // (2**11/2 - 1)
const FLOAT64_FRAC_OFFSET = BigInt(64) - BigInt(52) - FLOAT64_EXP_OFFSET;

const VIEW64 = new DataView(new ArrayBuffer(8)); // 8=64/8

// ----------------------------------------------------------------------------
function float64ToUInt64(number) {
  VIEW64.setFloat64(0, number);
  return VIEW64.getBigUint64(0);
}

function abs(bigInt) {
  return bigInt < BIG_INT_0 ? -bigInt : bigInt;
}

function slice(uInt64, startBit = 0, stopBit = 64) {
  startBit = startBit >= 0 ? startBit : 64 + startBit;
  stopBit = stopBit >= 0 ? stopBit : 64 + stopBit;
  return BigInt.asUintN(stopBit - startBit, uInt64 >> BigInt(64 - stopBit));
}

// ----------------------------------------------------------------------------
function compileBigInt(bigInt) {
  return bigInt << BIG_INT_64;
}

function compileBoolean(boolean) {
  return boolean ? UINT64_TWOS : BIG_INT_0;
}

/**
 * Compile IEEE 754 float64 to fixed64 BigInt.
 *
 * [IEEE 754](https://en.wikipedia.org/wiki/IEEE_754)
 *
 * float64: S EEEEEEEEEEE DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
 *          1     11                              52
 *
 * @param number {number}
 * @return {BigInt}
 */
function compileNumber(number) {
  const uInt64 = float64ToUInt64(number);

  const sign = (uInt64 & UINT64_SIGN) ? 1 : 0;
  const exp = slice(uInt64, 1, 12);
  let fraction = slice(uInt64, 12, 64);

  if (exp) {
    fraction |= FLOAT64_FRAC_TOWS;
  }

  return (sign ? -fraction : fraction) << (exp + FLOAT64_FRAC_OFFSET);
}

/**
 * Compile string to fixed64 BigInt
 * @param string {string}
 * @return {BigInt}
 */
function compileString(string) {
  // integer:  HEX | OCT | BIN | DEC
  if (/^\s*(0x[0-9a-f]+|0o[0-7]+|0b[01]+|[+-]?[0-9]+)\s*$/i.test(string)) {
    return BigInt(string) << BIG_INT_64;
  }

  // float
  if (/^\s*[+-]?[0-9]*\.[0-9]+\s*$/i.test(string)) {
    const [intString, fracString] = string.split('.');

    const int = BigInt(intString);
    const frac = compileNumber(Number(`0.${fracString}`));
    const fixed = (abs(int) << BIG_INT_64) | frac;

    return int < BIG_INT_0 ? -fixed : fixed;
  }

  throw new Error(`unexpected "${string}"`);
}

// ============================================================================
module.exports = {
  BIG_INT_0,
  BIG_INT_64,
  UINT64_SIGN,
  UINT64_TWOS,
  UINT64_TWOS_NUMBER,

  abs,
  slice,
  compileBoolean,
  compileBigInt,
  compileNumber,
  compileString,
};
