import { browser } from 'protractor';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';

import { MainDashboardPage } from '../page_objects/main_dashboard.page';

import { SpaceDashboardInteractionsFactory } from '../interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from '../interactions/account_home_interactions';
import { PageOpenMode } from '../page_objects/base.page';

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
    support.writeScreenshot('target/screenshots/booster_import_to_space_complete.png');
    await dashboardPage.logout();
  });

  it('Reset Environment, (Create a space, Create a QuickStart, Reset environment,) '
    + 'Create a new space, Import a github repo from the previous space or as configured', async () => {
    // Reset Environment
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.resetEnvironment();

    let configuredRepoName = browser.params.github.repo;
    if (configuredRepoName === '') {
      // Create a space
      let sourceSpaceName = support.newSpaceName();
      support.info('--- Create space ' + sourceSpaceName + ' ---');
      await accountHomeInteractions.createSpace(sourceSpaceName);

      // Create a QuickStart
      let quickstart = new Quickstart(browser.params.quickstart.name);
      support.info('--- Create quickstart ' + quickstart.name + ' ---');
      let dashboardInteractions =
        SpaceDashboardInteractionsFactory.create(browser.params.release.strategy, sourceSpaceName);
      await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
      await dashboardInteractions.createQuickstart(quickstart.name, strategy);

      support.updateCurrentRepoName(sourceSpaceName);

      // Reset Environment
      await accountHomeInteractions.resetEnvironment();
    }

    // The imported repo name is the previous space name or a as configured.
    let repoName = support.currentRepoName();

    // Create a space
    let spaceName = support.newSpaceName();
    support.info('--- Create space ' + spaceName + ' ---');
    await accountHomeInteractions.createSpace(spaceName);

    // Import a githug repo
    support.info('--- Import a github repo: ' + repoName + ' ---');
    let spaceDashboardInteractions =
      SpaceDashboardInteractionsFactory.create(browser.params.release.strategy, spaceName);
    await spaceDashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await spaceDashboardInteractions.importRepo(spaceName, repoName, strategy);

  });

});
