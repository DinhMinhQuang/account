/* eslint-disable no-underscore-dangle */
const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
require("moment-duration-format");

module.exports = async function (ctx) {
	try {
		const { email } = ctx.params.body;

		const emailRegex = /\S+@\S+\.\S+/;
		if (!email.match(emailRegex)) {
			return {
				code: -1,
				message: "Invalid email address"
			};
		}

		const lowerEmail = _.toLower(email);

		const account = await this.broker.call("v1.accountModel.findOne", [{ email: lowerEmail }]);
		if (_.get(account, "id", null) !== null) return {
			code: -1,
			message: "Account already exist"
		};

		await this.broker.call("v1.activeCodeModel.deleteMany", [{ email: lowerEmail }]);

		const random = _.random(100000, 999999);
		const activeCode = await this.broker.call("v1.activeCodeModel.create", [
			{
				email: lowerEmail,
				code: random,
				expiredAt: moment(new Date()).add(15, "minutes")
			}
		]);

		if (!_.get(activeCode, "id", false)) {
			return {
				code: -1,
				message: "Send verify code failed, Please try again"
			};
		}

		this.broker.call("v1.mail.send.async", {
			params: {
				email: lowerEmail,
				activeCode: random
			}
		});

		this.broker.call("v1.telegram.notification.async", {
			params: {
				message: `Verify code for account email: ${lowerEmail} is: ${random}`
			}
		});

		return {
			code: 1,
			message: "Send verify code succeed"
		};

	} catch (error) {
		console.log("v1.account.sendVerifyCode error =>", error);
		return {
			code: 500,
			message: "Internal Server",
		};
	}
};
