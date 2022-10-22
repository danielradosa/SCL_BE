const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');

require('dotenv').config();

const port = 1000;
const db_url = process.env.MONGO_DB;
const app = express();

mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Local server listening on port ${port}`);
})