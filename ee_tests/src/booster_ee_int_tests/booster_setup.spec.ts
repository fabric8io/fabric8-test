import { browser } from 'protractor';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';

import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { SpaceChePage } from '../page_objects/space_che.page';

import { SpaceDashboardInteractionsFactory } from '../interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from '../interactions/account_home_interactions';
import { PageOpenMode } from '../page_objects/base.page';
import { Button } from '../ui/button';

let strategy: string = browser.params.release.strategy;

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_setup_success.png');
    await dashboardPage.logout();
  });

  it('Reset Environment, create a new space, new ' + browser.params.quickstart.name + ' quickstart', async () => {
    // Reset Environment
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.resetEnvironment();

    // Create a space
    let spaceName = support.newSpaceName();
    support.info('--- Create space ' + spaceName + ' ---');
    await accountHomeInteractions.createSpace(spaceName);

    // Create a QuickStart
    let quickstart = new Quickstart(browser.params.quickstart.name);
    support.info('--- Create quickstart ' + quickstart.name + ' ---');
    let dashboardInteractions =
      SpaceDashboardInteractionsFactory.create(browser.params.release.strategy, spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await dashboardInteractions.createQuickstart(quickstart.name, strategy);

    // Create a Che workspace
    support.info('--- Run che workspace ' + quickstart.name + ' ---');
    dashboardInteractions =
      SpaceDashboardInteractionsFactory.create(browser.params.release.strategy, spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await dashboardInteractions.openCodebasesPage();

    let spaceChePage = new SpaceChePage();
    await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

    await support.windowManager.switchToWindow(2, 1);

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    await support.debug (spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText());
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    let cheWorkspaceUrl = await browser.getCurrentUrl();
    await support.debug('Updating current Che workspace URL: ' + cheWorkspaceUrl);
    support.updateCheWorkspaceUrl(cheWorkspaceUrl);

    // Close Che Tab window
    await browser.close();

    /* Switch back to the OSIO browser window */
    await support.windowManager.switchToWindow(1, 0);

  });

});
