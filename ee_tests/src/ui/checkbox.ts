import { ElementFinder } from 'protractor';
import { BaseElement } from './base.element';

export class Checkbox extends BaseElement {
  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
  }
  // TODO add check and uncheck
}

