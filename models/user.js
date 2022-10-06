// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// USER SCHEMA
const userSchema = new Schema({
    username: String,
    email: String,
    handle: String,
    password: String,
    following: Number,
    followers: Number,
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

// MODEL EXPORT
module.exports = mongoose.model('User', userSchema);