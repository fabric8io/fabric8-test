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
import { Quickstart } from '../support/quickstart';

export class LauncherPage extends BasePage {


  resetSelectionsButton = new ui.Button(element(by.xpath("//*[contains(text(),'Reset Selections')]")));
  sectionMissionRuntimeOkButton = new ui.Button(element(by.xpath(
    '//section[@class=\'f8launcher-section-mission-runtime\']//button[contains(text(),\'OK\')]'))
  );

  constructor() {
    // '' is relative to base url so it means baseUrl
    super('/_applauncher');

    // NOTE: can't call async methods in construtor
    browser.getProcessedConfig()
      .then(config => this.name = config.baseUrl + '/_applauncher');
  }

  async selectRuntime() {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    this.log('Selecting runtime: ' + quickstart.runtime.name);
    let selection = element(By.xpath(
      '//div[@class=\'list-group-item-heading\'][contains(text(),\'' + quickstart.runtime.name + '\')]' +
      '/ancestor::*[@class=\'list-group list-view-pf\']//input[@type=\'radio\']')
    );
    selection.click();
  }

  async selectMission() {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    this.log('Selecting mission: ' + quickstart.mission.name);
    let selection = element(By.xpath(
      '//div[@class=\'list-group-item-heading\'][contains(text(),\'' + quickstart.mission.name + '\')]' +
      '/ancestor::*[@class=\'list-group list-view-pf\']//input[@type=\'radio\']')
    );
    selection.click();
  }

  // checks if the PageObject is valid
  async ready() {
    await Promise.all([
      browser.wait(until.presenceOf(this.resetSelectionsButton))
    ]);
  }

  async open() {
    this.log('Openning Launcher page:' + this.url);
    return super.open(PageOpenMode.RefreshBrowser);
  }
}
