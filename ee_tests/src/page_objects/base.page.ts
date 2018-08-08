import { browser } from 'protractor';
import * as support from '../support';

export enum PageOpenMode {
  AlreadyOpened,
  RefreshBrowser,
  UseMenu
}

export abstract class BasePage {

  protected url: string | undefined;

  constructor(url?: string) {
    this.url = url;
  }

  async ready() {
  }

  async open(mode: PageOpenMode = PageOpenMode.AlreadyOpened): Promise<BasePage> {

    support.debug(`Open page ${this.constructor.name} in ${PageOpenMode[mode]} mode`);

    if (mode === PageOpenMode.RefreshBrowser) {
      await this.openInBrowser();
    }

    if (mode === PageOpenMode.UseMenu) {
      await this.openUsingMenu();
    }

    await this.ready();

    support.debug(`Page ${this.constructor.name} opened`);
    return this;
  }

  async openUsingMenu() {
    // leave it to dependent classes if they want to implement this
  }

  async openInBrowser() {
    if (this.url === undefined) {
      throw Error('Trying to open and undefined url');
    }

    support.debug('Page URL: ' + this.url);
    await browser.get(this.url);
  }
}
