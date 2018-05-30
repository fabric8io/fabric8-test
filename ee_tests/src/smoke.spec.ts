import { browser, element, by, ExpectedConditions as until, $, $$, ProtractorBrowser } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { BuildStatus } from './support/build_status';
import { FeatureLevel, FeatureLevelUtils } from './support/feature_level';
import { Quickstart } from './support/quickstart';
import { DeploymentsInteractions, DeploymentsInteractionsFactory } from './interactions/deployments_interactions';
import { PipelinesInteractions } from './interactions/pipelines_interactions';
import { SpaceDashboardInteractions } from './interactions/space_dashboard_interactions';
import { SpaceDashboardInteractionsFactory } from './interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';
import { SpaceChePage } from './page_objects/space_che.page';
import { SpaceCheWorkspacePage } from './page_objects/space_cheworkspace.page';
import { Button } from './ui';
import { PageOpenMode } from '..';
import { DEFAULT_WAIT, LONG_WAIT } from './support';

describe('e2e_smoketest', () => {

  let quickstart: Quickstart;
  let strategy: string;
  let spaceName: string;
  let index: number = 1;

  beforeAll(async () => {
    support.info('--- Before all ---');
    await support.desktopTestSetup();
    spaceName = support.newSpaceName();
    strategy = browser.params.release.strategy;
    quickstart = new Quickstart(browser.params.quickstart.name);
  });

  afterEach(async () => {
    support.info('--- After each ---');
    support.writeScreenshot('target/screenshots/' + spaceName + '_' + index + '.png');
    support.writePageSource('target/screenshots/' + spaceName + '_' + index + '.html');
    index++;
  });

  afterAll(async () => {
    support.info('--- After all ---');
    if (browser.params.reset.environment === 'true') {
      try {
        support.info('--- Reset environmet ---');
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
      await accountHomeInteractions.resetEnvironment();
      } catch (e) {
        support.writeScreenshot('target/screenshots/' + spaceName + '_' + index + '_reset.png');
        support.writePageSource('target/screenshots/' + spaceName + '_' + index + '_reset.html');
        throw e;
      }
    }
  });

  it('login', async () => {
    support.info('--- Login ---');
    let login = new support.LoginInteraction();
    await login.run();
  });

  it('feature_level', async () => {
    let featureLevel = await FeatureLevelUtils.getRealFeatureLevel();
    expect(featureLevel).toBe(FeatureLevelUtils.getConfiguredFeatureLevel(), 'feature level');
  });

  it('create_space', async () => {
    support.info('--- Create space ' + spaceName + ' ---');
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpace(spaceName);
  });

  it('create_quickstart', async () => {
    support.info('--- Create quickstart ' + quickstart.name + ' ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await dashboardInteractions.createQuickstart(quickstart.name, strategy);
  });

  it('run_che', async () => {
    support.info('--- Run che workspace ' + quickstart.name + ' ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await dashboardInteractions.openCodebasesPage();

    let spaceChePage = new SpaceChePage();
    await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

    await support.switchToWindow(2, 1);

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    // await support.debug (spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText());
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    /* Switch back to the OSIO browser window */
    await support.switchToWindow(2, 0);
  });

  it('pipeline', async () => {
    support.info('--- Run pipeline ---');
    let pipelineInteractions = PipelinesInteractions.create(strategy, spaceName);
    await pipelineInteractions.showPipelinesScreen();
    let pipeline = await pipelineInteractions.verifyBuildInfo();
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildResult(pipeline);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('deployments', async () => {
    support.info('--- Verify deployments ---');
    let deploymentsInteractions: DeploymentsInteractions = DeploymentsInteractionsFactory.create(strategy, spaceName);
    await deploymentsInteractions.showDeploymentsScreen();
    await deploymentsInteractions.verifyApplication();
    await deploymentsInteractions.verifyResourceUsage();
  });

  it('dashboard', async () => {
    support.info('--- Verify dashboard ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyCodebases();
    await dashboardInteractions.verifyAnalytics();
    await dashboardInteractions.verifyApplications();
    await dashboardInteractions.verifyWorkItems();
  });
});
