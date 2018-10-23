import { $, browser, by, element, ElementFinder } from 'protractor';
import { BaseElement, BaseElementArray, Clickable } from '../../ui/base.element';
import { Button } from '../../ui/button';
import { ModalDialog } from '../../ui/modal_dialog';
import { MultipleSelectionList } from '../../ui/multi_select_list';
import { SingleSelectionDropdown } from '../../ui/dropdown';
import { TextInput } from '../../ui/text_input';
import { debug, info } from '../../support/logging';
import { LauncherImportAppPage } from '../launcher_import_app.page';
import { LauncherSection } from '../launcher_section';
import { LauncherSetupAppPage} from '../launcher_setup_app.page';
import { Quickstart } from '../../support/quickstart';
import { LauncherReleaseStrategy } from '../../support/launcher_release_strategy';

export class Wizard extends BaseElement {

  footer = new BaseElement(this.$('div.modal-footer'));
  primaryButton = new Button(this.footer.$('button.btn.btn-primary.wizard-pf-next'), 'Next');

  constructor(elem: ElementFinder, name: string = '') {
    super(elem, name);
  }

  async ready() {
    await super.ready();
    await this.footer.ready();
    await this.primaryButton.ready();
  }

}

export interface ProjectDetail {
  project: string;
  name?: string;
  strategy?: string;
}

const PROJECT_CARD = 'div.card-pf';

export class QuickStartWizard extends Wizard {
  filterTextInput = new TextInput(this.$('input[type="text"]'), 'filter');

  // TODO: may be turn this into a widget
  projectSelector = new BaseElement(this.$('ob-project-select'));
  projectCards = new BaseElementArray(this.projectSelector.$$(PROJECT_CARD));

  projectInfoStep = new BaseElement(this.$('project-info-step'));
  // we worry about proj
  projectNameInput = new TextInput(this.projectInfoStep.$('#named'));

  // tslint:disable:max-line-length
  release = new Button(element(by.xpath('.//*[@value=\'Release\']')));
  releaseAndStage = new Button(element(by.xpath('.//*[@value=\'Release and Stage\']')));
  releaseStageApproveAndPromote = new Button(element(by.xpath('.//*[@value=\'Release, Stage, Approve and Promote\']')));
  // tslint:enable:max-line-length

  async ready() {
    await super.ready();
    this.debug(' .wizard ', 'ok');
    await this.footer.ready();
    this.debug(' .footer ', 'ok');

    await this.filterTextInput.ready();
    await this.projectSelector.ready();
    this.debug(' .selection ', 'ok');
    await this.projectCards.ready();
    this.debug(' .cards ', 'ok');
  }

  async findCard(name: string): Promise<Clickable> {
    debug('.finding card', name);
    let cardFinder = by.cssContainingText(PROJECT_CARD, name);
    let elem = this.projectSelector.element(cardFinder);
    let card = new Clickable(elem, name);
    await card.ready();
    debug('.found card', name);
    return card;
  }

  async waitForProjectInfoStep() {
    await this.projectInfoStep.ready();
    await this.projectNameInput.ready();
    await this.primaryButton.ready();
  }

  async newProject({ project, name = '', strategy }: ProjectDetail) {
    let card = await this.findCard(project);
    await card.clickWhenReady();

    await this.primaryButton.clickWhenReady();
    await this.waitForProjectInfoStep();

    await this.projectNameInput.enterText(name);
    await this.primaryButton.clickWhenReady();

    /* Set the release strategy */

    switch (strategy) {
      case 'releaseStageApproveAndPromote': {
        await this.releaseStageApproveAndPromote.clickWhenReady();
        break;
      }
      case 'releaseAndStage': {
        await this.releaseAndStage.clickWhenReady();
        break;
      }
      case 'release': {
        await this.release.clickWhenReady();
        break;
      }
      default: {
        await this.releaseStageApproveAndPromote.clickWhenReady();
        break;
      }
    }

    await this.primaryButton.clickWhenReady();
    await this.primaryButton.untilTextIsPresent('Finish');

    // call it 'Finish' to match what is seen on UI
    this.primaryButton.name = 'Finish';
    await this.primaryButton.clickWhenReady();

    await this.primaryButton.untilTextIsPresent('Ok');

    // call it 'Ok' to match what is seen on UI
    this.primaryButton.name = 'Ok';
    await this.primaryButton.clickWhenReady();
  }
}

export interface RepoDetail {
  org: string;
  repositories: string[];
}

export class ImportCodeWizard extends Wizard {

  githubOrg = new SingleSelectionDropdown(
    this.$('organisation-step single-selection-dropdown'), 'Github Org');

  repoList = new MultipleSelectionList(
    this.$('multiple-selection-list'), 'Repository List');

  async ready() {
    await super.ready();
  }

  async waitForGithubOrg() {
    await this.githubOrg.ready();
  }

  async importCode({ org, repositories }: RepoDetail) {
    await this.primaryButton.ready();
    await this.waitForGithubOrg();
    await this.githubOrg.select(org);
    await this.primaryButton.clickWhenReady();

    await this.repoList.ready();
    repositories.forEach(async (r) => await this.repoList.select(r));
    await this.primaryButton.clickWhenReady();
    // deployment choose default
    await this.primaryButton.clickWhenReady();

    await this.primaryButton.untilTextIsPresent('Finish');
    this.primaryButton.name = 'Finish';
    await this.primaryButton.clickWhenReady();

    await this.primaryButton.untilTextIsPresent('Ok');
    this.primaryButton.name = 'Ok';
    await this.primaryButton.clickWhenReady();
  }

}

export class AddToSpaceDialog extends ModalDialog {

  noThanksButton = new Button($('#noThanksButton'), 'No Thanks ...');
  importExistingCodeButton = new Button(
    $('#importCodeButton'), 'Import Existing Code');

  newQuickstartButton = new Button(
    $('#forgeQuickStartButton'), 'New Quickstart Project');

  // NOTE: not visible initially
  quickStartWizard = new QuickStartWizard(this.$('quickstart-wizard'));
  importCodeWizard = new ImportCodeWizard(this.$('import-wizard'));

  newImportExperienceButton = new Button(
    this.element(by.xpath('//*[contains(text(),\'Try our new Getting Started experience\')]')),
    'Try our new Getting Started experience'
  );

  constructor(elem: ElementFinder) {
    super(elem, 'Add to Space Wizard');
  }

  async ready() {
    await super.ready();
  }

  async newQuickstartProject(details: ProjectDetail) {
    await this.newQuickstartButton.clickWhenReady();
    await this.quickStartWizard.ready();
    await this.quickStartWizard.newProject(details);
  }

  async newQuickstartReleaseProject(details: ProjectDetail) {
    await this.newQuickstartButton.clickWhenReady();
    await this.quickStartWizard.ready();
    await this.quickStartWizard.newReleaseProject(details);
  }

  async importExistingCode(details: RepoDetail) {
    await this.importExistingCodeButton.clickWhenReady();
    await this.importCodeWizard.ready();
    debug('going to import repo', details.repositories);
    await this.importCodeWizard.importCode(details);
  }

  async openNewImportExperience(): Promise<NewImportExperienceDialog> {
    return new NewImportExperienceDialog(this.element(by.xpath('//f8-add-app-overlay')));
  }

  async newQuickstartProjectByLauncher(quickstartId: string, name: string, strategy: string) {
    info('Start create new quickstart');
    let dialog: NewImportExperienceDialog = await this.openNewImportExperience();

    await dialog.projectName.clear();
    await dialog.projectName.sendKeys(name);

    let launcher: LauncherSection = await dialog.selectCreateNewApplication();
    await launcher.ready();

    let quickstart = new Quickstart(quickstartId);

    /* Note required order of mission and runtime selection */
    /* https://github.com/openshiftio/openshift.io/issues/3418 */
    await launcher.selectMission(quickstart.mission.name);
    await launcher.selectRuntime(quickstart.runtime.name);

    await launcher.missionRuntimeContinueButton.clickWhenReady();

    let pipeline = new LauncherReleaseStrategy(strategy);
    await launcher.selectPipeline(pipeline.name);
    await launcher.releaseStrategyContinueButton.clickWhenReady();

    // BEGIN: Workaround for the Github login
    // await launcher.loginAndAuthorizeButton.clickWhenReady();
    // support.info('Github Login workaround');
    // let ghLogin = new TextInput($('#login_field'), 'GH Login');
    // let ghPasswd = new TextInput($('#password'), 'GH Password');
    // await ghLogin.ready();
    // await ghPasswd.ready();
    // await ghLogin.sendKeys(browser.params.github.username);
    // await ghPasswd.sendKeys(browser.params.github.password);
    // await ghPasswd.submit();
    // END: Workaround for the Github login
    await launcher.selectGithubOrganization(browser.params.github.username);
    await launcher.ghRepositoryText.clear();
    await launcher.ghRepositoryText.sendKeys(name);
    await launcher.gitProviderContinueButton.clickWhenReady();

    await launcher.summaryMission(quickstart.mission.name).isDisplayed();
    await launcher.summaryRuntime(quickstart.runtime.name).isDisplayed();

    let setupApplicationPage: LauncherSetupAppPage = await launcher.setUpApplication();

    await setupApplicationPage.newProjectBoosterOkIcon('Creating your new GitHub repository').untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Pushing your customized Booster code into the repo')
      .untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Creating your project on OpenShift').untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Setting up your build pipeline').untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Configuring to trigger builds on Git pushes')
      .untilDisplayed();

    let url: string = browser.params.target.url;

    if (!url.includes('localhost') && !url.includes('prod-prev')) {
      await setupApplicationPage.viewNewApplicationButton.clickWhenReady();
    } else {
      await setupApplicationPage.returnToDashboardButton.clickWhenReady();
    }
  }

  async importProjectByLauncher(appName: string, repoName: string, strategy: string) {
    let dialog: NewImportExperienceDialog = await this.openNewImportExperience();

    await dialog.projectName.clear();
    await dialog.projectName.sendKeys(appName);

    let launcher: LauncherSection = await dialog.selectImportExistingApplication();
    await launcher.ready();

    await launcher.selectGithubOrganization(browser.params.github.username);
    await launcher.ghRepositoryText.clickWhenReady();
    await launcher.ghRepositoryText.sendKeys(repoName);
    await launcher.gitProviderImportContinueButton.clickWhenReady();

    let pipeline = new LauncherReleaseStrategy(strategy);
    await launcher.selectPipeline(pipeline.name);
    await launcher.releaseStrategyImportContinueButton.clickWhenReady();

    let importApplicationPage: LauncherImportAppPage = await launcher.importApplication();
    await importApplicationPage.ready();

    await importApplicationPage.newProjectBoosterOkIcon('Creating your project on OpenShift').untilDisplayed();
    await importApplicationPage.newProjectBoosterOkIcon('Setting up your build pipeline').untilDisplayed();
    await importApplicationPage.newProjectBoosterOkIcon('Configuring to trigger builds on Git pushes')
      .untilDisplayed();

    await importApplicationPage.viewNewApplicationButton.clickWhenReady();
  }
}

export class NewImportExperienceDialog extends BaseElement {

  projectName = new TextInput($('#projectName'), 'Application Name');

  createNewApplicationCard = new BaseElement(
    element(by.xpath('//*[contains(text(),\'Create a new codebase\')]' +
      '/ancestor::*[contains(@class,\'code-imports--step_content\')]')),
    'Create a new codebase'
  );

  importExistingApplicationCard = new BaseElement(
    element(by.xpath('//*[contains(text(),\'Import an existing codebase\')]' +
      '/ancestor::*[contains(@class,\'code-imports--step_content\')]')),
    'Import an existing codebase'
  );

  continueButton = new Button(
    element(by.xpath('//*[not(@disabled) and contains(text(),\'Continue\')]')),
    'Continue'
  );

  constructor(elementFinder: ElementFinder) {
    super(elementFinder, 'Try out the new Launcher experience');
  }

  async ready() {
    super.ready();
    this.projectName.ready();
  }

  async selectCreateNewApplication(): Promise<LauncherSection> {
    await this.createNewApplicationCard.clickWhenReady();
    // https://github.com/fabric8io/fabric8-test/issues/714
    await browser.sleep(5000);
    await this.continueButton.clickWhenReady();
    return new LauncherSection(element(by.xpath('//f8-app-launcher')));
  }

  async selectImportExistingApplication(): Promise<LauncherSection> {
    await this.importExistingApplicationCard.clickWhenReady();
    await this.continueButton.clickWhenReady();
    return new LauncherSection(element(by.xpath('//f8-app-launcher')));
  }
}
