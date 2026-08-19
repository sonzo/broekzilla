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
  { id: 'conversion', label: 'Brøk, decimaltal og procent' },
];

const CONVERSION_DENOMINATORS = [2, 4, 5, 10, 20, 25, 50, 100];
const CONVERSION_FORM_NAMES = { fraction: 'brøk', decimal: 'decimaltal', percent: 'procent' };

function formatDecimalDanish(value) {
  return value
    .toFixed(2)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
    .replace('.', ',');
}

function randomConversionForm(exclude) {
  const forms = ['fraction', 'decimal', 'percent'];
  let form = forms[randInt(0, forms.length - 1)];
  while (form === exclude) form = forms[randInt(0, forms.length - 1)];
  return form;
}

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
  conversion: () => {
    const den = CONVERSION_DENOMINATORS[randInt(0, CONVERSION_DENOMINATORS.length - 1)];
    const num = randInt(1, den - 1);
    const decimal = num / den;
    const percent = Math.round(decimal * 100);

    const sourceType = randomConversionForm();
    const targetType = randomConversionForm(sourceType);

    const sourceDisplay =
      sourceType === 'fraction'
        ? `brøken ${fractionLabel({ num, den })}`
        : sourceType === 'decimal'
          ? `decimaltallet ${formatDecimalDanish(decimal)}`
          : `${percent}%`;

    const prompt = `Omskriv ${sourceDisplay} til ${CONVERSION_FORM_NAMES[targetType]}.`;

    if (targetType === 'fraction') {
      return {
        type: 'conversion',
        prompt,
        answerType: 'fraction',
        correctAnswer: { num, den },
        checkAnswer: (userAnswer) => fractionsEqual(userAnswer, { num, den }),
      };
    }
    if (targetType === 'decimal') {
      return {
        type: 'conversion',
        prompt,
        answerType: 'decimal',
        correctAnswer: decimal,
        checkAnswer: (userAnswer) => Math.abs(userAnswer - decimal) < 0.005,
      };
    }
    return {
      type: 'conversion',
      prompt,
      answerType: 'percent',
      correctAnswer: percent,
      checkAnswer: (userAnswer) => userAnswer === percent,
    };
  },
};

function generateProblem(typeId) {
  return GENERATORS[typeId]();
}
