import { browser } from 'protractor';
import * as support from '../helpers/src/support';
import { LandingPage } from '../helpers/src/page_objects';

describe('Landing Page', () => {

  beforeEach( async () => {
    await support.desktopTestSetup();

    let landingPage = new LandingPage();
    await landingPage.open();
  });

  it('writes the screenshot of landing page', async () => {
    await expect(await browser.getTitle()).toEqual('OpenShift.io');
    await support.writeScreenshot('page.png');
  });

});
