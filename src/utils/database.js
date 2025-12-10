// Local Storage Database for Hunters Character Management
import { 
  createDefaultCharacter, 
  migrateCharacter, 
  calculateHealth, 
  calculateWillpower,
  SCHEMA_VERSION 
} from './huntersData';

const DB_KEY = 'hunters_characters';
const CURRENT_CHARACTER_KEY = 'hunters_current_character';
const SCHEMA_VERSION_KEY = 'hunters_schema_version';

// Run migration on app load
function migrateStorage() {
  const storedVersion = parseInt(localStorage.getItem(SCHEMA_VERSION_KEY) || '1', 10);
  
  if (storedVersion < SCHEMA_VERSION) {
    const characters = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const migratedCharacters = characters.map(char => migrateCharacter(char));
    localStorage.setItem(DB_KEY, JSON.stringify(migratedCharacters));
    localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION.toString());
  }
}

// Run migration on module load
migrateStorage();

export const database = {
  // Create a new default character
  createCharacter() {
    return createDefaultCharacter();
  },

  // Get all characters
  getAllCharacters() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get character by ID
  getCharacter(id) {
    const characters = this.getAllCharacters();
    return characters.find(char => char.id === id);
  },

  // Save new character
  saveCharacter(character) {
    const characters = this.getAllCharacters();
    const newCharacter = {
      ...character,
      id: character.id || Date.now().toString(),
      createdAt: character.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = characters.findIndex(c => c.id === newCharacter.id);
    if (existingIndex >= 0) {
      characters[existingIndex] = newCharacter;
    } else {
      characters.push(newCharacter);
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify(characters));
    return newCharacter;
  },

  // Update character
  updateCharacter(id, updates) {
    const characters = this.getAllCharacters();
    const index = characters.findIndex(c => c.id === id);
    
    if (index >= 0) {
      characters[index] = {
        ...characters[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(DB_KEY, JSON.stringify(characters));
      return characters[index];
    }
    return null;
  },

  // Recalculate derived stats for a character
  recalculateDerivedStats(character) {
    const healthMax = calculateHealth(character);
    const willpowerMax = calculateWillpower(character);
    
    return {
      ...character,
      health: {
        ...character.health,
        max: healthMax
      },
      willpower: {
        ...character.willpower,
        max: willpowerMax
      }
    };
  },

  // Award XP to a character
  awardXP(id, amount, reason = 'Session reward') {
    const character = this.getCharacter(id);
    if (!character) return null;
    
    // Initialize experience if not present
    if (!character.experience) {
      character.experience = { total: 0, spent: 0, log: [] };
    }
    
    character.experience.total += amount;
    character.experience.log.unshift({
      timestamp: new Date().toISOString(),
      type: 'xp_award',
      description: `Gained ${amount} XP: ${reason}`,
      cost: -amount,
      before: character.experience.total - amount,
      after: character.experience.total
    });
    
    // Keep log manageable
    if (character.experience.log.length > 100) {
      character.experience.log = character.experience.log.slice(0, 100);
    }
    
    return this.saveCharacter(character);
  },

  // Spend XP on an upgrade
  spendXP(id, amount, description, changeLog = {}) {
    const character = this.getCharacter(id);
    if (!character) return null;
    
    // Initialize experience if not present
    if (!character.experience) {
      character.experience = { total: 0, spent: 0, log: [] };
    }
    
    // Check if enough XP available
    const available = character.experience.total - character.experience.spent;
    if (amount > available) {
      return null; // Not enough XP
    }
    
    character.experience.spent += amount;
    character.experience.log.unshift({
      timestamp: new Date().toISOString(),
      type: 'xp_spend',
      description: description,
      cost: amount,
      ...changeLog
    });
    
    return this.saveCharacter(character);
  },

  // Get XP history for a character
  getXPHistory(id, limit = 20) {
    const character = this.getCharacter(id);
    if (!character || !character.experience?.log) return [];
    return character.experience.log.slice(0, limit);
  },

  // Delete character
  deleteCharacter(id) {
    const characters = this.getAllCharacters();
    const filtered = characters.filter(c => c.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  },

  // Set current active character
  setCurrentCharacter(id) {
    localStorage.setItem(CURRENT_CHARACTER_KEY, id);
  },

  // Get current active character
  getCurrentCharacter() {
    const id = localStorage.getItem(CURRENT_CHARACTER_KEY);
    return id ? this.getCharacter(id) : null;
  },

  // Get current character ID
  getCurrentCharacterId() {
    return localStorage.getItem(CURRENT_CHARACTER_KEY);
  },

  // Clear all data
  clearAll() {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(CURRENT_CHARACTER_KEY);
  }
};

// DM Mode Management
const DM_MODE_KEY = 'hunters_dm_mode';

export const dmMode = {
  isDM() {
    return localStorage.getItem(DM_MODE_KEY) === 'true';
  },

  setDM(isDM) {
    localStorage.setItem(DM_MODE_KEY, isDM ? 'true' : 'false');
  },

  toggle() {
    const current = this.isDM();
    this.setDM(!current);
    return !current;
  }
};

// Secret Identity Management (per character)
const SECRET_IDENTITIES_KEY = 'hunters_secret_identities_';

export const secretIdentityDatabase = {
  getIdentities(characterId) {
    const data = localStorage.getItem(SECRET_IDENTITIES_KEY + characterId);
    return data ? JSON.parse(data) : [];
  },

  getIdentity(characterId, id) {
    const identities = this.getIdentities(characterId);
    return identities.find(i => i.id === id);
  },

  saveIdentity(characterId, identity) {
    const identities = this.getIdentities(characterId);
    const newIdentity = {
      ...identity,
      id: identity.id || Date.now().toString(),
      type: identity.type || 'disguise', // 'disguise' or 'secret_identity'
      name: identity.name || '',
      coverStory: identity.coverStory || '',
      createdAt: identity.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = identities.findIndex(i => i.id === newIdentity.id);
    if (existingIndex >= 0) {
      identities[existingIndex] = newIdentity;
    } else {
      identities.push(newIdentity);
    }

    localStorage.setItem(SECRET_IDENTITIES_KEY + characterId, JSON.stringify(identities));
    return newIdentity;
  },

  deleteIdentity(characterId, id) {
    const identities = this.getIdentities(characterId);
    const filtered = identities.filter(i => i.id !== id);
    localStorage.setItem(SECRET_IDENTITIES_KEY + characterId, JSON.stringify(filtered));
  },

  // Get currently active identity for a character
  getActiveIdentity(characterId) {
    const identities = this.getIdentities(characterId);
    return identities.find(i => i.active) || null;
  },

  // Set active identity
  setActiveIdentity(characterId, id) {
    const identities = this.getIdentities(characterId);
    identities.forEach(i => {
      i.active = i.id === id;
    });
    localStorage.setItem(SECRET_IDENTITIES_KEY + characterId, JSON.stringify(identities));
  },

  // Clear active identity (use real name)
  clearActiveIdentity(characterId) {
    const identities = this.getIdentities(characterId);
    identities.forEach(i => {
      i.active = false;
    });
    localStorage.setItem(SECRET_IDENTITIES_KEY + characterId, JSON.stringify(identities));
  }
};

// Encounter Management (DM only)
const ENCOUNTERS_KEY = 'hunters_encounters';
const ACTIVE_ENCOUNTER_KEY = 'hunters_active_encounter';

export const encounterDatabase = {
  // Get all encounters
  getAllEncounters() {
    const data = localStorage.getItem(ENCOUNTERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get encounter by ID
  getEncounter(id) {
    const encounters = this.getAllEncounters();
    return encounters.find(e => e.id === id);
  },

  // Save encounter
  saveEncounter(encounter) {
    const encounters = this.getAllEncounters();
    const newEncounter = {
      ...encounter,
      id: encounter.id || Date.now().toString(),
      createdAt: encounter.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = encounters.findIndex(e => e.id === newEncounter.id);
    if (existingIndex >= 0) {
      encounters[existingIndex] = newEncounter;
    } else {
      encounters.push(newEncounter);
    }
    
    localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(encounters));
    return newEncounter;
  },

  // Delete encounter
  deleteEncounter(id) {
    const encounters = this.getAllEncounters();
    const filtered = encounters.filter(e => e.id !== id);
    localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(filtered));
  },

  // Get active encounter
  getActiveEncounter() {
    const data = localStorage.getItem(ACTIVE_ENCOUNTER_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Set active encounter
  setActiveEncounter(encounter) {
    if (encounter) {
      localStorage.setItem(ACTIVE_ENCOUNTER_KEY, JSON.stringify(encounter));
    } else {
      localStorage.removeItem(ACTIVE_ENCOUNTER_KEY);
    }
  },

  // Create default creature template
  createCreature() {
    return {
      id: Date.now().toString(),
      name: 'New Creature',
      type: 'monster', // monster, npc, minion, boss
      hp: 10,
      maxHp: 10,
      armor: 0,
      initiative: 0,
      // Combat stats
      attack: 2,
      damage: '1d6',
      defense: 1,
      // Special abilities
      abilities: [],
      // Status effects
      conditions: [],
      // Notes for DM
      notes: '',
      // Visual
      color: '#6366f1',
      token: null
    };
  },

  // Create default encounter
  createEncounter() {
    return {
      id: Date.now().toString(),
      name: 'New Encounter',
      description: '',
      difficulty: 'medium', // easy, medium, hard, deadly
      environment: 'urban', // urban, wilderness, underground, building
      creatures: [],
      players: [], // Will be populated when combat starts
      round: 0,
      turn: 0,
      initiativeOrder: [],
      status: 'planning', // planning, active, paused, completed
      notes: '',
      loot: '',
      xpReward: 0
    };
  }
};

// Character Bank Management
const BANK_KEY = 'hunters_character_bank_';

export const bankDatabase = {
  // Get bank data for a character
  getBank(characterId) {
    const data = localStorage.getItem(BANK_KEY + characterId);
    return data ? JSON.parse(data) : {
      balance: 0,
      transactions: []
    };
  },

  // Update bank balance
  updateBalance(characterId, amount, description) {
    const bank = this.getBank(characterId);
    bank.balance = Math.max(0, bank.balance + amount);
    bank.transactions.unshift({
      id: Date.now().toString(),
      amount,
      description,
      timestamp: new Date().toISOString(),
      balance: bank.balance
    });
    
    // Keep only last 50 transactions
    if (bank.transactions.length > 50) {
      bank.transactions = bank.transactions.slice(0, 50);
    }
    
    localStorage.setItem(BANK_KEY + characterId, JSON.stringify(bank));
    return bank;
  },

  // Set balance directly
  setBalance(characterId, amount) {
    const bank = this.getBank(characterId);
    const difference = amount - bank.balance;
    return this.updateBalance(characterId, difference, 'Balance adjustment');
  }
};
