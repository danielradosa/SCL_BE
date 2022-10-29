const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

const port = process.env.PORT || 1000;
const db_url = process.env.MONGO_DB;
const app = express();

// Definitions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log('✨ Connected to database');
});

// Start up server
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

// Console logs
app.listen(port, () => {
    console.log(`🚀 Local server listening on ${port}`);
})