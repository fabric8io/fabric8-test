/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, ExpectedConditions as until, $ } from 'protractor';
import { BasePage } from './base.page';

export class MainDashboardPage extends BasePage {
  appTag = $('f8-app');

  async validate() {
    await browser.wait(until.presenceOf(this.appTag));
  }

}

