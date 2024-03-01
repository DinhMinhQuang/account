const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const JsonWebToken = require("jsonwebtoken");
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const { googleAccessToken } = ctx.params.body;

		const requestInfo = await this.requestAPI("https://www.googleapis.com/oauth2/v3/userinfo", null, {
			Authorization: `Bearer ${googleAccessToken}`,
		});

		if (requestInfo.code !== 200) {
			return {
				code: requestInfo.code,
				message: requestInfo.message
			};
		}
		const user = _.get(requestInfo, "data", {});

		if (_.isEmpty(user)) {
			return {
				code: -1,
				message: "User Not Found"
			};
		}

		if (_.get(user, "email_verified", false) === false) {
			return {
				code: -1,
				message: "Email login not verify"
			};
		}

		let accessTokenInfo;
		let account = await this.broker.call("v1.accountModel.findOne", [{
			email: _.get(user, "email", null)
		}]);

		if (_.get(account, "id", null) === null) {
			account = await this.broker.call("v1.accountModel.create", [
				{
					email: _.get(user, "email", null),
					isActive: true,
					password: null,
					username: _.get(user, "name", "")
				}
			]);

			if (_.get(account, "id", false) === false) {
				return {
					code: -1,
					message: "Login account failed"
				};
			}
		}

		if (account.isActive === false) return {
			code: -1,
			message: "Account has been locked"
		};

		accessTokenInfo = {
			accountId: account.id,
			email: account.email
		};

		return {
			code: 1,
			message: "Succeed",
			accessToken: JsonWebToken.sign(accessTokenInfo, process.env.JWT_SECRECT)
		};
	} catch (error) {
		console.log("login oAuth2 execption => ", JSON.stringify(error));
		return {
			code: 500,
			message: "Internal Server Error"
		};
	}
};
