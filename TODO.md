
## Critical

- [ ] Respawn
- [ ] "Hotboot" - Reload anything from a bundle. Changing core will require a restart
- [ ] Rewrite script attachment to entities with the new bundle loader
- [ ] Implement containers
- [ ] Implement equipping (allow configuration of valid slots)
- [ ] Implement some kind of helper for time-based events
- [X] Refactor/rewrite entity loading

  * Completely new bundle system in place

- [X] Clean up object handling code (item_util, get, put, containers, equipment, inventory, etc)

  * Object handling rewritten from scratch

- [X] Revisit localization

  Localization removed

- [X] Implement global config file to allow sweeping changes without changing code
- [X] Completely rewrite helpfiles
- [X] Refactor channels to have types that will allow things like yell vs chat

  * Channels were completely rewritten

## Features/Bugs

- [ ] Remove/refactor doors
- [ ] Remove sean's skills
- [X] Remove examine
- [ ] Fix effects to only serialize options, not the entire effects array
- [ ] Remove|move|refactor combat_util/rtcombat

## Nice to have

- [ ] Update help to autogenerate usage for channels
- [ ] Update help to allow data like skill cost as tokens
