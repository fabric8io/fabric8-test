import {
  browser, by, element, ElementFinder, ExpectedConditions as until,
  Key, protractor
} from 'protractor';
import { LoginInteraction } from '../interactions/login_interactions';
import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { Button } from '../ui/button';

import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { CodebasesPage } from '../page_objects/space_codebases.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';

const SRCFILENAME: string = 'README.adoc';

/* Text used to verify operation of deployed app, before and after the app is modified */
const EXPECTED_SUCCESS_TEXT = new Quickstart(browser.params.quickstart.name).runtime.quickstartStartedTerminal;

/* Locate a pipeline by name */
function pipelineByName (nameString: string): ElementFinder {
  let xpathString = './/a[contains(@class,\'card-title\') and contains(text(),\'' + nameString + '\')]/../../..';
  return element(by.xpath(xpathString));
}

/* This test performs these steps:
   - Execute the quickstart/booster through the Che run menu, verify output from the deployed app
   - Update the source of the quickstart/booster
   - Execute the quickstart/booster through the Che run menu, verify output from the deployed app   */

describe('Triggers the CD Build (Jenkins):', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_trigger_cd_complete.png');
    await dashboardPage.logout();
  });

  it('Login, edit code in Che, logout', async () => {
    support.info('Che edit test starting now...');

    /* Part 1 - Run the app, verify the deployed app performs as expected */

    /* Open and switch to the Che window */
    let spaceChePage = new CodebasesPage();
    await support.openCodebasePageSwitchWindow(spaceChePage);

    /* Find the project in the project tree */
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(
      support.currentSpaceName()), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/booster_trigger_cd_' + support.currentSpaceName() + '.png');

    await support.runBooster(spaceCheWorkSpacePage, EXPECTED_SUCCESS_TEXT);
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    await projectInCheTree.clickWhenReady();

    /* Modify the deployed app source code */
    let theText = await spaceCheWorkSpacePage.cheFileName(SRCFILENAME).getText();
    support.info ('filename = ' + theText);
    await spaceCheWorkSpacePage.cheFileName(SRCFILENAME).clickWhenReady();

    /* Right click on file name */
    await browser.actions().click(spaceCheWorkSpacePage.cheFileName(SRCFILENAME), protractor.Button.RIGHT).perform();

    /* Open the file edit menu */
    await spaceCheWorkSpacePage.cheContextMenuEditFile.clickWhenReady();

    /* Replace the file contents */
    try {
      await spaceCheWorkSpacePage.cheText.clickWhenReady(support.LONG_WAIT);
      await spaceCheWorkSpacePage.cheText.sendKeys('text was', Key.CONTROL, 'a', Key.NULL, '"NEW TEXT');
    } catch (e) {
     support.info('Exception in writing to file in Che = ' + e);
    }
    support.writeScreenshot('target/screenshots/booster_trigger_cd_part_edit_' + support.currentSpaceName() + '.png');

    /* Set the Git username - to enable a commit to be performed */
    await commitFields(spaceCheWorkSpacePage, 'temp', 'temp@temp.com');
    await commitFields(spaceCheWorkSpacePage, browser.params.github.username, 'example@redhat.com');

    /* Edit the README file and commit the change */
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    await projectInCheTree.clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuGit.clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuGitCommit.clickWhenReady();
    await spaceCheWorkSpacePage.cheCommitMessage.clickWhenReady();
    await spaceCheWorkSpacePage.cheCommitMessage.sendKeys('ABCDEF');
    await spaceCheWorkSpacePage.filenameCheckbox(SRCFILENAME).clickWhenReady();
    await spaceCheWorkSpacePage.cheCommitConfirmButton.clickWhenReady();
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelGitCommitConsoleLines,
      'Committed with revision'), support.LONG_WAIT);
    await spaceCheWorkSpacePage.bottomPanelGitCommitTabCloseButton.clickWhenReady();

    /* And push the change to the Git repo */
    await spaceCheWorkSpacePage.cheMenuGit.clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuGitRemotes.clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuGitRemotesPush.clickWhenReady();
    await spaceCheWorkSpacePage.cheMenuGitRemotesPushButton.clickWhenReady();
    await browser.wait(until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelGitPushConsoleLines,
      'Successfully pushed'), support.LONG_WAIT);
    await spaceCheWorkSpacePage.bottomPanelGitPushTabCloseButton.clickWhenReady();

    /* Close the Che window */
    await browser.close();

    /* Switch back to the OSIO window */
    await support.windowManager.switchToWindow(1, 0);

    let spaceDashboardPage = new SpaceDashboardPage(support.currentSpaceName());
    await spaceDashboardPage.openInBrowser();
    await spaceDashboardPage.pipelinesSectionTitle.clickWhenReady(support.LONGER_WAIT);
    support.debug('Accessed pipeline page');

    let pipeline = new Button(pipelineByName(support.currentSpaceName()), 'Pipeline By Name');

    support.debug('Looking for the pipeline name');
    await pipeline.untilPresent(support.LONGER_WAIT);
    await spaceDashboardPage.viewPipelineRuns.clickWhenReady();

    let build2 = element(by.xpath('.//a[contains(text(),\'Build #2\')]'));
    await browser.wait(until.visibilityOf(build2), support.LONGEST_WAIT);
    await expect (spaceDashboardPage.pipelineList.count()).toBe(2);

  });

/* Open the selected codebases page */
async function commitFields (spaceCheWorkSpacePage: SpaceCheWorkspacePage, username: string, emailAddress: string) {
  await spaceCheWorkSpacePage.cheProfileGroup.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferences.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesEditor.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesGit.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesGitName.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesGitName.clear();
  await spaceCheWorkSpacePage.chePreferencesGitName.sendKeys(username);
  await spaceCheWorkSpacePage.chePreferencesGitEmail.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesGitEmail.clear();
  await spaceCheWorkSpacePage.chePreferencesGitEmail.sendKeys(emailAddress);
  await spaceCheWorkSpacePage.chePreferencesStoreChanges.clickWhenReady();
  await spaceCheWorkSpacePage.chePreferencesClose.clickWhenReady();
}

});
