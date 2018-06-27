import { by, ElementFinder } from 'protractor';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';

export class LauncherSetupAppPage extends BaseElement {

  viewNewApplicationButton = new Button(
    this.element(by.xpath('//*[contains(@class,\'f8launcher-continue\')]' +
      '//*[contains(text(),\'View New Application\')]'
    )),
    'View New Application'
  );

  constructor(element: ElementFinder) {
    super(element, 'Set Up Application');
  }

  async ready() {
    super.ready();
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
