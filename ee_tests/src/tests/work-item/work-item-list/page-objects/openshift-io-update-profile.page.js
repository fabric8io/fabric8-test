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
    OpenShiftIoCleanTenantPage = require('../page-objects/openshift-io-clean-tenant.page');

var until = protractor.ExpectedConditions;

class OpenShiftIoUpdateProfilePage {

  constructor() {
  };

  /* -----------------------------------------------------------------*/
  
    get updateTenantButton () {
    return element(by.xpath(".//button[contains (text(), 'Update Tenant')]"));
  }
  clickupdateTenantButton () {
    browser.wait(until.elementToBeClickable(this.updateTenantButton), constants.LONG_WAIT, 'Failed to find element updateTenantButton');
    this.updateTenantButton.click().then(function(){
      console.log("OpenShiftIoDashboardPage - clicked element:updateTenantButton");
    });
    return;
  }
  
  get cleanTenantButton () {
    return element(by.xpath(".//button[contains (text(), 'Reset Environment')]"));
  }
  clickCleanTenantButton () {
    browser.wait(until.elementToBeClickable(this.cleanTenantButton), constants.LONG_WAIT, 'Failed to find element cleanTenantButton');
    this.cleanTenantButton.click().then(function(){
      console.log("OpenShiftIoDashboardPage - clicked element:cleanTenantButton");
    });
    return new OpenShiftIoCleanTenantPage;
  }

  /* Used to obtain the test account KC token */
  get obtainToken () {
    return element(by.xpath(".//*[contains(@class,'token-heading')]"));
  }

}

module.exports = OpenShiftIoUpdateProfilePage;

