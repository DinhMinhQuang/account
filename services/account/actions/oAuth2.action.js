const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const authUrl = "https://accounts.google.com/o/oauth2/auth?";
		const options = {
			client_id: process.env.CLIENT_ID,
			redirect_uri: process.env.REDIRECT_URI,
			response_type: "token",
			prompt: "consent",
			scope: [
				"https://www.googleapis.com/auth/userinfo.profile",
				"https://www.googleapis.com/auth/userinfo.email",
			].join(" "),
		};
		const qs = new URLSearchParams(options);
		return {
			code: 1,
			message: "Succeed",
			authorizationUrl: authUrl+qs,
		};
	} catch (error) {
		console.log("login oAuth2 execption => ", JSON.stringify(error));
		return {
			code: 500,
			message: "Internal Server Error"
		};
	}
};
