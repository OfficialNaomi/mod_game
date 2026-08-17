const levels = LEVELS;

let currentLevelIndex = 0;
let unlockedLevelIndex = 0;
let correctAnswersInLevel = 0;

const staircaseEl = document.getElementById("staircase");
const levelInfoEl = document.getElementById("level-info");
const questionTextEl = document.getElementById("question-text");
const answerOptionsEl = document.getElementById("answer-options");
const feedbackEl = document.getElementById("feedback");
const nextLevelBtn = document.getElementById("next-level-btn");
const freefallBtn = document.getElementById("freefall-btn");

const totalSteps = levels.length;
const stepAngle = 360 / totalSteps;
const radius = 240;

function renderStaircase() {
  staircaseEl.innerHTML = "";

  levels.forEach((level, index) => {
    const step = document.createElement("div");
    step.classList.add("step");

    if (index === currentLevelIndex) {
      step.classList.add("current");
    }
    if (index <= unlockedLevelIndex) {
      step.classList.add("unlocked");
    } else {
      step.classList.add("locked");
    }

    const rel = ((index - currentLevelIndex) % totalSteps + totalSteps) % totalSteps;
    const angle = rel * stepAngle;
    const dist = Math.min(rel, totalSteps - rel);

    let depth, scale;
    if (dist === 0) {
      depth = 100;
      scale = 1.35;
    } else if (dist === 1) {
      depth = 40;
      scale = 1.05;
    } else if (dist === 2) {
      depth = -20;
      scale = 0.9;
    } else if (dist <= 4) {
      depth = -80;
      scale = 0.7;
    } else {
      depth = -150;
      scale = 0.5;
    }

    step.style.transform = `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg) translateZ(${depth}px) scale(${scale})`;

    step.textContent = `${index + 1}. ${level.label}`;
    staircaseEl.appendChild(step);
  });
}

function updateLevelInfo() {
  const level = levels[currentLevelIndex];
  levelInfoEl.textContent = `${level.label} — ${level.description}`;
}

function loadLevel() {
  correctAnswersInLevel = 0;
  feedbackEl.textContent = "";
  nextLevelBtn.style.display = "none";
  renderStaircase();
  updateLevelInfo();
  generateQuestion();

  const freefallUnlocked = levels.some(
    (level, index) => index <= unlockedLevelIndex && level.unlocksFreeFall
  );
  freefallBtn.disabled = !freefallUnlocked;
  freefallBtn.title = freefallUnlocked
    ? "Start Free Fall"
    : "Unlocks after completing Mod 10";
}

function completeLevel() {
  if (currentLevelIndex < levels.length - 1) {
    unlockedLevelIndex = Math.max(unlockedLevelIndex, currentLevelIndex + 1);
    nextLevelBtn.style.display = "block";
  } else {
    feedbackEl.textContent = "You reached the bottom!";
  }
}

function goToNextLevel() {
  if (currentLevelIndex < levels.length - 1) {
    currentLevelIndex++;
    loadLevel();
  }
}

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

function generateQuestion() {
  const level = levels[currentLevelIndex];
  const n = level.modulus;
  const range = level.range || [0, n - 1];

  let question = "";
  let correctAnswer = 0;
  let options = [];

  switch (level.operation) {
    case "constantZero":
      question = `0 mod ${n} = ?`;
      correctAnswer = 0;
      options = makeOptions(n, 0);
      break;

    case "simple":
      const x = randInt(range[0], range[1]);
      question = `${x} mod ${n} = ?`;
      correctAnswer = x % n;
      options = makeOptions(n, correctAnswer);
      break;

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

    case "mixed":
      if (Math.random() < 0.5) {
        const a = randInt(0, range[1]);
        const b = randInt(0, range[1]);
        question = `${a} + ${b} mod ${n} = ?`;
        correctAnswer = (a + b) % n;
      } else {
        const a = randInt(0, range[1]);
        const b = randInt(0, range[1]);
        question = `${a} × ${b} mod ${n} = ?`;
        correctAnswer = (a * b) % n;
      }
      options = makeOptions(n, correctAnswer);
      break;

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
    correctAnswersInLevel++;

    if (correctAnswersInLevel >= levels[currentLevelIndex].requiredCorrect) {
      completeLevel();
    } else {
      setTimeout(generateQuestion, 800);
    }
  } else {
    feedbackEl.textContent = `Wrong. The answer is ${correct}.`;
    feedbackEl.style.color = "#f38ba8";
    setTimeout(generateQuestion, 1200);
  }
}

nextLevelBtn.addEventListener("click", goToNextLevel);

freefallBtn.addEventListener("click", () => {
  if (!freefallBtn.disabled) {
    alert("Free Fall mode will be implemented soon!");
  }
});

loadLevel();
