import { browser, by, element, ElementFinder, ExpectedConditions as until } from 'protractor';
import { BasePage } from './base.page';
import * as timeouts from '../support/timeouts';
import { specContext } from '../support/spec_context';

export class SpaceCheWorkspacePage extends BasePage {

  constructor(workspace: string) {
    super(specContext.getCheUrl() + '/' + workspace);
  }

  async ready () {
    await browser.wait(
      until.presenceOf(element(by.cssContainingText('div#gwt-debug-dropdown-processes', 'Ready'))),
      timeouts.LONGER_WAIT,
      'Che exec dropdown is present');
  }

  async getProjects(): Promise<string[]> {
    let projectFinders: ElementFinder[] = await element.all(by.xpath('//div[@path=@project]'));

    let projects: string[] = [];

    for (let projectFinder of projectFinders) {
        projects.push(await projectFinder.getAttribute('name'));
    }

    return Promise.resolve(projects);
  }
}
