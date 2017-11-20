import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';

import {
  MainDashboardPage,
  SpaceDashboardPage, SpacePipelinePage
} from './page_objects';

// Tests to verify the build pipeline

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach( async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  /* Simple test - accept all defaults for new quickstarts */

  /* The majority of these tests are commented out not due to any bugs,
     but to ensure that the test does not collide with other tests. TODO - to
     resolve these collisions */

  it('Create a new space, new Vert.x - HTTP & Config Map quickstart, run its pipeline', async () => {
    try {
      await runTest('Vert.x - HTTP & Config Map')
    } catch (e) {
      support.info('Error:', e);
    }
  });

  async function runTest (quickstartName: string) {

    let spaceName = support.newSpaceName();
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let currentUrl = await browser.getCurrentUrl();
    support.debug ('>>> browser is URL: ' + currentUrl);

    let url = browser.baseUrl;
    let user = browser.params.login.user;
    let expectedUrl = support.joinURIPath(url, user, spaceName);
    expect(browser.getCurrentUrl()).toEqual(expectedUrl);

    support.info('EE test - new space URL:', expectedUrl);

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
