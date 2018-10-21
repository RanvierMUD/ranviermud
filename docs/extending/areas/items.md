In Ranvier all items for an area are defined in a single file within the area folder: `items.yml`

[TOC]

## Example File

`bundles/ranvier-areas/areas/limbo/items.yml`
``` yaml
- id: "rustysword"
  name: "Rusty Sword"
  type: WEAPON
  roomDesc: "Rusted Sword"
  keywords: [ "sword", "rusty", "metal", "rusted" ]
  description: "An arm's-length, jagged metal sword discolored with red corrosion. The worn leather grip barely held on by fraying thread."
  script: "1-sword"
  metadata:
    level: 1
    slot: 'wield'
    itemLevel: 1
    quality: common
    minDamage: 7
    maxDamage: 15
    speed: 2.8
    stats:
      critical: 1
- id: "sliceofcheese"
  name: "Slice of Cheese"
  roomDesc: "A moldy slice of cheese"
  keywords: [ "slice", "cheese", "moldy" ]
  description: "A yellow, slightly moldy slice of cheese. Only a rat could find this appetizing."
  behaviors:
    decay:
      duration: 240
- id: "woodenchest"
  type: CONTAINER
  name: "Wooden Chest"
  roomDesc: "A wooden chest rests in the corner, its hinges badly rusted."
  keywords: [ "wooden", "chest" ]
  description: "Time has not been kind to this chest. It seems to be held together solely by the dirt and rust."
  items: [ "limbo:rustysword" ]
  closed: true
  maxItems: 5
  metadata:
    noPickup: true
- id: test_key
  name: "Oddly-shaped Key"
  keywords: ["key", "odd", "oddly", "shaped"]
  roomDesc: "A strange looking key"
  description: "This key seems overly complex with numerous grooves."
  metadata:
    quality: common
- id: locked_chest
  type: CONTAINER
  name: "Locked Chest"
  roomDesc: "A wooden chest rests open in the corner, its hinges badly rusted."
  keywords: [ "locked", "wooden", "chest" ]
  items: [ "limbo:rustysword" ]
  closed: true
  locked: true
  lockedBy: "limbo:test_key"
  maxItems: 5
  metadata:
    noPickup: true
```

## Definition Fields

`field` _`type`_ `(default)`

----

`id` _`string`_
:    ***required*** Item id unique among the items of the current area

`type` _`ItemType`_ `(OBJECT)`
:    See `src/ItemType.js`. Natively, does not change _functionality_, simply a helpful flag for you to use in scripts to
detect the item type

`name` _`string`_
:    ***required*** String seen while in the player's inventory or equipment list, or in a container

`roomDesc` _`string`_
:    ***required*** String displayed when the item is seen on the ground in a room

`keywords` _`string`_
:    ***required*** Keywords that the player can use to target this item; keywords do not need to be unique on a per-item basis

`description` _`string`_
:    String displayed when the player looks directly at the item

`script` _`string`_
:    Name of custom script to attach to this item (See [Scripting](scripting.md))

`behaviors` _`Object<string,Object>`_
:    List of behaviors to attach to this item. The key is the behavior name, the value is the configuration object for that
behavior. For boolean (on/off) behaviors, `true` suffices for the config. (See [Scripting](scripting.md) for more on creating behaviors)

`slot` _`string`_
:    If the item can be equipped, `slot` identifies the `wear` location of the item. This can be an arbitrary string but
you probably want to limit equipment to a standard list of locations

`attributes` _`object`_
:    Arbitrary list of attributes to attach to this object. There are no constraints on this so you are free to assign
basically anything here that you want to look for inside commands/scripts/etc. Accessible in scripts via the `item.attributes` property

`items` _`array<EntityReference>`_
:    For containers. A list of Entity References identifying which items should be loaded into this item's inventory

`closeable` _`boolean`_ `(false)`
:    Whether this item can be closed/locked. If either closed or locked is set to true this is true by default.

`closed` _`boolean`_ `(false)`
:    For containers, whether this item is closed by default or not. If true, this item can be opened/closed. If you want this item to
be closed by default but allow it to be opened/closed set `closeable` to true

`locked` _`boolean`_ `(false)`
:    For containers, whether this item is locked by default or not. Warning: setting `locked: true` without specifying a `lockedBy` will
result in an item that cannot be opened.

`lockedBy` _`EntityReference`_
:    Which item acts as the key for this item
