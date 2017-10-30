import { ExpectedConditions as until, ElementFinder } from 'protractor';
import { BaseElement } from './base.element';

export class Button extends BaseElement {

  constructor(element: ElementFinder) {
    super(element);
  }

}

