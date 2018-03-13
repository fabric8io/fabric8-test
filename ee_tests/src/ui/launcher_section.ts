import { ExpectedConditions as until, ElementFinder, browser, By, by } from 'protractor';
import { BaseElement } from './base.element';
import { Quickstart } from '../support/quickstart';
import { Button, Checkbox } from '.';

export class LauncherSection extends BaseElement {
  nav = new BaseElement(this.$('.f8launcher-container_nav'));
  content = new BaseElement(this.$('.f8launcher-container_main'));
  // optional
  // footer = new BaseElement(this.content.$('.modal-footer'));

  missionRuntimeContinueButton = new Button(
    this.element(by.xpath('//f8launcher-missionruntime-createapp-step' +
      '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
    'Mission&Runtime Continue'
  );

  releaseStrategyContinueButton = new Button(
    this.element(by.xpath('//f8launcher-releasestrategy-createapp-step' +
      '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
    'Pipeline Continue'
  );

  loginAndAuthorizeButton = new Button(
    this.element(by.xpath('//f8launcher-gitprovider-createapp-step' +
      '//*[contains(@class,\'f8launcher-authorize-account\')]')),
    'Log In & Authorize Account'
  );

  leaveSetupButton = new Button(
    this.element(by.xpath('//*[contains(@class,\'sticky close\')]')),
    'Leave Setup'
  );

  confirmCancelButton = new Button(
    this.$('#confirmCancelButton'),
    'Confirm Cancel Button'
  );

  pipelineCheckbox(index: number): Checkbox {
    return new Checkbox(
      this.element(by.xpath('//*[@name=\'pipelineId\'][' + index + ']')),
      'Pipeline'
    );
  }

  constructor(element: ElementFinder, name?: string) {
    super(element, name);
  }

  async ready() {
    await super.ready();
    await this.nav.ready();
    await this.content.ready();
  }

  async open() {
    await this.ready();
    this.log('Opened');
    return this;
  }

  async selectRuntime(name: string) {
    this.log('Selecting runtime: ' + name);
    let selection = this.element(by.xpath(
      '//div[@class=\'list-group-item-heading\'][contains(text(),\'' + name + '\')]' +
      '/ancestor::*[@class=\'list-group list-view-pf\']//input[@type=\'radio\']')
    );
    selection.click();
  }

  async selectMission(name: string) {

    this.log('Selecting mission: ' + name);
    let selection = this.element(By.xpath(
      '//div[@class=\'list-group-item-heading\'][contains(text(),\'' + name + '\')]' +
      '/ancestor::*[@class=\'list-group list-view-pf\']//input[@type=\'radio\']')
    );
    selection.click();
  }

  async selectPipeline(index: number) {
    this.pipelineCheckbox(index).clickWhenReady();
  }
}
