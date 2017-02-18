Bundles are the way you modify Ranvier's functionality without having to touch
the core code. They let you modify basically everything about the game: how
commands are interpreted, commands themselves, channels, items, rooms, NPCs,
quests, login flow, and spell effects.

[TOC]

## Default Bundles

Ranvier comes with a set of bundles that provide a base level amount of
functionality expected in most Diku-style MUDs.

* `core-areas` - Small example area demonstrating diku-style rooms, NPCs,
  items, and quests.
* `core-channels` - Set of example channels: say, tell, yell, and chat
* `core-classes` - A basic example of classes, skills (active and passive), and spells
* `core-combat` - Basic diku style real-time auto combat
* `core-commands` - Set of basic diku style commands: movement, look, get, drop, wear, who, etc.
* `core-effects` - Set of example spell effects
* `core-input-events` - Diku-style implementation of login flow with accounts
  and Diku-style command interpretation
    * **Warning:** Disabling this bundle is ill-advised unless you have studied
      well the [Input Events](/extending/input-events.md) documentation
* `core-player-events` - Example implementation of experience/leveling for the player
* `debug-commands` - Commands useful while debugging (`givexp` for example)
    * **Warning:** It is highly recommend that you disable this module for your
      live server as it would otherwise effectively give players access to cheatcodes

These bundles are not _required_ to be enabled but some of the `core-` bundles do have interdependencies. If you would like to modify one of the core bundles it's recommended that you disable the bundle you wish to modify, copy it to your own bundle and modify that. This way you can safely pull in updates without worrying about conflicts.

## Enabling &amp; Disabling Bundles

To enable or disable a bundle simply add/remove the bundle name from `bundles` in the `ranvier.json` config. You can see an overview of that file in the [Server Config](../server_config.md) section.

## Creating a Bundle

Each individual bundle is a standalone modification to the game, think of them
like a Skyrim mod. A mod could add a single item or it could completely
transform the game. Unlike Skyrim mods load order does not matter.

To create a new bundle simply create a new directory underneath `bundles/`. Inside your bundle directory you may have any or all of the folders/files below.

### What's in a Bundle

A bundle can contain any or all of the following children though it's suggested that you keep your bundles as modular as possible. Click on any of the items below to see an in-depth tutorial.

<pre>
<a href="../areas/">areas/</a>
  Areas contain items, rooms, NPCs, and quests.
<a href="../behaviors/">behaviors/</a>
  Behaviors are scripts that are shared between entities of the same type (rooms, items, NPCs)
<a href="../classes/">classes/</a>
  Player classes
<a href="../commands/">commands/</a>
  What it says on the tin, commands to add to the game
<a href="../effects/">effects/</a>
  Effects that can be applied to characters (NPCs/Players)
<a href="../help/">help/</a>
  Helpfiles
<a href="../input-events/">input-events/</a>
  Input events are events that happen on the socket, this involves login and command interpreting.
  <strong>Warning:</strong> Because of input events' important role it is generally not advised to load more than one
  bundle with input events
<a href="../skills/">skills/</a>
  Player skills (Spells are just skills with the SPELL type)
<a href="../channels/">channels.js</a>
  Communication channels
<a href="../player-events/">player-events.js</a>
  Basically everything the player does triggers an event on them that can be attached to and perform
  functionality such as experience, leveling, combat, and time based calculations
</pre>
