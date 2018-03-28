import { ExpectedConditions as until, ElementFinder, browser, By, by } from 'protractor';
import { BaseElement } from '../ui/base.element';
import { Quickstart } from '../support/quickstart';
import { Button, Checkbox, TextInput } from '../ui';

export class LauncherSetupAppPage extends BaseElement {

  returnToMyDashboardButton = new Button(
    this.element(by.xpath('//*[contains(@class,\'f8launcher-continue\')]//a')),
    'Return to My Dashboard'
  );

  async ready() {
    super.ready();
  }

  constructor(element: ElementFinder) {
    super(element, 'Set Up Application');
  }


  newProjectBoosterOkIcon(name: string): BaseElement {
    return new BaseElement(
      this.element(by.xpath('//f8launcher-projectprogress-createapp-nextstep' +
        '//*[contains(text(),\'' + name + '\')]' +
        '//ancestor::*[contains(@class,\'pfng-list-content\')]' +
        '//*[contains(@class,\'pficon-ok\')]')),
      'OK Icon (' + name + ')'
    );
  }

}
