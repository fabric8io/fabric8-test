import { browser } from 'protractor';

import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { screenshotManager } from '../support/screenshot_manager';
import { specContext } from '../support/spec_context';
import { LoginInteractionsFactory } from '../interactions/login_interactions';
import { AccountHomeInteractionsFactory } from '../interactions/account_home_interactions';
import * as runner from '../support/script_runner';

describe('clean_workpsaces', () => {

  let token: string;

  beforeAll(async () => {
    logger.info('Before all');
    browser.ignoreSynchronization = true;
    await browser.driver.manage().window().setSize(1920, 1080);
    specContext.print();

    logger.info('Login');
    let loginInteractions = LoginInteractionsFactory.create();
    await loginInteractions.login();

    logger.info('Get token');
    token = await AccountHomeInteractionsFactory.create().getToken();

    logger.info('Run oc che');
    await runOCScript('che', 'oc-che-before');
  });

  beforeEach(async() => {
    screenshotManager.nextTest();
  });

  afterEach(async () => {
    await screenshotManager.save('afterEach');
  });

  afterAll(async () => {
    logger.info('Run oc che');
    await runOCScript('che', 'oc-che-after');
  });

  it('remove_che_workspaces', async () => {
    logger.info('Remove che workspaces');
    await runCleanupScript('cleanup');
  });

async function runOCScript(project: string, outputFile: string) {
  try {
    await runner.runScript(
      '.', // working directory
      './oc-get-project-logs.sh', // script
      [specContext.getUser(), specContext.getPassword(), project, token], // params
      `./target/screenshots/${outputFile}.txt`,  // output file
      false,
      timeouts.LONGER_WAIT
    );
  } catch (e) {
    logger.info('Save OC Jenkins pod log failed with error: ' + e);
  }
}

async function runCleanupScript(outputFile: string) {
    try {
      await runner.runScript(
        '.', // working directory
        './che-clean-workspaces.sh', // script
        [specContext.getUser(), token], // params
        `./target/screenshots/${outputFile}.txt`,  // output file
        false,
        timeouts.LONGER_WAIT
      );
    } catch (e) {
      logger.info('Save OC Jenkins pod log failed with error: ' + e);
    }
  }
});
