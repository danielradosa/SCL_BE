// IMPORTS
const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

// POST SCHEMA
const postSchema = new Schema({
    title: { type: String, required: false },
    content: { type: String, required: true, max: 280 },
    postImage: { type: String, required: false },
    postedBy: { type: String, required: true },
    createdAt: { type: String, required: true, default: moment().format('MM-DD-YYYY hh:mm:ss a') },
});

// MODEL EXPORT
module.exports = mongoose.model('Post', postSchema);