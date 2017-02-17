'use strict';

const SkillFlag = require('./SkillFlag');
const SkillType = require('./SkillType');
const Broadcast = require('./Broadcast');
const Parser = require('./CommandParser').CommandParser;
const Damage = require('./Damage');
const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };

/**
 * @property {function (Effect)} configureEffect modify the skill's effect before adding to player
 * @property {null|number}      cooldownLength When a number > 0 apply a cooldown effect to disallow usage
 *                                       until the cooldown has ended
 * @property {string}           effect Id of the passive effect for this skill
 * @property {Array<SkillFlag>} flags
 * @property {function ()}      info Function to run to display extra info about this skill
 * @property {function ()}      run  Function to run when skill is executed/activated
 * @property {GameState}        state
 * @property {SkillType}        type
 */
class Skill {
  /**
   * @param {string} id
   * @param {object} config
   * @param {GameState} state
   */
  constructor(id, config, state) {
    const {
      cooldown = null,
      run = _ => {},
      flags = [],
      info = _ => {},
      name,
      requiresTarget = true,
      targetSelf = false,
      resource = { attribute: 'energy', cost: 0 },
      type = SkillType.SKILL,
      effect = null,
      configureEffect = _ => _,
    } = config;

    this.id = id;
    this.configureEffect = configureEffect;
    this.cooldownLength = cooldown;
    this.effect = effect;
    this.flags = flags;
    this.info = info.bind(this);
    this.name = name;
    this.resource = resource;
    this.run = run.bind(this);
    this.state = state;
    this.type = type;
    this.requiresTarget = requiresTarget;
    this.targetSelf = targetSelf;
  }

  /**
   * perform an active skill
   * @param {string} args
   * @param {Player} player
   */
  execute(args, player, target) {
    if (this.flags.includes(SkillFlag.PASSIVE)) {
      throw new Error('Trying to execute passive skill');
    }

    const cdEffect = this.onCooldown(player);
    if (this.cooldownLength && cdEffect) {
      return Broadcast.sayAt(player, `${this.name} is on cooldown. ${humanize(cdEffect.remaining)} remaining.`);
    }

    if (this.requiresTarget && !target) {
      target = this.searchForTargets(args, player)
      if (!target) {
        return Broadcast.sayAt(player,  `Use ${this.name} on whom?`);
      }
    }

    if (this.resource.cost) {
      const paid = this.payResourceCost(player);
      if (!paid) {
        return;
      }
    }

    this.run(args, player, target);
  }

  /** Finds implicit targets.
   * @param {string} args
   * @param {Player} player
   * @return {Entity|null} Found entity... or not.
   */
  searchForTargets(args, player) {
    if (!args.length) {
      if (this.targetSelf) {
        return player;
      } else if (player.isInCombat()) {
        return [...player.combatants][0];
      } else {
        Broadcast.sayAt(player, `Use ${this.name} on whom?`);
        return null;
      }
    } else {
      return Parser.parseDot(args, player.room.npcs);
    }
  }

  /**
   * @param {Player} player
   * @return {boolean} If the player has paid the resource cost.
   */
  payResourceCost(player) {
    if (!this.hasEnoughResource(player)) {
      Broadcast.sayAt(player, `You do not have enough ${this.resource.attribute}.`);
      return false;
    }

    // resource cost is calculated as damage so effects could potentially reduce resource costs
    const damage = new Damage({
      attribute: this.resource.attribute,
      amount: this.resource.cost,
      attacker: null,
      hidden: true,
      source: this
    });

    damage.commit(player);
    return true;
  }


  activate(player) {
    if (!this.flags.includes(SkillFlag.PASSIVE)) {
      throw new Error('Trying to activate non-passive skill');
    }

    if (!this.effect) {
      throw new Error('Passive skill has no attached effect');
    }


    let effect = this.state.EffectFactory.create(this.effect, player, { description: this.info(player) });
    effect = this.configureEffect(effect);
    effect.skill = this;
    player.addEffect(effect);
    this.run(player);
  }

  /**
   * @param {Player} player
   * @return {boolean|Effect} If on cooldown returns the cooldown effect
   */
  onCooldown(player) {
    for (const effect of player.effects.entries()) {
      if (effect.id === 'cooldown' && effect.state.cooldownId === this.getCooldownId()) {
        return effect;
      }
    }

    return false;
  }

  /**
   * Put this skill on cooldown
   * @param {number} duration Cooldown duration
   * @param {Player} player
   */
  cooldown(player) {
    if (!this.cooldownLength) {
      return;
    }

    const effect = this.state.EffectFactory.create(
      'cooldown',
      player,
      { name: "Cooldown: " + this.name, duration: this.cooldownLength * 1000 },
      { cooldownId: this.getCooldownId() }
    );
    effect.skill = this;

    player.addEffect(effect);
  }

  getCooldownId() {
    return "skill:" + this.id;
  }

  hasEnoughResource(player) {
    return !this.resource.cost || (
      player.hasAttribute(this.resource.attribute) &&
      player.getAttribute(this.resource.attribute) >= this.resource.cost
    );
  }
}

module.exports = Skill;
