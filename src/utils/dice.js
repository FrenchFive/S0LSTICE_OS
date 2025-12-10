// Dice rolling utilities for Hunters RPG

export const rollDice = (sides = 6, count = 1) => {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
};

export const rollD6 = (count = 1) => rollDice(6, count);
export const rollD10 = (count = 1) => rollDice(10, count);
export const rollD20 = (count = 1) => rollDice(20, count);
export const rollD100 = (count = 1) => rollDice(100, count);

export const sumRolls = (rolls) => rolls.reduce((sum, roll) => sum + roll, 0);

export const diceTypes = [
  { name: 'D6', sides: 6 },
  { name: 'D10', sides: 10 },
  { name: 'D20', sides: 20 },
  { name: 'D100', sides: 100 }
];
