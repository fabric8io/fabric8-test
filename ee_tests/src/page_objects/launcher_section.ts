import { ExpectedConditions as until, ElementFinder, browser, By, by } from 'protractor';
import { Quickstart } from '../support/quickstart';
import { BaseElement, Button, Checkbox, TextInput } from '../ui';
import { LauncherSetupAppPage, LauncherImportAppPage } from '.';

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

  releaseStrategyImportContinueButton = new Button(
    this.element(by.xpath('//f8launcher-releasestrategy-importapp-step' +
      '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
    'Pipeline Continue'
  );

  loginAndAuthorizeButton = new Button(
    this.element(by.xpath('//f8launcher-gitprovider-createapp-step' +
      '//*[contains(@class,\'f8launcher-authorize-account\')]')),
    'Log In & Authorize Account'
  );

  gitProviderContinueButton = new Button(
    this.element(by.xpath('//f8launcher-gitprovider-createapp-step' +
      '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
    'Git Provider Continue'
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

  ghOrgSelect = new Button(
    this.$('#ghOrg'),
    'Select Github Organization'
  );

  ghRepositoryText = new TextInput(
    this.$('#ghRepo'),
    'Github Repository'
  );

  setUpApplicationButton = new Button(
    this.element(
      by.xpath('//*[contains(@class,\'btn\')][contains(text(),\'Set Up Application\')]')),
    'Set Up Application'
  );

  importApplicationButton = new Button(
    this.element(
      by.xpath('//*[contains(@class,\'btn\')][contains(text(),\'Import Application\')]')),
    'Import Application'
  );

  ghOrgItem(name: string): Button {
    return new Button(
      this.ghOrgSelect.element(by.xpath('./option[contains(text(),\'' + name + '\')]')),
      'GitHub Organization'
    );
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

  constructor(element: ElementFinder) {
    super(element, 'Ngx Launcher');
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
    let selection = new Button(
      this.element(by.xpath('//div[@class=\'list-group-item-heading\'][contains(text(),\'' + name + '\')]')),
      'Select Runtime'
    );
    await selection.clickWhenReady();
    this.log('Selected runtime: ' + name);
  }

  async selectMission(name: string) {
    let selection = new Button(
      this.element(By.xpath('//div[@class=\'list-group-item-heading\'][contains(text(),\'' + name + '\')]')),
      'Select Mission'
    );
    await selection.clickWhenReady();
    this.log('Selected mission: ' + name);
  }

  async selectPipeline(name: string) {
    let selection = new Button(
      this.element(by.xpath(
        '//*[contains(@class,\'f8launcher-section-release-strategy\')]' +
        '//*[contains(@class,\'list-view-pf-description\')]' +
        '//span[last()]//*[@class=\'f8launcher-pipeline-stages--name\'][contains(text(),\'' + name + '\')]'
      )),
      'Select Pipeline'
    );
    await selection.clickWhenReady();
    this.log('Selected pipeline: ' + name);
  }

  async selectGithubOrganization(name: string) {
    await this.ghOrgSelect.clickWhenReady();
    await this.ghOrgItem(name).clickWhenReady();
    this.log('Selected GH Organization: ' + name);
  }

  async setUpApplication(): Promise<LauncherSetupAppPage> {
    await this.setUpApplicationButton.clickWhenReady();
    return new LauncherSetupAppPage(this.element(by.xpath('//f8launcher-projectprogress-createapp-nextstep')));
  }

  async importApplication(): Promise<LauncherImportAppPage> {
    await this.importApplicationButton.clickWhenReady();
    return new LauncherImportAppPage(this.element(by.xpath('//f8launcher-projectprogress-importapp-nextstep')));
  }
}
