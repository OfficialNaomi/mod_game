// ---------- State ----------
let currentFlightIndex = 0;   // index in FLIGHTS
let currentStepIndex = 0;     // position within current flight
let unlockedFlightIndex = 0;  // highest flight fully completed
let correctAnswersInStep = 0; // correct count for current step (not used if required=1)

// ---------- DOM ----------
const staircaseEl = document.getElementById("staircase");
const levelInfoEl = document.getElementById("level-info");
const questionTextEl = document.getElementById("question-text");
const answerOptionsEl = document.getElementById("answer-options");
const feedbackEl = document.getElementById("feedback");
const upBtn = document.getElementById("up-btn");
const freefallBtn = document.getElementById("freefall-btn");

// ---------- Spiral settings ----------
const stepAngle = 18;   // degrees between visible steps (adjust for spacing)
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
  const options = [];
  for (let i = 0; i < modulus; i++) {
    options.push(i);
  }
  return options;
}

// ---------- Rendering Staircase ----------
function renderStaircase() {
  staircaseEl.innerHTML = "";
  const flight = FLIGHTS[currentFlightIndex];
  const totalSteps = flight.steps.length;

  flight.steps.forEach((stepDef, i) => {
    const stepEl = document.createElement("div");
    stepEl.classList.add("step");

    // Current step
    if (i === currentStepIndex) {
      stepEl.classList.add("current");
    }
    // Steps already passed (behind)
    if (i < currentStepIndex) {
      stepEl.classList.add("passed");
    }
    // Steps ahead (down)
    if (i > currentStepIndex) {
      stepEl.classList.add("ahead");
    }

    const relative = i - currentStepIndex; // 0 = current, positive = ahead
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

    // If passed, move far behind and hide
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

  // Up button state
  upBtn.disabled = currentStepIndex === 0;
  if (currentStepIndex > 0) {
    upBtn.title = "Go back up one step";
  } else {
    upBtn.title = "You are at the top of this flight";
  }

  // Free Fall button: unlocked after flight with modulus 10 is completed
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

// ---------- Question Generation ----------
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

    const flight = FLIGHTS[currentFlightIndex];
    if (correctAnswersInStep >= 1) { // each step requires 1 correct
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
    alert("Free Fall mode will be implemented soon!");
  }
});

// ---------- Start Game ----------
loadStep();
