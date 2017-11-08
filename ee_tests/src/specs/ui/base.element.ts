import {
  browser, ExpectedConditions as until,
  ElementFinder, ElementArrayFinder
} from 'protractor';

import * as mixins from '../mixins';


// todo move to a different module

type NumberComparerFn = (x: number) => boolean;
type NumberComparer = number|NumberComparerFn;

function makeNumberComparer(compare: NumberComparer): NumberComparerFn {
  if (typeof(compare) == "number") {
    return (n: number) =>  n >= compare;
  }
  return compare;
}

/**
 * to use with browser.wait to wait for multiple elements to present
 * e.g.
 *  browser.wait(untilCount($('foobar'), n => n >= 5 ))
 *  browser.wait(untilCount($('foobar'), 5)) // same as above
 */
function untilCount(elements: ElementArrayFinder, expectation: NumberComparer) {
  let compare: NumberComparerFn = makeNumberComparer(expectation);
  return  () => elements.count().then(compare);
}

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

export class BaseElementArray extends ElementArrayFinder {
  constructor(wrapped: ElementArrayFinder) {
    // see: clone https://github.com/angular/protractor/blob/5.2.0/lib/element.ts#L106
    super(
      wrapped.browser_, wrapped.getWebElements,
      wrapped.locator_, wrapped.actionResults_);
  }

  async untilCount(compare: NumberComparer, wait?: number, msg?: string) {
    await browser.wait(untilCount(this, compare), wait, msg);
  }

  async ready(count: number = 1) {
    await this.untilCount(count)
  }

}


mixins.applyMixins(BaseElement, [mixins.Logging]);
mixins.applyMixins(BaseElementArray, [mixins.Logging]);
