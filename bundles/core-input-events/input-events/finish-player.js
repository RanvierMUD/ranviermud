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

      args.account.addCharacter(args.name);
      args.account.save();

      const room = state.RoomManager.getRoom(state.Config.get('startingRoom'));
      player.room = room;
      player.save();

      // reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player });
    }
  };
};
