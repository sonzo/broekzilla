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

function conversionExplainSteps(sourceType, targetType, { num, den, decimal, percent }) {
  const decLabel = formatDecimalDanish(decimal);
  if (sourceType === 'fraction' && targetType === 'decimal') {
    return [`Del tælleren med nævneren: ${num} ÷ ${den} = ${decLabel}.`];
  }
  if (sourceType === 'fraction' && targetType === 'percent') {
    return [
      `Del tælleren med nævneren: ${num} ÷ ${den} = ${decLabel}.`,
      `Gang med 100 for at få procent: ${decLabel} · 100 = ${percent}%.`,
    ];
  }
  if (sourceType === 'decimal' && targetType === 'fraction') {
    return [`Decimaltallet ${decLabel} svarer til brøken ${num}/${den}.`];
  }
  if (sourceType === 'decimal' && targetType === 'percent') {
    return [`Gang decimaltallet med 100 for at få procent: ${decLabel} · 100 = ${percent}%.`];
  }
  if (sourceType === 'percent' && targetType === 'decimal') {
    return [`Del procenten med 100 for at få decimaltal: ${percent} ÷ 100 = ${decLabel}.`];
  }
  return [
    `Procent betyder "ud af hundrede": ${percent}% = ${percent}/100, hvilket svarer til brøken ${num}/${den}.`,
  ];
}

function simplifyNoteStep(rawNum, rawDen, result) {
  return rawNum !== result.num || rawDen !== result.den
    ? [`Forkortet giver det ${fractionLabel(result)}.`]
    : [];
}

const GENERATORS = {
  add: () => {
    const a = randomFraction();
    const b = randomFraction();
    const result = add(a, b);
    const rawDen = a.den * b.den;
    const scaledA = a.num * b.den;
    const scaledB = b.num * a.den;
    const rawNum = scaledA + scaledB;
    const explainSteps = [
      `Gør nævnerne ens: ${a.den} · ${b.den} = ${rawDen}.`,
      `${fractionLabel(a)} bliver til ${scaledA}/${rawDen}, og ${fractionLabel(b)} bliver til ${scaledB}/${rawDen}.`,
      `Læg tællerne sammen: ${scaledA} + ${scaledB} = ${rawNum}.`,
      ...simplifyNoteStep(rawNum, rawDen, result),
    ];
    return {
      type: 'add',
      prompt: `${fractionLabel(a)} + ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: result,
      explainSteps,
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, result),
    };
  },
  sub: () => {
    let a = randomFraction();
    let b = randomFraction();
    if (a.num / a.den < b.num / b.den) [a, b] = [b, a];
    const result = subtract(a, b);
    const rawDen = a.den * b.den;
    const scaledA = a.num * b.den;
    const scaledB = b.num * a.den;
    const rawNum = scaledA - scaledB;
    const explainSteps = [
      `Gør nævnerne ens: ${a.den} · ${b.den} = ${rawDen}.`,
      `${fractionLabel(a)} bliver til ${scaledA}/${rawDen}, og ${fractionLabel(b)} bliver til ${scaledB}/${rawDen}.`,
      `Træk tællerne fra hinanden: ${scaledA} − ${scaledB} = ${rawNum}.`,
      ...simplifyNoteStep(rawNum, rawDen, result),
    ];
    return {
      type: 'sub',
      prompt: `${fractionLabel(a)} − ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: result,
      explainSteps,
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, result),
    };
  },
  mul: () => {
    const a = randomFraction({ maxNum: 6, maxDen: 6 });
    const b = randomFraction({ maxNum: 6, maxDen: 6 });
    const result = multiply(a, b);
    const rawNum = a.num * b.num;
    const rawDen = a.den * b.den;
    const explainSteps = [
      `Gang tæller med tæller og nævner med nævner: ${a.num} · ${b.num} = ${rawNum}, og ${a.den} · ${b.den} = ${rawDen}.`,
      ...simplifyNoteStep(rawNum, rawDen, result),
    ];
    return {
      type: 'mul',
      prompt: `${fractionLabel(a)} · ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: result,
      explainSteps,
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, result),
    };
  },
  div: () => {
    const a = randomFraction({ maxNum: 6, maxDen: 6 });
    const b = randomFraction({ maxNum: 6, maxDen: 6 });
    const result = divide(a, b);
    const rawNum = a.num * b.den;
    const rawDen = a.den * b.num;
    const explainSteps = [
      `Gang med den omvendte brøk: ${fractionLabel(a)} · ${b.den}/${b.num} = ${rawNum}/${rawDen}.`,
      ...simplifyNoteStep(rawNum, rawDen, result),
    ];
    return {
      type: 'div',
      prompt: `${fractionLabel(a)} ÷ ${fractionLabel(b)} = ?`,
      answerType: 'fraction',
      correctAnswer: result,
      explainSteps,
      checkAnswer: (userAnswer) => fractionsEqual(userAnswer, result),
    };
  },
  simplify: () => {
    const original = randomReducibleFraction();
    const correct = simplify(original.num, original.den);
    const g = gcd(original.num, original.den);
    const explainSteps = [
      `Find den største fælles divisor for ${original.num} og ${original.den}: det er ${g}.`,
      `Del tæller og nævner med ${g}: ${original.num}/${g} = ${correct.num}, ${original.den}/${g} = ${correct.den}.`,
    ];
    return {
      type: 'simplify',
      prompt: `Forkort brøken ${fractionLabel(original)} mest muligt.`,
      answerType: 'fraction',
      correctAnswer: correct,
      explainSteps,
      checkAnswer: (userAnswer) =>
        userAnswer.num === correct.num && userAnswer.den === correct.den,
    };
  },
  commonDenominator: () => {
    const a = randomFraction({ minDen: 2, maxDen: 6 });
    const b = randomFraction({ minDen: 2, maxDen: 6 });
    const target = lcm(a.den, b.den);
    const factorA = target / a.den;
    const factorB = target / b.den;
    const correctNumA = a.num * factorA;
    const correctNumB = b.num * factorB;
    const explainSteps = [
      `${a.den} og ${b.den} har mindste fælles multiplum ${target}.`,
      `Gang første brøk med ${factorA}/${factorA}: ${a.num} · ${factorA} = ${correctNumA}.`,
      `Gang anden brøk med ${factorB}/${factorB}: ${b.num} · ${factorB} = ${correctNumB}.`,
    ];
    return {
      type: 'commonDenominator',
      prompt: `Omskriv ${fractionLabel(a)} og ${fractionLabel(b)} til fælles nævner ${target}.`,
      answerType: 'commonDenominator',
      correctAnswer: { numA: correctNumA, numB: correctNumB, den: target },
      explainSteps,
      checkAnswer: (userAnswer) =>
        userAnswer.numA === correctNumA && userAnswer.numB === correctNumB,
    };
  },
  compare: () => {
    const a = randomFraction();
    const b = randomFraction();
    const result = compareFractions(a, b);
    const correctSymbol = result < 0 ? '<' : result > 0 ? '>' : '=';
    const rawDen = lcm(a.den, b.den);
    const scaledA = (a.num * rawDen) / a.den;
    const scaledB = (b.num * rawDen) / b.den;
    const explainSteps = [
      `Gør nævnerne ens for at sammenligne: ${fractionLabel(a)} bliver til ${scaledA}/${rawDen}, og ${fractionLabel(b)} bliver til ${scaledB}/${rawDen}.`,
      `${scaledA} ${correctSymbol} ${scaledB}, så ${fractionLabel(a)} ${correctSymbol} ${fractionLabel(b)}.`,
    ];
    return {
      type: 'compare',
      prompt: `Sammenlign: ${fractionLabel(a)} ? ${fractionLabel(b)}`,
      answerType: 'choice',
      choices: ['<', '>', '='],
      correctAnswer: correctSymbol,
      explainSteps,
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
      const explainSteps = [
        `Gang det hele tal med nævneren og læg tælleren til: ${whole} · ${den} + ${num} = ${correct.num}.`,
        `Nævneren er stadig ${den}.`,
      ];
      return {
        type: 'mixedConvert',
        prompt: `Omskriv det blandede tal ${whole} ${num}/${den} til en uægte brøk.`,
        answerType: 'fraction',
        correctAnswer: correct,
        explainSteps,
        checkAnswer: (userAnswer) => fractionsEqual(userAnswer, correct),
      };
    }
    const den = randInt(2, 8);
    const whole = randInt(1, 5);
    const extra = randInt(1, den - 1);
    const improper = { num: whole * den + extra, den };
    const correct = toMixed(improper);
    const explainSteps = [
      `Del tælleren med nævneren: ${improper.num} ÷ ${den} = ${correct.whole} med ${correct.num} i rest.`,
      `Det hele tal bliver ${correct.whole}, og resten ${correct.num} bliver den nye tæller over ${den}.`,
    ];
    return {
      type: 'mixedConvert',
      prompt: `Omskriv den uægte brøk ${fractionLabel(improper)} til et blandet tal.`,
      answerType: 'mixed',
      correctAnswer: correct,
      explainSteps,
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
    const explainSteps = conversionExplainSteps(sourceType, targetType, { num, den, decimal, percent });

    if (targetType === 'fraction') {
      return {
        type: 'conversion',
        prompt,
        answerType: 'fraction',
        correctAnswer: { num, den },
        explainSteps,
        checkAnswer: (userAnswer) => fractionsEqual(userAnswer, { num, den }),
      };
    }
    if (targetType === 'decimal') {
      return {
        type: 'conversion',
        prompt,
        answerType: 'decimal',
        correctAnswer: decimal,
        explainSteps,
        checkAnswer: (userAnswer) => Math.abs(userAnswer - decimal) < 0.005,
      };
    }
    return {
      type: 'conversion',
      prompt,
      answerType: 'percent',
      correctAnswer: percent,
      explainSteps,
      checkAnswer: (userAnswer) => userAnswer === percent,
    };
  },
};

function generateProblem(typeId) {
  return GENERATORS[typeId]();
}
