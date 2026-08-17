// Global level definitions
const LEVELS = [
  // ---- Mod 1 ----
  {
    id: 1,
    name: "Mod 1",
    modulus: 1,
    operation: "simple",
    description: "Everything is 0",
    requiredCorrect: 3,
  },

  // ---- Mod 2 ----
  {
    id: 2,
    name: "Mod 2 Addition",
    modulus: 2,
    operation: "addition",
    description: "Parity, odd/even",
    requiredCorrect: 3,
  },
  {
    id: 3,
    name: "Mod 2 Multiplication",
    modulus: 2,
    operation: "multiplication",
    description: "AND logic",
    requiredCorrect: 3,
  },
  {
    id: 4,
    name: "Mod 2 Mixed",
    modulus: 2,
    operation: "mixed",
    description: "Addition & multiplication",
    requiredCorrect: 3,
  },

  // ---- Mod 3 to Mod 10 ----
  {
    id: 5,
    name: "Mod 3",
    modulus: 3,
    operation: "simple",
    description: "Three states",
    requiredCorrect: 3,
  },
  {
    id: 6,
    name: "Mod 4",
    modulus: 4,
    operation: "simple",
    description: "Quarters, seasons",
    requiredCorrect: 3,
  },
  {
    id: 7,
    name: "Mod 5",
    modulus: 5,
    operation: "simple",
    description: "Fingers, pentagon",
    requiredCorrect: 3,
  },
  {
    id: 8,
    name: "Mod 6",
    modulus: 6,
    operation: "simple",
    description: "Hexagon, dice",
    requiredCorrect: 3,
  },
  {
    id: 9,
    name: "Mod 7",
    modulus: 7,
    operation: "simple",
    description: "Weekdays",
    requiredCorrect: 3,
  },
  {
    id: 10,
    name: "Mod 8",
    modulus: 8,
    operation: "simple",
    description: "Octagon, bytes",
    requiredCorrect: 3,
  },
  {
    id: 11,
    name: "Mod 9",
    modulus: 9,
    operation: "simple",
    description: "Digits before rollover",
    requiredCorrect: 3,
  },
  {
    id: 12,
    name: "Mod 10",
    modulus: 10,
    operation: "simple",
    description: "Decimal system",
    requiredCorrect: 3,
    unlocksFreeFall: true,  // ← after completing this level
  },
];
