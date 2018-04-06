import { browser, element, by, ExpectedConditions as until, $, $$, ProtractorBrowser } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { BuildStatus } from './support/build_status';
import { Quickstart } from './support/quickstart';
import { DeploymentsInteractions } from './interactions/deployments_interactions';
import { PipelinesInteractions } from './interactions/pipelines_interactions';
import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { SpaceChePage } from './page_objects/space_che.page';
import { SpaceCheWorkspacePage } from './page_objects/space_cheworkspace.page';
import { Button } from './ui';

describe('Main E2E test suite', () => {
  let dashboardPage: MainDashboardPage;
  let spaceDashboardPage: SpaceDashboardPage;
  let quickstart: Quickstart;
  let strategy: string;
  let spaceName: string;
  let index: number = 1;

  beforeAll(async () => {
    support.info('--- Before all ---');
    await support.desktopTestSetup();
    spaceName = support.newSpaceName();
    strategy = browser.params.release.strategy;
    quickstart = new Quickstart(browser.params.quickstart.name);
  });

  afterEach(async () => {
    support.info('--- After each ---');
    support.writeScreenshot('target/screenshots/' + spaceName + '_' + index + '.png');
    support.writePageSource('target/screenshots/' + spaceName + '_' + index + '.html');
    index++;
  });

  it('Login', async () => {
    support.info('--- Login ---');
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  it('Create space ', async () => {
    support.info('--- Create space ' + spaceName + ' ---');
    spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);
  });

  it('Create quickstart', async () => {
    support.info('--- Create quickstart ' + quickstart.name + ' ---');
    let wizard = await spaceDashboardPage.addToSpace();
    await wizard.newQuickstartProject({ project: quickstart.name, strategy });
    await spaceDashboardPage.ready();
  });

  it('Run che', async () => {
    support.info('--- Run che workspace ' + quickstart.name + ' ---');
    await spaceDashboardPage.codebasesSectionTitle.clickWhenReady();

    let spaceChePage = new SpaceChePage();
    await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

    /* A new browser window is opened when Che opens - switch to that new window now */
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);

    /* TODO - Need to create a query to look for/wait for the 2nd browser window and remove the sleep statement */
    await browser.sleep(60000);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/che_workspace_parta_' + spaceName + '.png');

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[1]);

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    // await support.debug (spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText());
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);
  });

  it('Run pipeline', async () => {
    support.info('--- Run pipeline ---');
    await browser.sleep(5000);
    await dashboardPage.header.recentItemsDropdown.clickWhenReady();
    await dashboardPage.header.recentItemsDropdown.accountHomeItem.clickWhenReady();
    await dashboardPage.header.recentItemsDropdown.clickWhenReady();
    await dashboardPage.recentSpaceByName(spaceName).click();
    await dashboardPage.ready();
    await browser.sleep(5000);

    let pipelineInteractions = PipelinesInteractions.create(strategy, spaceName, spaceDashboardPage);
    await pipelineInteractions.showPipelinesScreen();
    let pipeline = await pipelineInteractions.verifyBuildInfo();
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('Verify deployment', async () => {
    support.info('--- Verify deployments ---');
    await browser.sleep(5000);

    // tslint:disable-next-line:max-line-length
    let deploymentsInteractions: DeploymentsInteractions = DeploymentsInteractions.create(strategy, spaceName);
    await deploymentsInteractions.showDeploymentsScreen();
    let application = await deploymentsInteractions.verifyApplication();
    await deploymentsInteractions.verifyEnvironments(application);
    await deploymentsInteractions.verifyResourceUsage();
  });

  it('Verify dashboard', async () => {
    support.info('--- Verify dashboard ---');

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
    // expect(await applications[0].getStageVersion()).toBe('1.0.1', 'deployed application stage version');
    // expect(await applications[0].getRunVersion()).toBe('1.0.1', 'deployed application run version');

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
