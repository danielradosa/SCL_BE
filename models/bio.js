// IMPORTS
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// BIO SCHEMA
const bioSchema = new Schema({
    bioBy: { type: String, required: true },
    body: { type: String, required: false, max: 160 },
    website: { type: String, required: false, max: 255 },
    location: { type: String, required: false, max: 48 },
});

// MODEL EXPORT
module.exports = mongoose.model('Bio', bioSchema);