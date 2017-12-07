import { browser, by, ExpectedConditions as until, $ } from 'protractor';
import { AppPage } from './app.page';
import {BaseElement, ModalDialog, Button, TextInput} from '../ui';


class CleanupConfirmationModal extends ModalDialog {

  // NOTE: bodyContent is a tag
  body = this.content.$('.modal-body');
  bodyContent = this.body.$('modal-content');

  confirmationInput = new TextInput(
    this.bodyContent.$('form input'), 'username confirmation');

  confirmEraseButton = new Button(
    this.bodyContent.$('form button'), 'I understand my actions ...');

  constructor(element: BaseElement) {
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
    Button, '#overview button',
    'Erase My OpenShift.io Environment'
  );

  alertBox = new BaseElement($('#overview div.alert'), 'Alert Box');


  constructor() {
    super();
    this.url = `${browser.params.login.user}/_cleanup`;
  }

  async ready() {
    await super.ready();
    this.debug('ready', '... checking if erase button is there');
    await this.eraseEnvButton.untilClickable();
    this.debug('ready', '... checking if erase button is there - OK');
  }

  async cleanup(username: string) {
    await this.eraseEnvButton.clickWhenReady();

    let confirmationElement =  this.innerElement(BaseElement, 'modal', '');
    let confirmationBox = new CleanupConfirmationModal(confirmationElement);

    await confirmationBox.ready();
    await confirmationBox.confirmationInput.enterText(username);
    await confirmationBox.confirmEraseButton.clickWhenReady();

    this.debug('wait', 'for alert box');
    await this.alertBox.untilPresent(15 * 1000);
    this.debug('wait', 'for alert box - OK');
    await this.alertBox.untilTextIsPresent('Your OpenShift.io environment has been erased!');
  }

}

export class EditUserProfilePage extends AppPage {

  resetEnvButton = this.innerElement(Button, '#overview button', 'Reset Environment');

  async ready() {
    await this.resetEnvButton.untilClickable();
  }

  async gotoResetEnvironment() {
    await this.ready();
    await this.resetEnvButton.clickWhenReady();

    let page = new CleanupUserEnvPage();
    await page.open();
    return page;
  }

}

export class UserProfilePage extends AppPage {
  // TODO is there a better way to find the button? can we get devs to add an id?
  updateProfileButton = this.innerElement(
    Button,
    'alm-overview button.profile-update-button',
    'Update Profile'
  );

  async ready() {
    await super.ready();
    await this.updateProfileButton.untilClickable();
  }

  async gotoEditProfile() {
    this.updateProfileButton.clickWhenReady();
    this.debug('open', 'showing up Edit User Profile');
    let page =  new EditUserProfilePage();
    await page.open();
    return page;
  }

}

