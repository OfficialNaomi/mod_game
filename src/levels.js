// ---------- Flight Definitions ----------
const FLIGHTS = [];

function createFlight(modulus, stepCount, stepFactory) {
  const steps = [];
  for (let i = 0; i < stepCount; i++) {
    steps.push(stepFactory(i));
  }
  FLIGHTS.push({ modulus, steps });
}

// ---------- Tiered Reward Pools ----------
// Each tier corresponds to a stage of the descent.
// The actual item is picked at drop time so duplicates can be filtered.

const REWARD_TIERS = [
  // Tier 1: flights 1-5
  {
    maxMod: 5,
    items: ["wooden_sword", "leather_armor", "small_potion"],
  },
  // Tier 2: flights 6-10
  {
    maxMod: 10,
    items: ["iron_sword", "chainmail", "small_potion", "lucky_ring"],
  },
  // Tier 3: flights 11-20
  {
    maxMod: 20,
    items: ["steel_sword", "plate_armor", "big_potion", "scholar_amulet"],
  },
  // Tier 4: flights 21-40
  {
    maxMod: 40,
    items: ["flame_blade", "dragon_scale", "big_potion", "time_pendant"],
  },
  // Tier 5: flights 41+
  {
    maxMod: Infinity,
    items: ["mod_master_blade", "dragon_scale", "big_potion", "time_pendant"],
  },
];

function getTierForMod(mod) {
  for (const tier of REWARD_TIERS) {
    if (mod <= tier.maxMod) return tier;
  }
  return REWARD_TIERS[REWARD_TIERS.length - 1];
}

function attachReward(step, i, mod) {
  if ((i + 1) % 5 === 0) {
    // Guarantee the very first drop is a wooden sword
    if (mod === 1 && i === 4) {
      step.reward = "wooden_sword";
    } else {
      step.rewardTier = getTierForMod(mod);
    }
  }
  return step;
}

// ---------- Mod 1: 5 steps ----------
createFlight(1, 5, (i) => {
  let step;
  switch (i) {
    case 0:
      step = { operation: "constantZero", label: "0", description: "Zero" };
      break;
    case 1:
      step = { operation: "simple", label: "Random Number", description: "Any number mod 1", range: [1, 30] };
      break;
    case 2:
      step = { operation: "addition", label: "Addition", description: "Addition mod 1" };
      break;
    case 3:
      step = { operation: "multiplication", label: "Multiplication", description: "Multiplication mod 1" };
      break;
    case 4:
      step = { operation: "mixed", label: "Mixed", description: "Addition & multiplication" };
      break;
    default:
      step = { operation: "simple", label: `Step ${i+1}`, description: "Simple" };
  }
  return attachReward(step, i, 1);
});

// ---------- Mod 2: 10 steps ----------
const mod2StepDefs = [
  { operation: "simple", label: "Simple Small", range: [1, 20] },
  { operation: "simple", label: "Simple Large", range: [21, 100] },
  { operation: "addition", label: "Addition", range: [0, 5] },
  { operation: "additionChain", label: "Addition Chain", range: [0, 5] },
  { operation: "multiplication", label: "Multiplication", range: [0, 5] },
  { operation: "multiplicationChain", label: "Multiplication Chain", range: [0, 5] },
  { operation: "mixed", label: "Mixed", range: [0, 5] },
  { operation: "addition", label: "Addition Large", range: [0, 10] },
  { operation: "multiplication", label: "Multiplication Large", range: [0, 10] },
  { operation: "mixedChain", label: "Mixed Chain", range: [0, 5] },
];

createFlight(2, 10, (i) => {
  const step = { ...mod2StepDefs[i], description: mod2StepDefs[i].label };
  return attachReward(step, i, 2);
});

// ---------- Progressive flight generator for mods 3+ ----------
function createProgressiveFlight(modulus, stepCount = 15) {
  const operations = [
    "simple", "addition", "additionChain", "multiplication", "multiplicationChain",
    "mixed", "mixedChain", "simple", "addition", "additionChain",
    "multiplication", "multiplicationChain", "mixed", "mixedChain", "simple"
  ];

  const labels = [
    "Simple 1", "Addition 1", "Addition Chain 1", "Multiplication 1", "Multiplication Chain 1",
    "Mixed 1", "Mixed Chain 1", "Simple 2", "Addition 2", "Addition Chain 2",
    "Multiplication 2", "Multiplication Chain 2", "Mixed 2", "Mixed Chain 2", "Simple 3"
  ];

  createFlight(modulus, stepCount, (i) => {
    const op = operations[i % operations.length];
    const difficulty = i / (stepCount - 1);

    let range;

    if (op === "simple") {
      if (difficulty < 0.3) {
        range = [1, Math.max(2, Math.floor(modulus * 0.5))];
      } else if (difficulty < 0.6) {
        range = [1, modulus - 1];
      } else {
        range = [modulus, Math.floor(modulus * 2)];
      }
    } else if (op === "addition" || op === "additionChain") {
      const maxOperand = Math.max(2, Math.floor(modulus * (0.2 + difficulty * 0.8)));
      range = [0, maxOperand];
    } else {
      const maxOperand = Math.max(2, Math.floor(modulus * (0.15 + difficulty * 0.45)));
      range = [0, maxOperand];
    }

    const step = {
      operation: op,
      label: labels[i],
      description: labels[i],
      range,
    };

    return attachReward(step, i, modulus);
  });
}

// ---------- Mods 3-10: 15 steps each ----------
for (let m = 3; m <= 10; m++) {
  createProgressiveFlight(m, 15);
}

// ---------- Mods 11-60: 15 steps each ----------
for (let m = 11; m <= 60; m++) {
  createProgressiveFlight(m, 15);
}

// ---------- Bonus flights: 10 steps each ----------
function createBonusFlight(modulus) {
  const operations = [
    "simple", "addition", "multiplication", "mixed", "simple",
    "additionChain", "multiplicationChain", "mixedChain", "addition", "multiplication"
  ];
  const labels = [
    "Simple 1", "Addition", "Multiplication", "Mixed 1", "Simple 2",
    "Addition Chain", "Multiplication Chain", "Mixed Chain", "Addition 2", "Multiplication 2"
  ];

  createFlight(modulus, 10, (i) => {
    const difficulty = i / 9;
    const op = operations[i];
    let range;

    if (op === "simple") {
      if (difficulty < 0.3) {
        range = [1, Math.max(2, Math.floor(modulus * 0.3))];
      } else if (difficulty < 0.7) {
        range = [1, modulus - 1];
      } else {
        range = [modulus, Math.floor(modulus * 1.5)];
      }
    } else if (op === "addition" || op === "additionChain") {
      range = [0, Math.max(2, Math.floor(modulus * (0.2 + difficulty * 0.6)))];
    } else {
      range = [0, Math.max(2, Math.floor(modulus * (0.15 + difficulty * 0.4)))];
    }

    const step = {
      operation: op,
      label: labels[i],
      description: labels[i],
      range,
    };

    return attachReward(step, i, modulus);
  });
}

createBonusFlight(100);
createBonusFlight(360);
createBonusFlight(365);
createBonusFlight(1000);
createBonusFlight(1024);