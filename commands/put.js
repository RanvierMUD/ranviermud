exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {

    // syntax: put [item] in [container] or put [item] [container]
    //TODO: Change get to auto-put or auto-hold...

    // When finding item to put in container:
    // - Look at held items first.
    // - Then look in the room at large.

    // When finding container:
    // - Look at worn containers first (inventory)
    // - Then nested containers
    // - Finally, look in room


  };
