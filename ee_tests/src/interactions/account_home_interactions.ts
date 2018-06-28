import { browser } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { AccountHomePage } from '../page_objects/account_home.page';
import { PageOpenMode } from '../page_objects/base.page';
import { CleanupUserEnvPage } from '../page_objects/user_profile.page';
import { SpaceDashboardInteractions, SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';
import { AppPage } from '../page_objects/app.page';

export abstract class AccountHomeInteractionsFactory {

    public static create(): AccountHomeInteractions {

        if (FeatureLevelUtils.isInternal() || FeatureLevelUtils.isExperimental()) {
            return new NewAccountHomeInteractions(new AccountHomePage());
        }

        return new OldAccountHomeInteractions(new MainDashboardPage());
    }
}

export interface AccountHomeInteractions {

    openAccountHome(mode: PageOpenMode): void;

    createSpace(name: string): void;

    createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string): void;

    resetEnvironment(): void;

    openSpaceDashboard(name: string): void;
}

export abstract class AbstractSpaceDashboardInteractions implements AccountHomeInteractions {

    private appPage: AppPage;

    constructor(appPage: AppPage) {
        this.appPage = appPage;
    }

    public async abstract openAccountHome(mode: PageOpenMode): Promise<void>;

    public async abstract openSpaceDashboard(name: string): Promise<void>;

    public async createSpace(name: string): Promise<void> {
        await this.appPage.createNewSpaceByLauncher(name);
    }

    public async createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string): Promise<void> {
        await this.appPage.createSpaceWithNewCodebase(spaceName, templateName, strategy);

        let spaceDashboardInteractions: SpaceDashboardInteractions =
            SpaceDashboardInteractionsFactory.create(strategy, spaceName);
        await spaceDashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
        await spaceDashboardInteractions.verifyCodebases();
    }

    public async resetEnvironment(): Promise<void> {
        let cleanupEnvPage = new CleanupUserEnvPage();
        cleanupEnvPage.open(PageOpenMode.RefreshBrowser);
        await cleanupEnvPage.cleanup(browser.params.login.user);
    }
}

export class OldAccountHomeInteractions extends AbstractSpaceDashboardInteractions {

    protected dashboardPage: MainDashboardPage;

    constructor(page: MainDashboardPage) {
        super(page);
        this.dashboardPage = page;
    }

    public async openAccountHome(mode: PageOpenMode): Promise<void> {
        await this.dashboardPage.open(mode);
    }

    public async openSpaceDashboard(name: string): Promise<void> {
        await this.dashboardPage.openSpace(name);
    }
}

export class NewAccountHomeInteractions extends AbstractSpaceDashboardInteractions {

    protected dashboardPage: AccountHomePage;

    constructor(page: AccountHomePage) {
        super(page);
        this.dashboardPage = page;
    }

    public async openAccountHome(mode: PageOpenMode): Promise<void> {
        await this.dashboardPage.open(mode);
    }

    public async openSpaceDashboard(name: string): Promise<void> {
        throw 'Not implemented';
    }
}
