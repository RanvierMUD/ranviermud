const HelpFiles = {
  HELP:  {
    title: 'Getting help'
    body: 'Type \'commands\' to see a list of possible commands.\nType \'help (command)\' to see more information about that command.\nType \'help new\' to see a list of other topics.',
  },

  NEW: {
    title: 'Welcome to Ranvier',
    body: 'Important topics include:',
    related: ['commands', 'levels', 'attributes', 'mutants', 'mental', 'physical', 'energy', 'combat', 'social'],
  },

  LEVELS: {
    title: 'Leveling',
    body: 'Levels are gained by earning experience. Experience can be gained through a variety of ways.\nBy defeating enemies, exploring, learning, and helping others, you will advance.\nAs you advance, you will gain the ability to `boost` your attributes, `train` your skills, and `manifest` mutations.'
    related: ['boost', 'train', 'mutations', 'manifest', 'tnl', 'character'],
  },

  NOT_FOUND: {
    title: '404',
    body: 'That command was not found in the helpfiles. \nType \'commands\' to see a list of possible commands.',
  },

  NO_HELP_FILE: {
    title: '404',
    //TODO: Dynamically pull in list of admins
    body: 'No helpfile was found for that command.\nPlease contact an admin.'
  },

  DROP: {
    title: 'Drop',
    body: 'Remove an item from your inventory and leave it on the ground.'
    usage: ['drop (item name)', 'drop n.(item name) to drop the nth item of that same name']
    related: ['get', 'remove', 'give']
  },

  GET: {
    title: 'Get',
    body: 'Pick up an item and place it in your inventory. \nDoes not work while in combat. \nYour inventory space is limited.',
    usage: ['get (item name)', 'get n.(item name) to get the nth item of that same name', 'get all'
  },
  QUIT: { usage: 'Usage: \n  quit\n\nThis saves and closes your connection to RanvierMUD.\nYou cannot quit while in combat.' },
  CHANNELS: { usage: 'Usage: \n  channels\n\nList all available channels and their description.' },
  INVENTORY: { usage: 'Usage: \n  inventory\n\nList all items in your character\'s inventory, including the amount of each item.\nThis does not show you the items your character has equipped.' },
  COMMANDS: { usage: 'Usage: \n  commands\n\nList all possible commands.' },
  EQUIPMENT: { usage: 'Usage: \n  equipment\n\nList all items that your character has equipped.' },
  KILL: { usage: 'Usage: \n  kill (NPC name) \nor \n  kill 2.(NPC name) to attack the 2nd NPC of that same name \n\nThis will cause your character to attempt to kill a non-player character (NPC).\nSome NPCs are pacifists and cannot be targeted.' },
  REMOVE: { usage: 'Usage: \n  remove (item name) \nor \n  remove 2.(item name) to remove the 2nd item of that same name \n\nThis will remove an item that is equipped and place it in your inventory.' },
  WEAR: { usage: 'Usage: \n  wear (item name) \nor \n  wear 2.(item name) to wear the 2nd item of that same name \n\nThis will equip an item that is in your inventory, as long as it is wearable.\nFor weapons, use \'wield\'.' },
  LOOK: { usage: 'Usage: \n  look\n\nThis will describe your character\'s current location.\n\nUsage: \n  look (thing)\nor\n  look 2.(thing) to look at the 2nd thing of the same name \n\nThis will describe a non-player character or item in the same room as you. \nIt can also be used to look at items in your inventory.' },
  SAVE: { usage: 'Usage: \n  save\n\nThis will save your character\'s progress. \nUsing \'quit\' will save and then close your connection.' },
  SKILLS: { usage: 'Usage: \n  skills\n\nThis lists all skills available to your character, including a description and the cooldown time, if applicable.' },
  TNL: { usage: 'Usage: \n  tnl\n\nThis displays a bar of the amount of experience needed to gain your next level.' },
  EXP: { usage: 'Usage: \n  exp\n\nThis displays a bar of the amount of experience needed to gain your next level.' },
  WHERE: { usage: 'Usage \n  where\n\nThis displays the name of your current location.' },
  WHO: { usage: 'Usage \n  who\n\nThis displays the name of each player who is online.' },
  WIELD: { usage: 'Usage: \n  wield (weapon)\n\n' },
  DESCRIBE: { usage: 'Usage: \n  describe (description)\n\nThis allows you to set a new description for your character.\n\nUsage: \n  describe\n\nThis allows you to see your current description.' },
  APPRAISE: { usage: 'Usage \n  appraise (NPC)\n\nThis allows you to see how you might match up to an NPC in a fight.' },
  SAY: { usage: 'Usage \n  say (message)\n\nThis sends a message to all other players in the room.' },
  WHISPER: { usage: 'Usage \n  whisper (player) (message)\n\nThis sends a message to a single player in the same room. \nOther players can see that you are whispering, but cannot hear the message.' },
  EMOTE: { usage: 'Usage \n  emote (action)\n\nThis allows you to roleplay as your character performing the action.\nThis message will be shown to all other players in the room, so write it in third person.\n\nExample: `emote jumps with joy` would display `Helga jumps with joy`.' },
  GIVE: { usage: 'Usage \n give (item) (player)\n\nThis gives the specified item in your inventory to another player\'s character.\nTheir character must be in the same room as you.' },
  TELL: { usage: 'Usage \n tell (player) (message)\n\nThis sends a private message to the player as long as they are online, even if they aren\'t in the same room.' },
  TARGET: { usage: 'Usage \n target (body part) \n\nThis lets the player decide where to aim their attack.\nExample: `target legs` to aim at your opponents\' legs, while `target` will show your current target.' },
  WIMPY: { usage: 'Usage \n wimpy (percentage) \n\nThis lets the player decide when to flee combat. \nExample: `wimpy 50` will cause you to flee after losing half of your life.\n`wimpy` will show your current wimpiness preference.' },
  FLEE: { usage: 'Usage \n flee \n\nIf you are fighting, this will cause you to attempt to flee.' },
  STANCE: { usage: 'Usage \n stance (stance) \n\nOptions:\n`normal`: This has no major effect on your combat style.\n`berserk`: You do more damage at the cost of defense.\n`cautious`: You have higher defense at the cost of damage.\n`precise`: Your attacks always hit their target, and you defend \nwell against aimed strikes, at a cost to speed.' },
  ROOMDESCS: { usage: 'Usage \n roomdesc (preference) \n\nOptions:\n`default`: Show a verbose description the first time you enter a room, or when using the `look` command. Otherwise, show the short description.\n`short`: Always show the short description unless you use the look command.\n`verbose` Always show the verbose description.' },
  EXAMINE: { usage: 'Usage \n examine (point of interest) \n\nExamine items in your environment to learn more. Investigate your surroundings thoroughly and you may be surprised.' },
  MANIFEST: { usage: 'Usage \n manifest (mutation) \n\nExpend a mutagen to manifest a special mutation or talent. This is permanent, so choose wisely.' },
  MUTATIONS: { usage: 'Usage \n mutations \n\nDisplay your current mutations and any you can `manifest` now.' },
  TRAIN: { usage: 'Usage \n train \n\nDisplay your queued training sessions.\n\nUsage:\n train (skill)\n\nQueue a training session in the skill of your choice.\nYour character will train while you are logged out.\n\nUsage:\n train clear\n\nClears all planned and ongoing training sessions.' }
}
module.exports = { HelpFiles };
