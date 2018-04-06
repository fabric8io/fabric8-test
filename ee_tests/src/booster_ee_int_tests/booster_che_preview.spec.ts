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
const EXPECTED_TEXT_AFTER_SEND = 'Howdee, World';
const EXPECTED_TEXT_AFTER_RECEIVED = 'Howdee, Howdee, World!';
const EXPECTED_SUCCESS_TEXT = 'Succeeded in deploying verticle';  // TODO - Need unique string for each booster

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
    await openCodebasesPage (browser.params.target.url, browser.params.login.user, support.currentSpaceName());
    let spaceChePage = new SpaceChePage();
    await spaceChePage.codebaseOpenButton(browser.params.login.user, support.currentSpaceName()).clickWhenReady();

    /* A new browser window is opened when Che opens */
    let handles = await browser.getAllWindowHandles();
    support.writeScreenshot('target/screenshots/che_edit_open_che_' + support.currentSpaceName() + '.png');
    await browser.wait(windowCount(handles.length), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after opening Che browser window = ' + handles.length);

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[handles.length - 1]);
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();

    /* Find the project in the project tree */
    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(support.currentSpaceName()), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/che_edit_project_tree_' + support.currentSpaceName() + '.png');

    /* Run the project - verify the output from the deployed (in Che preview) serviceendpoint */
    await runBooster(spaceCheWorkSpacePage);

    /* Invoke the deployed app at its endpoint, verify the app's output */
    await invokeApp (browser.params.oso.username, 'pre_edit', EXPECTED_TEXT_SEND, EXPECTED_TEXT_RECEIVED, spaceCheWorkSpacePage);

    /* Switch back tot he OSIO browser window so the test can log out */
    await browser.switchTo().window(handles[0]);
  });

  /* Run the booster by means of the Che run menu */
  async function runBooster (spaceCheWorkSpacePage: SpaceCheWorkspacePage) {
    try {

        /* Remote sites (Brno) are experiencing issues where the run button is active before
           the project os fully downloaded - and run is attempted before the pom file is present */
        try {
            await spaceCheWorkSpacePage.walkTree(support.currentSpaceName());
            await browser.wait(until.visibilityOf(spaceCheWorkSpacePage.cheFileName('pom.xml')), support.DEFAULT_WAIT);
          } catch (e) {
            support.info('Exception in Che project directory tree = ' + e);
        }

      await spaceCheWorkSpacePage.mainMenuRunButton.clickWhenReady(support.LONGEST_WAIT);
      await spaceCheWorkSpacePage.mainMenuRunButtonRunSelection.clickWhenReady(support.LONGEST_WAIT);
      await spaceCheWorkSpacePage.bottomPanelRunTab.clickWhenReady(support.LONGEST_WAIT);
      await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelCommandConsoleLines, EXPECTED_SUCCESS_TEXT), support.LONGER_WAIT);
      let textStr = await spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText();
      support.info('Output from run = ' + textStr);
      expect(await spaceCheWorkSpacePage.bottomPanelCommandConsoleLines.getText()).toContain('Succeeded in deploying verticle');
    } catch (e) {
      support.info('Exception running booster = ' + e);
    }
  }

  /* Access the deployed app's Che preview endpoint, send text, invoke the app, return the output */
  async function invokeApp (username: string, screenshotName: string, inputString: string, expectedString: string, spaceCheWorkSpacePage: SpaceCheWorkspacePage) {

    /// TODO - The link to the deployed app is present before the endpoint is available
    await browser.sleep(10000);
    await spaceCheWorkSpacePage.previewLink(username).clickWhenReady();

    /* A new browser window is opened when Che opens the app endpoint */
    let handles = await browser.getAllWindowHandles();
    await browser.wait(windowCount(handles.length), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after opening Che app window = ' + handles.length);

    /* Switch to the newly opened Che deployed endpoint browser window */
    await browser.switchTo().window(handles[handles.length - 1]);

    /* Invoke the deployed app */
    let boosterEndpointPage = new BoosterEndpoint();
    try {
      await boosterEndpointPage.nameText.clickWhenReady();
      await boosterEndpointPage.nameText.sendKeys(inputString);
      support.writeScreenshot('target/screenshots/che_edit_' + screenshotName + '_' + support.currentSpaceName() + '.png');
      await boosterEndpointPage.invokeButton.clickWhenReady(support.LONGEST_WAIT);

      let expectedOutput = '{"content":"' + expectedString + '"}';
      await browser.wait(until.textToBePresentInElement(boosterEndpointPage.stageOutput, expectedOutput), support.DEFAULT_WAIT);
      expect(await boosterEndpointPage.stageOutput.getText()).toBe(expectedOutput);
      } catch (e) {
        support.info('Exception invoking staged app = ' + e);
    }
  }

  /* Wait for the expected number of browser windows to be open */
  function windowCount (count: number) {
    return function () {
        return browser.getAllWindowHandles().then(function (handles) {
            return handles.length === count;
        });
    };
  }

  /* A new browser window is opened - switch to that new window now */
  async function switchToWindow (windowTotal: number, windowId: number) {
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(windowCount(windowTotal), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[windowId]);
  }

  /* Open the selected codebases page */
  async function openCodebasesPage (osioUrl: string, userName: string, spaceName: string) {
    let theUrl: string = osioUrl + '\/' + userName + '\/' + spaceName + '\/create';
    await browser.get(theUrl);
    return new SpaceChePage();
  }

});
