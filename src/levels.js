// ---------- Flight Definitions ----------
// Each flight is a modulus with its own stair steps.
// Steps define the operation, label, and range for the question generator.

const FLIGHTS = [];

function createFlight(modulus, stepCount, stepFactory) {
  const steps = [];
  for (let i = 0; i < stepCount; i++) {
    steps.push(stepFactory(i));
  }
  FLIGHTS.push({ modulus, steps });
}

// ---------- Mod 1: 5 steps ----------
createFlight(1, 5, (i) => {
  switch (i) {
    case 0:
      return { operation: "constantZero", label: "0", description: "Zero" };
    case 1:
      return { operation: "simple", label: "Random Number", description: "Any number mod 1", range: [1, 30] };
    case 2:
      return { operation: "addition", label: "Addition", description: "Addition mod 1" };
    case 3:
      return { operation: "multiplication", label: "Multiplication", description: "Multiplication mod 1" };
    case 4:
      return { operation: "mixed", label: "Mixed", description: "Addition & multiplication" };
    default:
      return { operation: "simple", label: `Step ${i+1}`, description: "Simple" };
  }
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

createFlight(2, 10, (i) => ({
  ...mod2StepDefs[i],
  description: mod2StepDefs[i].label,
}));

// ---------- Progressive flight generator for mods 3+ ----------
function createProgressiveFlight(modulus, stepCount = 15) {
  // Operation pattern (repeats every 5 steps, then shifts for variety)
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
    const difficulty = i / (stepCount - 1); // 0 to 1

    let range;

    // Simple: start below modulus, later go above to force wrap
    if (op === "simple") {
      if (difficulty < 0.3) {
        range = [1, Math.max(2, Math.floor(modulus * 0.5))];
      } else if (difficulty < 0.6) {
        range = [1, modulus - 1];
      } else {
        range = [modulus, Math.floor(modulus * 2)];
      }
    }
    // Addition / addition chains: operands grow from small to near modulus
    else if (op === "addition" || op === "additionChain") {
      const maxOperand = Math.max(2, Math.floor(modulus * (0.2 + difficulty * 0.8)));
      range = [0, maxOperand];
    }
    // Multiplication / mixed: keep operands smaller, but grow slightly
    else {
      const maxOperand = Math.max(2, Math.floor(modulus * (0.15 + difficulty * 0.45)));
      range = [0, maxOperand];
    }

    return {
      operation: op,
      label: labels[i],
      description: labels[i],
      range,
    };
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

// ---------- Bonus flights: 10 steps each (same progressive idea) ----------
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
    const difficulty = i / 9; // 0 to 1
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

    return {
      operation: op,
      label: labels[i],
      description: labels[i],
      range,
    };
  });
}

createBonusFlight(100);
createBonusFlight(360);
createBonusFlight(365);
createBonusFlight(1000);
createBonusFlight(1024);
