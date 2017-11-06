/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import { AppPage } from './app.page';
import { TextInput, Button } from './ui';

export class SpaceDashboardPage extends AppPage {

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

/* Dialog to create new space and project */
  newSpaceName = $('#name');
  createSpaceButton = $('#createSpaceButton');
  devProcessPulldown = $('#developmentProcess');
  noThanksButton = element(by.xpath('.//a[contains(text(),\'No thanks, take me to\')]'));

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
  stackReportsButton = $('#stack-reports-btn');
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
  addToSpaceButton = $('#spacehome-pipelines-add-button');

  /* UI Page Section: Environments */
  environments = $('spacehome-environments-card');

  /* Environments section title/link */
  environmentsSectionTitle = $('#spacehome-environments-title');

  /* New project - 'how would you like to get started?' dialog */
  /* Quickstart - Select technology stack and pipeline */

  /* Add to space actions */
//  createSpaceButton = new Button($('#createSpaceButton'), 'Create Space');
  primaryAddToSpaceButton = new Button($('#analyze-overview-add-to-space-button'), '"Add to Space' );

  /* Quickstarts list */

  // tslint:disable:max-line-length
  quickStartList = element(by.xpath('.//app-generator-single-selection-dropdown'));
  quickStartNextButton2 = new Button (element.all(by.xpath('.//button[contains(text(),\'Next >\')]')).last(), 'Next');
  quickStartNextButton3 = new Button (element.all(by.xpath('.//button[contains(text(),\'Next >\')]')).first(), 'Next');
  quickStartFinishButton2 = new Button (element(by.xpath('.//button[contains(text(),\'Finish\')]')), 'Finish');
  quickStartOkButton = new Button (element(by.xpath('.//button[contains(text(),\'Ok\')]')), 'Ok');
  pipelineStrategy = new Button (element(by.xpath('.//li[contains(@title,\'Release, Stage, Approve and Promote\')]')), 'Strategy');
  technologyStack = new Button ($('#forgeQuickStartButton'), 'Technology Stack');
  importCodebaseButton = new Button ($('#importCodeButton'), 'Import Code Button');
  syncButton = new Button (element(by.xpath('.//*[contains(text(), \'Sync\')]')), 'Synch Button');
  associateRepoButton = new Button (element(by.xpath('.//*[contains(text(), \'Associate Repository to Space\')]')), 'Associate Repo Button');
 // tslint:enable:max-line-length


  /* Technology Stack project types */
  vertXbasic = element(by.xpath('Vert.x - Basic'));
  vertXcrud = element(by.xpath('Vert.x - CRUD'));
  vertXconfigmap = element(by.xpath('Vert.x - ConfigMap'));

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
    super();
    this.spaceName = spaceName;
  }

  /* Quickstarts by name */
  quickStartByName (nameString: string): ElementFinder {
    let xpathString = './/*[contains(@id, \'' + nameString + '\')]/div';
    return element(by.xpath(xpathString));
  }

  importCodebaseByName (nameString: string): ElementFinder {
    let xpathString = './/multiple-selection-list/div/ul/li/label/span[contains(text(),\'' + nameString + '\')]';
    return element(by.xpath(xpathString));
  }


}
