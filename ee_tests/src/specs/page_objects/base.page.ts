import { browser } from 'protractor';
import * as mixins from '../mixins';
import * as support from '../support';


export enum PageOpenMode {
  AlreadyOpened,
  RefreshBrowser
}

export abstract class BasePage {
  // add logging mixin

  name: string = '...';
  log: (action: string, ...msg: string[]) => void;
  debug: (context: string, ...msg: string[]) => void;

  // Use undefined to indicate the url has not been set
  // Will use be in openInBrowser to throw error if the caller forgot
  // to set the url. Need to do this because '' is a valid url and
  // refers to the baseUrl

  protected url: string|undefined;

  constructor(url?: string) {
    support.debug(`... BasePage: ${this.constructor.name}: '${url}'`);
    this.url = url;
  }

  async ready() {
  }


  async open(mode: PageOpenMode =  PageOpenMode.AlreadyOpened): Promise<BasePage> {

    if (mode === PageOpenMode.RefreshBrowser) {
      this.openInBrowser();
    }

    await this.ready();
    this.log('Opened');
    return this;
  }

  async openInBrowser() {
    if (this.url === undefined ) {
      throw Error('Trying to open and undefined url');
    }

    let currentUrl = await browser.getCurrentUrl();
    support.debug('... Current Browser URL:', currentUrl);

    support.debug(`... Browser goto URL: '${this.url}'`);
    await browser.get(this.url);

    let urlNow = await browser.getCurrentUrl();
    support.debug('... Now the Browser URL:', urlNow);
  }
}

mixins.applyMixins(BasePage, [mixins.Logging]);
