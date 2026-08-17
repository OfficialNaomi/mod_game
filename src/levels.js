// ---------- Flight Definitions ----------
// Each flight is a modulus with its own stair steps.
// Steps define the operation and label for the question generator.

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
  { operation: "addition", label: "Addition" },
  { operation: "additionChain", label: "Addition Chain" },
  { operation: "multiplication", label: "Multiplication" },
  { operation: "multiplicationChain", label: "Multiplication Chain" },
  { operation: "mixed", label: "Mixed" },
  { operation: "addition", label: "Addition Large", range: [0, 10] },
  { operation: "multiplication", label: "Multiplication Large", range: [0, 10] },
  { operation: "mixedChain", label: "Mixed Chain" },
];

createFlight(2, 10, (i) => ({
  ...mod2StepDefs[i],
  description: mod2StepDefs[i].label,
}));

// ---------- Mod 3: 15 steps ----------
const mod3Operations = [
  "simple", "addition", "additionChain", "multiplication", "multiplicationChain",
  "mixed", "mixedChain", "simple", "addition", "additionChain",
  "multiplication", "multiplicationChain", "mixed", "mixedChain", "simple"
];

const mod3Labels = [
  "Simple 1", "Addition 1", "Addition Chain 1", "Multiplication 1", "Multiplication Chain 1",
  "Mixed 1", "Mixed Chain 1", "Simple 2", "Addition 2", "Addition Chain 2",
  "Multiplication 2", "Multiplication Chain 2", "Mixed 2", "Mixed Chain 2", "Simple 3"
];

createFlight(3, 15, (i) => ({
  operation: mod3Operations[i],
  label: mod3Labels[i],
  description: mod3Labels[i],
  range: mod3Operations[i].includes("Chain") ? [0, 5] : [0, 3],
}));

// ---------- Helper to create standard 15-step flights ----------
function createStandardFlight(modulus) {
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

  createFlight(modulus, 15, (i) => ({
    operation: operations[i],
    label: labels[i],
    description: labels[i],
    range: operations[i].includes("Chain") ? [0, 8] : [0, 5],
  }));
}

// ---------- Mods 4-10: 15 steps each ----------
for (let m = 4; m <= 10; m++) {
  createStandardFlight(m);
}

// ---------- Mods 11-60: 15 steps each ----------
for (let m = 11; m <= 60; m++) {
  createStandardFlight(m);
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

  createFlight(modulus, 10, (i) => ({
    operation: operations[i],
    label: labels[i],
    description: labels[i],
    range: operations[i].includes("Chain") ? [0, 10] : [0, 8],
  }));
}

createBonusFlight(100);
createBonusFlight(360);
createBonusFlight(365);
createBonusFlight(1000);
createBonusFlight(1024);
