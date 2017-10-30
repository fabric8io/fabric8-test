import { ElementFinder, by, $ } from 'protractor';
import { BaseElement } from './base.element';
import * as support from '../../support';


export class DropdownItem extends BaseElement {
  constructor(element: ElementFinder, dropdown: ElementFinder) {
    super(element);
    this.dropdown = dropdown;
  }

  async ready() {
    support.debug(' ... check if DropdownItem is clickable');
    await this.untilClickable();
    support.debug(' ... check if DropdownItem is clickable - OK');
  }

  async select(){
    await this.dropdown.ready();
    await this.dropdown.click();
    await this.ready();
    await this.click();
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
    return new DropdownItem(item, this);
  }

  async select(text: string) {
    support.debug(`Selecting dropdown item: '${text}'`);
    await this.item(text).select();
  }

  async ready() {
    support.debug(' ... check if Dropdown is clickable');
    await this.untilClickable();
    support.debug(' ... check if Dropdown is clickable - OK');
  }
}

