const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    description: { type: String, require: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    date: { type: Date, default: Date.now()},
    author: { type: String },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    published: { type: Boolean, default: false },
    img: { type: String}
});

module.exports = mongoose.model('Post', postSchema);
