import { browser } from 'protractor';
import * as support from './support';
import {
  LandingPage, SpaceDashboardPage, PageOpenMode,
  MainDashboardPage,
} from './page_objects';

describe(' new spaces in OSIO', () => {
  let mainDashboard: MainDashboardPage;

  beforeEach( async () => {
    support.desktopTestSetup();
    let landingPage = new LandingPage();
    await landingPage.open();

    let login = new support.LoginInteraction();
    mainDashboard = await login.run();
  });


  it('Create a new quickstart', async () => {
    let spaceName = support.newSpaceName();
    let spaceDashboard = await mainDashboard.createNewSpace(spaceName);

    // let spaceDashboard = new SpaceDashboardPage(spaceName)
    // await spaceDashboard.open()
    let wizard = await spaceDashboard.addToSpace()

    support.info("Creating a Vert.x HTTP Booster")
    await wizard.newQuickstartProject({
      project: 'Vert.x HTTP Booster'
    })

    await spaceDashboard.ready()
    // TODO: add a verification to check if the quickstart succeeded

  }, 15 * 60 * 1000);

});

