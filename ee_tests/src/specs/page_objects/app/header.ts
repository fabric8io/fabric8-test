import { $, by, ElementFinder, browser, ExpectedConditions as until } from 'protractor';
import * as support from '../../support';
import * as ui from '../ui';

export class ProfileDropdown extends ui.Dropdown {
  profileItem = this.item('Profile');

  constructor(element: ElementFinder) {
    super(element);
  }

  async ready() {
    support.debug(' ... check if ProfileDropdown is Ready');
    await super.ready();
    await this.profileItem.ready();
    support.debug(' ... check if ProfileDropdown is Ready - OK');
  }
}

export class RecentItemsDropdown extends ui.Dropdown {
  accountHomeItem = this.item('Account home');
  createSpaceItem = this.item('Create space');
  viewAllSpaces = this.item('View all spaces');

  constructor(element: ElementFinder) {
    super(element);
  }

  async ready() {
    support.debug(' ... check if RecentItems is ready');
    await super.ready();
    await this.accountHomeItem.ready();
    await this.createSpaceItem.ready();
    await this.viewAllSpaces.ready();
    support.debug(' ... check if RecentItems is ready');
  }
}

export class Header extends ui.BaseElement {
  profileDropdown = new ProfileDropdown(this.$('.pull-right.dropdown'));
  recentItemsDropdown = new RecentItemsDropdown(this.$$('.dropdown').get(0));

  constructor(app: ElementFinder) {
    super(app.$('header > alm-app-header > nav'));
  }

  async ready() {
    support.debug(' ... check if Header is ready');
    await this.profileDropdown.ready();
    await this.recentItemsDropdown.ready();
    support.debug(' ... check if Header is ready - OK');
  }
}

