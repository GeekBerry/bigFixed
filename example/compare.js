const BigNumber = require('bignumber.js');
const Big = require('big.js');
const Decimal = require('decimal.js');
const BigFixed = require('../src');

function timeInNanoSecond(func, count) {
  const time = Date.now();
  for (let i = 0; i < count; i += 1) {
    func();
  }
  const ms = Date.now() - time;
  return (ms * 1e6) / count;
}

// ===================================================================
const count = 1e5;
const number = Math.random() * 10000;

const bigFixed = BigFixed(number);
const bigFixedTest = {
  new: () => new BigFixed(3.14),
  add: () => bigFixed.add(bigFixed),
  sub: () => bigFixed.sub(bigFixed),
  mul: () => bigFixed.mul(bigFixed),
  div: () => bigFixed.div(Math.PI),
  pow: () => bigFixed.pow(3),
  str: () => bigFixed.toString(),
};

const bigNumber = BigNumber(number);
const bigNumberTest = {
  new: () => new BigNumber(3.14),
  add: () => bigNumber.plus(bigNumber),
  sub: () => bigNumber.minus(bigNumber),
  mul: () => bigNumber.times(bigNumber),
  div: () => bigNumber.div(Math.PI),
  pow: () => bigNumber.pow(3),
  str: () => bigNumber.toString(),
};

const big = Big(number);
const bigTest = {
  new: () => new Big(3.14),
  add: () => big.plus(big),
  sub: () => big.minus(big),
  mul: () => big.times(big),
  div: () => big.div(Math.PI),
  pow: () => big.pow(3),
  str: () => big.toString(),
};

const decimal = Decimal(number);
const decimalTest = {
  new: () => new Decimal(3.14),
  add: () => decimal.plus(decimal),
  sub: () => decimal.minus(decimal),
  mul: () => decimal.times(decimal),
  div: () => decimal.div(Math.PI),
  pow: () => decimal.pow(3),
  str: () => decimal.toString(),
};

// ===================================================================
const names = ['new', 'add', 'sub', 'mul', 'div', 'pow', 'str'];

console.log(`Compare of big number lib
test number: ${number}, 
test count: ${count}
`);

console.log('Each duration in nano seconds (1e-9s):');
console.log(['Operate', 'BigFixed', 'BigNumber', 'Big', 'Decimal'].map(v => `${v}`.padEnd(10, ' ')).join(''));
for (const name of names) {
  const line = [name,
    timeInNanoSecond(bigFixedTest[name], count),
    timeInNanoSecond(bigNumberTest[name], count),
    timeInNanoSecond(bigTest[name], count),
    timeInNanoSecond(decimalTest[name], count),
  ];
  console.log(line.map(v => `${v}`.padEnd(10, ' ')).join(''));
}
