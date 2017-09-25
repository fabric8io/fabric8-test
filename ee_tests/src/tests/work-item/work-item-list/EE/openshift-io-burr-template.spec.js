 /**
 * Template test for automated UI tests for openshift.io
 *  
 * Note on screen resolutions - See: http://www.itunesextractor.com/iphone-ipad-resolution.html
 * Tests will be run on these resolutions:
 * - iPhone6s - 375x667
 * - iPad air - 768x1024
 * - Desktop -  1920x1080
 * 
 * beforeEach will set the mode to phone. Any tests requiring a different resolution will must set explicitly. 
 *  * 
 * @author ldimaggi, bsutter
 */

var until = protractor.ExpectedConditions;

var OpenShiftIoStartPage = require('../page-objects/openshift-io-start.page'),
    OpenShiftIoRHDLoginPage = require('../page-objects/openshift-io-RHD-login.page'),
    OpenShiftIoDashboardPage = require('../page-objects/openshift-io-dashboard.page'),
    OpenShiftIoSpaceHomePage = require('../page-objects/openshift-io-spacehome.page'),
    OpenShiftIoRegistrationPage = require('../page-objects/openshift-io-registration.page'),
    OpenShiftIoPipelinePage = require('../page-objects/openshift-io-pipeline.page'),
    OpenShiftIoCodebasePage = require('../page-objects/openshift-io-codebase.page'),
    OpenShiftIoChePage = require('../page-objects/openshift-io-che.page'),
    OpenShiftProfilePage = require('../page-objects/openshift-io-profile.page'),
    OpenShiftUpdateProfilePage = require('../page-objects/openshift-io-update-profile.page'),
    OpenShiftIoCleanTenantPage = require('../page-objects/openshift-io-clean-tenant.page'),
    testSupport = require('../testSupport'),
    constants = require("../constants");

/* TODO - convert this into a test parameter */
var GITHUB_NAME = browser.params.github.username;

describe('openshift.io End-to-End POC test - Scenario - Template: ', function () {
  var page, items, browserMode;

  /* Set up for each function */
  beforeEach(function () {
    testSupport.setBrowserMode('desktop');
    // Failed: Error while waiting for Protractor to sync with the page: "window.getAllAngularTestabilities is not a function"
    // http://stackoverflow.com/questions/38050626/angular-2-with-protractorjs-failed-error-while-waiting-for-protractor-to-sync-w 
    browser.ignoreSynchronization = true;
    page = new OpenShiftIoStartPage(browser.params.target.url);  
    jasmine.DEFAULT_TIMEOUT_INTERVAL = constants.JASMINE_TIMEOUT;
  });
  
  /* Tests must reset the browser so that the test can logout/login cleanly */
  afterEach(function () { 
    //browser.restart();
  });

  /* Simple test for registered user */
  it("should perform Burr's demo - CREATE project - Run Test", function() {

    /* Protractor must recreate its ExpectedConditions if the browser is restarted */
    until = protractor.ExpectedConditions;    
    console.log ("Test for target URL: " + browser.params.target.url)

    /* ----------------------------------------------------------*/
    /* Step 1) Login to openshift.io */
    OpenShiftIoDashboardPage = testSupport.loginCleanUpdate (page, browser.params.login.user, browser.params.login.password );

    /* ----------------------------------------------------------*/
    /* Step 2) In OSIO, create new space */

    var spaceTime = testSupport.returnTime();
    OpenShiftIoSpaceHomePage = testSupport.createNewSpace (OpenShiftIoDashboardPage, spaceTime, browser.params.login.user, browser.params.login.password, browser.params.target.url);

    /* ----------------------------------------------------------*/
    /* Step 3) Add your tests here */

    browser.wait(until.presenceOf(OpenShiftIoPipelinePage.inputRequiredByPipelineByName(spaceTime)), constants.LONGEST_WAIT, 'Failed to find inputRequiredByPipelineByName').then(null, function(err) {
      console.error("Failed to find inputRequiredByPipelineByName: " + err);

      /* Dump the Jenkins pod log to stdout */
      var process = require('child_process').execSync;
      var result = process('sh ./local_oc.sh ' + username + ' ' + browser.params.oso.token + " jenkins").toString();
      console.log(result);

      /* Save a screenshot */
      browser.takeScreenshot().then(function (png) {
        testSupport.writeScreenShot(png, 'target/screenshots/' + spaceTime + '_pipeline_promote_fail.png');
        throw err;
      });
    });


    /* ----------------------------------------------------------*/
    /* Step NN) In OSIO, log out */
    testSupport.logoutUser(OpenShiftIoDashboardPage);

  });

});
