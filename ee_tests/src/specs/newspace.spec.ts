import { browser, ExpectedConditions as EC, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';

describe('Creating new spaces in OSIO', () => {
  let landingPage: LandingPage;

  beforeEach( async () => {
    support.desktopTestSetup();
    landingPage = new LandingPage(browser.params.target.url);
    support.debug('>>> Landing Page Open');
    await landingPage.open();
    support.debug('>>> Landing Page Open - DONE');
  });


  it('Create a new space without creating a new quickstart', async () => {
    support.debug('>>> starting test; loginPage');
    let loginPage = await landingPage.gotoLoginPage();
    support.debug('>>> back from gotoLoginPage');

    let url = browser.params.target.url;
    let { user, password } = browser.params.login;
    let dashboardPage = await loginPage.login(user, password);

    let workspace = support.newSpaceName();
    let spaceDashboardPage = await dashboardPage.createNewSpace(url, user, workspace);

    let currentUrl = await browser.getCurrentUrl()
    support.info('EE test - new space URL = ', currentUrl);
  });
});
