import { browser } from 'protractor';
import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { LoginInteraction } from '../interactions/login_interactions';

import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { CodebasesPage } from '../page_objects/space_codebases.page';
import { BoosterEndpoint } from '../page_objects/booster_endpoint.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';

/* Text used to verify operation of deployed app, before and after the app is modified */
const EXPECTED_TEXT_SEND = 'World';
const EXPECTED_TEXT_RECEIVED = 'Hello, World!';
const EXPECTED_SUCCESS_TEXT = (
  new Quickstart(browser.params.quickstart.name)
).runtime.quickstartStartedTerminal;

/* This test executes the quickstart/booster through the Che run menu, verifies output from the deployed app  */

describe('Verify the Che preview URL for a deployed app:', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_modify_src_complete.png');
    await dashboardPage.logout();
  });

  /* Run the app, verify the deployed app performs as expected */
  it('Login, run in Che, verify URL, logout', async () => {
    support.info('Che preview URL test starting now...');

    /* Open and switch to the Che window */
    let spaceChePage = new CodebasesPage();
    await support.openCodebasePageSwitchWindow(spaceChePage);

    /* Find the project in the Che workspace */
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    await support.findProjectInTree(spaceCheWorkSpacePage);

    /* Run the project - verify the output from the deployed (in Che preview) serviceendpoint */
    await support.runBooster(spaceCheWorkSpacePage, EXPECTED_SUCCESS_TEXT);

    /* Invoke the deployed app at its endpoint, verify the app's output */
    let boosterEndpointPage = new BoosterEndpoint();
    await support.invokeApp(boosterEndpointPage, spaceCheWorkSpacePage, browser.params.oso.username,
      'pre_edit', EXPECTED_TEXT_SEND, EXPECTED_TEXT_RECEIVED, spaceCheWorkSpacePage);

    /* Close the Endpoint window */
    await browser.close();

    /* Close the Che window */
    await support.windowManager.switchToWindow(2, 1);
    await spaceCheWorkSpacePage.bottomPanelRunTabCloseButton.clickWhenReady();
    await spaceCheWorkSpacePage.bottomPanelRunTabOKButton.clickWhenReady();
    await browser.close();

    /* Switch back to the OSIO window */
    await support.windowManager.switchToWindow(1, 0);
  });

});
