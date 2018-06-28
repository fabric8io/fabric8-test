import { browser } from 'protractor';
import * as support from '../support';

export enum PageOpenMode {
  AlreadyOpened,
  RefreshBrowser,
  UseMenu
}

export abstract class BasePage {

  name: string = '...';

  // Use undefined to indicate the url has not been set
  // Will use be in openInBrowser to throw error if the caller forgot
  // to set the url. Need to do this because '' is a valid url and
  // refers to the baseUrl

  protected url: string | undefined;

  constructor(url?: string) {
    this.url = url;
    this.debug(`url: '${url}'`);
  }

  async ready() {
  }

  async open(mode: PageOpenMode = PageOpenMode.AlreadyOpened): Promise<BasePage> {

    if (mode === PageOpenMode.RefreshBrowser) {
      await this.openInBrowser();
    }

    if (mode === PageOpenMode.UseMenu) {
      await this.openUsingMenu();
    }

    await this.ready();
    this.log('Opened');
    return this;
  }

  async openUsingMenu() {
    // leave it to dependent classes if they want to implement this
  }

  async openInBrowser() {
    if (this.url === undefined) {
      throw Error('Trying to open and undefined url');
    }

    this.log('Opening', this.url);
    let currentUrl = await browser.getCurrentUrl();
    this.debug('at:', currentUrl);

    this.debug(`goto: '${this.url}'`);
    await browser.get(this.url);

    let urlNow = await browser.getCurrentUrl();
    this.debug('now:', urlNow);
  }

  log(action: string, ...msg: string[]) {
    let className = this.constructor.name;
    support.info(`${action}: ${className}('${this.name}')`, ...msg);
  }

  debug(context: string, ...msg: string[]) {
    let className = this.constructor.name;
    support.debug(`... ${className}('${this.name}'): ${context}`, ...msg);
  }
}
