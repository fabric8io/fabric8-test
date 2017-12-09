import { ElementFinder, by } from 'protractor';
import { Header } from './../../page_objects/app/header';
import { PlannerPage } from './../../page_objects/planner/planner.page';
import * as ui from './../../ui';
import * as support from '../../support';

export class SpaceDashboardHeader extends Header {
  analyzeTab = new ui.Clickable(
    this.element(by.cssContainingText('li', 'Analyze')),
    'Analyze');
  planTab = new ui.Clickable(
    this.element(by.cssContainingText('li', 'Plan')),
    'Plan');
  createTab = new ui.Clickable(
    this.$('.persistent-secondary').element(by.cssContainingText('li', 'Create')),
    'Create');

  constructor(el: ElementFinder, spaceName: string, name: string = 'Space Dashboard page header') {
    super(el, name);
    this.spaceName = spaceName;
  }
  async ready() {
    support.debug(' ... check if SpaceDashboardPageHeader is Ready');
    await super.ready();
    await this.analyzeTab.ready();
    await this.planTab.ready();
    await this.createTab.ready();
    support.debug(' ... check if SpaceDashboardPageHeader is Ready - OK');
  }

  async gotoPlanTab(): Promise<PlannerPage> {
    await this.planTab.clickWhenReady();
    // NOTE: outside the dialog is outside of $(this)
    let planner  = new PlannerPage(this.spaceName);
    await planner.open();
    return planner;
  }

}
