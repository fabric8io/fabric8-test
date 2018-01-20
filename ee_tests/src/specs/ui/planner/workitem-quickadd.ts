import { ElementFinder, $ } from 'protractor';
import { WorkItem } from './index';
import * as ui from '../../ui';

export class WorkItemQuickAdd extends ui.BaseElement {
  titleTextInput = new ui.TextInput(this.$('input.f8-quickadd-input'), 'Work item Title');
  buttonsDiv = this.$('div.f8-quickadd__wiblk-btn.pull-right');
  addButton = new ui.Button(this.buttonsDiv.$$('button.btn.btn-primary').first(), 'Add Button');
  addAndOpenButton = new ui.Button(this.buttonsDiv.$$('button.btn.btn-primary').last(), 'Add and Open Button');

  // TODO - make notification seperate class and in mixin
  notificationToast = new ui.BaseElement($('div.toast-notifications-list-pf'), 'Notification Toast');

  constructor(el: ElementFinder, name = 'Work Item Quick Add') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.addAndOpenButton.ready();
  }

  async addWorkItem({ title, description = '', type = 'feature' }: WorkItem) {
    await this.clickWhenReady();
    await this.titleTextInput.ready();
    await this.titleTextInput.enterText(title);
    await this.addAndOpenButton.untilClickable();
    await this.addButton.clickWhenReady();
    // TODO - Remove following 2 lines when notification is moved to a seperate class
    await this.notificationToast.untilPresent();
    await this.notificationToast.untilAbsent();

    // TODO add more confirmation that the item has been added
    this.log('New WorkItem', `${title} added`);
  }
}
