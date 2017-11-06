import { browser } from 'protractor'

import { LandingPage, BasePage, MainDashboardPage } from '../page_objects'
import * as support from './index'

// interface Action {
  // perform<T extends BasePage>(): Promise<T>;
// }

abstract class Interaction {

  async validate() {};
  async cleanup() {};
  abstract async perform(): Promise<any>;


  async run() {
    await this.validate();
    try {
      return this.perform();
    } finally {
      await this.cleanup();
    }
  }

}

export class LoginInteraction extends Interaction {
  page: LandingPage
  username: string
  password: string

  constructor(page?: LandingPage, username?: string, password?: string) {
    super();
    this.username = username || browser.params.login.user
    this.password = password || browser.params.login.password
    this.page = page || new LandingPage()
  }

  async validate() {
    expect(this.username === "").toBe(false, 'must provide username');
    expect(this.password === "").toBe(false, 'must provide password');
    expect(this.page).toBeDefined('page must be intialised');
    await this.page.ready();
  }

  async perform(): Promise<MainDashboardPage> {
    let loginPage = await this.page.gotoLoginPage();
    let dashboardPage = await loginPage.login(this.username, this.password);
    await dashboardPage.open()
    return dashboardPage;
  }
}

