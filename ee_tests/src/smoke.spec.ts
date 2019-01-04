import { browser } from 'protractor';

import * as logger from './support/logging';
import * as timeouts from './support/timeouts';
import { screenshotManager } from './support/screenshot_manager';
import { newSpaceName } from './support/space_name';
import { specContext } from './support/spec_context';
import { FeatureLevelUtils } from './support/feature_level';
import { Quickstart } from './support/quickstart';
import { LoginInteractionsFactory } from './interactions/login_interactions';
import { PipelinesInteractionsFactory } from './interactions/pipelines_interactions';
import { SpaceDashboardInteractionsFactory } from './interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';
import { PageOpenMode } from './page_objects/base.page';
import { CodebasesInteractionsFactory } from './interactions/codebases_interactions';
import { BuildStatus } from './support/build_status';
import * as runner from './support/script_runner';
import { PlannerInteractionsFactory } from './interactions/planner_interactions';
import { CheInteractionsFactory } from './interactions/che_interactions';
import { windowManager } from './support/window_manager';

describe('e2e_smoketest', () => {

  let quickstart: Quickstart;
  let strategy: string;
  let spaceName: string;

  beforeAll(async () => {
    logger.info('Before all');
    browser.ignoreSynchronization = true;
    await browser.driver.manage().window().setSize(1920, 1080);
    specContext.print();
    spaceName = newSpaceName();
    strategy = specContext.getReleaseStrategy();
    quickstart = specContext.getQuickstart();

    await runOCScript('jenkins', 'oc-jenkins-logs-before-all');
  });

  beforeEach(async() => {
    screenshotManager.nextTest();
  });

  afterEach(async () => {
    await screenshotManager.save('afterEach');
  });

  afterAll(async () => {
    logger.info('After all');
    if (specContext.isEnvironmentResetEnabled()) {
      try {
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
        await accountHomeInteractions.resetEnvironment();
      } catch (e) {
        await screenshotManager.save('resetEnvironment');
        throw e;
      }
    }
  });

  it('login', async () => {
    logger.specTitle('Login');
    let loginInteractions = LoginInteractionsFactory.create();
    await loginInteractions.login();
  });

  it('feature_level', async () => {
    logger.specTitle('Check if feature level is set correctly');
    let featureLevel = await FeatureLevelUtils.getRealFeatureLevel();
    expect(featureLevel).toBe(FeatureLevelUtils.getConfiguredFeatureLevel(), 'feature level');
  });

  it('create_space_new_codebase', async () => {
    logger.specTitle('Create space with new codebase ' + spaceName);
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpaceWithNewCodebase(spaceName, quickstart, strategy);
  });

  it('run_che', async () => {
    logger.specTitle('Run che workspace ' + quickstart.name);
    let error: any;
    try {
      let codebasesInteractions = CodebasesInteractionsFactory.create(strategy, spaceName);
      await codebasesInteractions.openCodebasesPage(PageOpenMode.UseMenu);
      let workspace = await codebasesInteractions.createAndOpenWorkspace();

      let cheInteractions = CheInteractionsFactory.create(workspace);
      await cheInteractions.openChePage(PageOpenMode.AlreadyOpened);
      await cheInteractions.verifyProjects(spaceName);

      await cheInteractions.closeChePage();

      let workspaces = await codebasesInteractions.getWorkspaces();
      expect(workspaces.length).toBe(1, 'Number of Che workspaces on Codebases page');
      logger.debug('Selected workspace: ' + await codebasesInteractions.getSelectedWorkspace());
    } catch (e) {
      error = e;
      await screenshotManager.save('che-failed');
      await windowManager.closeAllWindows();
    } finally {
      let accountHomeInteractions = AccountHomeInteractionsFactory.create();
      await accountHomeInteractions.openAccountHomePage(PageOpenMode.UseMenu);
      await runOCScript('che', 'oc-che-logs', await accountHomeInteractions.getToken());
    }

    if (error !== undefined) {
      throw error;
    }
  });

  it('pipeline', async () => {
    logger.specTitle('Run pipeline');
    let pipelineInteractions = PipelinesInteractionsFactory.create(strategy, spaceName);
    await pipelineInteractions.openPipelinesPage(PageOpenMode.UseMenu);
    let pipelines = await pipelineInteractions.verifyPipelines(1);
    let pipeline = pipelines[0];
    await pipelineInteractions.verifyPipelineInfo(pipeline, spaceName, spaceName, 1);
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildResult(pipeline, BuildStatus.COMPLETE);
    await pipelineInteractions.verifyBuildStages(pipeline);
    await pipelineInteractions.verifyDeployedApplication(pipeline, quickstart.deployedPageTestCallback);
  });

  it('dashboard', async () => {
    logger.specTitle('Verify dashboard');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(strategy, spaceName);
    await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyCodebases(spaceName);
    await dashboardInteractions.verifyAnalytics();

    let pipelines = await dashboardInteractions.verifyPipelines(1);
    await dashboardInteractions.verifyPipeline(pipelines[0], spaceName, 1, BuildStatus.COMPLETE);
  });

  it('my_workitems', async () => {
    logger.specTitle('Verify my work items');
    let plannerInteractions = PlannerInteractionsFactory.create(strategy, spaceName);
    await plannerInteractions.openPlannerPage();
    await plannerInteractions.createAndAssignWorkItem({title: 'my-work-item'}, 'me');

    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(strategy, spaceName);
    await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyWorkItems('my-work-item');
  });
});

async function runOCScript(project: string, outputFile: string, token = '') {
  try {
    logger.info(`Save OC ${project} pod log`);
    await runner.runScript(
      '.', // working directory
      './oc-get-project-logs.sh', // script
      [specContext.getUser(), specContext.getPassword(), project, token], // params
      `./target/screenshots/${outputFile}.txt`,  // output file
      false,
      timeouts.LONGER_WAIT
    );
  } catch (e) {
    logger.info('Save OC Jenkins pod log failed with error: ' + e);
  }
}
