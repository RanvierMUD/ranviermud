const HelpFiles = {

  HELP:  {
    title: 'Getting help',
    body: 'Type \'commands\' to see a list of possible commands.\nType \'help (command)\' to see more information about that command.\nAlso try \'help new\' for a list of introductory topics, and `help topics` for a list of all topics.\n\nThese help files will include a description, a usage (in the case of commands), and some related help topics.',
  },

  NEW: {
    title: 'Welcome to Ranvier',
    topicsHeader: '<bold><blue>Important topics include:</blue></bold>',
    related: ['commands', 'levels', 'attributes', 'mutants', 'mental', 'physical', 'energy', 'combat', 'social', 'skills'],
  },

  COMBAT: {
    title: 'Fighting to Survive',
    body: 'Combat in Ranvier relies on a combination of strength and strategy.\nFleeing is a valid tactic, as combat can be deadly. Many creatures may attack, with or without warning.\nUse everything at your disposal to even the odds. Look at and appraise your target. Then, adapt your stance and aim for their weaknesses.',
    related: ['stance', 'target', 'kill', 'flee', 'wimpy', 'appraise', 'look', 'skills', 'mutants']
  },

  SOCIAL: {
    title: 'Sticking Together',
    body: 'Communication in Ranvier can happen through many channels. Tell and chat are considered out-of-character.',
    related: ['channels', 'whisper', 'emote', 'say', 'tell']
  },

  LEVELS: {
    title: 'Leveling',
    body: 'Levels are gained by earning experience. Experience can be gained through a variety of ways.\nBy defeating enemies, exploring, learning, and helping others, you will advance.\nAs you advance, you will gain the ability to `boost` your attributes, `train` your skills, and `manifest` mutations.',
    related: ['boost', 'train', 'mutations', 'manifest', 'tnl', 'character'],
  },

  NOT_FOUND: {
    title: '404',
    body: 'That command was not found in the helpfiles. \nType \'commands\' to see a list of possible commands.',
  },

  NO_HELP_FILE: {
    title: '404',
    //TODO: Dynamically pull in list of admins
    body: 'No helpfile was found for that command.\nPlease contact an admin.',
  },

  DROP: {
    title: 'Drop',
    body: 'Remove an item from your inventory and leave it on the ground.',
    usage: ['drop (item name)', 'drop n.(item name) to drop the nth item of that same name', 'drop all'],
    related: ['get', 'remove', 'give'],
  },

  GET: {
    title: 'Get',
    body: 'Pick up an item and place it in your inventory. \nDoes not work while in combat. \nYour inventory space is limited.',
    usage: ['get (item name)', 'get n.(item name) to get the nth item of that same name', 'get all'],
    related: ['drop', 'remove', 'give'],
  },

  QUIT: {
    title: 'Quit',
    body: 'Save your character and disconnect.',
    usage: 'quit',
    related: ['save'],
  },

  CHANNELS: {
    title: 'Channels',
    body: 'List all available channels and their description.',
    usage: 'channels',
    related: ['who', 'emote', 'commands']
  },

  INVENTORY: {
    title: 'Inventory',
    body: 'List all items in your character\'s inventory.\nThis does not include the items your character has equipped.',
    usage: 'inventory',
    related: ['equipment', 'give', 'get', 'remove', 'equip', 'wield']
  },

  COMMANDS: {
    title: 'Commands',
    body: 'List all possible commands.',
    usage: 'commands',
    related: ['help', 'channels']
  },

  EQUIPMENT: {
    title: 'Equipment',
    body: 'List all equipped items.',
    usage: 'equipment',
    related: ['inventory', 'equip', 'wield', 'remove'],
  },

  KILL: {
    title: 'Kill',
    body: 'Attempt to slay a creature or character.',
    usage: ['kill (NPC name)','kill n.(NPC name) to attack the nth NPC of that same name'],
    related: ['combat', 'stance', 'target', 'wimpy'],
  },

  REMOVE: {
    title: 'Remove',
    body: 'This will uneqip an item and place it in your inventory.',
    usage: ['remove (item name)', 'remove n.(item name) to remove the nth item of that same name', 'remove all' ],
    related: ['equipment', 'inventory', 'wear', 'give'],
  },

  WEAR: {
    title: 'Wear',
    body: 'This will equip an item that is in your inventory, as long as it is wearable.\nFor weapons, use \'wield\'.',
    usage: ['wear (item name)', 'wear n.(item name) to wear the nth item of that same name'],
    related: ['equipment', 'inventory', 'remove']
  },

  LOOK: {
    title: 'Look',
    usage: ['look', 'look (thing)', 'look n.(thing) to look at the nth thing of the same name', 'look (direction)', 'look me'],
    body: 'Read a description of your current location, or a thing in your immediate vicinity, including your inventory.',
    related: ['examine'],
  },

  SAVE: {
    title: 'Save',
    usage: 'save',
    body: 'This will save your character\'s progress. \nUsing \'quit\' will save and then close your connection.',
    related: ['quit', 'character']
  },

  SKILLS: {
    title: 'Skills -- command and overview',
    usage: 'skills',
    body: 'This command lists all skills available to your character, including a description of how to use the skill.\nSkills include any activity that an average human would be capable of attempting.\nAll skills are available to all player characters, however, training skills will increase a character\'s odds of success and the effects of using the skill.',
    related: ['character', 'train', 'boost'],
  },

  TNL: {
    usage: 'tnl',
    body: 'Read a description of the amount of experience needed to gain your next level.',
    title: 'To Next Level (TNL)',
  },

  WHERE: {
    title: 'Where',
    usage: 'where',
    body: 'This displays the name of your current general location.',
    related: 'who',
  },

  WHO: {
    title: 'Who',
    usage: 'who',
    body: 'This displays the name of each player who is online.',
    related: ['where', 'channels']
  },

  WIELD: {
    title: 'Wield',
    body: 'This readies a weapon from your inventory for combat.',
    usage: 'wield (weapon)',
  },

  DESCRIBE: {
    title: 'Wield',
    body: 'This allows you to set a new description for your character or view the current description.',
    usage: ['describe (description)', 'describe'],
    related: ['character', 'look']
  },

  APPRAISE: {
    title: 'Appraise',
    usage: 'appraise (NPC)',
    body: 'This allows you to see how you might match up to an NPC in a fight.',
    related: ['kill', 'look', 'stance', 'target'],
  },

  SAY: {
    title: 'Say',
    usage: 'say (message)',
    body: ' This sends a message to all other players in the room.',
    related: 'channels',
  },

  WHISPER: {
    title: 'Whisper',
    usage: 'whisper (player) (message)',
    body: 'This sends a message to a single player in the same room. \nOther players in the room can see that you are whispering, but cannot hear the message.',
    related: 'channels',
  },

  EMOTE: {
    title: 'Emote',
    usage: 'emote (action)',
    body: 'This allows you to roleplay as your character performing the action.\nThis message will be shown to all other players in the room, so write it in third person. \nExample: `emote jumps with joy` would display `Helga jumps with joy`.',
    related: 'channels',
  },

  GIVE: {
    title: 'Give',
    usage: 'give (item) (player)',
    body: 'This gives the specified item in your inventory to another player\'s character.\nTheir character must be in the same room as you.',
    related: ['get', 'inventory', 'drop']
  },

  TELL: {
    title: 'Tell',
    body: 'This sends a private message to the player as long as they are online, even if they aren\'t in the same room.',
    usage: 'tell (player) (message)',
    related: ['channels', 'who'],
  },

  TARGET: {
    title: 'Target',
    usage: ['target (body part)', 'target'],
    body: 'This lets the player decide where to aim their attack.\nExample: `target legs` to aim at your opponents\' legs, while `target` will show your current target.',
    related: ['stance', 'kill', 'wimpy'],
  },

  WIMPY: {
    usage: ['wimpy (percentage)', 'wimpy'],
    body: 'This lets the player decide when to flee combat based on the percentage of their physical health remaining. \nExample: `wimpy 50` will cause you to flee after losing half of your life.\n`wimpy` will show your current wimpiness preference.',
    title: 'Wimpiness',
    related: ['stance', 'kill', 'target', 'flee']
  },

  FLEE: {
    usage: 'flee',
    body: 'If you are fighting, this will cause you to attempt to flee.',
    title: 'Flee',
    related: ['kill', 'wimpy'],
  },

  STANCE: {
    usage: 'stance (option)',
    options:  [
      'normal: A balance of offense and defense.',
      'berserk: A focus on strong and fast\n    attacks at the expense of \n    defense.',
      'cautious: Protect your weak points and\n    take it slowly.',
      'precise: Wait for an opening, then strike.\n    Defend with precise parrying.'
    ],
    body: 'Your stance and attitude during combat. This can be changed in the middle of a fight. Various skills may impact each stance\'s effects.',
    title: 'Stance Preference',
    related: ['target', 'wimpy', 'kill', 'skills']
  },

  ROOMDESCS: {
    usage: 'roomdesc (option)',
    options:  [
      'default: Show a verbose description\n    the first time you enter a room, \n    or when using the look command. \n    Otherwise, show the short description.',
      'short: Always show the short description \n    unless you use the look command.',
      'verbose: Always show the verbose description.',
    ],
    body: 'Define which room descriptions you would like to see.',
    title: 'Room Description Preference',
    related: ['look'],
  },

  EXAMINE: {
    title: 'examine',
    usage: ['examine (point of interest)'],
    body: 'Examine items in your environment to learn more. \nInvestigate your surroundings thoroughly and you may be surprised.',
    related: 'look',
  },

  MANIFEST: {
    usage: 'manifest (mutation)',
    title: 'Manifest Mutation',
    related: ['mutants', 'mutations', 'levels', 'character'],
    body: 'Expend a mutagen to manifest a special mutation or talent through sheer will. \nThis choice is permanent, so choose wisely.\nSome mutations manifest physically, while others are psychic abilities. \nThey all come at a cost to one\'s humanity.\nUse the character command to see how many times you may mutate yourself.',
  },

  MUTATIONS: {
    usage: 'mutations',
    body: 'Display your current mutations and any you can `manifest` right now. \nKeep checking as you boost your attributes and acquire more power.',
    related: ['mutants', 'manifest', 'levels', 'boost', 'character'],
    title: 'Mutations',
   },

  TRAIN: {
    usage: ['`train` to display your queued training sessions.', '`train (skill)` to queue a training session in the skill of your choice.', '`train clear` to clear all planned and ongoing training sessions.'],
    body: 'Your character will train while you are logged out.\n You must expend a number of training points and a number of hours equal to the skill level you want to obtain.\nFor example, to train lockpicking to level 5 from level 4, your character will need \n5 points and to spend 5 offline hours training.',
    title: 'Train Skills',
    related: ['levels', 'skills']
  },

  OPEN: {
    usage: ['open (direction)'],
    body: 'Open a closed door. \nDoors will open automatically when you move in that direction, if they are unlocked. \nSome NPCs can open doors. \nYou cannot see through doors... usually.',
    title: 'Open',
    related: ['close', 'look']
  },

  CLOSE: {
    usage: ['close (direction)'],
    body: 'Close an open door. \nDoors will NOT automatically close behind you when you move through them. \nSome NPCs will be blocked by a closed door.',
    title: 'Close',
    related: 'open',
  },

  BOOST: {
    usage: ['boost (attribute)', '`boost` to see which attributes you may boost.'],
    body: 'After earning a level, you may boost your character\'s four main attributes.\nAttributes effect many aspects of life in Ranvier, including which mutations you may manifest.',
    related: ['levels', 'manifest', 'mutations', 'attributes'],
    title: 'Boost Attribute'
  },

  ATTRIBUTES: {
    body: 'The four core attributes in Ranvier are split into Mental and Physical attributes.'
    + '\nThe Mental attributes are Willpower and Cleverness. The Physical attributes are Stamina and Quickness.',
    title: 'Attributes in Ranvier',
    related: ['mental', 'physical', 'willpower', 'stamina', 'quickness', 'cleverness']
  },

  WILLPOWER: {
    body: 'Willpower dictates your mental strength. It is your resistance to stressful events and psionic attacks. Imposing your will on others (psionically or otherwise) becomes easier as your willpower increases.',
    title: 'Mental: Willpower',
    related: ['mental', 'cleverness', 'attributes'],
  },

  CLEVERNESS: {
    body: 'Cleverness is your ability to think your way out of a tough situation, \nor slyly avoid conflict. \nPuzzlemasters and charmers are highly clever.',
    title: 'Mental: Cleverness',
    related: ['mental', 'willpower', 'attributes']
  },

  STAMINA: {
    title: 'Physical: Stamina',
    body: 'Stamina is a measure of your physical strength and endurance. High stamina means you can take a lot of damage and keep moving -- though you may be broken on the inside. It also means use of brute force is easier.',
    related: ['physical', 'quickness', 'attributes'],
  },

  QUICKNESS: {
    body: 'Quickness describes graceful deftness of feet and hands... \nor the lack thereof. \nAcrobats and assassins are quick, as are couriers and dancers.',
    title: 'Physical: Quickness',
    related: ['physical', 'stamina', 'attributes'],
  },

  PHYSICAL: {
    title: 'Physical Attributes',
    body: 'The physicalists, also called brutalists, treat their body as a temple, thus enhancing their stamina and quickness. \nWith poise and grace they stand strong against most threats. \nThey become capable of great athletic feats, and their mutations manifest in a physical manner -- \nan extra limb, hard chitin, or inhuman musculature and speed. \nPhysical skills often deal with kinesthetics and brute force.\nYour physical health is how much bodily damage you can endure.',
    related: ['mental', 'attributes', 'skills', 'mutants', 'quickness', 'stamina'],
  },

  MENTAL: {
    title: 'Mental Attributes',
    body: 'Mentalists spend time improving their mind and intuition. They may sense things that others do not, or affect the worlds within and without in a way that is sometimes unseen.\nOther times, impossible to miss.\n Their mutations manifest as psionic powers, incredible concentration, and a keen sensitivity.\nMental health describes how much stress you may endure before beginning to break. Most mentalists describe invoking their psionic powers as highly stressful.\nMental skills typically require in-depth knowledge, problem-solving, and emotional stability.',
    related: ['physical', 'attributes', 'skills', 'mutants', 'quickness', 'stamina'],
  },

  MUTANTS: {
    title: 'Mutants, Mutating, and Mutations',
    body: 'Ranvier, the node of science and industry.\nAnd experimentation.\nNow, the city is deserted save for mutants, recycled souls that the wheel of the Napistum compresses brusquely into hollowed husks.\nEnhanced by eldritch technology, these wandering psyches can alter the threads of their genome through sheer will.\nThus, evolution has been hastened in Ranvier.\nOur next breakthrough was to be the Hemisphaeira.\n\n -- Eroadaus Jenkorm, \nauthor of "The Indigo Age"\n6 P.R. (post ruinam)',
    related: ['physical', 'mental', 'manifest', 'mutations', 'levels'],
  },

  ENERGY: {
    title: 'Energy Level',
    body: 'Everyone gets tired eventually. When your energy is depleted, you will need to rest or meditate before taking certain actions.\nIf your energy is depleted in the middle of fighting, you will keep striving but will be sluggish and weak -- and unable to flee.',
    related: ['rest', 'meditate', 'flee', 'commands'],
  },

  REST: {
    title: 'Rest',
    body: 'Resting restores your physical health and your energy. Many different actions will disrupt your rest.',
    usage: 'rest',
    related: ['meditate', 'energy', 'physical']
  },

  MEDITATE: {
    title: 'Meditate',
    body: 'Meditation relieves stress and improves mental health. Many say it also improves energy. Movement of any sort will compromise your meditation practice.',
    usage: 'meditate',
    related: ['rest', 'energy', 'mental'],
  },


};

module.exports = { HelpFiles };
