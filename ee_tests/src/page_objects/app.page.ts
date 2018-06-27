import { browser, ExpectedConditions as until, $, by, element } from 'protractor';
import * as support from '../support';
import { BaseElement, TextInput, Button } from '../ui';

import { BasePage } from './base.page';
import { LandingPage } from './landing.page';
import { Header } from './app/header';

export class AppPage extends BasePage {
  appTag = $('f8-app');
  header = new Header(this.appTag.$('header > alm-app-header > nav'));
  successAlert = element(by.xpath('//*[contains(@class,\'alert-success\')]'));

  /* Dialog to create new space and project */
  private newSpaceName = new TextInput($('#add-space-overlay-name'), 'Name of Space');
  private createSpaceButton = new Button($('#createSpaceButton'), 'Create Space');

  private noThanksButton = new Button($('#noThanksButton'), 'No Thanks ...');
  private cancelCreateAppButton = new Button(
    element(by.xpath('//*[contains(@class,\'f8launcher-container_close\')]' +
      '//*[contains(@class,\'pficon-close\')]')),
    'Cancel'
  );

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
    const elem = this.appTag.element(by.cssContainingText(css, text));
    return new UI(elem, text);
  }

  async ready() {
    await browser.wait(until.presenceOf(this.appTag), support.DEFAULT_WAIT);
    await browser.wait(until.presenceOf(this.header), support.DEFAULT_WAIT);
    await this.header.ready();
  }

  /* Helper function to create a new OSIO space */
  async createNewSpace(spaceName: string): Promise<SpaceDashboardPage> {
    await this.header.recentItemsDropdown.selectCreateSpace();

    // TODO: create a new BaseFragment for the model Dialog
    await this.newSpaceName.enterText(spaceName);

    await this.createSpaceButton.clickWhenReady();
    await this.noThanksButton.clickWhenReady();

    let url = await browser.getCurrentUrl();
    support.debug('... current url:', url);

    support.debug('... waiting for the url to contain spacename: ', spaceName);

    // TODO: make the timeout a config
    await browser.wait(until.urlContains(spaceName), 10000);

    let spaceDashboard = new SpaceDashboardPage(spaceName);
    await spaceDashboard.open();
    return spaceDashboard;
  }

  /* Helper function to create a new OSIO space */
  async createNewSpaceByLauncher(spaceName: string): Promise<SpaceDashboardPage> {
    await this.header.recentItemsDropdown.selectCreateSpace();

    // TODO: create a new BaseFragment for the model Dialog
    await this.newSpaceName.enterText(spaceName);

    await this.createSpaceButton.clickWhenReady();
    await this.cancelCreateAppButton.clickWhenReady();

    let url = await browser.getCurrentUrl();
    support.debug('... current url:', url);

    support.debug('... waiting for the url to contain spacename: ', spaceName);

    // TODO: make the timeout a config
    await browser.wait(until.urlContains(spaceName), 10000);

    let spaceDashboard = new SpaceDashboardPage(spaceName);
    await spaceDashboard.open();
    return spaceDashboard;
  }

  // tslint:disable-next-line:max-line-length
  async createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string) {
    await this.header.recentItemsDropdown.selectCreateSpace();

    support.info('Creating space');
    await this.newSpaceName.enterText(spaceName);
    await this.createSpaceButton.clickWhenReady();
    support.info('Space created');

    support.info('Creating application from new codebase');
    let wizard = new AddToSpaceDialog($('body > modal-container > div.modal-dialog'));
    await browser.wait(until.presenceOf(element(by.cssContainingText('div', 'Create an Application'))));
    await wizard.newQuickstartProjectByLauncher(templateName, spaceName, strategy);
    support.info('Application created');
  }

  async gotoUserProfile(): Promise<UserProfilePage> {
    await this.ready();
    support.debug('... Select "Profile" menu item');
    await this.header.profileDropdown.selectProfile();
    support.debug('... Select "Profile" menu item - OK');

    let page = new UserProfilePage();
    await page.open();
    return page;
  }

  async gotoUserSettings(): Promise<UserSettingsPage> {
    await this.ready();
    support.debug('... Select "Settings" menu item');
    await this.header.profileDropdown.selectSettings();
    support.debug('... Select "Settings" menu item - OK');

    let page = new UserSettingsPage();
    await page.open();
    return page;
  }

  async logout() {
    await this.ready();
    await browser.wait(until.invisibilityOf(this.successAlert));
    support.debug('... Selecting logout');
    await this.header.profileDropdown.selectLogOut();
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
import { UserSettingsPage } from './user_settings.page'; import { SpaceDashboardPage } from './space_dashboard.page';
import { AddToSpaceDialog } from './space_dashboard/add_to_space_dialog';
