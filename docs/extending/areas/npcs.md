In Ranvier all NPCs for an area are defined in a single file within the area folder: `npcs.yml`

[TOC]

## Example File

`bundles/ranvier-areas/areas/limbo/npcs.yml`
``` yaml
- id: rat
  keywords: ['rat']
  name: 'Rat'
  level: 2
  description: "The rat's beady red eyes dart frantically, its mouth foaming as it scampers about."
  script: '1-rat'
  items: ['limbo:sliceofcheese']
  quests: ['limbo:onecheeseplease']
  attributes:
    health: 100
    speed: 2.5
  damage: 1-7
- id: wiseoldman
  keywords: ["wise", "old", "man"]
  name: "Wise Old Man"
  behaviors:
    pacifist: true
  description: "A wise looking old man sits on the ground with legs crossed."
- id: 3
  keywords: ["dummy", "target", "practice"]
  level: 2
  name: "Training Dummy"
  behaviors:
    lootable:
      table:
        pools:
        - "limbo:junk"
        - "limbo:sliceofcheese": 25
```

Here we have two NPCs. The rat can enter combat, has a custom script, a default inventory, hands out a quest and has
some extra attributes. The old man is the most basic NPC you can have.

## Definition Fields

`field` _`type`_ `(default)`

----

`id` _`string`_
:    ***required*** NPC id, unique among the NPCs of the current area

`name` _`string`_
:    ***required*** String displayed when the player sees the NPC in the room

`keywords` _`string`_
:    ***required*** Keywords that the player can use to target this NPC, keywords do not need to be unique

`description` _`string`_
:    ***required*** String displayed when the player looks directly at the NPC

`script` _`string`_
:    Name of custom script to attach to this NPC (See [Scripting](scripting.md))

`behaviors` _`Object<string,Object>`_
:    List of behaviors to attach to this NPC. The key is the behavior name, the value is the configuration object for that
behavior. For boolean (on/off) behaviors, `true` suffices for the config. (See [Scripting](scripting.md) for creating behaviors)

`metadata` _`object`_
:    A place to put other data you want to access inside scripts/behaviors/commands/etc. that doesn't fit into one of the existing properties. See `Character.getMeta` and `Character.setMeta`. Note: changes to metadata while the server is running will be lost when the server is shut down.

`attributes` _`object`_
:    Arbitrary list of attributes to attach to this NPC. Unlike items, these attributes will be turned into an AttributesMap (see `src/Attributes` and `src/Character`, so these are not arbitrary.

`items` _`array<EntityReference>`_
:    List of Entity References representing the NPC's default inventory

`quests` _`array<EntityReference>`_
:    List of Entity References representing the quests that this character gives out (See [Quests](quests.md))
