const HelpFiles = {

  HELP:  {
    title: 'Getting help',
    body: 'Type \'commands\' to see a list of possible commands.\nType 'help (command)' to see more information about that command.\nAlso try \'help new\' for a list of introductory topics.',
  },

  NEW: {
    title: 'Welcome to Ranvier',
    body: 'Important topics include:',
    related: ['commands', 'levels', 'attributes', 'mutants', 'mental', 'physical', 'energy', 'combat', 'social', 'skills'],
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
    body: 'This allows you to roleplay as your character performing the action.\nThis message will be shown to all other players in the room, so write it in third person. \nExample: `emote jumps with joy` would display `Helga jumps with joy`.'
    related: 'channels',
  },

  GIVE: {
    title: 'Give',
    usage: 'give (item) (player)',
    body: 'This gives the specified item in your inventory to another player\'s character.\nTheir character must be in the same room as you.',
    related: ['get', 'inventory', 'drop']
  },
  
  TELL: { usage: 'tell (player) (message) This sends a private message to the player as long as they are online, even if they aren\'t in the same room.' },
  TARGET: { usage: 'target (body part)  This lets the player decide where to aim their attack.\nExample: `target legs` to aim at your opponents\' legs, while `target` will show your current target.' },
  WIMPY: { usage: 'wimpy (percentage)  This lets the player decide when to flee combat. \nExample: `wimpy 50` will cause you to flee after losing half of your life.\n`wimpy` will show your current wimpiness preference.' },
  FLEE: { usage: 'flee  If you are fighting, this will cause you to attempt to flee.' },
  STANCE: { usage: 'stance (stance)  Options:\n`normal`: This has no major effect on your combat style.\n`berserk`: You do more damage at the cost of defense.\n`cautious`: You have higher defense at the cost of damage.\n`precise`: Your attacks always hit their target, and you defend \nwell against aimed strikes, at a cost to speed.' },
  ROOMDESCS: { usage: 'roomdesc (preference)  Options:\n`default`: Show a verbose description the first time you enter a room, or when using the `look` command. Otherwise, show the short description.\n`short`: Always show the short description unless you use the look command.\n`verbose` Always show the verbose description.' },
  EXAMINE: { usage: 'examine (point of interest)  Examine items in your environment to learn more. Investigate your surroundings thoroughly and you may be surprised.' },
  MANIFEST: { usage: 'manifest (mutation)  Expend a mutagen to manifest a special mutation or talent. This is permanent, so choose wisely.' },
  MUTATIONS: { usage: 'mutations  Display your current mutations and any you can `manifest` now.' },
  TRAIN: { usage: 'train  Display your queued training sessions. Usage:\n train (skill) Queue a training session in the skill of your choice.\nYour character will train while you are logged out. Usage:\n train clear Clears all planned and ongoing training sessions.' }
};

module.exports = { HelpFiles };
