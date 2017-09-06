/**
 * AlMighty page object example module for openshift.io start page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 */

'use strict';

/*
 * The UI to submit details to KeyCloak
 */

var testSupport = require('../testSupport'),
        constants = require("../constants"),
        OpenShiftIoGettingStartedPage = require('../page-objects/openshift-io-gettingstarted.page'),
        OpenShiftIoDashboardPage = require('../page-objects/openshift-io-dashboard.page');

let until = protractor.ExpectedConditions;
//let CompleteRegistrationPage = require ("./complete-registration.page");
//let Fabric8MainPage = require ("./fabric8-main.page");

class OpenShiftIoF8KeyCloakLoginPage {

  constructor() {
  };

  doLogin(browser, callback) {
    console.log("Processing OpenShiftIoF8OSLoginPage");

    var that = this;

    var nextCallback = function () {
      var nextPage = new OpenShiftIoGettingStartedPage();
      nextPage.doLogin(browser, null);
    };


    this.kcDetailsForm.isPresent().then(function (present) {
      if (present) {
        that.submitKeycloakDetails(nextCallback);
      } else {
        if (nextCallback) {
          nextCallback();
        }
      }
    });
  }


  get kcDetailsForm() {
    return element(by.id("kc-update-profile-form"));
  }

  get kcEmailField() {
    return element(by.id("email"));
  }

  clickKcEmailField() {
    browser.wait(until.presenceOf(this.kcEmailField), constants.LONG_WAIT, 'Failed to find KeyCloak details email field');
    this.kcEmailField.click().then(function () {
      console.log("OpenShiftIoF8KeyCloakLoginPage - clicked element:kcEmailField");
    });
    return;
  }

  typeKcEmailField(value) {
    return this.kcEmailField.sendKeys(value);
  }

  get kcFirstNameField() {
    return element(by.id("firstName"));
  }

  clickKcFirstNameField() {
    browser.wait(until.presenceOf(this.kcFirstNameField), constants.LONG_WAIT, 'Failed to find KeyCloak details firstName field');
    this.kcFirstNameField.click().then(function () {
      console.log("OpenShiftIoF8KeyCloakLoginPage - clicked element:kcFirstNameField");
    });
    return;
  }

  typeKcFirstNameField(value) {
    return this.kcFirstNameField.sendKeys(value);
  }

  get kcLastNameField() {
    return element(by.id("lastName"));
  }

  clickKcLastNameField() {
    browser.wait(until.presenceOf(this.kcLastNameField), constants.LONG_WAIT, 'Failed to find KeyCloak details lastName field');
    this.kcLastNameField.click().then(function () {
      console.log("OpenShiftIoF8KeyCloakLoginPage - clicked element:kcLastNameField");
    });
    return;
  }

  typeKcLastNameField(value) {
    return this.kcLastNameField.sendKeys(value);
  }


  get kcSubmitButton() {
    return element(by.xpath('.//input[@value="Submit"]'));
  }

  clickKcSubmitButton(callback) {
    browser.wait(until.presenceOf(this.kcSubmitButton), constants.WAIT, 'Failed to find KeyCloak details Submit button');
    this.kcSubmitButton.click().then(function () {
      console.log("OpenShiftIoF8KeyCloakLoginPage - clicked element:kcSubmitButton");
      if (callback) {
        callback();
      }
    }, function () {
      console.log("OpenShiftIoF8KeyCloakLoginPage - no kcSubmitButton");

      if (callback) {
        callback();
      }
    });
    return new OpenShiftIoDashboardPage();
  }


  submitKeycloakDetails(callback) {
    console.log("Submitting the Keycloak details page");

    var email = browser.params.login.email || "dummy@foo.com";
    var firstName = browser.params.login.firstName || "Dear";
    var lastName = browser.params.login.lastName || browser.params.login.user || "Developer";

    this.clickKcEmailField();
    this.typeKcEmailField(email);
    this.clickKcFirstNameField();
    this.typeKcFirstNameField(firstName);
    this.clickKcLastNameField();
    this.typeKcLastNameField(lastName);

    var nextCallback = function () {
      console.log("submitted details to KeyCloak details page:", email, firstName, lastName);

      if (callback) {
        callback();
      }
    };


    this.clickKcSubmitButton(nextCallback);
  }
}

module.exports = OpenShiftIoF8KeyCloakLoginPage;
