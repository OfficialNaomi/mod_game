// ---------- Free Fall Mode ----------

const FreeFall = {
  score: 0,
  timeLeft: 30,
  timerInterval: null,
  unlockedMods: [],
  active: false,

  panel: null,
  timerEl: null,
  scoreEl: null,
  questionTextEl: null,
  answerOptionsEl: null,
  feedbackEl: null,
  exitBtn: null,
  retryBtn: null,

  init() {
    this.panel = document.getElementById("freefall-panel");
    this.timerEl = document.getElementById("freefall-timer");
    this.scoreEl = document.getElementById("freefall-score");
    this.questionTextEl = document.getElementById("freefall-question-text");
    this.answerOptionsEl = document.getElementById("freefall-answer-options");
    this.feedbackEl = document.getElementById("freefall-feedback");
    this.exitBtn = document.getElementById("freefall-exit-btn");
    this.retryBtn = document.getElementById("freefall-retry-btn");

    this.exitBtn.addEventListener("click", () => this.exit());
    this.retryBtn.addEventListener("click", () => this.retry());
  },

  start(unlockedMods) {
    // Clear any existing timer first
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.score = 0;
    this.timeLeft = 30;
    this.unlockedMods = unlockedMods;
    this.active = true;

    document.getElementById("staircase-container").style.display = "none";
    this.panel.style.display = "block";
    this.retryBtn.style.display = "none";

    this.updateUI();
    this.generateQuestion();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateUI();

      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  },

  end() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.active = false;

    this.feedbackEl.textContent = `Time's up! Final score: ${this.score}`;
    this.feedbackEl.style.color = "#f9e2af";
    this.retryBtn.style.display = "inline-block";
  },

  retry() {
    // Start a new run with the same unlocked mods
    this.start(this.unlockedMods);
  },

  exit() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.active = false;

    document.getElementById("staircase-container").style.display = "flex";
    this.panel.style.display = "none";
    this.retryBtn.style.display = "none";

    if (typeof loadStep === "function") {
      loadStep();
    }
  },

  updateUI() {
    this.timerEl.textContent = this.timeLeft;
    this.scoreEl.textContent = `Score: ${this.score}`;
  },

  generateQuestion() {
    if (!this.active) return;

    const mod = this.unlockedMods[
      Math.floor(Math.random() * this.unlockedMods.length)
    ];

    const operations = ["simple", "addition", "multiplication"];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let question = "";
    let correctAnswer = 0;

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

    const options = makeOptions(mod, correctAnswer).sort(() => Math.random() - 0.5);

    this.questionTextEl.textContent = question;
    this.answerOptionsEl.innerHTML = "";
    this.feedbackEl.textContent = "";

    options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.addEventListener("click", () => this.checkAnswer(option, correctAnswer));
      this.answerOptionsEl.appendChild(button);
    });
  },

  checkAnswer(selected, correct) {
    if (!this.active) return;

    if (selected === correct) {
      this.score++;
      this.updateUI();
      this.feedbackEl.textContent = "Correct!";
      this.feedbackEl.style.color = "#a6e3a1";
      this.generateQuestion();
    } else {
      this.feedbackEl.textContent = `Wrong. Answer: ${correct}`;
      this.feedbackEl.style.color = "#f38ba8";
      setTimeout(() => this.generateQuestion(), 800);
    }
  }
};

FreeFall.init();
