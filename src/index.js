const Class = require('./BigFixed');

/**
 * Function for both new and call can create instance.
 * use `new Proxy(BigFixed, { apply: (Class, __, args) => new Class(...args) })` is too slow
 *
 * @param args
 * @return {BigFixed}
 * @constructor
 *
 * @example
 * > new BigFixed(1)
 BigFixed { fixed: 18446744073709551616n }
 * > BigFixed(1)
 BigFixed { fixed: 18446744073709551616n }
 */
function BigFixed(...args) {
  return new Class(...args);
}

BigFixed.prototype = Class.prototype;
Object.assign(BigFixed, Class);

module.exports = BigFixed;
