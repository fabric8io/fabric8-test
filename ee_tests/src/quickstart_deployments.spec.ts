import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { Quickstart } from './support/quickstart';
// tslint:disable-next-line:max-line-length
import { DeploymentsInteractions } from './interactions/deployments_interactions';
import { PipelinesInteractions } from './interactions/pipelines_interactions';
import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { StageRunPage } from './page_objects/space_stage_run.page';
// tslint:disable-next-line:max-line-length
import { SpaceDeploymentsPage, DeploymentStatus, DeployedApplication, DeployedApplicationEnvironment, Environment} from './page_objects/space_deployments.page';
import { spawn } from 'child_process';

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
    support.writeScreenshot('target/screenshots/pipeline_final_' + globalSpaceName + '.png');
    support.writePageSource('target/screenshots/pipeline_final_' + globalSpaceName + '.html');
    // support.info('\n ============ End of test reached, logging out ============ \n');
    // await dashboardPage.logout();
  });

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, run its pipeline', async () => {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    //    let strategy: string  = 'releaseStageApproveAndPromote';
    let strategy: string = browser.params.release.strategy;   // 'release';

    support.info('Creating quickstart: ' + quickstart.name);
    await wizard.newQuickstartProject({ project: quickstart.name, strategy });
    await spaceDashboardPage.ready();

    await browser.sleep(5000);

    let pipelineInteractions = PipelinesInteractions.create(strategy, spaceName, spaceDashboardPage);
    await pipelineInteractions.showPipelinesScreen();
    await pipelineInteractions.waitToFinish();

    support.writeScreenshot('target/screenshots/pipeline_icons_' + spaceName + '.png');

    await browser.sleep(5000);

    // tslint:disable-next-line:max-line-length
    let deploymentsInteractions: DeploymentsInteractions = DeploymentsInteractions.create(strategy, spaceName);
    await deploymentsInteractions.showDeploymentsScreen();
    let application = await deploymentsInteractions.verifyApplication();
    await deploymentsInteractions.verifyEnvironments(application);
    await deploymentsInteractions.verifyResourceUsage();

    support.writeScreenshot('target/screenshots/pipeline_deployments_' + spaceName + '.png');
    support.writePageSource('target/screenshots/pipeline_deployments_' + spaceName + '.html');
  });
});
