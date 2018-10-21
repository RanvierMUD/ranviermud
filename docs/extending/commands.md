Commands are the most essential player-facing functionality you can add to Ranvier and they can consist of a single function as a bare minimum. Each
command gets its own file within the `commands/` folder of the bundle. This guide will go over a couple examples of
commands that should give a decent overview of how you can access the game's state to do what you want inside your command.

[TOC]

## Creating a New Command

Commands in a bundle all go under the `commands/` folder in your bundle's directory. So in our case we're creating two
commands: `inventory`, and `remove` so our bundle will look like this:

```
bundles/my-commands/
  commands/
    inventory.js
    remove.js
```

The name of the file minus `.js` will be the command the user types so take that into consideration when naming the
file. Commands can have multiple aliases, as we will see, so you don't have to create multiple files for the same command.

## Command Structure

Similar to all bundle-loaded js files commands are files which export a configuration for the entity. This is the most
basic possible command file:

```javascript
'use strict';

module.exports = {
  /*
  `command` is a closure which takes in the GameState in `state` and returns a
  function which takes the arguments to the command and the player that executed
  the command. The 3rd parameter, `arg0`, is like argv[0] in many programming
  languages; it will be the full name of the alias the player used to execute
  the command. Example: Command 'shop' has an alias 'list'. If the player types 'lis',
  argv0 will be equal to 'list' so that the 'shop' command can check for it and
  react accordingly.
  */
  command: state => (args, player, arg0) => {
  }
};
```

## Example Commands

Both of these commands happen to interact with the player but take note that you have access to the entirety of the game's
state inside these commands. That includes all active players, all areas, rooms, NPCs, and items in the game, server
configuration as defined in `ranvier.json`, and more. See the `ranvier` executable's `GameState` variable for a list of
all the things you have access to. Further, the `ranvier-commands` default bundle which ships with Ranvier has many example
commands to work from.

### inventory

Inventory is one of the most used commands in most MUDs next to look. It lists out the items the player is carrying but
has not equipped. In this command we simply loop over all of the items in the player's inventory and output their name.

```javascript
'use strict';

// import Broadcast from core to send messages to the player
const { Broadcast } = require('ranvier');

module.exports = {
  // `usage` is shown when viewing the helpfile for a command, see the Helpfiles section for more detail
  usage: 'inventory',
  command : state => (args, player) => {
    if (!player.inventory || !player.inventory.size) {
      /*
      A note on using Broadcast:
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
```

### remove

The `remove` command unequips a piece of gear. This command will demonstrate taking arguments to your command and using
command aliases.

```javascript
'use strict';

const Ranvier = require('ranvier');
const Broadcast = Ranvier.Broadcast;
// For this command we need to import the CommandParser library to parse the argument to `remove`
const { CommandParser } = Ranvier.CommandParser;

module.exports = {
  // Aliases are straightforward, just an array of other strings the player can type to call this command
  aliases: [ 'unwield', 'unequip' ],
  usage: 'remove <item>',
  command : (state) => (arg, player) => {
    if (!arg.length) {
      return Broadcast.sayAt(player, 'Remove what?');
    }

    /*
    A note on the Parser:
    The method `parseDot` from the CommandParser lib takes a search string like "3.bracer"
    and a list of items to search through. In that example "3.bracer" would find the
    3rd item that matches the keyword "bracer".  The `true` argument here just tells
    `parseDot` to also return the key of the item it found within the list as
    Character equipment is keyed by the slot the item is worn (head, wrist, etc.),
    so we would end up with ['wrist', Bracer{}] as our results, if it were found.
    */
    const [slot, item] = CommandParser.parseDot(arg, player.equipment, true);

    if (!item) {
      return Broadcast.sayAt(player, "You aren't wearing anything like that.");
    }

    player.unequip(slot);

    Broadcast.sayAt(player, `Un-equipped: ${item.name}`);

    /*
    This is a perfect example of emitting events that your custom item scripts will
    listen for, as described in the Scripting section of the Areas documentation. In
    this instance, if the item's custom script is listening for the `unequip` event, it will be
    notified that the player just unequipped the item.
    */
    item.emit('unequip', player);
  }
};
```

## Creating Admin Commands

It is possible in Ranvier to create commands that are only useable by privileged players. This is done by use of the `requiredRole` property, which defaults to `PLAYER`. See `src/PlayerRoles.js` for a list of roles and their rank.

Here's an example of how you might build an admin command:

#### setadmin

```javascript
'use strict';

const Ranvier = require('ranvier');
const { Broadcast, PlayerRoles } = Ranvier;
const { CommandParser } = Ranvier.CommandParser;

module.exports = {
  /*
   Here is where we can set the required role level.
   If this were set to PlayerRoles.BUILDER, both ADMIN and BUILDERS could use it.
   Anyone can use PLAYER commands and if 'requiredRole' is not set,
   the command defaults to a PLAYER command.
   */
  requiredRole: PlayerRoles.ADMIN,
  command: (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return Broadcast.sayAt(player, 'setadmin <player>');
    }

    const target = CommandParser.parseDot(args, player.room.players);

    if (!target) {
      return Broadcast.sayAt(player, 'They are not here.');
    }

    if (target.role === PlayerRoles.ADMIN) {
      return Broadcast.sayAt(player, 'They are already an administrator.');
    }

    // The role is just a property of the player, which gets saved like any other.
    target.role = PlayerRoles.ADMIN;

    Broadcast.sayAt(target, `You have been made an administrator by ${this.name}.`);
    Broadcast.sayAt(player, `${target.name} is now an administrator.`);
  }
};
```

## Testing Your Commands

To test your command make sure the bundle the command is in is enabled in `ranvier.json`. The first time you add a new
command you'll have to restart the server. If you have the `debug-commands` bundle enabled then you can use the `hotfix`
command to reload the command from disk without having to restart the server, e.g., `hotfix mycommand` will load the new
code for `mycommand` into the game without you needing to restart.
