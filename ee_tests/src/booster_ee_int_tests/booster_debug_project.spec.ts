import { browser, element, by, protractor, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { TextInput, Button } from '../ui';

import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { StageRunPage } from '../page_objects/space_stage_run.page';
import { SpaceChePage } from '../page_objects/space_che.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { info } from '../support';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;
let quickstart: Quickstart;
let quickstartTestFile: string;

const SRCFILENAME: string = 'HttpApplicationTest.java';

describe('Debug the project\'s Junit tests from the Che menu:', () => {
  let dashboardPage: MainDashboardPage;

  beforeAll(async () => {
    support.info('--- Before all ---');
    quickstart = new Quickstart(browser.params.quickstart.name);
  });

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_debug_tests_end.png');
    await dashboardPage.logout();
  });

  // tslint:disable:max-line-length
  it('Login, Debug JUnit tests in Che, logout', async () => {
    // TODO: implement
    support.info('Test starting now...');

    /* Open and switch to the Che window */
    let spaceChePage = new SpaceChePage();
    await support.openCodebasePageSwitchWindow(spaceChePage);

    /* Find the project in the Che workspace */
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    await support.findProjectInTree(spaceCheWorkSpacePage);

    /* We have to allow time for the project to be fully populated - achieve this by
       verifying that the pom.xml file is present */
    try {
      await spaceCheWorkSpacePage.walkTree(support.currentSpaceName());
      await browser.wait(until.visibilityOf(spaceCheWorkSpacePage.cheFileName('pom.xml')), support.DEFAULT_WAIT);
    } catch (e) {
      support.info('Exception in Che project directory tree = ' + e);
  }

    /* Open the terminal window and execute maven install command */
    await spaceCheWorkSpacePage.bottomPanelTerminalTab.clickWhenReady();
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelTerminal, 'user@workspace'), support.DEFAULT_WAIT);
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelTerminal, 'projects'), support.DEFAULT_WAIT);

    await support.printTerminal(spaceCheWorkSpacePage, 'cd ' + support.currentSpaceName());
    await support.printTerminal(spaceCheWorkSpacePage, 'mvn clean install'); // -Popenshift,openshift-it');
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelTerminal, 'BUILD SUCCESS'), support.LONGER_WAIT);
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).toContain('BUILD SUCCESS');
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).not.toContain('BUILD FAILURE');

    /* Run the Junit tests */
    await spaceCheWorkSpacePage.walkTree('\/src', '\/test', '\/java', '\/io', '\/openshift', '\/booster');
    await browser.wait(until.visibilityOf(spaceCheWorkSpacePage.cheFileName(quickstart.testFileName)), support.DEFAULT_WAIT);

    let theText = await spaceCheWorkSpacePage.cheFileName(quickstart.testFileName).getText();
    support.info ('filename = ' + theText);
    await spaceCheWorkSpacePage.cheFileName(quickstart.testFileName).clickWhenReady();

    // Comment out as a temporary workaroound to:
    // https://github.com/openshiftio/openshift.io/issues/3482
    /* Right click on file name */
    //    await browser.actions().click(spaceCheWorkSpacePage.cheFileName(SRCFILENAME), protractor.Button.RIGHT).perform();
    /* Open the file edit menu */
    //    await spaceCheWorkSpacePage.cheContextMenuEditFile.clickWhenReady();

    /* Debug the junit test */
    await spaceCheWorkSpacePage.cheFileName(quickstart.testFileName).clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuRun.clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuRunTest.clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuDebugTestJunit.clickWhenReady();

   /* Open debugInfoPanel test results*/
    support.debug ('JUnit test running...');
    // TODO - Replace this sleep statement - unable to identify a UI element to search for to replace
    // the need for this sleepstatement
    await browser.sleep(30000);
    await spaceCheWorkSpacePage.testRunnerResultsButton.clickWhenReady();
    support.debug ('Reviewing JUnit test results...');

    /* Trap intermittent error - https://github.com/openshiftio/openshift.io/issues/3497 */
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).
    not.toContain('Exception in thread "main" java.lang.NoClassDefFoundError: org/junit/runner/JUnitCore');

    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.debugInfoPanel, 'Total tests run: '), support.LONGER_WAIT);
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Failures: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Skips: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).not.toContain('Total tests run: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Total tests run: ' + quickstart.junitTestCount);
    support.writeScreenshot('target/screenshots/che_workspace_partd_' + support.currentSpaceName() + '.png');

    await browser.close();

    /* Switch back to the OSIO window */
    await support.switchToWindow(1, 0);
  });

});
