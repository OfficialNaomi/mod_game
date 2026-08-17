// ---------- Global Levels (from levels.js) ----------
const levels = LEVELS;

// ---------- Game State ----------
let currentLevelIndex = 0;
let unlockedLevelIndex = 0;
let correctAnswersInLevel = 0;

// ---------- DOM Elements ----------
const staircaseEl = document.getElementById("staircase");
const levelInfoEl = document.getElementById("level-info");
const questionTextEl = document.getElementById("question-text");
const answerOptionsEl = document.getElementById("answer-options");
const feedbackEl = document.getElementById("feedback");
const nextLevelBtn = document.getElementById("next-level-btn");
const freefallBtn = document.getElementById("freefall-btn");

// Staircase rotation settings
const stepAngle = 360 / levels.length;
let currentRotation = 0;

// ---------- Staircase Rendering ----------
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

    // Position step around the circle
    const angle = index * stepAngle;
    step.style.transform = `rotate(${angle}deg) translateX(180px) rotate(-${angle}deg)`;

    step.textContent = `${index + 1}. ${level.name}`;
    staircaseEl.appendChild(step);
  });

  // Rotate the whole staircase so the current level is at the front
  currentRotation = -currentLevelIndex * stepAngle;
  staircaseEl.style.transform = `rotate(${currentRotation}deg)`;
}

function updateLevelInfo() {
  const level = levels[currentLevelIndex];
  levelInfoEl.textContent = `${level.name} — ${level.description}`;
}

function loadLevel() {
  correctAnswersInLevel = 0;
  feedbackEl.textContent = "";
  nextLevelBtn.style.display = "none";
  renderStaircase();
  updateLevelInfo();
  generateQuestion();

  // Free Fall unlocks when any unlocked level has unlocksFreeFall = true
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

// ---------- Question Generation ----------
function generateQuestion() {
  const level = levels[currentLevelIndex];
  let question, correctAnswer, options;

  switch (level.operation) {
    case "simple":
      ({ question, correctAnswer, options } = generateSimpleQuestion(level));
      break;
    case "addition":
      ({ question, correctAnswer, options } = generateAdditionQuestion(level));
      break;
    case "multiplication":
      ({ question, correctAnswer, options } = generateMultiplicationQuestion(level));
      break;
    case "mixed":
      if (Math.random() < 0.5) {
        ({ question, correctAnswer, options } = generateAdditionQuestion(level));
      } else {
        ({ question, correctAnswer, options } = generateMultiplicationQuestion(level));
      }
      break;
    default:
      question = "Not implemented yet.";
      correctAnswer = 0;
      options = [0];
  }

  // Shuffle options
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

function generateSimpleQuestion(level) {
  // For mod 1, we want a few extra options to make it less trivial
  const maxRandom = level.modulus === 1 ? 20 : 30;
  const randomNumber = Math.floor(Math.random() * maxRandom) + 1;
  const correctAnswer = randomNumber % level.modulus;

  let options;
  if (level.modulus === 1) {
    options = [0, 1, 2];
  } else {
    options = [];
    for (let i = 0; i < level.modulus; i++) {
      options.push(i);
    }
  }

  const question = `${randomNumber} mod ${level.modulus} = ?`;
  return { question, correctAnswer, options };
}

function generateAdditionQuestion(level) {
  const a = Math.floor(Math.random() * level.modulus);
  const b = Math.floor(Math.random() * level.modulus);
  const correctAnswer = (a + b) % level.modulus;

  const options = [];
  for (let i = 0; i < level.modulus; i++) {
    options.push(i);
  }

  const question = `${a} + ${b} mod ${level.modulus} = ?`;
  return { question, correctAnswer, options };
}

function generateMultiplicationQuestion(level) {
  const a = Math.floor(Math.random() * level.modulus);
  const b = Math.floor(Math.random() * level.modulus);
  const correctAnswer = (a * b) % level.modulus;

  const options = [];
  for (let i = 0; i < level.modulus; i++) {
    options.push(i);
  }

  const question = `${a} × ${b} mod ${level.modulus} = ?`;
  return { question, correctAnswer, options };
}

// ---------- Answer Checking ----------
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

// ---------- Event Listeners ----------
nextLevelBtn.addEventListener("click", goToNextLevel);

freefallBtn.addEventListener("click", () => {
  if (!freefallBtn.disabled) {
    alert("Free Fall mode will be implemented soon!");
  }
});

// ---------- Start Game ----------
loadLevel();
