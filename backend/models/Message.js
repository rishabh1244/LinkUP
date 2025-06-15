// models/Likes.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
    Sender: { type: String, required: true },
    Reciver: { type: String, required: true },
    Content: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// ✅ Rename to match usage
const Message = mongoose.model('Message', MessageSchema); // Capital L and singular
module.exports = Message;
