// ---------- State ----------
let currentFlightIndex = 0;
let currentStepIndex = 0;
let unlockedFlightIndex = 0;
let correctAnswersInStep = 0;

// ---------- DOM ----------
const staircaseEl = document.getElementById("staircase");
const levelInfoEl = document.getElementById("level-info");
const questionTextEl = document.getElementById("question-text");
const answerOptionsEl = document.getElementById("answer-options");
const feedbackEl = document.getElementById("feedback");
const upBtn = document.getElementById("up-btn");
const freefallBtn = document.getElementById("freefall-btn");

// ---------- Spiral settings ----------
const stepAngle = 18;
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

    let depth;
    let scale;

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

// ---------- Event Listeners ----------
upBtn.addEventListener("click", goUpOneStep);

freefallBtn.addEventListener("click", () => {
  if (!freefallBtn.disabled) {
    const mods = getUnlockedMods();
    if (mods.length > 0 && typeof FreeFall !== "undefined") {
      FreeFall.start(mods);
    }
  }
});

// ---------- Start Game ----------
loadStep();
