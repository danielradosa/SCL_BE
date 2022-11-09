// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// USER SCHEMA
const userSchema = new Schema({
    username: { type: String, required: true, min: 1, max: 50 },
    profilePicture: { type: String, required: false },
    email: { type: String, required: true, min: 6, max: 255 },
    handle: { type: String, required: true, min: 4, max: 25 },
    password: { type: String, required: true, min: 6 },
    following: [{ type: String, required: false }],
    followers: [{ type: String, required: false }],
    bio: { type: String, required: false },
    artist: { type: Boolean, required: false, default: false },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    role: { type: String, required: true, default: 'USER' }
});

// MODEL EXPORT
module.exports = mongoose.model('User', userSchema);