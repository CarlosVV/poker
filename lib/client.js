let request = require('request-promise');
let Promise = require("bluebird");

function requestWithRetry(options, maxRetries, retryDelay, retry){
    maxRetries || (maxRetries = 3)
    retryDelay || (retryDelay = 1000)
    retry || (retry = 0)

    return (request (options))
      .promise()
      .catch (function(error) {
         if (++retry > maxRetries){
           throw error;
         }
         return Promise.delay (retryDelay)
          .then(function(){
              return requestWithRetry(options, maxRetries, retryDelay, retry);
          });
      });
}

exports.getDeck = function (urlApi) {
  let url = `${urlApi}`;
  let options = {
      uri: url,
      method: 'POST',
      headers: {
       'User-Agent': 'Poker-Web-App-Technical-Test-CValderrama'
      },
      simple: true,
      resolveWithFullResponse: false,
      json: false
  };

  let apiKey = null;

  let prom = requestWithRetry(options)
              .then(function(response) {
                console.log('response %s', response);
                apiKey =  response;
                return apiKey;
              })
              .error(function(error){
                apiKey = null;
              });
  console.log('prom: %s', prom);
  console.log('apiKey: %s', apiKey);
  return prom.then(function (apiKey) {return apiKey;});
};

exports.getDeal = function (urlApi, apiKey, deck) {
  let url = `${urlApi}/${apiKey}/deal/${deck}`;

  let options = {
      uri: url,
      headers: {
       'User-Agent': 'Poker-Web-App-Technical-Test-CValderrama'
      },
      simple: false,
      resolveWithFullResponse: true,
      json: true
  };

    let maxAttempts = 3;
    let attempts = 0;
    let decks = null;

    while(attempts < maxAttempts){
      console.log("getDeal - Attempt %s", attempts);
      rp(options)
        .then(function (response) {
           console.log("getDeal.statusCode: " + response.statusCode);
           console.log("getDeal %s", response);

           decks = response;
         })
        .catch(function (err) {
            console.log(err);
            decks = null;
        });

        if(decks !== null){
          break;
        }

        attempts = attempts + 1;
    }
    return decks;
  };


  // /npm i --no-optional
