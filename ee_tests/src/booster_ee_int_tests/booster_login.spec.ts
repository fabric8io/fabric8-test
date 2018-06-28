import { browser } from 'protractor';
import * as support from '../support';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { LoginInteraction } from '../interactions/login_interactions';

/* Tests to verify user login/logout */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();

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

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/login_test_success_booster.png');
    await dashboardPage.logout();
  });

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {
    // TODO implement test or delete whole file
  });

});
