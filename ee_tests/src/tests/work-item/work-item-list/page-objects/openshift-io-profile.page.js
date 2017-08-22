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
    OpenShiftUpdateProfilePage = require('../page-objects/openshift-io-update-profile.page');

var until = protractor.ExpectedConditions;

class OpenShiftIoProfilePage {

  constructor() {
  };

  /* -----------------------------------------------------------------*/
  
  get updateProfileButton () {
    return element(by.xpath(".//button[contains (text(), 'Update Profile')]"));
  }
  clickupdateProfileButton () {
    browser.wait(until.elementToBeClickable(this.updateProfileButton), constants.LONG_WAIT, 'Failed to find element updateProfileButton');
    this.updateProfileButton.click().then(function(){
      console.log("OpenShiftIoDashboardPage - clicked element:updateProfileButton");
    });
    return new OpenShiftUpdateProfilePage();
  }

}

module.exports = OpenShiftIoProfilePage;

