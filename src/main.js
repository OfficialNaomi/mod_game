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
const stepAngle = 360 / levels.length; // angle between steps
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

  // Rotate the whole staircase so the current level is at the front (bottom)
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

  // Update Free Fall button state
  freefallBtn.disabled = currentLevelIndex < 9; // unlock after level 10 (index 9)
  freefallBtn.title = currentLevelIndex < 9 ? "Unlocks after level 10" : "Start Free Fall";
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

  if (level.operation === "simple") {
    const randomNumber = Math.floor(Math.random() * 20) + 1;
    question = `${randomNumber} mod ${level.modulus} = ?`;
    correctAnswer = randomNumber % level.modulus; // always 0
    options = [0, 1, 2];
  } else if (level.operation === "addition") {
    // Temporary simple mod 2 addition
    const a = Math.floor(Math.random() * 2);
    const b = Math.floor(Math.random() * 2);
    question = `${a} + ${b} mod 2 = ?`;
    correctAnswer = (a + b) % 2;
    options = [0, 1];
  } else {
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

// Placeholder for Free Fall
freefallBtn.addEventListener("click", () => {
  if (!freefallBtn.disabled) {
    alert("Free Fall mode will be implemented soon!");
  }
});

// ---------- Start Game ----------
loadLevel();
