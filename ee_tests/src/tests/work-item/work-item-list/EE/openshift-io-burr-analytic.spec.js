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

/* Actions to be performed by this EE Demo/Test - As suggested by Pavel T. August - June 2017


We use the following steps to check the basic stack analysis functionality:

1       Login to openshift.io with username/password
2       Open user Profile page and click on "Update Profile"
3       From "Edit Profile", click on "Update Tenant". Wait for 10 minutes
4       Click on "Create Space" and provide name
5       Select "Create a New Quickstart project"
6       Select technology stack "Vert.x - Basic"
7       Select Build pipeline strategy "Release"
8       Finish space creation with other default options
9       Click on pipelines link from the space dashboard
10      Build succeeds
11      Stack Reports link exists
12      Wait for 5 minutes
13      Clicking on stack reports shows recommendations and stack data
14      Create workitem on one of the recommendations
15      Verify that the planner workitem is created for the recommendation
16      Go to the newly created space's dashboard
17      Verify that the recommendations appear on the space dashboard

Actually most of these steps are already part of the workshop script, so only
last 6 steps are new.

Cheers,
Pavel
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
    OpenShiftProfilePage = require('../page-objects/openshift-io-profile.page'),
    OpenShiftUpdateProfilePage = require('../page-objects/openshift-io-update-profile.page'),
    OpenShiftIoCleanTenantPage = require('../page-objects/openshift-io-clean-tenant.page'),
    testSupport = require('../testSupport'),
    constants = require("../constants");

/* TODO - convert this into a test parameter */
const GITHUB_NAME = "osiotestmachine";

describe('openshift.io End-to-End POC test - Scenario - CREATE project - Verify Analytic report: ', function () {
  var page, items, browserMode;

  /* Set up for each function */
  beforeEach(function () {
    testSupport.setBrowserMode('desktop');
    // Failed: Error while waiting for Protractor to sync with the page: "window.getAllAngularTestabilities is not a function"
    // http://stackoverflow.com/questions/38050626/angular-2-with-protractorjs-failed-error-while-waiting-for-protractor-to-sync-w 
    browser.ignoreSynchronization = true;
    page = new OpenShiftIoStartPage(browser.params.target.url);  
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000000;   /* 10 minutes */
  });
  
  /* Tests must reset the browser so that the test can logout/login cleanly */
  afterEach(function () { 
    browser.restart();
  });

  /* Simple test for registered user */
  it("should perform Burr's demo - CREATE project - Verify Analytic report", function() {

    /* Protractor must recreate its ExpectedConditions if the browser is restarted */
    until = protractor.ExpectedConditions;
    
    console.log ("Test for target URL: " + browser.params.target.url)

    /* ----------------------------------------------------------*/
    /* Step 1) Login to openshift.io */
    OpenShiftIoDashboardPage = testSupport.loginCleanUpdate (page, browser.params.login.user, browser.params.login.password, constants.CLEAN_ALL );

    /* ----------------------------------------------------------*/
    /* Step 2) In OSIO, create new space */

    var spaceTime = testSupport.returnTime();
    var username = testSupport.userEntityName(browser.params.login.user);
//    OpenShiftIoSpaceHomePage = testSupport.createNewSpace (OpenShiftIoDashboardPage, spaceTime, username, browser.params.login.password, browser.params.target.url);
    OpenShiftIoSpaceHomePage = testSupport.createNewSpace (OpenShiftIoDashboardPage, spaceTime, browser.params.login.user, browser.params.login.password, browser.params.target.url);


    /* ----------------------------------------------------------*/
    /* Step 3) In OSIO, add quickstart to space - Vert.X - accept all defaults */

    testSupport.createQuickstartDefaults (OpenShiftIoSpaceHomePage, OpenShiftIoDashboardPage);  
    
    
    /* Verify that Jenkins is still up and running */
    /* See issue: https://github.com/openshiftio/openshift.io/issues/595#issuecomment-323123432  */
    console.log ("verify that Jenkins pod is still running");
    browser.sleep(constants.LONG_WAIT);
    OpenShiftIoDashboardPage.clickStatusIcon();
    expect(OpenShiftIoDashboardPage.jenkinsStatusPoweredOn.isPresent()).toBe(true);

    /* Navigating thru the Plan/Create/Analyze tabs is not working in the UI - due to 
       Angular bug with Protractor? Navigate directly to the URL instead */
    // OpenShiftIoSpaceHomePage.clickHeaderAnalyze();
    browser.get(browser.params.target.url + "/" + username + "/" + spaceTime);

    OpenShiftIoPipelinePage = OpenShiftIoSpaceHomePage.clickPipelinesSectionTitle();  

    /* Verify that only 1 build pipeline is created - this test was added in response to this bug:
    /* https://github.com/fabric8-ui/fabric8-ui/issues/1707 */
    browser.wait(until.elementToBeClickable(OpenShiftIoPipelinePage.pipelineByName(spaceTime)), constants.WAIT, 'Failed to find PipelineByName - see: https://github.com/openshiftio/openshift.io/issues/595');
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
   /*  Step 4) In OSIO, verify creation of analytic report */
    /* TODO */


        /* Return to the account home page */
        OpenShiftIoDashboardPage.clickHeaderDropDownToggle();
        browser.sleep(constants.WAIT);
        OpenShiftIoDashboardPage.clickAccountHomeUnderLeftNavigationBar();
        browser.sleep(constants.LONGEST_WAIT);

//        OpenShiftIoDashboardPage.clickRecentSpaceByName (spaceTime);
        


    

    /* ----------------------------------------------------------*/
    /* Step 30) In OSIO, log out */
    testSupport.logoutUser(OpenShiftIoDashboardPage);

  });

});
