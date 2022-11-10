// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// LOGIN SCHEMA
const loginSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String, required: true }
});

// MODEL EXPORT
module.exports = mongoose.model('Login', loginSchema);