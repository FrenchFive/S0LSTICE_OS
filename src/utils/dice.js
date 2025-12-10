// Dice rolling utilities for Hunters RPG
// Based on d10 pool system with success threshold

/**
 * Roll a single die
 */
export const rollDie = (sides = 10) => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Roll multiple dice of same type
 */
export const rollDice = (sides = 10, count = 1) => {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides));
  }
  return results;
};

// Convenience functions
export const rollD6 = (count = 1) => rollDice(6, count);
export const rollD10 = (count = 1) => rollDice(10, count);
export const rollD20 = (count = 1) => rollDice(20, count);
export const rollD100 = (count = 1) => rollDice(100, count);

export const sumRolls = (rolls) => rolls.reduce((sum, roll) => sum + roll, 0);

// Dice type options (primarily for freeform rolling)
export const diceTypes = [
  { name: 'D6', sides: 6 },
  { name: 'D10', sides: 10 },
  { name: 'D20', sides: 20 },
  { name: 'D100', sides: 100 }
];

/**
 * HUNTERS DICE SYSTEM
 * d10 pool system with:
 * - Success on 6+
 * - 10s are criticals (count as 2 successes when paired)
 * - Desperation dice can trigger messy criticals
 */

export const HUNTERS_DICE_CONFIG = {
  successThreshold: 6,
  criticalValue: 10,
  maxDesperation: 5
};

/**
 * Roll a Hunters dice pool
 * @param {number} poolSize - Number of regular dice
 * @param {number} desperationDice - Number of desperation dice (optional)
 * @param {number} difficulty - Target number of successes needed
 * @returns {object} Roll result with all details
 */
export function rollHuntersPool(poolSize, desperationDice = 0, difficulty = 1) {
  const regularResults = rollDice(10, Math.max(0, poolSize));
  const desperationResults = rollDice(10, Math.max(0, desperationDice));
  
  // Count successes
  let successes = 0;
  let tens = 0;
  let desperationTens = 0;
  
  // Count regular dice
  regularResults.forEach(result => {
    if (result >= HUNTERS_DICE_CONFIG.successThreshold) {
      successes++;
    }
    if (result === HUNTERS_DICE_CONFIG.criticalValue) {
      tens++;
    }
  });
  
  // Count desperation dice
  desperationResults.forEach(result => {
    if (result >= HUNTERS_DICE_CONFIG.successThreshold) {
      successes++;
    }
    if (result === HUNTERS_DICE_CONFIG.criticalValue) {
      desperationTens++;
      tens++;
    }
  });
  
  // Calculate critical pairs (every pair of 10s = +2 extra successes)
  const criticalPairs = Math.floor(tens / 2);
  const totalSuccesses = successes + (criticalPairs * 2);
  
  // Determine outcome
  let outcome = 'failure';
  let isCritical = false;
  let isMessyCritical = false;
  
  if (totalSuccesses >= difficulty) {
    outcome = 'success';
    
    // Check for critical (any paired 10s)
    if (criticalPairs > 0) {
      isCritical = true;
      outcome = 'critical';
      
      // Check for messy critical (paired 10s include desperation die)
      if (desperationTens > 0 && tens >= 2) {
        isMessyCritical = true;
        outcome = 'messy_critical';
      }
    }
  }
  
  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    poolSize,
    desperationDice,
    difficulty,
    regularResults,
    desperationResults,
    allResults: [...regularResults, ...desperationResults],
    successes: totalSuccesses,
    rawSuccesses: successes,
    tens,
    desperationTens,
    criticalPairs,
    outcome,
    isCritical,
    isMessyCritical,
    margin: totalSuccesses - difficulty
  };
}

/**
 * Format roll outcome for display
 */
export function formatOutcome(outcome) {
  switch (outcome) {
    case 'critical':
      return { text: 'Critical Success!', class: 'critical' };
    case 'messy_critical':
      return { text: 'Messy Critical!', class: 'messy' };
    case 'success':
      return { text: 'Success', class: 'success' };
    case 'failure':
    default:
      return { text: 'Failure', class: 'failure' };
  }
}

/**
 * Storage for roll history
 */
const ROLL_HISTORY_KEY = 'hunters_roll_history';
const MAX_HISTORY = 20;

export function saveRollToHistory(roll, characterName = 'Unknown') {
  const history = getRollHistory();
  const entry = {
    ...roll,
    characterName
  };
  
  history.unshift(entry);
  
  // Trim to max size
  while (history.length > MAX_HISTORY) {
    history.pop();
  }
  
  localStorage.setItem(ROLL_HISTORY_KEY, JSON.stringify(history));
  return entry;
}

export function getRollHistory() {
  const data = localStorage.getItem(ROLL_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearRollHistory() {
  localStorage.removeItem(ROLL_HISTORY_KEY);
}

/**
 * Calculate dice pool from attribute + skill
 */
export function calculatePool(attributeValue, skillValue, modifier = 0) {
  return Math.max(1, attributeValue + skillValue + modifier);
}
