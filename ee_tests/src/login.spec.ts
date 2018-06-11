import * as support from './support';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { browser } from 'protractor';
import { LoginInteraction } from './support';

/**
 * Simple test for log in and log out.
 */
describe('e2e_logintest', () => {

  let login: LoginInteraction;

  let dashboardPage: MainDashboardPage;

  let i = 1;

  beforeAll(async () => {
    await support.desktopTestSetup();
  });

  afterEach(async () => {
    await support.writeScreenshot('target/screenshots/login_test_' + i + '.png');
    await support.writePageSource('target/screenshots/login_test_' + i + '.html');
    i++;
  });

  it('login', async () => {
    support.info('--- Login ---');
    login = new support.LoginInteraction();
    dashboardPage = await login.run();

    expect(dashboardPage.header.recentItemsDropdown.isPresent()).toBeTruthy();
    expect(dashboardPage.header.recentItemsDropdown.getText()).toBe(browser.params.login.user);

    expect(login.page.loginButton.isPresent()).toBeFalsy();
  });

  it('logout', async () => {
    support.info('--- Logout ---');
    await dashboardPage.logout();

    expect(dashboardPage.header.recentItemsDropdown.isPresent()).toBeFalsy();
    expect(login.page.loginButton.isPresent()).toBeTruthy();
  });
});
