import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { Quickstart } from './support/quickstart';
import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { StageRunPage } from './page_objects/space_stage_run.page';
// tslint:disable-next-line:max-line-length
import { SpaceDeploymentsPage, DeploymentStatus, DeployedApplication, DeployedApplicationEnvironment, Environment} from './page_objects/space_deployments.page';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    await browser.sleep(support.DEFAULT_WAIT);
    // await support.dumpLog2(globalSpacePipelinePage, globalSpaceName);
    support.writeScreenshot('target/screenshots/pipeline_final_' + globalSpaceName + '.png');
    support.writePageSource('target/screenshots/pipeline_final_' + globalSpaceName + '.html');
    // support.info('\n ============ End of test reached, logging out ============ \n');
    // await dashboardPage.logout();
  });

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    //    let strategy: string  = 'releaseStageApproveAndPromote';
    let strategy: string = browser.params.release.strategy;   // 'release';

    support.info('Creating quickstart: ' + quickstart.name);
    await wizard.newQuickstartProject({ project: quickstart.name, strategy });
    await spaceDashboardPage.ready();

    
    /* This statement does not reliably wait for the modal dialog to disappear:
       await browser.wait(until.not(until.visibilityOf(spaceDashboardPage.modalFade)), support.LONGEST_WAIT);

       The above statement fails with this error: Failed: unknown error: Element <a id="spacehome-pipelines-title"
       href="/username/spaceName/create/pipelines">...</a> is not clickable at point (725, 667). Other element would
       receive the click: <modal-container class="modal fade" role="dialog" tabindex="-1" style="display:
       block;">...</modal-container>

       The only reliable way to avoid this is a sleep statement: await browser.sleep(5000);
       TODO remove the sleep statement */
    await browser.sleep(5000);

    // tslint:disable:max-line-length

    /* Open the pipeline page, select the pipeline by name */
    await spaceDashboardPage.pipelinesSectionTitle.clickWhenReady(support.LONGER_WAIT);
    support.debug('Accessed pipeline page');

    let spacePipelinePage = new SpacePipelinePage();
    globalSpacePipelinePage = spacePipelinePage;

    let pipelineByName = new Button(spacePipelinePage.pipelineByName(spaceName), 'Pipeline By Name');

    support.debug('Looking for the pipeline name');
    await pipelineByName.untilPresent(support.LONGER_WAIT);

    /* Verify that only (1) new matching pipeline is found */
    support.debug('Verifying that only 1 pipeline is found with a matching name');
    expect(await spacePipelinePage.allPipelineByName(spaceName).count()).toBe(1);

    /* Save the pipeline page output to stdout for logging purposes */
    let pipelineText = await spacePipelinePage.pipelinesPage.getText();
    support.debug('Pipelines page contents = ' + pipelineText);

    /* Find the pipeline name */
    await pipelineByName.untilClickable(support.LONGER_WAIT);

    /* If the build log link is not viewable - the build failed to start */
    support.debug('Verifying that the build has started - check https://github.com/openshiftio/openshift.io/issues/1194');
    await spacePipelinePage.viewLog.untilClickable(support.LONGEST_WAIT);
    expect(spacePipelinePage.viewLog.isDisplayed()).toBe(true);

    /* Execute the pipeline build - in the context of the selected release strategy */
    switch (strategy) {
      case 'releaseAndStage': {
        await spacePipelinePage.stageIcon.untilClickable(support.LONGEST_WAIT);
        break;
      }
      case 'release': {
        await spacePipelinePage.successBar.untilDisplayed(support.LONGEST_WAIT);
        break;
      }
      default: {    /* Including releaseStageApproveAndPromote */
        /* Promote to both stage and run - build has completed - if inputRequired is not present, build has failed */
        support.debug('Verifying that the promote dialog is opened');
        let inputRequired = new Button(spacePipelinePage.inputRequiredByPipelineByName(spaceName), 'InputRequired button');

        await inputRequired.clickWhenReady(support.LONGEST_WAIT);
        await spacePipelinePage.promoteButton.clickWhenReady(support.LONGER_WAIT);
        support.writeScreenshot('target/screenshots/pipeline_promote_' + spaceName + '.png');

        /* Verify stage and run icons are present - these will timeout and cause failures if missing */
        await spacePipelinePage.stageIcon.untilClickable(support.LONGEST_WAIT);
        await spacePipelinePage.runIcon.untilClickable(support.LONGEST_WAIT);
        break;
      }
    }
    support.writeScreenshot('target/screenshots/pipeline_icons_' + spaceName + '.png');

    // TODO - Error conditions to trap
    // 1) Jenkins build log - find errors if the test fails
    // 2) Jenkins pod log - find errors if the test fails
    // 3) Presence of build errors in UI
    // 4) Follow the stage and run links */

    await browser.sleep(5000);
    await spacePipelinePage.spaceHeader.deploymentsOption.clickWhenReady();

    support.info('Verifying deployments page');

    await browser.sleep(5000);

    let spaceDeploymentsPage = new SpaceDeploymentsPage();

    let applications = await spaceDeploymentsPage.getDeployedApplications();
    expect(applications.length).toBe(1, 'number of deployed applications');

    let application = applications[0];
    expect(application.getName()).toBe(spaceName, 'application name');

    let environments = await application.getEnvironments();
    expect(environments.length).toBe(2, 'number of environments');

    if (testStage(strategy)) {
      support.info('Verifying application\'s stage environment');
      let environment = environments[Environment.STAGE];

      expect(environment.isReady()).toBeTruthy('stage environment pod is ready');
      expect(environment.getStatus()).toBe(DeploymentStatus.OK, 'stage environment status');
      expect(environment.getVersion()).toBe('1.0.1', 'stage environment version');
      expect(environment.getPodsCount()).toBe(1, 'number of pods on stage environment');
      // TODO this does not work correctly at the moment
      // expect(await environment.getRunningPodsCount()).toBe(1, 'number of running pods on stage environment');
    }

    if (testRun(strategy)) {
      support.info('Verifying application\'s run environment');
      let environment = environments[Environment.RUN];

      expect(environment.isReady()).toBeTruthy('run environment pod is ready');
      expect(environment.getStatus()).toBe(DeploymentStatus.OK, 'run environment status');
      expect(environment.getVersion()).toBe('1.0.1', 'run environment version');
      expect(environment.getPodsCount()).toBe(1, 'number of pods on run environment');
      // TODO this does not work correctly at the moment
      // expect(await environment.getRunningPodsCount()).toBe(1, 'number of running pods on run environment');
    }

    support.info('Verifying resources usage');

    let data = await spaceDeploymentsPage.getResourceUsageData();
    expect(data.length).toBe(2, 'there should be stage and prod environment');

    if (testStage(strategy)) {
      support.info('Verifying stage environment resource usage');

      let stageData = data[Environment.STAGE];
      let stageDataItems = await stageData.getItems();
      expect(stageDataItems.length).toBe(2, 'there should be 2 resource usage data items');

      let cpu = stageDataItems[0];
      expect(cpu.getActualValue()).toBeGreaterThan(0, 'the actual cpu usage data has to be greater than 0');
      expect(cpu.getActualValue()).toBeLessThanOrEqual(cpu.getMaximumValue(), 'the actual cpu usage data has to be lower or equal to maximum');

      let memory = stageDataItems[1];
      expect(memory.getActualValue()).toBeGreaterThan(0, 'the actual memory usage data has to be greater than 0');
      expect(memory.getActualValue()).toBeLessThanOrEqual(memory.getMaximumValue(), 'the actual memory usage data has to be lower or equal to maximum');
    }

    if (testRun(strategy)) {
      support.info('Verifying run environment resource usage');

      let stageData = data[Environment.RUN];
      let stageDataItems = await stageData.getItems();
      expect(stageDataItems.length).toBe(2, 'there should be 2 resource usage data items');

      let cpu = stageDataItems[0];
      expect(cpu.getActualValue()).toBeGreaterThan(0, 'the actual cpu usage data has to be greater than 0');
      expect(cpu.getActualValue()).toBeLessThanOrEqual(cpu.getMaximumValue(), 'the actual cpu usage data has to be lower or equal to maximum');

      let memory = stageDataItems[1];
      expect(memory.getActualValue()).toBeGreaterThan(0, 'the actual memory usage data has to be greater than 0');
      expect(memory.getActualValue()).toBeLessThanOrEqual(memory.getMaximumValue(), 'the actual memory usage data has to be lower or equal to maximum');
    }

    support.writeScreenshot('target/screenshots/pipeline_deployments_' + spaceName + '.png');
    support.writePageSource('target/screenshots/pipeline_deployments_' + spaceName + '.html');
  });

  function testStage(strategy: string): boolean {
    return testRun(strategy) || (strategy === 'releaseAndStage');
  }

  function testRun(strategy: string): boolean {
    return strategy === 'releaseStageApproveAndPromote';
  }
});
