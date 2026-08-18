// ---------- State ----------
let currentFlightIndex = 0;   // index in FLIGHTS
let currentStepIndex = 0;     // position within current flight
let unlockedFlightIndex = 0;  // highest flight fully completed
let correctAnswersInStep = 0; // correct count for current step (not used if required=1)

let gameMode = "stairs";      // "stairs" or "freefall"

// Free Fall state
let freefallScore = 0;
let freefallTimeLeft = 30;
let freefallTimerInterval = null;
let freefallUnlockedMods = [];

// ---------- DOM ----------
const staircaseEl = document.getElementById("staircase");
const levelInfoEl = document.getElementById("level-info");
const questionTextEl = document.getElementById("question-text");
const answerOptionsEl = document.getElementById("answer-options");
const feedbackEl = document.getElementById("feedback");
const upBtn = document.getElementById("up-btn");
const freefallBtn = document.getElementById("freefall-btn");

const freefallPanel = document.getElementById("freefall-panel");
const freefallTimerEl = document.getElementById("freefall-timer");
const freefallScoreEl = document.getElementById("freefall-score");
const freefallQuestionTextEl = document.getElementById("freefall-question-text");
const freefallAnswerOptionsEl = document.getElementById("freefall-answer-options");
const freefallFeedbackEl = document.getElementById("freefall-feedback");
const freefallExitBtn = document.getElementById("freefall-exit-btn");

// ---------- Spiral settings ----------
const stepAngle = 18;   // degrees between visible steps
const radius = 220;
const currentStepScale = 1.35;
const currentStepDepth = 120;

// ---------- Helper ----------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeOptions(modulus, correct) {
  if (modulus === 1) {
    return [0, 1, 2];
  }
  if (modulus <= 8) {
    const options = [];
    for (let i = 0; i < modulus; i++) {
      options.push(i);
    }
    return options;
  }
  const options = new Set();
  options.add(correct);
  while (options.size < 5) {
    const wrong = Math.floor(Math.random() * modulus);
    if (wrong !== correct) {
      options.add(wrong);
    }
  }
  return Array.from(options);
}

// ---------- Rendering Staircase ----------
function renderStaircase() {
  staircaseEl.innerHTML = "";
  const flight = FLIGHTS[currentFlightIndex];
  const totalSteps = flight.steps.length;

  flight.steps.forEach((stepDef, i) => {
    const stepEl = document.createElement("div");
    stepEl.classList.add("step");

    if (i === currentStepIndex) {
      stepEl.classList.add("current");
    }
    if (i < currentStepIndex) {
      stepEl.classList.add("passed");
    }
    if (i > currentStepIndex) {
      stepEl.classList.add("ahead");
    }

    const relative = i - currentStepIndex;
    const angle = relative * stepAngle;
    const dist = Math.abs(relative);

    let depth, scale;
    if (relative === 0) {
      depth = currentStepDepth;
      scale = currentStepScale;
    } else if (relative === 1) {
      depth = 60;
      scale = 1.1;
    } else if (relative === 2) {
      depth = 0;
      scale = 0.95;
    } else if (relative <= 4) {
      depth = -60;
      scale = 0.8;
    } else {
      depth = -120;
      scale = 0.6;
    }

    if (relative < 0) {
      depth = -300;
      scale = 0.3;
      stepEl.style.opacity = "0";
    }

    stepEl.style.transform = `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg) translateZ(${depth}px) scale(${scale})`;
    stepEl.textContent = `${i + 1}. ${stepDef.label}`;
    staircaseEl.appendChild(stepEl);
  });
}

function updateUI() {
  const flight = FLIGHTS[currentFlightIndex];
  const stepDef = flight.steps[currentStepIndex];
  levelInfoEl.textContent = `Mod ${flight.modulus} — Step ${currentStepIndex + 1}/${flight.steps.length} (${stepDef.label})`;

  upBtn.disabled = currentStepIndex === 0;
  upBtn.title = currentStepIndex > 0 ? "Go back up one step" : "You are at the top of this flight";

  const freefallUnlocked = FLIGHTS.some(
    (f, idx) => idx <= unlockedFlightIndex && f.modulus === 10
  );
  freefallBtn.disabled = !freefallUnlocked;
  freefallBtn.title = freefallUnlocked ? "Start Free Fall" : "Unlocks after completing Mod 10";
}

function loadStep() {
  correctAnswersInStep = 0;
  feedbackEl.textContent = "";
  renderStaircase();
  updateUI();
  generateQuestion();
}

function advanceStep() {
  const flight = FLIGHTS[currentFlightIndex];
  if (currentStepIndex < flight.steps.length - 1) {
    currentStepIndex++;
    loadStep();
  } else {
    // Flight complete
    unlockedFlightIndex = Math.max(unlockedFlightIndex, currentFlightIndex);
    if (currentFlightIndex < FLIGHTS.length - 1) {
      currentFlightIndex++;
      currentStepIndex = 0;
      feedbackEl.textContent = `You descended to Mod ${FLIGHTS[currentFlightIndex].modulus}!`;
      setTimeout(loadStep, 1200);
    } else {
      feedbackEl.textContent = "You reached the bottom of all flights!";
      updateUI();
    }
  }
}

function goUpOneStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    loadStep();
  }
}

// ---------- Question Generation (Staircase) ----------
function generateQuestion() {
  const flight = FLIGHTS[currentFlightIndex];
  const stepDef = flight.steps[currentStepIndex];
  const n = flight.modulus;
  const range = stepDef.range || [0, n - 1];

  let question = "";
  let correctAnswer = 0;
  let options = [];

  switch (stepDef.operation) {
    case "constantZero":
      question = `0 mod ${n} = ?`;
      correctAnswer = 0;
      options = makeOptions(n, correctAnswer);
      break;

    case "simple": {
      const x = randInt(range[0], range[1]);
      question = `${x} mod ${n} = ?`;
      correctAnswer = x % n;
      options = makeOptions(n, correctAnswer);
      break;
    }

    case "addition": {
      const a = randInt(0, range[1]);
      const b = randInt(0, range[1]);
      question = `${a} + ${b} mod ${n} = ?`;
      correctAnswer = (a + b) % n;
      options = makeOptions(n, correctAnswer);
      break;
    }

    case "additionChain": {
      const a = randInt(0, range[1]);
      const b = randInt(0, range[1]);
      const c = randInt(0, range[1]);
      question = `${a} + ${b} + ${c} mod ${n} = ?`;
      correctAnswer = (a + b + c) % n;
      options = makeOptions(n, correctAnswer);
      break;
    }

    case "multiplication": {
      const a = randInt(0, range[1]);
      const b = randInt(0, range[1]);
      question = `${a} × ${b} mod ${n} = ?`;
      correctAnswer = (a * b) % n;
      options = makeOptions(n, correctAnswer);
      break;
    }

    case "multiplicationChain": {
      const a = randInt(0, range[1]);
      const b = randInt(0, range[1]);
      const c = randInt(0, range[1]);
      question = `${a} × ${b} × ${c} mod ${n} = ?`;
      correctAnswer = (a * b * c) % n;
      options = makeOptions(n, correctAnswer);
      break;
    }

    case "mixed": {
      const a = randInt(0, range[1]);
      const b = randInt(0, range[1]);
      if (Math.random() < 0.5) {
        question = `${a} + ${b} mod ${n} = ?`;
        correctAnswer = (a + b) % n;
      } else {
        question = `${a} × ${b} mod ${n} = ?`;
        correctAnswer = (a * b) % n;
      }
      options = makeOptions(n, correctAnswer);
      break;
    }

    case "mixedChain": {
      const a = randInt(0, range[1]);
      const b = randInt(0, range[1]);
      const c = randInt(0, range[1]);
      question = `${a} + ${b} × ${c} mod ${n} = ?`;
      correctAnswer = (a + b * c) % n;
      options = makeOptions(n, correctAnswer);
      break;
    }

    default:
      question = "Not implemented yet.";
      correctAnswer = 0;
      options = [0];
  }

  options = options.sort(() => Math.random() - 0.5);

  questionTextEl.textContent = question;
  answerOptionsEl.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(option, correctAnswer));
    answerOptionsEl.appendChild(button);
  });
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    feedbackEl.textContent = "Correct!";
    feedbackEl.style.color = "#a6e3a1";
    correctAnswersInStep++;

    if (correctAnswersInStep >= 1) {
      setTimeout(advanceStep, 600);
    } else {
      setTimeout(generateQuestion, 800);
    }
  } else {
    feedbackEl.textContent = `Wrong. The answer is ${correct}.`;
    feedbackEl.style.color = "#f38ba8";
    setTimeout(generateQuestion, 1200);
  }
}

// ---------- Free Fall Mode ----------
function getUnlockedMods() {
  const mods = [];
  for (let i = 0; i <= unlockedFlightIndex; i++) {
    const mod = FLIGHTS[i].modulus;
    if (!mods.includes(mod)) {
      mods.push(mod);
    }
  }
  return mods;
}

function startFreefall() {
  gameMode = "freefall";
  freefallScore = 0;
  freefallTimeLeft = 30;
  freefallUnlockedMods = getUnlockedMods();

  // Hide stairs, show freefall panel
  document.getElementById("staircase-container").style.display = "none";
  freefallPanel.style.display = "block";

  updateFreefallUI();
  generateFreefallQuestion();

  // Start timer
  freefallTimerInterval = setInterval(() => {
    freefallTimeLeft--;
    updateFreefallUI();
    if (freefallTimeLeft <= 0) {
      endFreefall();
    }
  }, 1000);
}

function endFreefall() {
  clearInterval(freefallTimerInterval);
  freefallFeedbackEl.textContent = `Time's up! Final score: ${freefallScore}`;
  freefallFeedbackEl.style.color = "#f9e2af";
}

function exitFreefall() {
  clearInterval(freefallTimerInterval);
  gameMode = "stairs";
  document.getElementById("staircase-container").style.display = "flex";
  freefallPanel.style.display = "none";
  loadStep(); // refresh the stairs view
}

function updateFreefallUI() {
  freefallTimerEl.textContent = freefallTimeLeft;
  freefallScoreEl.textContent = `Score: ${freefallScore}`;
}

function generateFreefallQuestion() {
  if (gameMode !== "freefall") return;

  // Pick a random modulus from unlocked mods
  const mod = freefallUnlockedMods[Math.floor(Math.random() * freefallUnlockedMods.length)];

  // Pick a random operation
  const operations = ["simple", "addition", "multiplication"];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let question = "";
  let correctAnswer = 0;
  let options = [];

  switch (op) {
    case "simple": {
      const maxNum = Math.max(30, mod * 2);
      const x = randInt(1, maxNum);
      question = `${x} mod ${mod} = ?`;
      correctAnswer = x % mod;
      break;
    }
    case "addition": {
      const maxOperand = Math.min(20, mod - 1);
      const a = randInt(0, maxOperand);
      const b = randInt(0, maxOperand);
      question = `${a} + ${b} mod ${mod} = ?`;
      correctAnswer = (a + b) % mod;
      break;
    }
    case "multiplication": {
      const maxOperand = Math.min(12, mod - 1);
      const a = randInt(0, maxOperand);
      const b = randInt(0, maxOperand);
      question = `${a} × ${b} mod ${mod} = ?`;
      correctAnswer = (a * b) % mod;
      break;
    }
  }

  options = makeOptions(mod, correctAnswer).sort(() => Math.random() - 0.5);

  freefallQuestionTextEl.textContent = question;
  freefallAnswerOptionsEl.innerHTML = "";
  freefallFeedbackEl.textContent = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => checkFreefallAnswer(option, correctAnswer));
    freefallAnswerOptionsEl.appendChild(button);
  });
}

function checkFreefallAnswer(selected, correct) {
  if (selected === correct) {
    freefallScore++;
    updateFreefallUI();
    freefallFeedbackEl.textContent = "Correct!";
    freefallFeedbackEl.style.color = "#a6e3a1";
    // Immediately generate next question
    generateFreefallQuestion();
  } else {
    freefallFeedbackEl.textContent = `Wrong. Answer: ${correct}`;
    freefallFeedbackEl.style.color = "#f38ba8";
    // Short delay then next question
    setTimeout(generateFreefallQuestion, 800);
  }
}

// ---------- Event Listeners ----------
upBtn.addEventListener("click", goUpOneStep);

freefallBtn.addEventListener("click", () => {
  if (!freefallBtn.disabled) {
    startFreefall();
  }
});

freefallExitBtn.addEventListener("click", exitFreefall);

// ---------- Start Game ----------
loadStep();
