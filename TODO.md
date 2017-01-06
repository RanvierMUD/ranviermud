[ ] Refactor/rewrite entity loading

 * Why does the item specify where it loads instead of the location specifying?
 * Currently no "areas". Allow npcs/objects/rooms to be grouped under an "area" folder

[ ] Clean up object handling code (item_util, get, put, containers, equipment, inventory, etc)
[ ] Remove/refactor doors
[ ] Look at tick code
[ ] Remove sean's skills
[ ] Completely rewrite helpfiles

 * Having a JSON blob doesn't work (help text needs to be auto-wrapped)
 * allow tokens in helpfiles so they can render dynamically

[ ] Remove examine
[ ] Fix effects to only serialize options, not the entire effects array
[ ] Refactor command_util
[ ] Remove|move|refactor combat_util/rtcombat
[ ] Refactor channels to have types that will allow things like yell vs chat

 * Move say/tell to real commands instead of channels
 * Move channels to a config file
