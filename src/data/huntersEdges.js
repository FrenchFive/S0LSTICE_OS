/**
 * Hunters RPG Edges Catalog
 * Complete catalog of Hunter Edges based on Hunter: The Reckoning 5th Edition
 * 
 * Edge Types:
 * - Asset: Equipment, resources, or allies gained through the Imbuing
 * - Aptitude: Enhanced physical or mental capabilities
 * - Endowment: Supernatural powers channeled through faith, will, or the hunt
 */

export const EDGES_VERSION = 1;

// Edge categories for filtering
export const EDGE_CATEGORIES = {
  asset: { label: 'Asset', description: 'Equipment, resources, or allies' },
  aptitude: { label: 'Aptitude', description: 'Enhanced physical or mental capabilities' },
  endowment: { label: 'Endowment', description: 'Supernatural powers' }
};

// Creed-associated edge affinities
export const CREED_AFFINITIES = {
  entrepreneurial: ['artifact_collector', 'black_market', 'prototype_gear', 'safe_house_network'],
  faithful: ['blessed_weapon', 'divine_purpose', 'exorcism', 'true_faith'],
  inquisitive: ['bestial_insight', 'occult_library', 'supernatural_sense', 'ward_crafting'],
  martial: ['combat_instinct', 'danger_sense', 'rapid_reload', 'weapon_specialist'],
  underground: ['dead_drop', 'false_identity', 'safe_passage', 'shadow_network']
};

// ==========================================
// ASSET EDGES
// ==========================================

export const ASSET_EDGES = [
  {
    id: 'artifact_collector',
    name: 'Artifact Collector',
    type: 'asset',
    category: 'resources',
    level: 2,
    description: 'You have accumulated a collection of supernatural artifacts and occult items that may prove useful against the creatures of the night.',
    effect: 'Start with 1d3 minor supernatural artifacts. Once per story, you may produce a relevant artifact from your collection.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Resources 2 or Occult 2'],
    tags: ['resources', 'occult', 'equipment'],
    notes: 'Work with your ST to define your collection. Artifacts may have unpredictable side effects.'
  },
  {
    id: 'black_market',
    name: 'Black Market Access',
    type: 'asset',
    category: 'resources',
    level: 2,
    description: 'You have connections to underground markets dealing in restricted items, including weapons and potentially supernatural goods.',
    effect: '+2 dice to acquire illegal or restricted items. Can purchase items normally unavailable.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Streetwise 2'],
    tags: ['resources', 'criminal', 'equipment'],
    notes: 'Transactions may draw unwanted attention from law enforcement or rival buyers.'
  },
  {
    id: 'cell_contact',
    name: 'Cell Contact',
    type: 'asset',
    category: 'social',
    level: 1,
    description: 'You have reliable contact with other hunter cells who can provide information, backup, or resources.',
    effect: 'Once per session, contact another cell for information or minor assistance. Extended aid requires reciprocation.',
    activation: {
      type: 'simple',
      cost: null
    },
    prerequisites: [],
    tags: ['social', 'network', 'hunters'],
    notes: 'Other cells have their own priorities and may call in favors.'
  },
  {
    id: 'conspiracy_insider',
    name: 'Conspiracy Insider',
    type: 'asset',
    category: 'social',
    level: 3,
    description: 'You have a contact within one of the major hunter conspiracies who feeds you information and resources.',
    effect: 'Gain insider knowledge about conspiracy activities. Once per story, receive a significant resource or warning.',
    activation: {
      type: 'simple',
      cost: null
    },
    prerequisites: ['Subterfuge 2'],
    tags: ['social', 'conspiracy', 'information'],
    notes: 'Your contact risks exposure. Protect their identity or lose the connection.'
  },
  {
    id: 'dead_drop',
    name: 'Dead Drop Network',
    type: 'asset',
    category: 'operational',
    level: 1,
    description: 'You maintain a network of secure locations for exchanging messages and small items.',
    effect: 'Communicate securely with allies. Leave or retrieve items at multiple locations without direct contact.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Streetwise 1'],
    tags: ['operational', 'communication', 'security'],
    notes: 'Dead drops can be discovered if you use them too frequently in one area.'
  },
  {
    id: 'false_identity',
    name: 'False Identity',
    type: 'asset',
    category: 'operational',
    level: 2,
    description: 'You possess a well-documented alternate identity complete with papers, history, and supporting records.',
    effect: 'Operate under an alias that passes background checks. +2 dice to resist identification.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Subterfuge 1'],
    tags: ['operational', 'identity', 'deception'],
    notes: 'Creating a new identity after this one is burned requires significant time and resources.'
  },
  {
    id: 'hunter_network',
    name: 'Hunter Network',
    type: 'asset',
    category: 'social',
    level: 2,
    description: 'You are connected to a broader network of hunters who share information about supernatural threats.',
    effect: '+2 dice to gather information about known supernatural threats. Access to shared monster lore.',
    activation: {
      type: 'simple',
      cost: null
    },
    prerequisites: [],
    tags: ['social', 'information', 'hunters'],
    notes: 'Information shared through the network may be incomplete or inaccurate.'
  },
  {
    id: 'mobile_base',
    name: 'Mobile Base',
    type: 'asset',
    category: 'operational',
    level: 2,
    description: 'You operate from a mobile base of operations—a modified van, RV, or similar vehicle.',
    effect: 'Carry essential equipment. Workspace for research and preparation. Hard to track to a fixed location.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Drive 1', 'Resources 2'],
    tags: ['operational', 'mobility', 'equipment'],
    notes: 'Vehicle requires maintenance and fuel. Distinctive vehicles may be identified.'
  },
  {
    id: 'prototype_gear',
    name: 'Prototype Gear',
    type: 'asset',
    category: 'equipment',
    level: 3,
    description: 'You have access to experimental hunting equipment—cutting-edge technology designed for supernatural threats.',
    effect: 'Start with one prototype weapon or device. May acquire new prototypes through story.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Technology 2 or appropriate contacts'],
    tags: ['equipment', 'technology', 'experimental'],
    notes: 'Prototypes may malfunction. Replacement parts are difficult to obtain.'
  },
  {
    id: 'safe_house_network',
    name: 'Safe House Network',
    type: 'asset',
    category: 'operational',
    level: 2,
    description: 'You have access to multiple safe houses across the city or region.',
    effect: 'Access to secure locations for rest, planning, and storage. Rotate between locations to avoid detection.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Resources 1'],
    tags: ['operational', 'security', 'haven'],
    notes: 'Safe houses require maintenance. Using one too frequently may compromise its security.'
  },
  {
    id: 'safe_passage',
    name: 'Safe Passage',
    type: 'asset',
    category: 'social',
    level: 2,
    description: 'You have arrangements with various factions that allow you to move through their territory unmolested.',
    effect: 'Pass through certain dangerous areas safely. May include vampire domains, werewolf territories, or criminal turf.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Contacts in relevant faction'],
    tags: ['social', 'mobility', 'diplomacy'],
    notes: 'Safe passage agreements can be revoked. Violating terms ends the arrangement permanently.'
  },
  {
    id: 'shadow_network',
    name: 'Shadow Network',
    type: 'asset',
    category: 'social',
    level: 3,
    description: 'You maintain a network of anonymous informants across the city who report unusual activities.',
    effect: '+3 dice to learn about supernatural activity in your area. Early warning of threats.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Streetwise 2', 'Resources 1'],
    tags: ['social', 'information', 'surveillance'],
    notes: 'Informants must be paid or otherwise motivated. They may not understand what they see.'
  },
  {
    id: 'trophy_collection',
    name: 'Trophy Collection',
    type: 'asset',
    category: 'resources',
    level: 1,
    description: 'You keep trophies from your hunts—fangs, claws, symbols—that can prove useful.',
    effect: 'Possess physical evidence of supernatural creatures. May be used to intimidate, research, or identify threats.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['At least one successful hunt'],
    tags: ['resources', 'evidence', 'intimidation'],
    notes: 'Trophies may have residual supernatural properties. Handle with caution.'
  },
  {
    id: 'vehicle_stash',
    name: 'Vehicle Stash',
    type: 'asset',
    category: 'equipment',
    level: 1,
    description: 'Your vehicle has hidden compartments for storing weapons and equipment.',
    effect: 'Carry weapons and gear without detection. +2 dice to hide items from searches.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Drive 1'],
    tags: ['equipment', 'concealment', 'mobility'],
    notes: 'Professional searches may still discover hidden compartments.'
  }
];

// ==========================================
// APTITUDE EDGES
// ==========================================

export const APTITUDE_EDGES = [
  {
    id: 'adrenaline_surge',
    name: 'Adrenaline Surge',
    type: 'aptitude',
    category: 'physical',
    level: 2,
    description: 'In moments of extreme danger, your body releases a surge of adrenaline that enhances your capabilities.',
    effect: 'Once per scene when injured, gain +2 dice to all physical rolls until end of scene.',
    activation: {
      type: 'reflexive',
      cost: null,
      trigger: 'When you take damage'
    },
    prerequisites: ['Stamina 3'],
    tags: ['physical', 'combat', 'survival'],
    notes: 'The crash afterward leaves you fatigued. Cannot be activated again until you rest.'
  },
  {
    id: 'bestial_insight',
    name: 'Bestial Insight',
    type: 'aptitude',
    category: 'mental',
    level: 2,
    description: 'Your time studying monsters has given you an instinctive understanding of predator behavior.',
    effect: '+2 dice to predict or understand monster behavior. May identify creature type from behavior alone.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Occult 2 or survival experience with monsters'],
    tags: ['mental', 'knowledge', 'monsters'],
    notes: 'Works best on creature types you have previously encountered.'
  },
  {
    id: 'combat_instinct',
    name: 'Combat Instinct',
    type: 'aptitude',
    category: 'physical',
    level: 2,
    description: 'Years of fighting for your life have honed your combat reflexes to supernatural sharpness.',
    effect: '+2 to Initiative. Once per combat, reroll all dice on a failed combat roll.',
    activation: {
      type: 'reflexive',
      cost: { willpower: 1 },
      trigger: 'On a failed combat roll'
    },
    prerequisites: ['Brawl 2 or Melee 2 or Firearms 2'],
    tags: ['physical', 'combat', 'reflexes'],
    notes: 'The reroll must be accepted even if worse than the original.'
  },
  {
    id: 'danger_sense',
    name: 'Danger Sense',
    type: 'aptitude',
    category: 'mental',
    level: 2,
    description: 'A preternatural awareness of danger warns you of threats before they materialize.',
    effect: 'Cannot be surprised. +2 dice to detect ambushes. Receive vague warnings of imminent danger.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Wits 3'],
    tags: ['mental', 'perception', 'survival'],
    notes: 'Warnings are instinctive, not specific. You know something is wrong, not what.'
  },
  {
    id: 'endurance',
    name: 'Inhuman Endurance',
    type: 'aptitude',
    category: 'physical',
    level: 2,
    description: 'Your body can withstand punishment that would incapacitate normal humans.',
    effect: 'Ignore wound penalties from the first two health boxes. +2 dice to resist exhaustion and fatigue.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Stamina 3'],
    tags: ['physical', 'resilience', 'survival'],
    notes: 'Does not actually reduce damage—just lets you function despite it.'
  },
  {
    id: 'interrogator',
    name: 'Master Interrogator',
    type: 'aptitude',
    category: 'social',
    level: 2,
    description: 'You have a talent for extracting information from unwilling subjects.',
    effect: '+3 dice to interrogation attempts. May identify lies with a Wits + Insight roll.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Intimidation 2 or Manipulation 3'],
    tags: ['social', 'interrogation', 'information'],
    notes: 'Extended interrogation may have psychological consequences for both parties.'
  },
  {
    id: 'monster_hunter',
    name: 'Monster Hunter',
    type: 'aptitude',
    category: 'combat',
    level: 3,
    description: 'You are a specialist in hunting supernatural prey, with techniques refined through experience.',
    effect: '+2 dice to track supernatural creatures. +1 damage against creatures you have previously fought.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['At least 3 hunts completed'],
    tags: ['combat', 'hunting', 'tracking'],
    notes: 'Keep a journal of creatures you have hunted to track bonus eligibility.'
  },
  {
    id: 'pain_tolerance',
    name: 'Pain Tolerance',
    type: 'aptitude',
    category: 'physical',
    level: 1,
    description: 'You have learned to function through pain that would incapacitate others.',
    effect: 'Reduce wound penalties by 1. +2 dice to resist torture or pain-based compulsion.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Stamina 2'],
    tags: ['physical', 'resilience', 'combat'],
    notes: 'Pain tolerance does not mean pain immunity. Seek medical attention for injuries.'
  },
  {
    id: 'rapid_assessment',
    name: 'Rapid Assessment',
    type: 'aptitude',
    category: 'mental',
    level: 2,
    description: 'You can quickly evaluate a tactical situation and identify threats and opportunities.',
    effect: 'On entering a scene, immediately identify exits, cover, and obvious threats. +2 to tactical planning.',
    activation: {
      type: 'reflexive',
      cost: null,
      trigger: 'On entering a new location'
    },
    prerequisites: ['Wits 2'],
    tags: ['mental', 'tactical', 'perception'],
    notes: 'Does not reveal hidden threats, only obvious tactical features.'
  },
  {
    id: 'rapid_reload',
    name: 'Rapid Reload',
    type: 'aptitude',
    category: 'physical',
    level: 1,
    description: 'Through extensive practice, you can reload firearms with supernatural speed.',
    effect: 'Reload any firearm as a reflexive action. Never fumble a reload.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Firearms 2'],
    tags: ['physical', 'combat', 'firearms'],
    notes: 'Still requires appropriate ammunition to be accessible.'
  },
  {
    id: 'resistance_supernatural',
    name: 'Supernatural Resistance',
    type: 'aptitude',
    category: 'mental',
    level: 3,
    description: 'Your will has been hardened against supernatural influence through exposure or training.',
    effect: '+3 dice to resist supernatural mental powers. May spend Willpower to completely negate one effect per scene.',
    activation: {
      type: 'reflexive',
      cost: { willpower: 1 },
      trigger: 'When targeted by supernatural mental power'
    },
    prerequisites: ['Resolve 3', 'Previous exposure to supernatural powers'],
    tags: ['mental', 'resistance', 'supernatural'],
    notes: 'Does not protect against physical supernatural effects.'
  },
  {
    id: 'tactical_mind',
    name: 'Tactical Mind',
    type: 'aptitude',
    category: 'mental',
    level: 2,
    description: 'You think several steps ahead in combat, positioning yourself and allies advantageously.',
    effect: 'Once per combat, grant +2 dice to one ally\'s next action through tactical advice.',
    activation: {
      type: 'simple',
      cost: null
    },
    prerequisites: ['Intelligence 3', 'At least one combat skill at 2'],
    tags: ['mental', 'tactical', 'leadership'],
    notes: 'Ally must be able to hear and understand your instructions.'
  },
  {
    id: 'weapon_specialist',
    name: 'Weapon Specialist',
    type: 'aptitude',
    category: 'combat',
    level: 2,
    description: 'You have mastered a specific type of weapon, making you exceptionally deadly with it.',
    effect: '+2 dice when using your specialized weapon. Cannot be disarmed while using it.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Relevant weapon skill at 3'],
    tags: ['combat', 'weapons', 'mastery'],
    notes: 'Choose one weapon type (e.g., shotguns, machetes, crossbows). Cannot be changed.'
  }
];

// ==========================================
// ENDOWMENT EDGES
// ==========================================

export const ENDOWMENT_EDGES = [
  {
    id: 'blessed_weapon',
    name: 'Blessed Weapon',
    type: 'endowment',
    category: 'supernatural',
    level: 2,
    description: 'You carry a weapon that has been blessed, sanctified, or imbued with holy power.',
    effect: 'Your weapon deals aggravated damage to creatures with supernatural banes (vampires, demons, etc.).',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Faith or True Faith merit, or appropriate background'],
    tags: ['supernatural', 'combat', 'holy'],
    notes: 'Blessing may fade if used for unholy purposes. Can be renewed through ritual.',
    desperationBonus: 'Add Desperation dice to damage against blessed weapon\'s bane targets.'
  },
  {
    id: 'burning_touch',
    name: 'Burning Touch',
    type: 'endowment',
    category: 'supernatural',
    level: 3,
    description: 'Your touch carries a supernatural heat that can harm creatures of darkness.',
    effect: 'Unarmed attacks deal +2 aggravated damage to supernatural creatures. Touch causes discomfort to such beings.',
    activation: {
      type: 'simple',
      cost: { desperation: 1 },
      duration: 'Scene'
    },
    prerequisites: ['Resolve 3'],
    tags: ['supernatural', 'combat', 'damage'],
    notes: 'Visibly manifests as heat or glow. May be noticed by supernatural beings.',
    desperationBonus: 'Each additional Desperation die spent increases damage by 1.'
  },
  {
    id: 'cleansing_flame',
    name: 'Cleansing Flame',
    type: 'endowment',
    category: 'supernatural',
    level: 4,
    description: 'You can channel your conviction into purifying flames that harm supernatural evil.',
    effect: 'Create supernatural fire (damage 3A) that only harms supernatural creatures and their creations.',
    activation: {
      type: 'standard',
      cost: { desperation: 2 },
      duration: 'Scene'
    },
    prerequisites: ['Resolve 4', 'At least one faith-based merit'],
    tags: ['supernatural', 'damage', 'fire'],
    notes: 'Fire illuminates and may reveal hidden supernatural beings.',
    desperationBonus: 'Double the area affected or damage dealt.'
  },
  {
    id: 'compel_truth',
    name: 'Compel Truth',
    type: 'endowment',
    category: 'supernatural',
    level: 3,
    description: 'Your gaze and voice carry weight that makes it difficult for others to deceive you.',
    effect: 'Contested roll vs. target\'s Composure + Subterfuge. Success: target cannot knowingly lie for the scene.',
    activation: {
      type: 'standard',
      cost: { willpower: 1, desperation: 1 },
      duration: 'Scene'
    },
    prerequisites: ['Manipulation 3', 'Insight 2'],
    tags: ['supernatural', 'social', 'truth'],
    notes: 'Does not compel speech—targets can remain silent. Obvious supernatural effect.',
    desperationBonus: 'Add Desperation dice to the contested roll.'
  },
  {
    id: 'divine_purpose',
    name: 'Divine Purpose',
    type: 'endowment',
    category: 'supernatural',
    level: 2,
    description: 'When acting in accordance with your sworn purpose, you are guided by a higher power.',
    effect: 'When acting directly toward your Drive, gain +2 dice. Once per session, turn a failure into a success.',
    activation: {
      type: 'reflexive',
      cost: { willpower: 1 },
      trigger: 'On a failed roll while pursuing your Drive'
    },
    prerequisites: ['Clear Drive established'],
    tags: ['supernatural', 'motivation', 'guidance'],
    notes: 'Abusing this power for selfish ends may cause it to temporarily fade.',
    desperationBonus: 'Add Desperation dice when invoking the failure-to-success ability.'
  },
  {
    id: 'exorcism',
    name: 'Exorcism',
    type: 'endowment',
    category: 'supernatural',
    level: 4,
    description: 'You can drive out possessing spirits and break supernatural bonds through force of will.',
    effect: 'Extended contest vs. possessing entity. Success forces the entity out and bars re-entry for one lunar month.',
    activation: {
      type: 'extended',
      cost: { willpower: 2, desperation: 2 },
      duration: 'Until complete or abandoned'
    },
    prerequisites: ['Occult 3', 'Resolve 4'],
    tags: ['supernatural', 'spirits', 'banishment'],
    notes: 'Failing an exorcism may anger the entity. Requires appropriate ritual components.',
    desperationBonus: 'Each Desperation die adds one automatic success to the extended contest.'
  },
  {
    id: 'hunters_mark',
    name: 'Hunter\'s Mark',
    type: 'endowment',
    category: 'supernatural',
    level: 2,
    description: 'You can mark a supernatural creature, creating a metaphysical link that helps you track it.',
    effect: 'Mark one creature (requires touch or significant personal item). Always know general direction and distance.',
    activation: {
      type: 'standard',
      cost: { desperation: 1 },
      duration: 'Until removed or creature destroyed'
    },
    prerequisites: ['At least one successful hunt'],
    tags: ['supernatural', 'tracking', 'hunting'],
    notes: 'Mark may be detected by sensitive supernatural beings. Only one mark active at a time.',
    desperationBonus: 'Mark provides +2 to all rolls against the marked creature.'
  },
  {
    id: 'inspiring_presence',
    name: 'Inspiring Presence',
    type: 'endowment',
    category: 'supernatural',
    level: 2,
    description: 'Your presence bolsters the resolve of allies and helps them resist supernatural fear.',
    effect: 'Allies within sight gain +2 dice to resist fear and supernatural compulsion.',
    activation: {
      type: 'simple',
      cost: { willpower: 1 },
      duration: 'Scene'
    },
    prerequisites: ['Charisma 3'],
    tags: ['supernatural', 'leadership', 'protection'],
    notes: 'Allies must be aware of your presence for the bonus to apply.',
    desperationBonus: 'Bonus increases by Desperation pool (to a maximum of +5).'
  },
  {
    id: 'monster_bane',
    name: 'Monster Bane',
    type: 'endowment',
    category: 'supernatural',
    level: 3,
    description: 'Your attacks carry supernatural weight against a specific type of monster.',
    effect: 'Choose one monster type. All your attacks deal +2 damage against that type.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Have killed at least 3 of the chosen creature type'],
    tags: ['supernatural', 'combat', 'specialized'],
    notes: 'The chosen type is permanent. Common choices: vampires, werewolves, ghosts, demons.',
    desperationBonus: 'Add Desperation dice to damage against your bane targets.'
  },
  {
    id: 'occult_library',
    name: 'Occult Library',
    type: 'endowment',
    category: 'knowledge',
    level: 2,
    description: 'You have assembled a collection of genuine occult texts with real supernatural information.',
    effect: '+3 dice to research supernatural topics. May identify creatures and their weaknesses with research.',
    activation: {
      type: 'extended',
      cost: null,
      duration: 'Research time varies'
    },
    prerequisites: ['Occult 2', 'Resources 2 or appropriate background'],
    tags: ['knowledge', 'research', 'occult'],
    notes: 'Library requires protection from theft and supernatural interference.',
    desperationBonus: 'Desperate research can be completed in half the normal time.'
  },
  {
    id: 'sanctified_ground',
    name: 'Sanctified Ground',
    type: 'endowment',
    category: 'supernatural',
    level: 3,
    description: 'You can bless an area, creating a sanctuary that weakens or repels supernatural beings.',
    effect: 'Create a warded area up to a small room. Supernatural beings suffer -2 dice while inside.',
    activation: {
      type: 'extended',
      cost: { willpower: 2, desperation: 1 },
      duration: 'Until next sunrise/sunset'
    },
    prerequisites: ['Occult 2 or faith-based merit'],
    tags: ['supernatural', 'protection', 'warding'],
    notes: 'Ward does not physically prevent entry. Requires ritual preparation.',
    desperationBonus: 'Ward lasts an additional day per Desperation die spent.'
  },
  {
    id: 'sense_monster',
    name: 'Sense the Unnatural',
    type: 'endowment',
    category: 'supernatural',
    level: 2,
    description: 'You have developed an instinctive awareness of supernatural presence.',
    effect: 'Sense when supernatural beings are nearby (within about 30 feet). Does not identify type or location.',
    activation: {
      type: 'passive',
      cost: null
    },
    prerequisites: ['Wits 2', 'Awareness 2'],
    tags: ['supernatural', 'perception', 'detection'],
    notes: 'Manifests as unease, chills, or other physical sensations. May cause false positives.',
    desperationBonus: 'Spend 1 Desperation to determine the general type of nearby creature.'
  },
  {
    id: 'supernatural_sense',
    name: 'Supernatural Sight',
    type: 'endowment',
    category: 'supernatural',
    level: 3,
    description: 'You can perceive supernatural auras and hidden supernatural creatures.',
    effect: 'See through supernatural concealment. Perceive magical auras and recently-used supernatural powers.',
    activation: {
      type: 'simple',
      cost: { willpower: 1 },
      duration: 'Scene'
    },
    prerequisites: ['Occult 2', 'Awareness 3'],
    tags: ['supernatural', 'perception', 'sight'],
    notes: 'The sight can be overwhelming. Extended use may cause headaches or nosebleeds.',
    desperationBonus: 'See the history of supernatural activity in an area (last few hours).'
  },
  {
    id: 'true_faith',
    name: 'True Faith',
    type: 'endowment',
    category: 'supernatural',
    level: 4,
    description: 'Your faith is a weapon—a shield against the darkness that can physically repel evil.',
    effect: 'Present a holy symbol to create a barrier. Supernatural beings must contest Resolve to approach or attack.',
    activation: {
      type: 'simple',
      cost: { willpower: 1 },
      duration: 'Maintained (requires concentration)'
    },
    prerequisites: ['Resolve 4', 'Genuine religious faith'],
    tags: ['supernatural', 'protection', 'faith'],
    notes: 'Must be maintained with concentration. Losing faith weakens or destroys this Edge.',
    desperationBonus: 'Add Desperation pool to the barrier\'s effective strength.'
  },
  {
    id: 'ward_crafting',
    name: 'Ward Crafting',
    type: 'endowment',
    category: 'supernatural',
    level: 2,
    description: 'You know how to create protective wards against specific supernatural threats.',
    effect: 'Create wards against one type of creature. Ward provides +2 difficulty for creature to enter or affect area.',
    activation: {
      type: 'extended',
      cost: { special: 'materials' },
      duration: 'Until broken or dispersed'
    },
    prerequisites: ['Occult 2'],
    tags: ['supernatural', 'protection', 'crafting'],
    notes: 'Different creatures require different ward types. Ward must be physically present.',
    desperationBonus: 'Ward activates an alarm effect when triggered.'
  },
  {
    id: 'weakening_touch',
    name: 'Weakening Touch',
    type: 'endowment',
    category: 'supernatural',
    level: 3,
    description: 'Your touch can temporarily suppress a supernatural creature\'s powers.',
    effect: 'Touch attack. Success: target loses access to one supernatural power for the scene.',
    activation: {
      type: 'standard',
      cost: { desperation: 2 },
      duration: 'Scene'
    },
    prerequisites: ['Resolve 3'],
    tags: ['supernatural', 'combat', 'suppression'],
    notes: 'Choose which power is suppressed at random (ST choice). Does not affect inherent traits.',
    desperationBonus: 'Choose which power is suppressed instead of random selection.'
  }
];

// ==========================================
// PERKS - Minor bonuses associated with Edges
// ==========================================

export const PERKS = [
  {
    id: 'efficient_reload',
    name: 'Efficient Reload',
    associatedEdge: 'rapid_reload',
    effect: '+1 die to reload under stress',
    description: 'Your reload technique is so practiced it barely requires thought.'
  },
  {
    id: 'extended_range',
    name: 'Extended Range',
    associatedEdge: 'weapon_specialist',
    effect: 'Reduce range penalties by 1 with specialized weapon',
    description: 'You know exactly how your weapon performs at every distance.'
  },
  {
    id: 'focused_mind',
    name: 'Focused Mind',
    associatedEdge: 'supernatural_resistance',
    effect: '+1 die to resist distraction while resisting supernatural effects',
    description: 'Your mental defenses are particularly well-developed.'
  },
  {
    id: 'hunters_instinct',
    name: 'Hunter\'s Instinct',
    associatedEdge: 'monster_hunter',
    effect: '+1 die to notice monster ambushes',
    description: 'You\'ve learned to sense when the hunted becomes the hunter.'
  },
  {
    id: 'inspiring_words',
    name: 'Inspiring Words',
    associatedEdge: 'inspiring_presence',
    effect: 'Rally check affects one additional ally',
    description: 'Your words of encouragement reach further than most.'
  },
  {
    id: 'quick_bless',
    name: 'Quick Blessing',
    associatedEdge: 'blessed_weapon',
    effect: 'Renew blessing in 1 minute instead of 10',
    description: 'Your faith allows for swift sanctification.'
  },
  {
    id: 'refined_senses',
    name: 'Refined Senses',
    associatedEdge: 'sense_monster',
    effect: 'Sensing range increased to 50 feet',
    description: 'Your supernatural awareness reaches further.'
  },
  {
    id: 'stable_ward',
    name: 'Stable Ward',
    associatedEdge: 'sanctified_ground',
    effect: 'Ward resists first attempt to break it',
    description: 'Your wards are reinforced against disruption.'
  },
  {
    id: 'tactical_positioning',
    name: 'Tactical Positioning',
    associatedEdge: 'tactical_mind',
    effect: 'Advice can be given as reflexive action',
    description: 'You see openings and call them out instinctively.'
  },
  {
    id: 'trophy_expertise',
    name: 'Trophy Expertise',
    associatedEdge: 'trophy_collection',
    effect: '+1 die to identify creatures from trophies',
    description: 'Your collection has taught you much about monster anatomy.'
  }
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function getAllEdges() {
  return [...ASSET_EDGES, ...APTITUDE_EDGES, ...ENDOWMENT_EDGES];
}

export function getEdgeById(id) {
  return getAllEdges().find(e => e.id === id);
}

export function getEdgesByType(type) {
  switch (type) {
    case 'asset':
      return ASSET_EDGES;
    case 'aptitude':
      return APTITUDE_EDGES;
    case 'endowment':
      return ENDOWMENT_EDGES;
    default:
      return [];
  }
}

export function getEdgesByCategory(category) {
  return getAllEdges().filter(e => e.category === category);
}

export function getEdgesByTag(tag) {
  return getAllEdges().filter(e => e.tags.includes(tag));
}

export function getEdgesForCreed(creedId) {
  const affinities = CREED_AFFINITIES[creedId] || [];
  return getAllEdges().filter(e => affinities.includes(e.id));
}

export function getPerksForEdge(edgeId) {
  return PERKS.filter(p => p.associatedEdge === edgeId);
}

export function getPerkById(id) {
  return PERKS.find(p => p.id === id);
}

export function getAllCategories() {
  const edges = getAllEdges();
  const categories = new Set(edges.map(e => e.category));
  return Array.from(categories).sort();
}

export function getAllTags() {
  const edges = getAllEdges();
  const tags = new Set(edges.flatMap(e => e.tags));
  return Array.from(tags).sort();
}

// Check if character meets prerequisites for an edge
export function meetsPrerequisites(character, edge) {
  // Simplified check - in production this would parse prerequisites properly
  if (!edge.prerequisites || edge.prerequisites.length === 0) {
    return { met: true, missing: [] };
  }
  
  // Return true for now - full implementation would check actual character data
  return { met: true, missing: [] };
}

// Calculate activation cost display
export function formatActivationCost(activation) {
  if (!activation || activation.type === 'passive') {
    return 'Passive';
  }
  
  const costs = [];
  if (activation.cost?.willpower) {
    costs.push(`${activation.cost.willpower} Willpower`);
  }
  if (activation.cost?.desperation) {
    costs.push(`${activation.cost.desperation} Desperation`);
  }
  if (activation.cost?.special) {
    costs.push(activation.cost.special);
  }
  
  if (costs.length === 0) {
    return 'Free';
  }
  
  return costs.join(', ');
}

export default {
  EDGE_CATEGORIES,
  CREED_AFFINITIES,
  ASSET_EDGES,
  APTITUDE_EDGES,
  ENDOWMENT_EDGES,
  PERKS,
  getAllEdges,
  getEdgeById,
  getEdgesByType,
  getEdgesByCategory,
  getEdgesByTag,
  getEdgesForCreed,
  getPerksForEdge,
  getPerkById,
  getAllCategories,
  getAllTags,
  meetsPrerequisites,
  formatActivationCost
};
