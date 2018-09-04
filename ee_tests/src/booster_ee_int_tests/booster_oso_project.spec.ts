import { browser, ExpectedConditions as until } from 'protractor';

import * as support from '../support';
import { Button } from '../ui/button';
import { LoginInteraction } from '../interactions/login_interactions';

import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { OsoDashboardPage } from '../page_objects/oso_dashboard.page';

describe('Access project in OSO:', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();
  });

  afterEach(async () => {
    support.writeScreenshot('target/screenshots/booster_oso_project_success.png');
    await dashboardPage.openInBrowser();
    await dashboardPage.logout();
  });

  it('Login, Open OpenShift Console, Copy Login Command, Open Che Workspace, Run oc commands, logout', async () => {
    // TODO: implement
    let spaceName = support.currentSpaceName();
    let spaceDashboardPage = new SpaceDashboardPage(spaceName);
    await spaceDashboardPage.openInBrowser();
    await (await spaceDashboardPage.getPipelinesCard()).openPipelinesPage();

    let spacePipelinePage = new SpacePipelinePage();

    let osoDashboardPage: OsoDashboardPage = await spacePipelinePage.openOpenshiftConsole();

    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(support.windowManager.windowCountCondition(2), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/booster_oso_project_openshift_console_' + spaceName + '.png');

    /* Switch to the OpenShift Console browser window */
    await browser.switchTo().window(handles[1]);

    await osoDashboardPage.ready();

    support.info('Getting OSO login command...');
    const loginCommand = await osoDashboardPage.copyLoginCommand();

    /* Open Che workspace */
    await browser.get(support.currentCheWorkspaceUrl());
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();

    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/booster_oso_project_che_workspace_a_' + spaceName + '.png');

    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);
    support.writeScreenshot('target/screenshots/booster_oso_project_che_workspace_b_' + spaceName + '.png');

    support.info('Open file');
    await spaceCheWorkSpacePage.walkTree(
      support.currentSpaceName()
    );
    let pomXml = spaceCheWorkSpacePage.cheFileName('pom.xml');
    await browser.wait(
      until.visibilityOf(pomXml),
      support.DEFAULT_WAIT
    );
    await pomXml.clickWhenReady();
    await browser.actions().doubleClick(pomXml).perform();
    await spaceCheWorkSpacePage.cheText.ready();

    await browser.wait(
      until.textToBePresentInElement(spaceCheWorkSpacePage.cheText, 'http://maven.apache.org/POM/4.0.0'),
      support.LONGER_WAIT
    );

    support.info('Run login command in terminal');
    /* Open the terminal window and execute command */
    await spaceCheWorkSpacePage.bottomPanelTerminalTab.clickWhenReady();
    await spaceCheWorkSpacePage.bottomPanelTerminal.clickWhenReady();
    await support.sleep(1000);
    await support.printTerminal(spaceCheWorkSpacePage, loginCommand);

    await browser.wait(
      until.textToBePresentInElement(spaceCheWorkSpacePage.bottomPanelTerminal, 'Using project '),
      support.LONGER_WAIT
    );

    await expect (spaceCheWorkSpacePage.bottomPanelTerminal.getText()).
      toContain(browser.params.oso.username + '-che');
    await expect (spaceCheWorkSpacePage.bottomPanelTerminal.getText()).
      toContain(browser.params.oso.username + '-jenkins');
    await expect (spaceCheWorkSpacePage.bottomPanelTerminal.getText()).
      toContain(browser.params.oso.username + '-run');
    await expect (spaceCheWorkSpacePage.bottomPanelTerminal.getText()).
      toContain(browser.params.oso.username + '-stage');

    await support.printTerminal(spaceCheWorkSpacePage, 'oc project ' + browser.params.oso.username + '-jenkins');

    await browser.wait(
      until.textToBePresentInElement(
        spaceCheWorkSpacePage.bottomPanelTerminal,
        'project "' + browser.params.oso.username + '-jenkins" on server'
      ),
      support.LONGER_WAIT
    );

    /* Switch to the back to original browser window */
    await browser.switchTo().window(handles[0]);
    await spacePipelinePage.ready();

  });

});
