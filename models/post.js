// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// POST SCHEMA
const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true, max: 280 },
    postImage: { type: String, required: false },
    postedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, required: true, default: 'USER' }
});

// MODEL EXPORT
module.exports = mongoose.model('Post', postSchema);