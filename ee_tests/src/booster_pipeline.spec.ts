import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { Quickstart } from './support/quickstart';
import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline_tab.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    await browser.sleep(support.DEFAULT_WAIT);
    await support.dumpLog2(globalSpacePipelinePage, globalSpaceName);
    support.writeScreenshot('target/screenshots/pipeline_final_' + globalSpaceName + '.png');
    support.info('\n ============ End of test reached, logging out ============ \n');
    // await dashboardPage.logout();
  });

  // tslint:disable:max-line-length

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {

    await support.info('Quickstart name: ' + browser.params.quickstart.name);

    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    //  - do an import of the old space
    await wizard.importExistingCode({
//      org: 'WildFly Swarm Boosters for openshift.io',
      org: 'fill in your org name here',
      repositories: [browser.params.quickstart.name]
    });
    await spaceDashboardPage.open();

    browser.sleep(60000);

    await spaceDashboardPage.ready();

    /* This statement does not reliably wait for the modal dialog to disappear:
       await browser.wait(until.not(until.visibilityOf(spaceDashboardPage.modalFade)), support.LONGEST_WAIT);

       The above statement fails with this error: Failed: unknown error: Element <a id="spacehome-pipelines-title"
       href="/username/spaceName/create/pipelines">...</a> is not clickable at point (725, 667). Other element would
       receive the click: <modal-container class="modal fade" role="dialog" tabindex="-1" style="display:
       block;">...</modal-container>

       The only reliable way to avoid this is a sleep statement: await browser.sleep(5000);
       TODO remove the sleep statement */
    await browser.sleep(5000);

    // tslint:disable:max-line-length

    /* Open the pipeline page, select the pipeline by name */
    await spaceDashboardPage.pipelinesSectionTitle.clickWhenReady(support.LONGER_WAIT);
    support.debug('Accessed pipeline page');

    let spacePipelinePage = new SpacePipelinePage();
    globalSpacePipelinePage = spacePipelinePage;

    let pipelineByName = new Button(spacePipelinePage.pipelineByName(spaceName), 'Pipeline By Name');

    support.debug('Looking for the pipeline name');
    await pipelineByName.untilPresent(support.LONGER_WAIT);

    /* Verify that only (1) new matching pipeline is found */
    support.debug('Verifying that only 1 pipeline is found with a matching name');
    expect(await spacePipelinePage.allPipelineByName(spaceName).count()).toBe(1);

    /* Save the pipeline page output to stdout for logging purposes */
    let pipelineText = await spacePipelinePage.pipelinesPage.getText();
    support.debug('Pipelines page contents = ' + pipelineText);

    /* Find the pipeline name */
    await pipelineByName.untilClickable(support.LONGER_WAIT);

    /* If the build log link is not viewable - the build failed to start */
    support.debug('Verifying that the build has started - check https://github.com/openshiftio/openshift.io/issues/1194');
    await spacePipelinePage.viewLog.untilClickable(support.LONGEST_WAIT);
    expect(spacePipelinePage.viewLog.isDisplayed()).toBe(true);

    /* Promote to both stage and run - build has completed - if inputRequired is not present, build has failed */
    support.debug('Verifying that the promote dialog is opened');
    let inputRequired = new Button(spacePipelinePage.inputRequiredByPipelineByName(spaceName), 'InputRequired button');

    await inputRequired.clickWhenReady(support.LONGEST_WAIT);
    await spacePipelinePage.promoteButton.clickWhenReady(support.LONGER_WAIT);
    support.writeScreenshot('target/screenshots/pipeline_promote_' + spaceName + '.png');

    /* Verify stage and run icons are present - these will timeout and cause failures if missing */
    await spacePipelinePage.stageIcon.untilClickable(support.LONGEST_WAIT);
    await spacePipelinePage.runIcon.untilClickable(support.LONGEST_WAIT);

    support.writeScreenshot('target/screenshots/pipeline_icons_' + spaceName + '.png');

    // TODO - Error conditions to trap
    // 1) Jenkins build log - find errors if the test fails
    // 2) Jenkins pod log - find errors if the test fails
    // 3) Presence of build errors in UI
    // 4) Follow the stage and run links */
  });

  // tslint:enable:max-line-length

});
