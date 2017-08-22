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

var until = protractor.ExpectedConditions;

class OpenShiftIoCleanTenantPage {

  constructor() {
  };

  /* -----------------------------------------------------------------*/
  
  get eraseOsioEnvButton () {
    return element(by.xpath(".//button[contains (text(), 'Erase My OpenShift.io Environment')]"));
  }
  clickEraseOsioEnvButton () {
    browser.wait(until.elementToBeClickable(this.eraseOsioEnvButton), constants.LONG_WAIT, 'Failed to find element eraseOsioEnvButton');
    this.eraseOsioEnvButton.click().then(function(){
      console.log("OpenShiftIoDashboardPage - clicked element:eraseOsioEnvButton");
    });
    return;
  }

  get eraseOsioEnvUsername () {
    return element(by.xpath(".//input[contains (@name,'username')]"));
  }
  clickEraseOsioEnvUsername () {
    browser.wait(until.presenceOf(this.eraseOsioEnvUsername), constants.LONG_WAIT, 'Failed to find element eraseOsioEnvUsername');
    browser.wait(until.elementToBeClickable(this.eraseOsioEnvUsername), constants.LONG_WAIT, 'Failed to find element eraseOsioEnvUsername');
    this.eraseOsioEnvUsername.click().then(function(){
      console.log("OpenShiftIoDashboardPage - clicked element:eraseOsioEnvUsername");
    });
    return;
  }
  typeEraseOsioEnvUsername (usernameString) {
    browser.wait(until.elementToBeClickable(this.eraseOsioEnvUsername), constants.LONG_WAIT, 'Failed to find element eraseOsioEnvUsername');
    return this.eraseOsioEnvUsername.sendKeys(usernameString);
  }

  get confirmEraseOsioEnvButton () {
    return element(by.xpath(".//button[contains (text(), 'I understand my actions - erase my environment')]"));
  }
  clickConfirmEraseOsioEnvButton () {
    browser.wait(until.elementToBeClickable(this.confirmEraseOsioEnvButton), constants.LONG_WAIT, 'Failed to find element confirmEraseOsioEnvButton');
    this.confirmEraseOsioEnvButton.click().then(function(){
      console.log("OpenShiftIoDashboardPage - clicked element:confirmEraseOsioEnvButton");
    });
    return;
  }

}

module.exports = OpenShiftIoCleanTenantPage;

