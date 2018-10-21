
'use strict';

module.exports = () => {
  const Ranvier = require('ranvier');
  const Broadcast = Ranvier.Broadcast;

  return  {
    listeners: {
      playerEnter: state => function (player) {
        if (this.hasEffectType('speaking')) {
          return;
        }

        const speak = state.EffectFactory.create('speak', this, {}, {
          messageList: [
            "Welcome, %player%. The combat training area lies to the east.",
            "To the west lies Wally's shop where you can stock up on potions.",
          ],
          outputFn: message => {
            message = message.replace(/%player%/, player.name);
            state.ChannelManager.get('say').send(state, this, message);
          }
        });
        this.addEffect(speak);
      },

      playerLeave: state => function (player) {
        const speaking = this.effects.getByType('speaking');
        if (speaking) {
          speaking.remove();
        }
      }
    }
  };
};
