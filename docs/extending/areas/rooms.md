In Ranvier, all rooms for an area are defined in a single file within the area folder: `rooms.yml`

[TOC]

## Example File

### Rooms without coordinates

This is an example file of rooms that _don't_ use coordinates and always explicitly define their exits. This is pretty
standard for old MUDs. However, described below is a way to describe a room using coordinates and such you can use
the coordinates to infer the allowable exits for a room for you, doors work all the same.

`bundles/ranvier-areas/areas/limbo/rooms.yml`
``` yaml
- id: white
  title: "White Room"
  description: "A featureless white room. A pitch black void in the shape of archway can be seen on the east side of the room."
  npcs: ["limbo:rat" ]
  items:
    - id: "limbo:woodenchest"
      respawnChance: 20
      replaceOnRespawn: true # when this chest respawns completely replace it so its contents get refreshed
  script: "white"
  exits:
    - roomId: "limbo:black"
      direction: east
      leaveMessage: " steps into the void and disappears."
- id: black
  title: "Black Room"
  description: >-
    A completely black room. Somehow all of the light that should be coming from the room to the west does not pass
    through the archway. A single lightbulb hangs from the ceiling illuminating a small area.
  items:
    - id: "limbo:sliceofcheese"
      respawnChance: 10
      maxLoad: 5
  npcs: ["limbo:wiseoldman"]
  exits:
    - roomId: "limbo:white"
      direction: west
      leaveMessage: " steps into the light and disappears."
  doors:
    "limbo:white": # The player encounters a door when trying to move between "limbo:white" and this room
      lockedBy: "limbo:test_key" # this room can only be locked/unlocked with this item
      locked: true # if the door is locked by default
      closed: true # if the door is closed by default
```

### Rooms with coordinates

```yaml
- id: start
  title: Begin
  coordinates: [0, 0, 0]
  description: "You are in the start of this area. There are hallways to the north and south."

- id: hallway-north-1
  title: Hallway North 1
  coordinates: [0, 1, 0]
  description: "You are in the north hallway."
- id: hallway-north-2
  title: Hallway North 2
  coordinates: [0, 2, 0]
  description: "You are in the north hallway."

- id: hallway-south-1
  title: Hallway South 1
  coordinates: [0, -1, 0]
  description: "You are in the south hallway."
- id: hallway-south-2
  title: Hallway South 2
  coordinates: [0, -2, 0]
  description: "You are in the south hallway."

- id: attic-south
  title: Attic
  coordinates: [0, -2, 1]
  description: "You are in the attic."
  # this room has inferred exits from its coordinates and also manually specifies an exit to leave the area
  exits:
    - direction: east
      roomId: "limbo:white"

# Note that this room doesn't have coordinates, that's completely fine.
# It will still exist in the area but it will not be on the map and will only be
# reachable by explicitly defining an exit that leads to this room like above
# or by having a script send the player to this room.
- id: other-room
  title: Secret Room
  description: "Welcome to the secret room"
```

## Doors

Doors are specified with the `doors` config on the room you want to block access to. Meaning if I want the player in
Room A to run into a door when going east to Room B you specify the door config on Room B, not on Room A.  It should be
noted that, while the `Room` object allows the definition of doors/locks, nothing in the core (or rooms themselves)
block access based on these doors/locks, that is done inside the bundles. See the `move` command in the
`ranvier-commands` bundle for an demonstration of how access is blocked or the `lock`/`open` commands to see how the
doors are controlled.

> Note: When defining doors be careful to make sure you don't accidentally define a double door like a hotel room where
> Room A has a door blocking access to Room B and Room B has _another_ door blocking access from Room A as this could
> cause the player to have to open two doors every time they moved between the rooms.

## Definition Fields

`field` _`type`_ `(default)`

----

`id` _`string`_
:    ***required*** Room id, unique among the rooms of the current area

`title` _`string`_
:    ***required*** Title of the room, shown on `look` or `scan`

`description` _`string`_
:    ***required*** Long description of the room, shown under the title on `look`

`coordinates` _`Array<number>`_
:    Optional coordinates for the room in `[x, y, z]` format.

`npcs` _`Array<EntityReference>`_
:    List of NPCs to place in this room on initial load. You can customize the number of max instances of the NPC per room and the respawn chance by making the `npcs` entry an object as described above in the "Test Room 2" example.

`items` _`Array<EntityReference>`_
:    List of items to place in this room on initial load. As with NPCs, you can customize the respawn chance for the
item. For containers there's also `replaceOnRespawn` which when the item is due to respawn will replace an empty
instance will a full one

`script` _`string`_
:    Name of custom script to attach to this room (See [Scripting](scripting.md))

`behaviors` _`array<string>`_
:    List of behaviors to attach to this room (See [Scripting](scripting.md))

`metadata` _`object`_
:    A place to put other data you want to access inside scripts/behaviors/commands/etc. that doesn't fit into one of
the existing properties. See `Room.getMeta` and `Room.setMeta`. Note: changes to metadata while the server is running
will be lost when the server is shut down.

`exits` _`Array`_
:    Rooms the player can get to from here; each `exits` entry has the following fields:

> `direction` _`string`_
> :    ***required*** Movement command the player will use to leave the room (Standard compass directions are recommended)
>
> `roomId` _`EntityReference`_
> :    ***required*** Room the player will end up in when they go this direction
>
> `leaveMessage` _`string`_
> :    Message shown to the room when the player leaves the room in this direction. In the Room 1 example above, players
> in the same room will see "Shawn steps into the void and disappears." when Shawn leaves to the east.

`doors` _`object`_
:    Doors blocking access to this room. The key for each door is the room you want to block access _from_. So if you
want to block access to players coming _from_ `limbo:training` into the room the key would be `"limbo:training"`

> `lockedBy` _`EntityReference`_
> :    Optional item EntityReference of the item that will be the key that locks/unlocks the door
>
> `locked` _`boolean`_ `(false)`
> :    Whether the door starts locked
>
> `closed` _`boolean`_ `(false)`
> :    Whether the door starts closed
