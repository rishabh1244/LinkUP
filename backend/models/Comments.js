// models/Likes.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
    postName: { type: String, required: true },

    CommentAuthor: { type: String, required: true },
    Comment: { type: String, required: true },

    date: { type: Date, default: Date.now }
});

// ✅ Rename to match usage
const Comments = mongoose.model('Comments', CommentSchema); // Capital L and singular
module.exports = Comments;
