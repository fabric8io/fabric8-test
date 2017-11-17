/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as EC, $, $$, ElementFinder } from 'protractor';
import { BasePage, PageOpenMode } from './base.page';
import { LoginPage } from './login.page';
import { Button } from '../ui';
import { UserProfilePage } from './user_profile.page';
import * as support from '../support';

export class LandingPage extends BasePage {

  /* ------ Elements in the landing page navigation bar ------ */

  /* Elements visible when user is not logged in */
  loginButton = new Button($('#login'), 'Login');
  registerButton = new Button($('#registerNav'), 'Register');

  /* Elements visible when user logged in */
  logoutButton = new Button($('#logout'), 'Logout');
  userName = new Button($('#userName'), 'Username');
  loggedInUserName = new Button($('#loggedInUserName'), 'LoggedInUserName');
  features = new Button(element(by.xpath('.//*[contains(@class, \'navbar-nav-links--features uppercase\')]')));
  contribute = new Button(element(by.xpath('.//*[contains(@class, \'navbar-nav-links--contribute uppercase\')]')));

  /* Elements always visible */
  corporateLogo = new Button(element(by.xpath('.//*[contains(@class, \'corporate-logo\')]')));
  osioLogo = new Button (element(by.xpath('.//*[contains(@class, \'navbar-brand openshiftio-logo\')]')));

  /* ------ Elements in the landing page navigation bar ------ */

  constructor(url: string = '') {
    // '' is relative to base url so it means baseUrl
    super(url);

    // NOTE: can't call async methods in construtor
    browser.getProcessedConfig()
      .then(config => this.name = config.baseUrl);
  }

  async ready() {
    await this.loginButton.untilClickable();
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

  async gotoUserProfile(): Promise<UserProfilePage> {
    await this.ready();
    support.debug('... Select LoggedInUserName menu item');
    await this.loggedInUserName.click();

    // tslint:disable-next-line:no-use-before-declare
    let page = new UserProfilePage();
    await page.open();
    return page;
  }

}
