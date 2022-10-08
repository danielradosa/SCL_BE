const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
// const authorization = require('./guards');
const mongoose = require('mongoose');

require('dotenv').config();

const port = process.env.PORT || 1000;
const db_url = process.env.MONGO_DB;
const app = express();
// const authorizedSchema = authorization(schema);

mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

app.use('/graphql', graphqlHTTP({
    schema, //authorizedSchema,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Local server listening on port ${port}`);
})