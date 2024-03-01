const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		return {};

	} catch (error) {
		throw new MoleculerError(error.message, 500, null, null);
	}
};
