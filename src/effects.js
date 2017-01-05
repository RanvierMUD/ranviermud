'use strict';
const util = require('util');
const fs 	 = require('fs');
const _    = require('./helpers');

// To store effects after configuration.
const _effects = new Map();
const effectsDir = __dirname + '/../effects/';

/* Helper class for loading, getting, and handling effects. */

const Effects = {

	config({ players, items, npcs, rooms, Commands }) {
		util.log("Configuring effects...");

		fs.readdir(effectsDir, (err, files) => {
			if (err) { throw new Error(err); }

			for (const file of files) {
				util.log(`Configuring ${file}...`);

				const effectFile = effectsDir + file;
				if (!fs.statSync(effectFile).isFile()) { continue; }
				if (!effectFile.match(/js$/)) 				 { continue; }

				const effect = require(effectFile).effect(players, items, npcs, rooms, Commands);
				const name = file.split('.')[0];

				// The filename must match the "type" of effect.
				validate(effect, name);
				_effects.set(name, effect);
				util.log(`Effect #${_effects.size}: ${file} configured.`);
			}
		});

	},

	/* Gets the effect from the map and passes in options/target to get the final effect object.
	 * @param target NPC | Player
	 * @param effectType String (matches filename of effect)
	 * @param options Object of optional params to be used in effect.
	 * @return effect Object
	*/
	get(target, effectType, options) {
		return _effects.get(effectType)(options, target);
	},

	/* Evaluates each effect, deciding if the effect is still valid, and updating anything that needs be.
	 * For example, could evaluate on each tick, on each action, or both.
	 * @param target NPC | Player
	 * @return void
	*/
	evaluateEffects(target, event) {
		for (const [ id, effect ] of target.getEffects()) {
			if (!effect.isValid()) {
				target.removeEffect(id);
			}
		}
	},

	evaluateAttrMods(target, attr) {
		let attrValue = target.attributes[attr] || 0;

		for (const [ id, effect ] of target.getEffects()) {
			const modifier = effect.getModifiers()[attr];
			if (!modifier) { continue; }

			if (effect.isValid()) {
				attrValue = modifier(attrValue);
			} else {
				target.removeEffect(id);
			}
		}

		// Don't allow negative attributes.
		// If attr somehow becomes NaN, return 0.
		return Math.max(attrValue, 0) || 0;
	},

	stringify(target) {
		let flattened = [];
		for (const [id, effect] of target.getEffects()) {
			flattened.push([id, effect.flatten()]);
		}
		return JSON.stringify(flattened);
	},

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


// On startup, validates all effect files
const validate = (effect, filename) => {
	const fakeTarget  = {};
	const fakeOptions = {};
	const test = effect(fakeOptions, fakeTarget);
	const isFunction = thing => thing && typeof thing === 'function';
	if (!isFunction(test.activate) || !isFunction(test.deactivate)) {
		util.log(filename);
		throw new ReferenceError("Each effect must have activate and deactivate functions.");
	}
	if (!test.type || filename !== test.type) {
		util.log(filename);
		throw new ReferenceError("Each effect must have a type that matches its filename.");
	}

}

exports.Effects = Effects;
exports.getSpecialEncumbranceEffects = getSpecialEncumbranceEffects;
