import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder, Key } from 'protractor';
import * as support from '../support';
import { TextInput, Button, BaseElement, BaseElementArray, Clickable } from '../ui';
import { BasePage } from '.';


export class SpaceSettings extends BasePage {
  settings = new BaseElement($('.pficon-settings'), 'Settings');
  list = new BaseElementArray($$('.list-pf-item'));

  /* UI elements - Areas Tab*/
  areasTab = new Clickable(element(by.cssContainingText('.nav.navbar-nav.navbar-persistent li', ' Areas')),'Areas Tab');
  addAreasButton = new Button($('.add-codebase-tooltip'),'Add Areas Button');
  createAreaDialog = new BaseElement($('.create-dialog'), 'create area dialog');
  areaInputField = new TextInput(this.createAreaDialog.$('#name'), 'Enter a name for are input field');
  cancelButton = new Button (this.createAreaDialog.$('.btn.btn-default'), 'cancel button');
  createButton = new Button (this.createAreaDialog.$('.btn.btn-primary'), 'create button');
  showAreasChildren = new Clickable($('.toggle-children'), 'show Areas children');
  modal = new BaseElement($('.modal-backdrop.fade'),'modal fade');

  /* UI elements - Collaborators Tab*/
  collaboratorsTab = new Clickable(element(by.cssContainingText('.nav.navbar-nav.navbar-persistent li', ' Collaborators')),'Collaborators Tab');
  addCollaboratorsButton = new Button ($('.table-action-heading'), 'Add Collaborators Button');
  collaboratorDialog = new BaseElement($('add-collaborators-dialog.add-dialog'), ' Add Collaborators dialog');
  openDropdown = new Button(this.collaboratorDialog.$('.dropdown-toggle'), ' open Collaborator dropdown');
  dropdownMenu = new Button(this.collaboratorDialog.$('.dropdown-menu'), 'Collaborator dropdown menu');
  searchCollaborator = new TextInput(this.dropdownMenu.$('input[placeholder="Search..."]'), 'Search Collaborator');
  dropdownItem = new BaseElementArray(this.collaboratorDialog.$$('li.dropdown-item'));
  addButton = new Button (this.collaboratorDialog.$('.btn.btn-primary'), 'add collborator button');

  async clickSettings() {
    await this.settings.clickWhenReady();
    await this.waitUntilUrlContains('settings');
  }

  /* Areas page*/
  async clickAreasTab() {
    await this.areasTab.clickWhenReady();
    await this.addAreasButton.untilDisplayed();
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

  /* Collaborators page*/
  async clickCollaboratorsTab() {
    await this.collaboratorsTab.clickWhenReady();
    await this.addCollaboratorsButton.untilDisplayed();
  }

  selectCollaborator (text: string) {
    return new BaseElement(element(by.xpath(".//add-collaborators-dialog//span[contains(text(), '" + text + "')]")));
  }

  async addCollaborators(userName: string) {
    await this.addCollaboratorsButton.clickWhenReady();
    await this.collaboratorDialog.untilDisplayed();
    await this.openDropdown.clickWhenReady();
    await this.dropdownMenu.untilDisplayed();
    await this.searchCollaborator.enterText(userName);
    await this.searchCollaborator.sendKeys(Key.ENTER);
    await this.dropdownItem.untilCount(1);
    await this.selectCollaborator(userName).clickWhenReady();
    await this.addButton.clickWhenReady();
    await this.modal.untilHidden();
  }

  async getCollaboratorList() : Promise<String> {
    let collaboratorList = await this.list.getText();
    return collaboratorList.toString().replace("\n","");
  }
}