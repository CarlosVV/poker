'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const rp = require('request-promise');
//require('ssl-root-cas').inject();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
  //if(typeof req.session.token == 'undefined'){
  let url = `https://services.comparaonline.com/dealer/deck`
  request({method:'POST', uri: url}, function (err, response, body)
  {
    //console.log(err);
    //console.log(body);
    if(err){
      res.render('index', {decks: null, error: 'Error,  please try again'});
    }
    else
    {
      let apiKey = body;
      req.session.token = apiKey;

      if(typeof req.session.token == 'undefined')
      {
        res.render('index', {decks: null,  error: 'Error, please try again'});
      }
      else
      {
        res.render('index');
      }
     }
  });
  //}
})

app.post('/', function (req, res) {
  //console.log(req.body.option);
  let apiKey = req.session.token;
  //console.log(apiKey);
  //req.session.token = apiKey;
  let deck = 5;
  let url = `https://services.comparaonline.com/dealer/deck/${apiKey}/deal/${deck}`;
  //console.log(url);
  request(url, function (err, response, body) {
    if(err){
      res.render('index', {decks: null, error: 'Error, please try again'});
    } else {
      //if(err)
      let result = JSON.parse(body);
      if(result.statusCode === 200){
        let decksText = `Number: ${decks[0].number}, Suit: ${decks[0].suit}`;
        res.render('index', {decks: decksText, error: null});
      }
      if(decks == undefined){
        res.render('index', {decks: null, error: 'Error, please try again'});
      } else {
        //console.log(decks);

      }
    }
  });
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
})
