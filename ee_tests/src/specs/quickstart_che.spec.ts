import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';
import { TextInput, Button } from './ui';

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
    await browser.sleep(support.DEFAULT_WAIT);
    support.info('\n ============ End of test reached, logging out ============ \n');
    await dashboardPage.logout();
  });

  /* Simple test - accept all defaults for new quickstarts */

  /* The majority of these tests are commented out not due to any bugs,
     but to ensure that the test does not collide with other tests. TODO - to
     resolve these collisions */

  // tslint:disable:max-line-length

  it('Create a new workspace, new Vert.x HTTP Booster quickstart, run the app and test it in Che', async () => {
    await runTest(dashboardPage, 'Vert.x HTTP Booster').catch(error => console.log(error));
  });

// it('Create a new workspace, new Spring Boot - HTTP quickstart, run the app and test it in Che', async () => {
//  await runTest(dashboardPage, 'Spring Boot - HTTP').catch(error => console.log(error));
// });

// it('Create a new workspace, new Vert.x - HTTP & Config Map quickstart, run the app and test it in Che', async () => {
//    await runTest(dashboardPage, 'Vert.x - HTTP & Config Map').catch(error => console.log(error));
//  });

//  it('Create a new workspace, new Vert.x Health Check Example quickstart, run the app and test it in Che', async () => {
//    await runTest(dashboardPage, 'Vert.x Health Check Example').catch(error => console.log(error));
//  });

//  it('Create a new workspace, new Spring Boot Health Check Example quickstart, run the app and test it in Che', async () => {
//    await runTest(dashboardPage, 'Spring Boot Health Check Example').catch(error => console.log(error));
//   });

// tslint:enable:max-line-length

  async function runTest (theLandingPage: MainDashboardPage, quickstartName: string) {

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
    await spaceDashboardPage.codebasesSectionTitle.clickWhenReady();

//    await browser.sleep(60000);
    let spaceChePage = new SpaceChePage();
    await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

    /* A new browser window is opened when Che opens - switch to that new window now */
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);

    /* TODO - Need to create a query to look for/wait for the 2nd browser window and remove the sleep statement */
    await browser.sleep(60000);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/che_workspace_parta_' + spaceName + '.png');

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[1]);

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
//    await browser.sleep(60000);
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    // await support.debug (spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText());
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect (await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toBe(spaceName);

    await spaceCheWorkSpacePage.mainMenuRunButton.clickWhenReady(support.LONGEST_WAIT);
//    await browser.sleep(30000);

    await spaceCheWorkSpacePage.mainMenuRunButtonRunSelection.clickWhenReady(support.LONGEST_WAIT);
//    await browser.sleep(30000);

    await spaceCheWorkSpacePage.bottomPanelRunTab.clickWhenReady(support.LONGEST_WAIT);
    await browser.sleep(60000);

    support.debug(spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText());
//    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelCommandConsoleLines, 'Succeeded in deploying verticle'), support.LONG_WAIT);
//    expect(spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText()).toContain('Succeeded in deploying verticle');

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);

  }

});
