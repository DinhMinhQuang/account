/* eslint-disable object-curly-newline */
const _ = require("lodash");

module.exports = function () {
	const Client = this.broker.cacher.client;

	return {
		set: (params = { key: null, value: null, ttl: null, mode: null }) => {
			const { key, ttl, mode } = params;
			let { value } = params;

			if (_.isObject(value)) { value = JSON.stringify(value); }

			if (_.isNumber(value)) { value = _.toString(value); }

			if (_.isNumber(ttl)) {
				if (mode) {
					return Client.set(key, value, "EX", ttl, mode);
				}
				return Client.set(key, value, "EX", ttl);
			}
			if (mode) {
				return Client.set(key, value, mode);
			}
			return Client.set(key, value);
		},
		get: (params = { key: null }) => Client.get(params.key),
		ttl: (params = { key: null }) => Client.ttl(params.key),
		delete: (params = { key: null }) => Client.del(params.key)

	};
};
