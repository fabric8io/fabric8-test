import * as logger from './support/logging';
import { screenshotManager } from './support/screenshot_manager';
import { browser } from 'protractor';
import { AppPage } from './page_objects/app.page';
import { specContext } from './support/spec_context';
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
    browser.ignoreSynchronization = true;
    await browser.driver.manage().window().setSize(1920, 1080);
  });

  beforeEach(async() => {
    screenshotManager.nextTest();
  });

  afterEach(async () => {
    logger.info('--- After each ---');
    await screenshotManager.save('afterEach');
  });

  it('login', async () => {
    logger.info('--- Login ---');
    await loginInteractions.login();

    expect(await page.header.recentItemsDropdown.isPresent()).toBeTruthy('Recent items dropdown is present');
    expect(await page.header.recentItemsDropdown.getText()).
      toBe(specContext.getUser(), 'Recent items dropdown title is username');

    expect(await loginInteractions.isLoginButtonPresent()).toBeFalsy('Login button is not present');
  });

  it('logout', async () => {
    logger.info('--- Logout ---');
    await accountHomeInteractions.logout();

    expect(await page.header.recentItemsDropdown.isPresent()).toBeFalsy('Recent items dropdown is not present');
    expect(await loginInteractions.isLoginButtonPresent()).toBeTruthy('Login button is present');
  });
});
