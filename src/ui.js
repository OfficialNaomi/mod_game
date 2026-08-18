// ---------- UI Updater ----------
const UI = {
  init() {
    this.hpBar = document.getElementById("hp-bar");
    this.hpText = document.getElementById("hp-text");
    this.xpBar = document.getElementById("xp-bar");
    this.xpText = document.getElementById("xp-text");
    this.levelDisplay = document.getElementById("level-display");
  },

  updateAll() {
    this.updateHP();
    this.updateXP();
    this.updateLevel();
  },

  updateHP() {
    const percent = (Player.hp / Player.maxHp) * 100;
    this.hpBar.style.width = `${percent}%`;
    this.hpText.textContent = `HP: ${Player.hp}/${Player.maxHp}`;
  },

  updateXP() {
    const percent = (Player.xp / Player.xpToNext) * 100;
    this.xpBar.style.width = `${percent}%`;
    this.xpText.textContent = `XP: ${Player.xp}/${Player.xpToNext}`;
  },

  updateLevel() {
    this.levelDisplay.textContent = `Level ${Player.level}`;
  }
};

UI.init();
