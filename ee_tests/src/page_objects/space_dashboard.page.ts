import { $, browser, by, element, ElementFinder, ExpectedConditions as until } from 'protractor';
import { SpaceAppPage } from './space_app.page';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';
import { SpacePipelinePage } from './space_pipeline_tab.page';
import * as timeouts from '../support/timeouts';
import { specContext } from '../support/spec_context';

export class SpaceDashboardPage extends SpaceAppPage {

  constructor(spaceName: string) {
    super();
    this.url = `${specContext.getUser()}/${spaceName}`;
  }

  async addToSpace(): Promise<void> {
    let addToSpaceButton = new Button($('#spacehome-pipelines-add-button'), 'Add to Space');
    await addToSpaceButton.clickWhenReady();
  }

  async getCodebaseCard(): Promise<CodebaseCard> {
    let codeBaseWidget = new BaseElement(element(by.tagName('fabric8-add-codebase-widget')), 'Codebase widget');
    await codeBaseWidget.ready();

    return new CodebaseCard(codeBaseWidget);
  }

  async getAnalyticsCard(): Promise<AnalyticsCard> {
    let analyticsWidget = new BaseElement(element(by.tagName('fabric8-analytical-report-widget')), 'Analytics widget');
    await analyticsWidget.ready();

    let card = new AnalyticsCard(analyticsWidget);
    await card.ready();
    return card;
  }

  async getWorkItemsCard(): Promise<WorkItemsCard> {
    let workItemsWidget = new BaseElement(element(by.tagName('fabric8-create-work-item-widget')), 'WorkItems widget');
    await workItemsWidget.ready();

    return new WorkItemsCard(workItemsWidget);
  }

  async getPipelinesCard(): Promise<PipelinesCard> {
    let pipelinesWidget = new BaseElement(element(by.tagName('fabric8-pipelines-widget')), 'Pipelines widget');
    await pipelinesWidget.ready();

    return new PipelinesCard(pipelinesWidget);
  }

  async getDeploymentsCard(): Promise<DeploymentsCard> {
    let deploymentsWidget = new BaseElement(element(by.tagName('fabric8-environment-widget')), 'Deployments widget');
    await deploymentsWidget.ready();

    return new DeploymentsCard(deploymentsWidget);
  }
}

export abstract class SpaceDashboardPageCard extends BaseElement {

  constructor(finder: ElementFinder, name: string) {
    super(finder, name);
  }

  public async abstract getCount(): Promise<number>;

  protected async getCountByID(elementID: string, elementDescription: string): Promise<number> {
    let text = await this.element(by.id(elementID)).getText();
    let count = this.string2Number(text, 'Unexpected ' + elementDescription + ' count text');
    return Promise.resolve(count);
  }
}

export class CodebaseCard extends SpaceDashboardPageCard {

  constructor(finder: ElementFinder) {
    super(finder, 'Codebases');
  }

  public async getCount(): Promise<number> {
    return this.getCountByID('spacehome-codebases-badge', 'codebases');
  }

  public async getCodebases(): Promise<string[]> {
    let elementsFinders: ElementFinder[] = await this.all(by.className('f8-card-codebase-url'));
    let codeBases = await elementsFinders.map(async (finder) => await finder.getText());
    return Promise.all(codeBases);
  }

  public async openCodebasesPage(): Promise<void> {
    let codebasesSectionTitle = new Button($('#spacehome-codebases-title'), 'Codebases Section Title');
    return codebasesSectionTitle.clickWhenReady();
  }
}

export class AnalyticsCard extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Analyses');
  }

  async ready() {
    await super.ready();
    await browser.wait(until.stalenessOf(this.element(by.cssContainingText('h3', 'No results found'))),
      timeouts.DEFAULT_WAIT, 'Staleness of element with text "No results found" which means that the analytics ' +
      'report on space dashboard was not generated, could be caused by overloaded analytics service ' +
      '(SLA 30 minutes) or by missing annotation "fabric8.io/bayesian.analysisUrl" ' +
      '(check oc-jenkins-logs.txt)');
    await browser.wait(until.stalenessOf(this.element(by.className('pre-loader-spinner'))),
      timeouts.DEFAULT_WAIT, 'Staleness of element with class name pre-loader-spinner (meaning that the ' +
      'analytics report on space dashboard is still loading)');
  }

  public async getTotalDependenciesCount(): Promise<number> {
    await this.ready();
    let text = await this.element(by.cssContainingText('b', 'Total:')).getText();
    let count = this.string2Number(text, 'total dependencies');
    return Promise.resolve(count);
  }

  public async getAnalyzedDependenciesCount(): Promise<number> {
    let text = await this.element(by.cssContainingText('b', 'Analyzed:')).getText();
    let count = this.string2Number(text, 'analyzed dependencies');
    return Promise.resolve(count);
  }

  public async getUnknownDependenciesCount(): Promise<number> {
    let text = await this.element(by.cssContainingText('b', 'Unknown:')).getText();
    let count = this.string2Number(text, 'unknown dependencies');
    return Promise.resolve(count);
  }
}

export class WorkItemsCard extends SpaceDashboardPageCard {

  constructor(finder: ElementFinder) {
    super(finder, 'WorkItems');
  }

  public async getCount(): Promise<number> {
    return this.getCountByID('spacehome-my-workitems-badge', 'workitems');
  }

  public async getWorkItems(): Promise<string[]> {
    if (! await this.element(by.id('spacehome-my-workitems-list')).isPresent()) {
      return Promise.resolve([]);
    }
    let items = await this.element(by.id('spacehome-my-workitems-list')).all(by.className('f8-list-group-item-link'));
    let itemNames: string[] = [];
    for (let item of items) {
      itemNames.push(await item.getText());
    }
    return Promise.resolve(itemNames);
  }

  public async openPlanner(): Promise<void> {
    await this.element(by.cssContainingText('a', 'My Work Items')).click();
  }
}

export class PipelinesCard extends SpaceDashboardPageCard {

  constructor(finder: ElementFinder) {
    super(finder, 'Pipelines');
  }

  public async openPipelinesPage(): Promise<SpacePipelinePage> {
    await this.element(by.cssContainingText('a', 'Pipelines')).click();
    let page = new SpacePipelinePage();
    await page.open();
    return Promise.resolve(page);
  }

  public async getCount(): Promise<number> {
    return this.getCountByID('spacehome-pipelines-badge', 'pipelines');
  }

  public async getPipelines(): Promise<Pipeline[]> {
    let elementsFinders: ElementFinder[] =
      await this.element(by.id('spacehome-pipelines-list')).all(by.className('list-group-item'));
    let pipelines = await elementsFinders.map(finder => new Pipeline(finder));
    return Promise.resolve(pipelines);
  }
}

export class Pipeline extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Pipeline');
  }

  public async getApplication(): Promise<string> {
    return this.element(by.className('f8-card__pipeline-column-name')).getText();
  }

  public async getStatus(): Promise<string> {
    let text = await this.element(by.className('f8-card__pipeline-column-status')).getText();
    let status: string = text.replace('Status:', '').trim();
    return Promise.resolve(status);
  }

  public async getBuildNumber(): Promise<number> {
    let text = await this.element(by.className('f8-card__pipeline-column-build')).getText();
    let count = this.string2Number(text, 'build number');
    return Promise.resolve(count);
  }
}

export class DeploymentsCard extends SpaceDashboardPageCard {

  constructor(finder: ElementFinder) {
    super(finder, 'Deployments');
  }

  public async getCount(): Promise<number> {
    return this.getCountByID('spacehome-environments-badge', 'deployments');
  }

  public async getApplications(): Promise<DeployedApplicationInfo[]> {
    await browser.wait(until.stalenessOf(element(by.cssContainingText('div', 'Loading'))),
      timeouts.DEFAULT_WAIT, 'Staleness of Loading text');
    await browser.wait(until.presenceOf(element(by.id('spacehome-environments-list'))),
      timeouts.DEFAULT_WAIT, 'Element with id spacehome-environments-list is present');
    let elementsFinders: ElementFinder[] =
      await this.element(by.id('spacehome-environments-list')).all(by.tagName('li'));
    let applications = await elementsFinders.map(finder => new DeployedApplicationInfo(finder));
    return Promise.all(applications);
  }
}

// tslint:enable:max-line-length

export class DeployedApplicationInfo extends BaseElement {

  private stageLink = new BaseElement(this.element(by.cssContainingText('a', 'stage')), 'Stage link');

  private runLink = new BaseElement(this.element(by.cssContainingText('a', 'run')), 'Run link');

  constructor(finder: ElementFinder) {
    super(finder, 'Deployed application');
  }

  public async getName(): Promise<string> {
    return this.element(by.tagName('h5')).getText();
  }

  public async getStageVersion(): Promise<string> {
    let text = await this.stageLink.getText();
    text = text.split('-')[1].trim();
    return Promise.resolve(text);
  }

  public async getRunVersion(): Promise<string> {
    let text = await this.runLink.getText();
    text = text.split('-')[1].trim();
    return Promise.resolve(text);
  }

  public async openStageLink() {
    await this.stageLink.clickWhenReady();
  }

  public async openRunLink() {
    await this.runLink.clickWhenReady();
  }
}
