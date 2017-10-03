'use strict';

module.exports = (srcPath) => {
  return  {
    listeners: {
      updateTick: state => function () {
        // example of sending player data to a websocket client. This data is not sent to the default telnet socket
        let attributes = {};
        for (const [name, attribute] of this.attributes) {
          attributes[name] = {
            current: this.getAttribute(name),
            max: this.getMaxAttribute(name),
          };
        }

        const data = {
          attributes,
          level: this.level,
          name: this.name,
          area: this.room && this.room.area.title,
          targets: [...this.combatants].map(target => ({
              name: target.name,
              health: {
                current: target.getAttribute('health'),
                max: target.getMaxAttribute('health'),
              },
          })),
          effects: this.effects.entries().filter(effect => !effect.config.hidden).map(effect => effect.serialize()),
          quests: this.questTracker.serialize().active,
        };

        this.socket.command('sendData', data);
      },
    }
  };
};
