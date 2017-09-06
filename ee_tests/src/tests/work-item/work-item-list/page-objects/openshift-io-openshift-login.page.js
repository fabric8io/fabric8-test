/**
 * AlMighty page object example module for openshift.io start page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 */

'use strict';

/*
 * OpenShift login page
 */

var testSupport = require('../testSupport'),
    constants = require("../constants"),
        OpenShiftIoF8KeyCloakLoginPage = require('../page-objects/openshift-io-F8-keycloak-login.page'),
    OpenShiftIoDashboardPage = require('../page-objects/openshift-io-dashboard.page');

let until = protractor.ExpectedConditions;
//let CompleteRegistrationPage = require ("./complete-registration.page");
//let Fabric8MainPage = require ("./fabric8-main.page");

class OpenShiftIoOpenShiftLoginPage {

  constructor() {
  };

  doLogin(browser) {
    console.log("Processing OpenShiftIoOpenShiftLoginPage");

    var callback = function() {
      var kcDetailsPage = new OpenShiftIoF8KeyCloakLoginPage();
      kcDetailsPage.doLogin(browser, null);
    };
    this.clickOpenshiftUsernameField();
    //this.typeOpenshiftUsernameField(browser.params.login.user);
    this.typeOpenshiftUsernameField(browser.params.login.openshiftUser || "developer");
    this.clickOpenshiftPassword();
    //this.typeOpenshiftPassword(browser.params.login.password);
    this.typeOpenshiftPassword(browser.params.login.openshiftPassword || "developer");

    this.clickLoginButton();
    this.clickAuthorizeApplicationButton(callback);


    // KC details
    // starter page... / github
    // get started
  }


  get openshiftUsernameField () {
     return element(by.id("inputUsername"));
  }

  clickOpenshiftUsernameField () {
     browser.wait(until.presenceOf(this.openshiftUsernameField), constants.LONG_WAIT, 'Failed to find github loginbutton');
     this.openshiftUsernameField.click().then(function(){
      console.log("OpenShiftIoOpenShiftLoginPage - clicked element:openshiftUsernameField");
    });
    return;
  }

  typeOpenshiftUsernameField (usernameString) {
     return this.openshiftUsernameField.sendKeys(usernameString);
  }

  get openshiftPassword () {
     return element(by.id("inputPassword"));
  }

  clickOpenshiftPassword () {
     this.openshiftPassword.click().then(function(){
      console.log("OpenShiftIoOpenShiftLoginPage - clicked element:openshiftPassword");
    });
    return;
  }

  typeOpenshiftPassword (passwordString) {
     return this.openshiftPassword.sendKeys(passwordString);
  }

  get loginButton () {
    // TODO use Log In text?
     return element(by.css(".btn.btn-primary.btn-lg"));
  }

  clickLoginButton () {
    browser.wait(until.presenceOf(this.loginButton), constants.WAIT, 'Failed to find login');
    this.loginButton.click().then(function(){
      console.log("OpenShiftIoOpenShiftLoginPage - clicked element:loginButton");
    });
  }

  get authorizeApplicationButton () {
    return element (by.xpath('.//input[@name="approve"]'));
  }

  clickAuthorizeApplicationButton(callback) {
    this.authorizeApplicationButton.click().then(function () {
              console.log("OpenShiftIoOpenShiftLoginPage - clicked element: authorizeApplicationButton");

              if (callback) {
                callback();
              }
            },
            function (e) {
              console.log("OpenShiftIoOpenShiftLoginPage - no authorizeApplicationButton - must have already logged in?", e);

              if (callback) {
                callback();
              }
            });
    return;
  }

}

module.exports = OpenShiftIoOpenShiftLoginPage;
