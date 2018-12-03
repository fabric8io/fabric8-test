import { $, browser } from 'protractor';

import * as logger from './support/logging';
import { screenshotManager } from './support/screenshot_manager';
import { CreateApplicationPage } from './page_objects/launcher.page';
import { LoginInteractionsFactory } from './interactions/login_interactions';
import { LauncherInteractionsFactory } from './interactions/launcher_interactions';
import { newSpaceName } from './support/space_name';
import { Header } from './page_objects/app/header';

describe('Launcher tests for import flow', () => {
         let spaceName = newSpaceName(),
         header = new Header($('f8-app'));

        let createApplicationPage = new CreateApplicationPage();

         beforeAll( async () => {
          logger.info('-------before All-------');
          browser.ignoreSynchronization = true;
          browser.driver.manage().window().setSize(1920, 1080);
          let loginInteractions = LoginInteractionsFactory.create();
          await loginInteractions.login();
          await header.recentItemsDropdown.selectCreateSpace();
          await createApplicationPage.newSpaceName.enterText(spaceName);
          await createApplicationPage.createSpaceButton.clickWhenReady();

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
       await launcherInteractions.importApplication('test10', spaceName, 'releaseAndStage');
    });

});
