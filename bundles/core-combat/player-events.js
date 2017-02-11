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
          return handleDeath(this);
        }

        if (!this.isInCombat()) {
          return startRegeneration(this);
        }

        // TODO: For now player/enemy speed is a fixed 2.5 seconds, base it off weapon speed later
        this.combatData.speed = 1.5;
        const targetSpeed = 2;

        let hadActions = false;
        for (const target of this.combatants) {
          target.combatData.speed = target.combatData.speed || targetSpeed;

          // player actions
          if (target.getAttribute('health') <= 0) {

            Broadcast.sayAt(this, `<bold>${target.name} is <red>Dead</red>!</bold>`);

            handleDeath(target, this);

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
            makeAttack(this, target);
          } else {
            const elapsed = Date.now() - this.combatData.roundStarted;
            this.combatData.lag -= elapsed;
          }

          this.combatData.roundStarted = Date.now();

          // target actions
          if (target.combatData.lag <= 0) {
            makeAttack(target, this);

            //TODO: Better way or timing of checking for death?
            if (this.getAttribute('health') <= 0) {
              this.combatData.killedBy = target;
              break;
            }

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

        // Show combat prompt and health bars.
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

        function makeAttack(attacker, defender) {
          const amount = state.RandomUtil.inRange(5, 20);
          hadActions = true;

          const damage = new Damage({
            attribute: "health",
            amount,
            attacker
          });
          damage.commit(defender);

          attacker.combatData.lag = attacker.combatData.speed * 1000;
        }

        function handleDeath(deadEntity, killer) {
          deadEntity.combatants.forEach(combatant => {
            deadEntity.removeCombatant(combatant);
            combatant.removeCombatant(deadEntity);
          }, deadEntity);

          if (Reflect.has(deadEntity, 'removePrompt')) {
            deadEntity.removePrompt('combat');
          }

          const target = killer || deadEntity.combatData.killedBy;
          
          if (target) {
            target.emit('deathblow', deadEntity);
            if (!target.isInCombat()) {
              startRegeneration(target);
            }
          }

          const deathMessage = target ? 
            `<bold><red>${target.name} killed you!</red></bold>` :
            `<bold><red>You died!</red></bold>`;

          if (Broadcast.isBroadcastable(deadEntity)) {
            Broadcast.sayAt(deadEntity, deathMessage);
          }

          deadEntity.emit('killed', target || deadEntity);
        }

        // Make characters regenerate health while out of combat
        function startRegeneration(entity) {
          if (entity.getAttribute('health') < entity.getMaxAttribute('health')) {
            let regenEffect = state.EffectFactory.create('regen', entity, { hidden: true }, { magnitude: 15 });
            if (entity.addEffect(regenEffect)) {
              regenEffect.activate();
            }
          }
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
          buf = `Your <bold>${damage.source.name}</bold> hit`;
        } else {
          buf = "You hit";
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
          buf = `Your <bold>${heal.source.name}</bold> healed`;
        } else {
          buf = "You heal";
        }

        buf += '<bold> ' + (target === this ? 'You' : `${target.name}`);
        buf += ` <bold><green>${heal.finalAmount}</green></bold> ${heal.attribute}`;
        Broadcast.sayAt(this, buf);
      },

      damaged: state => function (damage) {
        if (damage.hidden || damage.attribute !== 'health') {
          return;
        }

        let buf = '';
        if (damage.attacker) {
          buf = `<bold>${damage.attacker.name}</bold>`;
        }

        if (damage.source) {
          buf += (damage.attacker ? "'s " : "") + `<bold>${damage.source.name}</bold>`;
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
