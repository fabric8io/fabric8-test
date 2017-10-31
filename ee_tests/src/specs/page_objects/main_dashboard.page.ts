/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import * as support from '../support';

import { AppPage } from './app.page';
import { SpaceDashboardPage } from './space_dashboard.page';
import { TextInput, Button } from './ui';

export class MainDashboardPage extends AppPage {

/*
Page layout
|--------------------------------------------------------------------------------------------------------------------|
|                                          Top Navigation Bar                                                        |
| Left Navigation Bar            |                                                  | Right Navigation Bar           |
|                                |                                                  |                                |
|                                                                                                                    |
| Persistent navigation bar                                                                                          |
|--------------------------------------------------------------------------------------------------------------------|
|                                   |                                        |                                       |
|                                   |                                        |                                       |
|        Page-specific content      |      Page-specific content             |        Page-specific content          |
|                                   |                                        |                                       |
|                                   |                                        |                                       |
|--------------------------------------------------------------------------------------------------------------------|
|                                   |                                        |                                       |
|                                   |                                        |                                       |
|        Page-specific content      |      Page-specific content             |        Page-specific content          |
|                                   |                                        |                                       |
|                                   |                                        |                                       |
|--------------------------------------------------------------------------------------------------------------------|
*/

    /* Dialog to create new space and project */
    newSpaceName = new TextInput($('#name'));
    createSpaceButton = new Button($('#createSpaceButton'));

    // TODO: create a UI component that abstracts this element
    devProcessPulldown = new TextInput($('#developmentProcess'));

    noThanksButton = element(by.xpath('.//a[contains(text(),\'No thanks, take me to\')]'));

    /* Are any warning displayed? */
    alertToastElements = element(by.xpath('.//*[contains(@class, \'toast-pf\')]'));

    /* Did the App/Project Creation Fail? */
    appGenerationSuccess = element(by.xpath('.//*[contains(text(), \'A starter application was created.\')]'));
    appGenerationError = element(by.xpath('.//*[contains(text(), \'Application Generator Error\')]'));
    executeForgeCommandError = element(by.xpath('.//*[contains(text(), \'Execute Forge Command Error\')]'));

    /* UI Page Section: Navigation Bar */
    topNavigationBar = element(by.xpath('.//*[contains(@class, \'navbar-collapse\')]'));

    /* UI Page Section: Left Navigation Bar */
    leftNavigationBar = element(by.xpath('.//*[contains(@class, \'navbar-left\')]'));

    // tslint:disable:max-line-length
    /* Recent items under Left Navigation Bar */
    recentItemsUnderLeftNavigationBar = element(by.xpath('.//*[contains(@class, \'navbar-left\')]//*[contains(@class,\'recent-items\')]//*[contains(@class,\'nav-item-icon\')]'));
    // tslint:enable:max-line-length

    /* View all spaces in Left Navigation Bar */
    viewAllSpacesUnderLeftNavigationBar = $('#header_viewAllSpaces');

    /* Account home in Left Navigation Bar */
    accountHomeUnderLeftNavigationBar = $('#header_accountHome');

    /* -----------------------------------------------------------------*/
    /* UI Page Section: Right Navigation Bar */
    rightNavigationBar = $('#header_dropdownToggle2');
    help = $('#header_loggedinHelp');
    about = $('#header_loggedinAbout');
    logOut = $('#header_logout');

    /* Status icon */
    statusIcon = $('#header_status');
    statusIconPlatform = $('#header_platformStatus');
    statusIconPlanner = $('#header_plannerStatus');
    statusIconChe = $('#header_cheStatus');
    statusIconPipeline = $('#header_pipelineStatus');
    statusPoweredOff = element(by.xpath('.//*[contains(@class,\'fa.fa-power-off\')]'));

    // tslint:disable:max-line-length
    cheStatusPoweredOn = element(by.xpath('.//*[@id=\'header_status\']/div/ul/fabric8-status-list/li[1]/status-info/span/span[contains(@class,\'pficon-ok\')]'));
    cheStatusPending = element(by.xpath('.//*[@id=\'header_status\']/div/ul/fabric8-status-list/li[1]/status-info/span/span[contains(@class,\'status-icon-pending fa fa-clock-o\')]'));
    jenkinsStatusPoweredOn = element(by.xpath('.//*[@id=\'header_status\']/div/ul/fabric8-status-list/li[2]/status-info/span/span[contains(@class,\'pficon-ok\')]'));
    // tslint:enable:max-line-length

    /* Profile page */
    updateProfileButton = element(by.xpath('.//button[contains (text(), \'Update Profile\')]'));
    updateTenantButton = element(by.xpath('.//button[contains (text(), \'Update Tenant\')]'));

    /* Profile drop down selection */
    profile = $('#header_loggedinProfile');

    /* User name or space name in Left Navigation Bar */
    nameUnderLeftNavigationBar(nameString: string): ElementFinder {
      let xpath = `.//*[contains(@class, 'navbar-left')]//*[contains(text(), '${nameString}')]`;
      return element(by.xpath(xpath));
   }

    // tslint:disable:max-line-length
    /* Recent space by name */
    // Example:  .//*[contains (@class, ('recent-items-text-dropdown'))]/span[contains (text(),'testspace')]
    recentSpaceByName (spaceName: string): ElementFinder {
      let xpathString = './/*[contains (@class, (\'recent-items-text-dropdown\'))]/span[contains (text(),\'' + spaceName + '\')]';
      return element(by.xpath(xpathString));
    }
    // tslint:enable:max-line-length

  /* Helper function to create a new OSIO space */
  async createNewSpace(targetUrl: string, username: string, spaceName: string) {
    await this.header.recentItemsDropdown.createSpaceItem.select()

    // TODO: create a new BaseFragment for the model Dialog

    await this.newSpaceName.enterText(spaceName);
    await this.devProcessPulldown.enterText('Scenario Driven Planning');

    await browser.sleep(5000)

    await this.createSpaceButton.clickWhenReady();
    await this.noThanksButton.clickWhenReady();

    let url = await browser.getCurrentUrl();
    support.info('EE test - new space URL = ', url);

    let urlText = support.joinURIPath(targetUrl, username, spaceName);

    support.debug ('Lets wait for the URL to contain the space URL: ' + urlText);

    // tslint:disable:max-line-length
    await browser.wait(until.urlContains(urlText),
      support.LONG_WAIT,
      'Failed waiting to move to the space page with URL: ' + urlText + ' Did create space not work?')

    let url = browser.getCurrentUrl()
    support.debug ('The browser was at URL: ' + url);

    await browser.wait(until.urlIs(urlText), 10000);

    // TODO: should move to the test
    expect(browser.getCurrentUrl()).toEqual(urlText);

    return new SpaceDashboardPage();
  }
}
