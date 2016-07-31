### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 85 | Can be done better with changes to npc class.
| /Users/seanodonohue/myForks/ranviermud/src/items.js | 12 | Refactor plz;
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 317 | This could be a problem if the combat is between two NPCs or two players.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 318 | The fix might have to go in statusUtils?
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 71 | This does not really seem to be working.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 72 | Consider making it a 'scout' command/skill.
| /Users/seanodonohue/myForks/ranviermud/commands/wear.js | 77 | Add wear scripts to items.

### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 242 | Weapon skills related to weapon type?
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 243 | General combat skills?
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 36 | Extract into individual files.
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 84 | boostAttr
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 85 | invis
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 136 | Do the same way as above once you extract the admin commands.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 24 | Deprecate this if possible.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 37 | Pass most of these and l10n into events.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 83 | Extract stuff like this into Data module as util funcs.
| /Users/seanodonohue/myForks/ranviermud/src/examine.js | 18 | Change command so that it can work on any item, npc, or room by emitting.
| /Users/seanodonohue/myForks/ranviermud/src/help_files.js | 39 | Dynamically pull in list of admins
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 201 | Have spawn inventory but also add same inv functionality as player
| /Users/seanodonohue/myForks/ranviermud/src/pathfinding.js | 81 | Custom entry messages for NPCs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 59 | Generated descs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 292 | Consider using Random.roll instead.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 514 | Probably a better way to do this than toLowerCase.
| /Users/seanodonohue/myForks/ranviermud/src/rooms.js | 3 | Refactor
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 5 | Add strings for sanity damage
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 6 | Enhance for co-op, allow for setInCombat of NPC with multiple players.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 88 | What if they swap weapons mid-fight?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 130 | Remove this when allowing for multicombat.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 131 | Use an array of targets for multicombat.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 199 | Improve the parry, dodge, and miss scripts.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 225 | What if there are no players involved in combat?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 226 | Create a utility func for broadcasting to first, second, and 3rd parties.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 260 | Extract damage funcs to combat helper class.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 267 | Add scripts for hitting with weapons.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 272 | Add scripts for hitting and getting damaged to NPCs.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 279 | This could be a method of util since this pattern is used in a couple of spots.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 353 | Add to utils helper.js file
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 385 | Handle PvP or NvN combat ending differently.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 411 | consider doing sanity damage to all other players in the room.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 423 | Extract this to combat utils.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 424 | Make NPCs have fleeing behavior, too.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 425 | Emit flee?
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 437 | More candidates for utilification, I suppose.
| /Users/seanodonohue/myForks/ranviermud/src/skills.js | 30 | Pull into own files.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 2 | Refactor into individual files.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 62 | Improve player messaging for this by:
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 146 | Permadeath, add it.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 62 | Change to calculate based on character's strength and pack size vs. item weight/size.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 70 | Improve based on player stats/skills?
| /Users/seanodonohue/myForks/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.