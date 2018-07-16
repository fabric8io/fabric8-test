import { browser, ExpectedConditions as until } from 'protractor';
import { LoginInteraction } from '../interactions/login_interactions';
import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { Button } from '../ui/button';
import { CodebasesPage } from '../page_objects/space_codebases.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';

let globalSpaceName: string;

/* Tests to verify Che in OSIO */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();

    let userProfilePage = await dashboardPage.gotoUserProfile();
    support.debug(">>> Go to user's Profile Page - OK");
    support.debug('>>> Go to Edit Profile Page');
    let editProfilePage = await userProfilePage.gotoEditProfile();
    support.debug('>>> Go to Edit Profile Page - OK');
    support.debug('>>> Go to Reset Env Page');
    let cleanupEnvPage = await editProfilePage.gotoResetEnvironment();
    support.debug('>>> Go to Reset Env Page - OK');

    await cleanupEnvPage.cleanup(browser.params.login.user);
  });

  afterEach( async () => {
//    await browser.sleep(support.DEFAULT_WAIT);
    support.writeScreenshot('target/screenshots/che_final_' + globalSpaceName + '.png');
    support.info('\n ============ End of test reached ============ \n');
    await dashboardPage.logout();
  });

  /* Accept all defaults for new quickstarts */

    // tslint:disable:max-line-length
  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, create Che workspace, run maven in the workspace', async () => {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    support.info('Creating quickstart: ' + quickstart.name);
    await wizard.newQuickstartProject({ project: quickstart.name });
    await spaceDashboardPage.ready();

    /* Open Che display page */
    await spaceDashboardPage.codebasesSectionTitle.clickWhenReady();

    let spaceChePage = new CodebasesPage();
    await spaceChePage.createWorkspace();

    /* A new browser window is opened when Che opens - switch to that new window now */
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(windowCount(2), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();

    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/che_workspace_parta_' + spaceName + '.png');

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[1]);

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    /* Open the terminal window and execute command */
    await spaceCheWorkSpacePage.bottomPanelTerminalTab.clickWhenReady();
    await support.printTerminal(spaceCheWorkSpacePage, 'cd ' + spaceName);
    await support.printTerminal(spaceCheWorkSpacePage, 'mvn clean install -Popenshift,openshift-it');

    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelTerminal, 'BUILD SUCCESS'), support.LONGER_WAIT);
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).toContain('BUILD SUCCESS');
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).not.toContain('BUILD FAILURE');

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);
  });

  function windowCount (count: number) {
    return function () {
        return browser.getAllWindowHandles().then(function (handles) {
            return handles.length === count;
        });
    };
  }

});
