import { browser } from 'protractor'
import { OsioLandingPage, LandingPage, MainDashboardPage } from '../page_objects'

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
    // HACK: https://github.com/openshiftio/openshift.io/issues/1402
    // TODO: remove the hack and use LandingPage instead of OsioLandingPage
    // when the bug that deletes the tokens is fixed
    this.page = page || new LandingPage()
  }

  async validate() {
    expect(this.username === "").toBe(false, 'must provide username');
    expect(this.password === "").toBe(false, 'must provide password');
    expect(this.page).toBeDefined('page must be intialised');
  }

  async perform(): Promise<MainDashboardPage> {
    await this.page.open();
    let loginPage = await this.page.gotoLoginPage();
    let dashboard = await loginPage.login(this.username, this.password);
    await dashboard.open()
    return dashboard;
  }
}

