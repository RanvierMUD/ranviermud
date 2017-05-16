Areas contain all the "content" of the MUD: items, npcs, rooms, and quests.

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
