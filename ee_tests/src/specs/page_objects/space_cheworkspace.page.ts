/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/
// tslint:disable:max-line-length
import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
// tslint:ensable:max-line-length
import { AppPage } from './app.page';
import { TextInput, Button } from '../ui';

export class SpaceCheWorkspacePage extends AppPage {

  // tslint:disable:max-line-length

  /* Main Menu Panel run button */
  mainMenuRunButton = new Button ($('#gwt-debug-command_toolbar-button_Run'), 'Che Main Menu Run Button');

  /* Main Menu Panel run button run selection */
  mainMenuRunButtonRunSelection = new Button (element(by.xpath('.//*[contains(@class,\'gwt-PopupPanel GDPEHSMCJAB\')]')), 'Che Main Menu Run Selection Button');

  /* Bottom Panel run tab */
  bottomPanelRunTab = new Button (element(by.xpath('.//*[contains(@class,\'GDPEHSMCKHC\')][contains(text(),\'run\')]')), 'Che Bottom Panel Run Tab');

  /* Bottom Panel title */
  bottomPanelOutputTitles = element.all(by.xpath('.//*[contains(@class,\'GJ5I-CRBHRB GJ5I-CRBCRB\')]'));

  /* Bottom Panel label */
  bottomPanelOutputLabel = element.all(by.xpath('.//*[contains(@class,\'gwt-Label GJ5I-CRBHRB GJ5I-CRBCRB\')]'));

  /* Bottom Panel preview */
  bottomPanelOutputPreview = element.all(by.xpath('.//*[contains(text(),\'preview:\')]/following-sibling::a[contains(text(),\'http://\')]'));

  /* Bottom Panel command console lines of text */
  bottomPanelCommandConsoleLines = element.all(by.xpath('.//*[@id=\'gwt-debug-commandConsoleScrollPanel\']')).last();
//  bottomPanelCommandConsoleLines = element(by.xpath('.//*[contains(text(), \'Succeeded in deploying verticle\')]'));
  //    .//*[@id='gwt-debug-infoPanel']

  recentProjectRootByName (projectName: string): ElementFinder {
    let xpathString = './/*[@id=\'gwt-debug-projectTree\']/div[contains(@name,\'' + projectName + '\')]';
    return element(by.xpath(xpathString));
  }

// tslint:enable:max-line-length

}
