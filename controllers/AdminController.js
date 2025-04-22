const express = require('express');
const router = express.Router();
const mongoClient = require("../services/MongoClientService");
const APIResponse = require("../DTOs/APIResponse");

router.use(function(req, res, next) { next() });

module.exports = router;