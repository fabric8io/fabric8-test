/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import * as support from '../support';
import { TextInput, Button } from '../ui';
import { AppPage } from './app.page';
import { SpaceDashboardPage } from './space_dashboard.page';


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

    url = '_home';

    /* Dialog to create new space and project */
    newSpaceName = new TextInput($('#name'), 'Name of Space');
    createSpaceButton = new Button($('#createSpaceButton'), 'Create Space');

    // TODO: create a UI component that abstracts this element
    devProcessPulldown = new TextInput($('#developmentProcess'));

    noThanksButton = new Button($('#noThanksButton'), 'No Thanks ...');

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
  async createNewSpace(spaceName: string): Promise<SpaceDashboardPage> {
    await this.header.recentItemsDropdown.createSpaceItem.select();

    // TODO: create a new BaseFragment for the model Dialog
    await this.newSpaceName.enterText(spaceName);
    await this.devProcessPulldown.enterText('Scenario Driven Planning');

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

}
