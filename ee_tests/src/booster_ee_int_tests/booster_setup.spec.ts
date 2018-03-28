import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { TextInput, Button } from '../ui';

import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { StageRunPage } from '../page_objects/space_stage_run.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { SpaceChePage } from '../page_objects/space_che.page';
import { CheWorkspace } from '../support';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_setup_success.png');
    await dashboardPage.logout();
  });

  it('Reset Environment, create a new space, new ' + browser.params.quickstart.name + ' quickstart', async () => {
    // Reset Environment
    let userProfilePage = await dashboardPage.gotoUserProfile();
    support.debug(">>> Go to user's Profile Page - OK");
    support.debug('>>> Go to Edit Profile Page');
    let editProfilePage = await userProfilePage.gotoEditProfile();
    support.debug('>>> Go to Edit Profile Page - OK');
    support.debug('>>> Go to Reset Env Page');
    let cleanupEnvPage = await editProfilePage.gotoResetEnvironment();
    support.debug('>>> Go to Reset Env Page - OK');

    await cleanupEnvPage.cleanup(browser.params.login.user);

    // Create a space
    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    // Create a QuickStart
    let quickstart = new Quickstart(browser.params.quickstart.name);
    support.info('Creating quickstart: ' + quickstart.name);
    let wizard = await spaceDashboardPage.addToSpace();
    await wizard.ready();
    if (browser.params.ngx_launcher.enabled === 'true') {
      support.info('Use the new ngx launcher...');
      await wizard.newQuickstartProjectByLauncher(quickstart.id, spaceName, browser.params.release.strategy);
    } else {
      support.info('Use the legacy launcher...');
      await wizard.newQuickstartProject({ project: quickstart.name });
    }
    await spaceDashboardPage.ready();

    // Create a Che workspace
    await spaceDashboardPage.codebasesSectionTitle.clickWhenReady();

    let spaceChePage = new SpaceChePage();
    await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

    // A new browser window is opened when Che opens - switch to that new window now
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(windowCount(2), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();

    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/che_workspace_parta_' + spaceName + '.png');

    // Switch to the Che browser window
    await browser.switchTo().window(handles[1]);

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);

    let cheWorkspaceUrl = await browser.getCurrentUrl();
    support.info('Che Workspace URL: ' + cheWorkspaceUrl);
    support.updateCheWorkspaceUrl(cheWorkspaceUrl);

    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    // Switch back to the OSIO browser window
    await browser.switchTo().window(handles[0]);
  });

  function windowCount(count: number) {
    return function () {
      return browser.getAllWindowHandles().then(function (handles) {
        return handles.length === count;
      });
    };
  }


});
