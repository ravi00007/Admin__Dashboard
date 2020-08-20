const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const FavoriteSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	description: {
		type: String,
    },
    objId: {
		type: ObjectId,
	},
	
});
const Favorite = mongoose.model("Favorite", FavoriteSchema);
module.exports = Favorite;