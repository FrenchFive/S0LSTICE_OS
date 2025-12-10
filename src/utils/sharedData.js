// Shared data management for multiplayer features
// Handles Codex, Quests, Maps, and other synchronized data

const CODEX_KEY = 'hunters_codex';
const BESTIARY_KEY = 'hunters_bestiary';
const QUESTS_KEY = 'hunters_quests';
const MAPS_KEY = 'hunters_maps';
const CONTACTS_KEY = 'hunters_contacts_';
const MESSAGES_KEY = 'hunters_messages_';
const NOTES_KEY = 'hunters_notes_';
const INVENTORY_KEY = 'hunters_inventory_';
const PETS_KEY = 'hunters_pets_';

// Codex Management (Lore Pages)
export const codexDatabase = {
  getAllPages() {
    const data = localStorage.getItem(CODEX_KEY);
    return data ? JSON.parse(data) : [];
  },

  getPage(id) {
    const pages = this.getAllPages();
    return pages.find(p => p.id === id);
  },

  savePage(page) {
    const pages = this.getAllPages();
    const newPage = {
      ...page,
      id: page.id || Date.now().toString(),
      createdAt: page.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (page.version || 0) + 1,
      isPrivate: page.isPrivate || false, // DM private pages
      author: page.author || 'Unknown'
    };

    const existingIndex = pages.findIndex(p => p.id === newPage.id);
    if (existingIndex >= 0) {
      pages[existingIndex] = newPage;
    } else {
      pages.push(newPage);
    }

    localStorage.setItem(CODEX_KEY, JSON.stringify(pages));
    return newPage;
  },

  deletePage(id) {
    const pages = this.getAllPages();
    const filtered = pages.filter(p => p.id !== id);
    localStorage.setItem(CODEX_KEY, JSON.stringify(filtered));
  },

  // Sync with remote version (keep most recent)
  syncPage(remotePage) {
    const localPage = this.getPage(remotePage.id);
    
    if (!localPage || remotePage.version > localPage.version) {
      return this.savePage(remotePage);
    }
    
    return localPage;
  }
};

// Bestiary Management
export const bestiaryDatabase = {
  getAllEntries() {
    const data = localStorage.getItem(BESTIARY_KEY);
    return data ? JSON.parse(data) : [];
  },

  getEntry(id) {
    const entries = this.getAllEntries();
    return entries.find(e => e.id === id);
  },

  saveEntry(entry) {
    const entries = this.getAllEntries();
    const newEntry = {
      ...entry,
      id: entry.id || Date.now().toString(),
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (entry.version || 0) + 1,
      addedBy: entry.addedBy || 'Unknown'
    };

    const existingIndex = entries.findIndex(e => e.id === newEntry.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }

    localStorage.setItem(BESTIARY_KEY, JSON.stringify(entries));
    return newEntry;
  },

  deleteEntry(id) {
    const entries = this.getAllEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(BESTIARY_KEY, JSON.stringify(filtered));
  },

  syncEntry(remoteEntry) {
    const localEntry = this.getEntry(remoteEntry.id);
    
    if (!localEntry || remoteEntry.version > localEntry.version) {
      return this.saveEntry(remoteEntry);
    }
    
    return localEntry;
  }
};

// Quest Management
export const questDatabase = {
  getAllQuests() {
    const data = localStorage.getItem(QUESTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getQuest(id) {
    const quests = this.getAllQuests();
    return quests.find(q => q.id === id);
  },

  saveQuest(quest) {
    const quests = this.getAllQuests();
    const newQuest = {
      ...quest,
      id: quest.id || Date.now().toString(),
      createdAt: quest.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (quest.version || 0) + 1,
      completed: quest.completed || false
    };

    const existingIndex = quests.findIndex(q => q.id === newQuest.id);
    if (existingIndex >= 0) {
      quests[existingIndex] = newQuest;
    } else {
      quests.push(newQuest);
    }

    localStorage.setItem(QUESTS_KEY, JSON.stringify(quests));
    return newQuest;
  },

  deleteQuest(id) {
    const quests = this.getAllQuests();
    const filtered = quests.filter(q => q.id !== id);
    localStorage.setItem(QUESTS_KEY, JSON.stringify(filtered));
  },

  toggleQuest(id) {
    const quest = this.getQuest(id);
    if (quest) {
      quest.completed = !quest.completed;
      return this.saveQuest(quest);
    }
    return null;
  },

  syncQuest(remoteQuest) {
    const localQuest = this.getQuest(remoteQuest.id);
    
    if (!localQuest || remoteQuest.version > localQuest.version) {
      return this.saveQuest(remoteQuest);
    }
    
    return localQuest;
  }
};

// Map Pins Management
export const mapDatabase = {
  getAllPins() {
    const data = localStorage.getItem(MAPS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getPin(id) {
    const pins = this.getAllPins();
    return pins.find(p => p.id === id);
  },

  savePin(pin) {
    const pins = this.getAllPins();
    const newPin = {
      ...pin,
      id: pin.id || Date.now().toString(),
      createdAt: pin.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (pin.version || 0) + 1
    };

    const existingIndex = pins.findIndex(p => p.id === newPin.id);
    if (existingIndex >= 0) {
      pins[existingIndex] = newPin;
    } else {
      pins.push(newPin);
    }

    localStorage.setItem(MAPS_KEY, JSON.stringify(pins));
    return newPin;
  },

  deletePin(id) {
    const pins = this.getAllPins();
    const filtered = pins.filter(p => p.id !== id);
    localStorage.setItem(MAPS_KEY, JSON.stringify(filtered));
  },

  syncPin(remotePin) {
    const localPin = this.getPin(remotePin.id);
    
    if (!localPin || remotePin.version > localPin.version) {
      return this.savePin(remotePin);
    }
    
    return localPin;
  }
};

// Contacts Management (per character)
export const contactsDatabase = {
  getContacts(characterId) {
    const data = localStorage.getItem(CONTACTS_KEY + characterId);
    return data ? JSON.parse(data) : [];
  },

  getContact(characterId, id) {
    const contacts = this.getContacts(characterId);
    return contacts.find(c => c.id === id);
  },

  saveContact(characterId, contact) {
    const contacts = this.getContacts(characterId);
    const newContact = {
      ...contact,
      id: contact.id || Date.now().toString(),
      createdAt: contact.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility: contact.visibility || 'public' // private, public
    };

    const existingIndex = contacts.findIndex(c => c.id === newContact.id);
    if (existingIndex >= 0) {
      contacts[existingIndex] = newContact;
    } else {
      contacts.push(newContact);
    }

    localStorage.setItem(CONTACTS_KEY + characterId, JSON.stringify(contacts));
    return newContact;
  },

  deleteContact(characterId, id) {
    const contacts = this.getContacts(characterId);
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem(CONTACTS_KEY + characterId, JSON.stringify(filtered));
  }
};

// Messages Management (per character)
export const messagesDatabase = {
  getMessages(characterId, contactId) {
    const key = `${MESSAGES_KEY}${characterId}_${contactId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  sendMessage(characterId, contactId, message) {
    const key = `${MESSAGES_KEY}${characterId}_${contactId}`;
    const messages = this.getMessages(characterId, contactId);
    
    const newMessage = {
      id: Date.now().toString(),
      text: message.text,
      sender: message.sender, // 'me' or contact name
      timestamp: new Date().toISOString(),
      read: false
    };

    messages.push(newMessage);
    localStorage.setItem(key, JSON.stringify(messages));
    return newMessage;
  },

  markAsRead(characterId, contactId) {
    const messages = this.getMessages(characterId, contactId);
    messages.forEach(m => m.read = true);
    const key = `${MESSAGES_KEY}${characterId}_${contactId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }
};

// Notes Management (per character)
export const notesDatabase = {
  getNotes(characterId) {
    const data = localStorage.getItem(NOTES_KEY + characterId);
    return data ? JSON.parse(data) : [];
  },

  getNote(characterId, id) {
    const notes = this.getNotes(characterId);
    return notes.find(n => n.id === id);
  },

  saveNote(characterId, note) {
    const notes = this.getNotes(characterId);
    const newNote = {
      ...note,
      id: note.id || Date.now().toString(),
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = notes.findIndex(n => n.id === newNote.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = newNote;
    } else {
      notes.push(newNote);
    }

    localStorage.setItem(NOTES_KEY + characterId, JSON.stringify(notes));
    return newNote;
  },

  deleteNote(characterId, id) {
    const notes = this.getNotes(characterId);
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(NOTES_KEY + characterId, JSON.stringify(filtered));
  }
};

// Inventory Management (per character)
export const inventoryDatabase = {
  getInventory(characterId) {
    const data = localStorage.getItem(INVENTORY_KEY + characterId);
    return data ? JSON.parse(data) : [];
  },

  getItem(characterId, id) {
    const inventory = this.getInventory(characterId);
    return inventory.find(i => i.id === id);
  },

  addItem(characterId, item) {
    const inventory = this.getInventory(characterId);
    const newItem = {
      ...item,
      id: item.id || Date.now().toString(),
      quantity: item.quantity || 1,
      createdAt: new Date().toISOString()
    };

    inventory.push(newItem);
    localStorage.setItem(INVENTORY_KEY + characterId, JSON.stringify(inventory));
    return newItem;
  },

  updateItem(characterId, id, updates) {
    const inventory = this.getInventory(characterId);
    const index = inventory.findIndex(i => i.id === id);
    
    if (index >= 0) {
      inventory[index] = { ...inventory[index], ...updates };
      localStorage.setItem(INVENTORY_KEY + characterId, JSON.stringify(inventory));
      return inventory[index];
    }
    return null;
  },

  deleteItem(characterId, id) {
    const inventory = this.getInventory(characterId);
    const filtered = inventory.filter(i => i.id !== id);
    localStorage.setItem(INVENTORY_KEY + characterId, JSON.stringify(filtered));
  }
};

// Pets/Familiars Management (per character)
export const petsDatabase = {
  getPets(characterId) {
    const data = localStorage.getItem(PETS_KEY + characterId);
    return data ? JSON.parse(data) : [];
  },

  getPet(characterId, id) {
    const pets = this.getPets(characterId);
    return pets.find(p => p.id === id);
  },

  savePet(characterId, pet) {
    const pets = this.getPets(characterId);
    const newPet = {
      ...pet,
      id: pet.id || Date.now().toString(),
      createdAt: pet.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hp: pet.hp !== undefined ? pet.hp : 10,
      maxHp: pet.maxHp || 10,
      happiness: pet.happiness !== undefined ? pet.happiness : 100,
      lastFed: pet.lastFed || new Date().toISOString()
    };

    const existingIndex = pets.findIndex(p => p.id === newPet.id);
    if (existingIndex >= 0) {
      pets[existingIndex] = newPet;
    } else {
      pets.push(newPet);
    }

    localStorage.setItem(PETS_KEY + characterId, JSON.stringify(pets));
    return newPet;
  },

  deletePet(characterId, id) {
    const pets = this.getPets(characterId);
    const filtered = pets.filter(p => p.id !== id);
    localStorage.setItem(PETS_KEY + characterId, JSON.stringify(filtered));
  },

  updatePetStats(characterId, id, stats) {
    const pet = this.getPet(characterId, id);
    if (pet) {
      return this.savePet(characterId, { ...pet, ...stats });
    }
    return null;
  }
};
