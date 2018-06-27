import { $$, browser } from 'protractor';
import * as support from './support';
import { LandingPage } from './page_objects/landing.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';

describe('Landing Page', () => {

  beforeEach( async () => {
    await support.desktopTestSetup();
  });

  it('shows the title', async () => {
    let landingPage = new LandingPage();
    support.debug('... LandingPage.Open');
    await landingPage.open();
    support.debug('... LandingPage.Open - DONE');
    await expect(await browser.getTitle()).toEqual('OpenShift.io');
  });

  it('shows login button', async () => {
    let landingPage = new LandingPage();
    support.debug('... LandingPage.Open');
    await landingPage.open();
    support.debug('... LandingPage.Open - DONE');
    await expect($$('div').first()).toAppear('Atleast one div should appear on the page');
    await expect( landingPage.loginButton).toAppear('Login must be present');
  });

  it('can navigate to login page', async () => {
    let landingPage = new LandingPage();
    support.debug('... LandingPage.Open');
    await landingPage.open();
    support.debug('... LandingPage.Open - DONE');
    let loginPage = await landingPage.gotoLoginPage();

    // poc: can wait on multiple promises to resolve
    await Promise.all([
      expect(loginPage.usernameInput).toAppear('Username input must be present'),
      expect(loginPage.passwordInput).toAppear('Password input must be present'),
      expect(loginPage.loginButton).toAppear('Login button must be present'),
    ]);
  });

  it('can login using a valid username and password', async () => {
    let login = new support.LoginInteraction();
    await login.run();
    let mainDashboard = new MainDashboardPage();
    await mainDashboard.open();
  });

  it('can logout afer logging in', async () => {
    let login = new support.LoginInteraction();
    await login.run();
    let mainDashboard = new MainDashboardPage();
    await mainDashboard.logout();
  });
});
