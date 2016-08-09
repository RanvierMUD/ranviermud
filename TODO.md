### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 85 | Can be done better with changes to npc class.
| /Users/seanodonohue/myForks/ranviermud/src/items.js | 12 | Refactor plz;
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 291 | This could be a problem if the combat is between two NPCs or two players.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 292 | The fix might have to go in statusUtils?
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 71 | This does not really seem to be working.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 72 | Consider making it a 'scout' command/skill.
| /Users/seanodonohue/myForks/ranviermud/commands/wear.js | 77 | Add wear scripts to items.

### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 246 | Weapon skills related to weapon type?
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 247 | General combat skills?
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 36 | Extract into individual files.
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 84 | boostAttr
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 85 | invis
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 136 | Do the same way as above once you extract the admin commands.
| /Users/seanodonohue/myForks/ranviermud/src/effects.js | 4 | Extract into own directory. Too many effects.
| /Users/seanodonohue/myForks/ranviermud/src/effects.js | 5 | Make an atom snippet for this?
| /Users/seanodonohue/myForks/ranviermud/src/effects.js | 6 | Effects_utils?
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 24 | Deprecate this if possible.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 37 | Pass most of these and l10n into events.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 83 | Extract stuff like this into Data module as util funcs.
| /Users/seanodonohue/myForks/ranviermud/src/examine.js | 18 | Change command so that it can work on any item, npc, or room by emitting.
| /Users/seanodonohue/myForks/ranviermud/src/help_files.js | 39 | Dynamically pull in list of admins
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 202 | Have spawn inventory but also add same inv functionality as player
| /Users/seanodonohue/myForks/ranviermud/src/pathfinding.js | 80 | Custom entry messages for NPCs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 59 | Generated descs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 292 | Consider using Random.roll instead.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 518 | Probably a better way to do this than toLowerCase.
| /Users/seanodonohue/myForks/ranviermud/src/rooms.js | 3 | Refactor
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 5 | Add strings for sanity damage
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 6 | Enhance for co-op, allow for setInCombat of NPC with multiple players.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 92 | What if they swap weapons mid-fight?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 134 | Remove this when allowing for multicombat.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 135 | Use an array of targets for multicombat.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 236 | What if there are no players involved in combat?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 327 | Add to utils helper.js file
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 336 | Use filter to remove the combatants from an array. Probably do this inside the player/npc objs.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 340 | Handle PvP or NvN combat ending differently.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 366 | consider doing sanity damage to all other players in the room.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 378 | Extract this to combat utils.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 379 | Make NPCs have fleeing behavior, too.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 380 | Emit flee?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 392 | Use Broadcast module or extract to the Broadcast file.
| /Users/seanodonohue/myForks/ranviermud/src/skills.js | 30 | Pull into own files.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanodonohue/myForks/ranviermud/scripts/objects/1-shiv.js | 15 | Test to make sure this gets removed on quit.
| /Users/seanodonohue/myForks/ranviermud/scripts/objects/1-shiv.js | 32 | Test to make sure this gets removed on quit.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 2 | Refactor into individual files.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 63 | Improve player messaging for this by:
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 87 | Emit sanity loss event here if applicable.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 90 | Extract all stuff for determining stat gain into level utils.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 154 | Permadeath, add it.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 62 | Change to calculate based on character's strength and pack size vs. item weight/size.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 70 | Improve based on player stats/skills?
| /Users/seanodonohue/myForks/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.