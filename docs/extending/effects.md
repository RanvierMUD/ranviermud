In this guide we'll implement a few simple effects to give an overview of the features and possibilities of effects.
We'll also demonstrate how to use the `EffectFactory` to create instances of effects, configure them, and apply them to
characters.

[TOC]

## What Can Effects Do?

The most simple example of effects would be attribute changes, like healing health over time, or increasing a character's
strength. However, effects in Ranvier are not simple buffs and debuffs; they receive all of the events the target
receives in addition to a special event called `updateTick`, which we'll go into detail about later.

Some examples of how effects can be combined with other aspects of the Ranvier engine with interesting results:

* A trapped chest that shoots a poison needle into the player character when opened, dealing 'poison' damage over time
  unless the player drinks an antidote.
* A weapon that causes the player to be healed for a percentage of damage dealt to foes.
* A multiplier to experience points when grouped with other players.
* Boots that make a warrior's Kick skill do 20% more damage.
* A silence effect, preventing the player from using certain channels or casting certain spells.
* Cause the player character to have prophetic dreams while sleeping.
* A confusion spell causing a character to `say` gibberish every 30 seconds and `move` in random directions.

You can be creative when using effects, since they are as fully scriptable as commands or events. In fact, as mentioned
above, you have access to all player commands and events via the effects system.

## What is an Effect, exactly?

In Ranvier an `Effect` is an object tied to a `Character` (a player or NPC) by way of the Character's `EffectList`. An Effect:

* has a duration (can potentially be permanent)
* can persist across log in/out
* Optionally runs some code when first activated
* Optionally runs some code when deactivated
* Optionally runs some code every "tick" (we'll describe `updateTick` later)
* Optionally modifies incoming and outgoing damage

We'll cover the configuration of functionality as we implement some demonstrative effects.

## Creating an Effect

Effects, similar to commands, are each stored in their own `.js` file. In the case of effects it is in the `effects/`
folder underneath your bundle directory. In our example we'll be implementing `buff`, `damageshield`, `regen`, and `rend`
effects, so our bundle folder would look like so:

```
bundles/my-effects/
  effects/
    buff.js
    damageshield.js
    regen.js
    rend.js
```

### File Structure

Similar to all bundle-loaded `.js` files the effect file will an object representing the definition of the effect. We'll
go over the definition of the effect in detail as we work through example effects. Below is the _bare minimum_ you need
for an effect:

```javascript
'use strict';

module.exports = {
  config: {
    name: 'My Effect',
  }
};
```

## Example Effects

These are brief overviews of different types of effects, there is more functionality not
on display here such as effect stacking and hidden effects so it's suggested that you read
over `src/Effect.js` to take full advantage.

### buff

This example buff will demonstrate a simple temporary attribute buff which increases the target's strength by an amount
configurable by whatever is instantiating this effect.

```javascript hl_lines="1 1"
bundles/my-effects/effects/buff.js
'use strict';

const { Broadcast, EffectFlag } = require('ranvier');

module.exports = {
  config: {
    // Name of effect shown when the player uses the `effects` command
    name: 'Buff Strength',
    description: "You feel stronger!",

    // Optional duration of this effect in milliseconds. Defaults to Infinity
    duration: 30 * 1000,

    /*
    Type is an optional config which is used in conjunction with the
    `unique` config option (defaults to true). If an effect is unique only one
    effect of that type may be active at once.
    */
    type: 'buff.strength',

    /**
     * This will configure the effect so that if another effect of the same
     * type is applied before the effect is finished it will receive a
     * "effectRefreshed" event to do with as it will.
     */
    refreshes: true,
  },

  /*
  Effect flags are completely optional and _arbitrary_ values that you can
  place in the `flags` array and then read later. By default flags are only
  used by the `ranvier-effects` bundle's `effects` command to color an active
  effect red or green. You can import flags from anywhere you want or simply
  hard code strings. The EffectFlag enum from src/ is just an _example_
  implementation.
  */
  flags: [EffectFlag.BUFF],

  /*
  State, like quest state, is where you keep track of the current state of the
  effect. This may include things like how many stacks of this effect there
  are, the magnitude of an effect, etc. In buff effect a magnitude of 5
  indicates that we want to increase the target's attribute by 5
  */
  state: {
    magnitude: 5
  },

  /*
  The modifiers property is where you implement formulas for changing
  character attributes as well as incoming/outgoing damage.
  */
  modifiers: {
    /*
    The attributes sub-property lets you define which attributes are modified
    by this effect.
    */
    attributes: {
      // For `buff` we just want to take the character's current strength and
      // increase it by this effect's `magnitude`
      strength: function (current) {
        return current + this.state.magnitude;
      }
    }
  },
  /*
  Alternatively, if the attribute you're modifying is dynamic you can use
  this pattern which is used when you want a base effect that could apply
  to multiple attributes.  See the `equip.js` effect for an example

  state: {
    stat: 'strength',
    bonus: 5
  },

  modifiers: {
    attributes: function (attribute, current) {
      if (attribute !== this.state.stat) {
        return current;
      }

      return current + this.state.bonus;
    }
  },
  */

  /*
  Similar to quests, effects receive all the events the player receives in
  addition to a few special events specific to events. The special events are:
    effectAdded: The effect has been added to the character's effect list but
      is not yet activated.
    effectActivated: The effect is activated for the character
    effectDeactivated: The effect is about to be removed from the effect list
  */
  listeners: {
    effectRefreshed: function (newEffect) {
      // For this buff if someone tries to refresh the effect then just restart
      // the duration timer
      this.startedAt = Date.now();
      Broadcast.sayAt(this.target, "You refresh the potion's magic.");
    },

    effectActivated: function () {
      // For buff we'll just send some text to the user
      Broadcast.sayAt(this.target, "Strength courses through your veins!");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "You feel weaker.");
    }
  }
};
```

### regen

This regen effect demonstrates a "ticking" effect, i.e., an effect which has some logic that runs every N seconds. This
implementation is used as the constant out-of-combat healing for the player

```javascript hl_lines="1 1"
bundles/my-effects/effects/regen.js
'use strict';

  // This effect is going to heal the player so need to use a Heal object for that
const { Broadcast, EffectFlag, Heal } = require('ranvier');

module.exports = {
  config: {
    name: 'Regenerate Health',
    description: "You are regenerating health over time.",
    type: 'regen.health',
    // tickInterval defines how many seconds between consecutive `updateTick` events
    // Note: This is _seconds_, not _milliseconds_ which is duration
    tickInterval: 3
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 10,
  },
  listeners: {
    effectedAdded: function () {
      // this is out-of-combat regen, remove this effect if they are in combat
      if (this.target.isInCombat()) {
        this.remove();
      }
    },

    /*
    `updateTick` is a special event that fires on all entities in the game every .5
    seconds. With the `tickInterval` config option above, however, it will only trigger
    this function every `ticketInterval` seconds.
    */
    updateTick: function () {
      const start = this.target.getAttribute('health');
      const max = this.target.getMaxAttribute('health');
      if (start >= max) {
        // once the character has reached max health remove the effect
        return this.remove();
      }

      // heal them for this effect's magnitude amount
      const heal = new Heal({
        attribute: "health",
        amount: this.state.magnitude,
        attacker: this.target,
        source: this,
        hidden: true,
      });
      heal.commit(this.target);
    },

    // this event is just a general Character event and is fired when a character enters combat
    combatStart: function () {
      this.remove();
    }
  }
};
```

### damageshield

The damageshield effect will demonstrate modifying incoming damage for the affected target. Damage shield will be an
effect which absorbs incoming damage of a certain type up to a certain amount and then disappear once either A) expired,
or B) depleted.

```javascript hl_lines="1 1"
bundles/my-effects/effects/damageshield.js
'use strict';

const { Broadcast, EffectFlag, Heal, Player } = require('ranvier');

module.exports = {
  config: {
    name: 'Damage Shield',
    description: "You are temporarily protected from damage!",
    type: 'shield',
  },
  flags: [EffectFlag.BUFF],
  state: {
    magnitude: 50,
    remaining: 50,
    type: "physical"
  },
  modifiers: {
    /*
    the incomingDamage modifier, and its sibling property outgoingDamage, let you do
    what it says on the tin. The function takes the Damage object (see `src/Damage.js`
    for more detail) and the current amount of damage about to be dealt.
    */
    incomingDamage: function (damage, currentAmount) {
      // In our shield effect we don't want to absorb heals and we don't want to absorb
      // damage to stats other than health
      if (damage instanceof Heal || damage.attribute !== 'health') {
        return currentAmount;
      }

      // Absorb incoming damage
      const absorbed = Math.min(this.state.remaining, currentAmount);
      this.state.remaining -= absorbed;
      currentAmount -= absorbed;

      Broadcast.sayAt(this.target, `Your damage shield absorbs <bold>${absorbed}</bold> damage!`);
      // the shield is depleted, remove the effect
      if (!this.state.remaining) {
        this.remove();
      }

      // return the remaining amount of damage
      return currentAmount;
    }
  },
  listeners: {
    effectActivated: function () {
      Broadcast.sayAt(this.target, `A shield of energy shield envelops you, protecting you from harm!`);

      if (this.target instanceof Player) {
        // this damageshield effect does something kind of cool, it adds an extra prompt
        // to the player's prompt lines showing the remaining shield amount as a
        // progress bar with the `addPrompt()` function
        this.target.addPrompt("damageshield", () => {
          const width = 60 - "Shield".length;
          const remaining = `<bold>${this.state.remaining}/${this.state.magnitude}</bold>`;
          return "<bold>Shield:</bold> " + Broadcast.progress(width, (this.state.remaining / this.state.magnitude) * 100, "cyan") + ` ${remaining}`;
        });
      }
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "The shield of energy around you dissipates.");
      if (this.target instanceof Player) {
        // remove the shield's remaining amount meter prompt
        this.target.removePrompt("damageshield");
      }
    }
  }
};
```

### rend

This rend effect is an example of a damage over time effect which could be used by a Rend skill. As
the "damage over time" name implies this type of effect does some damage over a set amount of time.
This example effect will also demonstrate stacking effects, which are effects that, when another
effect of the same type attempts to be applied, increments a stack counter and can run some code as
we'll see below.

```javascript hl_lines="1 1"
bundles/my-effects/effects/skill.rend.js
'use strict';

const { Broadcast, Damage, EffectFlag } = require('ranvier');

/**
 * Implementation effect for a Rend damage over time skill
 */
module.exports = {
  config: {
    name: 'Rend',
    duration: 15 * 1000,
    type: 'skill:rend',
    tickInterval: 3,

    // Sets the max number of stacks that can be added to this effect once active
    maxStacks: 3,
  },
  flags: [EffectFlag.DEBUFF],
  listeners: {
    // this is the event that gets fired when a new stack gets added. `newEffect` is
    // the effect that was attempted to be added, provided so you can do things like compound
    // damage or refresh the duration, etc.
    effectStackAdded: function (newEffect) {
      // add incoming rend's damage to the existing damage but don't extend duration
      this.state.totalDamage += newEffect.state.totalDamage;
    },

    effectActivated: function () {
      Broadcast.sayAt(this.target, "<bold><red>You've suffered a deep wound, it's bleeding profusely</red></bold>");
    },

    effectDeactivated: function () {
      Broadcast.sayAt(this.target, "Your wound has stopped bleeding.");
    },

    updateTick: function () {
      const amount = Math.round(this.state.totalDamage / Math.round((this.config.duration / 1000) / this.config.tickInterval));

      // as seen with Skills we'll create a new damage object and commit that damage to the target
      // of this effect
      const damage = new Damage({
        attribute: "health",
        amount,
        attacker: this.attacker,
        source: this
      });
      damage.commit(this.target);
    },

    // remove this rend effect when the target dies
    killed: function () {
      this.remove();
    }
  }
};
```

## Using Effects

Above we've implemented new effect types, now we'll actually use those effects during
gameplay.

For our buff effect we're going to create a simple skill called "enrage" that uses our
effect. More details on creating skills can be found in the [Skills](classes.md#skillsspells) section of
the guide.

```javascript
'use strict';

const { Broadcast, SkillType } = require('ranvier');

module.exports = {
  name: 'Enrage',
  type: SkillType.SKILL,
  resource: {
    attribute: 'energy',
    cost: 30
  },
  cooldown: 30

  run: state => function (args, player, target) {
    if (!player.isInCombat(target)) {
      return Broadcast.sayAt(player, "You're not fighting them at the moment.");
    }

    // To create an instance of an effect you use the EffectFactory
    const effect = state.EffectFactory.create(
      'buff', // specifying the effect type (name of the effect file minus .js)
      player, // the target the effect should apply to
      /*
      a config override, in this case set a duration of 15 seconds instead of the
      default 30
      */
      {
        duration: 15 * 1000
      },
      /*
      and a state override. In this example we'll override the default 5 strength
      increase to instead increase the player's strength by 10%
      */
      {
        magnitude: Math.floor(player.getAttribute('strength') / 10)
      }
    );
    // these are special properties of the effect used during combat
    effect.skill = this;
    effect.attacker = player;

    Broadcast.sayAt(player, `<red>You let out a gutteral roar and your vision goes red!</red>`);

    // Finally add the effect to the character. Our effect is autoActivated so we don't
    // have to worry about activating it manually
    player.addEffect(effect);
  },

  info: (player) => {
    return 'Temporarily increase your strength.';
  }
};
```

The same pattern is used for all effects we've implemented: Use `EffectFactory.create` to
create a new instance of the effect with any overrides you may want then call
`addEffect(yourEffect)` on the target character.

## Further Reading

Effects really are where the interesting pieces of the engine come together. You can see
some example implementation of more effects in the `ranvier-classes` bundle.
