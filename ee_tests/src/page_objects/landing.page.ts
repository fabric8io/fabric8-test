import { $, browser } from 'protractor';
import { BasePage, PageOpenMode } from './base.page';
import { LoginPage } from './login.page';
import { Button } from '../ui/button';
import * as support from '../support';

export class LandingPage extends BasePage {

  loginButton = new Button($('#login'), 'Login');
  loggedInUserButton = new Button($('#loggedInUserName'), 'User Name');

  constructor(url: string = '') {
    super(url);
    support.info('OSIO url: ' + browser.params.target.url);
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
