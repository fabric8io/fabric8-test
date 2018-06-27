import { browser, element, by, ExpectedConditions as until } from 'protractor';
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
    await browser.wait(
      until.presenceOf(element(by.cssContainingText('div', 'Recent Spaces'))), support.DEFAULT_WAIT);
    await browser.wait(
      until.presenceOf(element(by.cssContainingText('div', 'My Work Items'))), support.DEFAULT_WAIT);
    await browser.wait(
      until.presenceOf(element(by.cssContainingText('div', 'Recent Active Pipelines'))), support.DEFAULT_WAIT);
  }

  async openUsingMenu() {
    await this.header.recentItemsDropdown.selectAccountHome();
  }

  async openSpace(spaceName: string): Promise<SpaceDashboardPage> {
    await browser.wait(until.presenceOf(element(by.className('home-space-list-result'))));
    await element(by.className('home-space-list-result')).element(by.cssContainingText('a', spaceName)).click();

    let spaceDashboard = new SpaceDashboardPage(spaceName);
    await spaceDashboard.open();
    return Promise.resolve(spaceDashboard);
  }
}
