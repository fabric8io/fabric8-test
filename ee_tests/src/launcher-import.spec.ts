import { browser } from 'protractor';

import * as logger from './support/logging';
import { screenshotManager } from './support/screenshot_manager';
import { LoginInteractionsFactory } from './interactions/login_interactions';
import { LauncherInteractionsFactory } from './interactions/launcher_interactions';
import { newSpaceName } from './support/space_name';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';
import { specContext } from './support/spec_context';

describe('Launcher tests for import flow', () => {
    let spaceName = newSpaceName();

    beforeAll( async () => {
      logger.info('-------before All-------');
      browser.ignoreSynchronization = true;
      browser.driver.manage().window().setSize(1920, 1080);
      let loginInteractions = LoginInteractionsFactory.create();
      await loginInteractions.login();
      let accountHomeInteractions = AccountHomeInteractionsFactory.create();
      await accountHomeInteractions.createSpaceWithExistingCodebase(spaceName);
    });

    beforeEach(async() => {
      screenshotManager.nextTest();
    });

    afterEach(async () => {
      await screenshotManager.save('afterEach');
    });

    it('create a new project through import flow ', async () => {
      logger.specTitle('import a project');
      let launcherInteractions = LauncherInteractionsFactory.create();
      await launcherInteractions.importApplication(specContext.getGitHubRepo(), spaceName, 'releaseAndStage');
    });

});
