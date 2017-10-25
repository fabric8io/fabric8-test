import { $ } from 'protractor';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  usernameInput = $('#username');
  passwordInput = $('#password');
  loginButton = $('#kc-login');

  async login(username: string, password: string) {
    await this.usernameInput.sendKeys(username);
    await this.passwordInput.sendKeys(password);
    await this.loginButton.click();
  }
}
