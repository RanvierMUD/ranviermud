In Ranvier all items for an area are defined in a single file within the area folder: `items.yml`

[TOC]

## Example File

`bundles/ranvier-areas/areas/limbo/npcs.yml`
``` yaml
- id: 1
  name: "Rusty Shiv"
  roomDesc: "a razor-sharp shiv coated in rust"
  keywords: [ "shiv", "rusty", "shank", "metal", "rust" ]
  description: "A short, jagged metal shard, discolored with red corrosion. Rather than a handle, someone has wrapped grimy grip tape around the base of the instrument."
  script: "1-shiv"
  slot: 'wield'
  attributes:
      speed: 10
      damage: 1-15
- id: 2
  name: "Slice of Cheese"
  roomDesc: "A moldy slice of cheese"
  keywords: [ "slice", "cheese", "moldy" ]
  description: "A yellow, slightly moldy slice of cheese. Only a rat could find this appetizing."
  behaviors:
    decay:
      duration: 240
- id: 3
  type: CONTAINER
  name: "Wooden Chest"
  roomDesc: "A wooden chest rests open in the corner, its hinges badly rusted."
  keywords: [ "wooden", "chest" ]
  description: "Time has not been kind to this chest. It seems to be held together solely by the dirt and rust."
  items: [ "limbo:1" ]
```

## Definition Fields

`field` _`type`_ `(default)`

----

`id` _`number`_
:    ***required*** Item id unique among the items of the current area

`type` _`ItemType`_ `(OBJECT)`
:    See `src/ItemType.js`. Natively doesn't not change _functionality_, simply a helper for you to use in scripts to
detect the item type

`name` _`string`_
:    ***required*** String seen in the player's inventory, equipment list

`roomDesc` _`string`_
:    ***required*** String displayed when the item is seen on the ground in a room

`keywords` _`string`_
:    ***required*** Keywords that the player can use to target this item, does not need to be unique

`description` _`string`_
:    String displayed when the player looks directly at the item

`script` _`string`_
:    Name of custom script to attach to this item (See [Scripting](scripting.md))

`behaviors` _`Object<string,Object>`_
:    List of behaviors to attach to this item. Key is the behavior name, the value is the configuration for that
behavior. For boolean (on/off) behaviors, `true` suffices for the config. (See [Scripting](scripting.md) for creating behaviors)

`slot` _`string`_
:    If the item can be equipped `slot` identifies the wear location of the item. This can be an arbitrary string but
you probably want to limit to a standard list of locations

`attributes` _`object`_
:    Arbitrary list of attributes to attach to this object. There are no constraints on this so you are free to assign
basically anything here that you want to look for inside commands/scripts/etc.

`items` _`array<EntityReference>`_
:    List of Entity References identifying which items should be loaded into this item's inventory
