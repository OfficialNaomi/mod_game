// ---------- Player State ----------
const Player = {
  maxHp: 100,
  hp: 100,
  xp: 0,
  xpToNext: 50,
  level: 1,

  // Reduce HP by amount, return true if dead
  takeDamage(amount = 10) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.handleDeath();
      return true;
    }
    return false;
  },

  // Add XP, handle level up
  gainXP(amount = 10) {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      // Increase XP needed for next level (optional)
      this.xpToNext = Math.floor(this.xpToNext * 1.2);
    }
  },

  // Reset HP after death
  handleDeath() {
    alert("Game Over! You fell. Restarting from full HP.");
    this.hp = this.maxHp;
    this.xp = 0;
    this.level = 1;
    this.xpToNext = 50;
  },

  // Heal (for future potions)
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
