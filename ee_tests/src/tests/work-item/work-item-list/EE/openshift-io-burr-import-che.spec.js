/**
 * POC test for automated UI tests for openshift.io
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

/* Actions to be performed by this EE Demo/Test - As suggested by Burr - June 2017
  https://vimeo.com/221033408
  Step 1) Login to openshift.io
  Step 2) In OSIO, create new space
  Step 3) In OSIO, add quickstart to space - Vert.X - accept all defaults
  Step 4) In OSIO, verify creation of pipeline and build. promote build to "run" project
  Step 5) In OSIO, create new workitem, type = bug, assign to current user, set status to “in progress”
  Step 6) In OSIO, create Che workspace for project 
  Step 7) In OSIO, open Che workspace for project
  Step 8) In Che editor, edit index.html to alter message displayed by Vert.X project
  Step 9) In Che terminal window, execute: mvn clean compile test
  Step 10) In Che, execute Junit test
  Step 11) In Che, run the Vert.X application
  Step 12) In Che terminal window, execute: curl localhost:8080/api/greeting?name=test
  Step 13) In Che, commit changes to git
  Step 14) In Che, execute git push
  Step 15) In github, verify code changes were saved
  Step 16) In OSIO, verify that github webhook fired and project pipeline is running
  Step 17) In OSIO, access Jenkins log
  Step 18) In Jenkins, verify that log shows the application has built and tests have run 
  Step 19) 1In Che, locate realtime analysis of bad dependency - ch.qos.logstack
  Step 20) In Che, verify that CVE is caught
  Step 21) In Jenkins, locate OSIO Analytics (Bayesian) in Jenkins log
  Step 22) In OSIO, verify that rollout to stage was successful
  Step 23) In OSIO, in “Applications” tab, verify project is successful on stage
  Step 24) In OpenShift console, verify project is running on stage
  Step 25) In OpenShift console, click on deployed application to access the app on stage
  Step 26) In OSIO, approve promotion to production
  Step 27) In OpenShift console, click on deployed application to access the app on production
  Step 28) In OSIO, under pipelines, select “Stack Reports”
  Step 29) In OSIO, verify contents of Stack Report Recommendations for unresolved CVE
  Step 30) In OSIO, log out
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
    testSupport = require('../testSupport'),
    constants = require("../constants");

/* TODO - convert this into a test parameter */
var GITHUB_NAME = browser.params.github.username;
const IMPORT_NAME = "vertxbasic";

describe('openshift.io End-to-End POC test - Scenario - IMPORT project - Run Che: ', function () {
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
    browser.restart();
  });

  /* Simple test for registered user */
  it("should perform Burr's demo - IMPORT project - Run Che", function() {
   
    /* Protractor must recreate its ExpectedConditions if the browser is restarted */
    until = protractor.ExpectedConditions;

    var username = testSupport.userEntityName(browser.params.login.user);    
    console.log ("Test for target URL: " + browser.params.target.url)

//    /* Cleanup - Delete the build config created by the test */
//    var process = require('child_process').execSync;
//    var result = process('sh ./local_cleanup_one.sh ' + username + ' ' + browser.params.oso.token + " " + IMPORT_NAME).toString();
//    console.log(result);

    /* Step 1) Login to openshift.io */
    OpenShiftIoDashboardPage = testSupport.loginCleanUpdate (page, browser.params.login.user, browser.params.login.password, constants.CLEAN_ALL );

    /* ----------------------------------------------------------*/
    /* Step 2) In OSIO, create new space */

    var spaceTime = testSupport.returnTime();
    OpenShiftIoSpaceHomePage = testSupport.createNewSpace (OpenShiftIoDashboardPage, spaceTime, browser.params.login.user, browser.params.login.password, browser.params.target.url);

    /* ----------------------------------------------------------*/
    /* Step 3) In OSIO, import quickstart to space - accept all defaults */

    testSupport.importProjectDefaults(OpenShiftIoSpaceHomePage, OpenShiftIoDashboardPage, IMPORT_NAME);

   /* ----------------------------------------------------------*/
   /*  Step 4) In OSIO, verify creation of pipeline and build. promote build to "run" project */

    /* ----------------------------------------------------------*/
    /* Step 5) In OSIO, create new workitem, type = bug, assign to current user, set status to “in progress” */
    /* TODO */

    /* Step 6) In OSIO, create Che workspace for project   */

    /* Start by creating a codebase for the newly created project */
    OpenShiftIoChePage = testSupport.createCodebaseImport (OpenShiftIoDashboardPage, browser.params.login.user, spaceTime, GITHUB_NAME, IMPORT_NAME);
    
    /* Switch to Che browser tab */
    browser.sleep(constants.LONG_WAIT);
    browser.getAllWindowHandles().then(function (handles) {

        console.log("Number of browser tabs = " + handles.length);
        if (handles.length == 1) {
          console.log ("ERROR - Che browser window did not open - see: https://github.com/openshiftio/openshift.io/issues/618");
          var process = require('child_process').execSync;
          var result = process('sh ./local_oc.sh ' + browser.params.login.user + ' ' + browser.params.oso.token + " che").toString();
          console.log(result);
        }

        /* Undocumented feature in Jasmine - adding a text string to the expect statement */
        expect(handles.length).toBe(2, "total of 2 browser tabs is expected");

        testSupport.switchToWindow (browser, 1);
        //browser.switchTo().window(handles[1]);
        browser.getCurrentUrl().then(function(url) {
            console.log("Che workspace URL = " + url);
        });
    });

    browser.sleep(constants.LONG_WAIT);
    browser.takeScreenshot().then(function (png) {
      testSupport.writeScreenShot(png, 'target/screenshots/' + spaceTime + '_1_import_che.png');
    });

    /* Look for the project in the Che navigator */
    OpenShiftIoChePage.projectRootByName(IMPORT_NAME).getText().then(function (text) { 
       console.log ('EE POC test - projectName = ' + text);
    });
    expect(OpenShiftIoChePage.projectRootByName(IMPORT_NAME).getText()).toBe(IMPORT_NAME);

   /* Take a screenshot if the test expect fails with a workaround to an issue with the Jasmine HTML reporter:
      https://github.com/Kenzitron/protractor-jasmine2-html-reporter/issues/59  */
      if (!expect(OpenShiftIoChePage.projectRootByName(IMPORT_NAME).getText()).toBe(IMPORT_NAME)) { 
      browser.takeScreenshot().then(function (png) {
         testSupport.writeScreenShot(png, 'target/screenshots/' + spaceTime + '_che_workspace_1.png');
      });
    }

    /* Switch back to the OSIO page */
    testSupport.switchToWindow (browser, 0);
    
    /* ----------------------------------------------------------*/
    /* Step 30) In OSIO, log out */
    testSupport.logoutUser(OpenShiftIoDashboardPage);

  });

});

