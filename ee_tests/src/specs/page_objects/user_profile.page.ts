import { browser, by, ExpectedConditions as until, $ } from 'protractor';
import * as support from '../support';

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
  eraseEnvButton = this.innerElement(
    ui.Button, '#overview button',
    'Erase My OpenShift.io Environment'
  );

  alertBox = new ui.BaseElement($('#overview div.alert'), 'Alert Box');


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
    await this.eraseEnvButton.clickWhenReady();

    let confirmationElement =  this.innerElement(ui.BaseElement, 'modal', '');
    let confirmationBox = new CleanupConfirmationModal(confirmationElement);

    await confirmationBox.ready();
    await confirmationBox.confirmationInput.enterText(username);
    await confirmationBox.confirmEraseButton.clickWhenReady();

    support.debug('... waiting for alert box');
    await this.alertBox.untilPresent(15 * 1000);
    support.debug('... waiting for alert box - OK');
    await this.alertBox.untilTextIsPresent('Your OpenShift.io environment has been erased!');
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

