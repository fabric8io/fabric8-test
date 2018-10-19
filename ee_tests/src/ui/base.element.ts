import {
  browser, ElementArrayFinder, ElementFinder, ExpectedConditions as until
} from 'protractor';

import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';

// todo move to a different module

type NumberComparerFn = (x: number) => boolean;
type NumberComparer = number | NumberComparerFn;

function makeNumberComparer(compare: NumberComparer): NumberComparerFn {
  if (typeof (compare) === 'number') {
    return (n: number) => n >= compare;
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
  return () => elements.count().then(compare);
}

export interface BaseElementInterface {
  untilDisplayed(wait?: number): Promise<any>;
  untilPresent(wait?: number): Promise<any>;
  untilClickable(wait?: number): Promise<any>;
  clickWhenReady(wait?: number): Promise<any>;
}

export class BaseElement extends ElementFinder implements BaseElementInterface {

  name: string = '';

  /**
   * Extend this class, to describe single custom fragment on your page
   *
   * @param {ElementFinder} elementFinder ElementFinder that you want to extend
   * @param {string} name to indentify the element in the logs
   */
  constructor(wrapped: ElementFinder, name: string = 'unnamed') {
    // Basically we are recreating ElementFinder again with same parameters
    super(wrapped.browser_, wrapped.elementArrayFinder_);
    this.name = name;
  }

  async untilClickable(timeout?: number) {
    await this.waitFor('clickable', until.elementToBeClickable(this), timeout);
  }

  async untilPresent(timeout?: number) {
    await this.waitFor('present', until.presenceOf(this), timeout);
  }

  async untilDisplayed(timeout?: number) {
    await this.waitFor('visible', until.visibilityOf(this), timeout);
  }

  async untilTextIsPresent(text: string, timeout?: number) {
    let condition = until.textToBePresentInElement(this, text);
    await this.waitFor(`text ${text}`, condition, timeout);
  }

  async untilHidden(timeout?: number) {
    await this.waitFor('hidden', until.invisibilityOf(this), timeout);
  }

  async untilAbsent(timeout?: number) {
    await this.waitFor('absence', until.stalenessOf(this), timeout);
  }

  async clickWhenReady(timeout?: number) {
    await this.untilClickable(timeout);
    await this.click();
    this.debug('Clicked');
  }

  async ready() {
    // TODO: may have to revert back to just until present
    // await this.untilPresent();
    await this.untilDisplayed();
  }

  async run(msg: string, fn: () => Promise<any>) {
    this.debug(msg);
    await fn();
    this.debug(msg, '- DONE');
  }

  info(action: string, ...msg: string[]) {
    let className = this.constructor.name;
    logger.info(`${action}: ${className}('${this.name}')`, ...msg);
  }

  debug(context: string, ...msg: string[]) {
    let className = this.constructor.name;
    logger.debug(`   ${className}('${this.name}'): ${context}`, ...msg);
  }

  protected string2Number(stringNumber: string, errorMessage: string): number {
    let countString = stringNumber.match(/\d+/g);
    let count: number;

    if (countString === null || countString.length !== 1) {
      throw errorMessage + ' ' + stringNumber;
    } else {
      count = parseInt(countString[0], 10);
    }
    return count;
  }

  private async waitFor(msg: string, condition: Function, timeout?: number) {
    let wait: number = timeout || timeouts.DEFAULT_WAIT;
    this.debug(`waiting for "${msg}"`, `  | timeout: '${wait}'`);
    await browser.wait(condition, wait);
    this.debug(`waiting for "${msg}"`, '  - OK');
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
    await this.untilCount(count);
  }

}

export class Clickable extends BaseElement {
  async ready() {
    await this.run('ready', async () => {
      await super.ready();
      await this.untilClickable();
    });
  }
}
