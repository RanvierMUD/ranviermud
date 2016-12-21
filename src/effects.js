'use strict';
const util = require('util');


// To store effects after configuration.
const _effects = new Map();


// To store globals to inject into effects.
let players, items, npcs, rooms;


/* Helper class for loading, getting, and handling effects. */

class Effects {
	constructor() {}
	
	config(players, items, npcs, rooms) {
			
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
