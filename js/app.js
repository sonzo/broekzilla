const scoreTracker = createScoreTracker();

const optionsScreen = document.getElementById('options-screen');
const assignmentScreen = document.getElementById('assignment-screen');
const typeCheckboxes = document.getElementById('type-checkboxes');
const selectAll = document.getElementById('select-all');
const optionsForm = document.getElementById('options-form');
const optionsError = document.getElementById('options-error');
const problemPrompt = document.getElementById('problem-prompt');
const answerForm = document.getElementById('answer-form');
const answerInputs = document.getElementById('answer-inputs');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const resetOverallBtn = document.getElementById('reset-overall-btn');

let selectedTypes = [];
let currentProblem = null;

function typeLabel(typeId) {
  return ASSIGNMENT_TYPES.find((t) => t.id === typeId)?.label ?? typeId;
}

function renderTypeCheckboxes() {
  typeCheckboxes.innerHTML = '';
  for (const { id, label } of ASSIGNMENT_TYPES) {
    const wrapper = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'types';
    input.value = id;
    input.addEventListener('change', syncSelectAll);
    wrapper.appendChild(input);
    wrapper.append(label);
    typeCheckboxes.appendChild(wrapper);
  }
}

function syncSelectAll() {
  const boxes = [...typeCheckboxes.querySelectorAll('input[type=checkbox]')];
  selectAll.checked = boxes.every((box) => box.checked);
}

selectAll.addEventListener('change', () => {
  const boxes = [...typeCheckboxes.querySelectorAll('input[type=checkbox]')];
  for (const box of boxes) box.checked = selectAll.checked;
});

function buildAnswerInputs(problem) {
  answerInputs.innerHTML = '';
  submitBtn.hidden = false;

  if (problem.answerType === 'fraction') {
    answerInputs.appendChild(fractionInputGroup('answer-num', 'answer-den'));
  } else if (problem.answerType === 'commonDenominator') {
    const row = document.createElement('div');
    row.className = 'whole-and-fraction';
    row.appendChild(fractionInputFixedDen('answer-numA', problem.correctAnswer.den));
    row.appendChild(document.createTextNode('og'));
    row.appendChild(fractionInputFixedDen('answer-numB', problem.correctAnswer.den));
    answerInputs.appendChild(row);
  } else if (problem.answerType === 'mixed') {
    const row = document.createElement('div');
    row.className = 'whole-and-fraction';
    row.appendChild(numberField('answer-whole', 'Helt tal', 0));
    row.appendChild(fractionInputGroup('answer-num', 'answer-den'));
    answerInputs.appendChild(row);
  } else if (problem.answerType === 'decimal') {
    answerInputs.appendChild(numberField('answer-value', 'Decimaltal', 0, 0.01));
  } else if (problem.answerType === 'percent') {
    answerInputs.appendChild(numberField('answer-value', 'Procent', 0, 1));
  } else if (problem.answerType === 'choice') {
    submitBtn.hidden = true;
    const group = document.createElement('div');
    group.className = 'choice-buttons';
    for (const choice of problem.choices) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = choice;
      btn.addEventListener('click', () => submitAnswer(choice));
      group.appendChild(btn);
    }
    answerInputs.appendChild(group);
  }
}

function numberField(id, labelText, min, step) {
  const wrapper = document.createElement('div');
  wrapper.className = 'frac-input';
  wrapper.append(fracLabel(id, labelText), fracNumberInput(id, min, step));
  return wrapper;
}

function fracLabel(forId, text) {
  const label = document.createElement('label');
  label.className = 'frac-input-label';
  label.setAttribute('for', forId);
  label.textContent = text;
  return label;
}

function fracNumberInput(id, min, step) {
  const input = document.createElement('input');
  input.type = 'number';
  input.id = id;
  input.name = id;
  input.required = true;
  input.min = String(min);
  input.inputMode = step && step < 1 ? 'decimal' : 'numeric';
  if (step) input.step = String(step);
  return input;
}

function fractionInputGroup(numId, denId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'frac-input';
  const bar = document.createElement('hr');
  bar.className = 'frac-bar';
  wrapper.append(
    fracLabel(numId, 'Tæller'),
    fracNumberInput(numId, 0),
    bar,
    fracLabel(denId, 'Nævner'),
    fracNumberInput(denId, 1)
  );
  return wrapper;
}

function fractionInputFixedDen(numId, denValue) {
  const wrapper = document.createElement('div');
  wrapper.className = 'frac-input';
  const bar = document.createElement('hr');
  bar.className = 'frac-bar';
  const denStatic = document.createElement('div');
  denStatic.className = 'frac-static-den';
  denStatic.textContent = String(denValue);
  wrapper.append(fracLabel(numId, 'Tæller'), fracNumberInput(numId, 0), bar, denStatic);
  return wrapper;
}

function buildFracSpan(num, den) {
  const span = document.createElement('span');
  span.className = 'frac';
  const numSpan = document.createElement('span');
  numSpan.className = 'frac-num';
  numSpan.textContent = num;
  const denSpan = document.createElement('span');
  denSpan.className = 'frac-den';
  denSpan.textContent = den;
  span.append(numSpan, denSpan);
  return span;
}

function renderPrompt(container, text) {
  container.innerHTML = '';
  const regex = /(-?\d+)\/(\d+)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    container.appendChild(buildFracSpan(match[1], match[2]));
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function readAnswer(problem) {
  if (problem.answerType === 'fraction') {
    return {
      num: Number(document.getElementById('answer-num').value),
      den: Number(document.getElementById('answer-den').value),
    };
  }
  if (problem.answerType === 'commonDenominator') {
    return {
      numA: Number(document.getElementById('answer-numA').value),
      numB: Number(document.getElementById('answer-numB').value),
    };
  }
  if (problem.answerType === 'mixed') {
    return {
      whole: Number(document.getElementById('answer-whole').value),
      num: Number(document.getElementById('answer-num').value),
      den: Number(document.getElementById('answer-den').value),
    };
  }
  if (problem.answerType === 'decimal' || problem.answerType === 'percent') {
    return Number(document.getElementById('answer-value').value);
  }
  return null;
}

function formatCorrectAnswer(problem) {
  const a = problem.correctAnswer;
  if (problem.answerType === 'fraction') return `${a.num}/${a.den}`;
  if (problem.answerType === 'commonDenominator')
    return `${a.numA}/${a.den} og ${a.numB}/${a.den}`;
  if (problem.answerType === 'mixed') return `${a.whole} ${a.num}/${a.den}`;
  if (problem.answerType === 'decimal') return formatDecimalDanish(a);
  if (problem.answerType === 'percent') return `${a}%`;
  return String(a);
}

function startProblem() {
  const typeId = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
  currentProblem = generateProblem(typeId);
  renderPrompt(problemPrompt, currentProblem.prompt);
  buildAnswerInputs(currentProblem);
  feedback.textContent = '';
  feedback.className = '';
  nextBtn.hidden = true;
  answerForm.hidden = false;
}

function submitAnswer(choiceValue) {
  if (!currentProblem) return;
  const userAnswer = choiceValue !== undefined ? choiceValue : readAnswer(currentProblem);
  if (userAnswer && typeof userAnswer === 'object') {
    if (Object.values(userAnswer).some((v) => Number.isNaN(v))) return;
    if ('den' in userAnswer && userAnswer.den === 0) return;
  }
  if (typeof userAnswer === 'number' && Number.isNaN(userAnswer)) return;

  const wasCorrect = currentProblem.checkAnswer(userAnswer);
  scoreTracker.record(currentProblem.type, wasCorrect);

  if (wasCorrect) {
    feedback.textContent = 'Rigtigt!';
    feedback.className = 'correct';
  } else {
    feedback.textContent = `Forkert. Det rigtige svar var ${formatCorrectAnswer(currentProblem)}.`;
    feedback.className = 'wrong';
  }

  answerForm.hidden = true;
  nextBtn.hidden = false;
  renderScores();
}

answerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAnswer();
});

nextBtn.addEventListener('click', startProblem);

backBtn.addEventListener('click', () => {
  assignmentScreen.hidden = true;
  optionsScreen.hidden = false;
});

optionsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const checked = [...typeCheckboxes.querySelectorAll('input[type=checkbox]:checked')];
  if (checked.length === 0) {
    optionsError.hidden = false;
    return;
  }
  optionsError.hidden = true;
  selectedTypes = checked.map((box) => box.value);
  optionsScreen.hidden = true;
  assignmentScreen.hidden = false;
  startProblem();
});

resetOverallBtn.addEventListener('click', () => {
  if (confirm('Nulstil al gemt statistik på denne enhed?')) {
    scoreTracker.resetOverall();
    renderScores();
  }
});

function renderScoreTable(tbody, scores) {
  tbody.innerHTML = '';
  for (const { id } of ASSIGNMENT_TYPES) {
    const entry = scores[id];
    if (!entry) continue;
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = typeLabel(id);
    const correctCell = document.createElement('td');
    correctCell.textContent = String(entry.correct);
    const wrongCell = document.createElement('td');
    wrongCell.textContent = String(entry.wrong);
    row.append(nameCell, correctCell, wrongCell);
    tbody.appendChild(row);
  }
}

function renderScores() {
  renderScoreTable(document.querySelector('#session-table tbody'), scoreTracker.getSession());
  renderScoreTable(document.querySelector('#overall-table tbody'), scoreTracker.getOverall());
}

renderTypeCheckboxes();
renderScores();
