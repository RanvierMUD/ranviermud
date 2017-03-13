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
> example, in the `kill` command in `ranvier-combat` to differentiate pacifist NPCs from NPCs that can enter combat

## File Structure

Single-entity scripts and Behavior script files follow the same file structure outlined below.

```javascript
'use strict';

module.exports = srcPath => {
  return {
    /*
    The familiar bundle script file format we've seen in commands and quests returns here.
    To listen for an event simply add a new key which is the event name to 'listeners'
    and whose value is a closure accepting GameState (state) and returning a function
    whose arguments are dependant on the event. See the Default Events section below for
    to see some examples of arguments to the listeners.
    */
    listeners: {
      someEvent: state => (/* event args */) => {
        // do stuff here
      }
    }
  };
};
```

**NOTE**: Behaviors are slightly different because the first argument to their listener is
_always_ `config`, an object that will be equal to the behavior config as defined in that
entity's yml file. As an example, the following is what an item with a 'test' behavior
that listens for the 'foo' event would look like:

In items.yml:
```yaml
- id: 9
  name: 'My Item'
  behaviors:
    test:
      hello: "World"
```

When event is fired:
```javascript
// the config is automatically prepended to the arguments, you DO NOT have to manually
// send it in when emitting events
myItem.emit('foo', player, 'baz');
```

In your behavior listeners:
```javascript
listeners: {
  foo: state => (config, player, thing) => {
    console.log(config);
    /*
    This will output as per the 'test' behaviors config in items.yml
    {
      hello: "World"
    }
    */
    console.log(player, thing); /* Player, 'baz' */
  }
}
```

## Default events

This is a list of events that are emitted by default in Ranvier.

***Engine*** - Events that come from the engine itself (from `src/`) and will _always_ be available.

***Default Bundles*** - Events that come from one of the `ranvier-*` bundles and may not be available if you have disabled them.

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
:    This event is special in that it automatically fires every tenth of a second on Rooms, Items, NPCs, and Players.
This event should be used for any event that is based on time, e.g., NPC should wander around every N seconds.

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

`updateTick`
:    See `updateTick` for NPCs

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
:    See `updateTick` for NPCs

#### Core Bundles

`playerEnter` _`(Player player)`_
:    `player` just entered this room

`playerLeave`_`(Player player)`_
:    `player` just left this room. **NOTE**: `playerLeave` is actually fired _before_ the player is removed from the room.
