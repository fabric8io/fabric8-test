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
import { SpaceChePage } from '../page_objects/space_che.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { AppPage } from '../page_objects/app.page';
import { PageOpenMode } from '../..';

let globalSpaceName: string;
let globalSpacePipelinePage: SpacePipelinePage;

describe('Build the project using Maven in the Che terminal window', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_build_maven_success.png');
    await dashboardPage.openInBrowser();
    await dashboardPage.logout();
  });

  it('Login, Open Che workspace, logout', async () => {
    let spaceName = support.currentSpaceName();
    /* Open Che page */
    await browser.get(support.currentCheWorkspaceUrl());

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();

    support.writeScreenshot('target/screenshots/booster_build_maven-che_workspace_a_' + spaceName + '.png');

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    await support.sleep(1000);

    /* Open the terminal window and execute command */
    await spaceCheWorkSpacePage.bottomPanelTerminalTab.clickWhenReady();
    await support.printTerminal(spaceCheWorkSpacePage, 'cd ' + spaceName);
    await support.printTerminal(spaceCheWorkSpacePage, 'mvn clean install -Popenshift,openshift-it');

    await browser.wait(
      until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelTerminal, 'BUILD'),
      support.LONGER_WAIT
    );
    support.info('The Maven build finished.');
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).toContain('BUILD SUCCESS');
    await expect(spaceCheWorkSpacePage.bottomPanelTerminal.getText()).not.toContain('BUILD FAILURE');
  });

  function windowCount(count: number) {
    return function () {
      return browser.getAllWindowHandles().then(function (handles) {
        return handles.length === count;
      });
    };
  }

});
