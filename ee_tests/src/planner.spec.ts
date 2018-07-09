import { browser, ExpectedConditions } from 'protractor';
import * as support from './support';
import { MainDashboardPage, SpaceDashboardPage, SpaceSettings } from './page_objects';
import  { PlannerPage } from 'planner-functional-test';

describe('Planner EE tests adding Area and Collaborator', () => {
  let dashboardPage: MainDashboardPage,
    SettingsPage = new SpaceSettings(),
    planner = new PlannerPage(browser.baseUrl),
    spaceName:string = "";

  beforeAll( async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction(),
      dashboardPage = await login.run();
      spaceName = support.newSpaceName();
    await dashboardPage.header.recentItemsDropdown.createSpaceItem.select();
    await dashboardPage.newSpaceName.enterText(spaceName);
    await dashboardPage.createSpaceButton.clickWhenReady();
    await dashboardPage.cancelCreateAppButton.clickWhenReady();
    await dashboardPage.waitUntilUrlContains(spaceName);
  });

  it('should Navigate to settings, add New Area and assign it to a workitem ', async () => {
    // Navigate to settings, add Area
    await SettingsPage.clickSettings();
    expect(await browser.getCurrentUrl()).toContain('settings');
    await SettingsPage.list.untilCount(1);
    expect(await SettingsPage.list.getText()).toContain(spaceName);
    await SettingsPage.addAreas('New Area');
    await SettingsPage.clickShowAreas();
    expect(await SettingsPage.list.getText()).toContain('New Area');

    // Click Plan tab, Create a new work Item and Add new Area
    let workitemname = {"title": "area test"};
    await new SpaceDashboardPage(spaceName).planTab.clickWhenReady();
    await planner.waitUntilUrlContains('typegroup');
    await planner.ready();
    await planner.createWorkItem(workitemname);
    expect(planner.workItemList.hasWorkItem(workitemname.title)).toBeTruthy();
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.addArea('New Area');
    expect(planner.quickPreview.getArea()).toContain('New Area');
    await planner.quickPreview.close();
  });

  it('should Navigate to collaborators, add a new collaborator and assign it to a workitem ', async () => {
    // Navigate to settings, add collaborator
    let user = browser.params.login.user;
    let workitemname = {"title": "collaborator test"};

    await SettingsPage.clickSettings();
    await SettingsPage.clickCollaboratorsTab();
    expect(await browser.getCurrentUrl()).toContain('collaborators');
    await SettingsPage.list.untilCount(1);
    expect(await SettingsPage.getCollaboratorList()).toContain(user);
    await SettingsPage.addCollaborators('Osio10');
    expect(await SettingsPage.getCollaboratorList()).toContain('Osio10');

    // Click Plan tab, Create a new work Item and Assign it to Collaborator
    await new SpaceDashboardPage(spaceName).planTab.clickWhenReady();
    await planner.waitUntilUrlContains('typegroup');
    await planner.ready();
    await planner.createWorkItem(workitemname);
    expect(planner.workItemList.hasWorkItem(workitemname.title)).toBeTruthy();
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.addAssignee('Osio10');
    expect(planner.quickPreview.getAssignees()).toContain('Osio10');
  });
});
