'use strict';

module.exports = {
  command: state => (args, player) => {
    state.CommandManager.get('help').execute('credits', player);
  }
};
