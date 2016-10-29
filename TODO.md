### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/channels.js | 77 | Modify tell to work with NPCs in same room.
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 9 | Chart this stuff out.
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 257 | Weapon skills related to weapon type?
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 258 | General combat skills?
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 36 | Extract into individual files.
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 137 | invis
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 188 | Do the same way as above once you extract the admin commands.
| /Users/seanodonohue/myForks/ranviermud/src/dialogue.js | 145 | Consider extracting these enums/consts from the main dialogue script file.
| /Users/seanodonohue/myForks/ranviermud/src/doors.js | 44 | Refactor to use the bound functions in external code.
| /Users/seanodonohue/myForks/ranviermud/src/effects.js | 4 | Extract into own directory. Too many effects.
| /Users/seanodonohue/myForks/ranviermud/src/effects.js | 5 | Make an atom snippet for this?
| /Users/seanodonohue/myForks/ranviermud/src/effects.js | 6 | Effects_utils?
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 24 | Deprecate this if possible.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 82 | Extract stuff like this into Data module as util funcs.
| /Users/seanodonohue/myForks/ranviermud/src/examine.js | 18 | Change command so that it can work on any item, npc, or room by emitting.
| /Users/seanodonohue/myForks/ranviermud/src/feats.js | 119 | Extract these to a skills/charm.js file
| /Users/seanodonohue/myForks/ranviermud/src/feats.js | 429 | Use an event emitter instead.
| /Users/seanodonohue/myForks/ranviermud/src/help_files.js | 52 | Dynamically pull in list of admins
| /Users/seanodonohue/myForks/ranviermud/src/item_util.js | 82 | Improve... if the damage is over the weapon's normal max damage it should be considered a crit...
| /Users/seanodonohue/myForks/ranviermud/src/item_util.js | 88 | Add some kind of bonus.
| /Users/seanodonohue/myForks/ranviermud/src/items.js | 34 | Extract to Data helper method.
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 15 | Make NPCs persistent. Have a load-minimum so that if the amt of NPCs falls below the min,
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 17 | Extract npc from this file like player/player_manager
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 227 | Have spawn inventory but also add same inv functionality as player
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 59 | Generated descs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 342 | Put in perception skill helper file
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 353 | Consider using Random.roll instead.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 622 | Use chalk node module to create color-coded logging messages.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 679 | Make a similar function but for NPCs::::::::::::::
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 705 | Should go in other module::::::::::::::::::::::::
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 716 | Put this as a function in the combatUtils module.
| /Users/seanodonohue/myForks/ranviermud/src/rooms.js | 3 | Refactor
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 5 | Add strings for sanity damage
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 93 | What if they swap weapons mid-fight?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 134 | Remove this when allowing for multicombat.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 135 | Use an array of targets for multicombat.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 236 | What if there are no players involved in combat?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 333 | Add to utils helper.js file
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 345 | Handle PvP or NvN combat ending differently.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 385 | Extract this to combat utils.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 386 | Make NPCs have fleeing behavior, too.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 387 | Emit flee?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 399 | Use Broadcast module or extract to the Broadcast file.
| /Users/seanodonohue/myForks/ranviermud/src/skills.js | 28 | Pull into own files.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 3 | Refactor.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 112 | Use in player/npc class.
| /Users/seanodonohue/myForks/ranviermud/scripts/behaviors/objects/wearable.js | 6 | Extract to file so that this functionality can be used for other items, and with special bonuses as well?
| /Users/seanodonohue/myForks/ranviermud/scripts/npcs/1-roach.js | 9 | Consider modifying this to use dep injection that is more like the commands.
| /Users/seanodonohue/myForks/ranviermud/scripts/npcs/3-defiler.js | 75 | Add condition where attacking the defiler's legs will slow it greatly.
| /Users/seanodonohue/myForks/ranviermud/scripts/npcs/5-feline.js | 60 | Extract to dialogue or level utils?
| /Users/seanodonohue/myForks/ranviermud/scripts/npcs/5-feline.js | 202 | Lower reputation with cat. Use emitter to handle this. Use a behavior file.
| /Users/seanodonohue/myForks/ranviermud/scripts/npcs/5-feline.js | 238 | Extract this to some kind of combat messaging helper?
| /Users/seanodonohue/myForks/ranviermud/scripts/objects/1-shiv.js | 9 | Update to account for prereqs
| /Users/seanodonohue/myForks/ranviermud/scripts/objects/10-chain_whip.js | 68 | Refactor by extracting to functions...
| /Users/seanodonohue/myForks/ranviermud/scripts/rooms/1.js | 11 | Now, this would be a good case for an ES6 map.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 2 | Refactor into individual files.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 15 | Use this for all sanity loss incidents.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 22 | Different messages for different relative amounts of sanity loss.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 98 | Emit sanity loss event here if applicable.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 115 | Extract all stuff for determining stat gain into level utils.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 177 | Permadeath, add it.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 64 | Change to calculate based on character's strength and pack size vs. item weight/size.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 79 | Put carrying capacity method on player obj.
| /Users/seanodonohue/myForks/ranviermud/commands/help.js | 41 | Extract this (its also used in commands)
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 69 | Improve based on player stats/skills?
| /Users/seanodonohue/myForks/ranviermud/commands/skills.js | 14 | Pull out attrs into enum of some kind for reuse?
| /Users/seanodonohue/myForks/ranviermud/commands/skills.js | 15 | Refactor for readability by decomposing nested conditionals.
| /Users/seanodonohue/myForks/ranviermud/commands/train.js | 20 | Extract into own function in Skills module.
| /Users/seanodonohue/myForks/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 89 | Can be done better with changes to npc class.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 298 | In statusUtils: This could be a problem if the combat is between two NPCs or two players.
| /Users/seanodonohue/myForks/ranviermud/commands/appraise.js | 35 | There has to be a better way...
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 70 | This does not really seem to be working.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 71 | Consider making it a 'scout' command/skill.