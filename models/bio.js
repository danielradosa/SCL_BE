// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// BIO SCHEMA
const bioSchema = new Schema({
    who: { type: String, required: true },
    body: { type: String, required: false },
    website: { type: String, required: false },
    location: { type: String, required: false },
});

// MODEL EXPORT
module.exports = mongoose.model('Bio', bioSchema);