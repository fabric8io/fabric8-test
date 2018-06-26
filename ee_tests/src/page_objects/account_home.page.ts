import { AppPage } from './app.page';
/**
 * Page object for the 'new' implementation of account home
 */
export class AccountHomePage extends AppPage {

  constructor() {
    super('_home');
  }

  async openUsingMenu() {
    await this.header.recentItemsDropdown.selectAccountHome();
  }
}
