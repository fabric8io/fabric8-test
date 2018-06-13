import { browser, element, by, By, ExpectedConditions as until } from 'protractor';
import { $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
import * as support from '../support';
import { SpaceTabPage } from './space_tab.page';
import { Button, BaseElement } from '../ui';
import { OsoDashboardPage } from '.';

export class SpacePipelinePage extends SpaceTabPage {

  async ready() {
    await super.ready();
    // https://github.com/fabric8io/fabric8-test/issues/592
    await browser.sleep(5000);
  }

  async getPipelines(): Promise<PipelineDetails[]> {
    await browser.wait(until.presenceOf(element(by.className('pipeline-list'))), support.LONGER_WAIT);

    let elementsFinders: ElementFinder[] = await element.all(by.className('pipeline-list'));
    let pipelines = await elementsFinders.map(finder => new PipelineDetails(finder));
    return Promise.resolve(pipelines);
  }

  async openOpenshiftConsole(): Promise<OsoDashboardPage> {
    /* Openshift Links */
    let osoLinksDropdown = new Button(
      element(by.xpath('//*[contains(@class,\'openshift-links\')]//*[contains(@class,\'dropdown-kebab-pf\')]')),
      'OSO Links Dropdown'
    );

    let osoLinksOpenInConsole = new Button(
      element(by.xpath('//*[contains(@class,\'openshift-links\')]//a[contains(text(),\'Open in OpenShift Console\')]')),
      'Open In OpenShift Console'
    );

    support.info('Opening OpenShift Console...');
    await osoLinksDropdown.clickWhenReady();
    let osoLink = await osoLinksOpenInConsole.getAttribute('href');
    await osoLinksOpenInConsole.clickWhenReady();
    return new OsoDashboardPage(osoLink);
  }
}

export class PipelineDetails extends BaseElement {

  private inputRequired: Button =
    new Button(element(by.cssContainingText('a', 'Input Required')), 'Input Required');

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

  public async isInputRequired(): Promise<boolean> {
    return await this.inputRequired.isPresent() && await this.inputRequired.isDisplayed();
  }

  public async promote() {
    await this.inputRequired.clickWhenReady();
    let promoteButton = new Button(element(by.cssContainingText('button', 'Promote')), 'Promote button');
    await promoteButton.clickWhenReady(support.LONGER_WAIT);
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
