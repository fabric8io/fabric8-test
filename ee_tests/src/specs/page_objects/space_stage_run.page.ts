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

export class StageRunPage extends AppPage {

  /* Link to create workspace */
  createCodebase = new Button (element (by.xpath('.//codebases-item-workspaces')), 'Create Codespace...' );
  stageIcon = new Button (element(by.xpath('.//div[contains(text(),\'Rollout to Stage\')]/*[contains(@class,\'open-service-icon\')]/a')), 'Stage icon');

  /* Elements visible when the app is not yet available on stage or run */
  appNotAvailable = element(by.xpath('.//h1[contains(text(),\'Application is not availale\')]/a'));

  /* Elements visible when the app is available on stage or run */
  appTitle = element(by.id('_http_booster'));
  textField = new TextInput (element(by.id('name')), 'App input text');
  submitButton = new Button (element(by.id('invoke')), 'Submit button');
  resultsText = element(by.id('greeting-result'));

}
