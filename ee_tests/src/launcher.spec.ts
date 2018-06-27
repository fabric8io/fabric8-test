import { browser } from 'protractor';

import * as support from './support';
import { Quickstart } from './support/quickstart';

import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { AddToSpaceDialog } from './page_objects/space_dashboard/add_to_space_dialog';

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
