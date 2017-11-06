import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let landingPage: LandingPage;

  beforeEach( async () => {
    support.desktopTestSetup();
    landingPage = new LandingPage(browser.params.target.url);
    support.debug('>>> Landing Page Open');
    await landingPage.open();
    support.debug('>>> Landing Page Open - DONE');
  });

  /* Simple test - accept all defaults for a new quickstart */
  it('Create a new space, new quickstart, run its pipeline', async () => {
    support.debug('>>> starting test; loginPage');
    let loginPage = await landingPage.gotoLoginPage();
    support.debug('>>> back from gotoLoginPage');

    let url = browser.params.target.url;
    let { user, password } = browser.params.login;
    let dashboardPage = await loginPage.login(user, password);

    let spaceName = support.newSpaceName();
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let currentUrl = await browser.getCurrentUrl();
    support.debug ('>>> browser is URL: ' + currentUrl);

    let expectedUrl = support.joinURIPath(url, user, spaceName);
    expect(browser.getCurrentUrl()).toEqual(expectedUrl);

    support.info('EE test - new space URL:', currentUrl);

    await spaceDashboardPage.primaryAddToSpaceButton.clickWhenReady();
    await spaceDashboardPage.technologyStack.clickWhenReady();
    await spaceDashboardPage.quickStartNextButton2.clickWhenReady();
    await spaceDashboardPage.quickStartNextButton2.clickWhenReady();
    await spaceDashboardPage.quickStartNextButton2.clickWhenReady();
    await spaceDashboardPage.quickStartFinishButton2.clickWhenReady();
    await spaceDashboardPage.quickStartOkButton.clickWhenReady();

    /* Remove this direct navigation to the pipeline page URL by navigating through the UI.
       When the modal dialog through which the user creates a new quickstart is exited, there
       is a delay before the "pipelines" link can be clicked. Protractor sees the link as
       being clickable - but it is displayed "under" the modal dialog.

       This statement does not reliably wait for the modal dialog to disappear:
       await browser.wait(until.not(until.visibilityOf(spaceDashboardPage.modalFade)), support.LONGEST_WAIT);

       The above statement fails with this error: Failed: unknown error: Element <a id="spacehome-pipelines-title"
       href="/username/spaceName/create/pipelines">...</a> is not clickable at point (725, 667). Other element would
       receive the click: <modal-container class="modal fade" role="dialog" tabindex="-1" style="display:
       block;">...</modal-container>

       The only reliable way to avoid this is a sleep statement: await browser.sleep(5000);
       In order to avoid using a sleep statement, the test navigates to the pipeline page URL */
    await browser.sleep(5000);

    // tslint:disable:max-line-length
    await browser.wait(until.elementToBeClickable(spaceDashboardPage.pipelinesSectionTitle), support.LONGEST_WAIT, 'Failed to find pipelinesSectionTitle');
    await spaceDashboardPage.pipelinesSectionTitle.click();
    let spacePipelinePage = new SpacePipelinePage();

    await browser.wait(until.presenceOf(spacePipelinePage.pipelineByName(spaceName)), support.LONGEST_WAIT, 'Failed to find pipelinesByNamee');

    /* Verify that only (1) new matching pipeline is created */
    expect(await spacePipelinePage.allPipelineByName(spaceName).count()).toBe(1);

    /* Save the page output to stdout for logging purposes */
    let pipelineText = await spacePipelinePage.pipelinesPage.getText();
    support.debug('Pipelines page contents = ' + pipelineText);

    /* Find and click the 'promote' button */
    await until.elementToBeClickable(spacePipelinePage.pipelineByName(spaceName));
    await browser.wait(until.presenceOf(spacePipelinePage.inputRequiredByPipelineByName(spaceName)), support.LONGEST_WAIT, 'Failed to find inputRequiredByPipelineByName');
    await spacePipelinePage.inputRequiredByPipelineByName(spaceName).click();

    let png = await browser.takeScreenshot();
    support.writeScreenShot(png, 'promote.png');

    await spacePipelinePage.promoteButton.click();
    await browser.wait(until.elementToBeClickable(spacePipelinePage.stageIcon), support.LONGEST_WAIT, 'Failed to find stageIcon');
    await browser.wait(until.elementToBeClickable(spacePipelinePage.runIcon), support.LONGEST_WAIT, 'Failed to find runIcon');

    // tslint:disable:max-line-length

  });

});
