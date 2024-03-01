const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const { code } = ctx.params.query;
		const requestInfo = await this.requestAPI("https://oauth2.googleapis.com/token", {
			grant_type: "authorization_code",
			code,
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri: process.env.REDIRECT_URI
		});
		if (requestInfo.code !== 200) {
			return {
				code: -1,
				message: "Login with google account failed"
			};
		}

		return {
			code: 1,
			message: "Succeed",
			data: requestInfo.data
		};
	} catch (error) {
		console.log("oAuth2CallBack actions error =>", error);
		return {
			code: 500,
			message: "Internal server"
		};


	}
};
