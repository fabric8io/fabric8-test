import { browser, ExpectedConditions as until, $ } from 'protractor';
import * as support from '../support';

import { BasePage } from './base.page';
import { Header } from './app/header';

export abstract class AppPage extends BasePage {
  appTag = $('f8-app');
  header = new Header(this.appTag);

  /**
   * Extend this class, to describe Application Page(after logging in)
   *
   * @param {url} elementFinder ElementFinder that you want to extend
   */
  constructor() {
    super();
  }

  async ready() {
    await browser.wait(until.presenceOf(this.appTag));
    await browser.wait(until.presenceOf(this.header));
    await this.header.ready();
  }

  async gotoUserProfile(): Promise<UserProfilePage> {
    await this.ready();
    support.debug('... Select "Profile" menu item');
    await this.header.profileDropdown.select('Profile');
    support.debug('... Select "Profile" menu item - OK');

    // tslint:disable-next-line:no-use-before-declare
    let page = new UserProfilePage();
    await page.ready();
    return page;
  }

}


// NOTE: imported here otherwise AppPage will not be defined when
// UserProfilePage that inherts AppPage is created
import { UserProfilePage } from './user_profile.page';
