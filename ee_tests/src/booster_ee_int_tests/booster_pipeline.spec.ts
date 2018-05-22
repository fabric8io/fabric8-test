import { browser, element, by, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { TextInput, Button } from '../ui';
import * as ui from '../ui';

import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { StageRunPage } from '../page_objects/space_stage_run.page';
import { info } from '../support';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

describe('Verify the completion of the build pipeline:', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_pipeline_success.png');
    await dashboardPage.logout();
  });

  it('Login, test deployment to stage and run, logout', async () => {
    let spaceName = support.currentSpaceName();
    let repoName = support.currentRepoName();
    let spaceDashboardPage = new SpaceDashboardPage(spaceName);
    await spaceDashboardPage.openInBrowser();
    await spaceDashboardPage.pipelinesSectionTitle.clickWhenReady(support.LONGER_WAIT);
    support.debug('Accessed pipeline page');

    let spacePipelinePage = new SpacePipelinePage();
    globalSpacePipelinePage = spacePipelinePage;

    let pipelineByName = new Button(spacePipelinePage.pipelineByName(repoName), 'Pipeline By Name');

    support.debug('Looking for the pipeline name');
    await pipelineByName.untilPresent(support.LONGER_WAIT);

    /* Verify that only (1) new matching pipeline is found */
    support.debug('Verifying that only 1 pipeline is found with a matching name');
    expect(await spacePipelinePage.allPipelineByName(repoName).count()).toBe(1);

    /* Find the pipeline name */
    await pipelineByName.untilClickable(support.LONGER_WAIT);

    /* Promote to both stage and run - build has completed - if inputRequired is not present, build has failed */
    support.debug('Verifying that the promote dialog is opened');
    let inputRequired = new Button(spacePipelinePage.inputRequiredByPipelineByName(repoName), 'InputRequired button');

    await inputRequired.clickWhenReady(support.LONGEST_WAIT);
    await spacePipelinePage.promoteButton.clickWhenReady(support.LONGER_WAIT);
    support.writeScreenshot('target/screenshots/pipeline_promote_' + spaceName + '.png');

    /* Verify stage and run icons are present - these will timeout and cause failures if missing */
    await spacePipelinePage.stageIcon.untilClickable(support.LONGEST_WAIT);
    await spacePipelinePage.runIcon.untilClickable(support.LONGEST_WAIT);

    support.writeScreenshot('target/screenshots/pipeline_icons_' + spaceName + '.png');

    // TODO - Replace this necessary delay with a better approach - perhaps
    // multiple attempts to access the staged app?
    await browser.sleep(30000);

    /* Go to the application stage page */
    await spacePipelinePage.stageIcon.clickWhenReady(support.LONGEST_WAIT);

    /* A new browser window is opened when the stage page opens - switch to that new window */
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(windowCount(2), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);

    /* Switch to the stage deployment page */
    await browser.switchTo().window(handles[1]);

    let invokeButton = new ui.Button($('#invoke'), 'Invoke Button');
    let stageOutput = await element(by.id('greeting-result')).getText();
    await invokeButton.clickWhenReady(support.DEFAULT_WAIT);

    // TODO - Replace thie sleep statement
    browser.sleep(3000);
    support.writeScreenshot('target/screenshots/boosterstageSuccessful.png');

    /* Save the the output of the application into a variable */
    let expectedOutput = '{"content":"Hello, World!"}';

    /* Check if the application output matches the expected output */
    browser.wait(until.textToBePresentInElementValue(
      element(by.id('greeting-result')), expectedOutput), support.DEFAULT_WAIT);

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);

    /* Switch to the run deployment page */
    await spacePipelinePage.runIcon.clickWhenReady(support.LONGEST_WAIT);
    await browser.switchTo().window(handles[1]);

    await invokeButton.clickWhenReady(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/boosterrunSuccessful.png');
    browser.wait(until.textToBePresentInElementValue(
      element(by.id('greeting-result')), expectedOutput), support.DEFAULT_WAIT);

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

});
