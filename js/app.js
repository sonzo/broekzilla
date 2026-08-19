const scoreTracker = createScoreTracker();

const optionsScreen = document.getElementById('options-screen');
const assignmentScreen = document.getElementById('assignment-screen');
const typeCheckboxes = document.getElementById('type-checkboxes');
const typeDropdownSummary = document.getElementById('type-dropdown-summary');
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
const statsScreen = document.getElementById('stats-screen');
const statsBtn = document.getElementById('stats-btn');
const assignmentStatsBtn = document.getElementById('assignment-stats-btn');
const sessionLiveTotals = document.getElementById('session-live-totals');

let selectedTypes = [];
let currentProblem = null;

function typeLabel(typeId) {
  return ASSIGNMENT_TYPES.find((t) => t.id === typeId)?.label ?? typeId;
}

function renderTypeCheckboxes() {
  typeCheckboxes.innerHTML = '';

  const selectAllLi = document.createElement('li');
  const selectAllLabel = document.createElement('label');
  const selectAllInput = document.createElement('input');
  selectAllInput.type = 'checkbox';
  selectAllInput.id = 'select-all';
  const selectAllText = document.createElement('strong');
  selectAllText.textContent = 'Vælg alle';
  selectAllLabel.append(selectAllInput, ' ', selectAllText);
  selectAllLi.appendChild(selectAllLabel);
  selectAllInput.addEventListener('change', () => {
    for (const box of typeBoxes()) box.checked = selectAllInput.checked;
    updateDropdownSummary();
  });
  typeCheckboxes.appendChild(selectAllLi);

  for (const { id, label } of ASSIGNMENT_TYPES) {
    const li = document.createElement('li');
    const wrapper = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'types';
    input.value = id;
    input.addEventListener('change', () => {
      syncSelectAll();
      updateDropdownSummary();
    });
    wrapper.append(input, ` ${label}`);
    li.appendChild(wrapper);
    typeCheckboxes.appendChild(li);
  }

  const startLi = document.createElement('li');
  startLi.className = 'start-training-item';
  const startButton = document.createElement('button');
  startButton.type = 'submit';
  startButton.textContent = 'Start træning';
  startLi.appendChild(startButton);
  typeCheckboxes.appendChild(startLi);

  updateDropdownSummary();
}

function typeBoxes() {
  return [...typeCheckboxes.querySelectorAll('input[name=types]')];
}

function syncSelectAll() {
  document.getElementById('select-all').checked = typeBoxes().every((box) => box.checked);
}

function updateDropdownSummary() {
  const boxes = typeBoxes();
  const checkedCount = boxes.filter((box) => box.checked).length;
  if (checkedCount === 0) {
    typeDropdownSummary.textContent = 'Vælg opgavetyper';
  } else if (checkedCount === boxes.length) {
    typeDropdownSummary.textContent = 'Alle opgavetyper valgt';
  } else {
    typeDropdownSummary.textContent = `${checkedCount} opgavetyper valgt`;
  }
}

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

function appendTextWithFractions(container, text) {
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

function renderPrompt(container, text) {
  container.innerHTML = '';
  appendTextWithFractions(container, text);
}

function renderFeedback(isCorrect, titleText, resultParts, steps) {
  feedback.innerHTML = '';

  const titleLine = document.createElement('p');
  titleLine.className = 'feedback-line feedback-title';
  titleLine.textContent = titleText;
  feedback.appendChild(titleLine);

  if (resultParts) {
    const resultLine = document.createElement('p');
    resultLine.className = 'feedback-line';
    for (const part of resultParts) {
      if (part.highlight) {
        const span = document.createElement('span');
        span.className = 'answer-value';
        appendTextWithFractions(span, part.text);
        resultLine.appendChild(span);
      } else {
        appendTextWithFractions(resultLine, part.text);
      }
    }
    feedback.appendChild(resultLine);
  }

  for (const step of steps) {
    const stepLine = document.createElement('p');
    stepLine.className = 'feedback-line feedback-explain';
    appendTextWithFractions(stepLine, step);
    feedback.appendChild(stepLine);
  }

  feedback.className = isCorrect ? 'correct' : 'wrong';
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
  feedback.innerHTML = '';
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

  const steps = currentProblem.explainSteps ?? [];
  if (wasCorrect) {
    renderFeedback(true, 'Rigtigt!', null, steps);
  } else {
    renderFeedback(
      false,
      'FORKERT!!!',
      [{ text: 'Det rigtige svar er = ' }, { text: formatCorrectAnswer(currentProblem), highlight: true }],
      steps
    );
  }

  answerForm.hidden = true;
  nextBtn.hidden = false;
  renderScores();
}

let currentMainScreen = 'options';
let statsVisible = false;

function updateScreens() {
  optionsScreen.hidden = currentMainScreen !== 'options';
  assignmentScreen.hidden = currentMainScreen !== 'assignment';
  statsScreen.hidden = !statsVisible;

  statsBtn.hidden = currentMainScreen === 'assignment';
  const label = statsVisible ? 'Skjul statistik' : 'Statistik';
  statsBtn.textContent = label;
  assignmentStatsBtn.textContent = label;
  statsBtn.classList.toggle('wide', statsVisible);
}

function goToScreen(screen) {
  currentMainScreen = screen;
  statsVisible = false;
  updateScreens();
}

function toggleStats() {
  statsVisible = !statsVisible;
  updateScreens();
}

answerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAnswer();
});

nextBtn.addEventListener('click', startProblem);

backBtn.addEventListener('click', () => {
  for (const box of typeBoxes()) box.checked = false;
  document.getElementById('select-all').checked = false;
  updateDropdownSummary();
  document.getElementById('type-dropdown').open = true;
  goToScreen('options');
});

statsBtn.addEventListener('click', toggleStats);
assignmentStatsBtn.addEventListener('click', toggleStats);

optionsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const checked = typeBoxes().filter((box) => box.checked);
  if (checked.length === 0) {
    optionsError.hidden = false;
    return;
  }
  optionsError.hidden = true;
  selectedTypes = checked.map((box) => box.value);
  document.getElementById('type-dropdown').open = false;
  goToScreen('assignment');
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
    correctCell.className = 'correct-count';
    correctCell.textContent = String(entry.correct);
    const wrongCell = document.createElement('td');
    wrongCell.className = 'wrong-count';
    wrongCell.textContent = String(entry.wrong);
    row.append(nameCell, correctCell, wrongCell);
    tbody.appendChild(row);
  }
}

function renderLiveSessionTotals(totals) {
  sessionLiveTotals.innerHTML = '';
  const correctSpan = document.createElement('span');
  correctSpan.className = 'correct-count';
  correctSpan.textContent = `${totals.correct} rigtige`;
  const wrongSpan = document.createElement('span');
  wrongSpan.className = 'wrong-count';
  wrongSpan.textContent = `${totals.wrong} forkerte`;
  sessionLiveTotals.append(correctSpan, ' · ', wrongSpan);
}

function renderScores() {
  renderScoreTable(document.querySelector('#session-table tbody'), scoreTracker.getSession());
  renderScoreTable(document.querySelector('#overall-table tbody'), scoreTracker.getOverall());

  const sessionTotals = scoreTracker.getSessionTotals();
  const overallTotals = scoreTracker.getOverallTotals();
  document.getElementById('session-total-correct').textContent = sessionTotals.correct;
  document.getElementById('session-total-wrong').textContent = sessionTotals.wrong;
  document.getElementById('overall-total-correct').textContent = overallTotals.correct;
  document.getElementById('overall-total-wrong').textContent = overallTotals.wrong;

  renderLiveSessionTotals(sessionTotals);
}

renderTypeCheckboxes();
renderScores();
