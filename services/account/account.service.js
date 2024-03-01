"use strict";

module.exports = {
	name: "account",
	version: 1,
	mixins: [],

	/**
	 * Settings
	 */
	settings: {
		salt: "(*&^$#$#@$@!@#"
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		login: {
			rest: {
				method: "POST",
				path: "login"
			},
			params: {
				body: {
					$$type: "object",
					email: "string",
					password: "string"
				}
			},
			handler: require("./actions/login.action")
		},
		oAuth2: {
			rest: {
				method: "GET",
				path: "/oauth/authorize"
			},
			params: {
			},
			handler: require("./actions/oAuth2.action")
		},
		callBackOauth2: {
			handler: require("./actions/oAuth2CallBack.action")
		},
		loginoAuth2Account: {
			rest: {
				method: "POST",
				path: "/login/oAuth2",
			},
			params: {
				body: {
					$$type: "object",
					googleAccessToken: "string",
				}
			},
			handler: require("./actions/loginOauth2.action")
		},
		get: {
			rest: {
				method: "GET",
				path: "/",
				auth: {
					strategies: ["Default"],
					mode: "required"
				}
			},
			params: {
			},
			handler: require("./actions/get.action")
		},
		sendVerifyCode: {
			rest: {
				method: "POST",
				path: "/register/sendEmail",
			},
			params: {
				body: {
					$$type: "object",
					email: "string"
				}
			},
			handler: require("./actions/sendVerifyCode.action")
		},
		register: {
			rest: {
				method: "POST",
				path: "/register",
			},
			params: {
				body: {
					$$type: "object",
					username: "string",
					email: "string",
					password: { type: "string", min: 8, max: 16 },
					activeCode: "string"
				}
			},
			handler: require("./actions/register.action")
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {
		requestAPI: require("./methods/request.method"),
		comparePassword: require("./methods/comparePassword.method"),
		encryptPassword: require("./methods/encryptPassword.method"),
		redisCache: require("./methods/redisCache.method")
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		setTimeout(async () => {
			const test = await this.broker.call("v1.account.oAuth2", {});
			console.log(test);
		});
	},

	/**
	 * Service stopped lifecycle event handler
	 */

	// async stopped() {},

	async afterConnected() {
		this.logger.info("Connected successfully...");
	}
};
