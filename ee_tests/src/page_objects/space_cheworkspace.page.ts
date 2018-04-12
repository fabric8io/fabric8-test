/*
  OSIO EE test - Page object model - Che workspace page
*/

// tslint:disable:max-line-length
import { browser, Key, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
// tslint:ensable:max-line-length
import { AppPage } from './app.page';
import { TextInput, Button } from '../ui';
import * as support from '../support';
import { isUndefined } from 'util';

export class SpaceCheWorkspacePage extends AppPage {

  // tslint:disable:max-line-length

  /* Main Menu Panel run/debug buttons */
  mainMenuRunButton = new Button ($('#gwt-debug-command_toolbar-button_Run'), 'Che Main Menu Run Button');
  mainMenuRunDropDown = new Button(this.mainMenuRunButton.element(by.xpath('.//*[contains(@class,\'GDPEHSMCCAB\')]')));
  mainMenuDebugButton = new Button ($('#gwt-debug-command_toolbar-button_Debug'), 'Che Main Menu Debug Button');

  /* Main Menu Panel run button run selection */
  mainMenuRunButtonRunSelection = new Button (element(by.xpath('.//*[contains(@class,\'gwt-PopupPanel GEU2T3BBPCB\')]')), 'Che Main Menu Run Selection Button');

  /* Main Menu Panel debug button debug selection */
  mainMenuDebugButtonDebugSelection = new Button (element(by.xpath('.//*[contains(@class,\'gwt-PopupPanel GDPEHSMCJAB\')]')), 'Che Main Menu Run Selection Button');

  /* Bottom Panel run tab */
  bottomPanelRunTab = new Button (element(by.xpath('.//*[@id=\'gwt-debug-multiSplitPanel-tabsPanel\']//*[contains(text(),\'run\')]')), 'Che Bottom Panel Run Tab');
  bottomPanelRunTabCloseButton = new Button (element(by.xpath('.//*[@id=\'gwt-debug-multiSplitPanel-tabsPanel\']//*[contains(text(),\'run\')]/..//*[contains(@class,\'GEU2T3BBEOC\')]')), 'Che Bottom Panel Run Tab close button');
  bottomPanelRunTabOKButton =  new Button (element(by.xpath('.//button[contains(@id, \'ask-dialog-ok\')]')), 'Run tab OK button');

  /* Bottom Panel terminal tab */
  bottomPanelTerminalTab = new Button (element(by.xpath('.//*[contains(@class,\'GDPEHSMCKHC\')][contains(text(),\'Terminal\')]')), 'Che Bottom Panel Terminal Tab');

  bottomPanelTerminal = new TextInput (element(by.xpath('.//*[@id=\'gwt-debug-Terminal\']')));

  /* Bottom Panel title */
  bottomPanelOutputTitles = element.all(by.xpath('.//*[contains(@class,\'GJ5I-CRBHRB GJ5I-CRBCRB\')]'));

  /* Bottom Panel label */
  bottomPanelOutputLabel = element.all(by.xpath('.//*[contains(@class,\'gwt-Label GJ5I-CRBHRB GJ5I-CRBCRB\')]'));

  /* Bottom Panel preview */
  bottomPanelOutputPreview = element.all(by.xpath('.//*[contains(text(),\'preview:\')]/following-sibling::a[contains(text(),\'http://\')]'));

  /* Bottom Panel command console lines of text */
  bottomPanelCommandConsoleLines = element(by.xpath('.//*[@id=\'gwt-debug-consolesPanel\']'));

  /* Bottom Panel terminal tab console lines of text */
  bottomPanelTerminalConsoleLines = element.all(by.xpath(".//*[contains(@class,'xterm-rows')]"));
  bottomPanelTerminalConsoleLastLine = element.all(by.xpath(".//*[contains(@class,'xterm-rows')]/div")).last();

  /* Assistent top level menu item, navigate to file subtopic */
  assistant = new Button (element(by.xpath('.//*[@id=\'gwt-debug-MenuItem\/assistantGroup-true\']')), 'Assistant');
  navigateToFile = new Button (element(by.xpath('.//*[@id=\'topmenu\/Assistant\/Navigate to File\']')), 'Navigate to file');
  navigateFileName = new TextInput (element(by.xpath('.//*[@id=\'gwt-debug-navigateToFile-fileName\']')));
  navigateFilePopupPanel = element(by.xpath('.//*[contains(@class,\'gwt-PopupPanel\')]'));
  fileNameTab = new Button (element(by.xpath('.//*[contains(@class=\'GDPEHSMCDDC GDPEHSMCGK\')]')), 'File tab');

  /* Che menu - Run, Test, Junit commands */
  cheMenuRun = new Button (element(by.xpath('.//*[@id=\'gwt-debug-MenuItem\/runGroup-true\']')), 'Run menu');
  cheMenuRunTest = new Button (element(by.xpath('.//*[@id=\'topmenu\/Run\/Test\']')), 'Run -> Test');
  cheMenuRunTestJunit = new Button (element(by.xpath('.//*[@id=\'topmenu\/Run\/Test\/Run JUnit Test\']')), 'Run -> Test -> Junit');

  /* Junit output is displayed here */
  debugInfoPanel = new TextInput (element(by.xpath('.//*[@id=\'gwt-debug-infoPanel\']')));

  /* File context menu */
  cheContextMenuEditFile = new Button (element(by.xpath('.//*[@id=\'contextMenu\/Edit file\']')), 'Edit file');

  /* Che menu edit */
  cheMenuEdit = new Button (element(by.xpath('.//*[@id=\'gwt-debug-MenuItem\/editGroup-true\']')), 'Edit in file');
  cheEditFind = new Button (element(by.xpath('.//*[@id=\'topmenu/Edit/Find\']')), 'Find in edit');
  cheEditFormat = new Button (element(by.xpath('.//*[@id=\'topmenu/Edit/Format\']')), 'Format file');

  /* Che find and replace */
  cheFindTextToReplace = new TextInput (element(by.xpath('.//input[@class=\'textViewFindInput\']')), 'Che text to find');
  cheReplaceText = new TextInput (element(by.xpath('.//input[@class=\'textViewReplaceInput\']')), 'Che test to insert');
  cheTextViewFindButton = new Button (element(by.xpath('.//*[@class=\'textViewFindButton\'][contains(text(), \'Replace All\')]')), 'Che textViewFindButton');
  cheText = new TextInput (element(by.xpath('(.//*[contains (@class,\'textviewContent\')])[2]')), 'Che text');

  /* Che go to line number */
  cheLineNumber = new TextInput (element(by.xpath('.//*[@id=\'gwt-debug-askValueDialog-textBox\']')));
  cheLineNumberOk = new Button (element(by.xpath('.//*[@id=\'askValue-dialog-ok\']')), 'Line number OK');

  /* Profile Preferences */
  cheProfileGroup = new Button (element(by.xpath('.//*[@id=\'gwt-debug-MenuItem\/profileGroup-true\']')), 'Profile group button');
  chePreferences = new Button (element(by.xpath('.//*[@id=\'topmenu\/Profile\/Preferences\']')), 'Preferences button');
  chePreferencesEditor = new Button (element(by.xpath('.//*[@id=\'gwt-debug-projectWizard-Editor\']')), 'Preferences Editor button');
  chePreferencesAutopairParen = new Button (element(by.xpath('(.//*[contains (@class,\'gwt-CheckBox\')])[6]')), 'Preferences Auto Paren');
  chePreferencesAutoBraces = new Button (element(by.xpath('(.//*[contains (@class,\'gwt-CheckBox\')])[7]')), 'Preferences Auto Braces');
  chePreferencesStoreChanges = new Button (element(by.xpath('.//*[@id=\'window-preferences-storeChanges\']')), 'Preferences store changes button');
  chePreferencesClose = new Button (element(by.xpath('.//*[@id=\'window-preferences-close\']')), 'Preferences close button');

  /* Preview link for app as deployed in Che preview */
  previewLink (usernameGithub: string): Button {
    let xpathString = './/a[contains (@class,\'gwt-Anchor\')][contains(text(),\'' + usernameGithub + '-che\')]';
    return new Button (element(by.xpath(xpathString)), 'Che preview link');
  }

  /* Project name as displayed in project explorer */
  recentProjectRootByName (projectName: string): ElementFinder {
    let xpathString = './/*[@id=\'gwt-debug-projectTree\']//div[contains(@name,\'' + projectName + '\')]';
    return element(by.xpath(xpathString));
  }

  /* Locate folder/file elements in the project tree in Che */
  chePathElement (elementString: string): ElementFinder {
    let xpathString = '(.//*[contains (@path,\'' + elementString + '\')])[1]';
    return element(by.xpath(xpathString));
  }

  /* And locate the folder expansion icon for folder elements in the project tree in Che */
  chePathElementIcon (elementString: string): Button {
    let xpathString = './/*[contains (@path,\'' + elementString + '\')]//*[contains(@id,\'Layer_1\')]';
    return new Button (element(by.xpath(xpathString)), 'Folder tree element');
  }

  /* Locate folder/file element in the project tree in Che */
  cheFileName (elementString: string): Button {
//    let xpathString = './/*[contains (@class,\'GDPEHSMCNBB\')]//*[contains(text(),\'' + elementString + '\')]';
    let xpathString = './/*[contains (@class,\'GEU2T3BBEEB\')]//*[contains(text(),\'' + elementString + '\')]';
    return new Button (element(by.xpath(xpathString)), 'The filename in Che');
  }

  /* Given a set of parameters where each parameter is a folder or class, "walk"
   (traverse) project tree in Che, expanding each element */
  async walkTree (...theArgs: string[]) {
    let xpathString: string = '';
    for (let i = 0; i < theArgs.length; i++) {
      xpathString += theArgs[i];

      await this.chePathElementIcon(xpathString).clickWhenReady();
      let theText = await this.chePathElement(xpathString).getText();
      support.info ('Opened path = ' + theText);
      await browser.sleep(5000);
    }
  }

  cheWorkspaceName(): string {
    if (!isUndefined(this.url)) {
      return this.url.substr(this.url.lastIndexOf('/'));
    } else {
      return '';
    }
  }

  cheWorkspaceUrl(): string {
    if (!isUndefined(this.url)) {
      return this.url;
    } else {
      return '';
    }
  }
// tslint:enable:max-line-length

}
