### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/accounts.js | 134 | Use this in the accountmanager when loading all accounts
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 34 | Extract into individual files.
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 83 | boostAttr
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 84 | invis
| /Users/seanodonohue/myForks/ranviermud/src/commands.js | 135 | Do the same way as above once you extract the admin commands.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 19 | Deprecate this if possible.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 23 | Automate this using fs.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 37 | Pass most of these and l10n into events.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 128 | Put any player name whitelisting/blacklisting here.
| /Users/seanodonohue/myForks/ranviermud/src/help_files.js | 39 | Dynamically pull in list of admins
| /Users/seanodonohue/myForks/ranviermud/src/npcs.js | 197 | Have spawn inventory but also add same inv functionality as player
| /Users/seanodonohue/myForks/ranviermud/src/pathfinding.js | 83 | Custom entry messages for NPCs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 57 | Generated descs.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 279 | Consider using Random.roll instead.
| /Users/seanodonohue/myForks/ranviermud/src/player.js | 501 | Probably a better way to do this than toLowerCase.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 3 | Add strings for sanity damage
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 4 | Enhance for co-op, allow for setInCombat of NPC with multiple players.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 258 | consider doing sanity damage to all other players in the room.
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 282 | More candidates for utilification, I suppose.
| /Users/seanodonohue/myForks/ranviermud/src/status.js | 2 | Dry this up more.
| /Users/seanodonohue/myForks/ranviermud/src/events/commands.js | 116 | Refactor as to not rely on negative conditionals as much?
| /Users/seanodonohue/myForks/ranviermud/src/events/createAccount.js | 55 | Validate password creation.
| /Users/seanodonohue/myForks/ranviermud/src/events/login.js | 62 | Blacklist/whitelist names here.
| /Users/seanodonohue/myForks/ranviermud/src/events/login.js | 63 | Put name validation functions in module
| /Users/seanodonohue/myForks/ranviermud/src/events/login.js | 233 | Refactor?
| /Users/seanodonohue/myForks/ranviermud/src/events/login.js | 234 | Put this in its own emitter or extract into method or something?
| /Users/seanodonohue/myForks/ranviermud/src/events/login.js | 255 | Have load in player file?
| /Users/seanodonohue/myForks/ranviermud/scripts/player/player.js | 134 | Permadeath, add it.
| /Users/seanodonohue/myForks/ranviermud/commands/close.js | 8 | Dry up this and open.js since they are almost the same.
| /Users/seanodonohue/myForks/ranviermud/commands/get.js | 62 | Change to calculate based on character's strength and pack size vs. item weight/size.
| /Users/seanodonohue/myForks/ranviermud/commands/lock.js | 8 | Finish since this is copied from close.js
| /Users/seanodonohue/myForks/ranviermud/commands/look.js | 69 | Improve based on player stats/skills?
| /Users/seanodonohue/myForks/ranviermud/commands/unlock.js | 8 | Finish since this is copied from close.js
| /Users/seanodonohue/myForks/ranviermud/commands/whisper.js | 2 | Refactor to be a channel.

### FIXMEs
| Filename | line # | FIXME
|:------|:------:|:------
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 3 | Find a way to modularize as much of this as possible.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 183 | Kludgey.
| /Users/seanodonohue/myForks/ranviermud/src/events.js | 256 | temp kludge lolz
| /Users/seanodonohue/myForks/ranviermud/src/rooms.js | 216 | 
| /Users/seanodonohue/myForks/ranviermud/src/rtcombat.js | 5 | For the love of all that is unholy, refactor this:
| /Users/seanodonohue/myForks/ranviermud/commands/wear.js | 69 | Add wear scripts to items.