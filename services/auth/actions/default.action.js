const _ = require("lodash");
const JsonWebToken = require("jsonwebtoken");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { accountId, email, iat } = ctx.params;

		const iatDate = moment(iat * 1000);
		const expiredAt = iatDate.add(1, "hours");

		if (moment().isAfter(expiredAt)) {
			throw new MoleculerError("Thông tin xác thực không hợp lệ", 401, null, null);
		}

		const account = await this.broker.call("v1.accountModel.findOne", [
			{ email, id: accountId }
		]);

		if (_.get(account, "id", false) === false) {
			throw new MoleculerError("Thông tin xác thực không hợp lệ", 401, null, null);
		}
		return {
			accountId: account.id,
			email: account.email
		};

	} catch (error) {
		throw new MoleculerError(error.message, 401, null, null);
	}
};
