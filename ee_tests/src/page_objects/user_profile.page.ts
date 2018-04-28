import { browser, by, ExpectedConditions as until, $, element } from 'protractor';
import * as support from '../support';
import { TextInput, Button, BaseElement } from '../ui';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';

import { AppPage } from './app.page';

import * as ui from '../ui';


class CleanupConfirmationModal extends ui.ModalDialog {

  // NOTE: bodyContent is a tag
  body = this.content.$('.modal-body');
  bodyContent = this.body.$('modal-content');

  confirmationInput = new ui.TextInput(
    this.bodyContent.$('form input'), 'username confirmation');

  confirmEraseButton = new ui.Button(
    this.bodyContent.$('form button'), 'I understand my actions ...');

  constructor(element: ui.BaseElement) {
    super(element, 'Cleanup confirmation Dialog');
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

  ERASE_TEXT: string = 'Your OpenShift.io environment has been erased!';

  eraseEnvButton = this.innerElement(
    ui.Button, '#overview button',
    'Erase My OpenShift.io Environment'
  );

  alertBox = new ui.BaseElement($('#overview div.alert'), 'Alert Box');
  dashboardButton = new Button(element (by.xpath('.//button[contains(text(),\'Take me to my Dashboard\')]')),
  'Take me to my Dashboard button');

  constructor() {
    super();
    this.url = `${browser.params.login.user}/_cleanup`;
  }

  async ready() {
    await super.ready();
    support.debug('... checking if erase button is there');
    await this.eraseEnvButton.untilClickable();
    support.debug('... checking if erase button is there - OK');
  }

  async cleanup(username: string) {
    this.cleanupSupport(username);

    await browser.wait(until.presenceOf(this.alertBox), support.LONG_WAIT);
    let alertText = await this.alertBox.getText();
    support.info('Alert text = ' + alertText);

    /* An intermittent error is resulting in some user enviroment resets failing
       https://github.com/openshiftio/openshift.io/issues/1637
       If this happens - try one more time - if that fails something serious
       has happened and the test will/and should fail */
    if (alertText.includes(this.ERASE_TEXT)) {
      support.debug('***Env reset SUCCESS');
    } else {
      support.debug('***Env reset FAILURE - retrying');

      /* Retry - once - to reset env */
      await this.dashboardButton.clickWhenReady();
      let dashboardPage = new MainDashboardPage();
      let userProfilePage = await dashboardPage.gotoUserProfile();
      let editProfilePage = await userProfilePage.gotoEditProfile();
      let cleanupEnvPage = await editProfilePage.gotoResetEnvironment();

      this.cleanupSupport(username);

      /* Check for success - if this check also fails - the test will fail */
      await browser.wait(until.presenceOf(
        element(by.cssContainingText('fabric8-cleanup', this.ERASE_TEXT))));
    }
  }

  async cleanupSupport (username: string) {
    await this.eraseEnvButton.clickWhenReady();
    let confirmationElement =  this.innerElement(ui.BaseElement, 'modal', '');
    let confirmationBox = new CleanupConfirmationModal(confirmationElement);
    await confirmationBox.ready();
    await confirmationBox.confirmationInput.enterText(username);
    await confirmationBox.confirmEraseButton.clickWhenReady();
  }

}


export class EditUserProfilePage extends AppPage {

  resetEnvButton = this.innerElement(ui.Button, '#overview button', 'Reset Environment');

  async ready() {
    await this.resetEnvButton.untilClickable();
  }

  async gotoResetEnvironment() {
    await this.ready();
    support.debug('... going to click', 'Reset Environment');
    await browser.executeScript('arguments[0].scrollIntoView()', this.resetEnvButton.getWebElement());
    await this.resetEnvButton.clickWhenReady();
    support.debug('... going to click', 'Reset Environment', 'OK');

    let page = new CleanupUserEnvPage();
    support.debug('... going to open: CleanupUserEnvPage');
    await page.open();
    support.debug('... going to open: CleanupUserEnvPage - OK');
    return page;
  }

}

export class UserProfilePage extends AppPage {
  // TODO is there a better way to find the button? can we get devs to add an id?
  updateProfileButton = this.innerElement(
    ui.Button,
    'alm-overview button.profile-update-button',
    'Update Profile'
  );

  async ready() {
    await super.ready();
    await this.updateProfileButton.untilClickable();
  }

  async gotoEditProfile() {
    this.updateProfileButton.clickWhenReady();
    support.debug('... showing up Edit User Profile');
    let page =  new EditUserProfilePage();
    await page.open();
    return page;
  }

}

