'use strict';

const util = require('util');
const leftPad = require('left-pad');

/**
 * Auto combat module
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');
  const Damage = require(srcPath + 'Damage');

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

          this.removePrompt('combat');
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
          // Make player regenerate health while out of combat
          if (this.getAttribute('health') < this.getMaxAttribute('health')) {
            let regenEffect = state.EffectFactory.create('regen', this, { hidden: true }, { magnitude: 15 });
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
            const damage = new Damage({
              attribute: "health",
              amount: playerDamage,
              attacker: this
            });
            damage.commit(target);

            this.combatData.lag = playerSpeed * 1000;
          } else {
            const elapsed = Date.now() - this.combatData.roundStarted;
            this.combatData.lag -= elapsed;
          }
          this.combatData.roundStarted = Date.now();

          // target actions
          if (target.combatData.lag <= 0) {
            hadActions = true;
            const damage = new Damage({
              attribute: "health",
              amount: targetDamage,
              attacker: target
            });
            damage.commit(this);
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
          this.removePrompt('combat');
        }

        if (hadActions) {
          if (this.isInCombat()) {
            this.addPrompt('combat', () => {
              if (!this.isInCombat()) {
                return '';
              }
              // player health bar
              const playerName = "You";
              const targetNameLengths = [...this.combatants].map(t => t.name.length);
              const nameWidth = Math.max(playerName.length, ...targetNameLengths);
              const progWidth = 60 - nameWidth;
              let currentPerc = Math.floor((this.getAttribute('health') / this.getMaxAttribute('health')) * 100);
              let progress = Broadcast.progress(progWidth, currentPerc, "green");
              let buf = `<bold>${leftPad(playerName, nameWidth)}</bold>: ${progress} <bold>${this.getAttribute('health')}/${this.getMaxAttribute('health')}</bold>`;

              // target health bar
              for (const target of this.combatants) {
                let currentPerc = Math.floor((target.getAttribute('health') / target.getMaxAttribute('health')) * 100);
                let progress = Broadcast.progress(progWidth, currentPerc, "red");
                buf += `\r\n<bold>${leftPad(target.name, nameWidth)}</bold>: ${progress} <bold>${target.getAttribute('health')}/${target.getMaxAttribute('health')}</bold>`;
              }

              return buf;
            });
          }

          Broadcast.sayAt(this, '');
          Broadcast.prompt(this);
        }
      },

      /**
       * When the player hits a target
       * @param {Damage} damage
       * @param {Character} target
       */
      hit: state => function (damage, target) {
        if (damage.hidden) {
          return;
        }

        let buf = '';
        if (damage.source) {
          buf = `Your <bold>${damage.source.name}</bold> hit`
        } else {
          buf = "You hit"
        }

        buf += ` <bold>${target.name}</bold> for <bold>${damage.finalAmount}</bold> damage.`;
        Broadcast.sayAt(this, buf);
      },

      /**
       * @param {Heal} heal
       * @param {Character} target
       */
      heal: state => function (heal, target) {
        if (heal.hidden) {
          return;
        }

        let buf = '';
        if (heal.source) {
          buf = `Your <bold>${heal.source.name}</bold> healed`
        } else {
          buf = "You heal"
        }

        buf += ` <bold>${target.name}</bold> for <bold><green>${heal.finalAmount}</green></bold> points`;
        Broadcast.sayAt(this, buf);
      },

      damaged: state => function (damage) {
        if (damage.hidden) {
          return;
        }

        let buf = '';
        if (damage.attacker) {
          buf = `<bold>${damage.attacker.name}</bold>`;
        }

        if (damage.source) {
          buf += (damage.attacker ? "'s " : "") + `<bold>${damage.source.name}</bold>`
        } else if (!damage.attacker) {
          buf += "Something";
        }

        buf += ` hit <bold>You</bold> for <bold><red>${damage.finalAmount}</red></bold> damage`;
        Broadcast.sayAt(this, buf);
      },

      /**
       * Player was killed
       * @param {Character} killer
       */
      killed: state => function (killer) {
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
