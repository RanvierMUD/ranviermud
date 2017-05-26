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
      configureEffect = _ => _,
      cooldown = null,
      effect = null,
      flags = [],
      info = _ => {},
      initiatesCombat = false,
      name,
      requiresTarget = true,
      resource = { attribute: 'energy', cost: 0 },
      run = _ => {},
      targetSelf = false,
      type = SkillType.SKILL,
      options = {}
    } = config;

    this.configureEffect = configureEffect;
    this.cooldownLength = cooldown;
    this.effect = effect;
    this.flags = flags;
    this.id = id;
    this.info = info.bind(this);
    this.initiatesCombat = initiatesCombat;
    this.name = name;
    this.options = options;
    this.requiresTarget = requiresTarget;
    this.resource = resource;
    this.run = run.bind(this);
    this.state = state;
    this.targetSelf = targetSelf;
    this.type = type;
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
      Broadcast.sayAt(player, `${this.name} is on cooldown. ${humanize(cdEffect.remaining)} remaining.`);
      return false;
    }

    if (this.requiresTarget && !target) {
      if (!args || !args.length) {
        if (this.targetSelf) {
          target = player;
        } else if (player.isInCombat()) {
          target = [...player.combatants][0];
        } else {
          target = null;
        }
      } else {
        try {
          target = player.findCombatant(args);
        } catch (e) {
          Broadcast.sayAt(player, e.message);
          return false;
        }
      }

      if (!target) {
        Broadcast.sayAt(player, `Use ${this.name} on whom?`);
        return false;
      }
    }

      if (this.resource) {
        if (!this.hasEnoughResources(player)) {
          Broadcast.sayAt(player, `You do not have enough ${this.resource.attribute}.`);
          return false;
        }
      }

    if (this.initiatesCombat) {
      player.initiateCombat(target);
    }

    // allow skills to not incur the cooldown if they return false in run
    if (this.run(args, player, target) !== false) {
      this.cooldown(player);
      if (this.resource) {
        this.payResourceCosts(player);
      }
    }

    return true;
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
   * @return {boolean} If the player has paid the resource cost(s).
   */
  payResourceCosts(player) {
    const hasMultipleResourceCosts = Array.isArray(this.resource);
    if (hasMultipleResourceCosts) {
      for (const resourceCost of this.resource) {
        this.payResourceCost(player, resourceCost);
      }
      return true;
    }

    return this.payResourceCost(player, this.resource);
  }

  // Helper to pay a single resource cost.
  payResourceCost(player, resource) {

    // Resource cost is calculated as damage so effects could potentially reduce resource costs
    const damage = new Damage({
      attribute: resource.attribute,
      amount: resource.cost,
      attacker: null,
      hidden: true,
      source: this
    });

    damage.commit(player);
  }


  activate(player) {
    if (!this.flags.includes(SkillFlag.PASSIVE)) {
      return;
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
   * @param {Character} character
   * @return {boolean|Effect} If on cooldown returns the cooldown effect
   */
  onCooldown(character) {
    for (const effect of character.effects.entries()) {
      if (effect.id === 'cooldown' && effect.state.cooldownId === this.getCooldownId()) {
        return effect;
      }
    }

    return false;
  }

  /**
   * Put this skill on cooldown
   * @param {number} duration Cooldown duration
   * @param {Character} character
   */
  cooldown(character) {
    if (!this.cooldownLength) {
      return;
    }

    const effect = this.state.EffectFactory.create(
      'cooldown',
      character,
      { name: "Cooldown: " + this.name, duration: this.cooldownLength * 1000 },
      { cooldownId: this.getCooldownId() }
    );
    effect.skill = this;

    character.addEffect(effect);
  }

  getCooldownId() {
    return "skill:" + this.id;
  }

  hasEnoughResources(character) {
    if (Array.isArray(this.resource)) {
      return this.resource.every((resource) => this.hasEnoughResource(character, resource));
    }
    return this.hasEnoughResource(character, this.resource);
  }

  hasEnoughResource(character, resource) {
    return !resource.cost || (
      character.hasAttribute(resource.attribute) &&
      character.getAttribute(resource.attribute) >= resource.cost
    );
  }
}

module.exports = Skill;
