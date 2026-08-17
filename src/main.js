// ---------- Level Definitions ----------
const levels = [
  {
    id: 1,
    name: "Mod 1",
    modulus: 1,
    operation: "simple",
    description: "Everything is 0",
    requiredCorrect: 3,
  },
  {
    id: 2,
    name: "Mod 2 Addition",
    modulus: 2,
    operation: "addition",
    description: "Parity, odd/even",
    requiredCorrect: 3,
  },
  // We'll add more later
];

// ---------- Game State ----------
let currentLevelIndex = 0;       // index in levels array
let unlockedLevelIndex = 0;      // highest unlocked index
let correctAnswersInLevel = 0;   // correct count for current level

// ---------- DOM Elements ----------
const staircaseEl = document.getElementById("staircase");
const levelInfoEl = document.getElementById("level-info");
const questionTextEl = document.getElementById("question-text");
const answerOptionsEl = document.getElementById("answer-options");
const feedbackEl = document.getElementById("feedback");
const nextLevelBtn = document.getElementById("next-level-btn");

// ---------- Level System Functions ----------
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

    step.textContent = level.name;
    staircaseEl.appendChild(step);
  });
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
}

function completeLevel() {
  if (currentLevelIndex < levels.length - 1) {
    unlockedLevelIndex = Math.max(unlockedLevelIndex, currentLevelIndex + 1);
    nextLevelBtn.style.display = "block";
  } else {
    // Last level? For now just show a message
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

  if (level.operation === "simple") {
    // Mod 1: any number mod 1 = 0
    const randomNumber = Math.floor(Math.random() * 20) + 1;
    question = `${randomNumber} mod ${level.modulus} = ?`;
    correctAnswer = randomNumber % level.modulus; // always 0
    // Options: 0, 1, 2
    options = [0, 1, 2];
  } else if (level.operation === "addition") {
    // For mod 2 addition, we'll implement later
    question = "Coming soon...";
    correctAnswer = 0;
    options = [0, 1];
  } else {
    question = "Not implemented yet.";
    correctAnswer = 0;
    options = [0];
  }

  // Shuffle options (except for simple always 0? still shuffle)
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
      // Wait a moment then new question
      setTimeout(generateQuestion, 800);
    }
  } else {
    feedbackEl.textContent = `Wrong. The answer is ${correct}.`;
    feedbackEl.style.color = "#f38ba8";
    // Reset correct count? For now, just give next question after delay
    setTimeout(generateQuestion, 1200);
  }
}

// ---------- Event Listeners ----------
nextLevelBtn.addEventListener("click", goToNextLevel);

// ---------- Start Game ----------
loadLevel();
