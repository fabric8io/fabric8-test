/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, ExpectedConditions as until, $, ElementFinder } from 'protractor';
import { AppPage } from './app.page';
import { SpaceAppPage } from './space_app.page';
import { SpaceTabPage } from './space_tab.page';
import * as ui from '../ui';
import { AddToSpaceDialog } from './space_dashboard/add_to_space_dialog';
import { Button, BaseElement } from '../ui';
import { SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { DEFAULT_WAIT } from '../support';
import { FeatureLevel } from '../support/feature_level';

// The main page that represents a Space
export class SpaceDashboardPage extends SpaceAppPage {

  /* Analyze/Plan/Create - Navigation bar elements unique to space home display */
  headerAnalyze = element(by.xpath('.//*[contains(text(),\'Analyze\')]'));
  headerPlan = element(by.xpath('.//*[contains(text(),\'Plan\')]'));

  /* Dialog to create new project/add to space */
  // tslint:disable:max-line-length
  wizardStepTitle = element(by.xpath('.//*[contains(@class,\'wizard-step-title\') and contains(text(),\'Quickstart\')]'));
  // tslint:enable:max-line-length
  closeButton = $('#pficon.pficon-close');
  cancelButton = this.wizardStepTitle.element(by.buttonText('Cancel'));

  /* Associate github repo in code base */
  gitHubRepo = $('#gitHubRepo');

  /* UI Page Section: Analyze Overview (main body of page Bar */

  /* UI Page Section: Codebases */
  codebases = $('#spacehome-codebases-card');

  /* Codebases section title/link */
  //  codebasesSectionTitle = $('#spacehome-codebases-title');
  codebasesSectionTitle = new Button($('#spacehome-codebases-title'), 'Codebases Section Title');

  /* Codebases create code base link */
  // tslint:disable:max-line-length
  codebasesCreateLink = element(by.xpath('.//*[contains(@class,\'card-pf-title\')]/..//*[contains(text(), \'Create Codebase\')]'));
  addCodebaseButton = this.codebases.element(by.buttonText('Add Codebase'));

  /* UI Page Section: Analytics/Stack Reports */
  stackReports = $('#spacehome-analytical-report-card');

  /* Stack/Analytical Reports */
  stackReportsSectionTitle = $('#spacehome-analytical-report-title');
  stackReportsButton = new Button(element(by.xpath('.//*[contains(@class,\'stack-reports-btn\')]')), 'Stack Report ...');
  analyticsCloseButton = new Button(element(by.xpath('.//*[contains(text(),\'Stack report for\')]/../button')), 'Analytics Close Button ...');
  stackReportDependencyCard = $('analytics-report-summary .analytics-summary-report').$$('analytics-summary-card').get(3).$('analytics-summary-content').$$('ana-summary-info');
  stackReportDependencyCardTotalCount = this.stackReportDependencyCard.get(0).$('.info-value');
  stackReportDependencyCardAnalyzedCount = this.stackReportDependencyCard.get(1).$('.info-value');
  stackReportDependencyCardUnknownCount = this.stackReportDependencyCard.get(2).$('.info-value');

  /* UI Page Section: My Workitems */
  workitems = $('#spacehome-my-workitems-card');

  /* My Workitems section title/link */
  workitemsSectionTitle = $('#spacehome-my-workitems-title');
  createWorkitemButton = $('#spacehome-my-workitems-create-button');

  /* UI Page Section: Pipelines */
  pipelines = $('#spacehome-pipelines-card');

  /* Pipeline Runs */
  viewPipelineRuns = new Button(element(by.xpath('.//*[contains(text(), \'View Pipeline Runs\')]')), 'View Pipeline Runs');
  pipelineList = element.all(by.xpath('.//*[contains(@class,\'build-pipeline\')]'));

  /* Pipelines section title/link */
  pipelinesSectionTitle = new Button($('#spacehome-pipelines-title'), 'Pipeline Section Title');

  addToSpaceButton = new Button($('#spacehome-pipelines-add-button'), 'Add to Space');

  createAnApplicationButton = this.innerElement(
    ui.Button, '#analyze-overview-dashboard-add-to-space-button', 'Create an Application');

  /* UI Page Section: Environments */
  environments = $('spacehome-environments-card');

  /* Environments section title/link */
  environmentsSectionTitle = $('#spacehome-environments-title');

  /* The "Create" subpage of the space home page */
  headerCreate = element(by.xpath('.//*[contains(text(),\'Create\')]'));
  headerCodebases = element(by.xpath('.//*[contains(text(),\'Codebases\')]'));

  /* Pipelines tab under Create */
  headerPipelines = element(by.xpath('.//span[contains(text(),\'Pipelines\')]'));

  /* Workspaces tab under Create */
  createWorkspace = element(by.xpath('.//codebases-item-workspaces[1]'));

  /* Fade-in background for when the add to space dialog is present */
  fadeIn = element(by.xpath('.//*[contains(@class,\'modal-backdrop fade in\')]'));
  modalFade = element(by.xpath('.//*[contains(@class,\'modal fade\')]'));
  wizardSidebar = element(by.xpath('.//*[contains(@class,\'wizard-pf-sidebar\')]'));

  constructor(spaceName: string) {
    super();
    // TODO: create a better way to access globals like username
    this.url = `${browser.params.login.user}/${spaceName}`;
  }

  async ready() {
    await super.ready();
  }

  async addToSpace(): Promise<AddToSpaceDialog> {
    switch (browser.params.feature.level) {
      case FeatureLevel.INTERNAL:
        await this.createAnApplicationButton.clickWhenReady();
        break;
      case FeatureLevel.RELEASED:
      case FeatureLevel.BETA:
      case FeatureLevel.EXPERIMENTAL:
      default:
        await this.addToSpaceButton.clickWhenReady();
    }
    // NOTE: outside the dialog is outside of $(this)
    let wizard = new AddToSpaceDialog($('body > modal-container > div.modal-dialog'));
    return wizard;
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
}

export class AnalyticsCard extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Analyses');
  }

  async ready() {
    await super.ready();
    await browser.wait(until.stalenessOf(this.element(by.className('pre-loader-spinner'))));
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

  public async openPlanner(): Promise<number> {
    throw 'Not yet implemented';
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
    // tslint:disable-next-line:max-line-length
    let elementsFinders: ElementFinder[] = await this.element(by.id('spacehome-pipelines-list')).all(by.className('list-group-item'));
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
    await browser.wait(until.stalenessOf(element(by.cssContainingText('div', 'Loading'))), DEFAULT_WAIT);
    await browser.wait(until.presenceOf(element(by.id('spacehome-environments-list'))), DEFAULT_WAIT);
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
