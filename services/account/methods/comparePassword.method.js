const sha256 = require("sha256");

module.exports = function (password, hash) {
	return sha256(password + process.env.SALT) === hash;
};
