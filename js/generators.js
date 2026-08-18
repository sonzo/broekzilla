function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomFraction({ minNum = 1, maxNum = 9, minDen = 2, maxDen = 9 } = {}) {
  const den = randInt(minDen, maxDen);
  const num = randInt(minNum, maxNum);
  return { num, den };
}

function randomReducibleFraction() {
  const factor = randInt(2, 5);
  const base = randomFraction({ minDen: 2, maxDen: 6 });
  return { num: base.num * factor, den: base.den * factor };
}

const ASSIGNMENT_TYPES = [
  { id: 'add', label: 'Plus (læg sammen)' },
  { id: 'sub', label: 'Minus (træk fra)' },
  { id: 'mul', label: 'Gange' },
  { id: 'div', label: 'Dividér' },
  { id: 'simplify', label: 'Forkort brøken' },
  { id: 'commonDenominator', label: 'Find fælles nævner' },
  { id: 'compare', label: 'Sammenlign brøker' },
  { id: 'mixedConvert', label: 'Blandet tal og uægte brøk' },
];

const GENERATORS = {
  add: () => {
    const a = randomFraction();
    const b = randomFraction();
    return {
      type: 'add',
      prompt: `${fractionLabel(a)} + ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: add(a, b),
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, add(a, b)),
    };
  },
  sub: () => {
    let a = randomFraction();
    let b = randomFraction();
    if (a.num / a.den < b.num / b.den) [a, b] = [b, a];
    return {
      type: 'sub',
      prompt: `${fractionLabel(a)} − ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: subtract(a, b),
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, subtract(a, b)),
    };
  },
  mul: () => {
    const a = randomFraction({ maxNum: 6, maxDen: 6 });
    const b = randomFraction({ maxNum: 6, maxDen: 6 });
    return {
      type: 'mul',
      prompt: `${fractionLabel(a)} · ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: multiply(a, b),
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, multiply(a, b)),
    };
  },
  div: () => {
    const a = randomFraction({ maxNum: 6, maxDen: 6 });
    const b = randomFraction({ maxNum: 6, maxDen: 6 });
    return {
      type: 'div',
      prompt: `${fractionLabel(a)} ÷ ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: divide(a, b),
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, divide(a, b)),
    };
  },
  simplify: () => {
    const original = randomReducibleFraction();
    const correct = simplify(original.num, original.den);
    return {
      type: 'simplify',
      prompt: `Forkort brøken ${fractionLabel(original)} mest muligt.`,
      answerType: 'fraction',
      correctAnswer: correct,
      checkAnswer: (userAnswer) =>
        userAnswer.num === correct.num && userAnswer.den === correct.den,
    };
  },
  commonDenominator: () => {
    const a = randomFraction({ minDen: 2, maxDen: 6 });
    const b = randomFraction({ minDen: 2, maxDen: 6 });
    const target = lcm(a.den, b.den);
    const correctNumA = (a.num * target) / a.den;
    const correctNumB = (b.num * target) / b.den;
    return {
      type: 'commonDenominator',
      prompt: `Omskriv ${fractionLabel(a)} og ${fractionLabel(b)} til fælles nævner ${target}.`,
      answerType: 'commonDenominator',
      correctAnswer: { numA: correctNumA, numB: correctNumB, den: target },
      checkAnswer: (userAnswer) =>
        userAnswer.numA === correctNumA && userAnswer.numB === correctNumB,
    };
  },
  compare: () => {
    const a = randomFraction();
    const b = randomFraction();
    const result = compareFractions(a, b);
    const correctSymbol = result < 0 ? '<' : result > 0 ? '>' : '=';
    return {
      type: 'compare',
      prompt: `Sammenlign: ${fractionLabel(a)} ? ${fractionLabel(b)}`,
      answerType: 'choice',
      choices: ['<', '>', '='],
      correctAnswer: correctSymbol,
      checkAnswer: (userAnswer) => userAnswer === correctSymbol,
    };
  },
  mixedConvert: () => {
    const toImproperDirection = Math.random() < 0.5;
    if (toImproperDirection) {
      const whole = randInt(1, 5);
      const den = randInt(2, 8);
      const num = randInt(1, den - 1);
      const mixed = { whole, num, den };
      const correct = toImproper(mixed);
      return {
        type: 'mixedConvert',
        prompt: `Omskriv det blandede tal ${whole} ${num}/${den} til en uægte brøk.`,
        answerType: 'fraction',
        correctAnswer: correct,
        checkAnswer: (userAnswer) => fractionsEqual(userAnswer, correct),
      };
    }
    const den = randInt(2, 8);
    const whole = randInt(1, 5);
    const extra = randInt(1, den - 1);
    const improper = { num: whole * den + extra, den };
    const correct = toMixed(improper);
    return {
      type: 'mixedConvert',
      prompt: `Omskriv den uægte brøk ${fractionLabel(improper)} til et blandet tal.`,
      answerType: 'mixed',
      correctAnswer: correct,
      checkAnswer: (userAnswer) =>
        userAnswer.whole === correct.whole &&
        fractionsEqual(
          { num: userAnswer.num, den: userAnswer.den },
          { num: correct.num, den: correct.den }
        ),
    };
  },
};

function generateProblem(typeId) {
  return GENERATORS[typeId]();
}
