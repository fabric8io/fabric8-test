import { browser, element, by, By, ExpectedConditions as until, $ } from 'protractor';
import * as ui from '../ui';
import { BasePage } from './base.page';
import { MainDashboardPage } from './main_dashboard.page';

export class LoginPage extends BasePage {

  usernameInput = new ui.TextInput($('#username'), 'username');

  passwordInput = new ui.TextInput($('#password'), 'password');

  loginButton = new ui.Button($('#kc-login'), 'Login');

  async ready() {
    await Promise.all([
      browser.wait(until.presenceOf(this.usernameInput)),
      browser.wait(until.presenceOf(this.passwordInput)),
      browser.wait(until.presenceOf(this.loginButton)),
    ]);
  }

  async login(username: string, password: string): Promise<void> {
    this.debug('... Login: input details and click Login');
    await this.usernameInput.enterText(username);
    await this.passwordInput.enterText(password);

    await this.loginButton.clickWhenReady();
  }
}
