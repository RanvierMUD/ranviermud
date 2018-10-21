'use strict';

const { Broadcast } = require('ranvier');

module.exports = {
  listeners: {
    playerEnter: state => function (player) {
      Broadcast.sayAt(player);
      Broadcast.sayAt(player, `<b><cyan>Hint: You can pick up items from the room listed in '<white>look</white>' with '<white>get</white>' followed by a reasonable keyword for the item e.g., '<white>get cheese</white>'. Some items, like the chest, may contain items; you can check by looking at the item.</cyan></b>`, 80);
    }
  }
};
