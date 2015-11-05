var Localize = require('localize');
/**
 * Helper to get a new localize object
 * @param string file
 * @return Localize
 */
module.exports = function (l10n_file)
{
	// set the "default" locale to zz so it'll never have default loaded and to always force load the English values
	var l = new Localize(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
	l.throwOnMissingTranslation(false);
	return l;
};
