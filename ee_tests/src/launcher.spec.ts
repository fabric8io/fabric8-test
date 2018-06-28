import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as support from './support';
import { Quickstart } from './support/quickstart';

import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { FeatureLevelUtils } from './support/feature_level';
import { PageOpenMode } from './page_objects/base.page';
import { AddToSpaceDialog } from './page_objects/space_dashboard/add_to_space_dialog';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';
import { Button } from './ui';

describe('Creating a new quickstart in OSIO using ngx launcher', () => {
  let quickstart: Quickstart;
  let strategy: string;
  let spaceName: string;

  beforeAll(async () => {
    support.info('--- Before all ---');
    await support.desktopTestSetup();
    spaceName = support.newSpaceName();
    strategy = browser.params.release.strategy;
    quickstart = new Quickstart(browser.params.quickstart.name);
  });

  beforeEach(async () => {
    support.screenshotManager.nextTest();
  });

  afterEach(async () => {
    support.info('--- After each ---');
    await support.screenshotManager.writeScreenshot('afterEach');
  });

  afterAll(async () => {
    support.info('--- After all ---');
    if (browser.params.reset.environment === 'true') {
      try {
        support.info('--- Reset environment ---');
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
        await accountHomeInteractions.resetEnvironment();
      } catch (e) {
        await support.screenshotManager.writeScreenshot('resetEnvironment');
        throw e;
      }
    }
  });

  it('login', async () => {
    support.info('--- Login ---');
    let login = new support.LoginInteraction();
    await login.run();
  });

  it('feature_level', async () => {
    support.info('--- Check if feature level is set correctly ---');
    // FIXME: Uncomment once the Dependency editor is promoted to beta.
    // let featureLevel = await FeatureLevelUtils.getRealFeatureLevel();
    // expect(featureLevel).toBe(FeatureLevelUtils.getConfiguredFeatureLevel(), 'feature level');
  });

  it('create_space_new_codebase', async () => {

    // WORKAROUND: For the internal features level.
    support.info('--- Create space with new codebase ' + spaceName + ' ---');
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpace(spaceName);
    let spaceDashboardPage = new SpaceDashboardPage(spaceName);
    await spaceDashboardPage.open(PageOpenMode.RefreshBrowser);
    await spaceDashboardPage.ready();
    if (FeatureLevelUtils.isInternal()) {
      support.info('Using [Create an application] button');
      let createAnApplicationButton = new Button(
        element(by.id('user-level-analyze-overview-dashboard-create-space-button')),
        'Create an Application'
      );
      await createAnApplicationButton.clickWhenReady();
    } else {
      support.info('Using [Add to Space] button');
      await spaceDashboardPage.addToSpaceButton.clickWhenReady();
    }
    support.info('Creating application from new codebase');
    let wizard = new AddToSpaceDialog(element(by.xpath('//f8-add-app-overlay')));
    await browser.wait(until.presenceOf(element(by.cssContainingText('div', 'Create an Application'))));
    await wizard.newQuickstartProjectByLauncher(quickstart.id, spaceName, strategy);
    support.info('Application created');
    // END-OF-WORKAROUND

    // TODO: replace the above WORKAROUND by the following once the Dependency editor is promoted to beta.
    // support.info('--- Create space with new codebase ' + spaceName + ' ---');
    // let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    // await accountHomeInteractions.createSpaceWithNewCodebase(spaceName, quickstart.name, strategy);
  });
});
