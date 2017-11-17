import { browser, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from './support';

import { LandingPage } from './page_objects/landing.page';
import { SpaceDashboardPage } from './page_objects/space_dashboard.page';
import { SpacePipelinePage } from './page_objects/space_pipeline.page';
import { UserProfilePage } from './page_objects/user_profile.page';

/* Tests to verify the build pipeline */

describe('Creating new quickstart in OSIO', () => {
    let landingPage: LandingPage;
    let profilePage: UserProfilePage;

  beforeEach( async () => {
    await support.desktopTestSetup();
    landingPage = new LandingPage(browser.params.target.url);
    support.debug('>>> Landing Page Open');
    await landingPage.open();
    support.debug('>>> Landing Page Open - DONE');
  });

  /* Simple test - new login path to access landing page

     Steps in new path:
     * Login to OSIO
     * While logging in, the user will traverse a path of:
           RHD login page, getting started page, account home page
     * At that point, if the user directly navigates to the base URL (e.g., https://openshift.io)
       the top menu bar will change to also include his/her username
    * Clicking on the username in the menu bar should return the user to his/her profile page  */

     // tslint:disable:max-line-length

  fit('Login, verify user can access profile from landing page', async () => {

    support.debug('>>> starting test; loginPage');
    let loginPage = await landingPage.gotoLoginPage();
    support.debug('>>> back from gotoLoginPage');

    let url = browser.params.target.url;
    let { user, password } = browser.params.login;
    let dashboardPage = await loginPage.login(user, password);

    landingPage.open();    // await ?
      /* 16:01:30.903 INFO - Found handler: org.openqa.selenium.remote.server.ServicedSession@660d8cd0
         16:01:30.904 INFO - Handler thread for session f261eb2d834e2eb6694d00cb691fd9d9 (chrome): Executing GET on /session/f261eb2d834e2eb6694d00cb691fd9d9/element/0.6647468648790547-1/displayed (handler: ServicedSession)
         16:01:30.918 INFO - To downstream: {"sessionId":"f261eb2d834e2eb6694d00cb691fd9d9","status":0,"value":true}
      */

    await landingPage.loggedInUserName.clickWhenReady();
    let userProfilePage =  landingPage.gotoUserProfile();   // await ?
      /* 16:05:53.976 INFO - Found handler: org.openqa.selenium.remote.server.ServicedSession@2debb3b4
         16:05:53.976 INFO - Handler thread for session 171f7bebd825c7c7ea0d11a178613f6d (chrome): Executing POST on /session/171f7bebd825c7c7ea0d11a178613f6d/elements (handler: ServicedSession)
         16:05:53.976 INFO - To upstream: {"using":"css selector","value":"#login"}
         16:05:53.979 INFO - To downstream: {"sessionId":"171f7bebd825c7c7ea0d11a178613f6d","status":0,"value":[]}
      */
    // await userProfilePage.ready();
    await dashboardPage.logout();

  });
 // tslint:enable:max-line-length

});
