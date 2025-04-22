require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;

const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

module.exports = mongoClient;