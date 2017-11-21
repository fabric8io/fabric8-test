import { browser } from 'protractor';
import * as support from './support';
import { PageOpenMode, SpaceDashboardPage } from './page_objects';


describe('Planner Tab', () => {
  let spaceDashboard: SpaceDashboardPage;

  beforeEach( async () => {
    await support.desktopTestSetup();
    let login = new support.LoginInteraction();
    let mainDashboard = await login.run();

    let spaceName = support.newSpaceName();
    spaceDashboard = await mainDashboard.createNewSpace(spaceName);

    // HACK: use this to reuse an existing space
    // spaceDashboard = new SpaceDashboardPage('foobar');
    // await spaceDashboard.open(PageOpenMode.RefreshBrowser);

  });


  it('can create a work item', async () => {
    let planner = await spaceDashboard.gotoPlanTab();
    await planner.createWorkItem({
      title: 'Workitem Title',
      description: 'Describes the work item'
    })

    await planner.createWorkItem({
      title: 'Workitem Title',
      description: 'Describes the work item'
    })

  });

});

