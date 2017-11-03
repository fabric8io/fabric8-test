import { browser, ExpectedConditions as until, ElementFinder } from 'protractor';
import { info, WAIT } from '../../support';
import * as mixins from '../../mixins';

export interface BaseElementInterface {
  untilPresent(): Promise<any>;
  untilClickable(): Promise<any>;
  clickWhenReady(): Promise<any>;
}


export class BaseElement extends ElementFinder implements BaseElementInterface {

  // add logging mixin
  name: string = '';
  log: (action: string, ...msg: string[]) => void;

  /**
   * Extend this class, to describe single custom fragment on your page
   *
   * @param {ElementFinder} elementFinder ElementFinder that you want to extend
   * @param {string} name to indentify the element in the logs
   */
  constructor(elementFinder: ElementFinder, name?: string) {
    // Basically we are recreating ElementFinder again with same parameters
    super(elementFinder.browser_, elementFinder.elementArrayFinder_);
    this.name = name || 'unnamed';
  }

  async untilClickable(wait: number = WAIT) {
    let condition = until.elementToBeClickable(this);
    await browser.wait(condition, wait);
  }

  async untilPresent(wait: number = WAIT) {
    let condition = until.presenceOf(this);
    await browser.wait(condition, wait);
  }

  async clickWhenReady() {
    await this.untilPresent();
    await this.untilClickable();
    await this.click();
    this.log('Clicked');
  }

  async untilTextIsPresent(text: string) {
    let condition = until.textToBePresentInElement(this, text );
    await browser.wait(condition);
  }

  async ready() {
    await this.untilPresent();
  }
}


mixins.applyMixins(BaseElement, [mixins.Logging]);
