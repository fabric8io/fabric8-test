import { by, element, ElementFinder } from 'protractor';
import { AppPage } from './app.page';
import { Button } from '../ui/button';

export class SpaceChePage extends AppPage {

  /* Link to create workspace */
  createCodebase = new Button (element (by.xpath('.//codebases-item-workspaces')), 'Create Codespace...' );

  /* 'Open' button for existing codebase */
  codebaseOpenButton (githubUsername: string, spaceName: string): ElementFinder {
    let xpathString = './/button[contains(text(),\'Open\')]';
    return new Button (element (by.xpath(xpathString)), 'Open codebase button');
  }

}
