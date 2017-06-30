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

class OpenShiftIoPipelinePage {

  constructor() {
  };

  /* -----------------------------------------------------------------*/
  

  /* The list of pipelines for the space */
  get pipelinesPage () {
    browser.wait(until.elementToBeClickable(element(by.xpath(".//*[contains (@class,'pipelines-page')]"))), constants.LONG_WAIT, 'Failed to find element pipelineByName');
    return element(by.xpath(".//*[contains (@class,'pipelines-page')]"));
  }

  get inputRequiredButton () {
    return element(by.xpath(".//a[contains(text(),'Input Required')][1]"));
  }
  clickInputRequiredButton () {
    browser.wait(until.elementToBeClickable(this.inputRequiredButton), constants.LONGEST_WAIT, 'Failed to find element inputRequiredButton');
    this.inputRequiredButton.click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: inputRequiredButton");
    });
    return;
  }

  get promoteButton () {
    return element(by.xpath(".//button[contains(text(),'Promote')]"));
  }
  clickPromoteButton () {
    browser.wait(until.elementToBeClickable(this.promoteButton), constants.LONGEST_WAIT, 'Failed to find element promoteButton');
    this.promoteButton.click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: promoteButton");
    });
    return;
  }



}

module.exports = OpenShiftIoPipelinePage;

