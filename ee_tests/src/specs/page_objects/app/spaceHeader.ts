import { $, by, ElementFinder, browser, ExpectedConditions as until } from 'protractor';
import * as support from '../../support';
import * as ui from '../../ui';
import { TextInput, Button } from '../../ui';

export class SpaceHeader extends ui.BaseElement {

  // tslint:disable:max-line-length
  codebasesOption = new Button (this.element(by.xpath('.//a/span[contains(text(),\'Codebases\')]')), 'Codebases option');
  pipelinesOption = new Button (this.element(by.xpath('.//a/span[contains(text(),\'Pipelines\')]')), 'Pipelines option');
  applicationsOption = new Button (this.element(by.xpath('.//a/span[contains(text(),\'Applications\')]')), 'Pipelines option');
  environmentsOption = new Button (this.element(by.xpath('.//a/span[contains(text(),\'Environments\')]')), 'Environments option');
  deploymentsOption = new Button (this.element(by.xpath('.//a/span[contains(text(),\'Deployments\')]')), 'Deployments option');
// tslint:enable:max-line-length

  constructor(el: ElementFinder) {
    super(el);
  }

  async ready() {
    support.debug(' ... check if Space Header is ready');
    await this.codebasesOption.ready();
    support.debug(' ... check if Space Header is ready - OK');
  }
}

