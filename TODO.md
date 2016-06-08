### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 76 | Add admin commands prefaced with @
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 222 | Consider saving player here as well, and stuff.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 228 | Have load in player file?
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 331 | Refactor as to not rely on negative conditionals as much?
| /Users/seanodonohue/myForks/ranviermud/src/feats.js | 114 | Cooldown?
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 192 | Have spawn inventory but also add same inv functionality as player
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 52 | Generated descs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 236 | Consider using Random.roll instead.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 453 | Probably a better way to do this than toLowerCase.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 3 | Add strings for sanity damage
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 4 | Enhance for co-op, allow for setInCombat of NPC with multiple players.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 228 | consider doing sanity damage to all other players in the room.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 252 | More candidates for utilification, I suppose.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanodonohue/myForks/ranviermud/scripts/behaviors/objects/wieldable.js | 7 | broadcast to other players in room
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 87 | Permadeath, add it.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 63 | Change to calculate based on character's strength and pack size vs. item weight/size.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 72 | Improve based on player stats/skills?
| /Users/seanodonohue/myForks/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/pathfinding.js | 13 | There is probable a better pattern to use than this...
| /Users/seanodonohue/myForks/ranviermud/src/rooms.js | 214 | 
| /Users/seanodonohue/myForks/ranviermud/commands/wear.js | 42 | Emitting wear does not always work. Perhaps due to items lackign scripts.