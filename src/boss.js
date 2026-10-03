// ---------- Boss Fight ----------
// Personality mechanics are stored in Boss.current.mechanic.
// Each mechanic is handled in attack() / generateQuestion().

const Boss = {
  current: null,
  hp: 0,
  currentMaxHp: 0,
  active: false,
  busy: false,

  // Personality trackers
  wrongAnswerCount: 0,
  correctAnswerCount: 0,
  stolenPotion: null,
  currentElement: null,
  shuffleTurnsLeft: 0,
  storedAttack: 0,
  storedDefense: 0,

  // Split slime tracker
  splitSlime: false,

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
    this.current.bossKey = bossKey;
    this.currentMaxHp = def.maxHp;
    this.hp = def.maxHp;

    this.active = true;
    this.busy = false;
    this.wrongAnswerCount = 0;
    this.correctAnswerCount = 0;
    this.stolenPotion = null;
    this.currentElement = def.element === "multi" ? "fire" : def.element;
    this.shuffleTurnsLeft = 0;
    this.storedAttack = 0;
    this.storedDefense = 0;
    this.splitSlime = false;

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
    const percent = (this.hp / this.currentMaxHp) * 100;
    this.hpBar.style.width = `${percent}%`;
    this.hpText.textContent = `HP: ${this.hp}/${this.currentMaxHp}`;
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
      this.handleCorrectAnswer();
    } else {
      this.handleWrongAnswer(correct);
    }
  },

  // ---------- Correct answer ----------
  handleCorrectAnswer() {
    const mech = this.current.mechanic;

    // Evasive wraith: 25% chance to miss
    if (mech === "evasive" && Math.random() < 0.25) {
      this.feedbackEl.textContent = "The wraith flickers — your attack passes through!";
      this.feedbackEl.style.color = "#89dceb";
      setTimeout(() => this.generateQuestion(), 1000);
      return;
    }

    let damage = Player.attack + 5;
    this.hp = Math.max(0, this.hp - damage);
    this.correctAnswerCount++;

    let msg = `Hit! You dealt ${damage} damage.`;

    // Stone Troll regenerates on your correct answer
    if (mech === "regenOnCorrect" && this.hp > 0) {
      this.hp = Math.min(this.currentMaxHp, this.hp + 5);
      msg += " The troll regenerates 5 HP!";
    }

    // Shuffle stats countdown
    if (this.shuffleTurnsLeft > 0) {
      this.shuffleTurnsLeft--;
      if (this.shuffleTurnsLeft === 0) {
        Player.attack = this.storedAttack;
        Player.defense = this.storedDefense;
        UI.updateStats();
        msg += " Your stats return to normal.";
      }
    }

    this.feedbackEl.textContent = msg;
    this.feedbackEl.style.color = "#a6e3a1";
    this.updateBossUI();
    this.updatePlayerUI();

    Player.gainXP(15);
    UI.updateXP();
    UI.updateLevel();

    // Green Slime: split at 50% HP and swallow a potion
    if (
      mech === "split" &&
      !this.splitSlime &&
      this.hp <= this.currentMaxHp / 2 &&
      this.hp > 0
    ) {
      this.splitSlime = true;
      this.artEl.textContent = "🟢🟢";

      let splitMsg = "The slime splits into two smaller slimes!";

      // Eat a potion only if the player has one
      const potionId = Inventory.items.find((id) => {
        const item = ITEMS[id];
        return item && item.type === "consumable" && item.heal;
      });

      if (potionId) {
        const item = ITEMS[potionId];
        const idx = Inventory.items.indexOf(potionId);
        if (idx !== -1) Inventory.items.splice(idx, 1);
        UI.renderInventory();

        this.hp = Math.min(this.currentMaxHp, this.hp + item.heal);
        splitMsg += ` It swallows your ${item.name} and regenerates ${item.heal} HP!`;
      }

      this.feedbackEl.textContent = splitMsg;
      this.feedbackEl.style.color = "#a6e3a1";
      this.updateBossUI();
      setTimeout(() => this.generateQuestion(), 1500);
      return;
    }

    if (this.hp <= 0) {
      this.win();
      return;
    }

    setTimeout(() => this.generateQuestion(), 900);
  },

  // ---------- Wrong answer ----------
  handleWrongAnswer(correct) {
    this.wrongAnswerCount++;

    const mech = this.current.mechanic;
    let bossDamage = this.current.attack;
    let element = this.current.element;
    let msg = `Wrong! Answer was ${correct}. `;

    // Bandit: targets strong
    if (mech === "targetStrong" && Player.hp > Player.maxHp * 0.7) {
      bossDamage = Math.floor(bossDamage * 1.5);
      msg += "The chief strikes hardest at the healthy! ";
    }

    // Ogre: slam every 3rd wrong
    if (mech === "slamEveryThird" && this.wrongAnswerCount % 3 === 0) {
      bossDamage *= 2;
      msg += "SLAM! ";
    }

    // Wolf: double attack
    if (mech === "doubleAttack") {
      bossDamage *= 2;
      msg += "The wolf strikes twice! ";
    }

    // Titan: attacks only every other wrong
    if (mech === "slowAttacker" && this.wrongAnswerCount % 2 === 0) {
      bossDamage = 0;
      msg += "The titan is too slow to hit you. ";
    }

    // Dragon: fire flavor
    if (mech === "elementalHit" && element === "fire") {
      msg += "Burning flames! ";
    }

    // Demon Lord: rotate element
    if (mech === "rotateElement") {
      const elements = ["fire", "poison", "thunder"];
      this.currentElement = elements[this.wrongAnswerCount % elements.length];
      element = this.currentElement;
      msg += `The demon attacks with ${element}! `;
    }

    // Lich: drain 5 extra HP
    if (mech === "drain") {
      Player.takeDamage(5);
      msg += "The lich drains your life! ";
    }

    // Goblin: steal a potion
    if (mech === "steal" && !this.stolenPotion) {
      const potionId = Inventory.items.find((id) => {
        const item = ITEMS[id];
        return item && item.type === "consumable" && item.heal;
      });
      if (potionId) {
        this.stolenPotion = potionId;
        const idx = Inventory.items.indexOf(potionId);
        if (idx !== -1) Inventory.items.splice(idx, 1);
        UI.renderInventory();
        msg += `The goblin steals your ${ITEMS[potionId].name}! `;
      }
    }

    // Ancient One: shuffle stats
    if (mech === "shuffleStats" && this.shuffleTurnsLeft === 0) {
      this.storedAttack = Player.attack;
      this.storedDefense = Player.defense;
      const temp = Player.attack;
      Player.attack = Player.defense;
      Player.defense = temp;
      this.shuffleTurnsLeft = 2;
      UI.updateStats();
      msg += "Your attack and defense swap! ";
    }

    // Apply damage with element + ward handling
    if (bossDamage > 0) {
      Player.takeDamage(bossDamage, element);
      msg += `Boss hits for ${bossDamage}.`;
    }

    this.feedbackEl.textContent = msg;
    this.feedbackEl.style.color = "#f38ba8";
    this.updatePlayerUI();
    UI.updateHP();

    if (Player.hp <= 0) {
      this.lose();
      return;
    }

    setTimeout(() => this.generateQuestion(), 1400);
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

    if (this.current.mechanic === "steal" && this.stolenPotion) {
      Inventory.add(this.stolenPotion);
      this.stolenPotion = null;
    }

    if (this.shuffleTurnsLeft > 0) {
      Player.attack = this.storedAttack;
      Player.defense = this.storedDefense;
      UI.updateStats();
      this.shuffleTurnsLeft = 0;
    }

    const rewardId = this.current.reward;
    if (rewardId && ITEMS[rewardId]) {
      Inventory.add(rewardId);
      this.feedbackEl.textContent = `🏆 Victory! You found: ${ITEMS[rewardId].icon} ${ITEMS[rewardId].name}!`;
    } else {
      this.feedbackEl.textContent = "🏆 Victory!";
    }
    this.feedbackEl.style.color = "#f9e2af";

    Player.clearWards();

    if (this.current.bossKey === "final") {
      freeFallUnlocked = true;
    }

    setTimeout(() => this.returnToStairs(), 2000);
  },

  lose() {
    this.active = false;
    this.answerOptionsEl.innerHTML = "";

    if (this.shuffleTurnsLeft > 0) {
      Player.attack = this.storedAttack;
      Player.defense = this.storedDefense;
      UI.updateStats();
      this.shuffleTurnsLeft = 0;
    }

    this.feedbackEl.textContent = "💀 You were defeated. Returning to the stairs at full HP...";
    this.feedbackEl.style.color = "#f38ba8";

    Player.hp = Player.maxHp;
    Player.clearWards();
    UI.updateHP();

    setTimeout(() => this.returnToStairs(), 2000);
  },

  flee() {
    if (!this.active) return;
    this.active = false;

    if (this.shuffleTurnsLeft > 0) {
      Player.attack = this.storedAttack;
      Player.defense = this.storedDefense;
      UI.updateStats();
      this.shuffleTurnsLeft = 0;
    }

    Player.clearWards();
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