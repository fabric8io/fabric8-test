import { $, browser, ExpectedConditions as until } from 'protractor';
import { Button } from '../ui/button';
import { TextInput } from '../ui/text_input';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {

  usernameInput = new TextInput($('#username'), 'username');

  passwordInput = new TextInput($('#password'), 'password');

  loginButton = new Button($('#kc-login'), 'Login');

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
