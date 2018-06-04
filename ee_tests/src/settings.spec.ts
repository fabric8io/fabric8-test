import { browser, ExpectedConditions } from 'protractor';
import * as support from './support';
import { MainDashboardPage, SpaceDashboardPage, SpaceSettings } from './page_objects';


describe('Adding areas and Collaborators to space', () => {
  let dashboardPage: MainDashboardPage,
    SettingsPage = new SpaceSettings(),
    spaceName:string = "";

  beforeAll( async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
      dashboardPage = await login.run();
      spaceName = support.newSpaceName();
    await dashboardPage.header.recentItemsDropdown.createSpaceItem.select();
    await dashboardPage.newSpaceName.enterText(spaceName);
    await dashboardPage.createSpaceButton.clickWhenReady();
    await dashboardPage.cancelCreateAppButton.clickWhenReady();
    await dashboardPage.waitUntilUrlContains(spaceName);
  });

  it('should Navigate to settings and add New Area', async () => {
    await SettingsPage.clickSettings();
    expect(await browser.getCurrentUrl()).toContain('settings');
    await SettingsPage.list.untilCount(1);
    expect(await SettingsPage.list.getText()).toContain(spaceName);
    await SettingsPage.addAreas('New Area');
    await SettingsPage.clickShowAreas();
    expect(await SettingsPage.list.getText()).toContain('New Area');
  });
});