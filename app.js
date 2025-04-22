const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();

app.use('/documents', express.static(__dirname + '/public/documents'));
app.use('/scripts', express.static(__dirname + '/public/scripts'));
app.use('/styles', express.static(__dirname + '/public/styles'));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', require('./controllers/HomeController'));
app.use('/register', require('./controllers/RegisterController'));

const server = app.listen(3000, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Server is running on http://%s:%s", host, port);
});