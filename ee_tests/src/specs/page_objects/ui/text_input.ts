import { ExpectedConditions as until, ElementFinder } from 'protractor';
import { BaseElement } from './base.element';

export class TextInput extends BaseElement {

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
  }

  async enterText(text: string) {
    await this.untilPresent();
    await this.sendKeys(text);
    this.log('Entered Text');
  }
}

