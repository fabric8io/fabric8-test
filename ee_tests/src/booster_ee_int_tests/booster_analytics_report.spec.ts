import { browser, element, by, ExpectedConditions as until, $, $$, ProtractorBrowser } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from '../support';
import { BuildStatus } from '../support/build_status';
import { FeatureLevel, FeatureLevelUtils } from '../support/feature_level';
import { Quickstart } from '../support/quickstart';
import { DeploymentsInteractions, DeploymentsInteractionsFactory } from '../interactions/deployments_interactions';
import { PipelinesInteractions } from '../interactions/pipelines_interactions';
import { SpaceDashboardInteractions } from '../interactions/space_dashboard_interactions';
import { SpaceDashboardInteractionsFactory } from '../interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from '../interactions/account_home_interactions';
import { SpaceChePage } from '../page_objects/space_che.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { Button } from '../ui';
import { PageOpenMode } from '../..';
import { DEFAULT_WAIT, LONG_WAIT } from '../support';
import { ReleaseStrategy } from '../support/release_strategy';

describe('Analytic E2E test suite', () => {

  let quickstart: Quickstart;
  let strategy: ReleaseStrategy;
  let spaceName: string;
  let index: number = 1;
  let dashboardPage: MainDashboardPage;

  beforeAll(async () => {
    support.info('--- Before all ---');
    quickstart = new Quickstart(browser.params.quickstart.name);
    spaceName = support.currentSpaceName();
    strategy = browser.params.release.strategy;
  });

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_analytics_tests_end.png');
    await dashboardPage.logout();
  });

  it('Run pipeline', async () => {
    support.info('--- Run pipeline ---');
    let pipelineInteractions = PipelinesInteractions.create(strategy, spaceName);
    await pipelineInteractions.showPipelinesScreen();
    let pipeline = await pipelineInteractions.verifyBuildInfo();
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('Verify dashboard', async () => {
    support.info('--- Verify dashboard ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyCodebases();
    await dashboardInteractions.verifyAnalytics();
    await dashboardInteractions.verifyApplications();
    await dashboardInteractions.verifyWorkItems();
  });
});
