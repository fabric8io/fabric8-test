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
import { info } from '../support';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { LauncherRuntime } from '../support/launcher_runtime';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

describe('Run the project from the Che menu:', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_run_project_success.png');
    await dashboardPage.openInBrowser();
    await dashboardPage.logout();
  });

  it('Login, Open Che workspace, Run booster by the Run button, Open booster URL, logout', async () => {

    let spaceName = support.currentSpaceName();
    let cheWorkspaceUrl = support.currentCheWorkspaceUrl();

    /* Open Che workspace */
    await browser.get(cheWorkspaceUrl);
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);
    await spaceCheWorkSpacePage.bottomPanelTerminal.ready();

    await spaceCheWorkSpacePage.mainMenuRunDropDown.clickWhenReady();
    await spaceCheWorkSpacePage.mainMenuRunButtonRunSelection.clickWhenReady();

    let quickstart = new Quickstart(browser.params.quickstart.name);

    let quickstartStartedTerminal = 'n/a';

    switch (quickstart.runtime.id) {
      case LauncherRuntime.VERTX:
        quickstartStartedTerminal = 'Succeeded in deploying verticle';
        break;
      case LauncherRuntime.SPRING_BOOT:
        quickstartStartedTerminal = 'Setting the server\'s publish address to be';
        break;
      case LauncherRuntime.NODE_JS:
        // TODO: implement
        // quickstartStartedTerminal = '';
        break;
      case LauncherRuntime.WILDFLY_SWARM:
        // TODO: implement
        // quickstartStartedTerminal = '';
        break;
      default:
    }

    await spaceCheWorkSpacePage.debugInfoPanel.ready();
    support.info('Wait for the app to start up...');
    await browser.wait(
      until.textToBePresentInElement(spaceCheWorkSpacePage.debugInfoPanel, quickstartStartedTerminal),
      support.LONGER_WAIT
    );
    support.info('The application has started!');

    let appUrlLink = new Button(
      element(by.xpath('//a[contains(@href,\'openshiftapps.com\')]')),
      'Booster preview Link'
    );
    let appUrl = await appUrlLink.getAttribute('href');

    support.info('Open Application URL: ' + appUrl);

    await appUrlLink.clickWhenReady();

    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(support.windowCount(2), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/booster_run_project_che_page_' + spaceName + '.png');
    await browser.switchTo().window(handles[1]);
    support.writeScreenshot('target/screenshots/booster_run_project_app_page_' + spaceName + '.png');
    await expect(
      await browser.element(by.xpath('//*[contains(text(),\'Application is not available\')]')).isPresent()
    ).toBeFalsy();

    await browser.switchTo().window(handles[0]);
  });
});
