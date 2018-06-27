/*
  OSIO EE test - Page object model - Deployed Booster app
*/

import { $, by, element } from 'protractor';
import { AppPage } from './app.page';
import { Button } from '../ui/button';
import { TextInput } from '../ui/text_input';

export class BoosterEndpoint extends AppPage {

  nameText = new TextInput(element(by.xpath('.//input[contains(@id, \'name\')]')) , 'Name text field');
  invokeButton = new Button($('#invoke'), 'Invoke Button');
  stageOutput = element(by.id('greeting-result'));

}
