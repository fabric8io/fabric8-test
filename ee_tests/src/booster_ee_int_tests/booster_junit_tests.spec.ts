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

describe('Run the project\'s Junit tests from the Che menu:', () => {
  let dashboardPage: MainDashboardPage;

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

    openCodebasesPage (browser.params.target.url, browser.params.login.user, support.currentSpaceName());
    let spaceChePage = new SpaceChePage();

    spaceChePage.codebaseOpenButton(browser.params.github.username, support.currentSpaceName()).clickWhenReady();

    /* A new browser window is opened when Che opens - switch to that new window now */
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(windowCount(2), support.DEFAULT_WAIT);
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
    await support.printTerminal(spaceCheWorkSpacePage, 'cd ' + support.currentSpaceName());
    await support.printTerminal(spaceCheWorkSpacePage, 'mvn clean install'); // -Popenshift,openshift-it');
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelTerminal, 'BUILD SUCCESS'), support.LONGER_WAIT);
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).toContain('BUILD SUCCESS');
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).not.toContain('BUILD FAILURE');

    /* Run the Junit tests */
    await spaceCheWorkSpacePage.walkTree(support.currentSpaceName(), '\/src', '\/test', '\/java', '\/io', '\/openshift', '\/booster');
    await browser.wait(until.visibilityOf(spaceCheWorkSpacePage.cheFileName('HttpApplicationTest.java')), support.DEFAULT_WAIT);

    let theText = await spaceCheWorkSpacePage.cheFileName('HttpApplicationTest.java').getText();
    support.info ('filename = ' + theText);
    await spaceCheWorkSpacePage.cheFileName('HttpApplicationTest.java').clickWhenReady();

    // Run the junit test
    spaceCheWorkSpacePage.cheMenuRun.clickWhenReady();
    spaceCheWorkSpacePage.cheMenuRunTest.clickWhenReady();
    spaceCheWorkSpacePage.cheMenuRunTestJunit.clickWhenReady();

    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.debugInfoPanel, 'Total tests run: 2, Failures: 0, Skips: 0'), support.LONGER_WAIT);
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Failures: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).toContain('Skips: 0');
    await expect(spaceCheWorkSpacePage.debugInfoPanel.getText()).not.toContain('Total tests run: 0');
    support.writeScreenshot('target/screenshots/che_workspace_partd_' + support.currentSpaceName() + '.png');

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);
  });

  function windowCount (count: number) {
    return function () {
        return browser.getAllWindowHandles().then(function (handles) {
            return handles.length === count;
        });
    };
  }

  async function openCodebasesPage (osioUrl: string, userName: string, spaceName: string) {
    let theUrl: string = osioUrl + '\/' + userName + '\/' + spaceName + '\/create';
    await browser.get(theUrl);
    return new SpaceChePage();
  }

});
