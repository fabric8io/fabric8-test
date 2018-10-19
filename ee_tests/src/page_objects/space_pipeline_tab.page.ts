import { browser, by, element, ElementFinder, ExpectedConditions as until } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { SpaceTabPage } from './space_tab.page';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';
import { OsoDashboardPage } from './oso_dashboard.page';

export class SpacePipelinePage extends SpaceTabPage {

  async ready() {
    await super.ready();
    // https://github.com/fabric8io/fabric8-test/issues/592
    await browser.sleep(5000);
  }

  async getPipelines(): Promise<PipelineDetails[]> {
    await browser.wait(until.presenceOf(element(by.className('pipeline-list'))),
      timeouts.LONGER_WAIT, 'Element with class name pipeline-list is present');

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

    logger.info('Opening OpenShift Console...');
    await osoLinksDropdown.clickWhenReady();
    let osoLink = await osoLinksOpenInConsole.getAttribute('href');
    await osoLinksOpenInConsole.clickWhenReady();
    return new OsoDashboardPage(osoLink);
  }
}

export class PipelineDetails extends BaseElement {

  private viewLogLocator = by.cssContainingText('a', 'View Log');

  private inputRequiredLocator = by.cssContainingText('a', 'Input Required');

  private promoteLocator = by.cssContainingText('button', 'Promote');

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

  public async viewBuildInOS(): Promise<void> {
    return this.element(by.cssContainingText('a', 'Build #')).click();
  }

  public async isViewLogPresent(): Promise<boolean> {
    return this.element(this.viewLogLocator).isPresent();
  }

  public async viewLog(): Promise<void> {
    await this.element(this.viewLogLocator).click();
  }

  public async getStages(): Promise<PipelineStage[]> {
    let elementsFinders: ElementFinder[] = await this.all(by.className('pipeline-stage-column'));
    let pipelines = await elementsFinders.map(finder => new PipelineStage(finder));
    return Promise.resolve(pipelines);
  }

  public async isInputRequired(): Promise<boolean> {
    return await this.element(this.inputRequiredLocator).isPresent() &&
      await this.element(this.inputRequiredLocator).isDisplayed();
  }

  public async promote() {
    let inputRequired = new Button(element(this.inputRequiredLocator), 'Input required');
    await inputRequired.clickWhenReady();

    let promoteButton = new Button(element(this.promoteLocator), 'Promote button');
    await promoteButton.clickWhenReady(timeouts.LONGER_WAIT);

    await browser.wait(until.stalenessOf(element(this.promoteLocator)),
      timeouts.DEFAULT_WAIT, 'Staleness of promote button');
    await browser.wait(until.stalenessOf(element(this.inputRequiredLocator)),
      timeouts.DEFAULT_WAIT, 'Staleness of input required button');
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
    let statusBarFinder = await this.element(by.className('pipeline-status-bar'));

    let text;
    try {
      text = await statusBarFinder.getAttribute('class');
      text = text.replace('pipeline-status-bar', '').trim();
    } catch (e) {
      text = '';
    }
    return Promise.resolve(text);
  }
}
