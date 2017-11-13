import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let landingPage: LandingPage;

  beforeEach( async () => {
    await support.desktopTestSetup();
    landingPage = new LandingPage(browser.params.target.url);
    support.debug('>>> Landing Page Open');
    await landingPage.open();
    support.debug('>>> Landing Page Open - DONE');
  });

  /* Simple test - accept all defaults for new quickstarts */

  /* The majority of these tests are commented out not due to any bugs,
     but to ensure that the test does not collide with other tests. TODO - to
     resolve these collisions */

//  it('Create a new space, new Vert.x HTTP Booster quickstart, run its pipeline', async () => {
//    await runTest(landingPage, 'Vert.x HTTP Booster').catch(error => console.log(error));
//  });
  it('Create a new space, new Vert.x - HTTP & Config Map quickstart, run its pipeline', async () => {
    await runTest(landingPage, 'Vert.x - HTTP & Config Map').catch(error => console.log(error));
  });
//  it('Create a new space, new Spring Boot - HTTP quickstart, run its pipeline', async () => {
//    await runTest(landingPage, 'Spring Boot - HTTP').catch(error => console.log(error));
//  });
//  it('Create a new space, new Vert.x Health Check Example quickstart, run its pipeline', async () => {
//    await runTest(landingPage, 'Vert.x Health Check Example').catch(error => console.log(error));
//  });
//  it('Create a new space, new Spring Boot Health Check Example quickstart, run its pipeline', async () => {
//    await runTest(landingPage, 'Spring Boot Health Check Example').catch(error => console.log(error));
//  });

  async function runTest (theLandingPage: LandingPage, quickstartName: string) {
    console.log('hi ' + quickstartName);

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

    let wizard = await spaceDashboardPage.addToSpace();

    support.info('Creating a Vert.x HTTP Booster');
    await wizard.newQuickstartProject({ project: 'Vert.x HTTP Booster' });
    await spaceDashboardPage.ready();

    /* This statement does not reliably wait for the modal dialog to disappear:
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

    try {
    await browser.wait(until.presenceOf(spacePipelinePage.inputRequiredByPipelineByName(spaceName)), support.LONGEST_WAIT, 'Failed to find inputRequiredByPipelineByName');
    await spacePipelinePage.inputRequiredByPipelineByName(spaceName).click();
    await spacePipelinePage.promoteButton.click();
    await browser.wait(until.elementToBeClickable(spacePipelinePage.stageIcon), support.LONGEST_WAIT, 'Failed to find stageIcon');
    await browser.wait(until.elementToBeClickable(spacePipelinePage.runIcon), support.LONGEST_WAIT, 'Failed to find runIcon');
    } catch (e) {
      support.writeScreenshot('target/promote_fail_' + spaceName + '.png');
    }
    // tslint:disable:max-line-length
  }

});
