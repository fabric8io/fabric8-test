import { browser, ExpectedConditions as until, $, by, element } from 'protractor';
import * as support from '../support';
import { BaseElement } from '../ui';

import { BasePage } from './base.page';
import { LandingPage } from './landing.page';
import { Header } from './app/header';

export abstract class AppPage extends BasePage {
  appTag = $('f8-app');
  header = new Header(this.appTag.$('header > alm-app-header > nav'));
  successAlert = element(by.xpath('//*[contains(@class,\'alert-success\')]'));

  /**
   * Extend this class, to describe Application Page(after logging in)
   *
   * @param {url} elementFinder ElementFinder that you want to extend
   */
  constructor() {
    super();
  }

  /**
   * Returns an instance of the BaseElement that can be found using
   * the {css} and contains the {text}.
   *
   * @param {UI} The Base Element Class e.g. Button, TextInput
   * @param {css}  Css within the appTag that identifies the element
   * @param {text} text in the element
   *
   */
  innerElement(UI: typeof BaseElement, css: string, text: string): BaseElement {
    const element = this.appTag.element(by.cssContainingText(css, text));
    return new UI(element, text);
  }

  async ready() {
    await support.writeScreenshot('target/screenshots/app_page_ready_1.png');
    support.debug('app.page.ready() starting...');
    await browser.wait(until.presenceOf(this.appTag), support.DEFAULT_WAIT);
    await browser.wait(until.presenceOf(this.header), support.DEFAULT_WAIT);
    // wait for "Recent Spaces" card
    await browser.wait(until.presenceOf(element(by.className('home-space-list-result'))), support.DEFAULT_WAIT);
    support.debug('app.page.ready() complete...');
    await support.writeScreenshot('target/screenshots/app_page_ready_2.png');
  }

  async gotoUserProfile(): Promise<UserProfilePage> {
    await this.ready();
    support.debug('... Select "Profile" menu item');
    await this.header.profileDropdown.select('Profile');
    support.debug('... Select "Profile" menu item - OK');

    let page = new UserProfilePage();
    await page.open();
    return page;
  }

  async gotoUserSettins(): Promise<UserSettingsPage> {
    await this.ready();
    support.debug('... Select "Settings" menu item');
    await this.header.profileDropdown.select('Settings');
    support.debug('... Select "Settings" menu item - OK');

    let page = new UserSettingsPage();
    await page.open();
    return page;
  }

  async logout() {
    await this.ready();
    await browser.wait(until.invisibilityOf(this.successAlert));
    support.debug('... Selecting logout');
    await this.header.profileDropdown.logoutItem.select();
    support.debug('... Selecting logout', 'OK');


    // ensure there is no f8-app tag after logout
    let untilNoAppTag = until.not(until.presenceOf(this.appTag));
    await browser.wait(untilNoAppTag);

    // make sure we are back to the baseUrl
    let baseUrl = browser.baseUrl;

    support.debug('... Wait for base url:', baseUrl);
    let untilBackToBaseUrl = until.or(
      until.urlIs(baseUrl),
      until.urlIs(`${baseUrl}/`)
    );

    await browser.wait(untilBackToBaseUrl, 5000, `Url is not ${baseUrl}`);
    support.debug('... Wait for base url', 'OK');

    return new LandingPage().open();
  }

}


// NOTE: imported here otherwise AppPage will not be defined when
// UserProfilePage that inherts AppPage is created
import { UserProfilePage } from './user_profile.page';
import { UserSettingsPage } from './user_settings.page';
