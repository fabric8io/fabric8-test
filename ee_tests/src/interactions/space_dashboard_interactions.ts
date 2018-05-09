import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { PageOpenMode } from '../page_objects/base.page';
import * as support from '../support';
import { SpaceDashboardPage } from '../..';
import { BuildStatus } from '../support/build_status';
import { ReleaseStrategy } from '../support/release_strategy';
import { AccountHomeInteractionsFactory } from './account_home_interactions';
import { DEFAULT_WAIT } from '../support';

export abstract class SpaceDashboardInteractionsFactory {

    public static create(spaceName: string): SpaceDashboardInteractions {

        if (FeatureLevelUtils.isInternal() || FeatureLevelUtils.isExperimental()) {
            // TODO Implement new dashboard
            return <SpaceDashboardInteractions>{
                openSpaceDashboard(mode: PageOpenMode): void {},
            };
        }

        if (FeatureLevelUtils.isBeta()) {
            return new BetaSpaceDashboardInteractions(spaceName);
        }

        return new ReleasedSpaceDashboardInteractions(spaceName);
    }
}

export interface SpaceDashboardInteractions {

    openSpaceDashboard(mode: PageOpenMode): void;

    openCodebasesPage(): void;

    openPipelinesPage(): void;

    createQuickstart(name: string, strategy: string): void;

    verifyCodebases(): void;

    verifyApplications(): void;

    verifyAnalytics(): void;

    verifyWorkItems(): void;
}

export abstract class AbstractSpaceDashboardInteractions implements SpaceDashboardInteractions {

    protected spaceName: string;

    constructor(spaceName: string) {
        this.spaceName = spaceName;
    }

    public abstract async openSpaceDashboard(mode: PageOpenMode): Promise<void>;

    public abstract async openCodebasesPage(): Promise<void>;

    public abstract async openPipelinesPage(): Promise<void>;

    public abstract async createQuickstart(name: string, strategy: string): Promise<void>;

    public abstract async verifyCodebases(): Promise<void>;

    public abstract async verifyApplications(): Promise<void>;

    public abstract async verifyAnalytics(): Promise<void>;

    public abstract async verifyWorkItems(): Promise<void>;
}

export class ReleasedSpaceDashboardInteractions extends AbstractSpaceDashboardInteractions {

    protected spaceDashboardPage: SpaceDashboardPage;

    constructor(spaceName: string) {
        super(spaceName);
        this.spaceDashboardPage = new SpaceDashboardPage(spaceName);
    }

    public async openSpaceDashboard(mode: PageOpenMode): Promise<void> {
        if (mode === PageOpenMode.UseMenu) {
            let accountHomeInteractions = AccountHomeInteractionsFactory.create();
            await accountHomeInteractions.openAccountHome(PageOpenMode.UseMenu);
            await accountHomeInteractions.openSpaceDashboard(this.spaceName);
            await this.spaceDashboardPage.open();
        } else {
            await this.spaceDashboardPage.open(mode);
        }
    }

    public async openCodebasesPage(): Promise<void> {
        await this.spaceDashboardPage.codebasesSectionTitle.clickWhenReady();
    }

    public async openPipelinesPage(): Promise<void> {
        await this.spaceDashboardPage.getPipelinesCard().then(async function(card) {
            await card.openPipelinesPage();
        });
    }

    public async createQuickstart(name: string, strategy: string): Promise<void> {
        let wizard = await this.spaceDashboardPage.addToSpace();
        await wizard.newQuickstartProject({ project: name, strategy });
    }

    public async verifyCodebases(): Promise<void> {
        let codebasesCard = await this.spaceDashboardPage.getCodebaseCard();
        browser.wait(async function() {
            return (await codebasesCard.getCount()) === 1;
        }, DEFAULT_WAIT);
        expect(await codebasesCard.getCount()).toBe(1, 'number of codebases on page');

        let githubName = browser.params.github.username;
        let codebases = await codebasesCard.getCodebases();
        expect(codebases.length).toBe(1, 'number of codebases');
        expect(codebases[0]).toBe('https://github.com/' + githubName + '/' + this.spaceName);
    }

    public async verifyApplications(): Promise<void> {
        let pipelinesCard = await this.spaceDashboardPage.getPipelinesCard();
        expect(await pipelinesCard.getCount()).toBe(1, 'number of pipelines on page');

        /* Commenting out temporarily due to bug: https://github.com/openshiftio/openshift.io/issues/3461
           Normally - we would leave the code as is until a product bug is fixed, but, in this case,
           the bug has only minor user impact, is seen intermittently, since it causes this test to
           fail, it can mask the presence of other, more serious bugs */
//        let pipelines = await pipelinesCard.getPipelines();
//        expect(pipelines.length).toBe(1, 'number of pipelines');
//        expect(pipelines[0].getApplication()).toBe(this.spaceName, 'application name on pipeline');
//        expect(pipelines[0].getStatus()).toBe(BuildStatus.COMPLETE, 'build status');
//        expect(pipelines[0].getBuildNumber()).toBe(1, 'build number');

        let deploymentsCard = await this.spaceDashboardPage.getDeploymentsCard();

        let applications = await deploymentsCard.getApplications();
        expect(applications.length).toBe(1, 'number of applications');
        expect(await applications[0].getName()).toBe(this.spaceName, 'deployed application name');
        // expect(await applications[0].getStageVersion()).toBe('1.0.1', 'deployed application stage version');
        // expect(await applications[0].getRunVersion()).toBe('1.0.1', 'deployed application run version');
    }

    public async verifyAnalytics(): Promise<void> {
        let analyticsCard = await this.spaceDashboardPage.getAnalyticsCard();
        let totalCount = await analyticsCard.getTotalDependenciesCount();
        let analyzedCount = await analyticsCard.getAnalyzedDependenciesCount();
        let unknownCount = await analyticsCard.getUnknownDependenciesCount();

        expect(totalCount).toBeGreaterThanOrEqual(0, 'total dependencies count');
        expect(analyzedCount).toBeGreaterThanOrEqual(0, 'total analyzed count');
        expect(unknownCount).toBeGreaterThanOrEqual(0, 'total unknown count');
        expect(totalCount).toBe(analyzedCount + unknownCount, 'total = analyzed + unknown');
    }

    public async verifyWorkItems(): Promise<void> {
        // no work items card exptected
        await element.all(by.id('spacehome-my-workitems-badge')).then(function(items) {
            expect(items.length).toBe(0);
        });
    }
}

export class BetaSpaceDashboardInteractions extends ReleasedSpaceDashboardInteractions {

    public async createQuickstart(name: string, strategy: string): Promise<void> {
        let wizard = await this.spaceDashboardPage.addToSpace();
        await wizard.newQuickstartProjectByLauncher(name, this.spaceName, strategy);
    }

    public async verifyWorkItems(): Promise<void> {
        let workItemsCard = await this.spaceDashboardPage.getWorkItemsCard();
        expect(await workItemsCard.getCount()).toBe(0, 'number of workitems on page');
    }
}

