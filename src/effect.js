'use strict'

/* Symbols for private fields of effect class */
const _id      = Symbol('id');
const _options = Symbol('options');
const _type    = Symbol('type');
const _target  = Symbol('target'); 

/* Effect class -- instantiates new effect, can be used to check for validity of effect, can be used 
 * @param {id: string, options: object, type: string, target: NPC | Player } 
 * @return 
*/
class Effect {

  constructor({ id, options, type, target }) {
    validate(id, options, type, target);
    this[_id]      = id;
    this[_options] = options;
    this[_type]    = type;
    this[_target]  = target;
  }

  /* Get private fields... */
  getId()      { return this[_id]; }
  getOptions() { return this[_options]; }
  getType()    { return this[_type]; }
  getTarget()  { return this[_target]; }

  /* Get options or defaults */
  getDuration() { return parseInt(this[_options].duration, 10) || Infinity; }

}

/* Validation helper for effect construction */
const validate = (id, options, type, target) => {
  if (!id) { 
    throw new ReferenceError("Effects must have an ID to prevent stacking."); 
  }
  if (!options || !Object.keys(options).length) { 
    throw new ReferenceError("Effects must take an options object to pass to applicable functions when evaluating effects."); 
  }
  if (!type) { 
    throw new ReferenceError("Effects must have a generic effect type."); 
  }
  if (!target) { 
    throw new ReferenceError("Effects must have a target."); 
  }
  if (!(target.addEffect)) { 
    throw new TypeError("Effects can only target players or NPCs."); 
  }
}

exports.Effect = Effect;