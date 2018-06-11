import { browser, ElementFinder, by, ExpectedConditions as until } from 'protractor';
import { BaseElement, Clickable } from './base.element';
import * as support from '../support';

export class Dropdown extends BaseElement {

  private menu = new DropdownMenu(this.$('ul.dropdown-menu'));

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
  }

  async select(text: string) {
    support.info('Select menu item ' + text);
    await this.toggle();
    await browser.wait(until.presenceOf(this.menu));
    await this.item(text).select();
  }

  async toggle() {
    support.debug('Toggle the menu');
    await browser.wait(until.presenceOf(this.element(by.className('dropdown-toggle'))));
    await this.element(by.className('dropdown-toggle')).click();
  }

  protected item(text: string): DropdownItem {
    return this.menu.item(text);
  }
}

class DropdownMenu extends BaseElement {

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
  }

  item(text: string): DropdownItem {
    let item = this.element(by.cssContainingText('li', text));
    return new DropdownItem(item, text);
  }
}

class DropdownItem extends BaseElement {

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
  }

  async select() {
    support.debug('Select menu item');
    await this.clickWhenReady();
  }
}

export class SingleSelectionDropdown extends Dropdown {
  input = new Clickable(this.$('input.combobox[type="text"]'), '');

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
    this.input.name = name;
  }

  async ready() {
    await super.ready();
    await this.input.ready();
  }
}
