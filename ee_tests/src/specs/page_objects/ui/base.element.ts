import { browser, ExpectedConditions as until, ElementFinder } from 'protractor';

export class BaseElement extends ElementFinder {
  /**
   * Extend this class, to describe single custom fragment on your page
   *
   * @param {ElementFinder} elementFinder ElementFinder that you want to extend
   */
  constructor(elementFinder: ElementFinder) {
      // Basically we are recreating ElementFinder again with same parameters
      super(elementFinder.browser_, elementFinder.elementArrayFinder_);
  }

  async untilClickable() {
    let condition = until.elementToBeClickable(this);
    await browser.wait(condition);
  }
}

