'use strict';
let frisby = require("frisby");
let token = process.env['OSIO_TOKEN']
let URL = process.env['targetURL']
let url;
// URL = 'https://recommender.api.openshift.io/api/v1/';
 


frisby.globalSetup({
  request: {
    headers: { 'Content-Type': 'application/json',
               'Accept': 'application/json',
               'Authorization' : 'Bearer ' +token             }
           }
});
class apiCalls {

  constructor() {
    if(URL=== undefined){
       url = 'https://recommender.api.openshift.io/api/v1/';
      }

    else {
       url = URL;
      }
  }

 GetComponentAnalysis (parameter) {
        var analytics = frisby.create('Connecting to REST API - endpoint :: ' + url +parameter);
        analytics.get(url + "component-analyses/" + parameter).expectStatus(200)
        return analytics;
 
  }
}

module.exports = apiCalls;
