Bundles are the way you modify Ranvier's functionality without having to touch the core code. They let you modify
basically everything about the game: how commands are interpreted, commands themselves, channels, items, rooms, NPCs,
quests, login flow, and spell effects.

[TOC]

## Default Bundles

Ranvier comes with a set of bundles that provide a base level amount of functionality expected in most Diku-style MUDs.
These bundles are _example_ implementations. They are absolutely stable enough to act as a base for your game but if you
wish to write your game from scratch using only the core engine it's entirely possible to disable all of these bundles
with no harm whatsoever.

* `ranvier-areas` - Small example area demonstrating diku-style rooms, NPCs,
  items, and quests.
* `ranvier-channels` - Set of example channels: say, tell, yell, and chat
* `ranvier-classes` - A basic example of classes, skills (active and passive), and spells
* `ranvier-combat` - Basic diku style real-time auto combat
* `ranvier-commands` - Set of basic diku style commands: movement, look, get, drop, wear, who, etc.
* `ranvier-effects` - Set of example spell effects
* `ranvier-groups` - Example implementation of player groups
* `ranvier-input-events` - Diku-style implementation of login flow with accounts
  and Diku-style command interpretation
    * **Warning:** Disabling this bundle is ill-advised unless you have studied
      well the [Input Events](input_events.md) documentation
* `ranvier-lib` - Not actually loaded into the game, just a place to put common ranvier bundle functionality
* `ranvier-player-events` - Example implementation of experience/leveling for the player
* `ranvier-quests` - Example implementation of quest commands
* `ranvier-telnet` - Makes Ranvier use a telnet server for player connections (enabled by default)
* `ranvier-vendors` - Example implementation of in game shops
* `ranvier-websocket` - WebSocket server to be used instead of/along side telnet (off by default)
* `ranvier-npc-behaviors` - Ready-to-use standalone behaviors for NPCs: wandering, aggro, etc.
* `debug-commands` - Commands useful while debugging (`givexp` for example), commands only usable by ADMIN role players

> Note: If you want to modify one of the Ranvier bundles it's recommended that you disable the bundle you wish to
> modify, copy it to your own bundle, rename it, and modify that. This way you can safely pull in updates without
> worrying about conflicts.

## Enabling &amp; Disabling Bundles

To enable or disable a bundle simply add/remove the bundle name from `bundles` in the `ranvier.json` config. You can see
an overview of that file in the [Server Config](../server_config.md) section.

## Creating a Bundle

Each individual bundle is a standalone modification to the game, think of them like a Skyrim mod. A mod could add a
single item or it could completely transform the game. Unlike Skyrim mods load order does not matter.

To create a new bundle simply create a new directory underneath `bundles/`. Inside your bundle directory you may have
any or all of the folders/files below.

### What's in a Bundle

A bundle can contain any or all of the following children though it's suggested that you keep your bundles as modular as
possible. Click on any of the items below to see an in-depth tutorial.

<pre>
<a href="../areas/">areas/</a>
  Areas contain items, rooms, NPCs, and quests.
<a href="../areas/scripting#behaviors">behaviors/</a>
  Behaviors are scripts that are shared between entities of the same type (rooms, items, NPCs)
<a href="../classes/">classes/</a>
  Player classes
<a href="../commands/">commands/</a>
  What it says on the tin, commands to add to the game
<a href="../effects/">effects/</a>
  Effects that can be applied to characters (NPCs/Players)
<a href="../help/">help/</a>
  Helpfiles
<a href="../events/">input-events/</a>
  Input events are events that happen on the socket, this involves login and command interpreting.
  <strong>Warning:</strong> Because of input events' important role it is generally not advised to load more than one
  bundle with input events
<a href="../classes#skillsspells">skills/</a>
  Player skills (Spells are just skills with the SPELL type)
<a href="../channels/">channels.js</a>
  Communication channels
<a href="../events/">player-events.js</a>
  Basically everything the player does triggers an event on them that can be attached to and perform
  functionality such as experience, leveling, combat, and time based calculations
</pre>

### 3rd party node libraries in bundles

Bundles are meant to be self-contained, shareable folders. With that in mind if your bundle relies on a node module
not present the `package.json` that comes with Ranvier the suggested approach is the following:

1. Create your bundle folder: `mkdir my-bundle` and move into it: `cd my-bundle`
2. Run `npm init` and fill out the appropriate fields
3. Now you can safely run `npm install --save some-3rd-party-package` and that dependency will be specific to your
   bundle.

Ranvier has a helper command to run `npm install` in all bundles by running `npm run bundle-install` from the root of
the project.
