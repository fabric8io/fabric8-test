/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/
// tslint:disable:max-line-length
import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
// tslint:ensable:max-line-length
import * as support from '../support';
import { AppPage } from './app.page';
import { SpaceTabPage } from './space_tab.page';
import { TextInput, Button, BaseElement } from '../ui';
import { OsoDashboardPage } from '.';
import { stat } from 'fs';

export class SpacePipelinePage extends SpaceTabPage {

  /* Page UI element - contains all pipelines */
  pipelinesPage = element(by.xpath('.//*[contains (@class,\'pipelines-page\')]'));

  /* List of all pipelines */
  pipelinesList = $('#pipeline-list');

  /* Kebab displayed after build pipeline performs stage and test */
  pipelineKebab = new Button ($('#dropdownKebabRight9'), 'Pipeline kebab');

  /* Kebab displayed after build pipeline performs stage and test */
  pipelineKebabStartPipeline = element(by.xpath('.//*[contains(text(), \'Start Pipeline\')]'));

  /* Stage icon */
  // tslint:disable:max-line-length
  successBar = new Button (element(by.xpath('.//div[contains(@class,\'pipeline-status-bar SUCCESS\')]')), 'Success bar');

  stageIcon = new Button (element(by.xpath('.//div[contains(text(),\'Rollout to Stage\')]/*[contains(@class,\'open-service-icon\')]/a')), 'Stage icon');

  /* Run icon */
  runIcon = new Button (element(by.xpath('.//div[contains(text(),\'Rollout to Run\')]/*[contains(@class,\'open-service-icon\')]/a')), 'Run icon');

  /* Button displayed after build pipeline performs stage and test */
  inputRequiredButton = element(by.xpath('.//a[contains(text(),\'Input Required\')][1]'));

  /* View the Jenkins Log */
  viewLog = new Button (element(by.xpath('.//*[contains(text(),\'View Log\')]')), 'View Log');

  /* Buttons displayed in the promote dialog */
  closeButton = new Button (element(by.xpath('.//button[contains(text(),\'Close\')]')), 'Close button');
  abortButton = new Button (element(by.xpath('.//button[contains(text(),\'Abort\')]')), 'Abort button');
  promoteButton = new Button (element(by.xpath('.//button[contains(text(),\'Promote\')]')), 'Promote button');

  /* Link to analytics report */
  stackReportsButton = element (by.xpath('.//*[contains(@class,\'stack-reports-btn\')]'));

  /* Links displayed in the promote dialog */
  viewApplicationOnStage = element(by.xpath('.//a[contains(text(),\'View application on stage\')]'));
  seeAdditionalDetailsInJenkins = element(by.xpath('.//a[contains(text(),\'See additional details in jenkins\')]'));

  /* If a build fails - these are displayed */
  buildDanger = element(by.xpath('.//*[contains(@class,\'fa fa-times-circle text-danger\')]'));
  buildError = element(by.xpath('.//*[contains(@class,\'pficon-error-circle-o\')]'));

  /* Login with Openshift */
  loginWithOpenshift = new Button (element(by.xpath('.//*[contains(text(),\'Login with OpenShift\')]')), 'Login with OpenShift');

  /* Login with Key Cloak */
  keyCloakButton = new Button (element(by.xpath('.//*[@class=\'login-redhat keycloak\']')), 'Login with Keycloak button');

  /* Build log output */
  buildLogOutput = element(by.xpath('.//*[contains(@class, \'console-output\')]'));

  /* Openshift Links */
  osoLinksDropdown = new Button(
    element(by.xpath('//*[contains(@class,\'openshift-links\')]//*[contains(@class,\'dropdown-kebab-pf\')]')),
    'OSO Links Dropdown'
  );
  osoLinksOpenInConsole = new Button(
    element(by.xpath('//*[contains(@class,\'openshift-links\')]//a[contains(text(),\'Open in OpenShift Console\')]')),
    'Open In OpenShift Console'
  );

  async ready() {
    await super.ready();
    // https://github.com/fabric8io/fabric8-test/issues/592
    await browser.sleep(5000);
  }

  async openOpenshiftConsole(): Promise<OsoDashboardPage> {
    support.info('Opening OpenShift Console...');
    await this.osoLinksDropdown.clickWhenReady();
    let osoLink = await this.osoLinksOpenInConsole.getAttribute('href');
    await this.osoLinksOpenInConsole.clickWhenReady();
    return new OsoDashboardPage(osoLink);
  }

  /* Locate a codebase by name */
  importCodebaseByName (nameString: string): ElementFinder {
    let xpathString = './/multiple-selection-list/div/ul/li/label/span[contains(text(),\'' + nameString + '\')]';
    return element(by.xpath(xpathString));
  }

  /* Locate a pipeline by name */
  allPipelineByName (nameString: string): ElementArrayFinder {
    let xpathString = './/a[contains(@class,\'card-title\') and contains(text(),\'' + nameString + '\')]/../../..';
    return element.all(by.xpath(xpathString));
  }

  /* Locate a pipeline by name */
  pipelineByName (nameString: string): ElementFinder {
    let xpathString = './/a[contains(@class,\'card-title\') and contains(text(),\'' + nameString + '\')]/../../..';
    return element(by.xpath(xpathString));
  }

  /* Element - input required button - by pipeline name - in pipeline list */
  inputRequiredByPipelineByName (nameString: string): ElementFinder {
    let xpathString = './/a[contains(@class,\'card-title\') and contains(text(),\'' + nameString + '\')]/../../..//a[contains(text(),\'Input Required\')]';
    return element(by.xpath(xpathString));
  }

  public async getPipelines(): Promise<PipelineDetails[]> {
    await browser.wait(until.presenceOf(element(by.className('pipeline-list'))), support.LONGER_WAIT);

    let elementsFinders: ElementFinder[] = await element.all(by.className('pipeline-list'));
    let pipelines = await elementsFinders.map(finder => new PipelineDetails(finder));
    return Promise.resolve(pipelines);
  }
}

export class PipelineDetails extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Pipeline');
  }

  public async getApplicationName(): Promise<string> {
    return this.element(by.css('a.card-title[target="openshift"]')).getText();
  }

  public async getRepository(): Promise<string> {
    return this.element(by.css('a[href$=".git"]')).getText();
  }

  public async getStatus(): Promise<string> {
    let title = await this.element(by.css('build-status-icon > span')).getAttribute('title');
    let status = title.replace('build status ', '').trim();
    return Promise.resolve(status);
  }

  public async getBuildNumber(): Promise<number> {
    let text: string = await this.element(by.cssContainingText('a', 'Build #')).getText();
    let buildNumber = text.replace('Build #', '').trim();
    return Promise.resolve(this.string2Number(buildNumber, 'Unexpected build number'));
  }

  public async viewLog(): Promise<void> {
    await this.element(by.cssContainingText('a', 'View Log')).click();
  }

  public async getStages(): Promise<PipelineStage[]> {
    let elementsFinders: ElementFinder[] = await this.all(by.className('pipeline-stage-column'));
    let pipelines = await elementsFinders.map(finder => new PipelineStage(finder));
    return Promise.resolve(pipelines);
  }

  public async approvalRequired(): Promise<boolean> {
    return this.isElementPresent(by.cssContainingText('a', 'Input Required'));
  }

  public async approve() {
    await this.element(by.cssContainingText('a', 'Input Required')).click();
    await new SpacePipelinePage().promoteButton.clickWhenReady(support.LONGER_WAIT);
  }
}

export class PipelineStage extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Pipeline');
  }

  public async getName(): Promise<string> {
    return this.element(by.css('div[class*="pipeline-stage-name"]')).getText().then((t) => t.trim());
  }

  public async getStatus(): Promise<string> {
    let text = await this.element(by.css('div[class*="pipeline-stage-name"]')).getAttribute('class');
    let status = text.replace('pipeline-stage-name', '').trim();
    return Promise.resolve(status);
  }
}
