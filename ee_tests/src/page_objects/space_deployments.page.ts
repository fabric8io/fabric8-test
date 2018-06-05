/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/
// tslint:disable:max-line-length
import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
import * as support from '../support';
// tslint:ensable:max-line-length
import { AppPage } from './app.page';
import { TextInput, Button } from '../ui';
import { SpaceHeader } from './app/spaceHeader';

export class SpaceDeploymentsPage extends AppPage {

  deploymentCardContainerFirstElement = element.all(by.xpath('.//deployment-card-container')).first();
  resourceUsageDataFirstElement = element.all(by.xpath('.//resource-card')).first();

  async getDeployedApplications(): Promise<DeployedApplication[]> {

    /* Allow for delays in applications appearing in UI - assume that we always have at least 1 app */
    await browser.wait(until.visibilityOf(this.deploymentCardContainerFirstElement), support.LONGER_WAIT);

    let elementFinders: ElementFinder[] = await element.all(by.tagName('deployment-card-container'));
    support.info ('Total number of apps found = ' + elementFinders.length);

    let applications = new Array<DeployedApplication>();
    for (let finder of elementFinders) {
      applications.push(new DeployedApplication(finder));
    }
    return Promise.resolve(applications);
  }

  async getResourceUsageData(): Promise<ResourceUsageData[]> {

    /* Allow for delays in applications appearing in UI - assume that we always have at least 1 app */
    await browser.wait(until.visibilityOf(this.resourceUsageDataFirstElement), support.LONGER_WAIT);

    let elementFinders: ElementFinder[] = await element.all(by.tagName('resource-card'));
    support.info ('Total number of resources found = ' + elementFinders.length);

    let data = new Array<ResourceUsageData>();
    for (let finder of elementFinders) {
      data.push(new ResourceUsageData(finder));
    }
    return Promise.resolve(data);
  }
}

export enum Environment {
  STAGE = 0,
  RUN = 1
}

export class DeployedApplication {

  private finder: ElementFinder;

  constructor(finder: ElementFinder | undefined) {
    if (finder === undefined) {
      throw 'Finder is undefined';
    }
    this.finder = finder;
  }

  async getName(): Promise<string> {
    let name = await this.finder.element(by.id('deploymentCardApplicationTitle')).getText();
    return Promise.resolve(name.trim());
  }

  async getEnvironments(): Promise<DeployedApplicationEnvironment[]> {
    let elementsFinders: ElementFinder[] = await element.all(by.tagName('deployment-card'));

    let environments = new Array<DeployedApplicationEnvironment>();
    for (let finder of elementsFinders) {
      environments.push(new DeployedApplicationEnvironment(finder));
    }
    return Promise.resolve(environments);
  }
}

export class DeployedApplicationEnvironment {

  private finder: ElementFinder;

  constructor(finder: ElementFinder | undefined) {
    if (finder === undefined) {
      throw 'Finder is undefined';
    }
    this.finder = finder;
  }

  async isReady(): Promise<boolean> {
    try {
      await browser.wait(until.stalenessOf(this.finder.element(by.className('c3-arc-Empty'))), support.LONGER_WAIT);
      await browser.wait(until.stalenessOf(this.finder.element(by.className('c3-arcs-Not-Ready'))), support.LONGER_WAIT);
    } catch {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  async getVersion(): Promise<string> {
    return this.finder.element(by.id('versionLabel')).getText();
  }

  async getStatus(): Promise<string> {
    let status = await this.finder.element(by.css('deployment-status-icon > span')).getAttribute('title');

    if (status.trim() === DeploymentStatus.OK) {
      return Promise.resolve(DeploymentStatus.OK);
    } else {
      throw 'Unexpected deployment status: ' + status;
    }
  }

  async getPodsCount(): Promise<number> {
    let text = await this.finder.element(by.css('.deployments-donut-chart-mini-text')).getText();
    let countString = text.match(/\d+/g);
    let count: number;

    if (countString === null || countString.length !== 1) {
      throw 'Unexpected pod count text: ' + text;
    } else {
      count = countString.map(Number)[0];
    }
    return Promise.resolve(count);
  }

  async getRunningPodsCount(): Promise<number> {
    let isDisplayed = await this.finder.element(by.id('pod_status_Running')).$('span').isDisplayed();

    if (!isDisplayed) {
      this.displayAdditionalInfo();
    }

    isDisplayed = await this.finder.element(by.id('pod_status_Running')).$('span').isDisplayed();
    if (!isDisplayed) {
      throw 'Pod status is not displayed';
    }


    let text = await this.finder.element(by.id('pod_status_Running')).$('span').getText();
    let countString = text.match(/\d+/g);
    let count: number;

    if (countString === null || countString.length !== 1) {
      throw 'Unexpected running pod count text: ' + text;
    } else {
      count = countString.map(Number)[0];
    }
    return Promise.resolve(count);
  }

  private async displayAdditionalInfo() {
    await this.finder.element(by.css('deployment-status-icon')).click();
  }
}

export enum DeploymentStatus {
  OK = 'Everything is ok'
}

export class ResourceUsageData {

  private finder: ElementFinder;

  constructor(finder: ElementFinder | undefined) {
    if (finder === undefined) {
      throw 'Finder is undefined';
    }
    this.finder = finder;
  }

  async getItems(): Promise<ResourceUsageDataItem[]> {
    let elementsFinders: ElementFinder[] = await this.finder.all(by.tagName('utilization-bar'));

    let items = new Array<ResourceUsageDataItem>();
    for (let finder of elementsFinders) {
      items.push(new ResourceUsageDataItem(finder));
    }
    return Promise.resolve(items);
  }
}

export class ResourceUsageDataItem {

  private finder: ElementFinder;

  constructor(finder: ElementFinder | undefined) {
    if (finder === undefined) {
      throw 'Finder is undefined';
    }
    this.finder = finder;
  }

  async getActualValue(): Promise<number> {
    return this.getValue(0);
  }

  async getMaximumValue(): Promise<number> {
    return this.getValue(1);
  }

  private async getValue(index: number): Promise<number> {
    let text = await this.finder.element(by.id('resourceCardLabel')).getText();
    let valueString = text.split('of')[index].trim().match(/\d+/g);
    let value: number;

    if (valueString === null || valueString.length !== 1) {
      throw 'Unexpected resource usage value text: ' + text;
    } else {
      value = valueString.map(Number)[0];
    }
    return Promise.resolve(value);
  }
}

