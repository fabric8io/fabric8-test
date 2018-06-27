import { by, element } from 'protractor';
import { AppPage } from './app.page';
import { Button } from '../ui/button';
import { TextInput } from '../ui/text_input';

export class StageRunPage extends AppPage {

  /* Link to create workspace */
  createCodebase = new Button(element(by.xpath('.//codebases-item-workspaces')), 'Create Codespace...');
  stageIcon = new Button(element(by.xpath(
    './/div[contains(text(),\'Rollout to Stage\')]/*[contains(@class,\'open-service-icon\')]/a'
  )), 'Stage icon');

  /* Elements visible when the app is not yet available on stage or run */
  appNotAvailable = element(by.xpath('.//h1[contains(text(),\'Application is not availale\')]/a'));

  /* Elements visible when the app is available on stage or run */
  appTitle = element(by.id('_http_booster'));
  textField = new TextInput(element(by.id('name')), 'App input text');
  submitButton = new Button(element(by.id('invoke')), 'Submit button');
  resultsText = element(by.id('greeting-result'));

}
