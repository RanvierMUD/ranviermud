### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/accounts.js | 134 | Use this in the accountmanager when loading all accounts
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 105 | Use mods instead.
| /Users/seanodonohue/myForks/ranviermud/src/combat_util.js | 144 | Use mod methods instead.
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 36 | Extract into individual files.
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 84 | boostAttr
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 85 | invis
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 136 | Do the same way as above once you extract the admin commands.
| /Users/seanodonohue/myForks/ranviermud/src/doors.js | 1 | Implement helper functions for:
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 24 | Deprecate this if possible.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 37 | Pass most of these and l10n into events.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 83 | Extract stuff like this into Data module as util funcs.
| /Users/seanodonohue/myForks/ranviermud/src/examine.js | 18 | Change command so that it can work on any item, npc, or room by emitting.
| /Users/seanodonohue/myForks/ranviermud/src/help_files.js | 39 | Dynamically pull in list of admins
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 199 | Have spawn inventory but also add same inv functionality as player
| /Users/seanodonohue/myForks/ranviermud/src/pathfinding.js | 81 | Custom entry messages for NPCs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 59 | Generated descs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 291 | Consider using Random.roll instead.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 513 | Probably a better way to do this than toLowerCase.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 5 | Add strings for sanity damage
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 6 | Enhance for co-op, allow for setInCombat of NPC with multiple players.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 69 | Set an effect instead if possible.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 75 | Remove this when allowing for multicombat.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 89 | Extract to module
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 193 | Add to utils helper.js file
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 251 | consider doing sanity damage to all other players in the room.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 275 | More candidates for utilification, I suppose.
| /Users/seanodonohue/myForks/ranviermud/src/skills.js | 30 | Pull into own files.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 134 | Permadeath, add it.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 62 | Change to calculate based on character's strength and pack size vs. item weight/size.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 70 | Improve based on player stats/skills?
| /Users/seanodonohue/myForks/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/items.js | 12 | Refactor plz;
| /Users/seanodonohue/myForks/ranviermud/src/rooms.js | 216 | 
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 7 | For the love of all that is unholy, refactor this:
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 29 | Use Types instead
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 83 | Extract to module
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 71 | This does not really seem to be working.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 72 | Consider making it a 'scout' command/skill.
| /Users/seanodonohue/myForks/ranviermud/commands/wear.js | 69 | Add wear scripts to items.