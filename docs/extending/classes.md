[TOC]

## Player Classes

Player Classes in Ranvier is an intentionally loose concept. Classes are basically just a JavaScript file which returns
a class configuration object that gets set on the Player. Any functionality of what classes do or how they modify player's interactions
is completely ignored by the engine. The default bundles do have an _example_ implementation that you can use to go
off of but it's entirely up to you if you want to use player classes at all. With that said let's take a quick look at how
the default bundle `ranvier-classes` implements a player class.

```
bundles/ranvier-classes/
  classes/
    warrior.js
```

```javascript
'use strict';

module.exports = srcPath => {
  return {
    // Display name for the class, used by the default `score` command.
    name: 'Warrior',
    // Description of the class rendered on the character creation screen (see default input events)
    description: 'Warriors relish being face-to-face with their enemy. Whether it be wielding axes, maces, swords, or a nearby log, Warriors focus on dealing strong physical damage to their opponent. What they lack in the raw magical damage of a Mage, or the healing prowess of a Cleric, Warriors make up for in their tenacity. Those choosing the more defensive path of the shield can outlast otherwise deadly attacks.',
    // This "abilityTable" is used in `ranvier-classes/` to assign skills on levelup and when a skill is used to check
    // if the player actually has access to it
    abilityTable: {
      3: { skills: ['rend'] },
      5: { skills: ['lunge'] },
      7: { skills: ['shieldblock'] },
     10: { skills: ['secondwind'] },
    }
  };
};
```

That's it, by default there is not much to making a class. Do what you want with them, get creative. Make a classless MUD or make
sub-classes, it's all up to you.

## Skills/Spells

Skills and Spells both are defined as Skills (see `src/Skill.js`). Spells are just skills with a different `type`. In this guide
we'll implement 1 active skill and 1 passive skill to see a demo. You can see more complex examples abilities including
heals, DoTs (damage over time), and defensive abilities in the `ranvier-classes` bundle.

Skills are defined in the `skills/` folder of a bundle:

### Active Skill: lunge

This is a simple damage skill that will deal 250% of the player's weapon damage.

```
bundles/my-bundle/
  skills/
    lunge.js
```

```javascript
'use strict';

/**
 * Basic warrior attack
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  // This skill will deal damage so we'll need to use the Damage class
  const Damage = require(srcPath + 'Damage');
  // Import our list of skill types
  const SkillType = require(srcPath + 'SkillType');

  // It's handy to define the different "tuning knobs" of skills right near the top all in one place so you can easily
  // change them if you need to.
  const damagePercent = 250;
  const energyCost = 20;

  return {
    // Friendly name of the skill, shown to the player on the skill list command.
    name: 'Lunge',
    // The type defines which of the ability managers you can find it in.
    // Either in state.SkillManager or state.SpellManager, respectively.
    type: SkillType.SKILL,

    // If requiresTarget is true, the skill usage will fail if the player doesn't specify a target,
    // unless you also add the `targetSelf: true` option, in which case if the player
    // doesn't specify a target it will target themselves (for example, a healing spell).
    requiresTarget: true,

    // If initiatesCombat is true, using the skill against a target will make the player
    // enter combat against them.
    initiatesCombat: true,

    // The resource config defines the resource cost of the skill on use and is optional.
    resource: {
      // attribute to deduct the cost from
      attribute: 'energy',
      // amount to deduct
      cost: energyCost,
    },

    /* Note on Resource Costs:
      Ranvier also supports multiple resource costs. In this case, the value of resource would be an array of objects with the 'attribute' and 'cost' properties, as seen above.
    */

    // Cooldown is the number of seconds the player must wait before using this skill again
    cooldown: 6,

    /*
    The run method is where all the magic of skills happen and has a very similar layout to a
    command. A closure accepting GameState in 'state' and returning a function which,
    in this case takes the arguments to the skill, the player that executed the skill
    and the target of the skill
    */
    run: state => function (args, player, target) {
      // This is a simple damage skill so we'll create a new damage instance
      const damage = new Damage({
        // we'll damage the health of the target
        attribute: 'health',
        // for 250% of the player's weapon damage
        amount: player.calculateWeaponDamage() * (damagePercent / 100),
        attacker: player,
        type: 'physical',
        // Setting damage 'source' property to 'this' will show the skill that caused the
        // damage to the target
        source: this
      });

      // Show some flashy effects to the player, target, and the other players in the room
      Broadcast.sayAt(player, '<red>You shift your feet and let loose a mighty attack!</red>');
      Broadcast.sayAtExcept(player.room, `<red>${player.name} lets loose a lunging attack on ${target.name}!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} lunges at you with a fierce attack!</red>`);
      }

      // apply the damage to the target
      damage.commit(target);
    },

    // the info function is used in `ranvier-classes/commands/skill.js` to show details
    // about an ability to the player
    info: (player) => {
      return `Make a strong attack against your target dealing <bold>${damagePercent}%</bold> weapon damage.`;
    }
  };
};
```

### Passive Skill: Second Wind

This will be an example implementation of a "passive" skill: one that is always working in the background that the
player doesn't type a command to use. The second wind passive ability is quite interesting: Once every 2 minutes, if the
player's energy drops below 30% it will restore 50% of their max. To do this we'll need to create two parts: first, the
skill file, and second the effect that will be applied to the player.

```
bundles/my-bundle/
  skills/
    secondwind.js
  effects/
    skill.secondwind.js
```

#### Skill file

```javascript
'use strict';

/**
 * Basic warrior passive
 */
module.exports = (srcPath) => {
  const SkillType = require(srcPath + 'SkillType');
  // Import SkillFlag so we can define this skill as passive
  const SkillFlag = require(srcPath + 'SkillFlag');

  // Again, tuning knobs are at the top to make changing them easier
  const interval = 2 * 60;
  const threshold = 30;
  const restorePercent = 50;

  return {
    name: 'Second Wind',
    type: SkillType.SKILL,
    // This 'flags' key is the first important part, we want to mark our skill as passive
    flags: [SkillFlag.PASSIVE],

    // 'effect' is the second most important, here we tell the skill what effect to apply
    // to the player
    effect: "skill.secondwind",

    // This is a passive skill but you can still configure its cooldown and manually
    // force the skill to enter a cooldown as we'll see when we build the effect
    cooldown: interval,

    // configureEffect allows the skill to modify the effect before it's applied to the
    // player
    configureEffect: effect => {
      // in this case we're customizing the default threshold and restorePercent of
      // the 'skill.secondwind' effect that we will build later
      effect.state = Object.assign(effect.state, {
        threshold,
        restorePercent,
      });

      return effect;
    },

    info: function (player) {
      return `Once every ${interval / 60} minutes, when dropping below ${threshold} energy, restore ${restorePercent}% of your max energy.`;
    }
  };
};
```

#### Effect file

This will be a brief refresher on effects. See the [Effect](extending/effects.md) for more detail.

```javascript
'use strict';

/**
 * Implementation effect for second wind skill
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  // Import the heal so we can restore energy
  const Heal = require(srcPath + 'Heal');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Second Wind',
      type: 'skill:secondwind'
    },
    flags: [Flag.BUFF],
    listeners: {
      // we want to listen for any type the player takes damage to one of their attributes
      damaged: function (damage) {
        // ignore any damage that isn't to energy
        if (damage.attribute !== 'energy') {
          return;
        }

        // manually check our cooldown
        if (this.skill.onCooldown(this.target)) {
          return;
        }

        // don't do anything if they have more than 30% of their max energy. Note that
        // 'threshold' was configured by the skill's configureEffect function
        if ((this.target.getAttribute('energy') / this.target.getMaxAttribute('energy')) * 100 > this.state.threshold) {
          return;
        }

        Broadcast.sayAt(this.target, "<bold><yellow>You catch a second wind!</bold></yellow>");
        // create the Heal to heal the player's energy
        const heal = new Heal({
          amount: Math.floor(this.target.getMaxAttribute('energy') * (this.state.restorePercent / 100)),
          attacker: this.target,
          attribute: 'energy',
          source: this.skill
        });
        heal.commit(this.target);

        // manually start the cooldown of the skill
        this.skill.cooldown(this.target);
      }
    }
  };
};
```
