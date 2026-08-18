function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function simplify(num, den) {
  const sign = den < 0 ? -1 : 1;
  num *= sign;
  den *= sign;
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

function isSimplified(num, den) {
  return gcd(num, den) === 1;
}

function fractionsEqual(a, b) {
  return a.num * b.den === b.num * a.den;
}

function compareFractions(a, b) {
  const left = a.num * b.den;
  const right = b.num * a.den;
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function add(a, b) {
  return simplify(a.num * b.den + b.num * a.den, a.den * b.den);
}

function subtract(a, b) {
  return simplify(a.num * b.den - b.num * a.den, a.den * b.den);
}

function multiply(a, b) {
  return simplify(a.num * b.num, a.den * b.den);
}

function divide(a, b) {
  return simplify(a.num * b.den, a.den * b.num);
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function toMixed({ num, den }) {
  const whole = Math.trunc(num / den);
  const remainder = Math.abs(num - whole * den);
  return { whole, num: remainder, den };
}

function toImproper({ whole, num, den }) {
  const sign = whole < 0 ? -1 : 1;
  return { num: whole * den + sign * num, den };
}

function fractionLabel({ num, den }) {
  return `${num}/${den}`;
}
