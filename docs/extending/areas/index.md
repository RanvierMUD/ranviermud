Areas contain all the "content" of the MUD: items, npcs, rooms, and quests.

## Directory Structure

A single bundle can contain multiple areas and like bundles an area need only
have the files necessary for the content (i.e., you don't need to include a
quests file if you have no quests.) For pedagogical completeness this example
bundle with a single area has all of the possible entities: items, npcs,
scripts, and quests.

Click on any of the items to see more in-depth tutorials on their contents.

<pre>
core-areas/
  areas/
    limbo/ - Actual area folder, name doesn't matter. Area title comes from the manifest
      <a href="/extending/scripting.md">scripts/</a>     - Scripts for individual entities
      <a href="#the-manifest">manifest.yml</a> - <strong>Required</strong> - Metadata about the area itself
      <a href="/extending/items.md">items.yml</a>    - Item definitions
      <a href="/extending/npcs.md">npcs.yml</a>     - NPC definitions
      <a href="/extending/rooms.md">rooms.yml</a>    - Room definitions
      <a href="/extending/quests.md">quests.js</a>    - Quest implementations
</pre>

## The Manifest

The manifest right now is incredibly simple and only requires one setting: `title`

Example Manifest

    ---
    title: "My Area Title"

In the future the manifest could be used to define any type of area-wide
property such as biome, suggested level, respawn time, weather, etc.
