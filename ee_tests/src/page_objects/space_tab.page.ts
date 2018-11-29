import { by, element } from 'protractor';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';
import { SpaceAppPage } from './space_app.page';

export abstract class SpaceTabPage extends SpaceAppPage {

  deploymentsOption = new Button (
    element(by.xpath('.//a/span[contains(text(),\'Deployments\')]')), 'Deployments option');

  mainNavBar = new BaseElement(
    this.header.$('ul.nav.navbar-nav.navbar-primary.persistent-secondary'),
    'Main Navigation Bar'
  );

  // todo: add ready when we can consider the headers ready
  async ready() {
    await super.ready();
    await this.mainNavBar.ready();
  }

  async selectDeployments() {
    await this.deploymentsOption.clickWhenReady();
  }
}
