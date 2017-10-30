import { ElementFinder, by, $ } from 'protractor';
import { BaseElement } from './base.element';
import * as support from '../../support';


export class DropdownItem extends BaseElement {
  constructor(element: ElementFinder) {
    super(element);
  }

  async ready() {
    support.debug(' ... check if DropdownItem is clickable');
    await this.untilClickable();
    support.debug(' ... check if DropdownItem is clickable - OK');
  }
}


// TODO: move to fragments since this is generic
export class Dropdown extends BaseElement {
  dropdownMenu = this.$('ul.dropdown-menu');

  constructor(element: ElementFinder) {
    super(element);
  }

  item(text: string): DropdownItem {
    let item = this.dropdownMenu.element(by.cssContainingText('li', text));
    return new DropdownItem(item);
  }

  async select(text: string) {
    support.debug(`Selecting dropdown item: '${text}'`);

    await this.ready();
    await this.click();

    let item = this.item(text);
    await item.ready();
    await item.click();
  }

  async ready() {
    support.debug(' ... check if Dropdown is clickable');
    await this.untilClickable();
    support.debug(' ... check if Dropdown is clickable - OK');
  }
}

