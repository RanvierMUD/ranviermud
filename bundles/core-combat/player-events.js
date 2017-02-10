'use strict';

const util = require('util');

/**
 * Auto combat module
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');

  return  {
    listeners: {
      updateTick: state => function () {
        // Check to see if the player has died since the last combat tick. If
        // we only did the check right when the player was damaged then you
        // could potentially wind up in a situation where the player performed
        // a mid-round attack that killed the target, then the next round the
        // target kills the player. So let's not let that happen.
        if (this.getAttribute('health') <= 0) {
          this.combatants.forEach(combatant => {
            this.removeCombatant(combatant);
            combatant.removeCombatant(this);
          }, this);

          const target = this.combatData.killedBy;
          if (target) {
            Broadcast.sayAt(this, `<bold><red>${target.name} killed you!</red></bold>`);
            target.emit('deathblow', this);
            this.emit('killed', target);
          } else {
            Broadcast.sayAt(this, `<bold><red>You died!</red></bold>`);
            this.emit('killed', this);
          }
          return;
        }

        if (!this.isInCombat()) {
          if (this.getAttribute('health') < this.getMaxAttribute('health')) {
            let regenEffect = state.EffectFactory.create('regen', this, {}, { magnitude: 15 });
            if (this.addEffect(regenEffect)) {
              regenEffect.activate();
            }
          }
          return;
        }

        // TODO: For now player/enemy speed is a fixed 2.5 seconds, base it off weapon speed later
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const playerSpeed = 1.5;
        const targetSpeed = 2;
        const playerDamage = rand(5, 20);
        const targetDamage = rand(5, 20);

        let hadActions = false;
        for (const target of this.combatants) {
          // player actions
          if (target.getAttribute('health') <= 0) {
            this.removeCombatant(target);
            target.removeCombatant(this);

            Broadcast.sayAt(this, `<bold>${target.name} is <red>Dead</red>!</bold>`);
            target.emit('killed', this);
            this.emit('deathblow', target);

            // TODO: For now respawn happens here, this is shitty
            const newNpc = state.MobFactory.clone(target);
            newNpc.hydrate(state);
            if (newNpc.room) {
              newNpc.room.removeNpc(newNpc);
            }
            target.room.addNpc(newNpc);
            target.emit('spawn');
            target.area.removeNpc(target);
            continue;
          }

          if (this.combatData.lag <= 0) {
            hadActions = true;
            const damage = Math.min(playerDamage, target.getAttribute('health'));

            target.emit('hit', this, damage);
            const startingHealth = target.getAttribute('health');
            target.lowerAttribute('health', damage);
            Broadcast.sayAt(this, `You strike <bold>${target.name}</bold> for <bold>${damage}</bold> damage`);

            this.combatData.lag = playerSpeed * 1000;
          } else {
            const elapsed = Date.now() - this.combatData.roundStarted;
            this.combatData.lag -= elapsed;
          }
          this.combatData.roundStarted = Date.now();

          // target actions
          if (target.combatData.lag <= 0) {
            hadActions = true;
            const damage = Math.min(targetDamage, this.getAttribute('health'));

            this.emit('hit', target, damage);

            const startingHealth = this.getAttribute('health');
            this.lowerAttribute('health', damage);

            Broadcast.sayAt(this, `<bold>${target.name}</bold> hit you for <bold><red>${damage}</red></bold> damage`);

            if (this.getAttribute('health') <= 0) {
              this.combatData.killedBy = target;
              break;
            }

            target.combatData.lag = targetSpeed * 1000;
          } else {
            const elapsed = Date.now() - target.combatData.roundStarted;
            target.combatData.lag -= elapsed;
          }
          target.combatData.roundStarted = Date.now();
        }

        if (!this.isInCombat()) {
          // reset combat data to remove any lag
          this.combatData = {};
        }

        if (hadActions) {
          Broadcast.sayAt(this, '');
          Broadcast.prompt(this);
          const percWidth = 50;

          if (!this.isInCombat()) {
            return;
          }

          // render health bars
          let currentPerc = Math.floor((this.getAttribute('health') / this.getMaxAttribute('health')) * 100);
          let progress = Broadcast.progress(percWidth, currentPerc, "green");
          let buf = `<bold>You</bold>: ${progress} <bold>${this.getAttribute('health')}/${this.getMaxAttribute('health')}</bold>`;
          Broadcast.sayAt(this, buf);

          for (const target of this.combatants) {
            let currentPerc = Math.floor((target.getAttribute('health') / target.getMaxAttribute('health')) * 100);
            let progress = Broadcast.progress(percWidth, currentPerc, "red");
            let buf = `<bold>${target.name}</bold>: ${progress} <bold>${target.getAttribute('health')}/${target.getMaxAttribute('health')}</bold>`;
            Broadcast.sayAt(this, buf);
          }

          Broadcast.sayAt(this, ''); // add a blank line after health prompts
        }
      },

      /**
       * Player was killed
       * @param {Character} target
       */
      killed: state => function (target) {
        Broadcast.sayAt(this, "Whoops, that sucked!");
        Broadcast.prompt(this);
      },

      /**
       * Player killed a target
       * @param {Character} target
       */
      deathblow: state => function (target) {
        this.emit('experience', LevelUtil.mobExp(target.level));
        Broadcast.prompt(this);
      }
    }
  };
};
