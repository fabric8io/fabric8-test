import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { TextInput, Button } from '../ui';

import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { StageRunPage } from '../page_objects/space_stage_run.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { SpaceChePage } from '../page_objects/space_che.page';
import { CheWorkspace } from '../support';
import { FeatureLevel } from '../support/feature_level';

import { DeploymentsInteractions, DeploymentsInteractionsFactory } from '../interactions/deployments_interactions';
import { PipelinesInteractions } from '../interactions/pipelines_interactions';
import { SpaceDashboardInteractions } from '../interactions/space_dashboard_interactions';
import { SpaceDashboardInteractionsFactory } from '../interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from '../interactions/account_home_interactions';
import { PageOpenMode } from '../..';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;
let strategy: string = browser.params.release.strategy;

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
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
      let dashboardInteractions = SpaceDashboardInteractionsFactory.create(sourceSpaceName);
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
    let spaceDashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await spaceDashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await spaceDashboardInteractions.importRepo(spaceName, repoName, strategy);

  });

});
