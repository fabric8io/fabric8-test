import { $, browser, by, element, ExpectedConditions as until } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';
import { TextInput } from '../ui/text_input';

import { BasePage } from './base.page';
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
    await browser.wait(until.presenceOf(this.appTag), timeouts.DEFAULT_WAIT, 'App tag is present');
    await browser.wait(until.presenceOf(this.header), timeouts.DEFAULT_WAIT, 'Header is present');
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
    logger.debug('current url:', url);

    logger.debug('waiting for the url to contain spacename: ', spaceName);

    await browser.wait(until.urlContains(spaceName), timeouts.DEFAULT_WAIT, 'URL contains space name');

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
    logger.debug('current url:', url);

    logger.debug('waiting for the url to contain spacename: ', spaceName);

    await browser.wait(until.urlContains(spaceName), timeouts.DEFAULT_WAIT, 'URL contains space name');

    let spaceDashboard = new SpaceDashboardPage(spaceName);
    await spaceDashboard.open();
    return spaceDashboard;
  }

  async createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string) {
    await this.header.recentItemsDropdown.selectCreateSpace();

    logger.info('Creating space');
    await this.newSpaceName.enterText(spaceName);
    await this.createSpaceButton.clickWhenReady();
    logger.info('Space created');

    logger.info('Creating application from new codebase');
    let wizard = new AddToSpaceDialog($('body > modal-container > div.modal-dialog'));
    await browser.wait(until.presenceOf(element(by.cssContainingText('div', 'Create an Application'))));
    await wizard.newQuickstartProjectByLauncher(templateName, spaceName, strategy);
    logger.info('Application created');
  }

  async gotoUserProfile(): Promise<UserProfilePage> {
    await this.ready();
    logger.debug('Select "Profile" menu item');
    await this.header.profileDropdown.selectProfile();
    logger.debug('Select "Profile" menu item - OK');

    let page = new UserProfilePage();
    await page.open();
    return page;
  }

  async gotoUserSettings(): Promise<UserSettingsPage> {
    await this.ready();
    logger.debug('Select "Settings" menu item');
    await this.header.profileDropdown.selectSettings();
    logger.debug('Select "Settings" menu item - OK');

    let page = new UserSettingsPage();
    await page.open();
    return page;
  }

  async logout() {
    await this.header.profileDropdown.selectLogOut();
    await browser.wait(until.stalenessOf(this.header));
  }
}

// NOTE: imported here otherwise AppPage will not be defined when
// UserProfilePage that inherts AppPage is created
import { UserProfilePage } from './user_profile.page';
import { UserSettingsPage } from './user_settings.page'; import { SpaceDashboardPage } from './space_dashboard.page';
import { AddToSpaceDialog } from './space_dashboard/add_to_space_dialog';
