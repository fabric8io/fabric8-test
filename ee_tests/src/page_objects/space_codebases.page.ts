import { by, element, ElementFinder } from 'protractor';
import { AppPage } from './app.page';
import { Button } from '../ui/button';
import * as support from '../support';

export class CodebasesPage extends AppPage {

  private readonly selectWorkspace = 'Select a Workspace';

  public async createWorkspace() {
    let createCodebase = new Button(element(by.xpath('.//codebases-item-workspaces')), 'Create Codespace...');
    await createCodebase.clickWhenReady(support.LONGEST_WAIT);
  }

  public async openWorkspace() {
    let openWorkspace = new Button(element(by.cssContainingText('button', 'Open')), 'Open Workspace...');
    openWorkspace.clickWhenReady(support.LONGEST_WAIT);
  }

  public async getWorkspaces(): Promise<string[]> {
    let elementsFinders: ElementFinder[] = await element.all(by.css('codebases-item-workspaces > select > option'));

    let workspaces = new Array<string>();
    for (let finder of elementsFinders) {
      let workspace = await finder.getText();
      workspace = workspace.trim();
      if (workspace !== this.selectWorkspace) {
        workspaces.push(await finder.getText());
      }
    }

    return Promise.resolve(workspaces);
  }
}
