// Imports
const shield = require('graphql-shield').shield;
const isAuthorized = require('./rules/isAuthorized.js');

module.exports = shield({
    Queries: {},
    Mutations: {
        createPost: isAuthorized,
        createBio: isAuthorized,
    }
});