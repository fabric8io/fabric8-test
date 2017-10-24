import { browser } from 'protractor';

export abstract class BasePage {
  protected url: string = ''; // Will be same as baseUrl by default.

  constructor(url?: string) {
    this.url = url || '';
  }

  async open() {
    await browser.get(this.url);
  }

}
