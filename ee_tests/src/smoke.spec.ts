import { browser } from 'protractor';

import * as support from './support';
import { FeatureLevelUtils } from './support/feature_level';
import { Quickstart } from './support/quickstart';
import { DeploymentsInteractions, DeploymentsInteractionsFactory } from './interactions/deployments_interactions';
import { LoginInteraction } from './interactions/login_interactions';
import { PipelinesInteractionsFactory } from './interactions/pipelines_interactions';
import { SpaceDashboardInteractionsFactory } from './interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';
import { SpaceCheWorkspacePage } from './page_objects/space_cheworkspace.page';
import { Button } from './ui/button';
import { PageOpenMode } from './page_objects/base.page';
import { CodebasesInteractionsFactory } from './interactions/codebases_interactions';
import { BuildStatus } from './support/build_status';
import { DeploymentStatus } from './page_objects/space_deployments_tab.page';

describe('e2e_smoketest', () => {

  let quickstart: Quickstart;
  let strategy: string;
  let spaceName: string;

  beforeAll(async () => {
    support.info('Before all');
    await support.desktopTestSetup();
    spaceName = support.newSpaceName();
    strategy = browser.params.release.strategy;
    quickstart = new Quickstart(browser.params.quickstart.name);
  });

  beforeEach(async() => {
    support.screenshotManager.nextTest();
  });

  afterEach(async () => {
    await support.screenshotManager.writeScreenshot('afterEach');
  });

  afterAll(async () => {
    support.info('After all');
    if (browser.params.reset.environment === 'true') {
      try {
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
        await accountHomeInteractions.resetEnvironment();
      } catch (e) {
        await support.screenshotManager.writeScreenshot('resetEnvironment');
        throw e;
      }
    }
  });

  it('login', async () => {
    support.specTitle('Login');
    let login = new LoginInteraction();
    await login.run();
  });

  it('feature_level', async () => {
    support.specTitle('Check if feature level is set correctly');
    let featureLevel = await FeatureLevelUtils.getRealFeatureLevel();
    expect(featureLevel).toBe(FeatureLevelUtils.getConfiguredFeatureLevel(), 'feature level');
  });

  it('create_space_new_codebase', async () => {
    support.specTitle('Create space with new codebase ' + spaceName);
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpaceWithNewCodebase(spaceName, quickstart.name, strategy);
  });

  it('run_che', async () => {
    support.specTitle('Run che workspace ' + quickstart.name);
    let codebasesInteractions = CodebasesInteractionsFactory.create(strategy, spaceName);
    await codebasesInteractions.openCodebasesPage(PageOpenMode.UseMenu);
    await codebasesInteractions.createAndOpenWorkspace();

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGER_WAIT);
    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    /* Switch back to the OSIO browser window */
    await support.windowManager.closeCurrentWindow();
    let workspaces = await codebasesInteractions.getWorkspaces();
    expect(workspaces.length).toBe(1);
  });

  it('pipeline', async () => {
    support.specTitle('Run pipeline');
    let pipelineInteractions = PipelinesInteractionsFactory.create(strategy, spaceName);
    await pipelineInteractions.openPipelinesPage(PageOpenMode.UseMenu);
    let pipelines = await pipelineInteractions.verifyPipelines(1);
    let pipeline = pipelines[0];
    await pipelineInteractions.verifyPipelineInfo(pipeline, spaceName, spaceName, 1);
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildResult(pipeline, BuildStatus.COMPLETE);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('deployments', async () => {
    support.specTitle('Verify deployments');
    let deploymentsInteractions: DeploymentsInteractions = DeploymentsInteractionsFactory.create(strategy, spaceName);
    await deploymentsInteractions.openDeploymentsPage(PageOpenMode.UseMenu);
    let applications = await deploymentsInteractions.verifyApplications(1);
    let application = applications[0];
    await deploymentsInteractions.verifyApplication(application, spaceName);

    let environments = await deploymentsInteractions.verifyEnvironments(application);
    await deploymentsInteractions.verifyStageEnvironment(environments, DeploymentStatus.OK, '1.0.1', 1);
    await deploymentsInteractions.verifyRunEnvironment(environments, DeploymentStatus.OK, '1.0.1', 1);
    await deploymentsInteractions.verifyResourceUsage();
  });

  it('dashboard', async () => {
    support.specTitle('Verify dashboard');
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
});
