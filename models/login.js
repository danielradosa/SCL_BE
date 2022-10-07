// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// USER SCHEMA
const loginSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String, required: true }
});

// EXPORT
module.exports = mongoose.model('Login', loginSchema);