import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import * as ui from '../../ui'
import * as support from '../../support'

export class Wizard extends ui.BaseElement {

	footer = new ui.BaseElement(this.$('div.modal-footer'));

	constructor(element: ElementFinder, name: string = '') {
		super(element, name);
	}

	async ready() {
    await this.footer.ready();
	}

}

const PROJECT_CARD = 'div.card-pf';

export class QuickStartWizard extends Wizard {
	filterTextInput = new ui.TextInput(this.$('input[type="text"]'))
	nextButton = new ui.Button(this.footer.$('button.btn.btn-primary.wizard-pf-next'))

	// TODO: may be turn this into a widget
  projectSelector = new ui.BaseElement(this.$('ob-project-select'))

  projectCards = new ui.BaseElementArray(this.projectSelector.$$(PROJECT_CARD))

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
    let card =  new ui.Clickable(element, name);
		await card.ready();
    support.debug(' .... found card', name)
		return card;
	}

	async newProject(name: string) {
		let card = await this.findCard(name);
    await card.clickWhenReady()

		this.nextButton.clickWhenReady();
    support.debug(' .... waiting ')
    await browser.sleep(2000)

	}
}


export class AddToSpaceWizard extends ui.ModalDialog {

  noThanksButton = new ui.Button($('#noThanksButton'), 'No Thanks ...');
  importExistingCodeButton = new ui.Button($('#importCodeButton'));
  newQuickstartButton = new ui.Button(
    $('#forgeQuickStartButton'), 'New Quickstart Project');

  // NOTE: not visible initially
  quickStartWizard = new QuickStartWizard(this.$('quickstart-wizard'))

  constructor(element: ElementFinder) {
    super(element, 'Add to Space Wizard');
  }

  async ready() {
    await super.ready();
    await this.noThanksButton.untilClickable();
    await this.importExistingCodeButton.untilClickable();
    await this.newQuickstartButton.untilClickable();
  }


  async newQuickstartProject(name: string) {
    await this.newQuickstartButton.clickWhenReady();
		await this.quickStartWizard.ready();
    await browser.sleep(1000)
		await this.quickStartWizard.newProject(name);

  }

}

