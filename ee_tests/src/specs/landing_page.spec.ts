import { browser, ExpectedConditions as EC, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';

describe('Landing Page', () => {
  let landingPage: LandingPage;

  beforeEach( async () => {
    support.desktopTestSetup();
    landingPage = new LandingPage(browser.params.target.url);
    support.debug('... HomePage.Open');
    await landingPage.open();
    support.debug('... HomePage.Open - DONE');
  });

  it('shows the title', async () => {
    await expect(await browser.getTitle()).toEqual('OpenShift.io');
  });

  it('shows login button', async () => {
    await expect($$('div').first()).toAppear('Atleast one div should appear on the page');
    await expect( landingPage.loginButton).toAppear('Login must be present');
  });

  it('can navigate to login page', async () => {
    let loginPage = await landingPage.gotoLoginPage();

    // poc: can wait on multiple promises to resolve
    await Promise.all([
      expect(loginPage.usernameInput).toAppear('Username input must be present'),
      expect(loginPage.passwordInput).toAppear('Password input must be present'),
      expect(loginPage.loginButton).toAppear('Login button must be present'),
    ]);
  });

  it('can login using a valid username and password', async () => {
    support.debug('... starting test; loginPage');
    let loginPage = await landingPage.gotoLoginPage();
    support.debug('... back from gotoLoginPage');
    let dashboardPage = await loginPage.login(browser.params.login.user, browser.params.login.password);
    await dashboardPage.validate();
  });
});
