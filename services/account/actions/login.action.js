const _ = require("lodash");
const JsonWebToken = require("jsonwebtoken");
const { MoleculerError } = require("moleculer").Errors;
const moment = require("moment");
// const generalConstant = require("../constants/general.constant");
require("moment-duration-format");

module.exports = async function (ctx) {
	try {
		const { email, password } = _.get(ctx, "params.body");

		const lowerEmail = _.toLower(email);
		const emailRegex = /\S+@\S+\.\S+/;
		if (!lowerEmail.match(emailRegex)) {
			return {
				code: -1,
				message: "Invalid email address"
			};
		}

		const account = await this.broker.call("v1.accountModel.findOne", [{ email: lowerEmail }]);

		if (_.get(account, "id", null) === null) {
			return {
				code: -1,
				message: "Wrong email or password"
			};
		}

		const RedisCache = this.redisCache(); // define utility
		const check = _.toNumber(await RedisCache.get({ key: account.id })); /// set default === 0
		const ttl = await RedisCache.ttl({ key: `lockLoginTime_${account.id}` });

		if (check >= 3 && ttl > 0) {
			let duration = moment.duration(ttl, "seconds").format("m:ss");
			if (ttl < 60) {
				duration = `${duration}s`;
			} else {
				duration = duration.split(":");
				if (duration[1] !== "00") {
					duration = `${duration[0]}m:${duration[1]}s`;
				} else {
					duration = `${duration[0]}m`;
				}
			}

			return {
				code: -1,
				message: `Account has been locked in ${duration}`
			};
		}


		if (this.comparePassword(password, account.password) === false) {
			await RedisCache.set({ key: account.id, value: check + 1 });
			if (check + 1 >= 3) {
				await RedisCache.set({ key: `lockLoginTime_${account.id}`, value: check + 1, ttl: 60 });
			}
			await RedisCache.set({
				key: account.id, value: check + 1
			});
			return {
				code: -1,
				message: "Wrong email or password"
			};
		}


		if (_.get(account, "isActive", false) === false) {
			return {
				code: -1,
				message: "This account has been locked"
			};
		}

		await RedisCache.delete({ key: `lockLoginTime_${account.id}` });
		// console.log('lockResult ', lockResult);
		await RedisCache.delete({ key: account.id });

		const accessTokenInfo = {
			accountId: account.id,
			email: account.email,
		};

		return {
			code: 1,
			message: "Login success",
			accessToken: JsonWebToken.sign(accessTokenInfo, process.env.JWT_SECRECT)
		};
	} catch (error) {
		console.log("v1.account.login error =>", error);
		return {
			code: 500,
			message: "Internal Server",
		};
	}
};
