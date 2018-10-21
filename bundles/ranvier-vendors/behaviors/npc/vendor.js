'use strict';


module.exports = () => {
  const Ranvier = require('ranvier');
  const Logger = Ranvier.Logger;
  const B      = Ranvier.Broadcast;
  return  {
    listeners: {
      playerEnter: state => function (config, player) {
        if (config.enterMessage) {
          B.sayAt(player, '');
          state.ChannelManager.get('say').send(state, this, config.enterMessage);
        }
      },

      playerLeave: state => function (config, player) {
        if (config.leaveMessage) {
          state.ChannelManager.get('say').send(state, this, config.leaveMessage);
        }
      },

      playerDropItem: state => function(player, item) {
        Logger.log(`${this.name} noticed ${player.name} dropped ${item.name}`);
      },
    }
  };
};
