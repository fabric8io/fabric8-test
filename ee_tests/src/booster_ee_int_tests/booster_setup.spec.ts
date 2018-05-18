import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { TextInput, Button } from '../ui';

import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { StageRunPage } from '../page_objects/space_stage_run.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { SpaceChePage } from '../page_objects/space_che.page';
import { CheWorkspace } from '../support';

import { DeploymentsInteractions, DeploymentsInteractionsFactory } from '../interactions/deployments_interactions';
import { PipelinesInteractions } from '../interactions/pipelines_interactions';
import { SpaceDashboardInteractions } from '../interactions/space_dashboard_interactions';
import { SpaceDashboardInteractionsFactory } from '../interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from '../interactions/account_home_interactions';
import { PageOpenMode } from '../..';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;
let strategy: string = browser.params.release.strategy;

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_setup_success.png');
    await dashboardPage.logout();
  });

  it('Reset Environment, create a new space, new ' + browser.params.quickstart.name + ' quickstart', async () => {
    // Reset Environment
    let userProfilePage = await dashboardPage.gotoUserProfile();
    support.debug(">>> Go to user's Profile Page - OK");
    support.debug('>>> Go to Edit Profile Page');
    let editProfilePage = await userProfilePage.gotoEditProfile();
    support.debug('>>> Go to Edit Profile Page - OK');
    support.debug('>>> Go to Reset Env Page');
    let cleanupEnvPage = await editProfilePage.gotoResetEnvironment();
    support.debug('>>> Go to Reset Env Page - OK');

    await cleanupEnvPage.cleanup(browser.params.login.user);

    // Create a space
    let spaceName = support.newSpaceName();
    support.info('--- Create space ' + spaceName + ' ---');
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpace(spaceName);

    // Create a QuickStart
    let quickstart = new Quickstart(browser.params.quickstart.name);
    support.info('--- Create quickstart ' + quickstart.name + ' ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await dashboardInteractions.createQuickstart(quickstart.name, strategy);

    // Create a Che workspace
    support.info('--- Run che workspace ' + quickstart.name + ' ---');
    dashboardInteractions = SpaceDashboardInteractionsFactory.create(spaceName);
    await dashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
    await dashboardInteractions.openCodebasesPage();

    let spaceChePage = new SpaceChePage();
    await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

    await support.switchToWindow(2, 1);

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    await support.debug (spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText());
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    let cheWorkspaceUrl = await browser.getCurrentUrl();
    await support.debug('Updating current Che workspace URL: ' + cheWorkspaceUrl);
    support.updateCheWorkspaceUrl(cheWorkspaceUrl);

    // Close Che Tab window
    await browser.close();

    /* Switch back to the OSIO browser window */
    await support.switchToWindow(1, 0);

  });

});
