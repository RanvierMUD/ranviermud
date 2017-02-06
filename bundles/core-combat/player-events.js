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
        if (!this.isInCombat()) {
          return;
        }

        // TODO: For now player/enemy speed is a fixed 2.5 seconds, base it off weapon speed later
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const playerSpeed = 1.5;
        const targetSpeed = 2;
        const playerDamage = rand(10, 20);
        const targetDamage = rand(1, 10);

        let hadActions = false;
        for (const target of this.combatants) {
          // player actions
          if (this.combatData.lag <= 0) {
            hadActions = true;
            const damage = Math.min(playerDamage, target.attributes.health);

            target.emit('hit', this, damage);
            target.attributes.health -= damage;
            Broadcast.sayAt(this, `You strike <bold>${target.name}</bold> for <bold>${damage}</bold> damage`);

            if (target.attributes.health <= 0) {
              this.removeCombatant(target);
              target.removeCombatant(this);

              Broadcast.sayAt(this, `<bold>${target.name} is <red>Dead</red>!</bold>`);
              target.emit('killed', this);
              this.emit('deathblow', target);

              // TODO: For now respawn happens here, this is shitty
              const newNpc = state.MobFactory.create(target.area, target.getKey());
              newNpc.hydrate(state);
              if (newNpc.room) {
                newNpc.room.removeNpc(newNpc);
              }
              target.room.addNpc(newNpc);
              target.emit('spawn');
              target.area.removeNpc(target);
              continue;
            }

            this.combatData.lag = playerSpeed * 1000;
          } else {
            const elapsed = Date.now() - this.combatData.roundStarted;
            this.combatData.lag -= elapsed;
          }
          this.combatData.roundStarted = Date.now();

          // target actions
          if (target.combatData.lag <= 0) {
            hadActions = true;
            const damage = Math.min(targetDamage, this.attributes.health);

            this.emit('hit', target, damage);
            this.attributes.health -= damage;
            Broadcast.sayAt(this, `<bold>${target.name}</bold> hit you for <bold><red>${damage}</red></bold> damage`);

            if (this.attributes.health <= 0) {
              this.combatants.forEach(combatant => {
                this.removeCombatant(combatant);
              }, this);
              target.removeCombatant(this);

              Broadcast.sayAt(this, `<bold><red>${target.name} killed you!</red></bold>`);
              target.emit('deathblow', this);
              this.emit('killed', target);

              // For now if the NPC killed the player and has no other targets just reset them to max health
              if (!target.isInCombat()) {
                target.attributes.health = target.attributes.maxHealth;
              }
              break;
            }

            target.combatData.lag = targetSpeed * 1000;
          } else {
            const elapsed = Date.now() -  target.combatData.roundStarted;
            target.combatData.lag -= elapsed;
          }
          target.combatData.roundStarted = Date.now();
        }

        if (!this.isInCombat()) {
          // reset combat data to remove any lag
          this.combatData = {};

          // TODO: There is no regen at the moment so if they won just reset their health
          this.attributes.health = this.attributes.maxHealth;
        }

        if (hadActions) {
          Broadcast.sayAt(this, '');
          Broadcast.prompt(this);
          const percWidth = 50;

          if (!this.isInCombat()) {
            return;
          }

          // render health bars
          let currentPerc = Math.floor((this.attributes.health / this.attributes.maxHealth) * 100);
          let buf = '<bold>You</bold>: <green>[<bold>';
          buf += new Array(Math.ceil((currentPerc / 100) * percWidth)).join('#') + '|';
          buf += new Array(percWidth - Math.ceil((currentPerc  / 100) * percWidth)).join(' ');
          buf += '</bold>]</green>';
          buf += ` <bold>${this.attributes.health}/${this.attributes.maxHealth}</bold>`;
          Broadcast.sayAt(this, buf);

          for (const target of this.combatants) {
            let currentPerc = Math.floor((target.attributes.health / target.attributes.maxHealth) * 100);
            let buf = `<bold>${target.name}</bold>: `
            buf += '<red>[<bold>';
            buf += new Array(Math.ceil((currentPerc / 100) * percWidth)).join('#') + '|';
            buf += new Array(percWidth - Math.ceil((currentPerc  / 100) * percWidth)).join(' ');
            buf += '</bold>]</red>';
            buf += ` <bold>${target.attributes.health}/${target.attributes.maxHealth}</bold>`;
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
        // Restore health to full on death for now
        this.attributes.health = this.attributes.maxHealth;
        Broadcast.sayAt(this, "Whoops, that sucked!");
      },

      /**
       * Player killed a target
       * @param {Character} target
       */
      deathblow: state => function (target) {
        this.emit('experience', LevelUtil.mobExp(target.level));
        this.attributes.health = this.attributes.maxHealth;
      }
    }
  };
};
