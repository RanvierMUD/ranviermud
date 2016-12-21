'use strict';
const util = require('util');


// To store effects after configuration.
const _effects = new Map();
const effectsDir = __dirname + '../effects/';

/* Helper class for loading, getting, and handling effects. */

class Effects {
	constructor() {}
	
	config(players, items, npcs, rooms, Commands) {
		util.log("Configuring effects...");

		fs.readdir(effectsDir, (err, files) => {
			if (err) { throw new Error(err); }

			for (const file of files) {
				util.log(`Configuring ${file}...`);
				if (!fs.statSync(file).isFile()) { continue; }
				if (!file.match(/js$/)) 				 { continue; }
				
				const effectFile = effectsDir + file;
				const effect 		 = require(effectFile).effect(players, items, npcs, rooms, Commands);

				// The filename must match the "type" of effect.
				_effects.set(file, effect);
				util.log(`Effect #${_effects.size}: ${file} configured.`);
			}
		});

	}

	/* Gets the effect from the map and passes in options/target to get the final effect object.
	 * @param effectType String (matches filename of effect)
	 * @param options Object of optional params to be used in effect.
	 * @param target NPC | Player
	 * @return effect Object
	*/
	static get(effectType, options, target) {
		return _effects.get(effectType)(options, target);
	}

	/* Evaluates each effect, deciding if the effect is still valid, and updating anything that needs be.
	 * For example, could evaluate on each tick, on each action, or both.
	 * @param target NPC | Player
	 * @return void
	*/
	static evaluateEffects(target) {
		for (const [ id, effect ] of target.getEffects()) {
			if (effect.isValid()) {
				effect.evaluate(effect.getOptions(), target);
			} else {
				target.removeEffect(id);
			}
		}
	}

	* [Symbol.iterator]() {
		for (const [type, effect] of _effects) {
			yield effect;
		}
	}

}

const getSpecialEncumbranceEffects = entity => ({
    
	'insubstantial': {
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => dodge + Math.ceil(entity.getAttribute('quickness') / 2)
		},
		'defenseMods': {
			name:  'encumbrance',
			effect: defense => defense - 2
		},
		'damageMods': {
			name:  'encumbrance',
			effect: damage => damage - 2 
		},
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => toHit + Math.ceil(entity.getAttribute('level') / 4)
		}
	},

	'light': {
		'defenseMods': {
			name:  'encumbrance',
			effect: defense => defense - 1
		},
		'damageMods': {
			name:  'encumbrance',
			effect: damage => damage - 1 
		},
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => toHit + Math.ceil(entity.getAttribute('level') / 5)
		}
	},

	'burdensome': {
		'dodgeMods': {
			name:  'encumbrance',
			effect: dodge => Math.ceil(dodge / 2) 
		}
	},

	'overburdening': {
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => Math.ceil(toHit / 2)
		},
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => Math.floor(dodge / 4)
		}
	},

	'crushing': {
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => Math.floor(toHit / 3)
		},
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => 0
		}
	},

	'back-breaking': {
		'toHitMods': {
			name: 'encumbrance',
			effect: toHit => Math.floor(toHit / 2)
		},
		'dodgeMods': {
			name: 'encumbrance',
			effect: dodge => Math.floor(dodge / 5)
		}
	},

});

exports.Effects = Effects;
exports.getSpecialEncumbranceEffects = getSpecialEncumbranceEffects;
