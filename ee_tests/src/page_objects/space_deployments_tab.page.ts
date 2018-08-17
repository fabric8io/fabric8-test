import { browser, by, element, ElementFinder, ExpectedConditions as until } from 'protractor';
import * as support from '../support';
import { AppPage } from './app.page';
import { BaseElement } from '../ui';

export class SpaceDeploymentsPage extends AppPage {

  async getDeployedApplications(): Promise<DeployedApplication[]> {
    await browser.wait(until.visibilityOf(element(by.tagName('deployment-card-container'))),
      support.LONGER_WAIT, 'Element <deployment-card-container> is present');

    let elementFinders: ElementFinder[] = await element.all(by.tagName('deployment-card-container'));
    let applications = await elementFinders.map(finder => new DeployedApplication(finder));
    return Promise.resolve(applications);
  }

  async getResourceUsageData(): Promise<ResourceUsageData[]> {
    await browser.wait(until.visibilityOf(element(by.tagName('resource-card'))),
      support.LONGER_WAIT, 'Element <resource-card> is present');

    let elementFinders: ElementFinder[] = await element.all(by.tagName('resource-card'));
    let data = await elementFinders.map(finder => new ResourceUsageData(finder));
    return Promise.resolve(data);
  }
}

export enum Environment {
  STAGE = 0,
  RUN = 1
}

export class DeployedApplication extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Deployments');
  }

  async getName(): Promise<string> {
    let name = await this.element(by.id('deploymentCardApplicationTitle')).getText();
    return Promise.resolve(name.trim());
  }

  async getEnvironments(): Promise<DeployedApplicationEnvironment[]> {
    let elementsFinders: ElementFinder[] = await this.all(by.tagName('deployment-card'));
    let environments = await elementsFinders.map(finder => new DeployedApplicationEnvironment(finder));

    let environmentNamesFinders = await this.all(by.className('env-card-title'));

    for (let i = 0; i < environments.length; i++) {
      environments[i].setEnvironmentName(await environmentNamesFinders[i].getText());
    }

    return Promise.resolve(environments);
  }
}

export class DeployedApplicationEnvironment extends BaseElement {

  private environmentName: string | undefined;

  constructor(finder: ElementFinder) {
    super(finder, 'Deployment environments');
  }

  setEnvironmentName(name: string) {
    this.environmentName = name;
  }

  getEnvironmentName(): string | undefined {
    return this.environmentName;
  }

  async getVersion(): Promise<string> {
    return this.element(by.id('versionLabel')).getText();
  }

  async getDeploymentStatus(): Promise<string> {
    let status = await this.element(by.css('deployment-status-icon > span')).getAttribute('title');

    if (status.trim() === DeploymentStatus.OK) {
      return Promise.resolve(DeploymentStatus.OK);
    } else {
      throw 'Unexpected deployment status: ' + status;
    }
  }

  async getPodsCount(): Promise<number> {
    let text = await this.element(by.css('.deployments-donut-chart-mini-text')).getText();
    let countString = text.match(/\d+/g);

    if (countString === null || countString.length !== 1) {
      throw 'Unexpected pod count text: ' + text;
    }
    return Promise.resolve(this.string2Number(countString[0], 'Unexpected pod count text: ' + text));
  }

  async hasRunningPod(): Promise<boolean> {

    await this.displayAdditionalInfo();

    let runningPodElement = await this.all(by.id('pod_status_Running'));
    return runningPodElement.length > 0;
  }

  private async displayAdditionalInfo() {
    let isDisplayed = await this.isAdditionalInfoDisplayed();

    if (!isDisplayed) {
      await this.element(by.css('deployment-status-icon')).click();
      await browser.wait(async () => {
        return await this.isAdditionalInfoDisplayed();
      }, support.DEFAULT_WAIT, 'Display additional deployment info');
    }
  }

  private async isAdditionalInfoDisplayed(): Promise<boolean> {
    let additionalInfoLocator = by.cssContainingText('div', 'Resource Usage');
    let elementFinders = await this.all(additionalInfoLocator);
    return elementFinders.length > 0 && await elementFinders[0].isDisplayed();
  }
}

export enum DeploymentStatus {
  OK = 'Everything is ok'
}

export class ResourceUsageData extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Resource usage');
  }

  async getItems(): Promise<ResourceUsageDataItem[]> {
    let elementsFinders: ElementFinder[] = await this.all(by.tagName('utilization-bar'));
    let items = await elementsFinders.map(finder => new ResourceUsageDataItem(finder));
    return Promise.resolve(items);
  }
}

export class ResourceUsageDataItem extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Resource usage data');
  }

  async getActualValue(): Promise<number> {
    return this.getValue(0);
  }

  async getMaximumValue(): Promise<number> {
    return this.getValue(1);
  }

  private async getValue(index: number): Promise<number> {
    let text = await this.element(by.id('resourceCardLabel')).getText();
    let valueString = text.split('of')[index].trim().match(/\d+/g);

    if (valueString === null || valueString.length !== 1) {
      throw 'Unexpected resource usage value text: ' + text;
    }
    return Promise.resolve(valueString.map(Number)[0]);
  }
}
