import { browser, element, by, ExpectedConditions as until, $, $$, ProtractorBrowser } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { Quickstart } from './support/quickstart';
// tslint:disable-next-line:max-line-length
import { DeploymentsInteractions } from './interactions/deployments_interactions';
import { PipelinesInteractions } from './interactions/pipelines_interactions';
import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
// tslint:disable-next-line:max-line-length
import { SpaceDeploymentsPage, DeploymentStatus, DeployedApplication, DeployedApplicationEnvironment, Environment} from './page_objects/space_deployments.page';

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

  it('Run pipeline', async () => {
    support.info('--- Run pipeline ---');
    await browser.sleep(5000);

    let pipelineInteractions = PipelinesInteractions.create(strategy, spaceName, spaceDashboardPage);
    await pipelineInteractions.showPipelinesScreen();
    await pipelineInteractions.waitToFinish();
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
});
