const Type = require('./type');

class Effect {
  constructor({id, options, type, target}) {
    
    // Validate.
    if (!id) { throw new ReferenceError("Effects must have an ID to prevent stacking."); }
    if (!options || !Object.keys(options).length) { throw new ReferenceError("Effects must take an options object to pass to applicable functions when evaluating effects."); }
    if (!type) { throw new ReferenceError("Effects must have a generic effect type."); }
    if (!target) { throw new ReferenceError("Effects must have a target."); }
    if (!(Type.isPlayer(target) || Type.isNpc(target))) { throw new TypeError("Effects can only target players or NPCs."); }

  }
}

exports.Effect = Effect;