import { ElementFinder } from 'protractor';
import { BaseElement } from '../../ui/base.element';
import { Dropdown } from '../../ui/dropdown';

export class Header extends BaseElement {
  profileDropdown = new ProfileDropdown(this.$('.user-dropdown-menu'));
  recentItemsDropdown = new RecentItemsDropdown(this.$('.recent-items-dropdown'));

  constructor(el: ElementFinder) {
    super(el);
  }

  async ready() {
    await this.profileDropdown.ready();
    await this.recentItemsDropdown.ready();
  }
}

export class ProfileDropdown extends Dropdown {

  constructor(element: ElementFinder) {
    super(element);
  }

  async selectProfile() {
    super.select('Profile');
  }

  async selectSettings() {
    super.select('Settings');
  }

  async selectLogOut() {
    super.select('Log Out');
  }
}

export class RecentItemsDropdown extends Dropdown {

  constructor(element: ElementFinder) {
    super(element);
  }

  async selectAccountHome() {
    super.select('Account home');
  }

  async selectCreateSpace() {
    super.select('Create space');
  }

  async selectViewAllSpaces() {
    super.select('View all spaces');
  }

  async selecMySpaces() {
    super.select('My spaces');
  }
}
