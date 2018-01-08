'use strict';

const SkillFlag = require('./SkillFlag');
const SkillType = require('./SkillType');
const SkillErrors = require('./SkillErrors');
const Damage = require('./Damage');

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
      resource = null, /* format [{ attribute: 'someattribute', cost: 10}] */
      run = _ => {},
      targetSelf = false,
      type = SkillType.SKILL,
      options = {}
    } = config;

    this.configureEffect = configureEffect;

    this.cooldownGroup = null;
    if (cooldown && typeof cooldown === 'object') {
      this.cooldownGroup = cooldown.group;
      this.cooldownLength = cooldown.length;
    } else {
      this.cooldownLength = cooldown;
    }

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
   * @param {Character} target
   */
  execute(args, player, target) {
    if (this.flags.includes(SkillFlag.PASSIVE)) {
      throw new SkillErrors.PassiveError();
    }

    const cdEffect = this.onCooldown(player);
    if (this.cooldownLength && cdEffect) {
      throw new SkillErrors.CooldownError(cdEffect);
    }

    if (this.resource) {
      if (!this.hasEnoughResources(player)) {
        throw new SkillErrors.NotEnoughResourcesError();
      }
    }

    if (target !== player && this.initiatesCombat) {
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
    return this.cooldownGroup ? "skillgroup:" + this.cooldownGroup : "skill:" + this.id;
  }

  /**
   * @param {Character} character
   * @return {boolean}
   */
  hasEnoughResources(character) {
    if (Array.isArray(this.resource)) {
      return this.resource.every((resource) => this.hasEnoughResource(character, resource));
    }
    return this.hasEnoughResource(character, this.resource);
  }

  /**
   * @param {Character} character
   * @param {{ attribute: string, cost: number}} resource
   * @return {boolean}
   */
  hasEnoughResource(character, resource) {
    return !resource.cost || (
      character.hasAttribute(resource.attribute) &&
      character.getAttribute(resource.attribute) >= resource.cost
    );
  }
}

module.exports = Skill;
