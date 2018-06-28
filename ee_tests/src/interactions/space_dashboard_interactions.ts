import { browser, by, element, ExpectedConditions as until } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { PageOpenMode } from '../page_objects/base.page';
import * as support from '../support';
import { SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { BuildStatus } from '../support/build_status';
import { ReleaseStrategy } from '../support/release_strategy';
import { AccountHomeInteractionsFactory } from './account_home_interactions';

export abstract class SpaceDashboardInteractionsFactory {

    public static create(strategy: string, spaceName: string): SpaceDashboardInteractions {

        if (FeatureLevelUtils.isInternal() || FeatureLevelUtils.isExperimental()) {
            // TODO Implement new dashboard
            return <SpaceDashboardInteractions>{
                openSpaceDashboard(mode: PageOpenMode): void { },
            };
        }

        if (FeatureLevelUtils.isBeta()) {
            return new BetaSpaceDashboardInteractions(strategy, spaceName);
        }

        return new ReleasedSpaceDashboardInteractions(strategy, spaceName);
    }
}

export interface SpaceDashboardInteractions {

    openSpaceDashboard(mode: PageOpenMode): void;

    openCodebasesPage(): void;

    openPipelinesPage(): void;

    createQuickstart(name: string, strategy: string): void;

    importRepo(appName: string, repoName: string, strategy: string): void;

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

    public abstract async importRepo(appName: string, repoName: string, strategy: string): Promise<void>;

    public abstract async verifyCodebases(): Promise<void>;

    public abstract async verifyApplications(): Promise<void>;

    public abstract async verifyAnalytics(): Promise<void>;

    public abstract async verifyWorkItems(): Promise<void>;
}

export class ReleasedSpaceDashboardInteractions extends AbstractSpaceDashboardInteractions {

    protected spaceDashboardPage: SpaceDashboardPage;

    protected strategy: string;

    constructor(strategy: string, spaceName: string) {
        super(spaceName);
        this.strategy = strategy;
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
        await browser.executeScript('window.scrollTo(0,0);');
        await this.spaceDashboardPage.codebasesSectionTitle.clickWhenReady();
    }

    public async openPipelinesPage(): Promise<void> {
        await this.spaceDashboardPage.getPipelinesCard().then(async function (card) {
            await card.openPipelinesPage();
        });
    }

    public async createQuickstart(name: string, strategy: string): Promise<void> {
        let wizard = await this.spaceDashboardPage.addToSpace();
        await wizard.newQuickstartProjectByLauncher(name, this.spaceName, strategy);
    }

    public async importRepo(appName: string, repoName: string, strategy: string): Promise<void> {
        let wizard = await this.spaceDashboardPage.addToSpace();
        await wizard.importProjectByLauncher(appName, repoName, strategy);
    }

    public async verifyCodebases(): Promise<void> {
        let codebasesCard = await this.spaceDashboardPage.getCodebaseCard();
        await browser.wait(async function () {
            return (await codebasesCard.getCount()) === 1;
        }, support.DEFAULT_WAIT);
        expect(await codebasesCard.getCount()).toBe(1, 'number of codebases on page');

        let githubName = browser.params.github.username;
        let codebases = await codebasesCard.getCodebases();
        expect(codebases.length).toBe(1, 'number of codebases');
        expect(codebases[0]).toBe('https://github.com/' + githubName + '/' + this.spaceName);
    }

    public async verifyApplications(): Promise<void> {
        let pipelinesCard = await this.spaceDashboardPage.getPipelinesCard();
        expect(await pipelinesCard.getCount()).toBe(1, 'number of pipelines on page');

        let pipelines = await pipelinesCard.getPipelines();
        expect(pipelines.length).toBe(1, 'number of pipelines');
        expect(pipelines[0].getApplication()).toBe(this.spaceName, 'application name on pipeline');
        expect(pipelines[0].getStatus()).toBe(BuildStatus.COMPLETE, 'build status');
        expect(pipelines[0].getBuildNumber()).toBe(1, 'build number');

        let deploymentsCard = await this.spaceDashboardPage.getDeploymentsCard();

        let applications = await deploymentsCard.getApplications();
        expect(applications.length).toBe(1, 'number of applications');
        expect(await applications[0].getName()).toBe(this.spaceName, 'deployed application name');

        if (ReleaseStrategy.STAGE === this.strategy || ReleaseStrategy.RUN === this.strategy) {
            expect(await applications[0].getStageVersion()).toBe('1.0.1', 'deployed application stage version');
            await applications[0].openStageLink();
            await support.windowManager.switchToNewWindow();
            await this.verifyLink('stage');
        }

        if (ReleaseStrategy.RUN === this.strategy) {
            expect(await applications[0].getRunVersion()).toBe('1.0.1', 'deployed application run version');
            await applications[0].openRunLink();
            await support.windowManager.switchToLastWindow();
            await this.verifyLink('run');
        }
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
        await element.all(by.id('spacehome-my-workitems-badge')).then(function (items) {
            expect(items.length).toBe(0);
        });
    }

    private async verifyLink(environment: string) {
        await browser.wait(until.urlContains(environment));
        await support.screenshotManager.writeScreenshot(environment);
        expect(await browser.getCurrentUrl()).toContain(environment, `${environment} environment url`);

        await browser.wait(until.presenceOf(element(by.id('_http_booster'))));
        let text = await element(by.id('_http_booster')).getText();
        expect(text).toContain('HTTP Booster', `${environment} page contains text`);

        await support.windowManager.switchToMainWindow();
    }
}

export class BetaSpaceDashboardInteractions extends ReleasedSpaceDashboardInteractions {

    public async verifyWorkItems(): Promise<void> {
        let workItemsCard = await this.spaceDashboardPage.getWorkItemsCard();
        expect(await workItemsCard.getCount()).toBe(0, 'number of workitems on page');
    }
}
