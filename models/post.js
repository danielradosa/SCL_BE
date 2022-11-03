// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// POST SCHEMA
const postSchema = new Schema({
    title: { type: String, required: false },
    content: { type: String, required: true, max: 280 },
    postImage: { type: String, required: false },
    postedBy: { type: String, required: true },
    createdAt: { type: String, required: true },
});

// MODEL EXPORT
module.exports = mongoose.model('Post', postSchema);