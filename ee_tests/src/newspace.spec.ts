import { browser } from 'protractor';
import * as support from './support';
import { MainDashboardPage, SpaceDashboardPage } from './page_objects';

describe('Creating new spaces in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach( async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  it('Create a new space without creating a new quickstart', async () => {
    let spaceName = support.newSpaceName();
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let currentUrl = await browser.getCurrentUrl();
    support.debug ('>>> browser is URL: ' + currentUrl);

    let url = browser.baseUrl;
    let user = browser.params.login.user;
    let expectedUrl = support.joinURIPath(url, user, spaceName);
    expect(browser.getCurrentUrl()).toEqual(expectedUrl);

    support.info('EE test - new space URL:', currentUrl);
  });

});
