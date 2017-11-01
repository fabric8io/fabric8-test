import { browser, ExpectedConditions as until, $, by } from 'protractor';
import * as support from '../support';

import { BasePage } from './base.page';
import { Header } from './app/header';
import { BaseElement } from './ui';

export abstract class AppPage extends BasePage {
  appTag = $('f8-app');
  header = new Header(this.appTag);

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
    return page
  }

}


// NOTE: imported here otherwise AppPage will not be defined when
// UserProfilePage that inherts AppPage is created
import { UserProfilePage } from './user_profile.page';
