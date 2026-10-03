// ---------- UI Updater ----------
const UI = {
  init() {
    this.hpBar = document.getElementById("hp-bar");
    this.hpText = document.getElementById("hp-text");
    this.xpBar = document.getElementById("xp-bar");
    this.xpText = document.getElementById("xp-text");
    this.levelDisplay = document.getElementById("level-display");
    this.inventoryEl = document.getElementById("inventory-list");
    this.statsEl = document.getElementById("stats-display");
  },

  updateAll() {
    this.updateHP();
    this.updateXP();
    this.updateLevel();
    this.updateStats();
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
  },

  updateStats() {
    if (!this.statsEl) return;
    this.statsEl.innerHTML = `
      <span>⚔️ ATK ${Player.attack}</span>
      <span>🛡️ DEF ${Player.defense}</span>
    `;
  },

  renderInventory() {
    if (!this.inventoryEl) return;
    this.inventoryEl.innerHTML = "";

    // --- Equipped slots ---
    this.renderSection("Equipped", () => {
      const slots = [
        { key: "weapon",    label: "Weapon" },
        { key: "armor",     label: "Armor" },
        { key: "accessory", label: "Accessory" },
      ];

      slots.forEach(({ key, label }) => {
        const itemId = Inventory.equipped[key];
        const div = document.createElement("div");
        div.classList.add("equip-slot");

        if (itemId) {
          const item = ITEMS[itemId];
          div.classList.add("filled");
          div.innerHTML = `
            <span class="slot-label">${label}</span>
            <span class="item-name">${item.icon} ${item.name}</span>
          `;
          div.addEventListener("click", () => Inventory.unequip(key));
          div.title = "Click to unequip";
        } else {
          div.classList.add("empty");
          div.innerHTML = `<span class="slot-label">${label}</span><span class="item-name">— empty —</span>`;
        }

        this.inventoryEl.appendChild(div);
      });
    });

    // --- Group unequipped items by type ---
    const groups = [
      { type: "weapon",      label: "Weapons" },
      { type: "armor",       label: "Armor" },
      { type: "accessory",   label: "Accessories" },
      { type: "consumable",  label: "Potions" },
    ];

    groups.forEach(({ type, label }) => {
      const matching = Inventory.items.filter((id) => ITEMS[id] && ITEMS[id].type === type);
      if (matching.length === 0) return;

      this.renderSection(label, () => {
        matching.forEach((itemId) => {
          const item = ITEMS[itemId];
          const div = document.createElement("div");
          div.classList.add("inventory-item", item.type);
          div.innerHTML = `${item.icon} ${item.name}`;

          if (item.type === "consumable") {
            div.addEventListener("click", () => Inventory.use(itemId));
            div.title = "Click to use";
          } else {
            div.addEventListener("click", () => Inventory.equip(itemId));
            div.title = "Click to equip";
          }

          this.inventoryEl.appendChild(div);
        });
      });
    });
  },

  // Helper to insert a labeled section into the inventory list
  renderSection(title, buildFn) {
    const heading = document.createElement("div");
    heading.classList.add("inventory-section-heading");
    heading.textContent = title;
    this.inventoryEl.appendChild(heading);

    buildFn();
  }
};

UI.init();