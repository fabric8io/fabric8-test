import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import {WebDriver, error as SE} from 'selenium-webdriver';

import * as support from './support';
import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { StageRunPage } from './page_objects/space_stage_run.page';
import { SpaceDeploymentsPage } from './page_objects/space_deployments.page';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach( async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach( async () => {
    await browser.sleep(support.DEFAULT_WAIT);
//    await support.dumpLog2(globalSpacePipelinePage, globalSpaceName);
    support.writeScreenshot('target/screenshots/pipeline_final_' + globalSpaceName + '.png');
    support.info('\n ============ End of test reached, logging out ============ \n');
    // await dashboardPage.logout();
  });

 /* The majority of these tests are commented out not due to any bugs,
     but to ensure that the test does not collide with other tests. TODO - to
     resolve these collisions */

  // tslint:disable:max-line-length

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {

//    if (browser.params.quickstart.name === 'Vert.x HTTP Booster') {
//      await runTest(dashboardPage, 'Vert.x HTTP Booster', 'Components: Total: 2 | Analyzed: 2 | Unknown: 0').catch(error => console.log(error));
//    }

    switch (browser.params.quickstart.name) {
      case 'vertxHttp': {
        await runTest(dashboardPage, 'Vert.x HTTP Booster').catch(error => console.log(error));
        break;
      }
      case 'vertxHealth': {
        await runTest(dashboardPage, 'Vert.x Health Check Example').catch(error => console.log(error));
        break;
      }
      case 'SpringBootHttp': {
        await runTest(dashboardPage, 'Spring Boot - HTTP').catch(error => console.log(error));
        break;
      }
      case 'SpringBootHealth': {
        await runTest(dashboardPage, 'Spring Boot Health Check Example').catch(error => console.log(error));
        break;
      }
      default: {
        await runTest(dashboardPage, 'Vert.x HTTP Booster').catch(error => console.log(error));
        break;
      }
    }

  });

// tslint:enable:max-line-length

/* Create the quickstart, verify deployment to stage and run */
  async function runTest (theLandingPage: MainDashboardPage, quickstartName: string) {

    await support.info ('quickstart name = ' + browser.params.quickstart.name);

    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

//    let strategy: string  = 'releaseStageApproveAndPromote';
    let strategy: string  = browser.params.release.strategy;   //'release';

    support.info('Creating quickstart: ' + quickstartName);
    await wizard.newQuickstartProject({ project: quickstartName, strategy });
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
    expect (spacePipelinePage.viewLog.isDisplayed()).toBe(true);

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





    const STAGE = 1;
    const RUN = 2;

    await browser.sleep(5000);
    await spacePipelinePage.spaceHeader.deploymentsOption.clickWhenReady();

    await browser.sleep(5000);
    let spaceDeploymentsPage = new SpaceDeploymentsPage();

    /* Verify that app deployed to stage presents: Success icon, blue circle graphic, text = "Output from run = 1 pods" */

    let textStr = await spaceDeploymentsPage.resourceCardByNameAndIndex(spaceName, STAGE).getText();
    support.info('1 Output from run = ' + textStr);
    expect(await spaceDeploymentsPage.allResourceCards.count()).toBe(4);
    expect(await spaceDeploymentsPage.successfulDeployStatusByNameAndIndex(spaceName, STAGE).isPresent()).toBeTruthy();

    spaceDeploymentsPage.podRunningTextByNameAndIndex(spaceName, STAGE).getText();
    support.info('2 Output from run = ' + textStr);

    textStr = await spaceDeploymentsPage.successfulDeployStatusByNameAndIndex(spaceName, STAGE).getText();
    support.info('3 Output from run = ' + textStr);

    textStr = await spaceDeploymentsPage.resourceUsageCardByIndex(1).getText();
    support.info('4 Output from run = ' + textStr);


    support.writeScreenshot('target/screenshots/pipeline_deployments_' + spaceName + '.png');
    await browser.sleep(60000);

/*
Open the stage link
If the page is not fully displayed - pause, then break and try again -
If the page is fully displayed, verify the page contents, run the app, verify the results
*/

  }

});
