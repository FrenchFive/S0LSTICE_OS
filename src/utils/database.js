// Local Storage Database for Hunters Character Management

const DB_KEY = 'hunters_characters';
const CURRENT_CHARACTER_KEY = 'hunters_current_character';

export const database = {
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
