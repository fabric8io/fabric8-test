import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import * as support from '../support';
import { TextInput, Button } from '../ui';
import { BasePage } from '.';

export class OsoDashboardPage extends BasePage {

  userMenu = new Button(element(by.xpath('//navbar-utility//span[contains(@class,\'username\')]')), 'User Menu');
  copyLoginCommandItem = element(by.xpath('//navbar-utility//a[contains(text(),\'Copy Login Command\')]'));

  async copyLoginCommand(): Promise<string> {
    await this.userMenu.clickWhenReady();
    await browser.wait(until.elementToBeClickable(this.copyLoginCommandItem));
    return this.copyLoginCommandItem.getAttribute('data-clipboard-text');
  }
}
