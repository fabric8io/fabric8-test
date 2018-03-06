import { browser, ExpectedConditions as until, $, by } from 'protractor';
import * as support from '../support';
import { BaseElement } from '../ui';

import { BasePage } from './base.page';
import { LandingPage } from './landing.page';
import { Header } from './app/header';

export abstract class AppPage extends BasePage {
  appTag = $('f8-app');
  header = new Header(this.appTag.$('header > alm-app-header > nav'));

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
    await browser.wait(until.presenceOf(this.appTag));
    await browser.wait(until.presenceOf(this.header));
    await this.header.ready();
  }

  async gotoUserProfile(): Promise<UserProfilePage> {
    await this.ready();
    support.debug('... Select "Profile" menu item');
    await this.header.profileDropdown.select('Profile');
    support.debug('... Select "Profile" menu item - OK');

    // tslint:disable-next-line:no-use-before-declare
    let page = new UserProfilePage();
    await page.open();
    return page;
  }

  async logout() {
    await this.ready();
    support.debug('... Selecting logout')
    await this.header.profileDropdown.logoutItem.select();
    support.debug('... Selecting logout', 'OK')


    // ensure there is no f8-app tag after logout
    let untilNoAppTag = until.not(until.presenceOf(this.appTag))
    await browser.wait(untilNoAppTag);

    // make sure we are back to the baseUrl
    let baseUrl = browser.baseUrl;

    support.debug('... Wait for base url:', baseUrl);
    let untilBackToBaseUrl = until.or(
      until.urlIs(baseUrl),
      until.urlIs(`${baseUrl}/`)
    )

    await browser.wait(untilBackToBaseUrl, 5000, `Url is not ${baseUrl}`);
    support.debug('... Wait for base url', 'OK')

    return new LandingPage().open();
  }

}


// NOTE: imported here otherwise AppPage will not be defined when
// UserProfilePage that inherts AppPage is created
import { UserProfilePage } from './user_profile.page';
