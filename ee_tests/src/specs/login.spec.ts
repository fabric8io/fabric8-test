import { browser, ExpectedConditions as EC, $, $$ } from 'protractor';
import * as support from './support';

import { HomePage } from './page_objects/home.page';
import { LoginPage } from './page_objects/login.page';

// declare let expect:any

describe('HomePage', () => {
  let homePage: HomePage;

  beforeEach( async () => {
    support.desktopTestSetup();
    homePage = new HomePage(browser.params.target.url);
    await homePage.open();
  });

  it('shows the title', async () => {
    await expect(await browser.getTitle()).toEqual('OpenShift.io');
  });

  it('show login button', async () => {
    await expect($$('div').first()).toAppear('Atleast one div should appear on the page');
    await expect( homePage.login).toAppear('Login must be present');
  });

  it('can login using correct username and password', async () => {
    await homePage.login.click();

    let loginPage = new LoginPage();
    await loginPage.login(browser.params.login.user, browser.params.login.password);
  });
});
