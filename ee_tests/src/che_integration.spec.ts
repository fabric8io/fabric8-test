import { browser, by, element, ExpectedConditions as until } from 'protractor';

import * as support from './support';
import { FeatureLevelUtils } from './support/feature_level';
import { Quickstart } from './support/quickstart';
import { LoginInteractionsFactory } from './interactions/login_interactions';
import { PipelinesInteractionsFactory } from './interactions/pipelines_interactions';
import { SpaceDashboardInteractionsFactory } from './interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';
import { PageOpenMode } from './page_objects/base.page';
import { CodebasesInteractionsFactory } from './interactions/codebases_interactions';
import { BuildStatus } from './support/build_status';
import { CheInteractionsFactory } from './interactions/che_interactions';

describe('e2e_che_integration', () => {

  let quickstart: Quickstart;
  let strategy: string;
  let spaceName: string;
  let workspace: string;

  beforeAll(async () => {
    support.info('--- Before all ---');
    await support.desktopTestSetup();
    spaceName = support.newSpaceName();
    strategy = browser.params.release.strategy;
    quickstart = new Quickstart(browser.params.quickstart.name);
  });

  beforeEach(async() => {
    support.screenshotManager.nextTest();
  });

  afterEach(async () => {
    support.info('--- After each ---');
    await support.screenshotManager.save('afterEach');
  });

  afterAll(async () => {
    support.info('--- After all ---');
    if (browser.params.reset.environment === 'true') {
      try {
        support.info('--- Reset environment ---');
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
        await accountHomeInteractions.resetEnvironment();
      } catch (e) {
        await support.screenshotManager.save('resetEnvironment');
        throw e;
      }
    }
  });

  it('login', async () => {
    support.info('--- Login ---');
    let loginInteractions = LoginInteractionsFactory.create();
    await loginInteractions.login();
  });

  it('feature_level', async () => {
    support.info('--- Check if feature level is set correctly ---');
    let featureLevel = await FeatureLevelUtils.getRealFeatureLevel();
    expect(featureLevel).toBe(FeatureLevelUtils.getConfiguredFeatureLevel(), 'feature level');
  });

  it('create_workspace', async () => {
    support.info('--- Create workspace from new codebase in space ' + spaceName + ' ---');
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpaceWithNewCodebase(spaceName, quickstart.name, strategy);

    let codebasesInteractions = CodebasesInteractionsFactory.create(strategy, spaceName);
    await codebasesInteractions.openCodebasesPage(PageOpenMode.UseMenu);
    await codebasesInteractions.createWorkspace();

    let workspaces = await codebasesInteractions.getWorkspaces();
    expect(workspaces.length).toBe(1);
    workspace = workspaces[0];
  });

  it('pipeline_before_change', async () => {
    support.info('--- Run pipeline ---');
    let pipelineInteractions = PipelinesInteractionsFactory.create(strategy, spaceName);
    await pipelineInteractions.openPipelinesPage(PageOpenMode.UseMenu);
    let pipelines = await pipelineInteractions.verifyPipelines(1);
    let pipeline = pipelines[0];
    await pipelineInteractions.verifyPipelineInfo(pipeline, spaceName, spaceName, 1);
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildResult(pipeline, BuildStatus.COMPLETE);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('dashboard_before_change', async () => {
    support.info('--- Verify dashboard ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(strategy, spaceName);
    await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyCodebases(spaceName);
    await dashboardInteractions.verifyAnalytics();

    let pipelines = await dashboardInteractions.verifyPipelines(1);
    await dashboardInteractions.verifyPipeline(pipelines[0], spaceName, 1, BuildStatus.COMPLETE);

    let deployedApplications = await dashboardInteractions.verifyDeployedApplications(1);
    let deployedApplication = deployedApplications[0];
    await dashboardInteractions.verifyDeployedApplication(deployedApplication, spaceName);
    await dashboardInteractions.verifyDeployedApplicationStage(
      deployedApplication, '1.0.1', quickstart.deployedPageTestCallback);
    await dashboardInteractions.verifyDeployedApplicationRun(
        deployedApplication, '1.0.1', quickstart.deployedPageTestCallback);
    await dashboardInteractions.verifyWorkItems();
  });

  it('change_codebase', async () => {
    support.info('--- Run external CHE tests to change codebase ---');

    let cheInteractions = CheInteractionsFactory.create();
    await cheInteractions.changeCodebase(workspace);
  });

  it('pipeline_after_change', async () => {
    support.info('--- Run pipeline ---');
    let pipelineInteractions = PipelinesInteractionsFactory.create(strategy, spaceName);
    await pipelineInteractions.openPipelinesPage(PageOpenMode.UseMenu);
    let pipelines = await pipelineInteractions.verifyPipelines(1);
    let pipeline = pipelines[0];
    await pipelineInteractions.verifyPipelineInfo(pipeline, spaceName, spaceName, 2);
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildResult(pipeline, BuildStatus.COMPLETE);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('dashboard-after-change', async () => {
    support.info('--- Verify dashboard ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(strategy, spaceName);
    await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyCodebases(spaceName);
    await dashboardInteractions.verifyAnalytics();

    let pipelines = await dashboardInteractions.verifyPipelines(1);
    await dashboardInteractions.verifyPipeline(pipelines[0], spaceName, 2, BuildStatus.COMPLETE);

    let deployedApplications = await dashboardInteractions.verifyDeployedApplications(1);
    let deployedApplication = deployedApplications[0];
    await dashboardInteractions.verifyDeployedApplication(deployedApplication, spaceName);
    await dashboardInteractions.verifyDeployedApplicationStage(
      deployedApplication, '1.0.2', httpBooster);
    await dashboardInteractions.verifyDeployedApplicationRun(
        deployedApplication, '1.0.2', httpBooster);
    await dashboardInteractions.verifyWorkItems();
  });

});

async function httpBooster() {
  browser.wait(until.presenceOf(
  element(by.id('_http_booster'))), support.DEFAULT_WAIT, '\_http_booster\' is present');
  let text = await element(by.id('_http_booster')).getText();
  expect(text).toContain('HTTP Booster', `page contains text`);
}
