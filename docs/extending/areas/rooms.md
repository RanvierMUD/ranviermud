In Ranvier, all rooms for an area are defined in a single file within the area folder: `rooms.yml`

[TOC]

## Example File

`bundles/ranvier-areas/areas/limbo/rooms.yml`
``` yaml
- id: 1
  title: "Test Room 1"
  description: "A featureless white room. A pitch black void in the shape of archway can be seen on the east side of the room."
  npcs: ["limbo:1"]
  items:
    - id: "limbo:3"
      replaceOnRespawn: true
      respawnChance: 30
  script: "1-test"
  exits:
    - roomId: "limbo:2"
      direction: "east"
      leaveMessage: " steps into the void and disappears."
- id: 2
  title: "Test Room 2"
  description: "A completely black room. Somehow all of the light that should be coming from the room to the west does not pass through the archway. A single lightbulb hangs from the ceiling illuminating a small area."
  behaviors: [ "test" ]
  items: ["limbo:2"]
  npcs:
    - id: "limbo:2"
      respawnChance: 20
      maxLoad: 5
  exits:
    - roomId: "limbo:1"
      direction: "west"
      leaveMessage: " steps into the light and disappears."

```

## Definition Fields

`field` _`type`_ `(default)`

----

`id` _`number`_
:    ***required*** Room id, unique among the rooms of the current area

`title` _`string`_
:    ***required*** Title of the room, shown on `look` or `scan`

`description` _`string`_
:    ***required*** Long description of the room, shown under the title on `look`

`npcs` _`Array<EntityReference>`_
:    List of NPCs to place in this room on initial load. You can customize the number of max instances of the NPC per room and the respawn chance by making the `npcs` entry an object as described above in the "Test Room 2" example.

`items` _`Array<EntityReference>`_
:    List of items to place in this room on initial load. As with NPCs, you can customize the respawn chance for the item. For containers there's also `replaceOnRespawn` which when the item is due to respawn will replace an empty instance will a full one

`script` _`string`_
:    Name of custom script to attach to this room (See [Scripting](scripting.md))

`behaviors` _`array<string>`_
:    List of behaviors to attach to this room (See [Scripting](scripting.md))

`exits` _`Array`_
:    Rooms the player can get to from here; each `exits` entry has the following fields:

> `direction` _`string`_
> :    ***required*** Movement command the player will use to leave the room (Standard compass directions are recommended)
>
> `roomId` _`EntityReference`_
> :    ***required*** Room the player will end up in when they go this direction
>
> `leaveMessage` _`string`_
> :    Message shown to the room when the player leaves the room in this direction. In the Room 1 example above, players in the same room will see "Shawn steps into the void and disappears." when Shawn leaves to the east.
