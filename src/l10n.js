var Localize = require('localize');
/**
 * Helper to get a new localize object
 * @param string file
 * @return Localize
 */
module.exports = function (l10n_file)
{
	return new Localize(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
};
