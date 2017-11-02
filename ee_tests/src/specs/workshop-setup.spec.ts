import { browser }  from 'protractor';
import * as support from './support';
import { LandingPage, MainDashboardPage } from './page_objects';

describe('openshift.io End-to-End POC test - Scenario - Login user: ', function () {
  let dashboardPage: MainDashboardPage;

  beforeEach( async () => {
    support.desktopTestSetup();
  });

  it("should perform Burr's demo - setup", async () => {
    support.debug('>>> LandingPage.Open');
    let homePage = new LandingPage();
    await homePage.open();
    support.debug('>>> LandingPage.Open - DONE');

    support.debug('>>> Go to loginPage');
    let loginPage = await homePage.gotoLoginPage();
    support.debug('>>> On Login Page');

    let user = browser.params.login.user;
    let password = browser.params.login.password;

    support.debug('>>> Login & wait for dashboard');
    dashboardPage = await loginPage.login(user, password);
    support.debug('>>> Login & wait for dashboard - OK');

    // Clean the user account in OSO with the new clean tenant button
    support.debug(">>> Go to user's Profile Page");
    let userProfilePage = await dashboardPage.gotoUserProfile();
    support.debug(">>> Go to user's Profile Page - OK");

    support.debug('>>> Go to Edit Profile Page');
    let editProfilePage = await userProfilePage.gotoEditProfile();
    support.debug('>>> Go to Edit Profile Page - OK');
    support.debug('>>> Go to Reset Env Page');
    let cleanupEnvPage = await editProfilePage.gotoResetEnvironment();
    support.debug('>>> Go to Reset Env Page - OK');

    await cleanupEnvPage.cleanup(browser.params.login.user);

  });

});
