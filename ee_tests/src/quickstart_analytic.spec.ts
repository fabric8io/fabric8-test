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

describe('Analytic E2E test suite', () => {

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
      support.info('--- Reset environmet ---');
      let accountHomeInteractions = AccountHomeInteractionsFactory.create();
      await accountHomeInteractions.resetEnvironment();

      support.writeScreenshot('target/screenshots/' + spaceName + '_' + index + '.png');
      support.writePageSource('target/screenshots/' + spaceName + '_' + index + '.html');
    }
  });

  it('Login', async () => {
    support.info('--- Login ---');
    let login = new support.LoginInteraction();
    await login.run();
  });

  it('Check feature level', async () => {
    let featureLevel = await FeatureLevelUtils.getRealFeatureLevel();
    expect(featureLevel).toBe(FeatureLevelUtils.getConfiguredFeatureLevel(), 'feature level');

    // TODO: Remove reset of environment. This was added due to the following issue
    // underlying fabric8-test issue https://github.com/fabric8io/fabric8-test/issues/644
    if (browser.params.reset.environment === 'true' && featureLevel === FeatureLevel.RELEASED) {
      support.info('--- Reset environmet ---');
      let accountHomeInteractions = AccountHomeInteractionsFactory.create();
      await accountHomeInteractions.resetEnvironment();

      support.writeScreenshot('target/screenshots/' + spaceName + '_' + index + '.png');
      support.writePageSource('target/screenshots/' + spaceName + '_' + index + '.html');
      index++;
    }
  });

  it('Create space ', async () => {
    support.info('--- Create space ' + spaceName + ' ---');
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpace(spaceName);
  });

  it('Create quickstart', async () => {
    support.info('--- Create quickstart ' + quickstart.name + ' ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await dashboardInteractions.createQuickstart(quickstart.name, strategy);
  });

  it('Run pipeline', async () => {
    support.info('--- Run pipeline ---');
    let pipelineInteractions = PipelinesInteractions.create(strategy, spaceName);
    await pipelineInteractions.showPipelinesScreen();
    let pipeline = await pipelineInteractions.verifyBuildInfo();
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('Verify deployment', async () => {
    support.info('--- Verify deployments ---');
    let deploymentsInteractions: DeploymentsInteractions = DeploymentsInteractionsFactory.create(strategy, spaceName);
    await deploymentsInteractions.showDeploymentsScreen();
    await deploymentsInteractions.verifyApplication();
    await deploymentsInteractions.verifyResourceUsage();
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
