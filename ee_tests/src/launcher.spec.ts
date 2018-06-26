import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { Quickstart } from './support/quickstart';

import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { AddToSpaceDialog, NewImportExperienceDialog, LauncherSection, LauncherSetupAppPage } from './page_objects';
import { LauncherReleaseStrategy } from './support/launcher_release_strategy';
import { sleep } from './support';

let globalSpaceName: string;

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();
  });

  afterEach(async () => {
    support.info('\n ============ End of test reached, logging out ============ \n');
    await dashboardPage.openInBrowser();
    await dashboardPage.logout();
  });

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart via ngx Launcher',
    async () => {
      let quickstart = new Quickstart(browser.params.quickstart.name);
      let spaceName = support.newSpaceName();
      let spaceDashboardPage = await dashboardPage.createNewSpaceByLauncher(spaceName);

      let wizard: AddToSpaceDialog = await spaceDashboardPage.addToSpace();

      await wizard.newQuickstartProjectByLauncher(quickstart.id, spaceName, browser.params.release.strategy);
      await spaceDashboardPage.ready();
    }
  );
});
