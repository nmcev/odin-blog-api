const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const commentSchema = new Schema({
    username: { type: String },
    post: { type: mongoose.Types.ObjectId, ref: "Post" },
    text: { type: String },
    date: { type: Date, default: Date.now },
});

commentSchema.virtual('formattedDate').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_SHORT);
  });

module.exports = mongoose.model("Comment", commentSchema);
