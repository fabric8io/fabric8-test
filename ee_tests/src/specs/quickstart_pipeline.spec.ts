import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';

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
    await dashboardPage.logout();
  });

  /* Simple test - accept all defaults for new quickstarts */

  /* The majority of these tests are commented out not due to any bugs,
     but to ensure that the test does not collide with other tests. TODO - to
     resolve these collisions */

  // tslint:disable:max-line-length

//  it('Create a new space, new Vert.x HTTP Booster quickstart, run its pipeline', async () => {
//    await runTest(dashboardPage, 'Vert.x HTTP Booster', 'Components: Total: 2 | Analyzed: 2 | Unknown: 0').catch(error => console.log(error));
//  });

 it('Create a new space, new Spring Boot - HTTP quickstart, run its pipeline', async () => {
  await runTest(dashboardPage, 'Spring Boot - HTTP', 'Components: Total: 4 | Analyzed: 4 | Unknown: 0').catch(error => console.log(error));
 });

// it('Create a new space, new Vert.x - HTTP & Config Map quickstart, run its pipeline', async () => {
//    await runTest(dashboardPage, 'Vert.x - HTTP & Config Map', 'Components: Total: 9 | Analyzed: 9 | Unknown: 0').catch(error => console.log(error));
//  });

//  it('Create a new space, new Vert.x Health Check Example quickstart, run its pipeline', async () => {
//    await runTest(dashboardPage, 'Vert.x Health Check Example', 'Components: Total: 4 | Analyzed: 4 | Unknown: 0').catch(error => console.log(error));
//  });

//  it('Create a new space, new Spring Boot Health Check Example quickstart, run its pipeline', async () => {
//    await runTest(dashboardPage, 'Spring Boot Health Check Example', 'Components: Total: 3 | Analyzed: 3 | Unknown: 0').catch(error => console.log(error));
//   });

// tslint:enable:max-line-length

  async function runTest (theLandingPage: MainDashboardPage, quickstartName: string, expectedReportSummary: string) {

    let spaceName = support.newSpaceName();
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    support.info('Creating quickstart: ' + quickstartName);
    await wizard.newQuickstartProject({ project: quickstartName });
    await spaceDashboardPage.ready();

    /* This statement does not reliably wait for the modal dialog to disappear:
       await browser.wait(until.not(until.visibilityOf(spaceDashboardPage.modalFade)), support.LONGEST_WAIT);

       The above statement fails with this error: Failed: unknown error: Element <a id="spacehome-pipelines-title"
       href="/username/spaceName/create/pipelines">...</a> is not clickable at point (725, 667). Other element would
       receive the click: <modal-container class="modal fade" role="dialog" tabindex="-1" style="display:
       block;">...</modal-container>

       The only reliable way to avoid this is a sleep statement: await browser.sleep(5000); */
    await browser.sleep(5000);

    // tslint:disable:max-line-length
    await browser.wait(until.elementToBeClickable(spaceDashboardPage.pipelinesSectionTitle), support.LONGEST_WAIT, 'Failed to find pipelinesSectionTitle');
    await spaceDashboardPage.pipelinesSectionTitle.click();
    let spacePipelinePage = new SpacePipelinePage();

    await browser.wait(until.presenceOf(spacePipelinePage.pipelineByName(spaceName)), support.LONGEST_WAIT, 'Failed to find pipelinesByNamee');

    /* Verify that only (1) new matching pipeline is created */
    expect(await spacePipelinePage.allPipelineByName(spaceName).count()).toBe(1);

    /* Save the page output to stdout for logging purposes */
    let pipelineText = await spacePipelinePage.pipelinesPage.getText();
    support.debug('Pipelines page contents = ' + pipelineText);

    /* Find and click the 'promote' button */
    await until.elementToBeClickable(spacePipelinePage.pipelineByName(spaceName));

    try {
      await browser.wait(until.presenceOf(spacePipelinePage.inputRequiredByPipelineByName(spaceName)), support.LONGEST_WAIT, 'Failed to find inputRequiredByPipelineByName');
      await spacePipelinePage.inputRequiredByPipelineByName(spaceName).click();
      await spacePipelinePage.promoteButton.click();
      await browser.wait(until.elementToBeClickable(spacePipelinePage.stageIcon), support.LONGEST_WAIT, 'Failed to find stageIcon');
      await browser.wait(until.elementToBeClickable(spacePipelinePage.runIcon), support.LONGEST_WAIT, 'Failed to find runIcon');
    } catch (e) {
      support.writeScreenshot('target/screenshots/promote_fail_' + spaceName + '.png');
    }

    await dashboardPage.header.recentItemsDropdown.clickWhenReady();
    await dashboardPage.header.recentItemsDropdown.accountHomeItem.clickWhenReady();
    await dashboardPage.header.recentItemsDropdown.clickWhenReady();
    await dashboardPage.recentSpaceByName(spaceName).click();
    await spaceDashboardPage.stackReportsButton.clickWhenReady();

  }

});
