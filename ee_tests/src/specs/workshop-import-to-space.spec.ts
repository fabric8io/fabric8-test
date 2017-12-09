import { browser }  from 'protractor';
import * as support from './support';
import {
  MainDashboardPage,
  SpaceDashboardPage,
  CleanupUserEnvPage,
  PageOpenMode
} from './page_objects';
import { AddToSpaceDialog } from './ui/space_dashboard';

describe('import codebase', function () {
  let dashboardPage: MainDashboardPage;

  beforeEach( async () => {
    await support.desktopTestSetup();

    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });


  async function resetEnv() {

    support.debug('>>> Reset Env');
    let cleanupEnvPage = new CleanupUserEnvPage();
    cleanupEnvPage.open(PageOpenMode.RefreshBrowser);

    await cleanupEnvPage.cleanup(browser.params.login.user);

    let alertBox = cleanupEnvPage.alertBox;
    await expect(alertBox.getText()).toContain('environment has been erased!');
    await dashboardPage.open(PageOpenMode.RefreshBrowser);
    support.debug('>>> Reset Env - OK');
  }

  it('creates a new space and imports codebase', async () => {
    // steps
    //  - add a new space
    //  - add a quickstart project
    //  - reset the env
    //  - add another space
    //  - HACK: wait for 5 minutes until the github repo is synced
    //  - do an import of the old space

    let spaceDashboard: SpaceDashboardPage;
    let wizard: AddToSpaceDialog;

    // - add a new space

    const spaceName = support.newSpaceName();
    support.info(`>>> Create space: ${spaceName}`);
    spaceDashboard = await dashboardPage.createNewSpace(spaceName);
    support.info(`>>> Create space: ${spaceName} - OK`);

    // - add a quickstart project
    const project = 'Vert.x HTTP Booster';
    support.info(`>>> Create a quickstart project: '${project}'`);
    wizard = await spaceDashboard.addToSpace();
    await wizard.newQuickstartProject({ project });
    await spaceDashboard.ready();
    support.info(`>>> Create a quickstart project: '${project} - OK'`);

    // //  - reset the env
    await resetEnv();

    //  - add another space
    const newSpaceName = support.newSpaceName();
    support.info(`>>> Create new space: ${newSpaceName}`);
    spaceDashboard = await dashboardPage.createNewSpace(newSpaceName);
    support.info(`>>> Create new space: ${newSpaceName} - OK`);

    //  - HACK: wait for 5 minutes until the github repo is synced

    support.info(`>>> Sleep for 5 mins before importing ${spaceName} `);
    await browser.sleep(support.minutes(5));
    support.info(`>>> Sleep for 5 mins before importing ${spaceName} `);

    //  - do an import of the old space
    support.debug('>>> Going to import repo created earlier', spaceName);
    wizard = await spaceDashboard.addToSpace();
    await wizard.importExistingCode({
      org: browser.params.github.username,
      repositories: [spaceName]
    });
    await spaceDashboard.open();

  }, support.minutes(10));

});
