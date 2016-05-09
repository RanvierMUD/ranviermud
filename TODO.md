### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 76 | Add admin commands prefaced with @
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 317 | Refactor as to not rely on negative conditionals as much?
| /Users/seanodonohue/myForks/ranviermud/src/feats.js | 25 | Find a way to broadcast feat use to players in same room/area.
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 248 | dry-ify the following
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 149 | Consider using Random.roll instead.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 365 | Change this once skills are revised.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 2 | Add strings for sanity damage
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 226 | consider doing sanity damage to all other players in the room.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 250 | More candidates for utilification, I suppose.
| /Users/seanodonohue/myForks/ranviermud/src/skills.js | 23 | Find a way to broadcast skill use to players in room.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanodonohue/myForks/ranviermud/scripts/behaviors/objects/wieldable.js | 7 | broadcast to other players in room
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 71 | Add better skill assignment event.
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 90 | Permadeath, add it.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 63 | Change to calculate based on character's strength and pack size vs. item weight/size.
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 72 | Improve based on player stats/skills?
| /Users/seanodonohue/myForks/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/pathfinding.js | 13 | There is probable a better pattern to use than this...
| /Users/seanodonohue/myForks/ranviermud/src/rooms.js | 214 | 
| /Users/seanodonohue/myForks/ranviermud/commands/skills.js | 11 | Probably won't work because skills are borked.
| /Users/seanodonohue/myForks/ranviermud/commands/wear.js | 42 | Emitting wear does not always work. Perhaps due to items lackign scripts.