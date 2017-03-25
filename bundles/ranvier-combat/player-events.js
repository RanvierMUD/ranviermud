'use strict';
const leftPad = require('left-pad');

/**
 * Auto combat module
 */
module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const LevelUtil = require(srcPath + 'LevelUtil');
  const Damage = require(srcPath + 'Damage');
  const Logger = require(srcPath + 'Logger');

  return  {
    listeners: {
      updateTick: state => function () {
        startRegeneration(state, this);

        // Check to see if the player has died since the last combat tick. If
        // we only did the check right when the player was damaged then you
        // could potentially wind up in a situation where the player performed
        // a mid-round attack that killed the target, then the next round the
        // target kills the player. So let's not let that happen.
        if (this.getAttribute('health') <= 0) {
          return handleDeath(state, this);
        }

        if (!this.isInCombat()) {
          return;
        }

        this.combatData.speed = this.getWeaponSpeed();

        let hadActions = false;
        for (const target of this.combatants) {
          target.combatData.speed = target.getWeaponSpeed();

          // player actions
          if (target.getAttribute('health') <= 0) {

            B.sayAt(this, `<b>${target.name} is <red>Dead</red>!</b>`);

            handleDeath(state, target, this);
            if (target.isNpc) {
              target.room.area.removeNpc(target);
            }
            continue;
          }

          if (this.combatData.lag <= 0) {
            hadActions = true;
            makeAttack(this, target);
          } else {
            const elapsed = Date.now() - this.combatData.roundStarted;
            this.combatData.lag -= elapsed;
          }

          this.combatData.roundStarted = Date.now();

          // target actions
          if (target.combatData.lag <= 0) {
            if (this.getAttribute('health') <= 0) {
              this.combatData.killedBy = target;
              break;
            }

            hadActions = true;
            makeAttack(target, this);
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
            const combatPromptBuilder = promptee => {
              if (!promptee.isInCombat()) {
                return '';
              }

              // Set up some constants for formatting the health bars
              const playerName = "You";
              const targetNameLengths = [...promptee.combatants].map(t => t.name.length);
              const nameWidth = Math.max(playerName.length, ...targetNameLengths);
              const progWidth = 60 - (nameWidth + ':  ').length;

              // Set up helper functions for health-bar-building.
              const getHealthPercentage = entity => Math.floor((entity.getAttribute('health') / entity.getMaxAttribute('health')) * 100);
              const formatProgressBar = (name, progress, entity) => {
                const pad = B.line(nameWidth - name.length, ' ');
                return `<b>${name}${pad}</b>: ${progress} <b>${entity.getAttribute('health')}/${entity.getMaxAttribute('health')}</b>`;
              }

              // Build player health bar.
              let currentPerc = getHealthPercentage(promptee);
              let progress = B.progress(progWidth, currentPerc, "green");
              let buf = formatProgressBar(playerName, progress, promptee);

              // Build and add target health bars.
              for (const target of promptee.combatants) {
                let currentPerc = Math.floor((target.getAttribute('health') / target.getMaxAttribute('health')) * 100);
                let progress = B.progress(progWidth, currentPerc, "red");
                buf += `\r\n${formatProgressBar(target.name, progress, target)}`;
              }

              return buf;
            };

            this.addPrompt('combat', () => combatPromptBuilder(this));
            for (const target of this.combatants) {
              if (!target.isNpc && target.isInCombat()) {
                target.addPrompt('combat', () => combatPromptBuilder(target));
                B.sayAt(target, '');
                B.prompt(target);
              }
            }
          }

          B.sayAt(this, '');
          B.prompt(this);
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
          buf = `Your <b>${damage.source.name}</b> hit`;
        } else {
          buf = "You hit";
        }

        buf += ` <b>${target.name}</b> for <b>${damage.finalAmount}</b> damage.`;
        B.sayAt(this, buf);

        if (this.equipment.has('wield')) {
          this.equipment.get('wield').emit('hit', damage, target);
        }

        // show damage to party members
        if (!this.party) {
          return;
        }

        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = '';
          if (damage.source) {
            buf = `${this.name} <b>${damage.source.name}</b> hit`;
          } else {
            buf = `${this.name} hit`;
          }

          buf += ` <b>${target.name}</b> for <b>${damage.finalAmount}</b> damage.`;
          B.sayAt(member, buf);
        }
      },

      /**
       * @param {Heal} heal
       * @param {Character} target
       */
      heal: state => function (heal, target) {
        if (heal.hidden) {
          return;
        }

        if (target !== this) {
          let buf = '';
          if (heal.source) {
            buf = `Your <b>${heal.source.name}</b> healed`;
          } else {
            buf = "You heal";
          }

          buf += `<b> ${target.name}</b> for <b><green>${heal.finalAmount}</green></b> ${heal.attribute}.`;
          B.sayAt(this, buf);
        }

        // show heals to party members
        if (!this.party) {
          return;
        }

        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = '';
          if (heal.source) {
            buf = `${this.name} <b>${heal.source.name}</b> healed`;
          } else {
            buf = `${this.name} healed`;
          }

          buf += ` <b>${target.name}</b>`;
          buf += ` for <b><green>${heal.finalAmount}</green></b> ${heal.attribute}.`;
          B.sayAt(member, buf);
        }
      },

      damaged: state => function (damage) {
        if (damage.hidden || damage.attribute !== 'health') {
          return;
        }

        let buf = '';
        if (damage.attacker) {
          buf = `<b>${damage.attacker.name}</b>`;
        }

        if (damage.source) {
          buf += (damage.attacker ? "'s " : " ") + `<b>${damage.source.name}</b>`;
        } else if (!damage.attacker) {
          buf += "Something";
        }

        buf += ` hit <b>You</b> for <b><red>${damage.finalAmount}</red></b> damage`;
        B.sayAt(this, buf);

        // show damage to party members
        if (!this.party) {
          return;
        }

        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = '';
          if (damage.attacker) {
            buf = `<b>${damage.attacker.name}</b>`;
          }

          if (damage.source) {
            buf += (damage.attacker ? "'s " : ' ') + `<b>${damage.source.name}</b>`;
          } else if (!damage.attacker) {
            buf += "Something";
          }

          buf += ` hit <b>${this.name}</b> for <b><red>${damage.finalAmount}</red></b> damage`;
          B.sayAt(member, buf);
        }
      },

      healed: state => function (heal) {
        if (heal.hidden) {
          return;
        }

        let buf = '';
        let attacker = '';
        let source = '';

        if (heal.attacker && heal.attacker !== this) {
          attacker = `<b>${heal.attacker.name}</b> `;
        }

        if (heal.source) {
          attacker = attacker ? attacker + "'s " : '';
          source = `<b>${heal.source.name}</b>`;
        } else if (!heal.attacker) {
          source = "Something";
        }

        if (heal.attribute === 'health') {
          buf = `${attacker}${source} heals you for <b><red>${heal.finalAmount}</red></b>.`;
        } else {
          buf = `${attacker}${source} restores <b>${heal.finalAmount}</b> ${heal.attribute}.`;
        }
        B.sayAt(this, buf);

        // show heal to party members only if it's to health and not restoring a different pool
        if (!this.party || heal.attribute !== 'health') {
          return;
        }

        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = `${attacker}${source} heals ${this.name} for <b><red>${heal.finalamount}</red></b>.`;
          B.sayAt(member, buf);
        }
      },

      /**
       * Player was killed
       * @param {Character} killer
       */
      killed: state => function (killer) {
        if (this.party) {
          B.sayAt(this.party, `<b><green>${this.name} was killed!</green></b>`);
        }

        this.setAttributeToMax('health');

        let home = state.RoomManager.getRoom(this.getMeta('waypoint.home'));
        if (!home) {
          home = state.RoomManager.startingRoom;
        }

        this.moveTo(home, _ => {
          state.CommandManager.get('look').execute(null, this);

          B.sayAt(this, '<b><red>Whoops, that sucked!</red></b>');
          if (killer !== this) {
            B.sayAt(this, `You were killed by ${killer.name}.`);
          }
          // player loses 20% exp gained this level on death
          const lostExp = Math.floor(this.experience * 0.2);
          this.experience -= lostExp;
          this.save();
          B.sayAt(this, `<red>You lose <b>${lostExp}</b> experience!</red>`);

          B.prompt(this);
        });
      },

      /**
       * Player killed a target
       * @param {Character} target
       */
      deathblow: state => function (target, skipParty) {
        const xp = LevelUtil.mobExp(target.level);
        if (this.party && !skipParty) {
          // if they're in a party proxy the deathblow to all members of the party in the same room.
          // this will make sure party members get quest credit trigger anything else listening for deathblow
          for (const member of this.party) {
            if (member.room === this.room) {
              member.emit('deathblow', target, true);
            }
          }
          return;
        }

        if (target && !this.isNpc) {
          B.sayAt(this, `<b><red>You killed ${target.name}!`);
        }

        this.emit('experience', xp);
      }
    }
  };

  function makeAttack(attacker, defender) {
    const amount = attacker.calculateWeaponDamage();

    const damage = new Damage({
      attribute: "health",
      amount,
      attacker
    });
    damage.commit(defender);
    if (defender.getAttribute('health') <= 0) {
      defender.combatData.killedBy = attacker;
    }

    attacker.combatData.lag = attacker.combatData.speed * 1000;
  }

  function handleDeath(state, deadEntity, killer) {
    deadEntity.combatants.forEach(combatant => {
      deadEntity.removeCombatant(combatant);
      combatant.removeCombatant(deadEntity);
    });

    if (!deadEntity.isNpc) {
      deadEntity.removePrompt('combat');
    }

    killer = killer || deadEntity.combatData.killedBy;
    Logger.log(`${killer ? killer.name : 'Something'} killed ${deadEntity.name}.`);

    if (killer) {
      killer.emit('deathblow', deadEntity);
      if (!killer.isInCombat()) {
        startRegeneration(state, killer);
      }
    }

    const othersDeathMessage = killer ?
      `<b><red>${deadEntity.name} collapses to the ground, dead at the hands of ${killer.name}.</b></red>` :
      `<b><red>${deadEntity.name} collapses to the ground, dead</b></red>`;

    B.sayAtExcept(
      deadEntity.room,
      othersDeathMessage,
      (killer ? [killer, deadEntity] : deadEntity));

    deadEntity.emit('killed', killer || deadEntity);

    if (!killer.isNpc) {
      if (killer.party) {
        for (const member of killer.party) {
          B.prompt(member);
        }
      } else {
        B.prompt(killer);
      }
    }
  }

  // Make characters regenerate health while out of combat
  function startRegeneration(state, entity) {
    let regenEffect = state.EffectFactory.create('regen', entity, { hidden: true }, { magnitude: 15 });
    if (entity.addEffect(regenEffect)) {
      regenEffect.activate();
    }
  }
};
