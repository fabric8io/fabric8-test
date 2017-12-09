import { $, browser } from 'protractor';
import { AppPage } from '../app.page';
import { SpaceDashboardHeader } from './../../ui/space_dashboard';
import * as planner from './../../ui/planner';
import * as support from './../../support';

// this is what you see when you click on the Plan Tab button
export class PlannerPage extends AppPage {
  // Override the existing header with new header
  // SpaceDashboard and Planner page have the same header
  header = new SpaceDashboardHeader(this.appTag.$('alm-app-header'), this.spaceName, 'Planner page header');
  workItemList = new planner.WorkItemList($('alm-work-item-list'));
  quickAdd =  new planner.WorkItemQuickAdd($('alm-work-item-quick-add'));

  constructor(public spaceName: string) {
    super(`${browser.params.login.user}/${spaceName}/plan`);
    this.spaceName = spaceName;
  }

  async ready() {
    support.debug(' ... check if Planner page is Ready');
    await super.ready();
    await this.workItemList.ready();
    await this.quickAdd.ready();
    support.debug(' ... check if Planner page is Ready - OK');
  }

  async createWorkItem(item: planner.WorkItem) {
    this.debug('create item', JSON.stringify(item));
    await this.quickAdd.addWorkItem(item);
  }
}
