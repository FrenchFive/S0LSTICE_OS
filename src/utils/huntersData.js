/**
 * Hunters RPG Data Model
 * Based on Hunter: The Reckoning 5th Edition style system
 */

// Attribute definitions
export const ATTRIBUTES = {
  physical: {
    label: 'Physical',
    attrs: ['strength', 'dexterity', 'stamina']
  },
  social: {
    label: 'Social',
    attrs: ['charisma', 'manipulation', 'composure']
  },
  mental: {
    label: 'Mental',
    attrs: ['intelligence', 'wits', 'resolve']
  }
};

export const ATTRIBUTE_LABELS = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  stamina: 'Stamina',
  charisma: 'Charisma',
  manipulation: 'Manipulation',
  composure: 'Composure',
  intelligence: 'Intelligence',
  wits: 'Wits',
  resolve: 'Resolve'
};

// Skill definitions
export const SKILLS = {
  physical: {
    label: 'Physical',
    skills: ['athletics', 'brawl', 'craft', 'drive', 'firearms', 'larceny', 'melee', 'stealth', 'survival']
  },
  social: {
    label: 'Social',
    skills: ['animal_ken', 'etiquette', 'insight', 'intimidation', 'leadership', 'performance', 'persuasion', 'streetwise', 'subterfuge']
  },
  mental: {
    label: 'Mental',
    skills: ['academics', 'awareness', 'finance', 'investigation', 'medicine', 'occult', 'politics', 'science', 'technology']
  }
};

export const SKILL_LABELS = {
  athletics: 'Athletics',
  brawl: 'Brawl',
  craft: 'Craft',
  drive: 'Drive',
  firearms: 'Firearms',
  larceny: 'Larceny',
  melee: 'Melee',
  stealth: 'Stealth',
  survival: 'Survival',
  animal_ken: 'Animal Ken',
  etiquette: 'Etiquette',
  insight: 'Insight',
  intimidation: 'Intimidation',
  leadership: 'Leadership',
  performance: 'Performance',
  persuasion: 'Persuasion',
  streetwise: 'Streetwise',
  subterfuge: 'Subterfuge',
  academics: 'Academics',
  awareness: 'Awareness',
  finance: 'Finance',
  investigation: 'Investigation',
  medicine: 'Medicine',
  occult: 'Occult',
  politics: 'Politics',
  science: 'Science',
  technology: 'Technology'
};

// Creed options
export const CREEDS = [
  { id: 'entrepreneurial', name: 'Entrepreneurial', description: 'Profit from the hunt' },
  { id: 'faithful', name: 'Faithful', description: 'Divine mission against evil' },
  { id: 'inquisitive', name: 'Inquisitive', description: 'Seek knowledge of the supernatural' },
  { id: 'martial', name: 'Martial', description: 'Warriors against the darkness' },
  { id: 'underground', name: 'Underground', description: 'Work from the shadows' }
];

// Edge types
export const EDGE_TYPES = ['Asset', 'Aptitude', 'Endowment'];

// Create default character template
export function createDefaultCharacter() {
  return {
    id: Date.now().toString(),
    system: 'Hunters_5e',
    
    // Identity
    identity: {
      name: '',
      portraitUrl: null,
      player: '',
      chronicle: '',
      concept: '',
      occupation: '',
      creed: '',
      drive: '',
      ambition: '',
      desire: '',
      cell: ''
    },
    
    // Attributes (1-5 dots, default 1)
    attributes: {
      physical: {
        strength: 1,
        dexterity: 1,
        stamina: 1
      },
      social: {
        charisma: 1,
        manipulation: 1,
        composure: 1
      },
      mental: {
        intelligence: 1,
        wits: 1,
        resolve: 1
      }
    },
    
    // Skills (0-5 dots, default 0)
    skills: {
      physical: {
        athletics: 0,
        brawl: 0,
        craft: 0,
        drive: 0,
        firearms: 0,
        larceny: 0,
        melee: 0,
        stealth: 0,
        survival: 0
      },
      social: {
        animal_ken: 0,
        etiquette: 0,
        insight: 0,
        intimidation: 0,
        leadership: 0,
        performance: 0,
        persuasion: 0,
        streetwise: 0,
        subterfuge: 0
      },
      mental: {
        academics: 0,
        awareness: 0,
        finance: 0,
        investigation: 0,
        medicine: 0,
        occult: 0,
        politics: 0,
        science: 0,
        technology: 0
      }
    },
    
    // Health track
    health: {
      max: 4, // stamina + 3
      superficial: 0,
      aggravated: 0
    },
    
    // Willpower track
    willpower: {
      max: 2, // composure + resolve
      superficial: 0,
      aggravated: 0
    },
    
    // Desperation state
    desperation: {
      pool: 0,
      danger: 0,
      despair: false
    },
    
    // Edges and Perks
    edges: [],
    perks: [],
    
    // Advantages
    advantages: {
      backgrounds: [],
      merits: [],
      flaws: []
    },
    
    // Creed details
    creedDetails: {
      notes: '',
      virtue: '',
      vice: ''
    },
    
    // Biography
    biography: {
      age: null,
      apparentAge: null,
      dateOfBirth: '',
      pronouns: '',
      appearance: '',
      distinguishingFeatures: '',
      history: '',
      notes: ''
    },
    
    // Touchstones and Redemption
    touchstones: [],
    redemption: [],
    
    // Conditions and Injuries
    conditions: [],
    injuries: [],
    
    // Weapons and Gear
    weapons: [],
    gear: [],
    vehicles: [],
    
    // Resources
    resources: {
      bankBalance: 0,
      transactions: [],
      contacts: []
    },
    
    // Experience
    experience: {
      total: 0,
      spent: 0,
      log: []
    },
    
    // Chronicle state
    chronicle: {
      tenets: [],
      sessionLog: [],
      sceneLog: []
    },
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Calculate derived stats
export function calculateHealth(character) {
  const stamina = character.attributes?.physical?.stamina || 1;
  return stamina + 3;
}

export function calculateWillpower(character) {
  const composure = character.attributes?.social?.composure || 1;
  const resolve = character.attributes?.mental?.resolve || 1;
  return composure + resolve;
}

// Get attribute value by name
export function getAttributeValue(character, attrName) {
  for (const category of Object.values(character.attributes || {})) {
    if (category[attrName] !== undefined) {
      return category[attrName];
    }
  }
  return 1;
}

// Get skill value by name
export function getSkillValue(character, skillName) {
  for (const category of Object.values(character.skills || {})) {
    if (category[skillName] !== undefined) {
      return category[skillName];
    }
  }
  return 0;
}

// Calculate dice pool for attribute + skill roll
export function calculateDicePool(character, attribute, skill, modifier = 0) {
  const attrValue = getAttributeValue(character, attribute);
  const skillValue = getSkillValue(character, skill);
  return Math.max(1, attrValue + skillValue + modifier);
}

// Migrate old D&D character to Hunters format
export function migrateCharacter(oldChar) {
  if (oldChar.system === 'Hunters_5e') {
    return oldChar; // Already migrated
  }
  
  const newChar = createDefaultCharacter();
  
  // Preserve ID
  newChar.id = oldChar.id;
  
  // Migrate identity
  newChar.identity.name = oldChar.name || '';
  newChar.identity.portraitUrl = oldChar.image || null;
  
  // Rough attribute conversion from D&D (10 = average = 2 dots)
  const convertStat = (value) => {
    if (!value) return 1;
    if (value <= 8) return 1;
    if (value <= 11) return 2;
    if (value <= 14) return 3;
    if (value <= 17) return 4;
    return 5;
  };
  
  // Map old stats to new attributes
  if (oldChar.strength) newChar.attributes.physical.strength = convertStat(oldChar.strength);
  if (oldChar.dexterity) newChar.attributes.physical.dexterity = convertStat(oldChar.dexterity);
  if (oldChar.constitution) newChar.attributes.physical.stamina = convertStat(oldChar.constitution);
  if (oldChar.charisma) newChar.attributes.social.charisma = convertStat(oldChar.charisma);
  if (oldChar.intelligence) newChar.attributes.mental.intelligence = convertStat(oldChar.intelligence);
  if (oldChar.wisdom) {
    newChar.attributes.mental.wits = convertStat(oldChar.wisdom);
    newChar.attributes.mental.resolve = convertStat(oldChar.wisdom);
  }
  
  // Recalculate derived stats
  newChar.health.max = calculateHealth(newChar);
  newChar.willpower.max = calculateWillpower(newChar);
  
  // Migrate bank balance if exists
  if (oldChar.bankBalance !== undefined) {
    newChar.resources.bankBalance = oldChar.bankBalance;
  }
  
  // Migrate backstory
  if (oldChar.backstory) {
    newChar.biography.history = oldChar.backstory;
  }
  
  // Preserve timestamps
  newChar.createdAt = oldChar.createdAt || new Date().toISOString();
  newChar.updatedAt = new Date().toISOString();
  
  return newChar;
}

// Storage keys
export const STORAGE_KEYS = {
  characters: 'hunters_characters',
  currentCharacter: 'hunters_current_character',
  schemaVersion: 'hunters_schema_version'
};

export const SCHEMA_VERSION = 2;
