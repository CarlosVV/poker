'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const rp = require('request-promise');
const client = require('./lib/client');

require('ssl-root-cas').inject();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let urlApi = 'https://services.comparaonline.com/dealer/deck';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('morgan')('dev'));
app.set('view engine', 'ejs');

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'c592dc58-eaaf-48eb-aae9-572d5fb84280',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));

app.get('/', function (req, res) {

  client.getDeck(urlApi)
  .then(function(response) {
      let apiKey = response;
      console.log("apiKey = " + apiKey);
      if(apiKey !== null){
        req.session.token = apiKey;
        res.render('index', {decks: null, error: ''});
      }
      else{
        res.render('index', {decks: null, error: 'Error,  please try again'});
      }
  });
})

app.post('/', function (req, res) {

  let apiKey = req.session.token;
  let deal = 5;
  let decks = client.getDeal(urlApi, apiKey, deal).then(function(response) {
      let decks = response;
      console.log(decks);
      if(decks !== null){
        let decksText = `Number: ${decks[0].number}, Suit: ${decks[0].suit}`;
        res.render('index', {decks: decksText, error: null});
      }
      else {
        res.render('index', {decks: null, error: 'Error, please try again'});
      }
  });
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Poker Web App listening at http://%s:%s', host, port);
})
