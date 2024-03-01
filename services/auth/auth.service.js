module.exports = {
	name: "auth",
	version: 1,
	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		default: {
			registry: {
				auth: {
					name: "Default",
					jwtKey: "gQ8sOERVGmkbNEvFedMy3XWrshmSX0mJsEy1izzNMrY"
				}
			},
			handler: require("./actions/default.action")
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

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
