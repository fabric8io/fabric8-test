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
  
  get createCodebaseIcon () {
    return element(by.xpath("//codebases-item-actions/span[contains(@class,'dropdown-kebab-pf')]/ul/li[1]"));
  }
  clickCreateCodebaseIcon () {
    browser.wait(until.elementToBeClickable(this.createCodebaseIcon), constants.LONGEST_WAIT, 'Failed to find element createCodebaseIcon');
    this.createCodebaseIcon.click().then(function(){
      console.log("OpenShiftIoCodebasePage - clicked element: createCodebaseIcon");
    });
    return;
  }




/*


codebase
//div[contains(@class,'list-pf-title') ]/a[contains(text(),'osiotest3142/july18')]

create workspace link
//div[contains(@class,'list-pf-title') ]/a[contains(text(),'osiotest3142/july18a')]/../../../div[contains(@class,'list-pf-additional-content')]/codebases-item-workspaces/a/i

kebab
//div[contains(@class,'list-pf-title') ]/a[contains(text(),'osiotest3142/july18a')]/../../../../../../div[contains(@class,'list-pf-actions')]/codebases-item-actions/span/ul/li/a[contains(text(),'Create workspace')]
//div[contains(@class,'list-pf-title') ]/a[contains(text(),'osiotest3142/july18a')]/../../../../../../div[contains(@class,'list-pf-actions')]/codebases-item-actions/span/ul/li/a[contains(text(),'Remove workspace')]





List of codespaces
.list-group.list-view-pf.list-view-pf-view

Codespaces heading line
.list-group-item.list-group-item-heading-row

Codespace by name
.//a[contains(@target,'_blank') and contains(text(),'osiotest314/testjul61499369606171a')    ]

Create codespace icon
.//a[contains(@target,'_blank') and contains(text(),'osiotest314/testjul61499369606171a')]/../../..//i[contains(@class,'pficon-add-circle-o')]

Codebase’s kebab button
.//a[contains(@target,'_blank') and contains(text(),'osiotest314/testjul61499369606171a')]/../../../../../..//button

Create codebase, delete codebase
.//a[contains(@target,'_blank') and contains(text(),'osiotest314/testjul61499369606171a')]/../../../../../..//li[1]
.//a[contains(@target,'_blank') and contains(text(),'osiotest314/testjul61499369606171a')]/../../../../../..//li[2]

.//a[contains(@target,'_blank') and contains(text(),'osiotest314/testjul61499369606171a')]/../../../../../..//*[contains(text(),'Create workspace')]

.//a[contains(@target,'_blank') and contains(text(),'osiotest314/testjul61499369606171a')]/../../../../../..//*[contains(text(),’Remove workspace')]

*/



}

module.exports = OpenShiftIoCodebasePage;

