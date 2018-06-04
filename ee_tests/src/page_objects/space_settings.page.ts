import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import * as support from '../support';
import { TextInput, Button, BaseElement, BaseElementArray, Clickable } from '../ui';
import { BasePage } from '.';


export class SpaceSettings extends BasePage {
  settings = new BaseElement($('.pficon-settings'), 'Settings');
  areasTab = new Button (element(by.xpath('//span[contains(text(),\'Areas\')]')), 'Areas');
  collaboratorsTab = new Button (element(by.xpath('//span[contains(text(),\'Collaborators\')]')), ' Collaborators Tab');
  addCollaboratorsButton = new Button (element(by.xpath('//span[contains(text(),\'Add Collaborators\')]')), 'Add Collaborators Button');
  addAreasButton = new Button($('.add-codebase-tooltip'),'Add Areas Button');
  list = new BaseElementArray($$('.list-pf-item'));
  createAreaDialog = new BaseElement($('.create-dialog'), 'create area dialog');
  areaInputField = new TextInput($('#name'), 'Enter a name for are input field');
  cancelButton = new Button (element(by.xpath('//button[contains(text(),\'Cancel\')]')), 'cancel button');
  createButton = new Button (element(by.xpath('//button[contains(text(),\'Create\')]')), 'create button');
  showAreasChildren = new Clickable($('.toggle-children'), 'show Areas children');
  modal = new BaseElement($('.modal-backdrop.fade'),'modal fade');

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