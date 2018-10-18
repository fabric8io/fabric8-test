import { browser, by, element, ElementFinder, ExpectedConditions as until } from 'protractor';
import { AppPage } from './app.page';
import { Button } from '../ui/button';
import * as timeouts from '../support/timeouts';
import * as logger from '../support/logging';

export class CodebasesPage extends AppPage {

  private readonly selectWorkspace = 'Select a Workspace';

  private readonly openButtonLocator = by.cssContainingText('button', 'Open');

  public async ready() {
    await browser.wait(until.presenceOf(element(by.tagName('codebases-item-workspaces'))),
      timeouts.DEFAULT_WAIT, 'Tag <codebases-item-workspaces> is present');
  }

  public async createWorkspace() {
    let createCodebase = new Button(element(by.xpath('.//codebases-item-workspaces')), 'Create Codespace...');
    await createCodebase.clickWhenReady(timeouts.LONGER_WAIT);
    await browser.wait(until.presenceOf(element(this.openButtonLocator)));
  }

  public async openWorkspace() {
    let openWorkspace = new Button(element(this.openButtonLocator), 'Open Workspace...');
    openWorkspace.clickWhenReady(timeouts.LONGER_WAIT);
  }

  public async getWorkspaces(): Promise<string[]> {
    let elementsFinders: ElementFinder[] = await element(by.tagName('codebases-item-workspaces')).
      all(by.css('select > option'));

    let workspaces = new Array<string>();
    for (let finder of elementsFinders) {
      let workspace = await finder.getText();
      workspace = workspace.trim();
      logger.debug('Found workspace: ' + workspace);
      if (workspace !== this.selectWorkspace) {
        workspaces.push(await workspace);
      }
    }

    return Promise.resolve(workspaces);
  }
}
