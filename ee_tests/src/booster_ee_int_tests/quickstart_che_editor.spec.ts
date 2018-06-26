import { protractor, browser, Key, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { TextInput, Button } from '../ui';
import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpaceChePage } from '../page_objects/space_che.page';
import { SpaceCheWorkspacePage } from '../page_objects/space_cheworkspace.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';

let globalSpaceName: string;

/* Modified test source code */
let fileText: string = `package io.openshift.booster;

    import io.vertx.core.Vertx;
    import io.vertx.ext.unit.Async;
    import io.vertx.ext.unit.TestContext;
    import io.vertx.ext.unit.junit.VertxUnitRunner;
    import io.vertx.ext.web.client.WebClient;
    import org.junit.After;
    import org.junit.Before;
    import org.junit.Test;
    import org.junit.runner.RunWith;

    import static io.openshift.booster.HttpApplication.template;
    import static org.assertj.core.api.Assertions.assertThat;

    @RunWith(VertxUnitRunner.class)
    public class HttpApplicationTest {

        private Vertx vertx;
        private WebClient client;

        @Before
        public void before(TestContext context) {
            vertx = Vertx.vertx();
            vertx.exceptionHandler(context.exceptionHandler());
            vertx.deployVerticle(HttpApplication.class.getName(), context.asyncAssertSuccess());
            client = WebClient.create(vertx);
        }

        @After
        public void after(TestContext context) {
            vertx.close(context.asyncAssertSuccess());
        }

        @Test
        public void callGreetingTest(TestContext context) {
            // Send a request and get a response
            Async async = context.async();
            client.get(8080, "localhost", "/api/greeting")
                .send(resp -> {
                    context.assertTrue(resp.succeeded());
                    context.assertEquals(resp.result().statusCode(), 200);
                    String content = resp.result().bodyAsJsonObject().getString("content");
                    context.assertEquals(content, String.format(template, "Earth"));
                    async.complete();
                });
        }

        @Test
        public void callGreetingWithParamTest(TestContext context) {
            // Send a request and get a response
            Async async = context.async();
            client.get(8080, "localhost", "/api/greeting?name=Charles")
                .send(resp -> {
                    context.assertTrue(resp.succeeded());
                    context.assertEquals(resp.result().statusCode(), 200);
                    String content = resp.result().bodyAsJsonObject().getString("content");
                    context.assertEquals(content, String.format(template, "Charles"));
                    async.complete();
                });
        }

    }
`;

/* Tests to verify Che in OSIO */

describe('Creating new Che workspace and edit in OSIO', () => {
  let dashboardPage: MainDashboardPage;

  beforeEach(async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    await login.run();
    dashboardPage = new MainDashboardPage();

    let userProfilePage = await dashboardPage.gotoUserProfile();
    support.debug(">>> Go to user's Profile Page - OK");
    support.debug('>>> Go to Edit Profile Page');
    let editProfilePage = await userProfilePage.gotoEditProfile();
    support.debug('>>> Go to Edit Profile Page - OK');
    support.debug('>>> Go to Reset Env Page');
    let cleanupEnvPage = await editProfilePage.gotoResetEnvironment();
    support.debug('>>> Go to Reset Env Page - OK');

    await cleanupEnvPage.cleanup(browser.params.login.user);
  });

  afterEach( async () => {
    support.writeScreenshot('target/screenshots/che_final_' + globalSpaceName + '.png');
    support.info('\n ============ End of test reached ============ \n');
    await dashboardPage.logout();
  });

  /* Accept all defaults for new quickstarts */

    // tslint:disable:max-line-length
  it('Create a new space, new ' + browser.params.quickstart.name + ' quickstart, create Che workspace, run maven in the workspace', async () => {
    let quickstart = new Quickstart(browser.params.quickstart.name);
    let spaceName = support.newSpaceName();
    globalSpaceName = spaceName;
    let spaceDashboardPage = await dashboardPage.createNewSpace(spaceName);

    let wizard = await spaceDashboardPage.addToSpace();

    support.info('Creating quickstart: ' + quickstart.name);
    await wizard.newQuickstartProject({ project: quickstart.name });
    await spaceDashboardPage.ready();

    /* Open Che display page */
    await spaceDashboardPage.codebasesSectionTitle.clickWhenReady();

    let spaceChePage = new SpaceChePage();
    await spaceChePage.createCodebase.clickWhenReady(support.LONGEST_WAIT);

    /* A new browser window is opened when Che opens - switch to that new window now */
    let handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs before = ' + handles.length);
    await browser.wait(windowCount(2), support.DEFAULT_WAIT);
    handles = await browser.getAllWindowHandles();
    support.debug('Number of browser tabs after = ' + handles.length);
    support.writeScreenshot('target/screenshots/che_workspace_parta_' + spaceName + '.png');

    /* Switch to the Che browser window */
    await browser.switchTo().window(handles[1]);
    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    support.writeScreenshot('target/screenshots/che_workspace_partb_' + spaceName + '.png');

    /* Find the project */
    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    support.writeScreenshot('target/screenshots/che_workspace_partc_' + spaceName + '.png');
    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    // **********************************************************************
    /* Edit the source file */

    /* Locate the file in the project tree */

    try {
      await spaceCheWorkSpacePage.walkTree(spaceName, '\/src', '\/test', '\/java', '\/io', '\/openshift', '\/booster');
      await browser.wait(until.visibilityOf(spaceCheWorkSpacePage.cheFileName('HttpApplicationTest.java')), support.DEFAULT_WAIT);
    } catch (e) {
        support.info('Exception in Che project directory tree = ' + e);
    }

    let theText = await spaceCheWorkSpacePage.cheFileName('HttpApplicationTest.java').getText();
    support.info ('filename = ' + theText);
    await spaceCheWorkSpacePage.cheFileName('HttpApplicationTest.java').clickWhenReady();

    /* Right click on file name */
    await browser.actions().click(spaceCheWorkSpacePage.cheFileName('HttpApplicationTest.java'), protractor.Button.RIGHT).perform();

    /* Open the file edit menu */
    await spaceCheWorkSpacePage.cheContextMenuEditFile.clickWhenReady();

    try {
      /* Disable paran and braces - to avoid intorducing extra characters */
      await changePreferences(spaceCheWorkSpacePage, 'disable');

 //     await browser.sleep(30000);

      await spaceCheWorkSpacePage.cheText.sendKeys('text was', Key.CONTROL, 'a', Key.NULL, fileText);

      /* Re-enable preferences */
      await changePreferences(spaceCheWorkSpacePage, 'enable');

    } catch (e) {
     support.info('Exception in writing to file in Che = ' + e);
    }

    support.writeScreenshot('target/screenshots/che_workspace_part_edit_' + spaceName + '.png');

    /* Switch back to the OSIO browser window */
    await browser.switchTo().window(handles[0]);
  });

  /* Required to switchto/from the Che window */
  function windowCount (count: number) {
    return function () {
        return browser.getAllWindowHandles().then(function (handles) {
            return handles.length === count;
        });
    };
  }

  /* Enable or disable automatic parans and braces in Che editor */
  async function changePreferences (spaceCheWorkSpacePage: SpaceCheWorkspacePage, theChange: string) {

     try {

    /* Disable the auro parens/braces before importing the modified test source code */
    await spaceCheWorkSpacePage.cheProfileGroup.clickWhenReady();
    await spaceCheWorkSpacePage.chePreferences.clickWhenReady();
    await spaceCheWorkSpacePage.chePreferencesEditor.clickWhenReady();

    if (theChange === 'disable') {
      let autoParanEnabled: boolean = await spaceCheWorkSpacePage.chePreferencesAutopairParen.isSelected();
      if (autoParanEnabled) {
        support.info('Disabling enabled auto pair paren');
        await spaceCheWorkSpacePage.chePreferencesAutopairParen.clickWhenReady();
        await spaceCheWorkSpacePage.chePreferencesStoreChanges.clickWhenReady();
      }
      let autoBracesEnabled: boolean = await spaceCheWorkSpacePage.chePreferencesAutoBraces.isSelected();
      if (autoBracesEnabled) {
        support.info('Disabling enabled auto braces');
        await spaceCheWorkSpacePage.chePreferencesAutoBraces.clickWhenReady();
        await spaceCheWorkSpacePage.chePreferencesStoreChanges.clickWhenReady();
      }
    }

    if (theChange === 'enable') {
        let autoParanEnabled: boolean = await spaceCheWorkSpacePage.chePreferencesAutopairParen.isSelected();
        if (!autoParanEnabled) {
          support.info('Enabling disabled auto pair paren');
          await spaceCheWorkSpacePage.chePreferencesAutopairParen.clickWhenReady();
          await spaceCheWorkSpacePage.chePreferencesStoreChanges.clickWhenReady();
        }
        let autoBracesEnabled: boolean = await spaceCheWorkSpacePage.chePreferencesAutoBraces.isSelected();
        if (!autoBracesEnabled) {
          support.info('Enabling disabled auto braces');
          await spaceCheWorkSpacePage.chePreferencesAutoBraces.clickWhenReady();
          await spaceCheWorkSpacePage.chePreferencesStoreChanges.clickWhenReady();
        }
      }

    await spaceCheWorkSpacePage.chePreferencesClose.clickWhenReady();

    } catch (e) {
      support.info('Exception in Che Preferences saving values Panel = ' + e);
    }

  }

});
