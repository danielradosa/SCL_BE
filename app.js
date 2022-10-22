const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');

require('dotenv').config();

const port = process.env.PORT || 1000;
const db_url = process.env.MONGO_DB;
const app = express();

// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-*");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "auth-token, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Connect to MongoDB
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

// Format response as JSON
app.use(express.json());

// Start up server
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Local server listening on port ${port}`);
})