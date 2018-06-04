import { $, by, ElementFinder, browser, ExpectedConditions as until } from 'protractor';
import * as support from '../../support';
import * as ui from '../../ui';

export class ProfileDropdown extends ui.Dropdown {
  profileItem = this.item('Profile');
  aboutItem = this.item('About');
  logoutItem = this.item('Log Out')

  constructor(element: ElementFinder) {
    super(element);
  }

  async ready() {
    support.debug(' ... check if ProfileDropdown is Ready');
    await super.ready();
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
    support.debug(' ... check if RecentItems is ready');
  }
}

// export class StatusDropdown extends ui.Dropdown {

// }


export class Header extends ui.BaseElement {
  profileDropdown = new ProfileDropdown(this.$('.user-dropdown-menu'));
  recentItemsDropdown = new RecentItemsDropdown(this.$('.recent-items-dropdown'));

  constructor(el: ElementFinder) {
    super(el);
  }

  async ready() {
    support.debug(' ... check if Header is ready');
    await this.profileDropdown.ready();
    await this.recentItemsDropdown.ready();
    support.debug(' ... check if Header is ready - OK');
  }
}

