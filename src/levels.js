const LEVELS = [];

function addLevel(level) {
  LEVELS.push({
    id: LEVELS.length + 1,
    requiredCorrect: 1,
    ...level
  });
}

// ---------- Mod 1: 5 steps ----------
addLevel({
  modulus: 1,
  operation: "constantZero",
  label: "0",
  description: "Zero",
});
addLevel({
  modulus: 1,
  operation: "simple",
  label: "Random Number",
  description: "Any number mod 1",
  range: [1, 30],
});
addLevel({
  modulus: 1,
  operation: "addition",
  label: "Addition",
  description: "Addition mod 1",
});
addLevel({
  modulus: 1,
  operation: "multiplication",
  label: "Multiplication",
  description: "Multiplication mod 1",
});
addLevel({
  modulus: 1,
  operation: "mixed",
  label: "Mixed",
  description: "Addition & multiplication",
});

// ---------- Mod 2: 10 steps ----------
const mod2Steps = [
  { operation: "simple", label: "Simple Small", range: [1, 20] },
  { operation: "simple", label: "Simple Large", range: [21, 100] },
  { operation: "addition", label: "Addition" },
  { operation: "additionChain", label: "Addition Chain" },
  { operation: "multiplication", label: "Multiplication" },
  { operation: "multiplicationChain", label: "Multiplication Chain" },
  { operation: "mixed", label: "Mixed" },
  { operation: "addition", label: "Addition Large", range: [0, 10] }, // numbers can be larger than modulus
  { operation: "multiplication", label: "Multiplication Large", range: [0, 10] },
  { operation: "mixedChain", label: "Mixed Chain" },
];

mod2Steps.forEach((def) => {
  addLevel({
    modulus: 2,
    operation: def.operation,
    label: def.label,
    description: def.operation,
    range: def.range || [0, 5],
  });
});
