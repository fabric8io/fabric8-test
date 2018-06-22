import { browser } from 'protractor';
import { LandingPage, MainDashboardPage } from '../page_objects';

export class LoginInteraction {
  page: LandingPage;
  username: string;
  password: string;

  constructor(page?: LandingPage, username?: string, password?: string) {
    this.username = username || browser.params.login.user;
    this.password = password || browser.params.login.password;
    this.page = page || new LandingPage();
  }

  async validate() {
    expect(this.username === '').toBe(false, 'must provide username');
    expect(this.password === '').toBe(false, 'must provide password');
    expect(this.page).toBeDefined('page must be initialized');
  }

  async perform(): Promise<MainDashboardPage> {
    await this.page.open();
    let loginPage = await this.page.gotoLoginPage();
    let dashboard = await loginPage.login(this.username, this.password);
    await dashboard.open();
    return dashboard;
  }

  async run() {
    await this.validate();
    return this.perform();
  }
}

