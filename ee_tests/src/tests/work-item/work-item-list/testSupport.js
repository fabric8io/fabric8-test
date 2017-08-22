/**
 * Support module for automated UI tests for ALMighty
 * 
 * Ref: https://www.sitepoint.com/understanding-module-exports-exports-node-js/
 * 
 * @author ldimaggi
 */

module.exports = {

/**
 * Set the browser window size
 * 
 * Note on screen resolutions - See: http://www.itunesextractor.com/iphone-ipad-resolution.html
 * Tests will be run on these resolutions:
 * - iPhone6s - 375x667 (note: tests on chrome+firefox fail unless width >= 400)
 * - iPad air - 768x1024
 * - Desktop -  1920x1080
 * 
 */
  setBrowserMode: function(browserModeStr) {
    switch (browserModeStr) {
	  case 'phone':
	    browser.driver.manage().window().setSize(430, 667);
      break;
	  case 'tablet':
        browser.driver.manage().window().setSize(768, 1024);
      break;
      case 'desktop':
        browser.driver.manage().window().setSize(1920, 1080);
    } 
  },

/**
 * Set the windows in which the tests will run 
 */
  setTestSpace: function (page) {
    page.clickOnSpaceDropdown();
    page.selectSpaceDropDownValue("1");
  },

  /** 
  * Write screenshot to file 
  * Example usage:
  *    browser.takeScreenshot().then(function (png) {
  *      testSupport.writeScreenShot(png, 'exception.png');
  *  });
  * 
  * Ref: http://blog.ng-book.com/taking-screenshots-with-protractor/
  */ 
  writeScreenShot: function(data, filename) {
    var fs = require('fs');
    var stream = fs.createWriteStream(filename);
    stream.write(new Buffer(data, 'base64'));
    stream.end();
  },

/*
 * Custom wait function - determine if ANY text appears in a field's value
 */
waitForText: function (elementFinder) {
    return elementFinder.getAttribute("value").then(function(text) {
//      console.log("text = " + text);
      return text !== "";  // could also be replaced with "return !!text;"
    });
  },

  /* 
  * Get system time in seconds since 1970 
  */
  returnTime: function () {

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
  },
  
  /* 
  * Log user into OSIO, clean user account, update tenant 
  */
  loginCleanUpdate: function (page, username, password) {

  var OpenShiftIoStartPage = require('./page-objects/openshift-io-start.page'),
    OpenShiftIoRHDLoginPage = require('./page-objects/openshift-io-RHD-login.page'),
    OpenShiftIoGithubLoginPage = require('./page-objects/openshift-io-github-login.page'),
    OpenShiftIoDashboardPage = require('./page-objects/openshift-io-dashboard.page'),
    OpenShiftIoSpaceHomePage = require('./page-objects/openshift-io-spacehome.page'),
    OpenShiftIoRegistrationPage = require('./page-objects/openshift-io-registration.page'),
    OpenShiftIoPipelinePage = require('./page-objects/openshift-io-pipeline.page'),
    OpenShiftIoCodebasePage = require('./page-objects/openshift-io-codebase.page'),
    OpenShiftIoChePage = require('./page-objects/openshift-io-che.page'),
    OpenShiftProfilePage = require('./page-objects/openshift-io-profile.page'),
    OpenShiftUpdateProfilePage = require('./page-objects/openshift-io-update-profile.page'),
    OpenShiftIoCleanTenantPage = require('./page-objects/openshift-io-clean-tenant.page'),
    constants = require("./constants");

    var until = protractor.ExpectedConditions;

 OpenShiftIoRHDLoginPage = page.clickLoginButton();
    OpenShiftIoRHDLoginPage.clickRhdUsernameField();
    OpenShiftIoRHDLoginPage.typeRhdUsernameField(browser.params.login.user);
    OpenShiftIoRHDLoginPage.clickRhdPasswordField();
    OpenShiftIoRHDLoginPage.typeRhdPasswordField(browser.params.login.password);
    OpenShiftIoDashboardPage = OpenShiftIoRHDLoginPage.clickRhdLoginButton();

    /* Clean the user account in OSO with the new clean tenant button */
    OpenShiftIoDashboardPage.clickrightNavigationBar();

    /* Access the profile page */
    OpenShiftProfilePage = OpenShiftIoDashboardPage.clickProfile();

    /* Access the update profile page */
    OpenShiftUpdateProfilePage = OpenShiftProfilePage.clickupdateProfileButton();

    /* Access the clean the tenant page */
    OpenShiftIoCleanTenantPage = OpenShiftUpdateProfilePage.clickCleanTenantButton();
    OpenShiftIoCleanTenantPage.clickEraseOsioEnvButton();
    OpenShiftIoCleanTenantPage.clickEraseOsioEnvUsername();
    OpenShiftIoCleanTenantPage.typeEraseOsioEnvUsername(browser.params.login.user);
    OpenShiftIoCleanTenantPage.clickConfirmEraseOsioEnvButton();

    /* Return to the account home page */
    OpenShiftIoDashboardPage.clickHeaderDropDownToggle();
    browser.sleep(constants.WAIT);
    OpenShiftIoDashboardPage.clickAccountHomeUnderLeftNavigationBar();
    
    /* The user's account is cleaned before the test runs. Th etest must now Update the user's tenant, and
       wait until Che and Jenkins pods are running before starting the test. */
    OpenShiftIoDashboardPage.clickrightNavigationBar();

//    OpenShiftIoDashboardPage.clickProfile();
//    OpenShiftIoDashboardPage.clickupdateProfileButton();    
//    OpenShiftIoDashboardPage.clickupdateTenantButton();

    /* Access the profile page */
    OpenShiftProfilePage = OpenShiftIoDashboardPage.clickProfile();

    /* Access the update profile page */
    OpenShiftUpdateProfilePage = OpenShiftProfilePage.clickupdateProfileButton();

    /* Update the tenant */
    OpenShiftUpdateProfilePage.clickupdateTenantButton();

    OpenShiftIoDashboardPage.clickHeaderDropDownToggle();
    browser.sleep(constants.WAIT);
    OpenShiftIoDashboardPage.clickAccountHomeUnderLeftNavigationBar();

    /* Wait until the Jenkins status icon indicates that the Jenkins pod is running. */
    OpenShiftIoDashboardPage.clickStatusIcon();
    browser.wait(until.presenceOf(OpenShiftIoDashboardPage.cheStatusPoweredOn), constants.LONGEST_WAIT);
    browser.wait(until.presenceOf(OpenShiftIoDashboardPage.jenkinsStatusPoweredOn), constants.LONGEST_WAIT);
    browser.sleep(constants.LONG_WAIT);

    return OpenShiftIoDashboardPage;

  },





/*
 * Create fixed length string - used to generate large strings
 */
generateString: function (size, newlines) {
  var sourceString128 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()\|;:',./<>?`~Ω≈ç√∫˜µ≤≥÷åß∂ƒ©˙∆˚¬…æœ∑´®†¥¨ˆøπ¡™£¢∞§¶•ªº–≠";
  var retString = "";
  var counter = size / 128;
  if (counter < 1) {
    counter = 1;
  } 
  for (var i = 0; i < counter; i++) {
    retString += sourceString128;
    if (newlines) {
      retString += "\n";
    }
  }
  // console.log ("return string ="  + retString);
  return retString;
}


};
