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

describe('openshift.io End-to-End POC test - Scenario - CREATE project - Run Che: ', function () {
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
  it("should perform Burr's demo - CREATE project - Create Che Worksdpace, Run Quickstart in Che", function() {

    /* Protractor must recreate its ExpectedConditions if the browser is restarted */
    until = protractor.ExpectedConditions;
    
    console.log ("Test for target URL: " + browser.params.target.url)

    /* Step 1) Login to openshift.io */
    OpenShiftIoDashboardPage = testSupport.loginCleanUpdate (page, browser.params.login.user, browser.params.login.password, constants.CLEAN_ALL );
    testSupport.cleanEnvironment();

    /* Step 2) In OSIO, create new space */
    var spaceTime = testSupport.returnTime();
    var username = testSupport.userEntityName(browser.params.login.user);
    OpenShiftIoSpaceHomePage = testSupport.createNewSpace (OpenShiftIoDashboardPage, spaceTime, username, browser.params.login.password, browser.params.target.url);

    /* Step 3) In OSIO, add quickstart to space - Vert.X - accept all defaults */
    testSupport.createQuickstartDefaults (OpenShiftIoSpaceHomePage, OpenShiftIoDashboardPage);    

    /* Step 4) In OSIO, create Che workspace for project   */
    OpenShiftIoChePage = testSupport.createCodebase (OpenShiftIoDashboardPage, username, spaceTime, GITHUB_NAME);
    testSupport.createCheWorkspace (OpenShiftIoChePage, spaceTime, username, browser.params.oso.token);
    
    /* Verify that the project was created and is available in the Che workspace */
    
    /* Take a screenshot if the test expect fails with a workaround to an issue with the Jasmine HTML reporter:
       https://github.com/Kenzitron/protractor-jasmine2-html-reporter/issues/59  */
    if (!expect(OpenShiftIoChePage.projectRootByName(spaceTime).getText()).toBe(spaceTime)) { 
      browser.takeScreenshot().then(function (png) {
        testSupport.writeScreenShot(png, 'target/screenshots/' + spaceTime + '_che_workspace_1.png');
      });
    }

    /* Step 5) In Che, Run the quickstart - and verify that it was successful */
    testSupport.runQuickstart(OpenShiftIoChePage,spaceTime);

    browser.takeScreenshot().then(function (png) {
      testSupport.writeScreenShot(png, 'target/screenshots/' + spaceTime + '_che_workspace_run_results.png');
    });

    browser.wait(until.textToBePresentInElement(OpenShiftIoChePage.bottomPanelCommandConsoleLines, 'Succeeded in deploying verticle'), constants.LONG_WAIT);
    expect(OpenShiftIoChePage.bottomPanelCommandConsoleLines.getText()).toContain("Succeeded in deploying verticle");

    /* Switch back to the OSIO page */
    testSupport.switchToWindow (browser, 0);

    /* In OSIO, log out */
    testSupport.logoutUser(OpenShiftIoDashboardPage);

  });

});
