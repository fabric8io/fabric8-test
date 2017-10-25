import { browser, $ } from 'protractor';
import { BasePage } from './base.page';
import { LoginPage } from './login.page';

export class HomePage extends BasePage {
  loginButton = $('#login');

  constructor(url: string) {
    super(url);
  }

  async gotoLoginPage(): Promise<LoginPage> {
    await this.loginButton.click();

    let loginPage =  new LoginPage();
    await loginPage.validate();
    return loginPage;
  }
}
