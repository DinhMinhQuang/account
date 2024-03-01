const _ = require("lodash");
const axios = require("axios");

module.exports = async function requestPost(url, body, headers = { Authorization: "" }) {
	console.log("request url => ", url);
	console.log("request body =>", JSON.stringify(body));
	console.log("request header =>", JSON.stringify(headers));
	try {
		const response = await axios.post(url, body, { headers });
		if (response.status !== 200) {
			return {
				code: _.get(response, "code", 500),
				message: _.get(response, "message", "Request API failed")
			};
		}
		return {
			code: response.status,
			message: "Resquest API succeed",
			data: response.data
		};
	} catch (error) {
		console.log("Request error =>", JSON.stringify(error));
		return {
			code: _.get(error, "response.status", 500),
			message: _.get(error, "response.statusText", "Request API failed"),
		};
	}
};
