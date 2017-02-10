Bundles are the way you modify Ranvier's functionality without having to touch
the core code. They let you modify basically everything about the game: how
commands are interpreted, commands themselves, channels, items, rooms, npcs,
quests, login flow, and spell effects.

[TOC]

## Default Bundles

Ranvier comes with a set of bundles that provide a base level amount of
functionality expected in most Diku-style MUDs.

* `core-areas` - Small example area demonstrating diku-style rooms, npcs,
  items, and quests.
* `core-channels` - Set of example channels: say, tell, yell, and chat
* `core-combat` - Basic diku style real-time auto combat
* `core-commands` - Set of basic diku style commands: movement, look, get, drop, wear, who, etc.
* `core-effects` - Set of example spell effects
* `core-input-events` - Diku-style implementation of login flow with accounts
  and Diku-style command interpretation
    * **Warning:** Disabling this bundle is ill-advised unless you have studied
      well the [Input Events](/extending/input-events.md) documentation
* `core-player-events` - Example implementation of experience/leveling for the
  player
* `core-skills` - (_currently unused_) Set of example spell effects
* `debug-commands` - Commands useful while debugging (`givexp` for example)
    * **Warning:** It is highly recommend that you disable this module for your
      live server as it would otherwise effectively give players access to cheatcodes

## Enabling &amp; Disabling Bundles

Enabling and disabling bundles is done in the `ranvier.json` config. You can see an overview of that file in the [Server Configuration](/get_started/#server-configuration) section.

## Creating a Bundle


Each individual bundle is a standalone modification to the game, think of them
like a Skyrim mod. A mod could add a single item or it could completely
transform the game. Unlike Skyrim mods load order does not matter.

To create a new bundle simply create a new directory underneath `bundles/`. Inside your bundle directory you may have any or all of the folders/files below.

### What's in a Bundle

A bundle can contain any or all of the following children though it's suggested that you keep your bundles as modular as possible. Click on any of the items below to see an in-depth tutorial.

<pre>
<a href="areas/index.md">areas/</a>
  Areas contain items, rooms, npcs, and quests.
<a href="behaviors.md">behaviors/</a>
  Behaviors are scripts that are shared between entities of the same type (rooms, items, npcs)
<a href="commands.md">commands/</a>
  What it says on the tin, commands to add to the game
<a href="help.md">help/</a>
  Helpfiles
<a href="effects.md">effects/</a>
  Effects that can be applied to characters (NPCs/Players)
<a href="input-events.md">input-events/</a>
  Input events are events that happen on the socket, this involves login and command interpreting.
  <strong>Warning:</strong> Because of input events important role it is generally not advised to load more than one
  bundle with input events
<a href="skills.md">skills/</a> <em>(Currently Unused)</em>
  Player skills
<a href="channels.md">channels.js</a>
  Communication channels
<a href="player-events.md">player-events.js</a>
  Basically everything the player does triggers an event on them that can be attached to and perform
  functionality such as experience, leveling, combat, and time based calculations
</pre>
