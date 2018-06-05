import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import * as support from '../support';
import { TextInput, Button, BaseElement, BaseElementArray, Clickable } from '../ui';
import { BasePage } from '.';


export class SpaceSettings extends BasePage {
  settings = new BaseElement($('.pficon-settings'), 'Settings');

  /* UI elements - Areas Tab*/
  areasTab = new Clickable(element(by.cssContainingText('.nav.navbar-nav.navbar-persistent li', ' Areas')),'Areas Tab');
  addAreasButton = new Button($('.add-codebase-tooltip'),'Add Areas Button');
  list = new BaseElementArray($$('.list-pf-item'));
  createAreaDialog = new BaseElement($('.create-dialog'), 'create area dialog');
  areaInputField = new TextInput(this.createAreaDialog.$('#name'), 'Enter a name for are input field');
  cancelButton = new Button (this.createAreaDialog.$('.btn.btn-default'), 'cancel button');
  createButton = new Button (this.createAreaDialog.$('.btn.btn-primary'), 'create button');
  showAreasChildren = new Clickable($('.toggle-children'), 'show Areas children');
  modal = new BaseElement($('.modal-backdrop.fade'),'modal fade');

  /* UI elements - Collaborators Tab*/
  collaboratorsTab = new Clickable(element(by.cssContainingText('.nav.navbar-nav.navbar-persistent li', ' Collaborators')),'Collaborators Tab');
  addCollaboratorsButton = new Button ($('.table-action-heading'), 'Add Collaborators Button');

  async clickSettings() {
    await this.settings.clickWhenReady();
    await this.waitUntilUrlContains('settings');
  }

  async clickCollaboratorsTab() {
    await this.collaboratorsTab.clickWhenReady();
    await this.addCollaboratorsButton.untilDisplayed();
  }

  async clickAreasTab() {
    await this.areasTab.clickWhenReady();
    await this.addAreasButton.untilDisplayed();
  }

  async addCollaborators() {
    await this.addCollaboratorsButton.clickWhenReady();
  }

  async clickShowAreas() {
    await this.showAreasChildren.untilClickable();
    await this.showAreasChildren.clickWhenReady();
  }

  async addAreas(areaName: string) {
    await this.addAreasButton.clickWhenReady();
    await this.createAreaDialog.untilDisplayed();
    await this.areaInputField.enterText(areaName);
    await this.createButton.clickWhenReady();
    await this.createButton.untilHidden();
    await this.modal.untilHidden();
  }
}