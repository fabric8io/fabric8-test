import { browser } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { AccountHomePage } from '../page_objects/account_home.page';
import { PageOpenMode } from '../page_objects/base.page';
import { CleanupUserEnvPage } from '../page_objects/user_profile.page';
import { SpaceDashboardInteractions, SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';
import { AppPage } from '../page_objects/app.page';
import * as logger from '../support/logging';
import { LandingPage } from '../..';

export abstract class AccountHomeInteractionsFactory {

    public static create(): AccountHomeInteractions {

        if (FeatureLevelUtils.isInternal() || FeatureLevelUtils.isExperimental()) {
            return new NewAccountHomeInteractions(new AccountHomePage());
        }

        let url: string = browser.params.target.url;

        if (url.includes('localhost')) {
            return new LocalOldAccountHomeInteractions(new MainDashboardPage());
        } else {
            return new OldAccountHomeInteractions(new MainDashboardPage());
        }
    }
}

export interface AccountHomeInteractions {

    openAccountHomePage(mode: PageOpenMode): void;

    createSpace(name: string): void;

    createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string): void;

    resetEnvironment(): void;

    getToken(): Promise<string>;

    logout(): Promise<void>;

    openSpaceDashboard(name: string): void;
}

abstract class AbstractSpaceDashboardInteractions implements AccountHomeInteractions {

    private appPage: AppPage;

    constructor(appPage: AppPage) {
        this.appPage = appPage;
    }

    public async abstract openAccountHomePage(mode: PageOpenMode): Promise<void>;

    public async abstract openSpaceDashboard(name: string): Promise<void>;

    public async createSpace(name: string): Promise<void> {
        logger.info('Create space ' + name);
        await this.appPage.createNewSpaceByLauncher(name);
    }

    public async createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string): Promise<void> {
        logger.info(`Create space ${spaceName} from booster ${templateName} with release strategy ${strategy}`);
        await this.appPage.createSpaceWithNewCodebase(spaceName, templateName, strategy);

        let spaceDashboardInteractions: SpaceDashboardInteractions =
            SpaceDashboardInteractionsFactory.create(strategy, spaceName);
        await spaceDashboardInteractions.openSpaceDashboardPage(PageOpenMode.AlreadyOpened);
        await spaceDashboardInteractions.verifyCodebases(spaceName);
    }

    public async resetEnvironment(): Promise<void> {
        logger.info('Reset environment');
        let cleanupEnvPage = new CleanupUserEnvPage();
        cleanupEnvPage.open(PageOpenMode.RefreshBrowser);
        await cleanupEnvPage.cleanup(browser.params.login.user);
    }

    public async getToken(): Promise<string> {
        let userProfile = await this.appPage.gotoUserProfile();
        let editProfile = await userProfile.gotoEditProfile();
        return editProfile.getToken();
    }

    public async logout(): Promise<void> {
        let page = new AppPage();
        await page.logout();
        await new LandingPage().open();
    }
}

class OldAccountHomeInteractions extends AbstractSpaceDashboardInteractions {

    protected dashboardPage: MainDashboardPage;

    constructor(page: MainDashboardPage) {
        super(page);
        this.dashboardPage = page;
    }

    public async openAccountHomePage(mode: PageOpenMode): Promise<void> {
        logger.info('Open account home page');
        await this.dashboardPage.open(mode);
    }

    public async openSpaceDashboard(name: string): Promise<void> {
        logger.info('Open space dashboard for space ' + name);
        await this.dashboardPage.openSpace(name);
    }
}

class LocalOldAccountHomeInteractions extends OldAccountHomeInteractions {
    public async logout(): Promise<void> {
        let page = new AppPage();
        await page.logout();
    }
}

class NewAccountHomeInteractions extends AbstractSpaceDashboardInteractions {

    protected dashboardPage: AccountHomePage;

    constructor(page: AccountHomePage) {
        super(page);
        this.dashboardPage = page;
    }

    public async openAccountHomePage(mode: PageOpenMode): Promise<void> {
        logger.info('Open account home page');
        await this.dashboardPage.open(mode);
    }

    public async openSpaceDashboard(name: string): Promise<void> {
        throw 'Not implemented';
    }
}
