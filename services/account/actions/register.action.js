const _ = require("lodash");
const JsonWebToken = require("jsonwebtoken");
const moment = require("moment");
require("moment-duration-format");

module.exports = async function (ctx) {
	try {
		const { username, email, activeCode, password } = ctx.params.body;

		const lowerEmail = _.toLower(email);
		const emailRegex = /\S+@\S+\.\S+/;
		if (!lowerEmail.match(emailRegex)) {
			return {
				code: -1,
				message: "Invalid email address"
			};
		}

		const redisCache = this.redisCache();
		const key = `${lowerEmail}`;
		const count3time = _.toNumber(await redisCache.get({ key: `${key}-count3times` }));
		const lock = _.toNumber(await redisCache.get({ key }));
		if (lock === 1 && count3time >= 3) {
			const ttl = await redisCache.ttl({ key });

			let duration = moment.duration(ttl, "seconds").format("hh:m:ss");
			if (duration < 60) {
				duration = `${duration} s`;
			} else {
				duration = duration.split(":");
				if (duration.length === 3) {
					duration = `${duration[0]} h ${duration[1]} m ${duration[2]} s`;
				} else if (duration[1] !== "00") {
					duration = `${duration[0]} p ${duration[1]} s`;
				} else {
					duration = `${duration[0]} p`;
				}
			}
			return {
				code: -1,
				message: `Account has been lock on ${duration}`
			};
		}

		let account = await this.broker.call("v1.accountModel.findOne", [{ email: lowerEmail }]);
		if (_.get(account, "id", null) !== null) return {
			code: -1,
			message: "Your account exist"
		};

		const activeCodeSearch = await this.broker.call("v1.activeCodeModel.findOne", [
			{
				email: lowerEmail,
				code: activeCode,
			}
		]);

		if (_.get(activeCodeSearch, "id", null) === null) {
			if (count3time >= 3) {
				await redisCache.set({ key: `${key}-count3times`, value: `${count3time + 1}`, ttl: 5 * 60 });
				await redisCache.set({ key, value: `${1}`, ttl: 60 });
			} else {
				await redisCache.set({ key: `${key}-count3times`, value: `${count3time + 1}` });
			}
			return {
				code: -1,
				message: "Wrong OTP"
			};
		}

		if (moment(activeCodeSearch.expiredAt).isBefore(new Date())) {
			return {
				code: -1,
				message: "Your OTP has been expired"
			};
		}

		await redisCache.delete({ key: `${key}-count3times` });

		const passwordEncrypt = this.encryptPassword(password);
		account = await this.broker.call("v1.accountModel.create", [
			{
				username: username,
				password: passwordEncrypt,
				email: lowerEmail,
			}
		]);
		if (!_.isObject(account)) {
			return {
				code: -1,
				message: "Register error please try again"
			};
		}

		this.broker.call("v1.telegram.notification.async", {
			params: {
				message: `Account ${lowerEmail} register succeed`
			}
		});

		const accessTokenInfo = {
			accountId: account.id,
			email: account.email
		};

		return {
			code: 1,
			message: "Register succeed",
			accessToken: JsonWebToken.sign(accessTokenInfo, process.env.JWT_SECRECT)
		};
	} catch (error) {
		console.log("v1.account.register error =>", error);
		return {
			code: 500,
			message: "Internal Server",
		};
	}
};
