import { by, ElementFinder } from 'protractor';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

export class LauncherSection extends BaseElement {
  nav = new BaseElement(this.$('.f8launcher-container_nav'));
  content = new BaseElement(this.$('.f8launcher-container_main'));

  loginAndAuthorizeButton = new Button(
    this.element(by.xpath('//f8launcher-gitprovider-createapp-step' +
      '//*[contains(@class,\'f8launcher-authorize-account\')]')),
    'Log In & Authorize Account'
  );

  gitProviderImportContinueButton = new Button(
    this.element(by.xpath('//f8launcher-gitprovider-importapp-step' +
      '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
    'Git Provider Continue'
  );

  leaveSetupButton = new Button(
    this.element(by.xpath('//*[contains(@class,\'sticky close\')]')),
    'Leave Setup'
  );

  confirmCancelButton = new Button(
    this.$('#confirmCancelButton'),
    'Confirm Cancel Button'
  );

  importApplicationButton = new Button(
    this.element(
      by.xpath('//*[contains(@class,\'btn\')][contains(text(),\'Import Application\')]')),
    'Import Application'
  );

  constructor(element: ElementFinder) {
    super(element, 'Ngx Launcher');
  }

  pipelineCheckbox(index: number): Checkbox {
    return new Checkbox(
      this.element(by.xpath('//*[@name=\'pipelineId\'][' + index + ']')),
      'Pipeline'
    );
  }

  summaryMission(name: string): BaseElement {
    return new BaseElement(this.element(
      by.xpath(
        '//f8launcher-projectsummary-createapp-step//*[contains(text(),\'Mission\')]' +
        '//ancestor::*[contains(@class,\'card-pf--xsmall\')]' +
        '//*[contains(text(),\'' + name + '\')]'
      )
    ),
      'Mission Summary ' + name
    );
  }

  summaryRuntime(name: string): BaseElement {
    return new BaseElement(this.element(
      by.xpath(
        '//f8launcher-projectsummary-createapp-step//*[contains(text(),\'Runtime\')]' +
        '//ancestor::*[contains(@class,\'card-pf--xsmall\')]' +
        '//*[contains(text(),\'' + name + '\')]'
      )
    ),
      'Mission Summary ' + name
    );
  }

  async ready() {
    await super.ready();
    await this.nav.ready();
    await this.content.ready();
  }

  async open() {
    await this.ready();
    this.info('Opened');
    return this;
  }
}
