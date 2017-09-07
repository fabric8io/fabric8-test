/**
 * AlMighty page object example module for openshift.io start page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 */

'use strict';

/*
 * The getting started page where you may need to connect your github account
 */

var testSupport = require('../testSupport'),
        constants = require("../constants"),
        OpenShiftIoDashboardPage = require('../page-objects/openshift-io-dashboard.page');

let until = protractor.ExpectedConditions;
//let CompleteRegistrationPage = require ("./complete-registration.page");
//let Fabric8MainPage = require ("./fabric8-main.page");

class OpenShiftIoGettingStartedPage {

  constructor() {
  };

  doLogin(browser, callback) {
    console.log("Processing OpenShiftIoGettingStartedPage");
    var that = this;

    var githubCheckBox = this.startPageGithubCheckbox;
    var clickGetStarted = function () {
      that.clickGetStartedButton(callback);
    };

    // lets only do this if we are not already on the home page
    var dashboardPage = new OpenShiftIoDashboardPage();
    var dropDownToggle = dashboardPage.headerDropDownToggle;
    dropDownToggle.isPresent().then(function (present) {
      if (!present) {
        if (testSupport.targetPlatform() === "fabric8-kubernetes") {
          clickGetStarted();
        } else {
          browser.wait(until.presenceOf(githubCheckBox), constants.WAIT, 'Failed waiting for Getting Started github auth checkbox to be visible');
          browser.wait(until.elementToBeClickable(githubCheckBox), constants.WAIT, 'Failed waiting for Getting Started github auth checkbox to be clickable');

          // lets then connect to github if its present
          githubCheckBox.isPresent().then(function (present) {
            if (present) {
              githubCheckBox.isSelected().then(function (checked) {
                if (!checked) {
                  githubCheckBox.click();
                  that.clickStartPageConnectButton(browser, clickGetStarted);
                } else {
                  clickGetStarted();
                }
              });
            } else {
              console.log("the github checkbox is not present!");
              clickGetStarted();
            }
          });
        }
      }
    });

    browser.wait(until.presenceOf(dropDownToggle), constants.WAIT, 'Failed waiting for Home page drop down toggle to be visible');
  }

  get startPageGithubCheckbox() {
    return element(by.id("authGitHub"));
  }

  get startPageConnectButton() {
    return element(by.id("connect"));
  }

  get startPageGetStartedButton() {
    return element(by.id("getStartedButton"));
  }

  clickStartPageConnectButton(browser, callback) {

    browser.wait(until.presenceOf(this.startPageConnectButton), constants.WAIT, 'Failed waiting for Start Page Connect button to be present');
    browser.wait(until.elementToBeClickable(this.startPageConnectButton), constants.WAIT, 'Failed waiting for Start Page Connect button to be clickable');
    this.startPageConnectButton.click().then(function () {
      console.log("OpenShiftIoGettingStartedPage - clicked element:startPageConnectButton");

      console.log("Now logging into github if we need to");

      // lets make the require lazy as got some errors testing
      // fabric8 with minishift if we did this at the top of the file
      var OpenShiftIoGithubLoginPage = require('../page-objects/openshift-io-github-login.page');
      var githubLoginPage = new OpenShiftIoGithubLoginPage();
      githubLoginPage.doLogin(browser, callback);
    });
  }

  clickGetStartedButton(callback) {
    // we may have skipped the getting started page so lets check
    var getStartedButton = this.startPageGetStartedButton;
    var dashboardPage = new OpenShiftIoDashboardPage();
    var dropDownToggle = dashboardPage.headerDropDownToggle;
    dropDownToggle.isPresent().then(function (present) {
      if (!present) {
        browser.wait(until.presenceOf(getStartedButton), constants.LONGER_WAIT, 'Failed waiting for Start Page Get Started Button to be visible');
        browser.wait(until.elementToBeClickable(getStartedButton), constants.WAIT, 'Failed waiting for Start Page Get Started Button to be visible');

        console.log("Clicking Start Page Getting Started Button");
        getStartedButton.click().then(function () {
          console.log("OpenShiftIoGettingStartedPage - clicked element:startPageGetStartedButton");

          if (callback) {
            callback();
          }
        });
      }
    });
  }


}

module.exports = OpenShiftIoGettingStartedPage;
