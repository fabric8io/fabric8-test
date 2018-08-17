import { browser } from 'protractor';
import * as support from '../support';
import { LoginInteraction } from '../interactions/login_interactions';
import { PipelinesInteractionsFactory } from '../interactions/pipelines_interactions';
import { SpaceDashboardInteractionsFactory } from '../interactions/space_dashboard_interactions';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { PageOpenMode } from '../page_objects/base.page';
import { BuildStatus } from '../support/build_status';

describe('Analytic E2E test suite', () => {

  let strategy: string;
  let spaceName: string;
  let dashboardPage: MainDashboardPage;

  beforeAll(async () => {
    support.info('--- Before all ---');
    spaceName = support.currentSpaceName();
    strategy = browser.params.release.strategy;
  });

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_analytics_tests_end.png');
    await dashboardPage.logout();
  });

  it('Run pipeline', async () => {
    support.info('--- Run pipeline ---');
    let pipelineInteractions = PipelinesInteractionsFactory.create(strategy, spaceName);
    await pipelineInteractions.openPipelinesPage(PageOpenMode.UseMenu);
    let pipelines = await pipelineInteractions.verifyPipelines(1);
    let pipeline = pipelines[0];
    await pipelineInteractions.verifyPipelineInfo(pipeline, spaceName, spaceName, 1);
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('Verify dashboard', async () => {
    support.info('--- Verify dashboard ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(browser.params.release.strategy, spaceName);
    await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyCodebases(spaceName);
    await dashboardInteractions.verifyAnalytics();
    let pipelines = await dashboardInteractions.verifyPipelines(1);
    await dashboardInteractions.verifyPipeline(pipelines[0], spaceName, 1, BuildStatus.COMPLETE);

    let deployedApplications = await dashboardInteractions.verifyDeployedApplications(1);
    let deployedApplication = deployedApplications[0];
    await dashboardInteractions.verifyDeployedApplication(deployedApplication, spaceName);
    await dashboardInteractions.verifyWorkItems();
  });
});
