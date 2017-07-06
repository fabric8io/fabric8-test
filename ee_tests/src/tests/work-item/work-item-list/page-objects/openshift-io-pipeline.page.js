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

  /* TODO - replace all xpath dependent code */
  
  /* The list of pipelines for the space */
  get pipelinesPage () {
    browser.wait(until.elementToBeClickable(element(by.xpath(".//*[contains (@class,'pipelines-page')]"))), constants.LONG_WAIT, 'Failed to find element pipelineByName');
    return element(by.xpath(".//*[contains (@class,'pipelines-page')]"));
  }

  /* List of pipelines displayed on page */
  get pipelinesList () {
    return element(by.css(".pipeline-list"));
  }

  /* Element - by pipeline name - in pipeline list */
  pipelineByName (nameString) {
    var xpathString = ".//a[contains(@class,'card-title') and contains(text(),'" + nameString + "')]/../../..";
    return element(by.xpath(xpathString));
  }
  clickPipelineByName (nameString) {
    browser.wait(until.elementToBeClickable(this.pipelineByName(pipelineByName)), constants.LONGEST_WAIT, 'Failed to find element pipelineByName');
    this.pipelineByName(nameString).click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: pipelineByName");
    });
    return;
  }

  /* Element - input required button - by pipeline name - in pipeline list */
  inputRequiredByPipelineByName (nameString) {
    var xpathString = ".//a[contains(@class,'card-title') and contains(text(),'" + nameString + "')]/../../..//a[contains(text(),'Input Required')]";
    return element(by.xpath(xpathString));
  }
  clickInputRequiredByPipelineByName (nameString) {
    browser.wait(until.elementToBeClickable(this.inputRequiredByPipelineByName(nameString)), constants.LONGEST_WAIT, 'Failed to find element inputRequiredByPipelineByName');
    this.inputRequiredByPipelineByName(nameString).click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: inputRequiredByPipelineByName");
    });
    return;
  }

  /* Element - source repo link - by pipeline name - in pipeline list */
  sourceRepoByPipelineByName (nameString) {
    var xpathString = ".//a[contains(@class,'card-title') and contains(text(),'" + nameString + "')]/../../..//a[contains(text(),'" + nameString + ".git')]";
    return element(by.xpath(xpathString));
  }
  clicksourceRepoByPipelineByName (nameString) {
    browser.wait(until.elementToBeClickable(this.sourceRepoByPipelineByName(pipelineByName)), constants.LONGEST_WAIT, 'Failed to find element sourceRepoByPipelineByName');
    this.sourceRepoByPipelineByName(nameString).click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: sourceRepoByPipelineByName");
    });
    return;
  }

  /* Element - view pipeline runs link - by pipeline name - in pipeline list */
  viewPipelineRunsByPipelineByName (nameString) {
    var xpathString = ".//a[contains(@class,'card-title') and contains(text(),'" + nameString + "')]/../../..//a[contains(text(),'View Pipeline Runs')]";
    return element(by.xpath(xpathString));
  }
  clickViewPipelineRunsByPipelineByName (nameString) {
    browser.wait(until.elementToBeClickable(this.viewPipelineRunsByPipelineByName(pipelineByName)), constants.LONGEST_WAIT, 'Failed to find element viewPipelineRunsByPipelineByName');
    this.viewPipelineRunsByPipelineByName(nameString).click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: viewPipelineRunsByPipelineByName");
    });
    return;
  }

  /* Element - edit pipeline link - by pipeline name - in pipeline list */
  editPipelineByPipelineByName (nameString) {
    var xpathString = ".//a[contains(@class,'card-title') and contains(text(),'" + nameString + "')]/../../..//a[contains(text(),'Edit Pipeline')]";
    return element(by.xpath(xpathString));
  }
  clickEditPipelineByPipelineByName (nameString) {
    browser.wait(until.elementToBeClickable(this.editPipelineByPipelineByName(pipelineByName)), constants.LONGEST_WAIT, 'Failed to find element editPipelineByPipelineByName');
    this.editPipelineByPipelineByName(nameString).click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: editPipelineByPipelineByName");
    });
    return;
  }

/*
pipeline list
css .pipeline-list

Element - by name - in pipeline list
.//a[contains(@class,'card-title') and contains(text(),'june31')]/../../..

Input required
.//a[contains(@class,'card-title') and contains(text(),'june31')]/../../..//a[contains(text(),'Input Required')]

Source repo
.//a[contains(@class,'card-title') and contains(text(),'june31')]/../../..//a[contains(text(),'june31.git')]

View pipeline runs
 .//a[contains(@class,'card-title') and contains(text(),'june31')]/../../..//a[contains(text(),’View Pipeline Runs’)]

Edit pipeline
 .//a[contains(@class,'card-title') and contains(text(),'june31')]/../../..//a[contains(text(),'Edit Pipeline')][

*/

  /* Button displayed after build pipeline performs stage and test */
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

  /* Buttons displayed in the promote dialog */
  get closeButton () {
    return element(by.xpath(".//button[contains(text(),'Close')]"));
  }
  clickCloseButton () {
    browser.wait(until.elementToBeClickable(this.closeButton), constants.LONG_WAIT, 'Failed to find element closeButton');
    this.closeButton.click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: closeButton");
    });
    return;
  }

  get abortButton () {
    return element(by.xpath(".//button[contains(text(),'Abort')]"));
  }
  clickAbortButton () {
    browser.wait(until.elementToBeClickable(this.abortButton), constants.LONG_WAIT, 'Failed to find element abortButton');
    this.abortButton.click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: abortButton");
    });
    return;
  }

  get promoteButton () {
    return element(by.xpath(".//button[contains(text(),'Promote')]"));
  }
  clickPromoteButton () {
    browser.wait(until.elementToBeClickable(this.promoteButton), constants.LONG_WAIT, 'Failed to find element promoteButton');
    this.promoteButton.click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: promoteButton");
    });
    return;
  }

  /* Links displayed in the promote dialog */
  get viewApplicationOnStage () {
    return element(by.xpath(".//a[contains(text(),'View application on stage')]"));
  }
  clickViewApplicationOnStage () {
    browser.wait(until.elementToBeClickable(this.viewApplicationOnStage), constants.LONG_WAIT, 'Failed to find element viewApplicationOnStage');
    this.viewApplicationOnStage.click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: viewApplicationOnStage");
    });
    return;
  }

  get seeAdditionalDetailsInJenkins () {
    return element(by.xpath(".//a[contains(text(),'See additional details in jenkins')]"));
  }
  clickSeeAdditionalDetailsInJenkins () {
    browser.wait(until.elementToBeClickable(this.seeAdditionalDetailsInJenkins), constants.LONG_WAIT, 'Failed to find element seeAdditionalDetailsInJenkins');
    this.seeAdditionalDetailsInJenkins.click().then(function(){
      console.log("OpenShiftIoPipelinesPage - clicked element: seeAdditionalDetailsInJenkins");
    });
    return;
  }

}

module.exports = OpenShiftIoPipelinePage;

