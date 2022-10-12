// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// USER SCHEMA
const userSchema = new Schema({
    username: { type: String, required: true, min: 1, max: 50 },
    email: { type: String, required: true, min: 6, max: 255 },
    handle: { type: String, required: true, min: 4, max: 15 },
    password: { type: String, required: true, min: 6 },
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