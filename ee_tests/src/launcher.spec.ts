import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from './support';
import { Quickstart } from './support/quickstart';

import { TextInput, Button } from './ui';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { AddToSpaceDialog, NewImportExperienceDialog, LauncherSection, LauncherSetupAppPage } from './page_objects';
import { LauncherReleaseStrategy } from './support/launcher_release_strategy';
import { sleep } from './support';

let globalSpaceName: string;

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    dashboardPage = await login.run();
  });

  afterEach(async () => {
    support.info('\n ============ End of test reached, logging out ============ \n');
    await dashboardPage.openInBrowser();
    await dashboardPage.logout();
  });

  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart via ngx Launcher',
    async () => {
      let quickstart = new Quickstart(browser.params.quickstart.name);
      let spaceName = support.newSpaceName();
      let spaceDashboardPage = await dashboardPage.createNewSpaceByLauncher(spaceName);

      let wizard: AddToSpaceDialog = await spaceDashboardPage.addToSpace();
      let dialog: NewImportExperienceDialog = await wizard.openNewImportExperience();

      await dialog.projectName.clear();
      await dialog.projectName.sendKeys(spaceName);

      let launcher: LauncherSection = await dialog.selectCreateNewApplication();
      await launcher.ready();

      quickstart = new Quickstart(browser.params.quickstart.name);
      await launcher.selectRuntime(quickstart.runtime.name);
      await launcher.selectMission(quickstart.mission.name);
      await support.writeScreenshot('target/screenshots/launcher-runtime-and-mission-' + spaceName + '.png');
      await launcher.missionRuntimeContinueButton.clickWhenReady();

      let pipeline = new LauncherReleaseStrategy(browser.params.release.strategy);
      await launcher.selectPipeline(pipeline.name);
      await support.writeScreenshot('target/screenshots/launcher-pipeline-' + spaceName + '.png');
      await launcher.releaseStrategyContinueButton.clickWhenReady();

      await launcher.loginAndAuthorizeButton.clickWhenReady();
      // BEGIN: Workaround for the Github login
      support.info('Github Login workaround');
      let ghLogin = new TextInput($('#login_field'), 'GH Login');
      let ghPasswd = new TextInput($('#password'), 'GH Password');
      await ghLogin.ready();
      await ghPasswd.ready();
      await ghLogin.sendKeys(browser.params.github.username);
      await ghPasswd.sendKeys(browser.params.github.password);
      await ghPasswd.submit();
      // END: Workaround for the Github login
      await launcher.selectGithubOrganization(browser.params.github.username);
      await launcher.ghRepositoryText.sendKeys(spaceName);
      await support.writeScreenshot('target/screenshots/launcher-git-provider-' + spaceName + '.png');
      await launcher.gitProviderContinueButton.clickWhenReady();

      await launcher.summaryMission(quickstart.mission.name).isDisplayed();
      await launcher.summaryRuntime(quickstart.runtime.name).isDisplayed();

      await support.writeScreenshot('target/screenshots/launcher-summary-' + spaceName + '.png');

      let setupApplicationPage: LauncherSetupAppPage = await launcher.setUpApplication();
      await setupApplicationPage.ready();

      await setupApplicationPage.newProjectBoosterOkIcon('Creating your new GitHub repository').untilDisplayed();
      await setupApplicationPage.newProjectBoosterOkIcon('Pushing your customized Booster code into the repo')
        .untilDisplayed();
      await setupApplicationPage.newProjectBoosterOkIcon('Creating your project on OpenShift Online').untilDisplayed();
      await setupApplicationPage.newProjectBoosterOkIcon('Setting up your build pipeline').untilDisplayed();
      await setupApplicationPage.newProjectBoosterOkIcon('Configuring to trigger builds on Git pushes')
        .untilDisplayed();

      await support.writeScreenshot('target/screenshots/launcher-new-project-booster-created-' + spaceName + '.png');
    }
  );
});
