import * as logger from './support/logging';
import { screenshotManager } from './support/screenshot_manager';
import { browser } from 'protractor';
import { AppPage } from './page_objects/app.page';
import * as timeouts from './support/timeouts';
import * as runner from './support/script_runner';
import { specContext } from './support/spec_context';
import { LoginInteractionsFactory } from './interactions/login_interactions';

/**
 * Simple test for log in and log out.
 */
describe('e2e_logintest', () => {

  let loginInteractions = LoginInteractionsFactory.create();

  let page = new AppPage();

  beforeAll(async () => {
    browser.ignoreSynchronization = true;
    await browser.driver.manage().window().setSize(1920, 1080);
    await runOCScript();
  });

  beforeEach(async() => {
    screenshotManager.nextTest();
  });

  afterEach(async () => {
    logger.info('--- After each ---');
    await screenshotManager.save('afterEach');
  });

  it('login', async () => {
    logger.info('--- Login ---');
    await loginInteractions.login();

    expect(await page.header.recentItemsDropdown.isPresent()).toBeTruthy('Recent items dropdown is present');
    expect(await page.header.recentItemsDropdown.getText()).
      toBe(specContext.getUser(), 'Recent items dropdown title is username');

    expect(await loginInteractions.isLoginButtonPresent()).toBeFalsy('Login button is not present');
  });
});

async function runOCScript() {
  try {
    logger.info(`Save OC jenkins pod log`);
    await runner.runScript(
      '.', // working directory
      './oc-get-project-logs.sh', // script
      [specContext.getUser(), specContext.getPassword(), 'jenkins', ''], // params
      `./target/screenshots/oc-jenkins-logs.txt`,  // output file
      false,
      timeouts.LONGER_WAIT
    );
  } catch (e) {
    logger.info('Save OC jenkins pod log failed with error: ' + e);
  }
}
