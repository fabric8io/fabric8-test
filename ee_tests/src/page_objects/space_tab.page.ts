import { browser, by, element, ElementFinder } from 'protractor';
import * as support from '../support';
import { BaseElement, Clickable } from '../ui/base.element';
import { Button } from '../ui/button';
import { SpaceAppPage } from './space_app.page';
import { TextInput } from '../ui/text_input';

export abstract class SpaceTabPage extends SpaceAppPage {

  deploymentsOption = new Button (
    element(by.xpath('.//a/span[contains(text(),\'Deployments\')]')), 'Deployments option');

  mainNavBar = new BaseElement(
    this.header.$('ul.nav.navbar-nav.navbar-primary.persistent-secondary'),
    'Main Navigation Bar'
  );

  planTab = new Clickable(
    this.mainNavBar.element(by.cssContainingText('li', 'Plan')),
    'Plan'
  );

  // todo: add ready when we can consider the headers ready
  async ready() {
    await super.ready();
    await this.mainNavBar.ready();
    await this.planTab.ready();
  }

  async selectDeployments() {
    this.deploymentsOption.clickWhenReady();
  }

  async gotoPlanTab(): Promise<PlannerTab> {
    await this.planTab.clickWhenReady();
    // NOTE: outside the dialog is outside of $(this)
    let planner = new PlannerTab(support.currentSpaceName());
    await planner.open();
    return planner;
  }

}

type WorkItemType = 'task' | 'feature' | 'bug';

interface WorkItem {
  title: string;
  description?: string;
  type?: WorkItemType;
}

class WorkItemQuickAdd extends Clickable {
  titleTextInput = new TextInput(this.$('input.f8-quickadd-input'), 'Work item Title');
  buttonsDiv = this.$('div.f8-quickadd__wiblk-btn.pull-right');
  acceptButton = new Button(this.buttonsDiv.$('button.btn.btn-primary'), '✓');
  cancelButton = new Button(this.buttonsDiv.$('button.btn.btn-default'), 'x');

  constructor(el: ElementFinder, name = 'Work Item Quick Add') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.untilClickable();
  }

  async createWorkItem({ title, description = '', type = 'feature' }: WorkItem) {
    await this.clickWhenReady();
    await this.titleTextInput.ready();
    await this.titleTextInput.enterText(title);
    await this.cancelButton.untilClickable();

    await this.acceptButton.clickWhenReady();

    // TODO add more confirmation that the item has been added
    await this.cancelButton.clickWhenReady();

    // TODO choose the type of item
    this.info('New WorkItem', `${title} added`);
  }
}

class WorkItemList extends BaseElement {
  overlay = new BaseElement(this.$('div.lock-overlay-list'));

  quickAdd = new WorkItemQuickAdd(
    this.$('#workItemList_quickAdd > alm-work-item-quick-add > div'));

  constructor(el: ElementFinder, name = 'Work Item List') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.overlay.untilAbsent();
    await this.quickAdd.ready();
  }
}

// this is what you see when you click on the Plan Tab button
class PlannerTab extends SpaceTabPage {
  workItemList = new WorkItemList(this.appTag.$('alm-work-item-list'));

  constructor(public spaceName: string) {
    super();
    this.url = `${browser.params.login.user}/${spaceName}/plan`;
  }

  async ready() {
    await super.ready();
    await this.workItemList.ready();
  }

  async createWorkItem(item: WorkItem) {
    support.debug('create item', JSON.stringify(item));
    await this.workItemList.quickAdd.createWorkItem(item);
  }
}
