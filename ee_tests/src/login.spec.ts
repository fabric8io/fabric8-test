import * as support from './support';
import { browser } from 'protractor';
import { AppPage } from './page_objects/app.page';
import { LoginInteractionsFactory } from './interactions/login_interactions';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';

/**
 * Simple test for log in and log out.
 */
describe('e2e_logintest', () => {

  let loginInteractions = LoginInteractionsFactory.create();

  let accountHomeInteractions = AccountHomeInteractionsFactory.create();

  let page = new AppPage();

  beforeAll(async () => {
    await support.desktopTestSetup();
  });

  beforeEach(async() => {
    support.screenshotManager.nextTest();
  });

  afterEach(async () => {
    support.info('--- After each ---');
    await support.screenshotManager.save('afterEach');
  });

  it('login', async () => {
    support.info('--- Login ---');
    await loginInteractions.login();

    expect(await page.header.recentItemsDropdown.isPresent()).toBeTruthy('Recent items dropdown is present');
    expect(await page.header.recentItemsDropdown.getText()).
      toBe(browser.params.login.user, 'Recent items dropdown title is username');

    expect(await loginInteractions.isLoginButtonPresent()).toBeFalsy('Login button is not present');
  });

  it('logout', async () => {
    support.info('--- Logout ---');
    await accountHomeInteractions.logout();

    expect(await page.header.recentItemsDropdown.isPresent()).toBeFalsy('Recent items dropdown is not present');
    expect(await loginInteractions.isLoginButtonPresent()).toBeTruthy('Login button is present');
  });
});
