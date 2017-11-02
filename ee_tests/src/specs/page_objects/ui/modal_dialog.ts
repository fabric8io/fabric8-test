import { ExpectedConditions as until, ElementFinder } from 'protractor';
import { BaseElement } from './base.element';

export class ModalDialog extends BaseElement {
  content = this.$('.modal-content');
  body = this.content.$('.modal-body');

  // NOTE: bodyContent is a tag
  bodyContent = this.body.$('modal-content');

  constructor(element: ElementFinder, name?: string) {
    super(element, name);
  }

  async ready() {
    await this.isPresent();
    await this.content.isPresent();
    await this.body.isPresent();
    await this.bodyContent.isPresent();

    await this.isDisplayed();
    await this.body.isDisplayed();
    await this.content.isDisplayed();
    await this.bodyContent.isDisplayed();
  }

  async open() {
    await this.ready();
    this.log('Opened');
  }
}
