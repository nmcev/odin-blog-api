const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    date: { type: Date, default: Date.now()},
    author: { type: String },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    published: { type: Boolean, default: false }
});

module.exports = mongoose.model('Post', postSchema);
