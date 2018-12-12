import { $, browser, by, element, ExpectedConditions as until } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { specContext } from '../support/spec_context';
import { BaseElement, Clickable } from '../ui/base.element';
import { Button } from '../ui/button';
import { ModalDialog } from '../ui/modal_dialog';
import { TextInput } from '../ui/text_input';
import { AppPage } from './app.page';

class CleanupConfirmationModal extends ModalDialog {

  // NOTE: bodyContent is a tag
  body = this.content.$('.modal-body');
  bodyContent = this.body.$('modal-content');

  confirmationInput = new TextInput(
    this.bodyContent.$('form input'), 'username confirmation');

  confirmEraseButton = new Button(
    this.bodyContent.$('form button'), 'I understand my actions ...');

  constructor(elem: BaseElement) {
    super(elem, 'Cleanup confirmation Dialog');
  }

  async ready() {
    await super.ready();
    await this.body.isPresent();
    await this.body.isDisplayed();
    await this.bodyContent.isPresent();
    await this.bodyContent.isDisplayed();
    await this.confirmationInput.untilPresent();
    await this.confirmEraseButton.untilPresent();
  }

}

export class CleanupUserEnvPage extends AppPage {

  name: string;

  constructor() {
    super();
    this.url = `${specContext.getUser()}/_cleanup`;
    this.name = 'CodeReady Toolchain';
  }

  /* An intermittent error is resulting in some user enviroment resets failing
       https://github.com/openshiftio/openshift.io/issues/1637
       If this happens - try one more time - if that fails something serious
       has happened and the test will/and should fail */
  async cleanup(username: string) {
    try {
      await this.cleanupSupport(username);
    } catch (e) {
      await browser.sleep(timeouts.LONG_WAIT);
      logger.info('Retrying reset');
      await this.cleanupSupport(username);
    }
  }

  async cleanupSupport(username: string) {
    let eraseEnvButton = this.innerElement(
      Button, '#overview button',
      `Erase My ${this.name} Environment`
    );
    let alertBox = new BaseElement($('#overview div.alert'), 'Alert Box');
    const CLEANUP_SUCCESSFUL_MESSAGE: string = `Your ${this.name} environment has been erased!`;

    await eraseEnvButton.clickWhenReady();
    let confirmationElement = this.innerElement(BaseElement, 'modal', '');
    let confirmationBox = new CleanupConfirmationModal(confirmationElement);
    await confirmationBox.ready();
    await confirmationBox.confirmationInput.clear();
    await confirmationBox.confirmationInput.enterText(username);
    await confirmationBox.confirmEraseButton.clickWhenReady();

    await browser.wait(until.presenceOf(alertBox),
      timeouts.LONG_WAIT, 'Alert box is present');
    let alertText = await alertBox.getText();

    logger.info('Alert text: ' + alertText);
    if (alertText.includes(CLEANUP_SUCCESSFUL_MESSAGE)) {
      logger.info('Reset successfull');
    } else {
      logger.info('Reset failed');
      throw 'Reset of the environment failed';
    }
  }
}

export class EditUserProfilePage extends AppPage {

  resetEnvButton = this.innerElement(Button, '#overview button', 'Reset Environment');

  async ready() {
    await this.resetEnvButton.untilClickable();
  }

  async gotoResetEnvironment() {
    await this.ready();
    logger.debug('going to click', 'Reset Environment');
    await browser.executeScript('arguments[0].scrollIntoView()', this.resetEnvButton.getWebElement());
    await this.resetEnvButton.clickWhenReady();
    logger.debug('going to click', 'Reset Environment', 'OK');

    let page = new CleanupUserEnvPage();
    logger.debug('going to open: CleanupUserEnvPage');
    await page.open();
    logger.debug('going to open: CleanupUserEnvPage - OK');
    return page;
  }

  async getToken(): Promise<string> {
    return element(by.className('token-heading')).getText();
  }
}

export class UserProfilePage extends AppPage {

  async gotoEditProfile() {
    let editProfileButton = new Button(element(by.cssContainingText('button', 'Edit Profile')), 'Edit Profile');
    await editProfileButton.clickWhenReady();

    let page = new EditUserProfilePage();
    await page.open();
    return page;
  }
}

export class WorkItemCard extends AppPage {
  workItemsCard = new BaseElement($('alm-work-items'), 'work item card');

  async clickWorkItemTitle(title: string) {
    let workitem = new Clickable(element(by.xpath(
      "//span[contains(@class,'work-item-title')]//a[text()=' " + title + " ']")));
    await workitem.clickWhenReady();
  }

}
