'use strict';

/**
 * See warrior.js for more on classes.
 */
module.exports = srcPath => {
  return {
    name: 'Mage',
    description: 'Mages spend years learning to harness arcane forces to impose their will on the world around them. As scholars, they tend to be less brawny than Warriors and less stout than Clerics. Their magical abilities  ',
    abilityTable: {
      5: { spells: ['fireball'] },
    }
  };
};