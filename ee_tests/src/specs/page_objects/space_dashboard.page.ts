/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import { AppPage } from './app.page';
import { SpaceDashboardHeader, AddToSpaceDialog } from './../ui/space_dashboard';
import * as ui from '../ui';
import * as support from '../support';

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

// The main page that represents a Space
export class SpaceDashboardPage extends AppPage {
  spaceName: string;
  header = new SpaceDashboardHeader(this.appTag.$('alm-app-header'), this.spaceName, 'Space Dashboard page header');
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
  codebasesSectionTitle = new ui.Button ($('#spacehome-codebases-title'), 'Codebases Section Title');

  /* Codebases create code base link */
  // tslint:disable:max-line-length
  codebasesCreateLink = element(by.xpath('.//*[contains(@class,\'card-pf-title\')]/..//*[contains(text(), \'Create Codebase\')]'));
  addCodebaseButton = this.codebases.element(by.buttonText('Add Codebase'));

  /* UI Page Section: Analytics/Stack Reports */
  stackReports = $('#spacehome-analytical-report-card');

  /* Stack/Analytical Reports */
  stackReportsSectionTitle = $('#spacehome-analytical-report-title');
  stackReportsButton = new ui.Button(element (by.xpath('.//*[contains(@class,\'stack-reports-btn\')]')), 'Stack Report ...');
  analyticsCloseButton = new ui.Button(element (by.xpath('.//*[contains(text(),\'Stack report for\')]/../button')), 'Analytics Close Button ...');
  detailedReportHeading = element (by.xpath('.//*[contains(text(),\'Show complete stack report\')]/..'));
   // tslint:enable:max-line-length

  /* UI Page Section: My Workitems */
  workitems = $('#spacehome-my-workitems-card');

  /* My Workitems section title/link */
  workitemsSectionTitle = $('#spacehome-my-workitems-title');
  createWorkitemButton = $('#spacehome-my-workitems-create-button');

  /* UI Page Section: Pipelines */
  pipelines = $('#spacehome-pipelines-card');

  /* Pipelines section title/link */
  pipelinesSectionTitle = new ui.Button($('#spacehome-pipelines-title'), 'Pipeline Section Title');

  addToSpaceButton = this.innerElement(
    ui.Button, '#analyze-overview-add-to-space-button', 'Add to space');

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
    // TODO: create a better way to access globals like username
    super(`${browser.params.login.user}/${spaceName}`);
    this.spaceName = spaceName;
  }

  async ready() {
    support.debug(' ... check if SpaceDashboard page is Ready');
    await super.ready()
    await this.addToSpaceButton.ready()
    support.debug(' ... check if SpaceDashboard page is Ready - OK');
  }

  async addToSpace(): Promise<AddToSpaceDialog> {
    await this.addToSpaceButton.clickWhenReady()
    // NOTE: outside the dialog is outside of $(this)
    let wizard  = new AddToSpaceDialog($('body > modal-container > div.modal-dialog'))

    await wizard.open();
    return wizard;
  }

}
