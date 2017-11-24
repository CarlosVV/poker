'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const rp = require('request-promise');
require('ssl-root-cas').inject();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let urlApi = 'https://services.comparaonline.com/dealer';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('morgan')('dev'));
app.set('view engine', 'ejs');

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));

app.use(function printSession(req, res, next) {
  return next();
});

app.get('/', function (req, res) {
  if (typeof req.session.views === 'undefined') {
    req.session.views = 1;
  }

  let url = `https://${urlApi}/deck`;

  var options = {
      uri: url,
      method: 'POST',
      headers: {
       'User-Agent': 'Request-Promise'
      },
      json: false
  };

  rp(options)
    .then(function (body) {
      console.log(body);
      let apiKey = body;
      req.session.token = apiKey;
      res.render('index');
     })
    .catch(function (err) {
       res.render('index', {decks: null, error: 'Error,  please try again'});
    });
})

app.post('/', function (req, res) {
  //console.log(req.body.option);
  let apiKey = req.session.token;
  let deck = 5;
  let url = `${urlApi}/${apiKey}/deal/${deck}`;
  console.log(url);

  var options = {
      uri: url,
      headers: {
       'User-Agent': 'Request-Promise'
      },
      json: true
  };

  rp(options)
    .then(function (body) {
      let decks = JSON.parse(body);
      let decksText = `Number: ${decks[0].number}, Suit: ${decks[0].suit}`;
      res.render('index', {decks: decksText, error: null});
     })
    .catch(function (err) {
        res.render('index', {decks: null, error: 'Error, please try again'});
    });
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Poker Web App listening at http://%s:%s', host, port);
})
