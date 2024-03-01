const _ = require("lodash");
const JsonWebToken = require("jsonwebtoken");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { accountId, email } = _.get(ctx, "meta.auth.credentials", {});
		const account = await this.broker.call("v1.accountModel.findOne", [
			{ email, id: accountId }
		]);

		if (_.get(account, "id", false) === false) return {
			code: -1,
			message: "Your account not exist"
		};


		if (_.get(account, "isActive", false) === false) return {
			code: -1,
			message: "Your account has been locked"
		};

		delete account.password;

		return {
			code: 1,
			message: "Succeed",
			data: account
		};

	} catch (error) {
		console.log("v1.account.get error =>", JSON.stringify(error));
		return {
			code: 500,
			message: "Internal Server",
		};
	}
};
