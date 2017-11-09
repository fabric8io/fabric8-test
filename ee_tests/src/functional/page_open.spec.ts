import { browser } from 'protractor';
import * as support from '../specs/support';

import { LandingPage, CleanupUserEnvPage, PageOpenMode } from '../specs/page_objects';


describe('Page', function () {
  beforeEach( async () => {
    await support.desktopTestSetup();
  });

  it('open can be called mulitple times', async () => {
    let landingPage = new LandingPage();
    support.debug('Going to landing page');
    await landingPage.open();
    support.debug('Going to landing page', 'OK');

    support.debug('...........................................');
    support.debug('Going to landing page');
    await landingPage.open();
    support.debug('Going to landing page', 'OK');
    support.debug('...........................................');

    support.debug('Going to landing page');
    await landingPage.open();
    support.debug('Going to landing page', 'OK');
    support.debug('...........................................');

    support.debug('Login Page ...');
    let loginPage = await landingPage.gotoLoginPage();
    support.debug('Login Page ...', 'OK');
    support.debug('...........................................');

    support.debug('ReOpen Login Page ...');
    await loginPage.open();
    support.debug('ReOpen Login Page ...', 'OK');
    support.debug('...........................................');

    support.debug('ReOpen Login Page ...');
    await loginPage.open();
    support.debug('ReOpen Login Page ...', 'OK');
    support.debug('...........................................');

    let user = browser.params.login.user;
    let password = browser.params.login.password;

    support.debug('>>> Login & wait for dashboard');
    let dashboardPage = await loginPage.login(user, password);
    support.debug('>>> Login & wait for dashboard - OK');

    support.debug('ReOpen Dashboard Page ...');
    await dashboardPage.open();
    support.debug('ReOpen Dashboard Page ...', 'OK');
    support.debug('...........................................');

    support.debug('ReOpen Dashboard Page ...');
    await dashboardPage.open();
    support.debug('ReOpen Dashboard Page ...', 'OK');
    support.debug('...........................................');

    // Clean the user account in OSO with the new clean tenant button
    support.debug(">>> Go to user's Profile Page");
    let userProfilePage = await dashboardPage.gotoUserProfile();
    support.debug(">>> Go to user's Profile Page - OK");
  });

  it('open can open a page directly', async () => {
    let landingPage = new LandingPage();
    support.debug('Going to landing page');
    await landingPage.open();
    support.debug('Going to landing page', 'OK');

    support.debug('Login Page ...');
    let loginPage = await landingPage.gotoLoginPage();
    support.debug('Login Page ...', 'OK');
    support.debug('...........................................');

    let user = browser.params.login.user;
    let password = browser.params.login.password;

    support.debug('>>> Login & wait for dashboard');
    await loginPage.login(user, password);
    support.debug('>>> Login & wait for dashboard - OK');

    support.debug('>>> Go directly to cleanup');
    let cleanupPage = new CleanupUserEnvPage();
    try {
      // must throw error since we are not on that page
      await cleanupPage.open();
    } catch (e) {
      support.info('>>> Failed open as expected:', e.message);
    }

    await cleanupPage.open(PageOpenMode.RefreshBrowser);
    support.debug('>>> Go directly to cleanup', 'OK');
  });
});

