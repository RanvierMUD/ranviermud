'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');

  return  {
    listeners: {
      /**
       * Handle player gaining experience/leveling up
       * @param {number} amount Exp gained
       */
      experience: state => function (amount) {
        Broadcast.sayAt(this, `<blue>You gained <bold>${amount}</bold> experience!</blue>`);

        const totalTnl = LevelUtil.expToLevel(this.level + 1);

        // level up, currently wraps experience if they gain more than needed for multiple levels
        if (this.experience + amount > totalTnl) {
          Broadcast.sayAt(this, '                                   <bold><blue>!Level Up!</blue></bold>                                   ');
          Broadcast.sayAt(this, '[<bold><blue>' + (new Array(77).join('#')) + '|]</blue></bold>');

          let nextTnl = totalTnl;
          while (this.experience + amount > nextTnl) {
            amount = (this.experience + amount) - nextTnl;
            this.experience = amount;
            this.level++;
            nextTnl = LevelUtil.expToLevel(this.level + 1);
            Broadcast.sayAt(this, `<blue>You are now level <bold>${this.level}</bold>!</blue>`);
          }
        } else {
          this.experience += amount;
        }

        this.save();

        // show tnl bar
        state.CommandManager.get('tnl').execute('', this);
      }
    }
  };
};
