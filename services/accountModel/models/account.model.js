const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String
	},
	username: {
		type: String,
		require: true
	},
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	collection: "Account",
	versionKey: false,
	timestamps: true
});

Schema.index({ email: 1 }, { sparse: true, unique: true });
Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model(Schema.options.collection, Schema);

