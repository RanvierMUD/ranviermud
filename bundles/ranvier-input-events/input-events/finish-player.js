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
      let player = new Player({
        
        name: args.name,
        sex: args.sex,
        genitive_case: args.genitive_case,
        dative_case: args.dative_case,
        accusative_case: args.accusative_case,
        prepositional_case: args.prepositional_case,
        instrumental_case: args.instrumental_case,
        account: args.account,
        // TIP:DefaultAttributes: This is where you can change the default attributes for players
        attributes: {
          health: 100,
          strength: 20,
          agility: 20,
          intellect: 20,
          stamina: 20,
          armor: 0,
          critical: 0
        }
      });

      args.account.addCharacter(args.name);
      args.account.save();

      player.setMeta('class', args.playerClass);

      const room = state.RoomManager.startingRoom;
      player.room = room;
      player.save();

      // reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player });
    }
  };
};
