const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    username: { type: String },
    post: { type: mongoose.Types.ObjectId, ref: "Post" },
    text: { type: String },
    date: { type: Date, default: Date.now },
    formattedDate: {type: String}
});

module.exports = mongoose.model("Comment", commentSchema);
