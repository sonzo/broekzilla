const STORAGE_KEY = 'brokzilla-overall-scores';

function emptyScores() {
  return {};
}

function loadOverall() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : emptyScores();
  } catch {
    return emptyScores();
  }
}

function saveOverall(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

function createScoreTracker() {
  const session = emptyScores();
  const overall = loadOverall();

  function record(typeId, wasCorrect) {
    for (const scores of [session, overall]) {
      if (!scores[typeId]) scores[typeId] = { correct: 0, wrong: 0 };
      if (wasCorrect) scores[typeId].correct += 1;
      else scores[typeId].wrong += 1;
    }
    saveOverall(overall);
  }

  function totals(scores) {
    return Object.values(scores).reduce(
      (acc, { correct, wrong }) => ({
        correct: acc.correct + correct,
        wrong: acc.wrong + wrong,
      }),
      { correct: 0, wrong: 0 }
    );
  }

  function resetOverall() {
    for (const key of Object.keys(overall)) delete overall[key];
    saveOverall(overall);
  }

  return {
    record,
    getSession: () => session,
    getOverall: () => overall,
    getSessionTotals: () => totals(session),
    getOverallTotals: () => totals(overall),
    resetOverall,
  };
}
