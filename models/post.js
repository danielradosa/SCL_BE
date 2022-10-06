// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// POST SCHEMA
const postSchema = new Schema({
    title: String,
    content: String,
    postImageURL: String,
    postedBy: String
});

// MODEL EXPORT
module.exports = mongoose.model('Post', postSchema);