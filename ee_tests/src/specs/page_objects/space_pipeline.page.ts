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

export class SpacePipelinePage extends AppPage {

  /* Page UI element - contains all pipelines */
  pipelinesPage = element(by.xpath('.//*[contains (@class,\'pipelines-page\')]'));

  /* List of all pipelines */
  pipelinesList = $('#pipeline-list');

  /* Kebab displayed after build pipeline performs stage and test */
  pipelineKebab = new Button ($('#dropdownKebabRight9'), 'Pipeline kebab');

  /* Kebab displayed after build pipeline performs stage and test */
  pipelineKebabStartPipeline = element(by.xpath('.//*[contains(text(), \'Start Pipeline\')]'));

  /* Stage icon */
  // tslint:disable:max-line-length
  stageIcon = element(by.xpath('.//div[contains(text(),\'Rollout to Stage\')]/*[contains(@class,\'open-service-icon\')]/a'));

  /* Run icon */
  runIcon = element(by.xpath('.//div[contains(text(),\'Rollout to Run\')]/*[contains(@class,\'open-service-icon\')]/a'));

  /* Button displayed after build pipeline performs stage and test */
  inputRequiredButton = element(by.xpath('.//a[contains(text(),\'Input Required\')][1]'));

  /* Buttons displayed in the promote dialog */
  closeButton = element(by.xpath('.//button[contains(text(),\'Close\')]'));
  abortButton = element(by.xpath('.//button[contains(text(),\'Abort\')]'));
  promoteButton = element(by.xpath('.//button[contains(text(),\'Promote\')]'));

  /* Link to analytics report */
  stackReportsButton = element (by.xpath('.//*[contains(@class,\'stack-reports-btn\')]'));

  /* Links displayed in the promote dialog */
  viewApplicationOnStage = element(by.xpath('.//a[contains(text(),\'View application on stage\')]'));
  seeAdditionalDetailsInJenkins = element(by.xpath('.//a[contains(text(),\'See additional details in jenkins\')]'));

  /* Locate a codebase by name */
  importCodebaseByName (nameString: string): ElementFinder {
    let xpathString = './/multiple-selection-list/div/ul/li/label/span[contains(text(),\'' + nameString + '\')]';
    return element(by.xpath(xpathString));
  }

  /* Locate a pipeline by name */
  allPipelineByName (nameString: string): ElementArrayFinder {
    let xpathString = './/a[contains(@class,\'card-title\') and contains(text(),\'' + nameString + '\')]/../../..';
    return element.all(by.xpath(xpathString));
  }

  /* Locate a pipeline by name */
  pipelineByName (nameString: string): ElementFinder {
    let xpathString = './/a[contains(@class,\'card-title\') and contains(text(),\'' + nameString + '\')]/../../..';
    return element(by.xpath(xpathString));
  }

  /* Element - input required button - by pipeline name - in pipeline list */
  inputRequiredByPipelineByName (nameString: string): ElementFinder {
    let xpathString = './/a[contains(@class,\'card-title\') and contains(text(),\'' + nameString + '\')]/../../..//a[contains(text(),\'Input Required\')]';
    return element(by.xpath(xpathString));
  }

}
