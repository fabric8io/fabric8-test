import * as support from '../support';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { AccountHomeInteractionsFactory } from '../interactions/account_home_interactions';
import { PageOpenMode } from '../page_objects/base.page';

/* Tests to verify user login/logout */

describe('Clean up user environment:', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_cleanup_success.png');
    await dashboardPage.openInBrowser();
    await dashboardPage.logout();
  });

  it('Login, Reset environment, logout', async () => {
    // Reset Environment
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.resetEnvironment();
    await accountHomeInteractions.openAccountHome(PageOpenMode.UseMenu);
  });

});
