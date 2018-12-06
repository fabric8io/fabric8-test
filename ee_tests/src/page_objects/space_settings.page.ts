import { BaseElement, BaseElementArray, Button, Clickable, TextInput } from '../ui';
import { $, $$, by, element, Key } from 'protractor';
import * as logger from '../support/logging';
import { AppPage } from '../page_objects/app.page';

export class SpaceSettings extends AppPage {
  settings = new BaseElement($('.pficon-settings'), 'Settings');
  list = new BaseElementArray($$('.list-pf-item'));

   /* UI elements - Areas Tab*/
  areasTab = new Clickable(
    element(by.cssContainingText('.nav.navbar-nav.navbar-persistent li>a', 'Areas')),
    'Areas Tab');
  addAreasButton = new Button($("[tooltip='Add Areas']"), 'Add Areas Button');
  createAreaDialog = new BaseElement($('create-area-dialog'), 'create area dialog');
  areaInputField = new TextInput(this.createAreaDialog.$('#name'), 'Area input field');
  cancelButton = new Button (this.createAreaDialog.$('.btn.btn-default'), 'cancel button');
  createButton = new Button (this.createAreaDialog.$('.btn.btn-primary'), 'create button');
  showAreasChildren = new Clickable($('.toggle-children'), 'show Areas children');
  modal = new BaseElement($('.modal-backdrop'), 'modal fade');
  modalFade = new BaseElement($('[aria-hidden="false"]'));

   /* UI elements - Collaborators Tab*/
  collaboratorsTab = new Clickable(
    element(by.cssContainingText('.nav.navbar-nav.navbar-persistent li>a', 'Collaborators')),
    'Collaborators Tab');
  addCollaboratorsButton = new Clickable($('.table-action-heading'), 'Add Collaborators Button');
  collaboratorDialog = new BaseElement($('add-collaborators-dialog.add-dialog'), ' Add Collaborators dialog');
  searchCollaborator = new TextInput(this.collaboratorDialog.$('.ng-input>input'), 'Search Collaborator');
  collaboratorDropdown = new Clickable(this.collaboratorDialog.$('.scrollable-content'), 'Collaborator dropdown');
  selectCollaborator = new Clickable(this.collaboratorDropdown.$('.ng-option'), ' select collaborator');
  addButton = new Button(this.collaboratorDialog.$('.btn.btn-primary'), 'add collborator button');
  userInfo = new BaseElement($('.user-dropdown__username'), 'user name');

  async clickSettings() {
    logger.info('click settings button');
    await this.settings.clickWhenReady();
  }

   /* Areas page*/
  async clickAreasTab() {
    logger.info('click Areas Tab');
    await this.areasTab.clickWhenReady();
    await this.addAreasButton.untilDisplayed();
    logger.info('clicked Areas Tab');
  }

  async clickShowAreas() {
    logger.info('click show Areas');
    await this.showAreasChildren.ready();
    await this.showAreasChildren.untilClickable();
    await this.showAreasChildren.clickWhenReady();
    logger.info('done - click show Areas');
  }

   async addAreas(areaName: string) {
    logger.info('Add areas');
    await this.addAreasButton.clickWhenReady();
    await this.createAreaDialog.untilDisplayed();
    await this.areaInputField.enterText(areaName);
    await this.createButton.clickWhenReady();
    await this.createAreaDialog.untilHidden();
    await this.modalFade.untilHidden();
    logger.info('done - add areas');
  }

   /* Collaborators page*/
  async clickCollaboratorsTab() {
    logger.info('click Collaborator Tab');
    await this.collaboratorsTab.clickWhenReady();
    await this.addCollaboratorsButton.untilDisplayed();
    logger.info('done - clicked Collaborators Tab');
  }

   async addCollaborators(userName: string) {
    logger.info('add collaborator');
    await this.addCollaboratorsButton.clickWhenReady();
    await this.collaboratorDialog.untilDisplayed();
    await this.searchCollaborator.untilClickable();
    await this.searchCollaborator.clickWhenReady();
    await this.searchCollaborator.enterText(userName);
    await this.collaboratorDropdown.untilDisplayed();
    await this.searchCollaborator.sendKeys(Key.ENTER);
    await this.addButton.clickWhenReady();
    await this.addButton.untilHidden();
    await this.modal.untilHidden();
    logger.info('done - add collaborators');
  }

   async getCollaboratorList(): Promise<String> {
    let collaboratorList = await this.list.getText();
    return collaboratorList.toString().replace('\n', '');
  }

  getUserInfo() {
    return this.userInfo.getText();
  }
}
