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
import { LauncherPage } from './page_objects/launcher.page';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

/* Tests to verify user login/logout */

describe('Starting the Launcher', () => {
  let dashboardPage: MainDashboardPage;
  let launcherPage: LauncherPage;

  beforeEach(async () => {
  });

  afterEach(async () => {
    // let spaceName = support.newSpaceName();
    support.writeScreenshot('target/screenshots/launcher_test_success_' + browser.params.quickstart.name + '.png');
    // await dashboardPage.logout();
  });

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {

    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
    launcherPage = new LauncherPage();
    await launcherPage.open();
    await launcherPage.selectRuntime();
    await launcherPage.selectMission();
    await launcherPage.sectionMissionRuntimeOkButton.click();
  });
});
