import { browser } from 'protractor';
import * as mixins from '../mixins';

export abstract class BasePage {
  protected url: string = ''; // Will be same as baseUrl by default.

  constructor(url?: string) {
    this.url = url || '';
  }

  async ready() {
  }

  async open() {
    await this.ready();
    this.log('Opened')
  }

  // add logging mixin
  name: string = '...';
  log: (action: string, ...msg: string[]) => void;
}

mixins.applyMixins(BasePage, [mixins.Logging]);
