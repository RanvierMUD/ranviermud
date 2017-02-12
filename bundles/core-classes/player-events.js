'use strict';

module.exports = (srcPath) => {
  return  {
    listeners: {
      useSkill: state => function (skill, args) {
        skill.execute(args, this);
      },

      /**
       * Handle player leveling up
       * @param {number} amount Exp gained
       */
      level: state => function (amount) {
      }
    }
  };
};
