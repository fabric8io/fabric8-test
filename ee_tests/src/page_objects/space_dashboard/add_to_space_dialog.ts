import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import * as ui from '../../ui'
import { Button, TextInput, BaseElement } from '../../ui';
import * as support from '../../support'
import { LauncherSection, LauncherSetupAppPage } from '..';
import { Quickstart } from '../../support/quickstart';
import { LauncherReleaseStrategy } from '../../support/launcher_release_strategy';


export class Wizard extends ui.BaseElement {

  footer = new ui.BaseElement(this.$('div.modal-footer'));
  primaryButton = new ui.Button(this.footer.$('button.btn.btn-primary.wizard-pf-next'), 'Next')

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
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
  filterTextInput = new ui.TextInput(this.$('input[type="text"]'), 'filter')

  // TODO: may be turn this into a widget
  projectSelector = new ui.BaseElement(this.$('ob-project-select'))
  projectCards = new ui.BaseElementArray(this.projectSelector.$$(PROJECT_CARD))

  projectInfoStep = new ui.BaseElement(this.$('project-info-step'))
  // we worry about proj
  projectNameInput = new ui.TextInput(this.projectInfoStep.$('#named'))

  // tslint:disable:max-line-length
  release = new Button(element(by.xpath('.//*[@value=\'Release\']')));
  releaseAndStage = new Button(element(by.xpath('.//*[@value=\'Release and Stage\']')));
  releaseStageApproveAndPromote = new Button(element(by.xpath('.//*[@value=\'Release, Stage, Approve and Promote\']')));
  // tslint:enable:max-line-length

  async ready() {
    await super.ready();
    this.debug(' .... wizard ', 'ok')
    await this.footer.ready()
    this.debug(' .... footer ', 'ok')

    await this.filterTextInput.ready();
    await this.projectSelector.ready()
    this.debug(' .... selection ', 'ok')
    await this.projectCards.ready();
    this.debug(' .... cards ', 'ok')
  }

  async findCard(name: string): Promise<ui.Clickable> {
    support.debug(' .... finding card', name)
    let cardFinder = by.cssContainingText(PROJECT_CARD, name);
    let element = this.projectSelector.element(cardFinder)
    let card = new ui.Clickable(element, name);
    await card.ready();
    support.debug(' .... found card', name)
    return card;
  }

  async waitForProjectInfoStep() {
    await this.projectInfoStep.ready()
    await this.projectNameInput.ready()
    await this.primaryButton.ready()
  }

  async newProject({ project, name = '', strategy }: ProjectDetail) {
    let card = await this.findCard(project);
    await card.clickWhenReady()

    await this.primaryButton.clickWhenReady();
    await this.waitForProjectInfoStep()

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
  org: string
  repositories: string[]
};

export class ImportCodeWizard extends Wizard {

  githubOrg = new ui.SingleSelectionDropdown(
    this.$('organisation-step single-selection-dropdown'), 'Github Org')

  repoList = new ui.MultipleSelectionList(
    this.$('multiple-selection-list'), 'Repository List')

  async ready() {
    await super.ready();
  }

  async waitForGithubOrg() {
    await this.githubOrg.ready();

  }

  async importCode({ org, repositories }: RepoDetail) {
    await this.primaryButton.ready()
    await this.waitForGithubOrg()
    await this.githubOrg.select(org);
    await this.primaryButton.clickWhenReady();

    await this.repoList.ready();
    repositories.forEach(async (r) => await this.repoList.select(r))
    await this.primaryButton.clickWhenReady()
    // deployment choose default
    await this.primaryButton.clickWhenReady()

    await this.primaryButton.untilTextIsPresent('Finish');
    this.primaryButton.name = 'Finish';
    await this.primaryButton.clickWhenReady()

    await this.primaryButton.untilTextIsPresent('Ok');
    this.primaryButton.name = 'Ok';
    await this.primaryButton.clickWhenReady();
  }

}

export class AddToSpaceDialog extends ui.ModalDialog {

  noThanksButton = new ui.Button($('#noThanksButton'), 'No Thanks ...');
  importExistingCodeButton = new ui.Button(
    $('#importCodeButton'), 'Import Existing Code');

  newQuickstartButton = new ui.Button(
    $('#forgeQuickStartButton'), 'New Quickstart Project');

  // NOTE: not visible initially
  quickStartWizard = new QuickStartWizard(this.$('quickstart-wizard'))
  importCodeWizard = new ImportCodeWizard(this.$('import-wizard'))

  newImportExperienceButton = new ui.Button(
    this.element(by.xpath('//*[contains(text(),\'Try out the new Launcher experience\')]')),
    'Try out the new Launcher experience'
  );

  constructor(element: ElementFinder) {
    super(element, 'Add to Space Wizard');
  }

  async ready() {
    await super.ready();
    await this.noThanksButton.untilClickable();
    await this.importExistingCodeButton.untilClickable();
    await this.newQuickstartButton.untilClickable();
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
    support.debug("... going to import repo", details.repositories)
    await this.importCodeWizard.importCode(details);
  }

  async openNewImportExperience(): Promise<NewImportExperienceDialog> {
    await this.newImportExperienceButton.clickWhenReady();
    return new NewImportExperienceDialog(this.element(by.xpath('//f8-add-app-overlay')));
  }

  async newQuickstartProjectByLauncher(quickstartId: string, name: string, strategy: string) {
    let dialog: NewImportExperienceDialog = await this.openNewImportExperience();

    await dialog.projectName.clear();
    await dialog.projectName.sendKeys(name);

    let launcher: LauncherSection = await dialog.selectCreateNewApplication();
    await launcher.ready();

    let quickstart = new Quickstart(quickstartId);
    await launcher.selectRuntime(quickstart.runtime.name);
    await launcher.selectMission(quickstart.mission.name);
    await support.writeScreenshot('target/screenshots/launcher-runtime-and-mission-' + name + '.png');
    await launcher.missionRuntimeContinueButton.clickWhenReady();

    let pipeline = new LauncherReleaseStrategy(strategy);
    await launcher.selectPipeline(pipeline.name);
    await support.writeScreenshot('target/screenshots/launcher-pipeline-' + name + '.png');
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
    await launcher.ghRepositoryText.sendKeys(name);
    await support.writeScreenshot('target/screenshots/launcher-git-provider-' + name + '.png');
    await launcher.gitProviderContinueButton.clickWhenReady();

    await launcher.summaryMission(quickstart.mission.name).isDisplayed();
    await launcher.summaryRuntime(quickstart.runtime.name).isDisplayed();

    await support.writeScreenshot('target/screenshots/launcher-summary-' + name + '.png');

    let setupApplicationPage: LauncherSetupAppPage = await launcher.setUpApplication();
    await setupApplicationPage.ready();

    await setupApplicationPage.newProjectBoosterOkIcon('Creating your new GitHub repository').untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Pushing your customized Booster code into the repo')
      .untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Creating your project on OpenShift Online').untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Setting up your build pipeline').untilDisplayed();
    await setupApplicationPage.newProjectBoosterOkIcon('Configuring to trigger builds on Git pushes')
      .untilDisplayed();

    await support.writeScreenshot('target/screenshots/launcher-new-project-booster-created-' + name + '.png');

    await setupApplicationPage.viewNewApplicationButton.clickWhenReady();
  }

}

export class NewImportExperienceDialog extends ui.BaseElement {

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
    element(by.xpath('//*[contains(text(),\'Continue\')]')),
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
    await this.continueButton.clickWhenReady();
    return new LauncherSection(element(by.xpath('//f8-app-launcher')));
  }
}

