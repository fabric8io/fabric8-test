/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as EC, $, $$, ElementFinder } from 'protractor';
import { BasePage } from './base.page';
import { LoginPage } from './login.page';
import { Button } from './ui';

export class LandingPage extends BasePage {
  loginButton = new Button($('#login'), 'Login');

  constructor(url: string) {
    super(url);
    this.name = this.url;
  }

  async open() {
    await browser.get(this.url);
    super.open();
  }

  async gotoLoginPage(): Promise<LoginPage> {
    await this.loginButton.clickWhenReady();

    let loginPage = new LoginPage();
    await loginPage.open();
    return loginPage;
  }
}
