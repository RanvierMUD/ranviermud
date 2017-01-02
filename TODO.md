### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanohue/myProjects/ranviermud/src/channels.js | 77 | Modify tell to work with NPCs in same room.
| /Users/seanohue/myProjects/ranviermud/src/combat_util.js | 11 | Chart this stuff out.
| /Users/seanohue/myProjects/ranviermud/src/combat_util.js | 258 | Weapon skills related to weapon type?
| /Users/seanohue/myProjects/ranviermud/src/combat_util.js | 259 | General combat skills?
| /Users/seanohue/myProjects/ranviermud/src/command_util.js | 34 | Make APIs consistent and not awful.
| /Users/seanohue/myProjects/ranviermud/src/commands.js | 36 | Extract into individual files.
| /Users/seanohue/myProjects/ranviermud/src/commands.js | 222 | invis
| /Users/seanohue/myProjects/ranviermud/src/commands.js | 275 | Do the same way as above once you extract the admin commands.
| /Users/seanohue/myProjects/ranviermud/src/dialogue.js | 145 | Consider extracting these enums/consts from the main dialogue script file.
| /Users/seanohue/myProjects/ranviermud/src/doors.js | 44 | Refactor to use the bound functions in external code.
| /Users/seanohue/myProjects/ranviermud/src/events.js | 24 | Deprecate this if possible.
| /Users/seanohue/myProjects/ranviermud/src/events.js | 82 | Extract stuff like this into Data module as util funcs.
| /Users/seanohue/myProjects/ranviermud/src/examine.js | 18 | Change command so that it can work on any item, npc, or room by emitting.
| /Users/seanohue/myProjects/ranviermud/src/feats.js | 443 | Use an event emitter instead.
| /Users/seanohue/myProjects/ranviermud/src/help_files.js | 52 | Dynamically pull in list of admins
| /Users/seanohue/myProjects/ranviermud/src/item_util.js | 114 | Use EventEmitters to emit a critical hit event for the item, so each item can have special crit effects.
| /Users/seanohue/myProjects/ranviermud/src/item_util.js | 125 | Improve... if the damage is over the weapon's normal max damage it should be considered a crit...
| /Users/seanohue/myProjects/ranviermud/src/item_util.js | 131 | Add some kind of bonus.
| /Users/seanohue/myProjects/ranviermud/src/items.js | 36 | Extract to Data helper method.
| /Users/seanohue/myProjects/ranviermud/src/items.js | 90 | Account for persisted items eventually (uuids rather than vnums)
| /Users/seanohue/myProjects/ranviermud/src/items.js | 183 | Every other class uses .location for the room vnum, right? use .location and .getLocation
| /Users/seanohue/myProjects/ranviermud/src/npcs.js | 16 | Make NPCs persistent. Have a load-minimum so that if the amt of NPCs falls below the min,
| /Users/seanohue/myProjects/ranviermud/src/npcs.js | 18 | Extract npc from this file like player/player_manager
| /Users/seanohue/myProjects/ranviermud/src/npcs.js | 168 | Make attributes more or less match that of the player.
| /Users/seanohue/myProjects/ranviermud/src/npcs.js | 230 | Have spawn inventory but also add same inv functionality as player
| /Users/seanohue/myProjects/ranviermud/src/player.js | 266 | IS there a better way to store this info?
| /Users/seanohue/myProjects/ranviermud/src/player.js | 344 | Put in perception skill helper file
| /Users/seanohue/myProjects/ranviermud/src/player.js | 355 | Consider using Random.roll instead.
| /Users/seanohue/myProjects/ranviermud/src/player.js | 638 | refactor to use template strings.
| /Users/seanohue/myProjects/ranviermud/src/player.js | 810 | Put this as a function in the combatUtils module.
| /Users/seanohue/myProjects/ranviermud/src/player_manager.js | 1 | LOL REFACTOR
| /Users/seanohue/myProjects/ranviermud/src/rooms.js | 3 | Refactor
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 5 | Add strings for sanity damage
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 93 | What if they swap weapons mid-fight?
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 134 | Remove this when allowing for multicombat.
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 135 | Use an array of targets for multicombat.
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 186 | Make a custom insanity effect with events and such?
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 262 | What if there are no players involved in combat?
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 359 | Add to utils helper.js file
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 371 | Handle PvP or NvN combat ending differently.
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 409 | Extract this to combat utils.
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 410 | Make NPCs have fleeing behavior, too.
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 411 | Emit flee?
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 423 | Use Broadcast module or extract to the Broadcast file.
| /Users/seanohue/myProjects/ranviermud/src/skills.js | 28 | Pull into own files.
| /Users/seanohue/myProjects/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanohue/myProjects/ranviermud/src/status.js | 3 | Refactor.
| /Users/seanohue/myProjects/ranviermud/src/status.js | 112 | Use in player/npc class.
| /Users/seanohue/myProjects/ranviermud/scripts/npcs/1-roach.js | 9 | Consider modifying this to use dep injection that is more like the commands.
| /Users/seanohue/myProjects/ranviermud/scripts/npcs/3-defiler.js | 75 | Add condition where attacking the defiler's legs will slow it greatly.
| /Users/seanohue/myProjects/ranviermud/scripts/npcs/5-feline.js | 60 | Extract to dialogue or level utils?
| /Users/seanohue/myProjects/ranviermud/scripts/npcs/5-feline.js | 217 | Lower reputation with cat. Use emitter to handle this. Use a behavior file.
| /Users/seanohue/myProjects/ranviermud/scripts/npcs/5-feline.js | 258 | Extract this to some kind of combat messaging helper?
| /Users/seanohue/myProjects/ranviermud/scripts/objects/1-shiv.js | 9 | Update to account for prereqs
| /Users/seanohue/myProjects/ranviermud/scripts/objects/10-chain_whip.js | 68 | Refactor by extracting to functions...
| /Users/seanohue/myProjects/ranviermud/scripts/player/player.js | 3 | Refactor into individual files.
| /Users/seanohue/myProjects/ranviermud/scripts/player/player.js | 20 | Use this for all sanity loss incidents.
| /Users/seanohue/myProjects/ranviermud/scripts/player/player.js | 27 | Different messages for different relative amounts of sanity loss.
| /Users/seanohue/myProjects/ranviermud/scripts/player/player.js | 92 | Emit sanity loss event here if applicable.
| /Users/seanohue/myProjects/ranviermud/scripts/player/player.js | 109 | Extract all stuff for determining stat gain into level utils.
| /Users/seanohue/myProjects/ranviermud/scripts/player/player.js | 171 | Permadeath, add it.
| /Users/seanohue/myProjects/ranviermud/scripts/rooms/1.js | 11 | Now, this would be a good case for an ES6 map.
| /Users/seanohue/myProjects/ranviermud/scripts/rooms/8.js | 6 | Redo/refactor all examine listeners.
| /Users/seanohue/myProjects/ranviermud/commands/drop.js | 11 | Does this handle dropping a container with items in it?
| /Users/seanohue/myProjects/ranviermud/commands/help.js | 41 | Extract this (its also used in commands)
| /Users/seanohue/myProjects/ranviermud/commands/look.js | 19 | Test and refactor.
| /Users/seanohue/myProjects/ranviermud/commands/look.js | 76 | Improve based on player stats/skills?
| /Users/seanohue/myProjects/ranviermud/commands/put.js | 4 | Change get to auto-put or auto-hold...
| /Users/seanohue/myProjects/ranviermud/commands/skills.js | 14 | Pull out attrs into enum of some kind for reuse?
| /Users/seanohue/myProjects/ranviermud/commands/skills.js | 15 | Refactor for readability by decomposing nested conditionals.
| /Users/seanohue/myProjects/ranviermud/commands/take.js | 14 | Have drop command search containers for items to drop?
| /Users/seanohue/myProjects/ranviermud/commands/take.js | 57 | ItemsUtil?
| /Users/seanohue/myProjects/ranviermud/commands/take.js | 62 | ItemsUtil file?
| /Users/seanohue/myProjects/ranviermud/commands/take.js | 122 | SAVE THIS FOR TAKE/GET?
| /Users/seanohue/myProjects/ranviermud/commands/take.js | 132 | Then filter for ones that can fit the item.
| /Users/seanohue/myProjects/ranviermud/commands/train.js | 20 | Extract into own function in Skills module.
| /Users/seanohue/myProjects/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanohue/myProjects/ranviermud/src/combat_util.js | 90 | Can be done better with changes to npc class.
| /Users/seanohue/myProjects/ranviermud/src/item_util.js | 268 | Deprecate the items below, or at least have them call above functions and then
| /Users/seanohue/myProjects/ranviermud/src/rtcombat.js | 324 | In statusUtils: This could be a problem if the combat is between two NPCs or two players.
| /Users/seanohue/myProjects/ranviermud/commands/appraise.js | 35 | There has to be a better way...
| /Users/seanohue/myProjects/ranviermud/commands/look.js | 77 | This does not really seem to be working.
| /Users/seanohue/myProjects/ranviermud/commands/look.js | 78 | Consider making it a 'scout' command/skill.