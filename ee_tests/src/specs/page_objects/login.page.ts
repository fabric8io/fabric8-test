/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $ } from 'protractor';
import * as support from '../support';
import { BasePage } from './base.page';
import { MainDashboardPage } from './main_dashboard.page';
import { SpaceDashboardPage } from './space_dashboard.page';

export class LoginPage extends BasePage {

  /* RHD login page UI elements */
  usernameInput = $('#username');
  passwordInput = $('#password');
  loginButton = $('#kc-login');
  everythingOnPage = element(by.xpath('.//*'));

  /* Social media login options */
  githubLoginButton = $('#social-github');
  stackoverflowLoginButton = $('#social-stackoverflow');
  linkedinLoginButton = $('.fa.fa-linkedin-square');
  twitterLoginButton = $('#social-twitter');
  facebookLoginButton = $('#social-facebook');
  microsoftLoginButton = $('#social-microsoft');
  jbossdeveloperLoginButton = $('#social-jbossdeveloper');


  // checks if the PageObject is valid
  async validate() {
    await Promise.all([
      browser.wait(until.presenceOf(this.usernameInput)),
      browser.wait(until.presenceOf(this.passwordInput)),
      browser.wait(until.presenceOf(this.loginButton)),
    ]);
  }

  async login(username: string, password: string): Promise<MainDashboardPage> {
    await this.usernameInput.sendKeys(username);
    await this.passwordInput.sendKeys(password);
    await this.loginButton.click();
    support.debug('  ... clicking loginButton - DONE');

    let dashboardPage = new MainDashboardPage();

    support.debug('  ... validate dashboard');
    await dashboardPage.validate();
    support.debug('  ... validate dashboard - OK');
    return dashboardPage;
  }


}
