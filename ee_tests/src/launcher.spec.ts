import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { Quickstart } from './support/quickstart';
import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';

let globalSpaceName: string;

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
    // support.info('\n ============ End of test reached, logging out ============ \n');
    // await dashboardPage.logout();
  });

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart via Launcher, run its pipeline',
    async () => {
      let quickstart = new Quickstart(browser.params.quickstart.name);
      let spaceName = support.newSpaceName();
      globalSpaceName = spaceName;
      let spaceDashboardPage = await dashboardPage.createNewSpaceByLauncher(spaceName);

      let wizard = await spaceDashboardPage.addToSpace();
      let dialog = await wizard.openNewImportExperience();

      dialog.projectName.sendKeys('project-ion');

      let launcher = await dialog.selectCreateNewApplication();
      await launcher.ready();

      quickstart = new Quickstart(browser.params.quickstart.name);
      await launcher.selectRuntime(quickstart.runtime.name);
      await launcher.selectMission(quickstart.mission.name);
      support.writeScreenshot('target/screenshots/launcher-create-new-app-' + spaceName + '.png');
      await launcher.missionRuntimeContinueButton.clickWhenReady();
      await launcher.selectPipeline(1);
      await launcher.releaseStrategyContinueButton.clickWhenReady();

      // TODO: instead of canceling complete the wizard
      await launcher.leaveSetupButton.clickWhenReady();
      await launcher.confirmCancelButton.clickWhenReady();

    }
  );

});
