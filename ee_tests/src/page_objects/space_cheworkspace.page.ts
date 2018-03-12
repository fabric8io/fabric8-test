/*
  OSIO EE test - Page object model - Che workspace page
*/

// tslint:disable:max-line-length
import { browser, Key, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
// tslint:ensable:max-line-length
import { AppPage } from './app.page';
import { TextInput, Button } from '../ui';
import * as support from '../support';

export class SpaceCheWorkspacePage extends AppPage {

  // tslint:disable:max-line-length

  /* Main Menu Panel run/debug buttons */
  mainMenuRunButton = new Button ($('#gwt-debug-command_toolbar-button_Run'), 'Che Main Menu Run Button');
  mainMenuDebugButton = new Button ($('#gwt-debug-command_toolbar-button_Debug'), 'Che Main Menu Debug Button');

  /* Main Menu Panel run button run selection */
  mainMenuRunButtonRunSelection = new Button (element(by.xpath('.//*[contains(@class,\'gwt-PopupPanel GDPEHSMCJAB\')]')), 'Che Main Menu Run Selection Button');

  /* Main Menu Panel debug button debug selection */
  mainMenuDebugButtonDebugSelection = new Button (element(by.xpath('.//*[contains(@class,\'gwt-PopupPanel GDPEHSMCJAB\')]')), 'Che Main Menu Run Selection Button');

  /* Bottom Panel run tab */
  bottomPanelRunTab = new Button (element(by.xpath('.//*[contains(@class,\'GDPEHSMCKHC\')][contains(text(),\'run\')]')), 'Che Bottom Panel Run Tab');

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

  /* Che menu - Run, Test, Junit commands */
  cheMenuRun = new Button (element(by.xpath('.//*[@id=\'gwt-debug-MenuItem\/runGroup-true\']')), 'Run menu');
  cheMenuRunTest = new Button (element(by.xpath('.//*[@id=\'topmenu\/Run\/Test\']')), 'Run -> Test');
  cheMenuRunTestJunit = new Button (element(by.xpath('.//*[@id=\'topmenu\/Run\/Test\/Run JUnit Test\']')), 'Run -> Test -> Junit');

  /* Junit output is displayed here */
  debugInfoPanel = new TextInput (element(by.xpath('.//*[@id=\'gwt-debug-infoPanel\']')));

  /* Project name as displayed in project explorer */
  recentProjectRootByName (projectName: string): ElementFinder {
    let xpathString = './/*[@id=\'gwt-debug-projectTree\']/div[contains(@name,\'' + projectName + '\')]';
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
  let xpathString = './/*[contains (@class,\'GDPEHSMCNBB\')]//*[contains(text(),\'' + elementString + '\')]';
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
  }
}

// tslint:enable:max-line-length

}
