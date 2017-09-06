/**
 * AlMighty page object example module for openshift.io start page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 */

'use strict';

/*
 * Fabric8 Start Page Definition
 */

var testSupport = require('../testSupport'),
        constants = require("../constants"),
        OpenShiftIoDashboardPage = require('../page-objects/openshift-io-dashboard.page');

let until = protractor.ExpectedConditions;
//let CompleteRegistrationPage = require ("./complete-registration.page");
//let Fabric8MainPage = require ("./fabric8-main.page");

class OpenShiftIoGithubLoginPage {

  constructor() {
  };

  doLogin(browser, callback) {
    console.log("Processing OpenShiftIoGithubLoginPage");

    var that = this;
    if (this.githubLoginButton.isPresent().then(function (present) {
              if (present) {
                that.clickGithubLoginField();
                that.typeGithubLoginField(browser.params.login.user);
                that.clickGithubPassword();
                that.typeGithubPassword(browser.params.login.password);
                that.clickGithubLoginButton(null);
                that.clickAuthorizeApplicationButton(callback);
              } else {
                console.log("No github login field present!");
                if (callback) {
                  callback();
                }
              }
            })) ;
  }


  get githubLoginField() {
    return element(by.id("login_field"));
  }

  clickGithubLoginField() {
    browser.wait(until.presenceOf(this.githubLoginField), constants.LONG_WAIT, 'Failed to find github loginbutton');
    this.githubLoginField.click().then(function () {
      console.log("OpenShiftIoGithubLoginPage - clicked element:githubLoginField");
    });
    return;
  }

  typeGithubLoginField(usernameString) {
    return this.githubLoginField.sendKeys(usernameString);
  }

  get githubPassword() {
    return element(by.id("password"));
  }

  clickGithubPassword() {
    this.githubPassword.click().then(function () {
      console.log("OpenShiftIoGithubLoginPage - clicked element: githubPassword");
    });
    return;
  }

  typeGithubPassword(passwordString) {
    return this.githubPassword.sendKeys(passwordString);
  }

  get githubLoginButton() {
    return element(by.css(".btn.btn-primary.btn-block"));
  }

  clickGithubLoginButton(callback) {
    browser.wait(until.presenceOf(this.githubLoginButton), constants.WAIT, 'Failed to find github login');
    this.githubLoginButton.click().then(function () {
      console.log("OpenShiftIoGithubLoginPage - clicked element: githubLoginButton");

      if (callback) {
        callback();
      }
    });
  }

  get authorizeApplicationButton() {
    return element(by.id("js-oauth-authorize-btn"));
    //return element(by.xpath(".//button[contains(text(), 'Authorize application')]"));
  }

  clickAuthorizeApplicationButton(callback) {
    browser.wait(until.presenceOf(this.authorizeApplicationButton), constants.WAIT, 'Failed to find github authorize button');
    browser.wait(until.elementToBeClickable(this.authorizeApplicationButton), constants.WAIT, 'Failed waiting for the github authorize button to be clickable');

    this.authorizeApplicationButton.click().then(function () {
              console.log("OpenShiftIoGithubLoginPage - clicked element: authorizeApplicationButton");

              if (callback) {
                callback();
              }
            },
            function (e) {
              console.log("OpenShiftIoGithubLoginPage - no authorizeApplicationButton - must have already logged in?", e);

              if (callback) {
                callback();
              }
            });
    return;
  }

  get incorrectUsernameOrPassword() {
    return element(by.xpath('.//*[@id="js-flash-container"]/div/div/button'));
  }
}

module.exports = OpenShiftIoGithubLoginPage;
