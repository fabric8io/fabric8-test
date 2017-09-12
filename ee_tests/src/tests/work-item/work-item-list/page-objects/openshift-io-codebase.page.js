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
    constants = require("../constants"),
    OpenShiftIoChePage = require('../page-objects/openshift-io-che.page');

var until = protractor.ExpectedConditions;

class OpenShiftIoCodebasePage {

  constructor() {
  };

  /* -----------------------------------------------------------------*/

  /* TODO - replace all xpath dependent code - add unique ID's to product source code*/
  
  /* List of codebases on page */
  get codebaseList () {
    browser.wait(until.elementToBeClickable(element(by.css(".pfng-list-item.list-pf-item"))), constants.LONGEST_WAIT, 'Failed to find element codebases');
    return element.all(by.css(".pfng-list-item.list-pf-item"));
  }

  /* Codebases list heading */
  get codebaseHeading () {
    browser.wait(until.elementToBeClickable(element(by.css(".pfng-list-heading"))), constants.LONGEST_WAIT, 'Failed to find element codebases header');
    return element(by.css(".pfng-list-heading"));
  }

  /* Element - codebase - by codebase name - in codebase list */
  codebaseByName (username, codebaseName, githubName) {
    var xpathString = "//div[contains(@class,'list-pf-title') ]/a[contains(text(),'" + githubName + "/" + codebaseName + "')]";
//    "//div[contains(@class,'list-pf-title') ]/a[contains(text(),'" + githubName + "/" + codebaseName + "')]";
    browser.wait(until.presenceOf(element(by.xpath(xpathString)), constants.LONGEST_WAIT, 'Failed to find element codebase'));
    return element(by.xpath(xpathString));
  }
  clickCodebaseByName (username, codebaseName, githubName) {
    browser.wait(until.elementToBeClickable(this.codebaseByName(username, codebaseName, githubName)), constants.LONGEST_WAIT, 'Failed to find element codebaseByName');
    this.codebseByName(username, codebaseName, githubName).click().then(function(){
      console.log("OpenShiftIoCodebasePage - clicked element: codebaseByName");
    });
    return;
  }

  /* Create codebase icon - TODO - have to be able to locate this for a specific codebase */
  
  get createCodebaseKebab () {
    return element(by.xpath("//codebases-item-actions/span[contains(@class,'dropdown-kebab-pf')]"));
  }
  clickCreateCodebaseKebab () {
    browser.wait(until.elementToBeClickable(this.createCodebaseKebab), constants.LONGEST_WAIT, 'Failed to find element createCodebaseKebab');
    this.createCodebaseKebab.click().then(function(){
      console.log("OpenShiftIoCodebasePage - clicked element: createCodebaseKebab");
    });
    return;
  }

  get createCodebaseIcon () {
    return element(by.xpath("//codebases-item-actions/span[contains(@class,'dropdown-kebab-pf')]/ul/li[1]"));
  }
  clickCreateCodebaseIcon () {
    browser.wait(until.elementToBeClickable(this.createCodebaseIcon), constants.LONGEST_WAIT, 'Failed to find element createCodebaseIcon');
    this.createCodebaseIcon.click().then(function(){
      console.log("OpenShiftIoCodebasePage - clicked element: createCodebaseIcon");
    });
    return new OpenShiftIoChePage();
  }

}

module.exports = OpenShiftIoCodebasePage;

