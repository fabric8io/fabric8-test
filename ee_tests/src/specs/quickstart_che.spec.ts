import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';
import { Quickstart } from './support/quickstart';
import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpaceChePage } from './page_objects/space_che.page';
import { SpaceCheWorkspacePage } from './page_objects/space_cheworkspace.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';

let globalSpaceName: string;

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();

    let userProfilePage = await dashboardPage.gotoUserProfile();
    support.debug(">>> Go to user's Profile Page - OK");
    support.debug('>>> Go to Edit Profile Page');
    let editProfilePage = await userProfilePage.gotoEditProfile();
    support.debug('>>> Go to Edit Profile Page - OK');
    support.debug('>>> Go to Reset Env Page');
    let cleanupEnvPage = await editProfilePage.gotoResetEnvironment();
    support.debug('>>> Go to Reset Env Page - OK');

    await cleanupEnvPage.cleanup(browser.params.login.user);
    let alertBox = cleanupEnvPage.alertBox;

    /* OSIO is not reliable in restarting Jenkins pods in a timely manner - commenting
       out check for alert box */
    // await expect(alertBox.getText()).toContain('environment has been erased!');
  });

  afterEach(async () => {
    await browser.sleep(support.DEFAULT_WAIT);
    support.writeScreenshot('target/screenshots/che_final_' + globalSpaceName + '.png');
    support.info('\n ============ End of test reached ============ \n');
    // support.info('\n ============ End of test reached, logging out ============ \n');
    /* Logout is causing random failures on prod-preview - possibky due to navigating browser windows? */
    // await dashboardPage.logout();
  });

  /* Simple test - accept all defaults for new quickstarts */

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    support.info('Creating quickstart: ' + quickstart.name);
    await wizard.newQuickstartProject({ project: quickstart.name });
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

    // await browser.sleep(60000);
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
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    // await support.debug (spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText());
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    await spaceCheWorkSpacePage.mainMenuRunButton.clickWhenReady(support.LONGEST_WAIT);

    await spaceCheWorkSpacePage.mainMenuRunButtonRunSelection.clickWhenReady(support.LONGEST_WAIT);
    await spaceCheWorkSpacePage.bottomPanelRunTab.clickWhenReady(support.LONGEST_WAIT);

    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelCommandConsoleLines, 'Succeeded in deploying verticle'), support.LONGER_WAIT);
    let textStr = await spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText();
    support.info('Output from run = ' + textStr);
    expect(await spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText()).toContain('Succeeded in deploying verticle');

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);
  });

});
