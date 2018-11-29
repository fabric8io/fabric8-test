import { WorkItemCard } from './page_objects/user_profile.page';
import { PlannerPage } from 'planner-functional-test';
import { Header } from './page_objects/app/header';
import { $, browser } from 'protractor';
import * as logger from './support/logging';
import { screenshotManager } from './support/screenshot_manager';
import { newSpaceName } from './support/space_name';
import { SpaceSettings } from './page_objects/space_settings.page';
import { LoginInteractionsFactory } from './interactions/login_interactions';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';

describe('Planner EE tests adding Area and Collaborator', () => {
  let planner = new PlannerPage(browser.baseUrl),
    settingsPage = new SpaceSettings(),
    header = new Header($('f8-app')),
    workItemCard = new WorkItemCard(),
    spaceName = newSpaceName();

  beforeAll( async () => {
    logger.info('-------before All-------');
    browser.ignoreSynchronization = true;
    await browser.driver.manage().window().setSize(1920, 1080);
    let loginInteractions = LoginInteractionsFactory.create();
    await loginInteractions.login();
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpace(spaceName);
  });

  beforeEach(async() => {
    screenshotManager.nextTest();
  });

  afterEach(async () => {
    await screenshotManager.save('afterEach');
  });

  it('should Navigate to settings, add New Area and assign it to a workitem ', async () => {
    logger.specTitle('should add child area and Add it to a workitem');
    let areaName = 'New Area',
      area = '/' + spaceName + '/' + areaName;
    // Navigate to settings, add Area
    await settingsPage.clickSettings();
    await planner.waitUntilUrlContains('settings');
    expect(await browser.getCurrentUrl()).toContain('settings');
    await settingsPage.list.untilCount(1);
    expect(await settingsPage.list.getText()).toContain(spaceName);
    await settingsPage.addAreas(areaName);
    await settingsPage.clickShowAreas();
    expect(await settingsPage.list.getText()).toContain('New Area');

    // Click Plan tab, Create a new work Item and Add new Area
    let workitemname = {'title': 'area test'};
    await planner.planTab.untilClickable();
    await planner.planTab.clickWhenReady();
    await planner.waitUntilTitleContains('Plan');
    await planner.ready();
    await planner.createWorkItem(workitemname);
    expect(planner.workItemList.hasWorkItem(workitemname.title)).toBeTruthy();
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.addArea(areaName);
    expect(planner.quickPreview.getArea()).toBe(area);
    await planner.quickPreview.close();
  });

  it('should Navigate to collaborators, add a new collaborator and assign it to a workitem ', async () => {
    logger.specTitle('should add collaborator and assign it to a workitem');
    await settingsPage.clickSettings();
    await planner.waitUntilUrlContains('settings');
    await settingsPage.clickCollaboratorsTab();
    await planner.waitUntilUrlContains('collaborators');
    expect(await browser.getCurrentUrl()).toContain('collaborators');
    await settingsPage.list.untilCount(1);
    await settingsPage.addCollaborators('Osio10');
    await settingsPage.list.untilCount(2);
    expect(await settingsPage.getCollaboratorList()).toContain('Osio10');

    // Click Plan tab, Create a new work Item and Assign it to Collaborator
    let workitemname = {'title': 'collaborator test'};
    await planner.planTab.untilClickable();
    await planner.planTab.clickWhenReady();
    await planner.ready();
    await planner.waitUntilTitleContains('Plan');
    await planner.createWorkItem(workitemname);
    expect(planner.workItemList.hasWorkItem(workitemname.title)).toBeTruthy();
    await planner.workItemList.clickWorkItem(workitemname.title);
    await planner.quickPreview.titleInput.untilTextIsPresentInValue(workitemname.title);
    await planner.quickPreview.addAssignee('Osio10');
    expect(planner.quickPreview.getAssignees()).toContain('Osio10');
    await planner.quickPreview.close();
  });

  it('should assign a workitem, open profile page, and navigate from my work item to detail page', async() => {
    logger.specTitle('should add collaborator and assign it to a workitem');
    // Create a workitem and self-assign it
    let workitem = {'title': 'My workitem tests from profile page'};
    await planner.clickPlanTab();
    await planner.createWorkItem(workitem);
    let userName = await settingsPage.getUserInfo();
    expect(await planner.workItemList.hasWorkItem(workitem.title)).toBeTruthy();
    await planner.workItemList.clickWorkItem(workitem.title);
    await planner.quickPreview.addAssignee(userName + ' (me)');
    expect(await planner.quickPreview.getAssignees()).toContain(userName);
    await planner.quickPreview.close();

    // Go to My work item in Profile page and click on a workitem to open detail page
    await header.profileDropdown.select('Profile');
    await planner.waitUntilUrlContains('_profile');
    await workItemCard.clickWorkItemTitle(workitem.title);
    await planner.waitUntilUrlContains('plan');
    await planner.waitUntilTitleContains('plan');
    expect(planner.detailPage.getAssignees()).toBe(userName);
  });
});
