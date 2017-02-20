Commands are the most simple functionality you can add to Ranvier and accordingly they're very simple to create. Each
command gets its own file within the `commands/` folder of the bundle. This guide will go over a couple examples of
commands that should give a decent overview of how you can access the game's state to do what you want inside your command.

[TOC]

## Creating a New Command

Commands in a bundle all go under the `commands/` folder in your bundle directory. So in our case we're creating two
commands: `inventory`, and `who` so our bundle will look like this:

```
bundles/my-commands/
  commands/
    inventory.js
    who.js
```

The name of the file minus `.js` will be the command the user types so take that into consideration when naming the
file. Commands can have multiple aliases as we will see so you don't have to create multiple files for the same command.

## Command Structure

Similar to all bundle-loaded js files commands are files which export a function which accepts the path to the `src/`
directory so you can easily import core libraries, and which returns a closure. This is the most basic possible
command file:

```javascript
'use strict';

module.exports = (srcPath) => {
  return {
    /*
    `command` is a closure which takes in the GameState in `state` and returns a
    function which takes the arguments to the command and the player that executed
    the command.
     */
    command: state => (args, player) => {
    }
  };
};
```

## Example Commands

Both of  commands happen to interact with the player but take note that you have access to the entirety of the game's
state inside these commands. That includes all active players, all areas, rooms, NPCs, and items in the game, server
configuration as defined in `ranvier.json` and more. See the `ranvier` executable's `GameState` variable for a list of
all the things you have access to. Further, the `core-commands` default bundle which ships with Ranvier has many example
commands to work from.

### inventory

Inventory is one of the most used commands in most MUDs next to look. It lists out the items the player is carrying but
has not equipped. In this command we simply loop over all of the items in the player's inventory and output their name.

```javascript
'use strict';

module.exports = (srcPath) => {
  // Import the `Broadcast` library to output to the player
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    // `usage` is shown when viewing the help a command, see the Helpfiles section for more detail
    usage: 'inventory',
    command : state => (args, player) => {
      if (!player.inventory || !player.inventory.size) {
        /*
        `sayAt` sends a message to the player with a newline afterwards. If you need to
        concatenate multiple strings together before breaking to the next line you can
        simply use `at()` as long as you remember to end the line with a newline using
        `sayAt()`. It's recommended to use `sayAt` instead of just manually appending
        "\r\n" as it makes the code a lot cleaner to read.
        */
        return Broadcast.sayAt(player, "You aren't carrying anything.");
      }

      Broadcast.sayAt(player, "You are carrying:");

      for (const [, item ] of player.inventory) {
        Broadcast.sayAt(player, item.name);
      }
    }
  };
};
```

### remove

The `remove` command unequips a piece of gear. This command will demonstrate taking arguments to your command and using
command aliases.

```javascript
'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  // For this command we need to import the CommandParser library to parse the argument to `remove`
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    // Aliases are straightforward, just an array of other strings the player can type to call this command
    aliases: [ 'unwield', 'unequip' ],
    usage: 'remove <item>',
    command : (state) => (arg, player) => {
      if (!arg.length) {
        return Broadcast.sayAt(player, 'Remove what?');
      }

      /*
      `parseDot` from the CommandParser lib tags in a search string like "3.bracer" and
      a list of items to search through. In that example "3.bracer" would find the 3rd
      item that matches the keyword "bracer".  The `true` argument here just tells
      `parseDot` to also return the key of the item it found within the list as
      Character equipment is keyed by the slot the item is worn (head, wrist, etc.)
      */
      const [slot, item] = Parser.parseDot(arg, player.equipment, true);

      if (!item) {
        return Broadcast.sayAt(player, "You aren't wearing anything like that.");
      }

      player.unequip(slot);

      Broadcast.sayAt(player, `Un-equipped: ${item.name}`);

      /*
      This is a perfect example of emitting events that your custom item scripts will
      listen for as described in the Scripting section of the Areas documentation. In
      this instance if the item's script is listening for the `equip` event it will be
      notified that the player just equipped the item
      */
      item.emit('equip', player);
    }
  };
};
```
