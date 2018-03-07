import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { WebDriver, error as SE } from 'selenium-webdriver';

import * as support from '../support';
import { Quickstart } from '../support/quickstart';
import { LandingPage } from '../page_objects/landing.page';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { StageRunPage } from '../page_objects/space_stage_run.page';
import { SpaceDeploymentsPage } from '../page_objects/space_deployments.page';

/**
 * Test that can run locally agains static page stored on filesystem
 */
describe('Local test template', () => {

  // URL of local file that sould be loaded in browser
  let URL: string = '';

  beforeEach(async () => {
    browser.resetUrl = 'file://';
    browser.ignoreSynchronization = true;
    await browser.get(URL);
  });

  afterEach(async () => {
  });

  it('Local test', async () => {
    // put testing code here
  });
});
