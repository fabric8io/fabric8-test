'use strict';

/*
 * fabric8 on OpenShift Login Page
 */

var testSupport = require('../testSupport'),
    constants = require("../constants");

var until = protractor.ExpectedConditions;

class OpenShiftIoF8OSLoginPage {

  constructor() {
  };

  doLogin(browser) {
    console.log("Processing OpenShiftIoF8OSLoginPage");

    var platform = testSupport.targetPlatform();
    if ("fabric8-openshift" === platform) {
      this.clickOpenshiftflowLoginButton();
    } else {
      this.clickGithubLoginButton();
    }
  }


  get githubLoginButton () {
     return element(by.id("zocial-github"));
  }

  clickGithubLoginButton() {
    var OpenShiftIoGettingStartedPage = require('../page-objects/openshift-io-gettingstarted.page'),
            OpenShiftIoGithubLoginPage = require('../page-objects/openshift-io-github-login.page');

    browser.wait(until.presenceOf(this.githubLoginButton), constants.WAIT, 'Failed to find github login');
    this.githubLoginButton.click().then(function () {
      console.log("OpenShiftIoF8OSLoginPage - clicked element:githubLoginButton");

      var nextCallback = function () {
        var nextPage = new OpenShiftIoGettingStartedPage();
        nextPage.doLogin(browser, null);
      };

      var nextPage = new OpenShiftIoGithubLoginPage();
      nextPage.doLogin(browser, nextCallback);
    });
  }

  get openshiftLoginButton () {
     return element(by.id("zocial-openshift-v3"));
  }
  clickOpenshiftflowLoginButton () {
    var OpenShiftIoOpenShiftLoginPage = require('../page-objects/openshift-io-openshift-login.page');

    browser.wait(until.presenceOf(this.openshiftLoginButton), constants.WAIT, 'Failed to find openshift login');
    this.openshiftLoginButton.click().then(function(){
      console.log("OpenShiftIoF8OSLoginPage - clicked element:openshiftLoginButton");

      var nextPage = new OpenShiftIoOpenShiftLoginPage();
      nextPage.doLogin(browser);
    });
  }
}

module.exports = OpenShiftIoF8OSLoginPage;
