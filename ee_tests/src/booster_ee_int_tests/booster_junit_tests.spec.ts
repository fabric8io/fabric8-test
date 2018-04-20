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
import { SpaceChePage } from '../page_objects/space_che.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { info } from '../support';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;
let quickstart: Quickstart;
let quickstartTestFile: string;

describe('Run the project\'s Junit tests from the Che menu:', () => {
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
    support.writeScreenshot('target/screenshots/booster_junit_tests_end.png');
    await dashboardPage.logout();
  });

  // tslint:disable:max-line-length
  it('Login, Run JUnit tests in Che, logout', async () => {
    // TODO: implement
    support.info('Test starting now...');

    await support.openCodebasesPage (browser.params.target.url, browser.params.login.user, support.currentSpaceName());
    let spaceChePage = new SpaceChePage();

    await spaceChePage.codebaseOpenButton(browser.params.github.username, support.currentSpaceName()).clickWhenReady();

    /* A new browser window is opened when Che opens - switch to that new window now */
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(support.windowCount(2), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/che_workspace_parta_' + support.currentSpaceName() + '.png');

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[1]);
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + support.currentSpaceName() + '.png');

    /* Find the project */
    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(support.currentSpaceName()), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + support.currentSpaceName() + '.png');
    expect(await spaceCheWorkSpacePage.recentProjectRootByName(support.currentSpaceName()).getText()).toContain(support.currentSpaceName());

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
    await spaceCheWorkSpacePage.walkTree(support.currentSpaceName(), '\/src', '\/test', '\/java', '\/io', '\/openshift', '\/booster');
    await browser.wait(until.visibilityOf(spaceCheWorkSpacePage.cheFileName(quickstart.testFileName)), support.DEFAULT_WAIT);

    let theText = await spaceCheWorkSpacePage.cheFileName(quickstart.testFileName).getText();
    support.info ('filename = ' + theText);
    await spaceCheWorkSpacePage.cheFileName(quickstart.testFileName).clickWhenReady();

    // Run the junit test
    spaceCheWorkSpacePage.cheMenuRun.clickWhenReady();
    spaceCheWorkSpacePage.cheMenuRunTest.clickWhenReady();
    spaceCheWorkSpacePage.cheMenuRunTestJunit.clickWhenReady();
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.debugInfoPanel, 'Total tests run: '), support.LONGER_WAIT);
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Failures: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Skips: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).not.toContain('Total tests run: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Total tests run: ' + quickstart.junitTestCount);
    support.writeScreenshot('target/screenshots/che_workspace_partd_' + support.currentSpaceName() + '.png');

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);
  });

});
