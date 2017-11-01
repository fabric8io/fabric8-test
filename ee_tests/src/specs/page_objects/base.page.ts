import { browser } from 'protractor';
import * as mixins from '../mixins';

export abstract class BasePage {
  // add logging mixin
  name: string = '...';
  log: (action: string, ...msg: string[]) => void;

  protected url: string = ''; // Will be same as baseUrl by default.

  constructor(url?: string) {
    this.url = url || '';
  }

  async ready() {
  }

  async open(): Promise<BasePage> {
    await this.ready();
    this.log('Opened');
    return this;
  }

}

mixins.applyMixins(BasePage, [mixins.Logging]);
