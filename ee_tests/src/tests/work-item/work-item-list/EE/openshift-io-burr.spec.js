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
    testSupport = require('../testSupport'),
    constants = require("../constants");

describe('openshift.io End-to-End POC test - Scenario - Existing user: ', function () {
  var page, items, browserMode;

  /* Set up for each function */
  beforeEach(function () {
    testSupport.setBrowserMode('desktop');
    // Failed: Error while waiting for Protractor to sync with the page: "window.getAllAngularTestabilities is not a function"
    // http://stackoverflow.com/questions/38050626/angular-2-with-protractorjs-failed-error-while-waiting-for-protractor-to-sync-w 
    browser.ignoreSynchronization = true;
    page = new OpenShiftIoStartPage(browser.params.target.url);  
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 360000;
  });

  /* Tests must reset the browser so that the test can logout/login cleanly */
  afterEach(function () { 
    browser.restart();
  });

  /* Simple test for registered user */
  it("should perform Burr's demo", function() {
   
    /* Protractor must recreate its ExpectedConditions if the browser is restarted */
    until = protractor.ExpectedConditions;
    
    console.log ("Test for target URL: " + browser.params.target.url)

    /* ----------------------------------------------------------*/
    /* Step 1) Login to openshift.io */

    OpenShiftIoRHDLoginPage = page.clickLoginButton();
    OpenShiftIoGithubLoginPage = OpenShiftIoRHDLoginPage.clickGithubLoginButton();
    
    OpenShiftIoGithubLoginPage.clickGithubLoginField();
    OpenShiftIoGithubLoginPage.typeGithubLoginField(browser.params.login.user); 
    OpenShiftIoGithubLoginPage.clickGithubPassword();
    OpenShiftIoGithubLoginPage.typeGithubPassword(browser.params.login.password);   
    OpenShiftIoDashboardPage = OpenShiftIoGithubLoginPage.clickGithubLoginButton();

    /* Seeing a problem where login is failing on Centos CI */    
    OpenShiftIoGithubLoginPage.incorrectUsernameOrPassword.isPresent().then(function(result) {
      if ( result ) {
        console.log("UNEXPECTED ERROR - INCORRECT USERNAME OR PASSWORD ENTERED"); 
        console.log ("Username entered = " + browser.params.login.user);
      } else {
        //do nothing 
      }
    });

    /* This button appears after a large number of logins with the same account */
    OpenShiftIoGithubLoginPage.authorizeApplicationButton.isPresent().then(function(result) {
      if ( result ) {
        OpenShiftIoGithubLoginPage.clickAuthorizeApplicationButton();
      } else {
        //do nothing
      }
    });

    /* ----------------------------------------------------------*/
    /* Step 2) In OSIO, create new space */

    OpenShiftIoDashboardPage.clickHeaderDropDownToggle();
    OpenShiftIoDashboardPage.clickCreateSpaceUnderLeftNavigationBar();  

    var spaceTime = returnTime();
    OpenShiftIoDashboardPage.typeNewSpaceName((spaceTime));
    OpenShiftIoDashboardPage.typeDevProcess("Scenario Driven Planning");
    OpenShiftIoDashboardPage.clickCreateSpaceButton();   

    /* For the purposes of this test - ignore all 'toast' popup warnings */
    OpenShiftIoDashboardPage.waitForToastToClose();
    OpenShiftIoSpaceHomePage = OpenShiftIoDashboardPage.clickNoThanksButton();

    /* In the space home page, verify URL and end the test */
    browser.wait(until.urlContains('https://openshift.io/' + browser.params.login.user + '/'+ spaceTime), constants.WAIT);
    browser.wait(until.urlIs('https://openshift.io/' + browser.params.login.user + '/'+ spaceTime), constants.WAIT); 
    expect(browser.getCurrentUrl()).toEqual('https://openshift.io/' + browser.params.login.user + '/'+ spaceTime);

    browser.getCurrentUrl().then(function (text) { 
       console.log ('EE POC test - new space URL = ' + text);
    });

    /* ----------------------------------------------------------*/
    /* Step 3) In OSIO, add quickstart to space - Vert.X - accept all defaults */

    OpenShiftIoDashboardPage.waitForToastToClose();
    OpenShiftIoSpaceHomePage.clickPrimaryAddToSpaceButton();  
    OpenShiftIoSpaceHomePage.clickTechnologyStack();

    OpenShiftIoSpaceHomePage.clickQuickStartNextButton2()  // End of dialog page 1/5
    OpenShiftIoSpaceHomePage.clickQuickStartNextButton2()  // End of dialog page 2/5
    OpenShiftIoSpaceHomePage.clickQuickStartNextButton2()  // End of dialog page 3/5
    OpenShiftIoSpaceHomePage.clickQuickStartNextButton2()  // End of dialog page 4/5
    OpenShiftIoSpaceHomePage.clickQuickStartFinishButton2();

    OpenShiftIoSpaceHomePage.clickOkButton();

    /* Trap 'Application Generation Error' here - if found, fail test and exit */
    expect(OpenShiftIoDashboardPage.appGenerationError.isPresent()).toBe(false);
    OpenShiftIoDashboardPage.waitForToastToClose();

   /* ----------------------------------------------------------*/
   /*  Step 4) In OSIO, verify creation of pipeline and build. promote build to "run" project */

    /* Navigating thru the Plan/Create/Analyze tabs is not working in the UI - due to 
       Angular bug with Protractor? Navigate directly to the URL instead */
    // OpenShiftIoSpaceHomePage.clickHeaderAnalyze();
    browser.get("https://openshift.io/" + browser.params.login.user + "/" + spaceTime);
    
    OpenShiftIoPipelinePage = OpenShiftIoSpaceHomePage.clickPipelinesSectionTitle();  
    OpenShiftIoPipelinePage.pipelinesPage.getText().then(function(text){
    console.log("Pipelines page = " + text);

    /* Verify that only 1 build pipeline is created */
    /* https://github.com/fabric8-ui/fabric8-ui/issues/1707 */
    expect(OpenShiftIoPipelinePage.allPipelineByName(spaceTime).count()).toBe(1);

      /* May 9, 2017 - clicking on a pipeline fails due to this error:
      https://openshift.io/kleinhenz-1/osio-planner/plan/detail/682    *
      /* Example of expected text:
         testmay91494354476064 created a few seconds ago
         Source Repository: https://github.com/almightytest/testmay91494354476064.git
         -or- 
         No pipeline builds have run for testmay91494354476064.   */
//      expect(text).toContain("No pipeline builds have run for " + spaceTime);
      expect(text).toContain("Source Repository: https://github.com/" + browser.params.login.user + "/" + spaceTime + ".git");
    });

//    OpenShiftIoPipelinePage.clickInputRequiredButton();
    OpenShiftIoPipelinePage.clickInputRequiredByPipelineByName(spaceTime);

    OpenShiftIoPipelinePage.clickPromoteButton();

  /* ----------------------------------------------------------*/
  /* Step 5) In OSIO, create new workitem, type = bug, assign to current user, set status to “in progress”
     Step 6) In OSIO, create Che workspace for project [blocked by 1515]   */

    /* TODO - Create a workspace */

    /* Navigating thru the Plan/Create/Analyze tabs is not working in the UI - due to 
       Angular bug with Protractor? Navigate directly to the URL instead */
     //OpenShiftIoSpaceHomePage.clickHeaderAnalyze();

    /* Go to the Create page - https://openshift.io/almusertest1/testmay91494369460731/create  */
//    browser.get("https://openshift.io/almusertest1/" + spaceTime + "/create");
    
    /* Locate the first codebase */
//    OpenShiftIoSpaceHomePage.clickFirstCodebase();

    /* TODO - Verify the workspace in Che - TODO - Create a page object modelk for the Che dashboard */
//    browser.get("https://che-almusertest1-che.8a09.starter-us-east-2.openshiftapps.com/dashboard/#/");

    /* ----------------------------------------------------------*/
    /* Step 30) In OSIO, log out */

    /* For the purposes of this test - ignore all 'toast' popup warnings */
    OpenShiftIoDashboardPage.waitForToastToClose();

    OpenShiftIoDashboardPage.clickrightNavigationBar();
    OpenShiftIoDashboardPage.clickLogOut();
  });

});

  /* Get system time in seconds since 1970 */
  var returnTime = function () {

    var month = new Array();
    month[0] = "jan";
    month[1] = "feb";
    month[2] = "mar";
    month[3] = "apr";
    month[4] = "may";
    month[5] = "jun";
    month[6] = "jul";
    month[7] = "aug";
    month[8] = "sep";
    month[9] = "oct";
    month[10] = "nov";
    month[11] = "dec";

    var d = new Date();
    var m = month[d.getMonth()];
    var day = d.getDate(); 
    var n = d.getTime();
 
    console.log ("EE POC test - Creating space: " + m + day.toString() + n.toString());
    return "test" +  m + day.toString() + n.toString();
  }
