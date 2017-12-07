import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import {
  BaseElement,
  BaseElementArray,
  Button,
  Clickable,
  SingleSelectionDropdown,
  ModalDialog,
  MultipleSelectionList,
  TextInput,
} from '../../ui'


export class Wizard extends BaseElement {

  footer = new BaseElement(this.$('div.modal-footer'));
  primaryButton = new Button(this.footer.$('button.btn.btn-primary.wizard-pf-next'), 'Next')

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
  }

  async ready() {
    await super.ready()
    await this.footer.ready();
    await this.primaryButton.ready();
  }

}

export interface ProjectDetail {
  project: string
  name?: string
};


const PROJECT_CARD = 'div.card-pf';

export class QuickStartWizard extends Wizard {
  filterTextInput = new TextInput(this.$('input[type="text"]'), 'filter')

  // TODO: may be turn this into a widget
  projectSelector = new BaseElement(this.$('ob-project-select'))
  projectCards = new BaseElementArray(this.projectSelector.$$(PROJECT_CARD))

  projectInfoStep = new BaseElement(this.$('project-info-step'))
  // we worry about proj
  projectNameInput = new TextInput(this.projectInfoStep.$('#named'))

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

  async findCard(name: string): Promise<Clickable> {
    this.debug('finding card', name)
    let cardFinder = by.cssContainingText(PROJECT_CARD, name);
    let element = this.projectSelector.element(cardFinder)
    let card =  new Clickable(element, name);
    await card.ready();
    this.debug('found card', name)
    return card;
  }

  async waitForProjectInfoStep() {
    await this.projectInfoStep.ready()
    await this.projectNameInput.ready()
    await this.primaryButton.ready()
  }

  async newProject({ project, name = '' }: ProjectDetail) {
    let card = await this.findCard(project);
    await card.clickWhenReady()

    await this.primaryButton.clickWhenReady();
    await this.waitForProjectInfoStep()

    await this.projectNameInput.enterText(name);
    await this.primaryButton.clickWhenReady();
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

  githubOrg = new SingleSelectionDropdown(
    this.$('organisation-step single-selection-dropdown'), 'Github Org')

  repoList = new MultipleSelectionList(
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

export class AddToSpaceDialog extends ModalDialog {

  noThanksButton = new Button($('#noThanksButton'), 'No Thanks ...');
  importExistingCodeButton = new Button(
    $('#importCodeButton'), 'Import Existing Code');

  newQuickstartButton = new Button(
    $('#forgeQuickStartButton'), 'New Quickstart Project');

  // NOTE: not visible initially
  quickStartWizard = new QuickStartWizard(this.$('quickstart-wizard'))
  importCodeWizard = new ImportCodeWizard(this.$('import-wizard'))

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

  async importExistingCode(details: RepoDetail) {
    await this.importExistingCodeButton.clickWhenReady();
    await this.importCodeWizard.ready();
    this.debug('import repo', "going to import repo", details.repositories.join(', '))
    await this.importCodeWizard.importCode(details);
  }

}

