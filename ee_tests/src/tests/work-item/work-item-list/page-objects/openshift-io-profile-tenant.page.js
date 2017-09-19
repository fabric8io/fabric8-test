/**
 * page object
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 */

'use strict';

var testSupport = require('../testSupport'),
        constants = require("../constants");

let until = protractor.ExpectedConditions;

/*
 * The getting started page where you may need to connect your github account
 */
class OpenShiftIoProfileTenantPage {

  constructor() {
  };

  updateTenant(browser) {
    console.log("Processing OpenShiftIoProfileTenantPage :: updating Tenant configuration");

    var boosterConfig = browser.params.boosterCatalog || {};
    var tenantConfig = browser.params.tenantConfig || {};

    var gitRef = boosterConfig.gitRef;
    var gitRepo = boosterConfig.gitRepo;


    var cheVersion = tenantConfig.cheVersion;
    var jenkinsVersion = tenantConfig.jenkinsVersion;
    var teamVersion = tenantConfig.teamVersion;
    var mavenRepo = tenantConfig.mavenRepo;


    this.goToPage(browser, testSupport.joinURIPath(browser.params.target.url, "/_profile/_tenant"));

    var hasCustomConfig = gitRef || gitRepo || cheVersion || jenkinsVersion || teamVersion || mavenRepo;

    if (!hasCustomConfig) {
      console.log("Clearing the tenant configuration");

      this.clickButton("clearButton", this.clearButtonButton);
      this.clickButton("cancelButton", this.cancelButtonButton);

    } else {

      console.log("Configuring the booster config", boosterConfig);
      console.log("Configuring the tenant config", tenantConfig);

      this.inputField("gitRef", this.gitRefInput, gitRef);
      this.inputField("gitRepo", this.gitRepoInput, gitRepo);

      this.inputField("cheVersion", this.cheVersionInput, cheVersion);
      this.inputField("jenkinsVersion", this.jenkinsVersionInput, jenkinsVersion);
      this.inputField("teamVersion", this.teamVersionInput, teamVersion);
      this.inputField("mavenRepo", this.mavenRepoInput, mavenRepo);

      this.clickButton("saveButton", this.saveButtonButton);
    }

    this.goToPage(browser, testSupport.joinURIPath(browser.params.target.url, "/_home"));
  }

  goToPage(browser, urlText) {
    browser.get(urlText);

    console.log("Lets wait for the URL to move to: " + urlText);

    browser.wait(until.urlIs(urlText), constants.LONG_WAIT, "Failed waiting to move to the URL: " + urlText).then(function () {
      browser.getCurrentUrl().then(function (text) {
        console.log('The browser was at URL: ' + text);
      });
    });
    expect(browser.getCurrentUrl()).toEqual(urlText);

    browser.getCurrentUrl().then(function (text) {
      console.log('Browser now at URL = ' + text);
    });
  }

  clearTenant(browser) {
    console.log("Processing OpenShiftIoProfileTenantPage :: updating Tenant configuration");

    var boosterConfig = browser.params.boosterCatalog || {};
    var tenantConfig = browser.params.tenantConfig || {};

    var gitRef = boosterConfig.gitRef;
    var gitRepo = boosterConfig.gitRepo;


    var cheVersion = tenantConfig.cheVersion;
    var jenkinsVersion = tenantConfig.jenkinsVersion;
    var teamVersion = tenantConfig.teamVersion;
    var mavenRepo = tenantConfig.mavenRepo;


    var hasCustomConfig = gitRef || gitRepo || cheVersion || jenkinsVersion || teamVersion || mavenRepo;

    if (!hasCustomConfig) {
      return;
    }

    this.clickButton("clearButton", this.clearButtonButton);
    this.clickButton("saveButton", this.saveButtonButton);
  }

  inputField(name, field, value) {
    if (value) {
      browser.wait(until.presenceOf(field), constants.WAIT, 'Failed to find input field ' + name + ' for ' + field);
      field.click().then(function () {
        console.log("clicked field " + name + " now sending value: " + value);
        field.clear().sendKeys(value);
      }, function (err) {
        console.log("Could not find field " + name + " for " + field + " due to: " + err);
      });
    }
  }

  clickButton(name, button) {
    browser.wait(until.presenceOf(button), constants.WAIT, 'Failed waiting for Start Page Connect button to be present');
    browser.wait(until.elementToBeClickable(button), constants.WAIT, 'Failed waiting for Start Page Connect button to be clickable');
    button.click().then(function () {
      console.log("OpenShiftIoProfileTenantPage - clicked button " + name);
    }, function (err) {
      console.log("Could not click button " + name + " for " + button + " due to: " + err);
    });
  }


  get gitRefInput() {
    return element(by.id("boosterGitRef"));
  }

  get gitRepoInput() {
    return element(by.id("boosterGitRepo"));
  }

  get cheVersionInput() {
    return element(by.id("cheVersion"));
  }

  get jenkinsVersionInput() {
    return element(by.id("jenkinsVersion"));
  }

  get teamVersionInput() {
    return element(by.id("teamVersion"));
  }

  get mavenRepoInput() {
    return element(by.id("mavenRepo"));
  }

  get Input() {
    return element(by.id("authGitHub"));
  }

  get saveButtonButton() {
    return element(by.id("saveButton"));
  }

  get clearButtonButton() {
    return element(by.id("clearButton"));
  }
  
  get cancelButtonButton() {
    return element(by.id("cancelButton"));
  }

}

module.exports = OpenShiftIoProfileTenantPage;
