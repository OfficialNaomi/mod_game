// ---------- Player State ----------
const Player = {
  baseMaxHp: 100,
  maxHp: 100,
  hp: 100,
  xp: 0,
  xpToNext: 50,
  level: 1,

  attack: 0,
  defense: 0,

  takeDamage(amount = 10) {
    const actual = Math.max(1, amount - this.defense);
    this.hp = Math.max(0, this.hp - actual);

    if (this.hp <= 0) {
      this.handleDeath();
      return true;
    }
    return false;
  },

  gainXP(amount = 10) {
    const bonus = Inventory.getBonus("xpBonus");
    this.xp += amount + bonus;

    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.2);
    }
  },

  recalculateStats() {
    this.attack = Inventory.getBonus("attack");
    this.defense = Inventory.getBonus("defense");
    this.maxHp = this.baseMaxHp + Inventory.getBonus("maxHp");

    if (this.hp > this.maxHp) this.hp = this.maxHp;
  },

  handleDeath() {
    alert("Game Over! You fell. Restarting from full HP.");
    this.hp = this.maxHp;
    this.xp = 0;
    this.level = 1;
    this.xpToNext = 50;
  },

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  },

  reset() {
    this.hp = this.maxHp;
    this.xp = 0;
    this.xpToNext = 50;
    this.level = 1;
  }
};