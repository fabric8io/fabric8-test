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
    await super.select('Profile');
  }

  async selectSettings() {
    await super.select('Settings');
  }

  async selectLogOut() {
    await super.select('Log Out');
  }
}

export class RecentItemsDropdown extends Dropdown {

  constructor(element: ElementFinder) {
    super(element);
  }

  async selectAccountHome() {
    await super.select('Home');
  }

  async selectCreateSpace() {
    await super.select('Create Space');
  }
}
