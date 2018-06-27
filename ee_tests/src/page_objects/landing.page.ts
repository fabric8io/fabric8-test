import { $, browser } from 'protractor';
import { BasePage, PageOpenMode } from './base.page';
import { LoginPage } from './login.page';
import { Button } from '../ui/button';

export class LandingPage extends BasePage {

  loginButton = new Button($('#login'), 'Login');
  loggedInUserButton = new Button($('#loggedInUserName'), 'User Name');

  constructor(url: string = '') {
    // '' is relative to base url so it means baseUrl
    super(url);

    // NOTE: can't call async methods in construtor
    browser.getProcessedConfig()
      .then(config => this.name = config.baseUrl);
  }

  async ready() {
    await Promise.race([
      this.loginButton.untilClickable(),
      this.loggedInUserButton.untilClickable()
    ]);
  }

  async open() {
    return super.open(PageOpenMode.RefreshBrowser);
  }

  async gotoLoginPage(): Promise<LoginPage> {
    await this.loginButton.clickWhenReady();

    let loginPage = new LoginPage();
    await loginPage.open();
    return loginPage;
  }
}

export class OsioLandingPage extends LandingPage {
  loginButton = new Button($('#header_rightDropdown > li.login-block > a'), 'Login');

  constructor(url: string = '/openshiftio') {
    super(url);
  }
}
