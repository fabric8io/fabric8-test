import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpaceChePage } from './page_objects/space_che.page';
import { SpaceCheWorkspacePage } from './page_objects/space_cheworkspace.page';
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
//    await browser.sleep(support.DEFAULT_WAIT);
//    await dashboardPage.logout();
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

    /* Open Che display page */

    // tslint:disable:max-line-length
//    codebasesSectionTitle
    await browser.wait(until.elementToBeClickable(spaceDashboardPage.codebasesSectionTitle), support.LONGEST_WAIT, 'Failed to find pipelinesSectionTitle');
    await spaceDashboardPage.codebasesSectionTitle.click();

//    await browser.sleep(60000);

    let spaceChePage = new SpaceChePage();

    await spaceChePage.createCodebase.untilPresent();
    await spaceChePage.createCodebase.untilClickable(support.LONGEST_WAIT);
    await spaceChePage.createCodebase.click();

    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);

    await browser.sleep(60000);

    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/che_workspace_parta_' + spaceName + '.png');

    await browser.switchTo().window(handles[1]);


    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
//    await browser.sleep(60000);
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    await browser.wait(until.presenceOf(spaceCheWorkSpacePage.recentProjectRootByName(spaceName)), support.LONGEST_WAIT, 'Failed to find project name text');
    await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText();

    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');
    // await browser.switchTo().window(handles[0]);

  }

});
