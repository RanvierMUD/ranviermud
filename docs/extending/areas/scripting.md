Item, NPC, and Room scripting comes in the form of event scripting, see the [Event](../events/) section for a general overview
of how that works before reading on.

[TOC]

## Creating a script

Scripts are defined for an area in the `scripts/` folder underneath the area's folder. For each entity type there is a
subfolder. For example:

```
bundles/my-area/areas/limbo/
  scripts/
    npcs/
      1-rat.js
    items/
      1-shiv.js
    rooms/
      1-test.js
```

As a matter of convention scripts are named, `<entity id>-<whatever you want>`. It's not _required_ but it will help a
lot when trying to figure out what script goes to what entity.

See the relevant entity's guide section on how to add the script to the entity.

## Behaviors

Behaviors are scripts that you can reuse for the same entity types across multiple areas/bundles. For example maybe you
want to have many different NPCs wander around or immediately attack players upon entering the room (aggro mobs) you can
use behaviors for that.

Behaviors are defined  exactly the same as normal scripts but are created inside the `behaviors/` directory inside your
bundle but _outside_ of your area definition.

```
bundles/my-area/
  areas/
    limbo/
    ...
  behaviors/
    npcs/
      aggro.js
    items/
    rooms/
```

Again, see the relevant entity's guide section on how to add behaviors to the entity.

> Tip: Behaviors can be used as flags. For example, if you say `behaviors: ['combat']` on an NPC you don't need to
> actually create a combat.js behavior file, `npc.hasBehavior('combat')` will still return true. This is used, as an
> example, in the `kill` command in `core-combat` to differentiate pacifist NPCs from NPCs that can enter combat

## Default events

This is a list of events that are emitted by default in Ranvier.

***Engine*** - Events that come from the engine itself (from `src/`) and will _always_ be available.

***Core Bundles*** - Events that come from one of the `core-*` example bundles and may not be available if you have
disabled the core bundles.

Events are shown as:
`eventName` _`(arguments)`_
:    Details of event


### NPCs

#### Engine

`combatEnd`
:    Combat has ended, specifically NPC's list of combatants is now empty

`combatStart` _`(Character target)`_
:    Combat has started against `target`, specifically NPC was not in combat and now is. Event is _not_ fired if the NPC
was already in combat when new combatants are added

`damaged` _`(Damage damage)`_
:    Something has decreased one of the NPC's attributes, not just health, applies to any attribute. See `src/Damage.js`
for details of information available from `damage` argument.

`heal` _`(Heal heal, Character target)`_
:    Same as `hit` but increased instead of decreased

`healed` _`(Heal heal)`_
:    Same as `damaged` but increased instead of decreased

`hit` _`(Damage damage, Character target)`_
:    This NPC caused damage to the target. Target may be itself.

`spawn`
:    NPC is initially created, fires immediately after NPC is placed in its target room.

`updateTick`
:    This event is special in that it automatically fires every half second on Rooms, NPCs, and Players. This event
should be used for any event that is based on time, i.e., NPC should wander around every N seconds or something.

#### Core Bundles

`deathblow` _`(Character target)`_
:    NPC just killed `target`

`killed`
:    NPC died

`playerDropItem` _`(Player player, Item item)`_
:    `player` just dropped `item` in the room with the NPC

`playerEnter` _`(Player player)`_
:    `player` just entered the room with the NPC

`playerLeave`_`(Player player)`_
:    `player` just left the room. **NOTE**: `playerLeave` is actually fired _before_ the player is removed from the room.

### Items

#### Engine

There are no events emitted by the engine for items

#### Core Bundles

`drop` _`(Player player)`_
:    `player` just dropped this item

`equip` _`(Player player)`_
:    `player` just equipped this item

`get` _`(Player player)`_
:    `player` just picked up this item

`put` _`(Player player, Item container)`_
:    `player` just put this item into `container`

### Rooms

#### Engine

`updateTick`
:    This event is special in that it automatically fires every half second on Rooms, NPCs, and Players. This event
should be used for any event that is based on time, i.e., NPC should wander around every N seconds or something.

#### Core Bundles

`playerEnter` _`(Player player)`_
:    `player` just entered this room

`playerLeave`_`(Player player)`_
:    `player` just left this room. **NOTE**: `playerLeave` is actually fired _before_ the player is removed from the room.
