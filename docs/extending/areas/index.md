Areas contain all the "content" of the MUD: items, npcs, rooms, and quests.

[TOC]

## Directory Structure

A single bundle can contain multiple areas and like bundles an area need only
have the files necessary for the content (i.e., you don't need to include a
quests file if you have no quests.) For pedagogical completeness this example
bundle with a single area has all of the possible entities: items, npcs,
scripts, and quests.

Click on any of the items to see more in-depth tutorials on their contents.

<pre>
ranvier-areas/
  areas/
    limbo/ - Actual area folder, name will be used as key for `area:id`
             pairs which you'll see for items/npcs
      <a href="scripting/">scripts/</a>     - Scripts for individual entities
      <a href="#the-manifest">manifest.yml</a> - <strong>Required</strong> - Metadata about the area itself
      <a href="items/">items.yml</a>    - Item definitions
      <a href="npcs/">npcs.yml</a>     - NPC definitions
      <a href="rooms/">rooms.yml</a>    - Room definitions
      <a href="quests/">quests.js</a>    - Quest implementations
</pre>

## The Manifest

The manifest right now is incredibly simple and only requires one setting: `title`.

Example Manifest

``` yaml
---
title: "My Area Title"
info:
  respawnInterval: 60
```

`respawnInterval` _`number`_
:    Number of seconds between respawn ticks. See the [Room](rooms.md) section for details on handling respawn. Defaults to 60.

## Entity References

You'll often see strings like `limbo:1`. These are entity references and can refer to Items, NPCs, Rooms, and Quests. The type of entity the reference points to is inferred from its context (e.g., `foobar:1` in an `items` list would point to an Item.) Let's take a look at an example NPC definition:

Assuming both of these definitions live in `bundles/awesome-bundle/areas/foobar/`

``` yaml
- id: 1
  name: "Joe Schmoe"
  items: [ "foobar:1" ]
```

and an accompanying item definition

``` yaml
- id: 1
  name: "Sword of Awesomeness"
```

In the definition of Joe Schmoe, the value`foobar:1` in the `items` property's array means "Find item with the ID `1` in the area `foobar`". Entity ids are only unique within the same entity type of the same area. So Joe Schmoe's entity reference would _also_ be `foobar:1`, but would refer to an NPC.

This string will be described in the subsequent docs as `EntityReference`.

## Coordinates &amp; Mapping

This section is only relevant if you are using coordinates for rooms as described in the [Rooms](rooms.md) guide.

Coordinates for an area are local to that area meaning each area is essentially its own "universe." Think of it
like a video game where you are walking in an area then you come up to a door and when you go in the door you get
a loading screen and area taken to a different place. So if two areas have room at [2, 3, -1] they will not overlap
because that [2, 3, -1] is local to that area's map.

If you want the game to act as if there was one huge contiguous map then all you need to do is build one big
contiguous area.

### Mapping

One way to map a room is to simply iterate over the `rooms` property of an area instance as each room will have its
`coordinates` property has an object like `{x: 1, y: 0, z: -1}` and you can do whatever you like with those values.

The other way is to use the `map` and `floors` properties like so:

```javascript
for (const z of area.floors) {
  const floor = area.map.get(z);

  /*
  Each floor in the `map` is an instance of `AreaFloor` which has the low(X/Y) and high(X/Y) that you can use to define
  your loop boundaries.

  In this case this code will just draw a square map of the entire area.
  */
  let mapString = '';
  for (let y = floor.highY; y >= floor.lowY; y--) {
    for (let x = floor.lowX; x <= floor.highX; x++) {
      if (area.getRoomAtCoordinates(x, y, z)) {
        mapString += '.';
      } else {
        mapString += ' ';
      }
    }
    mapString += '\r\n';
  }

  console.log('Floor ' + z);
  console.log(mapString);
}
```

You can see an example of mapping by looking at the `map` command inside `bundles/ranvier-commands/commands/map.js`. Further
you can look at the `move` and `look` commands to see how the coordinates system is used to infer exits.
