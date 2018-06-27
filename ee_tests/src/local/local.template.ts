import { browser } from 'protractor';

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
