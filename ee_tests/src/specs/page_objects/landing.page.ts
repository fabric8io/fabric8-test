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

export class LandingPage extends BasePage {
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
