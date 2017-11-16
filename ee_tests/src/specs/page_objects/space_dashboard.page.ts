/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import { AppPage } from './app.page';
import * as ui from '../ui';
import { AddToSpaceDialog } from './space_dashboard/add_to_space_dialog'

/*
Page layout
|--------------------------------------------------------------------------------------------------------------------|
|                                          Top Navigation Bar                                                        |
| Left Navigation Bar            |                                                  | Right Navigation Bar           |
|                                |                                                  |                                |
|                                                                                                                    |
| Persistent navigation bar                                                                                          |
|--------------------------------------------------------------------------------------------------------------------|
|                                       |                                                                            |
|                                       |                                                                            |
|          Codebases                    |                       Stack Reporrs                                        |
|                                       |                                                                            |
|                                       |                                                                            |
|--------------------------------------------------------------------------------------------------------------------|
|                                       |                                    |                                       |
|                                       |                                    |                                       |
|          My Work Items                |             Pipelines              |        Environments                   |
|                                       |                                    |                                       |
|                                       |                                    |                                       |
|--------------------------------------------------------------------------------------------------------------------|
*/


abstract class SpaceTabPage extends AppPage {

  mainNavBar = new ui.BaseElement(
    this.header.$('ul.nav.navbar-nav.navbar-primary.persistent-secondary'),
    'Main Navigation Bar'

  )

  planTab = new ui.Clickable(
    this.mainNavBar.element(by.cssContainingText('li', 'Plan')),
    'Plan'
  );

  constructor(public spaceName: string) {
    super();
  }

  // todo: add ready when we can consider the headers ready
  async ready() {
    await super.ready()
    await this.mainNavBar.ready()
    await this.planTab.ready()
  }

  async gotoPlanTab(): Promise<PlannerTab> {
    await this.planTab.clickWhenReady()
    // NOTE: outside the dialog is outside of $(this)
    let planner  = new PlannerTab(this.spaceName)
    await planner.open();
    return planner;
  }

}

type WorkItemType = 'task' | 'feature' | 'bug'

interface WorkItem {
  title: string
  description?: string
  type?: WorkItemType
}

class WorkItemQuickAdd extends ui.Clickable {
  titleTextInput = new ui.TextInput(this.$('input.f8-quickadd-input'), 'Work item Title')
  buttonsDiv = this.$('div.f8-quickadd__wiblk-btn.pull-right')
  acceptButton = new ui.Button(this.buttonsDiv.$('button.btn.btn-primary'), '✓')
  cancelButton = new ui.Button(this.buttonsDiv.$('button.btn.btn-default'), 'x')

  constructor(el: ElementFinder, name = 'Work Item Quick Add') {
    super(el, name)
  }

  async ready() {
    await super.ready()
    await this.untilClickable()
  }

  async createWorkItem({ title, description = '', type = 'feature' }: WorkItem) {
    await this.clickWhenReady();
    await this.titleTextInput.ready()
    await this.titleTextInput.enterText(title)
    await this.cancelButton.untilClickable();

    await this.acceptButton.clickWhenReady()

    // TODO add more confirmation that the item has been added
    await this.cancelButton.clickWhenReady()

    // TODO choose the type of item
    this.log('New WorkItem', `${title} added`)
  }
}

class WorkItemList extends ui.BaseElement {
  overlay = new ui.BaseElement(this.$('div.lock-overlay-list'));

  quickAdd =  new WorkItemQuickAdd(
    this.$('#workItemList_quickAdd > alm-work-item-quick-add > div'));

  constructor(el: ElementFinder, name = 'Work Item List') {
    super(el, name)
  }

  async ready() {
    await super.ready()
    await this.overlay.untilAbsent()
    await this.quickAdd.ready()
  }
}

// this is what you see when you click on the Plan Tab button
class PlannerTab extends SpaceTabPage {
  workItemList = new WorkItemList(this.appTag.$('alm-work-item-list'));

  constructor(public spaceName: string) {
    super(spaceName);
    this.url = `${browser.params.login.user}/${spaceName}/plan`
  }

  async ready() {
    await super.ready();
    await this.workItemList.ready();
  }

  async createWorkItem(item: WorkItem) {
    this.debug('create item', JSON.stringify(item))
    await this.workItemList.quickAdd.createWorkItem(item)
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
  codebasesSectionTitle = $('#spacehome-codebases-title');

  /* Codebases create code base link */
  // tslint:disable:max-line-length
  codebasesCreateLink = element(by.xpath('.//*[contains(@class,\'card-pf-title\')]/..//*[contains(text(), \'Create Codebase\')]'));
  addCodebaseButton = this.codebases.element(by.buttonText('Add Codebase'));

  /* UI Page Section: Analytics/Stack Reports */
  stackReports = $('#spacehome-analytical-report-card');

  /* Stack/Analytical Reports */
  stackReportsSectionTitle = $('#spacehome-analytical-report-title');
  stackReportsButton = element (by.xpath('.//*[contains(@class,\'stack-reports-btn\')]'));
  stackReportSection = $('#fabric8-stack-analysis');
  stackReportSummaries = $('#stack-report-inshort');
  stackReportFindingsInShort = $('#findings-inshort');
  stackReportSummaryInShort = $('#summary-inshort');
  stackReportRecommendationsInShort = $('#recommendations-inshort');
  stackReportDetailedReport = $('#modal.in.fade');
  detailedReportHeading = element (by.xpath('.//*[contains(text(),\'Stack report\')]/..'));
  detailedAnalysisHeading = element (by.xpath('.//*[contains(text(),\'Detail analysis of your stack components\')]'));
  additionalComponentsHeading = element (by.xpath('.//*[contains(text(),\'Additional components recommended by Openshift IO\')]'));
  dependenciesTable = element (by.xpath('.//*[contains(text(),\'Detail analysis of your stack components\')]/../../../../../div[2]/div/component-level-information/div/div/table'));
  dependenciesTableViewToggle = element (by.xpath('.//*[contains(text(),\'Detail analysis of your stack components\')]/../i'));
  additionalComponentsTable = element (by.xpath('.//*[contains(text(),\'Additional components recommended by Openshift IO\')]/../../../../../div[2]/div/component-level-information/div/div/table'));
  additionalComponentsTableViewToggle = element (by.xpath('.//*[contains(text(),\'Additional components recommended by Openshift IO\')]/../i'));
  analyticsCloseButton = element (by.xpath('.//h4[contains(text(),\'Report title on Application\')]/../button'));
  // tslint:enable:max-line-length

  /* UI Page Section: My Workitems */
  workitems = $('#spacehome-my-workitems-card');

  /* My Workitems section title/link */
  workitemsSectionTitle = $('#spacehome-my-workitems-title');
  createWorkitemButton = $('#spacehome-my-workitems-create-button');

  /* UI Page Section: Pipelines */
  pipelines = $('#spacehome-pipelines-card');

  /* Pipelines section title/link */
  pipelinesSectionTitle = $('#spacehome-pipelines-title');
  addToSpaceButton = this.innerElement(
    ui.Button, '#analyze-overview-add-to-space-button', 'Add to space')

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

  spaceName: string;

  constructor(spaceName: string) {
    super(spaceName);

    // TODO: create a better way to access globals like username
    this.url = `${browser.params.login.user}/${spaceName}`
  }

  async ready() {
    await super.ready()
    await this.addToSpaceButton.ready()
  }

  async addToSpace(): Promise<AddToSpaceDialog> {
    await this.addToSpaceButton.clickWhenReady()
    // NOTE: outside the dialog is outside of $(this)
    let wizard  = new AddToSpaceDialog($('body > modal-container > div.modal-dialog'))

    await wizard.open();
    return wizard;
  }

}
