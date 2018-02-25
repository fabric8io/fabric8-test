/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $ } from 'protractor';
import * as support from '../support';
import * as ui from '../ui';
import { BasePage, PageOpenMode } from './base.page';
import { LandingPage } from './landing.page';
import { MainDashboardPage } from './main_dashboard.page';
import { SpaceDashboardPage } from './space_dashboard.page';

export class LoginPage extends BasePage {
  /* RHD login page UI elements */
  usernameInput = new ui.TextInput($('#username'), 'username');
  passwordInput = new ui.TextInput($('#password'), 'password');
  loginButton = new ui.Button($('#kc-login'), 'Login');
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
  async ready() {
    await Promise.all([
      browser.wait(until.presenceOf(this.usernameInput)),
      browser.wait(until.presenceOf(this.passwordInput)),
      browser.wait(until.presenceOf(this.loginButton)),
    ]);
  }

  async login(username: string, password: string): Promise<MainDashboardPage> {
    this.debug('... Login: input details and click Login');
    await this.usernameInput.enterText(username);
    await this.passwordInput.enterText(password);
    await this.loginButton.clickWhenReady();

    this.debug('... Login: input details and click Login - OK');

    let mainDashboard = new MainDashboardPage()
    await mainDashboard.open()
    return mainDashboard;
  }

}
