import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { PageOpenMode } from '../page_objects/base.page';
import * as support from '../support';
import { SpaceDashboardPage, CleanupUserEnvPage } from '../..';
import { BuildStatus } from '../support/build_status';
import { ReleaseStrategy } from '../support/release_strategy';
import { SpaceDashboardInteractionsFactory, SpaceDashboardInteractions } from './space_dashboard_interactions';

export abstract class AccountHomeInteractionsFactory {

    public static create(): AccountHomeInteractions {

        if (FeatureLevelUtils.isInternal()) {
            return <AccountHomeInteractions>{
                openAccountHome(mode: PageOpenMode): void {},
            };
        }

        return new ReleasedAccountHomeInteractions();
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

    public async abstract openAccountHome(mode: PageOpenMode): Promise<void>;

    public async abstract createSpace(name: string): Promise<void>;

    // tslint:disable-next-line:max-line-length
    public async abstract createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string): Promise<void>;

    public async abstract resetEnvironment(): Promise<void>;

    public async abstract openSpaceDashboard(name: string): Promise<void>;
}

export class ReleasedAccountHomeInteractions extends AbstractSpaceDashboardInteractions {

    protected dashboardPage: MainDashboardPage;

    constructor() {
        super();
        this.dashboardPage = new MainDashboardPage();
    }

    public async openAccountHome(mode: PageOpenMode): Promise<void> {
        await this.dashboardPage.open(mode);
    }

    public async createSpace(name: string): Promise<void> {
        await this.dashboardPage.createNewSpaceByLauncher(name);
    }

    public async createSpaceWithNewCodebase(spaceName: string, templateName: string, strategy: string): Promise<void> {
        await this.dashboardPage.createSpaceWithNewCodebase(spaceName, templateName, strategy);

        let spaceDashboardInteractions: SpaceDashboardInteractions =
            SpaceDashboardInteractionsFactory.create(spaceName);
        await spaceDashboardInteractions.openSpaceDashboard(PageOpenMode.AlreadyOpened);
        await spaceDashboardInteractions.verifyCodebases();
    }

    public async resetEnvironment(): Promise<void> {
        let cleanupEnvPage = new CleanupUserEnvPage();
        cleanupEnvPage.open(PageOpenMode.RefreshBrowser);
        await cleanupEnvPage.cleanup(browser.params.login.user);
    }

    public async openSpaceDashboard(name: string): Promise<void> {
        await this.dashboardPage.openSpace(name);
    }
}
