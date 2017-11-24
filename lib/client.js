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

  return requestWithRetry(options)
              .then(function(response) {
                return response;
              })
              .error(function(error){
                apiKey = null;
              });
};

exports.getDeal = function (urlApi, apiKey, deck) {
  let url = `${urlApi}/${apiKey}/deal/${deck}`;

  let options = {
      uri: url,
      headers: {
       'User-Agent': 'Poker-Web-App-Technical-Test-CValderrama'
      },
      simple: true,
      resolveWithFullResponse: false,
      json: true
  };

  return requestWithRetry(options)
                .then(function(response) {
                  return response;
                })
                .error(function(error){
                  return null;
                });
  };


  // /npm i --no-optional
