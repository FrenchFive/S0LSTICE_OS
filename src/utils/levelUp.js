/**
 * Level Up System for Hunters RPG
 * XP Costs and Advancement Rules based on Hunter: The Reckoning 5th Edition
 */

import { ATTRIBUTE_LABELS, SKILL_LABELS } from './huntersData';
import { getTraitById } from '../data/huntersTraits';

// ==========================================
// XP COST TABLES
// ==========================================

export const XP_COSTS = {
  // Attribute: new rating × 5
  attribute: (currentRating) => (currentRating + 1) * 5,
  
  // Skill (trained): new rating × 3
  skillTrained: (currentRating) => (currentRating + 1) * 3,
  
  // New Skill (from 0 to 1): 3 XP
  skillNew: 3,
  
  // Background: new rating × 3
  background: (currentRating) => (currentRating + 1) * 3,
  
  // Merit: new rating × 3
  merit: (currentRating) => (currentRating + 1) * 3,
  
  // Specialty: 3 XP
  specialty: 3,
  
  // Willpower: 10 XP per dot
  willpower: 10,
  
  // Edge: varies by edge type
  edge: 10,
  
  // Remove a Flaw: Flaw rating × 3
  removeFlaw: (currentRating) => currentRating * 3
};

// ==========================================
// XP GAIN GUIDELINES
// ==========================================

export const XP_AWARDS = {
  sessionBase: 1,           // Base XP per session
  sessionGood: 2,           // Good roleplay/progress
  sessionGreat: 3,          // Exceptional session
  achievedAmbition: 3,      // Completed major character goal
  achievedDesire: 1,        // Completed minor character goal
  learnedSecret: 1,         // Discovered important lore
  dangerSurvived: 1,        // Survived significant danger
  heroicSacrifice: 2,       // Made a meaningful sacrifice
};

// ==========================================
// LEVEL THRESHOLDS
// These define character "power levels" based on total XP earned
// ==========================================

export const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, title: 'Fledgling Hunter' },
  { level: 2, minXP: 15, title: 'Novice Hunter' },
  { level: 3, minXP: 35, title: 'Seasoned Hunter' },
  { level: 4, minXP: 60, title: 'Veteran Hunter' },
  { level: 5, minXP: 90, title: 'Expert Hunter' },
  { level: 6, minXP: 125, title: 'Master Hunter' },
  { level: 7, minXP: 165, title: 'Legendary Hunter' },
  { level: 8, minXP: 210, title: 'Renowned Hunter' },
  { level: 9, minXP: 260, title: 'Mythic Hunter' },
  { level: 10, minXP: 315, title: 'Imbued Champion' }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Calculate the character's level based on total XP
 */
export function calculateLevel(totalXP) {
  let currentLevel = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.minXP) {
      currentLevel = threshold;
    } else {
      break;
    }
  }
  return currentLevel;
}

/**
 * Calculate XP needed for next level
 */
export function getXPToNextLevel(totalXP) {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(t => t.level === currentLevel.level) + 1;
  
  if (nextLevelIndex >= LEVEL_THRESHOLDS.length) {
    return { needed: 0, nextLevel: null, progress: 100 };
  }
  
  const nextLevel = LEVEL_THRESHOLDS[nextLevelIndex];
  const xpNeeded = nextLevel.minXP - totalXP;
  const progressRange = nextLevel.minXP - currentLevel.minXP;
  const currentProgress = totalXP - currentLevel.minXP;
  const progress = Math.round((currentProgress / progressRange) * 100);
  
  return { 
    needed: xpNeeded, 
    nextLevel, 
    progress: Math.min(100, Math.max(0, progress))
  };
}

/**
 * Calculate cost to increase an attribute
 */
export function getAttributeCost(currentValue) {
  if (currentValue >= 5) return null; // Max is 5
  return XP_COSTS.attribute(currentValue);
}

/**
 * Calculate cost to increase a skill
 */
export function getSkillCost(currentValue) {
  if (currentValue >= 5) return null; // Max is 5
  if (currentValue === 0) return XP_COSTS.skillNew;
  return XP_COSTS.skillTrained(currentValue);
}

/**
 * Calculate cost to add or increase a trait
 */
export function getTraitCost(traitId, currentLevel) {
  const trait = getTraitById(traitId);
  if (!trait) return null;
  
  const newLevel = currentLevel + 1;
  if (newLevel > trait.maxLevel) return null;
  
  switch (trait.type) {
    case 'background':
      return XP_COSTS.background(currentLevel);
    case 'merit':
      return XP_COSTS.merit(currentLevel);
    case 'flaw':
      return XP_COSTS.removeFlaw(currentLevel);
    default:
      return null;
  }
}

/**
 * Get all available upgrades for a character
 */
export function getAvailableUpgrades(character, availableXP) {
  const upgrades = {
    attributes: [],
    skills: [],
    traits: [],
    specialties: [],
    edges: []
  };
  
  // Attribute upgrades
  if (character.attributes) {
    for (const [category, attrs] of Object.entries(character.attributes)) {
      for (const [attr, value] of Object.entries(attrs)) {
        const cost = getAttributeCost(value);
        if (cost !== null && cost <= availableXP) {
          upgrades.attributes.push({
            category,
            attr,
            currentValue: value,
            newValue: value + 1,
            cost,
            label: ATTRIBUTE_LABELS[attr]
          });
        }
      }
    }
  }
  
  // Skill upgrades
  if (character.skills) {
    for (const [category, skills] of Object.entries(character.skills)) {
      for (const [skill, value] of Object.entries(skills)) {
        const cost = getSkillCost(value);
        if (cost !== null && cost <= availableXP) {
          upgrades.skills.push({
            category,
            skill,
            currentValue: value,
            newValue: value + 1,
            cost,
            label: SKILL_LABELS[skill]
          });
        }
      }
    }
  }
  
  // Trait upgrades
  if (character.traits) {
    for (const trait of character.traits) {
      const traitData = getTraitById(trait.id);
      if (traitData && trait.level < traitData.maxLevel) {
        const cost = getTraitCost(trait.id, trait.level);
        if (cost !== null && cost <= availableXP) {
          upgrades.traits.push({
            traitId: trait.id,
            currentLevel: trait.level,
            newLevel: trait.level + 1,
            cost,
            label: traitData.name,
            type: traitData.type
          });
        }
      }
    }
  }
  
  return upgrades;
}

/**
 * Apply an upgrade to a character
 * Returns the updated character and the change log entry
 */
export function applyUpgrade(character, upgradeType, upgradeData) {
  const updatedCharacter = JSON.parse(JSON.stringify(character));
  const changeLog = {
    timestamp: new Date().toISOString(),
    type: upgradeType,
    description: '',
    cost: 0,
    before: null,
    after: null
  };
  
  switch (upgradeType) {
    case 'attribute': {
      const { category, attr, cost } = upgradeData;
      const before = updatedCharacter.attributes[category][attr];
      updatedCharacter.attributes[category][attr] = before + 1;
      changeLog.before = before;
      changeLog.after = before + 1;
      changeLog.cost = cost;
      changeLog.description = `Increased ${ATTRIBUTE_LABELS[attr]} from ${before} to ${before + 1}`;
      changeLog.field = `attributes.${category}.${attr}`;
      break;
    }
    
    case 'skill': {
      const { category, skill, cost } = upgradeData;
      const before = updatedCharacter.skills[category][skill];
      updatedCharacter.skills[category][skill] = before + 1;
      changeLog.before = before;
      changeLog.after = before + 1;
      changeLog.cost = cost;
      changeLog.description = `Increased ${SKILL_LABELS[skill]} from ${before} to ${before + 1}`;
      changeLog.field = `skills.${category}.${skill}`;
      break;
    }
    
    case 'trait': {
      const { traitId, cost } = upgradeData;
      const traitIndex = updatedCharacter.traits.findIndex(t => t.id === traitId);
      if (traitIndex >= 0) {
        const before = updatedCharacter.traits[traitIndex].level;
        updatedCharacter.traits[traitIndex].level = before + 1;
        const traitData = getTraitById(traitId);
        changeLog.before = before;
        changeLog.after = before + 1;
        changeLog.cost = cost;
        changeLog.description = `Increased ${traitData?.name || traitId} from level ${before} to ${before + 1}`;
        changeLog.field = `traits.${traitId}`;
      }
      break;
    }
    
    case 'newTrait': {
      const { traitId, level, detail, cost } = upgradeData;
      const traitData = getTraitById(traitId);
      updatedCharacter.traits = updatedCharacter.traits || [];
      updatedCharacter.traits.push({ id: traitId, level, detail });
      changeLog.before = null;
      changeLog.after = level;
      changeLog.cost = cost;
      changeLog.description = `Added new ${traitData?.type || 'trait'}: ${traitData?.name || traitId} at level ${level}`;
      changeLog.field = `traits.${traitId}`;
      break;
    }
    
    default:
      return { character, changeLog: null };
  }
  
  // Update experience
  if (!updatedCharacter.experience) {
    updatedCharacter.experience = { total: 0, spent: 0, log: [] };
  }
  updatedCharacter.experience.spent += changeLog.cost;
  updatedCharacter.experience.log.unshift(changeLog);
  
  // Check for level up
  const beforeLevel = calculateLevel(updatedCharacter.experience.total - changeLog.cost);
  const afterLevel = calculateLevel(updatedCharacter.experience.total);
  
  if (afterLevel.level > beforeLevel.level) {
    changeLog.levelUp = {
      from: beforeLevel,
      to: afterLevel
    };
  }
  
  updatedCharacter.updatedAt = new Date().toISOString();
  
  return { character: updatedCharacter, changeLog };
}

/**
 * Award XP to a character
 * Returns the updated character and whether they leveled up
 */
export function awardXP(character, amount, reason = 'Session reward') {
  const updatedCharacter = JSON.parse(JSON.stringify(character));
  
  if (!updatedCharacter.experience) {
    updatedCharacter.experience = { total: 0, spent: 0, log: [] };
  }
  
  const beforeLevel = calculateLevel(updatedCharacter.experience.total);
  updatedCharacter.experience.total += amount;
  const afterLevel = calculateLevel(updatedCharacter.experience.total);
  
  const changeLog = {
    timestamp: new Date().toISOString(),
    type: 'xp_award',
    description: `Gained ${amount} XP: ${reason}`,
    cost: -amount, // Negative because it's a gain
    before: updatedCharacter.experience.total - amount,
    after: updatedCharacter.experience.total
  };
  
  updatedCharacter.experience.log.unshift(changeLog);
  
  let leveledUp = false;
  if (afterLevel.level > beforeLevel.level) {
    leveledUp = true;
    changeLog.levelUp = {
      from: beforeLevel,
      to: afterLevel
    };
  }
  
  updatedCharacter.updatedAt = new Date().toISOString();
  
  return { character: updatedCharacter, leveledUp, changeLog };
}

/**
 * Get the available (unspent) XP for a character
 */
export function getAvailableXP(character) {
  if (!character.experience) return 0;
  return character.experience.total - character.experience.spent;
}

/**
 * Get recent changes that should be highlighted
 * Returns changes from the last X hours (default 24)
 */
export function getRecentChanges(character, hoursAgo = 24) {
  if (!character.experience?.log) return [];
  
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hoursAgo);
  
  return character.experience.log.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= cutoff && entry.type !== 'xp_award';
  });
}

/**
 * Check if a field was recently changed
 */
export function wasRecentlyChanged(character, fieldPath, hoursAgo = 24) {
  const recentChanges = getRecentChanges(character, hoursAgo);
  return recentChanges.some(change => change.field === fieldPath);
}

/**
 * Format XP cost for display
 */
export function formatXPCost(cost) {
  if (cost === null || cost === undefined) return '--';
  if (cost === 0) return 'Free';
  return `${cost} XP`;
}

/**
 * Generate a summary of possible upgrades
 */
export function getUpgradeSummary(character) {
  const availableXP = getAvailableXP(character);
  const upgrades = getAvailableUpgrades(character, availableXP);
  
  return {
    availableXP,
    upgradeCount: 
      upgrades.attributes.length + 
      upgrades.skills.length + 
      upgrades.traits.length,
    cheapestUpgrade: Math.min(
      ...upgrades.attributes.map(u => u.cost),
      ...upgrades.skills.map(u => u.cost),
      ...upgrades.traits.map(u => u.cost),
      Infinity
    ),
    canUpgrade: availableXP > 0 && (
      upgrades.attributes.length > 0 || 
      upgrades.skills.length > 0 || 
      upgrades.traits.length > 0
    )
  };
}

export default {
  XP_COSTS,
  XP_AWARDS,
  LEVEL_THRESHOLDS,
  calculateLevel,
  getXPToNextLevel,
  getAttributeCost,
  getSkillCost,
  getTraitCost,
  getAvailableUpgrades,
  applyUpgrade,
  awardXP,
  getAvailableXP,
  getRecentChanges,
  wasRecentlyChanged,
  formatXPCost,
  getUpgradeSummary
};
