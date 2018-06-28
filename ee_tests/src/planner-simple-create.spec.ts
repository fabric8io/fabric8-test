import * as support from './support';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline_tab.page';
import { LoginInteraction } from './interactions/login_interactions';

describe('Planner Tab', () => {
  let spaceName: string;

  beforeEach( async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();

    spaceName = support.newSpaceName();
    let mainDashboard = new MainDashboardPage();
    await mainDashboard.createNewSpace(spaceName);

    // HACK: use this to reuse an existing space
    // spaceDashboard = new SpaceDashboardPage('foobar');
    // await spaceDashboard.open(PageOpenMode.RefreshBrowser);

  });

  it('can create a work item', async () => {
    let planner = await new SpacePipelinePage().gotoPlanTab();
    await planner.createWorkItem({
      title: 'Workitem Title',
      description: 'Describes the work item'
    });

    await planner.createWorkItem({
      title: 'Workitem Title',
      description: 'Describes the work item'
    });

  });

});
