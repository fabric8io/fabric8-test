import { BaseElement } from './../base.element';
import { ElementFinder } from 'protractor';
import { WorkItemQuickAdd } from './workitem-quickadd';

export class WorkItemList extends BaseElement {
  overlay = new BaseElement(this.$('div.lock-overlay-list'));
  constructor(el: ElementFinder, name = 'Work Item List') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.overlay.untilAbsent();
  }
}
