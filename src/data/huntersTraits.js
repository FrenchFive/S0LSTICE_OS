/**
 * Hunters RPG Traits Catalog
 * Complete catalog of Backgrounds, Merits, and Flaws
 * Based on Hunter: The Reckoning 5th Edition
 */

export const TRAITS_VERSION = 1;

// ==========================================
// BACKGROUNDS
// ==========================================

export const BACKGROUNDS = [
  {
    id: "allies",
    name: "Allies",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Ally Type",
      description: "Describe your allies - who they are and how they help you.",
      inputType: "text",
      options: []
    },
    tags: ["social", "support"],
    description: "Loyal friends or associates who will help you when called upon. Unlike contacts, allies are actively invested in your wellbeing.",
    levels: [
      { level: 1, label: "One Ally", description: "A single reliable friend or helper.", effect: "One person who will help with minor tasks." },
      { level: 2, label: "A Few Friends", description: "A small group of people you can count on.", effect: "2-3 allies available for moderate assistance." },
      { level: 3, label: "Solid Network", description: "A dependable network of supporters.", effect: "Several allies with varied skills and resources." },
      { level: 4, label: "Strong Support", description: "A significant group ready to assist.", effect: "Numerous allies who can provide substantial help." },
      { level: 5, label: "Devoted Circle", description: "A large network deeply committed to helping you.", effect: "Extensive support network for major operations." }
    ],
    notes: "Allies should have names and motivations. They can be endangered or have their own needs."
  },
  {
    id: "contacts",
    name: "Contacts",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Contact Fields",
      description: "Specify the areas your contacts cover.",
      inputType: "multiSelect",
      options: ["Law Enforcement", "Criminal Underground", "Medical", "Media", "Academia", "Technology", "Street", "Government", "Corporate", "Occult", "Military", "Legal", "Financial", "Transportation", "Entertainment"]
    },
    tags: ["social", "information"],
    description: "A network of informants and acquaintances who can provide information or minor services.",
    levels: [
      { level: 1, label: "A Few Names", description: "One or two people you can occasionally call.", effect: "Limited information in one field." },
      { level: 2, label: "Small Network", description: "Several useful contacts across a couple areas.", effect: "Reliable information in 2-3 fields." },
      { level: 3, label: "Well Connected", description: "Multiple contacts in various spheres.", effect: "Good information access across several fields." },
      { level: 4, label: "Extensive Network", description: "Wide-reaching contacts in many areas.", effect: "Broad and reliable information gathering." },
      { level: 5, label: "Information Broker", description: "You know people everywhere.", effect: "Exceptional access to information and small favors." }
    ],
    notes: "Contacts provide information, not direct action. Overuse may strain relationships."
  },
  {
    id: "fame",
    name: "Fame",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Source of Fame",
      description: "Why are you famous? (Actor, musician, athlete, social media, etc.)",
      inputType: "text",
      options: []
    },
    tags: ["social", "reputation"],
    description: "Public recognition and celebrity status. Can open doors but also draws unwanted attention.",
    levels: [
      { level: 1, label: "Local Celebrity", description: "Known in a small community or niche.", effect: "Recognized occasionally in limited circles." },
      { level: 2, label: "Minor Fame", description: "Known in your city or subculture.", effect: "Regular recognition; easier social interactions locally." },
      { level: 3, label: "Regional Fame", description: "Known across a large region.", effect: "Significant recognition; social advantages and complications." },
      { level: 4, label: "National Fame", description: "Known across the country.", effect: "Major celebrity; opens many doors but hard to hide." },
      { level: 5, label: "International Fame", description: "World-famous celebrity.", effect: "Global recognition; massive influence but zero anonymity." }
    ],
    notes: "Fame can complicate hunting. Paparazzi, fans, and enemies all notice you."
  },
  {
    id: "influence",
    name: "Influence",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Sphere of Influence",
      description: "Which area do you have influence over?",
      inputType: "select",
      options: ["Politics", "Police", "Media", "Finance", "Crime", "Church", "Health", "Legal", "Transportation", "Bureaucracy", "Industry", "High Society", "Street"]
    },
    tags: ["social", "power"],
    description: "The ability to affect decisions and events in a particular sphere of society.",
    levels: [
      { level: 1, label: "Minor Voice", description: "Some say in minor decisions.", effect: "Can influence small matters in your sphere." },
      { level: 2, label: "Local Power", description: "Noticeable pull in local affairs.", effect: "Can sway moderate decisions locally." },
      { level: 3, label: "Significant Clout", description: "Real power in your sphere.", effect: "Can push through significant changes." },
      { level: 4, label: "Major Player", description: "One of the important voices.", effect: "Substantial control over your sphere." },
      { level: 5, label: "Dominant Force", description: "Nearly unmatched influence.", effect: "Can reshape your sphere significantly." }
    ],
    notes: "Influence requires maintenance and can be challenged by rivals."
  },
  {
    id: "mask",
    name: "Mask",
    type: "background",
    category: "identity",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Cover Identity",
      description: "Describe your alternate identity - name, occupation, background.",
      inputType: "text",
      options: []
    },
    tags: ["identity", "deception"],
    description: "A carefully constructed alternate identity with supporting documentation and history.",
    levels: [
      { level: 1, label: "Basic Cover", description: "Simple fake ID and backstory.", effect: "Survives casual inspection only." },
      { level: 2, label: "Solid Identity", description: "Documented identity with some history.", effect: "Passes basic background checks." },
      { level: 3, label: "Established Persona", description: "Well-documented with verifiable history.", effect: "Withstands moderate investigation." },
      { level: 4, label: "Deep Cover", description: "Extensively documented with long history.", effect: "Survives thorough investigation." },
      { level: 5, label: "Perfect Identity", description: "Essentially real - birth records, school, employment.", effect: "Nearly impossible to disprove." }
    ],
    notes: "Masks can be burned. Once compromised, they're difficult to restore."
  },
  {
    id: "mentor",
    name: "Mentor",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Mentor Description",
      description: "Who is your mentor and what expertise do they offer?",
      inputType: "text",
      options: []
    },
    tags: ["social", "knowledge"],
    description: "An experienced hunter or expert who guides and teaches you.",
    levels: [
      { level: 1, label: "Occasional Advisor", description: "Someone who helps when asked.", effect: "Occasional advice and minor assistance." },
      { level: 2, label: "Helpful Guide", description: "A reliable source of guidance.", effect: "Regular advice and teaching." },
      { level: 3, label: "Experienced Teacher", description: "A skilled mentor invested in your growth.", effect: "Significant teaching and resources." },
      { level: 4, label: "Master Hunter", description: "A highly experienced hunter-teacher.", effect: "Expert guidance and valuable connections." },
      { level: 5, label: "Legendary Mentor", description: "One of the most experienced hunters alive.", effect: "Unparalleled wisdom and vast resources." }
    ],
    notes: "Mentors have their own agendas. They may call in favors or disagree with your methods."
  },
  {
    id: "resources",
    name: "Resources",
    type: "background",
    category: "wealth",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["financial", "material"],
    description: "Your access to money, income, and liquid assets.",
    levels: [
      { level: 1, label: "Tight Budget", description: "Living paycheck to paycheck.", effect: "Can afford basic expenses; struggle with surprises." },
      { level: 2, label: "Stable Income", description: "Modest but reliable income.", effect: "Comfortable living; occasional larger purchases." },
      { level: 3, label: "Comfortable", description: "Good disposable income and savings.", effect: "Can buy specialized gear without hardship." },
      { level: 4, label: "Wealthy", description: "Money rarely an obstacle.", effect: "Expensive purchases have minimal impact." },
      { level: 5, label: "Very Wealthy", description: "Substantial wealth and investments.", effect: "Funding operations is trivial." }
    ],
    notes: "Resources can fund equipment, bribes, travel, and safe houses."
  },
  {
    id: "retainers",
    name: "Retainers",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Retainer Type",
      description: "Describe your retainers - servants, employees, assistants.",
      inputType: "text",
      options: []
    },
    tags: ["social", "service"],
    description: "Loyal servants, employees, or assistants who work for you.",
    levels: [
      { level: 1, label: "One Helper", description: "A single loyal assistant.", effect: "One person handling basic tasks." },
      { level: 2, label: "Small Staff", description: "A few dedicated employees.", effect: "2-3 retainers for various duties." },
      { level: 3, label: "Capable Team", description: "A well-trained small team.", effect: "Several skilled retainers." },
      { level: 4, label: "Large Staff", description: "Numerous employees.", effect: "Substantial workforce for complex operations." },
      { level: 5, label: "Organization", description: "A small organization serves you.", effect: "Extensive staff for any need." }
    ],
    notes: "Retainers are not hunters - they may not know about the supernatural."
  },
  {
    id: "safe_place",
    name: "Safe Place",
    type: "background",
    category: "haven",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Location Description",
      description: "Describe your safe house - location, type, features.",
      inputType: "text",
      options: []
    },
    tags: ["security", "haven"],
    description: "A secure location where you can hide, recover, and store equipment.",
    levels: [
      { level: 1, label: "Bolt Hole", description: "A simple hidden spot.", effect: "Basic concealment; minimal security." },
      { level: 2, label: "Safe Room", description: "A dedicated secure space.", effect: "Good locks; basic security measures." },
      { level: 3, label: "Safe House", description: "A properly secured location.", effect: "Alarm systems; reinforced access." },
      { level: 4, label: "Fortified Location", description: "Seriously protected site.", effect: "Professional security; multiple defenses." },
      { level: 5, label: "Hidden Fortress", description: "Nearly impregnable sanctuary.", effect: "Military-grade security; very hard to find." }
    ],
    notes: "Safe places can be discovered and compromised. Consider backup locations."
  },
  {
    id: "status",
    name: "Status",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Organization",
      description: "Which organization do you have status in?",
      inputType: "text",
      options: []
    },
    tags: ["social", "authority"],
    description: "Your standing and rank within an organization or community.",
    levels: [
      { level: 1, label: "Known Member", description: "Recognized as part of the group.", effect: "Basic membership privileges." },
      { level: 2, label: "Respected Member", description: "You've proven yourself.", effect: "Some authority; people listen." },
      { level: 3, label: "Valued Member", description: "Significant standing.", effect: "Real influence within the group." },
      { level: 4, label: "Leader", description: "A high-ranking position.", effect: "Authority over others; major decisions." },
      { level: 5, label: "Top Authority", description: "Highest echelons.", effect: "Maximum authority and respect." }
    ],
    notes: "Status comes with responsibilities. You may be called upon to serve the organization."
  },
  {
    id: "herd",
    name: "Herd",
    type: "background",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Herd Type",
      description: "Who makes up your herd? (Groupies, cult, blood dolls, etc.)",
      inputType: "text",
      options: []
    },
    tags: ["social", "feeding"],
    description: "A group of mortals who willingly provide blood or other services.",
    levels: [
      { level: 1, label: "A Few Donors", description: "2-3 willing individuals.", effect: "Occasional reliable feeding." },
      { level: 2, label: "Small Group", description: "A small devoted group.", effect: "Regular access to feeding." },
      { level: 3, label: "Cult Following", description: "A dedicated group.", effect: "Plentiful and eager donors." },
      { level: 4, label: "Large Herd", description: "Many devoted followers.", effect: "Never want for feeding." },
      { level: 5, label: "Mass Following", description: "A substantial population.", effect: "Unlimited feeding access." }
    ],
    notes: "Primarily for vampire chronicles but adaptable for hunter campaigns with appropriate context."
  },
  {
    id: "domain",
    name: "Domain",
    type: "background",
    category: "territory",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Territory",
      description: "Describe your territory - location, size, notable features.",
      inputType: "text",
      options: []
    },
    tags: ["territory", "control"],
    description: "A territory you control or have significant influence over.",
    levels: [
      { level: 1, label: "Small Turf", description: "A single building or block.", effect: "Control over a tiny area." },
      { level: 2, label: "Neighborhood", description: "Several blocks.", effect: "Known and respected locally." },
      { level: 3, label: "District", description: "A significant area.", effect: "Substantial territorial control." },
      { level: 4, label: "Large Territory", description: "A major portion of the city.", effect: "Major territorial authority." },
      { level: 5, label: "Vast Domain", description: "An entire city or region.", effect: "Dominant territorial control." }
    ],
    notes: "Domain requires defense and maintenance. Rivals may challenge your control."
  }
];

// ==========================================
// MERITS
// ==========================================

export const MERITS = [
  // MENTAL MERITS
  {
    id: "iron_will",
    name: "Iron Will",
    type: "merit",
    category: "mental",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "resistance"],
    description: "Your mind is hardened against manipulation, fear, and despair.",
    levels: [
      { level: 1, label: "Firm Resolve", description: "More stubborn than most.", effect: "+1 die to resist mental influence." },
      { level: 2, label: "Unshakable", description: "Rarely falter under pressure.", effect: "+2 dice to resist mental influence." },
      { level: 3, label: "Indomitable", description: "Breaking your will requires immense effort.", effect: "+3 dice to resist mental influence." }
    ],
    notes: "Applies to supernatural compulsion, intimidation, and fear effects."
  },
  {
    id: "danger_sense",
    name: "Danger Sense",
    type: "merit",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "perception"],
    description: "An uncanny ability to sense when something is wrong.",
    levels: [
      { level: 1, label: "Gut Feelings", description: "Sometimes sense danger.", effect: "+1 die to avoid ambushes." },
      { level: 2, label: "Sixth Sense", description: "Reliably sense imminent threats.", effect: "+2 dice to avoid ambushes and surprise." }
    ],
    notes: "Does not reveal the nature of danger, just that something is wrong."
  },
  {
    id: "eidetic_memory",
    name: "Eidetic Memory",
    type: "merit",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "memory"],
    description: "Perfect recall of things you've seen, heard, or read.",
    levels: [
      { level: 1, label: "Strong Memory", description: "Excellent recall.", effect: "+1 to recall information." },
      { level: 2, label: "Perfect Recall", description: "Remember everything perfectly.", effect: "+2 to recall; near-perfect memory." }
    ],
    notes: "Useful for clues, codes, and details encountered during investigation."
  },
  {
    id: "encyclopedic_knowledge",
    name: "Encyclopedic Knowledge",
    type: "merit",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Field of Knowledge",
      description: "What area do you have encyclopedic knowledge of?",
      inputType: "text",
      options: []
    },
    tags: ["mental", "knowledge"],
    description: "Deep expertise in a particular field of knowledge.",
    levels: [
      { level: 1, label: "Well-Read", description: "Extensive knowledge in your field.", effect: "+1 die for knowledge in your specialty." },
      { level: 2, label: "Expert", description: "World-class expertise.", effect: "+2 dice; considered an authority." }
    ],
    notes: "Choose a specific field: folklore, chemistry, history, etc."
  },
  {
    id: "light_sleeper",
    name: "Light Sleeper",
    type: "merit",
    category: "mental",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "awareness"],
    description: "You wake at the slightest disturbance.",
    levels: [
      { level: 1, label: "Light Sleeper", description: "Wake instantly at any noise.", effect: "Cannot be surprised while sleeping." }
    ],
    notes: "Useful for avoiding nighttime attacks."
  },
  {
    id: "meditative_mind",
    name: "Meditative Mind",
    type: "merit",
    category: "mental",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "composure"],
    description: "You can find calm and focus even in stressful situations.",
    levels: [
      { level: 1, label: "Centered", description: "Quickly regain composure.", effect: "Reduce time to regain Willpower." },
      { level: 2, label: "Serene", description: "Maintain calm in chaos.", effect: "Bonus to resist stress and panic." },
      { level: 3, label: "Zen Master", description: "Unshakeable inner peace.", effect: "Significant composure bonuses." }
    ],
    notes: "Helps recover from traumatic experiences."
  },
  {
    id: "common_sense",
    name: "Common Sense",
    type: "merit",
    category: "mental",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "judgment"],
    description: "You have good practical judgment.",
    levels: [
      { level: 1, label: "Common Sense", description: "ST warns you before obviously bad decisions.", effect: "GM hints when about to do something foolish." }
    ],
    notes: "A safety net against poor player choices, not character stupidity."
  },
  {
    id: "concentration",
    name: "Concentration",
    type: "merit",
    category: "mental",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "focus"],
    description: "You can focus intently despite distractions.",
    levels: [
      { level: 1, label: "Concentration", description: "Ignore distractions.", effect: "No penalty from environmental distractions." }
    ],
    notes: "Does not help against direct attacks or supernatural interference."
  },
  {
    id: "patience",
    name: "Patience",
    type: "merit",
    category: "mental",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "composure"],
    description: "You can wait calmly for extended periods.",
    levels: [
      { level: 1, label: "Patience", description: "Wait without growing restless.", effect: "Bonus to extended actions requiring patience." }
    ],
    notes: "Useful for stakeouts and investigations."
  },

  // PHYSICAL MERITS
  {
    id: "ambidextrous",
    name: "Ambidextrous",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "dexterity"],
    description: "You can use both hands with equal skill.",
    levels: [
      { level: 1, label: "Ambidextrous", description: "No off-hand penalty.", effect: "No penalty for using off-hand." }
    ],
    notes: "Useful for dual-wielding or when injured."
  },
  {
    id: "catlike_balance",
    name: "Catlike Balance",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "dexterity"],
    description: "Exceptional balance and sure-footedness.",
    levels: [
      { level: 1, label: "Catlike Balance", description: "Rarely lose your footing.", effect: "+2 dice to balance; reduced fall damage." }
    ],
    notes: "Useful for rooftop chases and precarious situations."
  },
  {
    id: "direction_sense",
    name: "Direction Sense",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "navigation"],
    description: "An innate sense of direction.",
    levels: [
      { level: 1, label: "Direction Sense", description: "Always know which way is north.", effect: "Cannot get lost; +2 to navigation." }
    ],
    notes: "Works even underground or in unfamiliar areas."
  },
  {
    id: "fast_reflexes",
    name: "Fast Reflexes",
    type: "merit",
    category: "physical",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "speed"],
    description: "Lightning-quick reaction time.",
    levels: [
      { level: 1, label: "Quick", description: "Faster than average.", effect: "+1 to Initiative." },
      { level: 2, label: "Very Quick", description: "Notably fast reactions.", effect: "+2 to Initiative." },
      { level: 3, label: "Lightning Reflexes", description: "Among the fastest.", effect: "+3 to Initiative." }
    ],
    notes: "Critical for combat-focused characters."
  },
  {
    id: "fleet_of_foot",
    name: "Fleet of Foot",
    type: "merit",
    category: "physical",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "speed"],
    description: "You run faster than most people.",
    levels: [
      { level: 1, label: "Swift", description: "Faster than average.", effect: "+1 to Speed." },
      { level: 2, label: "Very Swift", description: "Notably fast runner.", effect: "+2 to Speed." },
      { level: 3, label: "Sprinter", description: "Exceptional speed.", effect: "+3 to Speed." }
    ],
    notes: "Useful for chases and escapes."
  },
  {
    id: "hardy",
    name: "Hardy",
    type: "merit",
    category: "physical",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "resilience"],
    description: "You can endure more physical punishment than normal.",
    levels: [
      { level: 1, label: "Tough", description: "More resilient than average.", effect: "+1 Health box." },
      { level: 2, label: "Very Tough", description: "Notably durable.", effect: "+2 Health boxes." },
      { level: 3, label: "Iron Constitution", description: "Exceptional endurance.", effect: "+3 Health boxes." }
    ],
    notes: "Extra health can save your life."
  },
  {
    id: "iron_stomach",
    name: "Iron Stomach",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "resilience"],
    description: "You can eat almost anything without getting sick.",
    levels: [
      { level: 1, label: "Iron Stomach", description: "Resistant to food-based illness.", effect: "+2 to resist ingested toxins and illness." }
    ],
    notes: "Useful against poison and tainted food."
  },
  {
    id: "giant",
    name: "Giant",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "size"],
    description: "You are significantly larger than average.",
    levels: [
      { level: 1, label: "Giant", description: "Over 6'5\" and heavily built.", effect: "+1 Size; +1 Health; harder to hide." }
    ],
    notes: "Increased size makes stealth more difficult."
  },
  {
    id: "small_frame",
    name: "Small Frame",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "size"],
    description: "You are smaller than average but quick.",
    levels: [
      { level: 1, label: "Small Frame", description: "Under 5' tall.", effect: "-1 Size; +2 to hide; easier to grapple." }
    ],
    notes: "Smaller size aids stealth but hinders combat."
  },
  {
    id: "quick_healer",
    name: "Quick Healer",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "healing"],
    description: "You recover from injuries faster than normal.",
    levels: [
      { level: 1, label: "Quick Healer", description: "Heal at double normal rate.", effect: "Halve healing time." }
    ],
    notes: "Very valuable for hunters who frequently take damage."
  },
  {
    id: "natural_immunity",
    name: "Natural Immunity",
    type: "merit",
    category: "physical",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "resistance"],
    description: "Your immune system is exceptionally strong.",
    levels: [
      { level: 1, label: "Natural Immunity", description: "Rarely get sick.", effect: "+2 to resist disease and infection." }
    ],
    notes: "Does not protect against supernatural diseases."
  },
  {
    id: "toxin_resistance",
    name: "Toxin Resistance",
    type: "merit",
    category: "physical",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "resistance"],
    description: "Your body resists poisons and drugs.",
    levels: [
      { level: 1, label: "Resistant", description: "Better than average resistance.", effect: "+1 to resist toxins." },
      { level: 2, label: "Very Resistant", description: "Significantly resistant.", effect: "+2 to resist toxins." }
    ],
    notes: "Useful against poisoned weapons and drugged drinks."
  },

  // SOCIAL MERITS
  {
    id: "striking_looks",
    name: "Striking Looks",
    type: "merit",
    category: "social",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["social", "appearance"],
    description: "You are remarkably attractive or memorable in appearance.",
    levels: [
      { level: 1, label: "Attractive", description: "Noticeably good-looking.", effect: "+1 to social rolls based on appearance." },
      { level: 2, label: "Stunning", description: "Remarkably beautiful/handsome.", effect: "+2 to social rolls; memorable." }
    ],
    notes: "Being memorable can be a disadvantage for stealth."
  },
  {
    id: "inspiring",
    name: "Inspiring",
    type: "merit",
    category: "social",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["social", "leadership"],
    description: "Your presence and words motivate others.",
    levels: [
      { level: 1, label: "Encouraging", description: "People feel better around you.", effect: "+1 to rally or motivate others." },
      { level: 2, label: "Inspiring", description: "Your words carry weight.", effect: "+2 to inspire and lead." },
      { level: 3, label: "Legendary Presence", description: "People would follow you anywhere.", effect: "+3 to leadership and inspiration." }
    ],
    notes: "Useful for cell leaders and coordinators."
  },
  {
    id: "natural_leader",
    name: "Natural Leader",
    type: "merit",
    category: "social",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["social", "leadership"],
    description: "People naturally look to you for guidance.",
    levels: [
      { level: 1, label: "Natural Leader", description: "Others follow your lead.", effect: "+2 to command and organize groups." }
    ],
    notes: "Works best with people who recognize your authority."
  },
  {
    id: "barfly",
    name: "Barfly",
    type: "merit",
    category: "social",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["social", "streetwise"],
    description: "You fit in perfectly in bars and similar establishments.",
    levels: [
      { level: 1, label: "Barfly", description: "Know how to work a bar.", effect: "+2 to social rolls in bars; always find info." }
    ],
    notes: "Useful for gathering street-level information."
  },
  {
    id: "language",
    name: "Language",
    type: "merit",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Languages",
      description: "List the additional languages you speak.",
      inputType: "text",
      options: []
    },
    tags: ["social", "communication"],
    description: "Fluency in additional languages.",
    levels: [
      { level: 1, label: "One Language", description: "Speak one additional language.", effect: "Fluent in 1 extra language." },
      { level: 2, label: "Two Languages", description: "Speak two additional languages.", effect: "Fluent in 2 extra languages." },
      { level: 3, label: "Three Languages", description: "Speak three additional languages.", effect: "Fluent in 3 extra languages." },
      { level: 4, label: "Four Languages", description: "Speak four additional languages.", effect: "Fluent in 4 extra languages." },
      { level: 5, label: "Polyglot", description: "Speak many languages.", effect: "Fluent in 5+ extra languages." }
    ],
    notes: "Specify which languages when taking this merit."
  },
  {
    id: "anonymity",
    name: "Anonymity",
    type: "merit",
    category: "social",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["social", "stealth"],
    description: "You are remarkably forgettable and hard to track.",
    levels: [
      { level: 1, label: "Forgettable", description: "People rarely remember you.", effect: "+1 difficulty to track or identify you." },
      { level: 2, label: "Ghost", description: "Extremely hard to remember.", effect: "+2 difficulty to track or identify you." }
    ],
    notes: "Opposite of Fame - useful for undercover work."
  },
  {
    id: "closed_book",
    name: "Closed Book",
    type: "merit",
    category: "social",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["social", "deception"],
    description: "Your true thoughts and feelings are hard to read.",
    levels: [
      { level: 1, label: "Guarded", description: "Hard to read.", effect: "+1 difficulty to read your emotions." },
      { level: 2, label: "Inscrutable", description: "Very hard to read.", effect: "+2 difficulty to read your emotions." },
      { level: 3, label: "Blank Slate", description: "Nearly impossible to read.", effect: "+3 difficulty to read your emotions." }
    ],
    notes: "Protects against supernatural emotion reading."
  },
  {
    id: "cult_leader",
    name: "Cult Leader",
    type: "merit",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Cult Description",
      description: "Describe your cult - its beliefs, size, and nature.",
      inputType: "text",
      options: []
    },
    tags: ["social", "followers"],
    description: "You lead a group of devoted followers.",
    levels: [
      { level: 1, label: "Small Following", description: "A handful of believers.", effect: "5-10 devoted followers." },
      { level: 2, label: "Growing Cult", description: "A small but dedicated group.", effect: "20-30 followers." },
      { level: 3, label: "Established Cult", description: "A significant following.", effect: "50-100 followers." },
      { level: 4, label: "Large Cult", description: "A substantial organization.", effect: "Several hundred followers." },
      { level: 5, label: "Major Movement", description: "A significant religious movement.", effect: "Thousands of followers." }
    ],
    notes: "Cultists are devoted but may have their own interpretations of your teachings."
  },

  // COMBAT MERITS
  {
    id: "brawling_expertise",
    name: "Brawling",
    type: "merit",
    category: "combat",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["combat", "melee"],
    description: "Trained in unarmed combat techniques.",
    levels: [
      { level: 1, label: "Body Blow", description: "Target the body.", effect: "Ignore 1 armor on body shots." },
      { level: 2, label: "Duck and Weave", description: "Defensive movement.", effect: "Add Brawl to defense once per scene." },
      { level: 3, label: "Combination", description: "Rapid strikes.", effect: "Make two attacks at -1 each." },
      { level: 4, label: "Haymaker", description: "Devastating punch.", effect: "+2 damage on successful hit." },
      { level: 5, label: "Brutal Blow", description: "Knockout strike.", effect: "Stun opponent on exceptional success." }
    ],
    notes: "Progression through the fighting style."
  },
  {
    id: "firearms_expertise",
    name: "Firearms",
    type: "merit",
    category: "combat",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["combat", "ranged"],
    description: "Expert training in firearms use.",
    levels: [
      { level: 1, label: "Quick Draw", description: "Draw and fire quickly.", effect: "Draw and fire in same action." },
      { level: 2, label: "Tactical Reload", description: "Reload efficiently.", effect: "Reload as reflexive action." },
      { level: 3, label: "Double Tap", description: "Two quick shots.", effect: "Fire twice at -1 to each." },
      { level: 4, label: "Sniper", description: "Expert aim.", effect: "+2 to aimed shots." },
      { level: 5, label: "Gunslinger", description: "Master marksman.", effect: "Ignore penalties for called shots." }
    ],
    notes: "Requires access to firearms."
  },
  {
    id: "melee_expertise",
    name: "Melee",
    type: "merit",
    category: "combat",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["combat", "melee"],
    description: "Trained in armed melee combat.",
    levels: [
      { level: 1, label: "Thrust", description: "Precise strike.", effect: "+1 to hit with melee weapons." },
      { level: 2, label: "Riposte", description: "Counter-attack.", effect: "Free attack after successful defense." },
      { level: 3, label: "Heavy Hand", description: "Powerful blows.", effect: "+1 damage with melee weapons." },
      { level: 4, label: "Weaponmaster", description: "Expert technique.", effect: "Reduce penalties by 2." },
      { level: 5, label: "Lethal Precision", description: "Deadly accuracy.", effect: "+2 to called shots; +1 damage." }
    ],
    notes: "Applicable to knives, swords, clubs, etc."
  },
  {
    id: "defensive_combat",
    name: "Defensive Combat",
    type: "merit",
    category: "combat",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["combat", "defense"],
    description: "Trained in defensive fighting techniques.",
    levels: [
      { level: 1, label: "Cautious Strike", description: "Fight defensively.", effect: "-1 attack for +1 defense." },
      { level: 2, label: "Combat Awareness", description: "Read the battlefield.", effect: "+1 defense against multiple opponents." },
      { level: 3, label: "Untouchable", description: "Expert defense.", effect: "Take full defense as reflexive action once per turn." }
    ],
    notes: "Useful for survival-focused characters."
  },

  // EDGE ENHANCEMENT MERITS
  {
    id: "edge_touched",
    name: "Edge Touched",
    type: "merit",
    category: "supernatural",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Enhanced Edge",
      description: "Which Edge is enhanced by this merit?",
      inputType: "text",
      options: []
    },
    tags: ["supernatural", "edge"],
    description: "One of your Edges is particularly powerful.",
    levels: [
      { level: 1, label: "Touched", description: "Minor enhancement.", effect: "+1 die when using this Edge." },
      { level: 2, label: "Gifted", description: "Notable enhancement.", effect: "+2 dice when using this Edge." },
      { level: 3, label: "Blessed", description: "Major enhancement.", effect: "+3 dice when using this Edge." }
    ],
    notes: "Specify which Edge is enhanced."
  },

  // PROFESSIONAL MERITS
  {
    id: "professional_training",
    name: "Professional Training",
    type: "merit",
    category: "professional",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Profession",
      description: "What is your professional background?",
      inputType: "select",
      options: ["Academic", "Artist", "Athlete", "Criminal", "Detective", "Doctor", "Engineer", "Hacker", "Journalist", "Lawyer", "Military", "Occultist", "Politician", "Priest", "Scientist", "Socialite", "Soldier", "Spy", "Survivalist", "Technician"]
    },
    tags: ["professional", "skills"],
    description: "Specialized training in a profession.",
    levels: [
      { level: 1, label: "Hobbyist", description: "Some training.", effect: "Choose 2 professional skills as Asset Skills." },
      { level: 2, label: "Trained", description: "Formal training.", effect: "9-again on Asset Skills." },
      { level: 3, label: "Professional", description: "Working professional.", effect: "Free Specialty in each Asset Skill." },
      { level: 4, label: "Expert", description: "Highly experienced.", effect: "8-again on Asset Skills." },
      { level: 5, label: "Master", description: "Among the best.", effect: "Rote quality on Asset Skills once per session." }
    ],
    notes: "Asset Skills depend on profession chosen."
  },
  {
    id: "area_of_expertise",
    name: "Area of Expertise",
    type: "merit",
    category: "professional",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: true,
    detail: {
      label: "Specialty",
      description: "Which Specialty does this apply to?",
      inputType: "text",
      options: []
    },
    tags: ["professional", "skills"],
    description: "Exceptional expertise in a specific Specialty.",
    levels: [
      { level: 1, label: "Area of Expertise", description: "Expert in one area.", effect: "9-again on rolls using this Specialty." }
    ],
    notes: "Must already have the Specialty."
  },
  {
    id: "investigative_mind",
    name: "Investigative Mind",
    type: "merit",
    category: "professional",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["professional", "investigation"],
    description: "Natural talent for investigation and deduction.",
    levels: [
      { level: 1, label: "Keen Eye", description: "Notice small details.", effect: "+1 to Investigation rolls." },
      { level: 2, label: "Methodical", description: "Thorough investigator.", effect: "+2 to Investigation; find hidden clues." },
      { level: 3, label: "Mastermind", description: "Exceptional deduction.", effect: "+3 to Investigation; connect distant clues." }
    ],
    notes: "Extremely useful for hunters."
  },
  {
    id: "occult_expertise",
    name: "Occult Expertise",
    type: "merit",
    category: "professional",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["professional", "occult"],
    description: "Deep knowledge of the supernatural.",
    levels: [
      { level: 1, label: "Studied", description: "More than casual knowledge.", effect: "+1 to Occult rolls." },
      { level: 2, label: "Scholar", description: "Serious occult scholar.", effect: "+2 to Occult; identify supernatural creatures." },
      { level: 3, label: "Expert", description: "Authority on the occult.", effect: "+3 to Occult; know weaknesses." }
    ],
    notes: "Critical for identifying and combating supernatural threats."
  }
];

// ==========================================
// FLAWS
// ==========================================

export const FLAWS = [
  // ADDICTION FLAWS
  {
    id: "addiction",
    name: "Addiction",
    type: "flaw",
    category: "compulsion",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Substance",
      description: "What are you addicted to?",
      inputType: "text",
      options: []
    },
    tags: ["mental", "compulsion"],
    description: "You are dependent on a substance or behavior.",
    levels: [
      { level: 1, label: "Habit", description: "Mild dependency.", effect: "-1 when deprived for extended time." },
      { level: 2, label: "Compulsion", description: "Significant addiction.", effect: "-2 when deprived; daily need." },
      { level: 3, label: "Severe Addiction", description: "Life-controlling addiction.", effect: "-3 when deprived; serious withdrawal." }
    ],
    notes: "Deprivation penalties apply to most actions."
  },

  // PHYSICAL FLAWS
  {
    id: "bad_sight",
    name: "Bad Sight",
    type: "flaw",
    category: "physical",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "sensory"],
    description: "Your vision is impaired.",
    levels: [
      { level: 1, label: "Poor Vision", description: "Nearsighted or farsighted.", effect: "-1 to sight-based rolls without corrective lenses." },
      { level: 2, label: "Severely Impaired", description: "Very poor vision.", effect: "-2 to sight-based rolls; corrective lenses reduce to -1." }
    ],
    notes: "Glasses or contacts can be lost or broken."
  },
  {
    id: "hard_of_hearing",
    name: "Hard of Hearing",
    type: "flaw",
    category: "physical",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "sensory"],
    description: "Your hearing is impaired.",
    levels: [
      { level: 1, label: "Hearing Impaired", description: "Partial hearing loss.", effect: "-1 to hearing-based rolls." },
      { level: 2, label: "Severe Hearing Loss", description: "Major hearing impairment.", effect: "-2 to hearing-based rolls; may miss quiet sounds." }
    ],
    notes: "Hearing aids can help but may malfunction."
  },
  {
    id: "lame",
    name: "Lame",
    type: "flaw",
    category: "physical",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "mobility"],
    description: "You have difficulty walking or moving.",
    levels: [
      { level: 1, label: "Limp", description: "Noticeable limp.", effect: "-1 Speed; -1 to running/climbing." },
      { level: 2, label: "Significant Impairment", description: "Serious mobility issues.", effect: "-2 Speed; -2 to physical mobility." },
      { level: 3, label: "Crippled", description: "Severe mobility impairment.", effect: "Halve Speed; require mobility aid." }
    ],
    notes: "May require cane, wheelchair, or other assistance."
  },
  {
    id: "one_arm",
    name: "One Arm",
    type: "flaw",
    category: "physical",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "disability"],
    description: "You are missing or have limited use of one arm.",
    levels: [
      { level: 1, label: "Weak Arm", description: "Limited use of one arm.", effect: "-1 to two-handed tasks." },
      { level: 2, label: "Partial Arm", description: "Severely limited arm.", effect: "-2 to two-handed tasks." },
      { level: 3, label: "Missing Arm", description: "Completely missing one arm.", effect: "Cannot do two-handed tasks; -2 to grappling." }
    ],
    notes: "Prosthetics may reduce penalties."
  },
  {
    id: "chronic_pain",
    name: "Chronic Pain",
    type: "flaw",
    category: "physical",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "health"],
    description: "You suffer from persistent pain.",
    levels: [
      { level: 1, label: "Occasional Pain", description: "Pain flares occasionally.", effect: "-1 to extended physical actions." },
      { level: 2, label: "Frequent Pain", description: "Regular painful episodes.", effect: "-2 when pain flares; happens often." },
      { level: 3, label: "Constant Pain", description: "Pain is always present.", effect: "-1 to all physical actions; worse during flares." }
    ],
    notes: "Medication may help but can have side effects."
  },
  {
    id: "fragile",
    name: "Fragile",
    type: "flaw",
    category: "physical",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "health"],
    description: "You are more vulnerable to physical harm.",
    levels: [
      { level: 1, label: "Delicate", description: "Bruise easily.", effect: "-1 Health box." },
      { level: 2, label: "Very Fragile", description: "Break easily.", effect: "-2 Health boxes." }
    ],
    notes: "Lost health boxes make survival harder."
  },
  {
    id: "slow_healing",
    name: "Slow Healing",
    type: "flaw",
    category: "physical",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["physical", "healing"],
    description: "You recover from injuries slowly.",
    levels: [
      { level: 1, label: "Slow Recovery", description: "Heal slower than normal.", effect: "Double healing time." },
      { level: 2, label: "Very Slow Recovery", description: "Extremely slow healing.", effect: "Triple healing time." }
    ],
    notes: "Can be dangerous in extended campaigns."
  },

  // MENTAL FLAWS
  {
    id: "amnesia",
    name: "Amnesia",
    type: "flaw",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "memory"],
    description: "You have gaps in your memory.",
    levels: [
      { level: 1, label: "Partial Amnesia", description: "Missing chunks of memory.", effect: "Cannot recall certain events or periods." },
      { level: 2, label: "Severe Amnesia", description: "Major memory loss.", effect: "Significant portions of past unknown." }
    ],
    notes: "The GM determines what is forgotten."
  },
  {
    id: "phobia",
    name: "Phobia",
    type: "flaw",
    category: "mental",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Fear",
      description: "What are you afraid of?",
      inputType: "select",
      options: ["Fire", "Heights", "Enclosed Spaces", "Crowds", "Darkness", "Water", "Spiders", "Snakes", "Blood", "Death", "Supernatural", "Dogs", "Needles", "Open Spaces", "Other (specify)"]
    },
    tags: ["mental", "fear"],
    description: "You have an irrational fear.",
    levels: [
      { level: 1, label: "Nervous", description: "Uncomfortable around trigger.", effect: "-1 when near phobia trigger." },
      { level: 2, label: "Frightened", description: "Seriously afraid.", effect: "-2 when near trigger; may need to flee." },
      { level: 3, label: "Terrified", description: "Overwhelming fear.", effect: "-3 near trigger; Composure check or flee." }
    ],
    notes: "Supernatural creatures may exploit known phobias."
  },
  {
    id: "short_fuse",
    name: "Short Fuse",
    type: "flaw",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "composure"],
    description: "You anger easily and have trouble controlling your temper.",
    levels: [
      { level: 1, label: "Quick Temper", description: "Anger easily.", effect: "Composure check to avoid angry outbursts." },
      { level: 2, label: "Volatile", description: "Explosive temper.", effect: "-2 to resist provocation; may attack." }
    ],
    notes: "Can be provoked by enemies."
  },
  {
    id: "nightmares",
    name: "Nightmares",
    type: "flaw",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "sleep"],
    description: "You are plagued by disturbing dreams.",
    levels: [
      { level: 1, label: "Bad Dreams", description: "Frequent nightmares.", effect: "Occasional poor rest; -1 to first roll of day sometimes." },
      { level: 2, label: "Night Terrors", description: "Severe nightmares.", effect: "Frequently poor rest; -1 to extended tasks." }
    ],
    notes: "May reveal story information through dreams."
  },
  {
    id: "paranoia",
    name: "Paranoia",
    type: "flaw",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "trust"],
    description: "You are deeply suspicious of others.",
    levels: [
      { level: 1, label: "Suspicious", description: "Hard time trusting.", effect: "-1 to social rolls involving trust." },
      { level: 2, label: "Severely Paranoid", description: "Trust almost no one.", effect: "-2 to trust-based social; may refuse help." }
    ],
    notes: "Can protect against manipulation but damages relationships."
  },
  {
    id: "depression",
    name: "Depression",
    type: "flaw",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["mental", "mood"],
    description: "You struggle with persistent low mood.",
    levels: [
      { level: 1, label: "Melancholy", description: "Frequent low periods.", effect: "-1 to extended tasks during depressive episodes." },
      { level: 2, label: "Severe Depression", description: "Debilitating depression.", effect: "-2 during episodes; Willpower to take action." }
    ],
    notes: "Treatment and support can help manage symptoms."
  },
  {
    id: "compulsion",
    name: "Compulsion",
    type: "flaw",
    category: "mental",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Compulsive Behavior",
      description: "What is your compulsion?",
      inputType: "text",
      options: []
    },
    tags: ["mental", "behavior"],
    description: "You have a compulsive behavior you must perform.",
    levels: [
      { level: 1, label: "Quirk", description: "Minor compulsive behavior.", effect: "Spend minor time on compulsion; -1 if prevented." },
      { level: 2, label: "Obsession", description: "Significant compulsion.", effect: "Must perform compulsion; -2 if prevented." }
    ],
    notes: "Examples: counting, cleaning, checking locks, etc."
  },

  // SOCIAL FLAWS
  {
    id: "notoriety",
    name: "Notoriety",
    type: "flaw",
    category: "social",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Reason",
      description: "Why are you notorious?",
      inputType: "text",
      options: []
    },
    tags: ["social", "reputation"],
    description: "You have a bad reputation.",
    levels: [
      { level: 1, label: "Local Infamy", description: "Known locally for something bad.", effect: "-1 to social in affected area." },
      { level: 2, label: "Widespread Notoriety", description: "Widely known for your misdeeds.", effect: "-2 to social; harder to go unnoticed." },
      { level: 3, label: "Infamous", description: "Extremely well-known negatively.", effect: "-3 to social; nearly impossible to hide identity." }
    ],
    notes: "Can attract unwanted attention from authorities."
  },
  {
    id: "dark_secret",
    name: "Dark Secret",
    type: "flaw",
    category: "social",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Secret",
      description: "What is your dark secret?",
      inputType: "text",
      options: []
    },
    tags: ["social", "secret"],
    description: "You have a secret that could destroy you if revealed.",
    levels: [
      { level: 1, label: "Embarrassing Secret", description: "Would damage reputation.", effect: "Social penalties if revealed." },
      { level: 2, label: "Serious Secret", description: "Would cause major problems.", effect: "Significant consequences if revealed." },
      { level: 3, label: "Devastating Secret", description: "Would destroy your life.", effect: "Catastrophic consequences if revealed." }
    ],
    notes: "Blackmailers and enemies may discover your secret."
  },
  {
    id: "enemy",
    name: "Enemy",
    type: "flaw",
    category: "social",
    maxLevel: 5,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Enemy Description",
      description: "Who is your enemy and why do they hate you?",
      inputType: "text",
      options: []
    },
    tags: ["social", "antagonist"],
    description: "Someone is actively working against you.",
    levels: [
      { level: 1, label: "Minor Enemy", description: "An annoying adversary.", effect: "Occasionally causes minor problems." },
      { level: 2, label: "Persistent Enemy", description: "A consistent problem.", effect: "Regularly interferes with your life." },
      { level: 3, label: "Dangerous Enemy", description: "A serious threat.", effect: "Poses real danger to you and allies." },
      { level: 4, label: "Powerful Enemy", description: "A major adversary.", effect: "Significant resources dedicated to harming you." },
      { level: 5, label: "Implacable Foe", description: "A deadly nemesis.", effect: "Will stop at nothing to destroy you." }
    ],
    notes: "Enemies can be individuals, organizations, or supernatural beings."
  },
  {
    id: "obligation",
    name: "Obligation",
    type: "flaw",
    category: "social",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Obligation",
      description: "What is your obligation?",
      inputType: "text",
      options: []
    },
    tags: ["social", "duty"],
    description: "You owe someone or have responsibilities that demand attention.",
    levels: [
      { level: 1, label: "Minor Obligation", description: "Occasional demands.", effect: "Sometimes must attend to obligation." },
      { level: 2, label: "Significant Obligation", description: "Regular demands.", effect: "Frequently pulled away by duties." },
      { level: 3, label: "Major Obligation", description: "Constant demands.", effect: "Obligation dominates your time." }
    ],
    notes: "Examples: family duties, debts, employment, legal requirements."
  },
  {
    id: "hunted",
    name: "Hunted",
    type: "flaw",
    category: "social",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Hunter",
      description: "Who or what is hunting you?",
      inputType: "text",
      options: []
    },
    tags: ["social", "danger"],
    description: "Something is actively tracking and hunting you.",
    levels: [
      { level: 1, label: "Pursued", description: "Being looked for.", effect: "Must be careful; occasional close calls." },
      { level: 2, label: "Actively Hunted", description: "Dedicated pursuit.", effect: "Regular danger; must stay hidden." },
      { level: 3, label: "Relentlessly Hunted", description: "Constant pursuit.", effect: "Always in danger; capture seems inevitable." }
    ],
    notes: "The hunter could be law enforcement, criminals, or supernatural."
  },
  {
    id: "outsider",
    name: "Outsider",
    type: "flaw",
    category: "social",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["social", "status"],
    description: "You don't fit in with mainstream society.",
    levels: [
      { level: 1, label: "Different", description: "Noticeably different.", effect: "-1 to social with mainstream society." },
      { level: 2, label: "Outcast", description: "Clearly don't belong.", effect: "-2 to social with mainstream; may face discrimination." }
    ],
    notes: "May be due to appearance, behavior, beliefs, or background."
  },
  {
    id: "poor",
    name: "Poor",
    type: "flaw",
    category: "social",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["social", "financial"],
    description: "You lack financial resources.",
    levels: [
      { level: 1, label: "Struggling", description: "Constantly short on money.", effect: "Difficulty affording basic things." },
      { level: 2, label: "Destitute", description: "Extremely poor.", effect: "Cannot afford basic necessities without help." }
    ],
    notes: "Conflicts with Resources background."
  },
  {
    id: "known_to_authorities",
    name: "Known to Authorities",
    type: "flaw",
    category: "social",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Agency",
      description: "Which authorities know about you?",
      inputType: "select",
      options: ["Local Police", "FBI", "CIA", "Interpol", "Military Intelligence", "IRS", "Homeland Security", "Other (specify)"]
    },
    tags: ["social", "legal"],
    description: "Law enforcement or government agencies are aware of you.",
    levels: [
      { level: 1, label: "Person of Interest", description: "On their radar.", effect: "May be questioned; background checks flag you." },
      { level: 2, label: "Under Surveillance", description: "Being watched.", effect: "Difficult to operate secretly; may be followed." },
      { level: 3, label: "Wanted", description: "Actively sought.", effect: "Arrest on sight; major complications." }
    ],
    notes: "Makes official channels dangerous to use."
  },

  // SUPERNATURAL FLAWS
  {
    id: "beacon_to_supernatural",
    name: "Beacon to Supernatural",
    type: "flaw",
    category: "supernatural",
    maxLevel: 2,
    requiresLevel: true,
    requiresDetail: false,
    detail: null,
    tags: ["supernatural", "attention"],
    description: "Supernatural beings notice you easily.",
    levels: [
      { level: 1, label: "Noticeable", description: "Stand out to the supernatural.", effect: "Supernatural beings notice you more easily." },
      { level: 2, label: "Beacon", description: "Shine bright to supernatural senses.", effect: "Supernatural beings are drawn to you." }
    ],
    notes: "Makes hiding from supernatural threats very difficult."
  },
  {
    id: "haunted",
    name: "Haunted",
    type: "flaw",
    category: "supernatural",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Spirit",
      description: "What haunts you and why?",
      inputType: "text",
      options: []
    },
    tags: ["supernatural", "ghost"],
    description: "A spirit follows and torments you.",
    levels: [
      { level: 1, label: "Pestered", description: "Minor supernatural annoyance.", effect: "Occasional strange occurrences; -1 at inopportune times." },
      { level: 2, label: "Haunted", description: "Regular supernatural interference.", effect: "Frequent disturbances; harder to rest." },
      { level: 3, label: "Tormented", description: "Constant supernatural harassment.", effect: "Near-constant interference; significant penalties." }
    ],
    notes: "The haunting spirit may be laid to rest through story actions."
  },
  {
    id: "cursed",
    name: "Cursed",
    type: "flaw",
    category: "supernatural",
    maxLevel: 3,
    requiresLevel: true,
    requiresDetail: true,
    detail: {
      label: "Curse",
      description: "What is the nature of your curse?",
      inputType: "text",
      options: []
    },
    tags: ["supernatural", "curse"],
    description: "You are under a supernatural curse.",
    levels: [
      { level: 1, label: "Minor Curse", description: "Annoying supernatural bad luck.", effect: "Occasional minor misfortune." },
      { level: 2, label: "Serious Curse", description: "Significant cursed effects.", effect: "Regular problems from the curse." },
      { level: 3, label: "Terrible Curse", description: "Devastating curse.", effect: "Major ongoing effects; may be life-threatening." }
    ],
    notes: "Curses can potentially be broken through story actions."
  },
  {
    id: "touch_of_frost",
    name: "Touch of Frost",
    type: "flaw",
    category: "supernatural",
    maxLevel: 1,
    requiresLevel: false,
    requiresDetail: false,
    detail: null,
    tags: ["supernatural", "aura"],
    description: "Your presence brings an unnatural chill.",
    levels: [
      { level: 1, label: "Touch of Frost", description: "Rooms grow cold around you.", effect: "People feel uneasy; -1 to first social impressions." }
    ],
    notes: "Animals may also react negatively."
  }
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function getAllTraits() {
  return {
    backgrounds: BACKGROUNDS,
    merits: MERITS,
    flaws: FLAWS
  };
}

export function getTraitById(id) {
  const allTraits = [...BACKGROUNDS, ...MERITS, ...FLAWS];
  return allTraits.find(t => t.id === id);
}

export function getTraitsByType(type) {
  switch (type) {
    case 'background':
      return BACKGROUNDS;
    case 'merit':
      return MERITS;
    case 'flaw':
      return FLAWS;
    default:
      return [];
  }
}

export function getTraitsByCategory(category) {
  const allTraits = [...BACKGROUNDS, ...MERITS, ...FLAWS];
  return allTraits.filter(t => t.category === category);
}

export function getTraitsByTag(tag) {
  const allTraits = [...BACKGROUNDS, ...MERITS, ...FLAWS];
  return allTraits.filter(t => t.tags.includes(tag));
}

// Get all unique categories
export function getAllCategories() {
  const allTraits = [...BACKGROUNDS, ...MERITS, ...FLAWS];
  const categories = new Set(allTraits.map(t => t.category));
  return Array.from(categories).sort();
}

// Get all unique tags
export function getAllTags() {
  const allTraits = [...BACKGROUNDS, ...MERITS, ...FLAWS];
  const tags = new Set(allTraits.flatMap(t => t.tags));
  return Array.from(tags).sort();
}
