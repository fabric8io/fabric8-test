import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';
import { BuildStatus } from './support/build_status';
import { Quickstart } from './support/quickstart';
import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
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
    // await support.dumpLog2(globalSpacePipelinePage, globalSpaceName);
    support.writeScreenshot('target/screenshots/pipeline_analytic_' + globalSpaceName + '.png');
    support.writePageSource('target/screenshots/pipeline_analytic_' + globalSpaceName + '.html');
    // support.info('\n ============ End of test reached, logging out ============ \n');
    // await dashboardPage.logout();
  });

  /* Simple test - accept all defaults for new quickstarts */

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    support.info('Creating quickstart: ' + quickstart.name);
    await wizard.newQuickstartProject({ project: quickstart.name });
    await spaceDashboardPage.ready();

    /* This statement does not reliably wait for the modal dialog to disappear:
       await browser.wait(until.not(until.visibilityOf(spaceDashboardPage.modalFade)), support.LONGEST_WAIT);

       The above statement fails with this error: Failed: unknown error: Element <a id="spacehome-pipelines-title"
       href="/username/spaceName/create/pipelines">...</a> is not clickable at point (725, 667). Other element would
       receive the click: <modal-container class="modal fade" role="dialog" tabindex="-1" style="display:
       block;">...</modal-container>

       The only reliable way to avoid this is a sleep statement: await browser.sleep(5000); */
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

    await dashboardPage.header.recentItemsDropdown.clickWhenReady();
    await dashboardPage.header.recentItemsDropdown.accountHomeItem.clickWhenReady();
    await dashboardPage.header.recentItemsDropdown.clickWhenReady();
    await dashboardPage.recentSpaceByName(spaceName).click();
    await dashboardPage.ready();

    let codebasesCard = await spaceDashboardPage.getCodebaseCard();
    expect(await codebasesCard.getCount()).toBe(1, 'number of codebases on page');

    let githubName = browser.params.github.username;
    let codebases = await codebasesCard.getCodebases();
    expect(codebases.length).toBe(1, 'number of codebases');
    expect(codebases[0]).toBe('https://github.com/' + githubName + '/' + spaceName);

    let workItemsCard = await spaceDashboardPage.getWorkItemsCard();
    expect(await workItemsCard.getCount()).toBe(0, 'number of workitems on page');

    let pipelinesCard = await spaceDashboardPage.getPipelinesCard();
    expect(await pipelinesCard.getCount()).toBe(1, 'number of pipelines on page');

    let pipelines = await pipelinesCard.getPipelines();
    expect(pipelines.length).toBe(1, 'number of pipelines');
    expect(pipelines[0].getApplication()).toBe(spaceName, 'application name on pipeline');
    expect(pipelines[0].getStatus()).toBe(BuildStatus.COMPLETE, 'build status');
    expect(pipelines[0].getBuildNumber()).toBe(1, 'build number');

    let deploymentsCard = await spaceDashboardPage.getDeploymentsCard();
    // expect(await deploymentsCard.getCount()).toBe(1, 'number of deployments on page');

    let applications = await deploymentsCard.getApplications();
    expect(applications.length).toBe(1, 'number of applications');
    expect(await applications[0].getName()).toBe(spaceName, 'deployed application name');
    expect(await applications[0].getStageVersion()).toBe('1.0.1', 'deployed application stage version');
    expect(await applications[0].getRunVersion()).toBe('1.0.1', 'deployed application run version');

    let analyticsCard = await spaceDashboardPage.getAnalyticsCard();
    let totalCount = await analyticsCard.getTotalDependenciesCount();
    let analyzedCount = await analyticsCard.getAnalyzedDependenciesCount();
    let unknownCount = await analyticsCard.getUnknownDependenciesCount();

    expect(totalCount).toBeGreaterThanOrEqual(0, 'total dependencies count');
    expect(analyzedCount).toBeGreaterThanOrEqual(0, 'total analyzed count');
    expect(unknownCount).toBeGreaterThanOrEqual(0, 'total unknown count');
    expect(totalCount).toBe(analyzedCount + unknownCount, 'total = analyzed + unknown');
  });
});
