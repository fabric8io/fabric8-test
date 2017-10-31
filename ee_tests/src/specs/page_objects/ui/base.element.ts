import { browser, ExpectedConditions as until, ElementFinder } from 'protractor';
import { info } from '../../support';
import * as mixins from '../../mixins'

export class BaseElement extends ElementFinder {
  name: string = ''
  /**
   * Extend this class, to describe single custom fragment on your page
   *
   * @param {ElementFinder} elementFinder ElementFinder that you want to extend
   * @param {string} name to indentify the element in the logs
   */
  constructor(elementFinder: ElementFinder, name: string = '') {
    // Basically we are recreating ElementFinder again with same parameters
    super(elementFinder.browser_, elementFinder.elementArrayFinder_);
    this.name = name
  }

  async untilClickable() {
    let condition = until.elementToBeClickable(this);
    await browser.wait(condition);
  }

  async untilPresent() {
    let condition = until.presenceOf(this);
    await browser.wait(condition);
  }

  async clickWhenReady() {
    await this.untilPresent();
    await this.untilClickable();
    await this.click();
    this.log('Clicked')
  }

  // add logging mixin
  log: (action: string, ...msg: string[]) => void;
}


mixins.applyMixins(BaseElement, [mixins.Logging]);
