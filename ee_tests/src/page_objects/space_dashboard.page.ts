/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, ExpectedConditions as until, $, ElementFinder } from 'protractor';
import { AppPage } from './app.page';
import * as ui from '../ui';
import { AddToSpaceDialog } from './space_dashboard/add_to_space_dialog';
import { Button, BaseElement } from '../ui';
import { SpacePipelinePage } from '.';
import { DEFAULT_WAIT } from '../support';
import { FeatureLevel } from '../support/feature_level';

abstract class SpaceTabPage extends AppPage {

  mainNavBar = new ui.BaseElement(
    this.header.$('ul.nav.navbar-nav.navbar-primary.persistent-secondary'),
    'Main Navigation Bar'
  );

  planTab = new ui.Clickable(
    this.mainNavBar.element(by.cssContainingText('li', 'Plan')),
    'Plan'
  );

  constructor(public spaceName: string) {
    super();
  }

  // todo: add ready when we can consider the headers ready
  async ready() {
    await super.ready();
    await this.mainNavBar.ready();
    await this.planTab.ready();
  }

  async gotoPlanTab(): Promise<PlannerTab> {
    await this.planTab.clickWhenReady();
    // NOTE: outside the dialog is outside of $(this)
    let planner = new PlannerTab(this.spaceName);
    await planner.open();
    return planner;
  }

}

type WorkItemType = 'task' | 'feature' | 'bug';

interface WorkItem {
  title: string;
  description?: string;
  type?: WorkItemType;
}

class WorkItemQuickAdd extends ui.Clickable {
  titleTextInput = new ui.TextInput(this.$('input.f8-quickadd-input'), 'Work item Title');
  buttonsDiv = this.$('div.f8-quickadd__wiblk-btn.pull-right');
  acceptButton = new ui.Button(this.buttonsDiv.$('button.btn.btn-primary'), '✓');
  cancelButton = new ui.Button(this.buttonsDiv.$('button.btn.btn-default'), 'x');

  constructor(el: ElementFinder, name = 'Work Item Quick Add') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.untilClickable();
  }

  async createWorkItem({ title, description = '', type = 'feature' }: WorkItem) {
    await this.clickWhenReady();
    await this.titleTextInput.ready();
    await this.titleTextInput.enterText(title);
    await this.cancelButton.untilClickable();

    await this.acceptButton.clickWhenReady();

    // TODO add more confirmation that the item has been added
    await this.cancelButton.clickWhenReady();

    // TODO choose the type of item
    this.log('New WorkItem', `${title} added`);
  }
}

class WorkItemList extends ui.BaseElement {
  overlay = new ui.BaseElement(this.$('div.lock-overlay-list'));

  quickAdd = new WorkItemQuickAdd(
    this.$('#workItemList_quickAdd > alm-work-item-quick-add > div'));

  constructor(el: ElementFinder, name = 'Work Item List') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.overlay.untilAbsent();
    await this.quickAdd.ready();
  }
}

// this is what you see when you click on the Plan Tab button
class PlannerTab extends SpaceTabPage {
  workItemList = new WorkItemList(this.appTag.$('alm-work-item-list'));

  constructor(public spaceName: string) {
    super(spaceName);
    this.url = `${browser.params.login.user}/${spaceName}/plan`;
  }

  async ready() {
    await super.ready();
    await this.workItemList.ready();
  }

  async createWorkItem(item: WorkItem) {
    this.debug('create item', JSON.stringify(item));
    await this.workItemList.quickAdd.createWorkItem(item);
  }
}

// The main page that represents a Space
export class SpaceDashboardPage extends SpaceTabPage {

  /* Dialog to create new space and project */
  newSpaceName = $('#name');
  createSpaceButton = $('#createSpaceButton');
  devProcessPulldown = $('#developmentProcess');

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
    super(spaceName);

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
    let finder = element(by.tagName('fabric8-add-codebase-widget'));
    return new CodebaseCard(finder);
  }

  async getAnalyticsCard(): Promise<AnalyticsCard> {
    let finder = element(by.tagName('fabric8-analytical-report-widget'));
    let card = new AnalyticsCard(finder);
    await card.ready();
    return card;
  }

  async getWorkItemsCard(): Promise<WorkItemsCard> {
    let finder = element(by.tagName('fabric8-create-work-item-widget'));
    return new WorkItemsCard(finder);
  }

  async getPipelinesCard(): Promise<PipelinesCard> {
    let finder = element(by.tagName('fabric8-pipelines-widget'));
    return new PipelinesCard(finder);
  }

  async getDeploymentsCard(): Promise<DeploymentsCard> {
    let finder = element(by.tagName('fabric8-environment-widget'));
    return new DeploymentsCard(finder);
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
    let elementsFinders: ElementFinder[] =
      await this.element(by.id('spacehome-environments-list')).all(by.tagName('li'));
    let applications = await elementsFinders.map(finder => new DeployedApplicationInfo(finder));
    return Promise.all(applications);
  }
}

// tslint:enable:max-line-length

export class DeployedApplicationInfo extends BaseElement {

  constructor(finder: ElementFinder) {
    super(finder, 'Deployed application');
  }

  public async getName(): Promise<string> {
    return this.element(by.tagName('h5')).getText();
  }

  public async getStageVersion(): Promise<string> {
    let text = await this.element(by.cssContainingText('a', 'stage')).getText();
    text = text.split('-')[1].trim();
    return Promise.resolve(text);
  }

  public async getRunVersion(): Promise<string> {
    let text = await this.element(by.cssContainingText('a', 'run')).getText();
    text = text.split('-')[1].trim();
    return Promise.resolve(text);
  }
}
