/*
  OSIO EE test - Page object model - Deployed Booster app
*/

// tslint:disable:max-line-length
import { browser, Key, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, ElementArrayFinder } from 'protractor';
// tslint:ensable:max-line-length
import { AppPage } from './app.page';
import { TextInput, Button } from '../ui';

export class BoosterEndpoint extends AppPage {

  // tslint:disable:max-line-length

  nameText = new TextInput(element(by.xpath('.//input[contains(@id, \'name\')]')) , 'Name text field');
  invokeButton = new Button($('#invoke'), 'Invoke Button');
  stageOutput = element(by.id('greeting-result'));

// tslint:enable:max-line-length

}
