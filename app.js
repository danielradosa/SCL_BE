const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require('cors');
const { and } = require('graphql-shield');
const user = require('./models/user');
const cloudinary = require('cloudinary').v2;
const applyMiddleware = require('graphql-middleware').applyMiddleware;
const shield = require('graphql-shield').shield;
const rule = require('graphql-shield').rule;

require('dotenv').config();

const port = process.env.PORT || 1000;
const db_url = process.env.MONGO_DB;
const app = express();

// Definitions & CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Authenticate the user
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
    return !!ctx.headers['authorization'];
});

// Shields
const permissions = shield({
    Queries: {
        getAllPosts: isAuthenticated, 
        getCurrentUser: isAuthenticated,
    },
    Mutations: {
        createPost: isAuthenticated,
        deletePostById: isAuthenticated,
        createBio: isAuthenticated,
    },
});

const schemaWithMiddleware = applyMiddleware(schema, permissions);

// Setup Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Connect to MongoDB
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log('✨ Connected to database');
});

// Start up server
app.use('/graphql', graphqlHTTP({
    schema: schemaWithMiddleware,
    graphiql: true
}));

// Console logs
app.listen(port, () => {
    console.log(`🚀 Local server listening on ${port}`);
})