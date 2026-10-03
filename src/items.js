// ---------- Item Definitions ----------
const ITEMS = {
  // Weapons
  wooden_sword:     { name: "Wooden Sword",     type: "weapon", attack: 2,  icon: "🗡️" },
  iron_sword:       { name: "Iron Sword",       type: "weapon", attack: 5,  icon: "⚔️" },
  steel_sword:      { name: "Steel Sword",      type: "weapon", attack: 9,  icon: "🗡️" },
  flame_blade:      { name: "Flame Blade",      type: "weapon", attack: 14, icon: "🔥" },
  mod_master_blade: { name: "Mod Master Blade", type: "weapon", attack: 20, icon: "✨" },

  // Armor
  leather_armor:  { name: "Leather Armor",  type: "armor", defense: 2,  icon: "🥋" },
  chainmail:      { name: "Chainmail",      type: "armor", defense: 5,  icon: "🛡️" },
  plate_armor:    { name: "Plate Armor",    type: "armor", defense: 9,  icon: "🛡️" },
  dragon_scale:   { name: "Dragon Scale",   type: "armor", defense: 14, icon: "🐉" },

  // Accessories
  lucky_ring:     { name: "Lucky Ring",     type: "accessory", xpBonus: 5,   icon: "💍" },
  scholar_amulet: { name: "Scholar Amulet", type: "accessory", xpBonus: 10,  icon: "📿" },
  time_pendant:   { name: "Time Pendant",   type: "accessory", timeBonus: 5, icon: "⏳" },

  // Consumables — Healing
  small_potion:   { name: "Small Potion", type: "consumable", heal: 20, icon: "🧪" },
  big_potion:     { name: "Big Potion",   type: "consumable", heal: 50, icon: "⚗️" },

  // Consumables — XP
  xp_vial:        { name: "XP Vial", type: "consumable", xp: 30, icon: "📘" },
  xp_tome:        { name: "XP Tome", type: "consumable", xp: 80, icon: "📗" },

  // Consumables — Wards (elemental resistance for the next boss fight)
  fire_ward:      { name: "Fire Ward",    type: "consumable", ward: "fire",    icon: "🔥" },
  ice_ward:       { name: "Ice Ward",     type: "consumable", ward: "ice",     icon: "❄️" },
  poison_ward:    { name: "Poison Ward",  type: "consumable", ward: "poison",  icon: "☠️" },
  thunder_ward:   { name: "Thunder Ward", type: "consumable", ward: "thunder", icon: "⚡" },
};

// ---------- Inventory ----------
const Inventory = {
  items: [],
  equipped: {
    weapon: null,
    armor: null,
    accessory: null,
  },

  add(itemId) {
    if (!ITEMS[itemId]) return;
    this.items.push(itemId);
    UI.renderInventory();
  },

  equip(itemId) {
    const item = ITEMS[itemId];
    if (!item) return;

    if (item.type === "consumable") {
      this.use(itemId);
      return;
    }

    this.equipped[item.type] = itemId;
    UI.renderInventory();
    Player.recalculateStats();
    UI.updateAll();
  },

  unequip(slot) {
    this.equipped[slot] = null;
    UI.renderInventory();
    Player.recalculateStats();
    UI.updateAll();
  },

  use(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.type !== "consumable") return;

    // Healing
    if (item.heal) {
      Player.heal(item.heal);
    }

    // XP
    if (item.xp) {
      Player.gainXP(item.xp);
    }

    // Ward (elemental resistance)
    if (item.ward) {
      Player.wards[item.ward] = true;
    }

    // Remove one from inventory
    const idx = this.items.indexOf(itemId);
    if (idx !== -1) this.items.splice(idx, 1);

    UI.renderInventory();
    UI.updateAll();
  },

  getBonus(stat) {
    let total = 0;
    for (const slot in this.equipped) {
      const itemId = this.equipped[slot];
      if (itemId && ITEMS[itemId][stat]) {
        total += ITEMS[itemId][stat];
      }
    }
    return total;
  }
};