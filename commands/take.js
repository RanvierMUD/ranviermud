exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    // Syntax: take [item] from [container] (from is optional)

    // When finding container/item:
    // - Look in room's containers first (looting!)
    // - Then look in worn containers.

    // When deciding where item goes:
    // - If taken from worn container:
    // - - Hold in hand if hand is free.
    // - - Warn player otherwise.
    // - - ?
    //TODO: Have drop command search containers for items to drop?

    // - If taken from room's container...
    // - - Hold in hand if hand is free.
    // - - Put in a worn/held container if one is free.
    // - - Warn player otherwise. 


  };
