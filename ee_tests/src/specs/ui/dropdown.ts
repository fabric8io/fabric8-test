import { ElementFinder, by, $ } from 'protractor';
import { BaseElement, Clickable } from './base.element';
import * as support from '../support';


export class DropdownItem extends BaseElement {
  constructor(element: ElementFinder, parent: ElementFinder, name: string = '') {
    super(element, name);
    this.parent = parent;
  }

  async ready() {
    support.debug(' ... check if DropdownItem is clickable');
    await super.ready();
    await this.untilClickable();
    support.debug(' ... check if DropdownItem is clickable - OK');
  }

  async select() {
    support.debug(".... selecting item", this.name)
    await this.parent.ready();
    await this.parent.click();
    await this.ready();
    await this.click();
    this.parent.log('Selected', `menu item: '${this.name}'`);
  }
}


export class DropdownMenu extends BaseElement {

  constructor(element: ElementFinder, parent: ElementFinder, name: string = '') {
    super(element, name);
    this.parent = parent;
  }

  item(text: string): DropdownItem {
    let item = this.element(by.cssContainingText('li', text));
    return new DropdownItem(item, this.parent, text);
  }

  async ready() {
    // NOTE: not calling super as the menu is usually hidden and
    // supper.ready waits for item to be displayed
    support.debug(`... waiting for menu-item: '${this.name}'`)
    await this.untilPresent();
    support.debug(`... waiting for menu-item: '${this.name}'  - OK`)
  }

}

export class Dropdown extends BaseElement {
  menu = new DropdownMenu(this.$('ul.dropdown-menu'), this);

  constructor(element: ElementFinder, name: string = '') {
    super(element, name);
  }

  item(text: string): DropdownItem {
    return this.menu.item(text)
  }

  async select(text: string) {
    support.debug(`Selecting dropdown item: '${text}'`);
    await this.item(text).select();
  }

  async ready() {
    support.debug('... check if Dropdown is clickable');
    await super.ready();
    await this.untilClickable();
    await this.menu.ready();
    support.debug('... check if Dropdown is clickable - OK');
  }
}


export class SingleSelectionDropdown extends Dropdown {
  input = new Clickable(this.$('input.combobox[type="text"]'), '')

	constructor(element: ElementFinder, name: string = '') {
		super(element, name);
    this.input.name = name
	}

  async ready() {
    await super.ready();
    await this.input.ready()
  }
}

