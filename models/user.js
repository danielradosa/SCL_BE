// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// USER SCHEMA
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    handle: { type: String, required: true },
    password: { type: String, required: true },
    following: { type: Number, required: false },
    followers: { type: Number, required: false },
    bio: { type: String, required: false },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

// MODEL EXPORT
module.exports = mongoose.model('User', userSchema);