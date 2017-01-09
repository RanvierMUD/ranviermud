- [ ] Rewrite script attachment to entities with the new bundle loader
- [X] Refactor/rewrite entity loading

 * Why does the item specify where it loads instead of the location specifying?
 * Currently no "areas". Allow npcs/objects/rooms to be grouped under an "area" folder

- [X] Clean up object handling code (item_util, get, put, containers, equipment, inventory, etc)
- [ ] Remove/refactor doors
- [ ] Look at tick code
- [ ] Remove sean's skills
- [X] Completely rewrite helpfiles

 * Having a JSON blob doesn't work (help text needs to be auto-wrapped)
 * allow tokens in helpfiles so they can render dynamically

- [X] Remove examine
- [ ] Fix effects to only serialize options, not the entire effects array
- [ ] Remove|move|refactor combat_util/rtcombat
- [X] Refactor channels to have types that will allow things like yell vs chat

 * Move say/tell to real commands instead of channels
 * Move channels to a config file

- [X] Revisit localization (Removed)
- [ ] Update help to autogenerate usage for channels
- [ ] Update help to allow data like skill cost as tokens
