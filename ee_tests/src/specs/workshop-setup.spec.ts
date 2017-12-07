import { browser }  from 'protractor';
import * as support from '../helpers/src/support';
import { MainDashboardPage } from '../helpers/src/page_objects';

describe('openshift.io End-to-End POC test - Scenario - Login user: ', function () {

  beforeEach( async () => {
    await support.desktopTestSetup();
  });

  it("should perform Burr's demo - setup", async () => {

    let login = new support.LoginInteraction();
    let dashboardPage: MainDashboardPage;
    dashboardPage = await login.run();
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
    let alertBox = cleanupEnvPage.alertBox

    await expect(alertBox.getText()).toContain('environment has been erased!');
  });

});
