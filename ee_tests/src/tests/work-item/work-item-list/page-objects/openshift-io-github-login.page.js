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
        constants = require("../constants");

let until = protractor.ExpectedConditions;
//let CompleteRegistrationPage = require ("./complete-registration.page");
//let Fabric8MainPage = require ("./fabric8-main.page");

class OpenShiftIoGithubLoginPage {

  constructor() {
  };

  doLogin(browser, callback) {
    var OpenShiftIoF8KeyCloakLoginPage = require('../page-objects/openshift-io-F8-keycloak-login.page');
    console.log("Processing OpenShiftIoGithubLoginPage");

    var that = this;
    if (this.githubLoginButton.isPresent().then(function (present) {
              if (present) {
                that.clickGithubLoginField();
                that.typeGithubLoginField(browser.params.login.user);
                that.clickGithubPassword();
                that.typeGithubPassword(browser.params.login.password);

                if (testSupport.targetPlatform() === "fabric8-kubernetes") {
                  var nextCallback = function () {
                    var kcDetailsPage = new OpenShiftIoF8KeyCloakLoginPage();
                    kcDetailsPage.doLogin(browser, callback);
                  };
                  that.clickGithubLoginButton(null);
                  that.clickAuthorizeApplicationButton(nextCallback);
                } else {
                  that.clickGithubLoginButton(null);
                  that.clickAuthorizeApplicationButton(callback);
                }

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

  clickAuthorizeApplicationButton(callback, retried) {
    var OpenShiftIoF8KeyCloakLoginPage = require("../page-objects/openshift-io-F8-keycloak-login.page");
    var OpenShiftIoGettingStartedPage = require("../page-objects/openshift-io-gettingstarted.page");
    var keycloakDetailsPage = new OpenShiftIoF8KeyCloakLoginPage();
    var gettingStartedPage = new OpenShiftIoGettingStartedPage();

    var that = this;
    // lets see if the auth button does not appear due to being redirected to the keycloak details page
    keycloakDetailsPage.kcDetailsForm.isPresent().then(function (present) {
      if (present) {
        console.log("No github authorizeApplicationButton so carrying on");
        if (callback) {
          callback();
        }
      } else {
        gettingStartedPage.startPageGetStartedButton.isPresent().then(function (present) {
          if (present) {
            console.log("Getting started start button is visible so no need to authenticate or approve github");
            if (callback) {
              callback();
            }
          } else {
            browser.getCurrentUrl().then(function (url) {
              if (url && url.endsWith("/_gettingstarted")) {
                console.log("fabric8-ui bug! We are showing a blank page when we should have shown the get started button!");
                console.log("trying a browser refresh to fix this!");
                if (!retried) {
                  // lets hack around this and force a reload
                  browser.refresh();
                  that.clickAuthorizeApplicationButton(callback, true);
                  return;
                } else {
                  console.log("No get started button yet at " + url + " so lets wait to be redirected to the _home page");
                  browser.wait(until.urlContains("/_home"), constants.LONG_WAIT, 'Failed to redirect to the _home page!');
                  console.log("Now on the home page!");
                  if (callback) {
                    callback();
                  }
                  return;
                }
              }

              console.log("No keycloak details form yet so waiting for the gitub authorizeApplicationButton as we are on page: " + url);

              browser.wait(until.presenceOf(that.authorizeApplicationButton), constants.LONG_WAIT, 'Failed to find github authorize button');
              browser.wait(until.elementToBeClickable(that.authorizeApplicationButton), constants.WAIT, 'Failed waiting for the github authorize button to be clickable');

              that.authorizeApplicationButton.click().then(function () {
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
            });
          }
        });
      }
    });
    return;
  }

  get incorrectUsernameOrPassword() {
    return element(by.xpath('.//*[@id="js-flash-container"]/div/div/button'));
  }
}

module.exports = OpenShiftIoGithubLoginPage;
