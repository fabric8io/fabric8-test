/**
 * AlMighty page object example module for openshift.io start page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 */

'use strict';

/*
 * Fabric8 Page Definition
 */

var testSupport = require('../testSupport'),
    constants = require("../constants");

var until = protractor.ExpectedConditions;

class OpenShiftIoChePage {

  constructor() {
  };

  /* Element - project root - by name */
  projectRootByName (projectRootString) {
    // example:  .//*[@id='gwt-debug-projectTree']/div[contains(@name,'testaug101502380205634')]
    var xpathString = ".//*[@id='gwt-debug-projectTree']/div[contains(@name,'" + projectRootString + "')]";
    browser.wait(until.presenceOf(element(by.xpath(xpathString)), constants.LONGEST_WAIT, 'Failed to find element projectName'));
    return element(by.xpath(xpathString));
  }

}

module.exports = OpenShiftIoChePage;

