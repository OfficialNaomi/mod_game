// ---------- Boss Fight ----------

const Boss = {
  current: null,
  hp: 0,
  active: false,
  busy: false,

  panel: null,
  nameEl: null,
  hpBar: null,
  hpText: null,
  artEl: null,
  questionTextEl: null,
  answerOptionsEl: null,
  feedbackEl: null,
  playerHpEl: null,
  playerAtkEl: null,
  playerDefEl: null,
  potionBtn: null,
  fleeBtn: null,

  init() {
    this.panel = document.getElementById("boss-panel");
    this.nameEl = document.getElementById("boss-name");
    this.hpBar = document.getElementById("boss-hp-bar");
    this.hpText = document.getElementById("boss-hp-text");
    this.artEl = document.getElementById("boss-art");
    this.questionTextEl = document.getElementById("boss-question-text");
    this.answerOptionsEl = document.getElementById("boss-answer-options");
    this.feedbackEl = document.getElementById("boss-feedback");
    this.playerHpEl = document.getElementById("boss-player-hp");
    this.playerAtkEl = document.getElementById("boss-player-atk");
    this.playerDefEl = document.getElementById("boss-player-def");
    this.potionBtn = document.getElementById("boss-potion-btn");
    this.fleeBtn = document.getElementById("boss-flee-btn");

    this.potionBtn.addEventListener("click", () => this.usePotion());
    this.fleeBtn.addEventListener("click", () => this.flee());
  },

  start(bossKey) {
    const def = BOSSES[bossKey];
    if (!def) return;

    this.current = def;
    this.hp = def.maxHp;
    this.active = true;
    this.busy = false;

    document.getElementById("staircase-container").style.display = "none";
    this.panel.style.display = "block";

    this.nameEl.textContent = def.name;
    this.artEl.textContent = def.art;
    this.feedbackEl.textContent = def.intro;
    this.feedbackEl.style.color = "#f9e2af";

    this.updateBossUI();
    this.updatePlayerUI();

    setTimeout(() => this.generateQuestion(), 1500);
  },

  updateBossUI() {
    const percent = (this.hp / this.current.maxHp) * 100;
    this.hpBar.style.width = `${percent}%`;
    this.hpText.textContent = `HP: ${this.hp}/${this.current.maxHp}`;
  },

  updatePlayerUI() {
    this.playerHpEl.textContent = `Your HP: ${Player.hp}/${Player.maxHp}`;
    this.playerAtkEl.textContent = `ATK: ${Player.attack}`;
    this.playerDefEl.textContent = `DEF: ${Player.defense}`;

    const hasPotion = Inventory.items.some((id) => {
      const item = ITEMS[id];
      return item && item.type === "consumable" && item.heal;
    });
    this.potionBtn.disabled = !hasPotion;
  },

  generateQuestion() {
    if (!this.active) return;

    // Pick a modulus from the ones this boss draws from
    const modPool = this.current.modRange;
    const mod = modPool[Math.floor(Math.random() * modPool.length)];

    const operations = ["simple", "addition", "multiplication"];
    const op = operations[Math.floor(Math.random() * operations.length)];

    let question = "";
    let correctAnswer = 0;

    switch (op) {
      case "simple": {
        const x = randInt(1, Math.max(20, mod * 2));
        question = `${x} mod ${mod} = ?`;
        correctAnswer = x % mod;
        break;
      }
      case "addition": {
        const maxOperand = Math.max(5, Math.min(20, mod - 1));
        const a = randInt(0, maxOperand);
        const b = randInt(0, maxOperand);
        question = `${a} + ${b} mod ${mod} = ?`;
        correctAnswer = (a + b) % mod;
        break;
      }
      case "multiplication": {
        const maxOperand = Math.max(3, Math.min(12, mod - 1));
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
    this.busy = false;

    options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.addEventListener("click", () => this.attack(option, correctAnswer));
      this.answerOptionsEl.appendChild(button);
    });
  },

  attack(selected, correct) {
    if (!this.active || this.busy) return;
    this.busy = true;

    if (selected === correct) {
      const damage = Player.attack + 5;
      this.hp = Math.max(0, this.hp - damage);
      this.feedbackEl.textContent = `Hit! You dealt ${damage} damage.`;
      this.feedbackEl.style.color = "#a6e3a1";
      this.updateBossUI();

      Player.gainXP(15);
      UI.updateXP();
      UI.updateLevel();

      if (this.hp <= 0) {
        this.win();
        return;
      }

      setTimeout(() => this.generateQuestion(), 900);
    } else {
      const bossDamage = this.current.attack;
      Player.takeDamage(bossDamage);
      this.feedbackEl.textContent = `Wrong! Answer was ${correct}. Boss hits for ${bossDamage}.`;
      this.feedbackEl.style.color = "#f38ba8";
      this.updatePlayerUI();
      UI.updateHP();

      if (Player.hp <= 0) {
        this.lose();
        return;
      }

      setTimeout(() => this.generateQuestion(), 1200);
    }
  },

  usePotion() {
    if (!this.active) return;

    const potionId = Inventory.items.find((id) => {
      const item = ITEMS[id];
      return item && item.type === "consumable" && item.heal;
    });

    if (!potionId) return;

    Inventory.use(potionId);
    this.feedbackEl.textContent = `You used a ${ITEMS[potionId].name} and healed!`;
    this.feedbackEl.style.color = "#a6e3a1";
    this.updatePlayerUI();
    UI.updateHP();
  },

  win() {
    this.active = false;
    this.answerOptionsEl.innerHTML = "";

    const rewardId = this.current.reward;
    if (rewardId && ITEMS[rewardId]) {
      Inventory.add(rewardId);
      this.feedbackEl.textContent = `🏆 Victory! You found: ${ITEMS[rewardId].icon} ${ITEMS[rewardId].name}!`;
    } else {
      this.feedbackEl.textContent = "🏆 Victory!";
    }
    this.feedbackEl.style.color = "#f9e2af";

    // If this was the final boss, unlock Free Fall
    if (this.current === BOSSES.final) {
      freeFallUnlocked = true;
    }

    setTimeout(() => this.returnToStairs(), 2000);
  },

  lose() {
    this.active = false;
    this.answerOptionsEl.innerHTML = "";
    this.feedbackEl.textContent = "💀 You were defeated. Returning to the stairs at full HP...";
    this.feedbackEl.style.color = "#f38ba8";

    Player.hp = Player.maxHp;
    UI.updateHP();

    setTimeout(() => this.returnToStairs(), 2000);
  },

  flee() {
    if (!this.active) return;
    this.active = false;
    this.returnToStairs();
  },

  returnToStairs() {
    this.panel.style.display = "none";
    document.getElementById("staircase-container").style.display = "flex";

    if (typeof bossFinished === "function") {
      bossFinished();
    }
  }
};

Boss.init();