import { browser } from 'protractor';
import { LandingPage } from '../page_objects/landing.page';
import { PageOpenMode } from '../page_objects/base.page';
import { AccountHomeInteractionsFactory } from './account_home_interactions';

export class LoginInteraction {

  private page: LandingPage;

  private username: string;

  private password: string;

  constructor() {
    this.username = browser.params.login.user;
    this.password = browser.params.login.password;
    this.page = new LandingPage();
  }

  async run() {
    await this.validate();
    await this.perform();
  }

  async isLoginButtonPresent(): Promise<boolean> {
    return this.page.loginButton.isPresent();
  }

  private async validate() {
    expect(this.username === '').toBe(false, 'must provide username');
    expect(this.password === '').toBe(false, 'must provide password');
    expect(this.page).toBeDefined('page must be initialized');
  }

  private async perform(): Promise<void> {
    await this.page.open();
    let loginPage = await this.page.gotoLoginPage();
    await loginPage.login(this.username, this.password);

    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.openAccountHomePage(PageOpenMode.AlreadyOpened);
  }
}
