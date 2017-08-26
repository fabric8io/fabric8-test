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
    OpenShiftIoGithubLoginPage = require('../page-objects/openshift-io-github-login.page'),
    OpenShiftIoDashboardPage = require('../page-objects/openshift-io-dashboard.page'),
    OpenShiftIoSpaceHomePage = require('../page-objects/openshift-io-spacehome.page'),
    OpenShiftIoRegistrationPage = require('../page-objects/openshift-io-registration.page'),
    OpenShiftIoPipelinePage = require('../page-objects/openshift-io-pipeline.page'),
    OpenShiftIoCodebasePage = require('../page-objects/openshift-io-codebase.page'),
    OpenShiftIoChePage = require('../page-objects/openshift-io-che.page'),
    testSupport = require('../testSupport'),
    constants = require("../constants");

/* TODO - convert this into a test parameter */
const GITHUB_NAME = "osiotestmachine";

describe('openshift.io End-to-End POC test - Scenario - CREATE project - Run Pipeline: ', function () {
  var page, items, browserMode;

  /* Set up for each function */
  beforeEach(function () {
    testSupport.setBrowserMode('desktop');
    // Failed: Error while waiting for Protractor to sync with the page: "window.getAllAngularTestabilities is not a function"
    // http://stackoverflow.com/questions/38050626/angular-2-with-protractorjs-failed-error-while-waiting-for-protractor-to-sync-w 
    browser.ignoreSynchronization = true;
    page = new OpenShiftIoStartPage(browser.params.target.url);  
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 9000000;   /* 15 minutes */
  });
  
  /* Tests must reset the browser so that the test can logout/login cleanly */
  afterEach(function () { 
    browser.restart();
  });

  /* Quickstart test */
  it("should perform Quickstart test - CREATE project - Run Pipeline - Vert.X Basic", function() {       
    runTheTest (page, "Vert.x - Basic");
  });

  /* Quickstart test */
  it("should perform Quickstart test - CREATE project - Run Pipeline - Vert.x - ConfigMap", function() {       
    runTheTest (page, constants.VERTX_CONFIGMAP);
  });

  /* Quickstart test */
  it("should perform Quickstart test - CREATE project - Run Pipeline - Spring Boot - Basic", function() {       
    runTheTest (page, constants.SPRINGBOOT_BASIC);
  });

  /* Quickstart test */
  it("should perform Quickstart test - CREATE project - Run Pipeline - Vert.x Health Check Example", function() {       
    runTheTest (page, constants.VERTX_HEALTH_CHECK);
  });

  /* Quickstart test */
  it("should perform Quickstart test - CREATE project - Run Pipeline - Spring Boot - Health Check", function() {       
    runTheTest (page, constants.SPRINGBOOT_HEALTH_CHECK);
  });

});


  /* Run the test */
  var runTheTest = function (page, quickStartName) {
      
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
    /* Step 3) In OSIO, add quickstart to space  */

    testSupport.createQuickstartByNameDefaults (OpenShiftIoSpaceHomePage, OpenShiftIoDashboardPage, quickStartName);
   
   /* ----------------------------------------------------------*/
   /*  Step 4) In OSIO, verify creation of pipeline and build. promote build to "run" project */

    /* Verify that Jenkins is still up and running */
    /* See issue: https://github.com/openshiftio/openshift.io/issues/595#issuecomment-323123432  */
    console.log ("verify that Jenkins pod is still running");
    browser.sleep(constants.LONG_WAIT);
    OpenShiftIoDashboardPage.clickStatusIcon();
    expect(OpenShiftIoDashboardPage.jenkinsStatusPoweredOn.isPresent()).toBe(true);

    /* Navigating thru the Plan/Create/Analyze tabs is not working in the UI - due to 
       Angular bug with Protractor? Navigate directly to the URL instead */
    // OpenShiftIoSpaceHomePage.clickHeaderAnalyze();
    browser.get(browser.params.target.url + "/" + browser.params.login.user + "/" + spaceTime);
    OpenShiftIoPipelinePage = OpenShiftIoSpaceHomePage.clickPipelinesSectionTitle();  

    /* Verify that only 1 build pipeline is created - this test was added in response to this bug:
    /* https://github.com/fabric8-ui/fabric8-ui/issues/1707 */
    browser.wait(until.elementToBeClickable(OpenShiftIoPipelinePage.pipelineByName(spaceTime)), constants.WAIT, 'Failed to find PipelineByName');
    console.log("Verify that only one pipeline is created - https://github.com/fabric8-ui/fabric8-ui/issues/1707");
    expect(OpenShiftIoPipelinePage.allPipelineByName(spaceTime).count()).toBe(1);

    OpenShiftIoPipelinePage.pipelinesPage.getText().then(function(text){
    console.log("Pipelines page contents = " + text);

      /* Verify that an error has not prevented the build from being started */
      console.log ("Verify that error indicating that no pipeline builds have been run is not found");
      expect(text).not.toContain("No pipeline builds have run for");

      /* Verify that the source repo is referenced */
      console.log ("Verify that error source repository is displayed");
      expect(text).toContain("Source Repository: https://github.com/" + GITHUB_NAME + "/" + spaceTime + ".git");
    });

    /* If the input require buttons are not displayed, the build has either failed or the build pipeline
       is not being displayed - see: https://github.com/openshiftio/openshift.io/issues/431   */
    console.log("Verify that pipeline is displayed - https://github.com/openshiftio/openshift.io/issues/431");
    browser.wait(until.elementToBeClickable(OpenShiftIoPipelinePage.pipelineByName(spaceTime)), constants.WAIT, 'Failed to find PipelineByName');
   
    /* Seeing intermittent issues here - take a screenshot to debug - sometime pipeline is never created */
    browser.sleep(constants.LONGER_WAIT);
    browser.takeScreenshot().then(function (png) {
      testSupport.writeScreenShot(png, 'target/screenshots/' + spaceTime + '_1_pipeline_promote.png');
    });

    browser.wait(until.presenceOf(OpenShiftIoPipelinePage.inputRequiredByPipelineByName(spaceTime)), constants.LONGEST_WAIT, 'Failed to find inputRequiredByPipelineByName');
    expect(OpenShiftIoPipelinePage.inputRequiredByPipelineByName(spaceTime).isPresent()).toBe(true);

    browser.takeScreenshot().then(function (png) {
      testSupport.writeScreenShot(png, 'target/screenshots/' + spaceTime + '_2_pipeline_promote.png');
    });

    OpenShiftIoPipelinePage.clickInputRequiredByPipelineByName(spaceTime);
    OpenShiftIoPipelinePage.clickPromoteButton();

    /* ----------------------------------------------------------*/
    /* Step 5) In OSIO, create new workitem, type = bug, assign to current user, set status to “in progress” */
    /* TODO */

    /* Step 6) In OSIO, create Che workspace for project   */

    /* ----------------------------------------------------------*/
    /* Step 30) In OSIO, log out */
    testSupport.logoutUser(OpenShiftIoDashboardPage);

    
  }
