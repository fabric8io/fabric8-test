import { browser } from 'protractor';
import * as support from './support';
import { LoginInteractionsFactory } from './interactions/login_interactions';

describe('Creating new spaces in OSIO', () => {

  beforeEach( async () => {
    await support.desktopTestSetup();
    let loginInteractions = LoginInteractionsFactory.create();
    await loginInteractions.login();
  });

  it('Create a new space without creating a new quickstart', async () => {
    let spaceName = support.newSpaceName();
    let currentUrl = await browser.getCurrentUrl();
    support.debug ('>>> browser is URL: ' + currentUrl);

    let url = browser.baseUrl;
    let user = browser.params.login.user;
    let expectedUrl = support.joinURIPath(url, user, spaceName);
    expect(browser.getCurrentUrl()).toEqual(expectedUrl);

    support.info('EE test - new space URL:', currentUrl);
  });

});
