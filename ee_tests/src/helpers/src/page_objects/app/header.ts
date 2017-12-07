import { $, by, ElementFinder, browser, ExpectedConditions as until } from 'protractor';
import { BaseElement, DropdownItem, Dropdown } from '../../ui';

export class ProfileDropdown extends Dropdown {
  profileItem = this.item('Profile');
  aboutItem = this.item('About');
  logoutItem = this.item('Log Out')

  constructor(element: ElementFinder) {
    super(element);
  }

  async ready() {
    this.debug('ready', ' ... check if ProfileDropdown is Ready');
    await super.ready();
    await this.profileItem.ready();
    await this.aboutItem.ready();
    await this.logoutItem.ready();
    this.debug('ready', ' ... check if ProfileDropdown is Ready - OK');
  }
}

export class RecentItemsDropdown extends Dropdown {
  accountHomeItem = this.item('Account home');
  createSpaceItem = this.item('Create space');
  viewAllSpaces = this.item('View all spaces');

  constructor(element: ElementFinder) {
    super(element);
  }

  async ready() {
    this.debug('ready', '... check if RecentItems is ready');
    await super.ready();
    await this.accountHomeItem.ready();
    await this.createSpaceItem.ready();
    await this.viewAllSpaces.ready();
    this.debug('ready', '... check if RecentItems is ready - OK');
  }
}

// export class StatusDropdown extends Dropdown {

// }


export class Header extends BaseElement {
  profileDropdown = new ProfileDropdown(this.$('.pull-right.dropdown'));
  recentItemsDropdown = new RecentItemsDropdown(this.$$('.dropdown').get(0));
  // statusDropdown = new Dropdown(this.$$('.dropdown').get(0));

  constructor(el: ElementFinder) {
    super(el);
  }

  async ready() {
    this.debug('ready', '... check if Header is ready');
    await this.profileDropdown.ready();
    await this.recentItemsDropdown.ready();
    this.debug('ready', ' ... check if Header is ready - OK');
  }
}

