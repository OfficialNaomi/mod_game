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

// Add more flights later (Mod 4, 5, ...)
