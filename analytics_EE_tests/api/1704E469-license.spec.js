/**
 * POC test for ALMighty REST API 
 * See: http://frisbyjs.com/
 * @author naina-verma
 *
 * Prerequisites:
 * npm install --save-dev frisby
 * npm install -g jasmine-node
 * jasmine-node test1.spec.js  --config targetURL https://recommender.api.openshift.io/api/v1/
 *
 * Run by: jasmine-node <script name>
 *
 * TODO - Generate login token during test 
 */

'use strict';

var frisby = require("frisby");
var testREST = require('./apiCalls');
describe('11704E469-license Test', function () {
  var page, browserMode;
  page = new testREST();
  beforeEach(function () {
   
  });

  it('Test-1704E469-02 :: Show declared license information for vert.x core" :: maven/io.vertx:vertx-core/3.4.1', function() {
     var expectedReults = ["Apache 2.0","EPL 1.0"]
     var response=page.GetComponentAnalysis('maven/io.vertx:vertx-core/3.4.1')  
     .afterJSON(function (body) {
       for (var list=0;list <expectedReults.length ;list++){
            expect(body.result.data[0].version.licenses).toContain(expectedReults[list])
       }
    })
    response.toss(); 
  });

  it('Test-1704E469-03 :: Show declared license information for vert.x Web" :: maven/io.vertx:vertx-web/3.4.1', function() {
     var expectedReults = ["Apache 2.0","EPL 1.0"]
     var response=page.GetComponentAnalysis('maven/io.vertx:vertx-web/3.4.1')  
     .afterJSON(function (body) {
     for (var list=0;list <expectedReults.length ;list++){
            expect(body.result.data[0].version.licenses).toContain(expectedReults[list])
       }
    })
    response.toss(); 
  });


  it('Test-1704E469-04 :: Show declared license information for sping core :: maven/org.springframework:spring-core/4.3.3.RELEASE', function() {
     var expectedReults = ["Apache 2.0"]
     var response=page.GetComponentAnalysis('maven/org.springframework:spring-core/4.3.3.RELEASE')  
     .afterJSON(function (body) {
      for (var list=0;list <expectedReults.length ;list++){
            expect(body.result.data[0].version.licenses).toContain(expectedReults[list])
       }
    })
    response.toss(); 
  });

});
