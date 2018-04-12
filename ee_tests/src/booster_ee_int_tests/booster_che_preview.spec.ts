import { browser, Key, protractor, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';
import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { TextInput, Button } from '../ui';

import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { StageRunPage } from '../page_objects/space_stage_run.page';
import { SpaceChePage } from '../page_objects/space_che.page';
import { BoosterEndpoint } from '../page_objects/booster_endpoint.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { info } from '../support';
import * as ui from '../ui';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;
const SRCFILENAME: string = 'HttpApplication.java';

/* Text used to verify operation of deployed app, before and after the app is modified */
const EXPECTED_TEXT_SEND = 'World';
const EXPECTED_TEXT_RECEIVED = 'Hello, World!';
const EXPECTED_SUCCESS_TEXT = (
  new Quickstart(browser.params.quickstart.name)
).runtime.quickstartStartedTerminal;

// tslint:disable:max-line-length

/* This test performs these steps:
   - Execute the quickstart/booster through the Che run menu, verify output from the deployed app  */

describe('Verify the Che preview URL for a deployed app:', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_modify_src_complete.png');
    await dashboardPage.logout();
  });

  it('Login, run in Che, verify URL, logout', async () => {
    support.info('Che preview URL test starting now...');

    /* Run the app, verify the deployed app performs as expected */

    /* Open the codebase page and the workspace in Che */
    await support.openCodebasesPage (browser.params.target.url, browser.params.login.user, support.currentSpaceName());
    let spaceChePage = new SpaceChePage();
    await spaceChePage.codebaseOpenButton(browser.params.login.user, support.currentSpaceName()).clickWhenReady();

    /* A new browser window is opened when Che opens */
    let handles = await browser.getAllWindowHandles();
    support.writeScreenshot('target/screenshots/che_edit_open_che_' + support.currentSpaceName() + '.png');
    await browser.wait(support.windowCount(handles.length), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after opening Che browser window = ' + handles.length);

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[handles.length - 1]);
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();

    /* Find the project in the project tree */
    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(support.currentSpaceName()), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.DEFAULT_WAIT);
    support.writeScreenshot('target/screenshots/che_edit_project_tree_' + support.currentSpaceName() + '.png');

    /* Run the project - verify the output from the deployed (in Che preview) serviceendpoint */
    await support.runBooster(spaceCheWorkSpacePage, EXPECTED_SUCCESS_TEXT);

    /* Invoke the deployed app at its endpoint, verify the app's output */
    let boosterEndpointPage = new BoosterEndpoint();
    await support.invokeApp (boosterEndpointPage, spaceCheWorkSpacePage, browser.params.oso.username, 'pre_edit', EXPECTED_TEXT_SEND, EXPECTED_TEXT_RECEIVED, spaceCheWorkSpacePage);

    /* Close the Endpoint window */
    await browser.close();

    /* Close the Che window */
    handles = await browser.getAllWindowHandles();
    await browser.switchTo().window(handles[handles.length - 1]);
    await spaceCheWorkSpacePage.bottomPanelRunTabCloseButton.clickWhenReady();
    await spaceCheWorkSpacePage.bottomPanelRunTabOKButton.clickWhenReady();
    await browser.close();

    /* Switch back to the OSIO window */
    await browser.switchTo().window(handles[0]);

  });

});
