'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event: state => (socket, args) => {
      EventUtil.genSay(socket)('Creating character...');
      let player = new Player({
        name: args.name,
        account: args.account
      });
      player.socket = socket;

      args.account.addCharacter(args.name);
      args.account.save();

      // TODO: Don't do this, have a server config for player starting room
      let room = Array.from(state.RoomManager.rooms.values())[0];
      player.room = room;
      room.addPlayer(player);
      state.PlayerManager.addPlayer(player);

      // create the pfile then send them on their way
      player.save(() => {
        socket.emit('done', socket, { player });
      });
    }
  };
};
