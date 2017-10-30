import { browser, ExpectedConditions as EC, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';

describe('Creating new spaces in OSIO', () => {
  let landingPage: LandingPage;

  beforeEach( async () => {
    support.desktopTestSetup();
    landingPage = new LandingPage(browser.params.target.url);
    support.debug('... Landing Page Open');
    await landingPage.open();
    support.debug('... Landing Page Open - DONE');
  });

  it('Create a new space without creating a new quickstart', async () => {
    support.debug('... starting test; loginPage');
    let loginPage = await landingPage.gotoLoginPage();
    support.debug('... back from gotoLoginPage');
    let dashboardPage = await loginPage.login(browser.params.login.user, browser.params.login.password);
    await dashboardPage.ready();

    // tslint:disable:max-line-length
    let spaceDashboardPage = await dashboardPage.createNewSpace(browser.params.target.url, browser.params.login.user, support.returnTime());
    // tslint:enable:max-line-length

    browser.getCurrentUrl().then(function (text) {
        console.log ('EE test - new space URL = ' + text);
     });

  });
});
