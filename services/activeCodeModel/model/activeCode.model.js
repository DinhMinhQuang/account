const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const Moment = require("moment");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
	accountId: {
		type: Number,
		default: null
	},
	email: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true
	},
	expiredAt: {
		type: Date,
		default: Moment(new Date()).add(15, "minutes")
	}
}, {
	collection: "ActiveCode",
	versionKey: false,
	timestamps: true
});
/*
| ==========================================================
| Plugins
| ==========================================================
*/

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1
});

/*
| ==========================================================
| Methods
| ==========================================================
*/

/*
| ==========================================================
| HOOKS
| ==========================================================
*/

module.exports = mongoose.model(Schema.options.collection, Schema);
