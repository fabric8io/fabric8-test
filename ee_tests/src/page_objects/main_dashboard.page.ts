import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as support from '../support';
import { AppPage } from './app.page';
import { SpaceDashboardPage } from './space_dashboard.page';

/**
 * Page object for the 'old' implementation of account home
 */
export class MainDashboardPage extends AppPage {

  constructor() {
    super('_home');
  }

  async ready() {
    super.ready();
    await browser.wait(until.presenceOf(element(by.cssContainingText('div', 'Recent Spaces'))),
      support.DEFAULT_WAIT, 'Recent Spaces is present');
    await browser.wait(until.presenceOf(element(by.cssContainingText('div', 'My Work Items'))),
      support.DEFAULT_WAIT, 'My Work Items title is present');
    await browser.wait(until.presenceOf(element(by.id('recent-pipelines-card'))),
      support.DEFAULT_WAIT, 'Recent Pipelines title is present');
  }

  async openUsingMenu() {
    await this.header.recentItemsDropdown.selectAccountHome();
  }

  async openSpace(spaceName: string): Promise<SpaceDashboardPage> {
    await browser.wait(until.presenceOf(element(by.className('f8-home-space-list-result'))),
      support.DEFAULT_WAIT, 'Tag with f8-home-space-list-result class name is present');
    await element(by.className('f8-home-space-list-result')).element(by.cssContainingText('a', spaceName)).click();

    let spaceDashboard = new SpaceDashboardPage(spaceName);
    await spaceDashboard.open();
    return Promise.resolve(spaceDashboard);
  }

  async openSpaceProdPreview(spaceName: string): Promise<SpaceDashboardPage> {
    return this.openSpace(spaceName);
  }
}
