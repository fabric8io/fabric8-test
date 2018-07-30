import { browser, by, element, ExpectedConditions as until } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { PageOpenMode } from '../page_objects/base.page';
import * as support from '../support';
import { DeployedApplicationInfo, Pipeline, SpaceDashboardPage } from '../page_objects/space_dashboard.page';
import { BuildStatus } from '../support/build_status';
import { ReleaseStrategy } from '../support/release_strategy';
import { AccountHomeInteractionsFactory } from './account_home_interactions';

export abstract class SpaceDashboardInteractionsFactory {

    public static create(strategy: string, spaceName: string): SpaceDashboardInteractions {

        if (FeatureLevelUtils.isInternal() || FeatureLevelUtils.isExperimental()) {
            // TODO Implement new dashboard
            return <SpaceDashboardInteractions>{
                openSpaceDashboardPage(mode: PageOpenMode): void { },
            };
        }

        if (FeatureLevelUtils.isBeta()) {
            return new BetaSpaceDashboardInteractions(strategy, spaceName);
        }

        return new ReleasedSpaceDashboardInteractions(strategy, spaceName);
    }
}

export interface SpaceDashboardInteractions {

    openSpaceDashboardPage(mode: PageOpenMode): void;

    openCodebasesPage(): void;

    openPipelinesPage(): void;

    createQuickstart(name: string, strategy: string): void;

    importRepo(appName: string, repoName: string, strategy: string): void;

    verifyCodebases(repoName: string): void;

    verifyPipelines(count: number): Promise<Pipeline[]>;

    verifyPipeline(
        pipeline: Pipeline, application: string, buildNumber: number, buildStatus: BuildStatus): void;

    verifyDeployedApplications(count: number): Promise<DeployedApplicationInfo[]>;

    verifyDeployedApplication(application: DeployedApplicationInfo, name: string): void;

    verifyDeployedApplicationStage(
        application: DeployedApplicationInfo, version: string, testCallback: () => void): void;

    verifyDeployedApplicationRun(
        application: DeployedApplicationInfo, version: string, testCallback: () => void): void;

    verifyAnalytics(): void;

    verifyWorkItems(): void;
}

abstract class AbstractSpaceDashboardInteractions implements SpaceDashboardInteractions {

    protected spaceName: string;

    constructor(spaceName: string) {
        this.spaceName = spaceName;
    }

    public abstract async openSpaceDashboardPage(mode: PageOpenMode): Promise<void>;

    public abstract async openCodebasesPage(): Promise<void>;

    public abstract async openPipelinesPage(): Promise<void>;

    public abstract async createQuickstart(name: string, strategy: string): Promise<void>;

    public abstract async importRepo(appName: string, repoName: string, strategy: string): Promise<void>;

    public abstract async verifyCodebases(repoName: string): Promise<void>;

    public abstract async verifyPipelines(count: number): Promise<Pipeline[]>;

    public abstract async verifyPipeline(
        pipeline: Pipeline, application: string, buildNumber: number, buildStatus: BuildStatus): Promise<void>;

    public abstract async verifyDeployedApplications(count: number): Promise<DeployedApplicationInfo[]>;

    public abstract async verifyDeployedApplication(application: DeployedApplicationInfo, name: string): Promise<void>;

    public abstract async verifyDeployedApplicationStage(
        application: DeployedApplicationInfo, version: string, testCallback: () => void): Promise<void>;

    public abstract async verifyDeployedApplicationRun(
        application: DeployedApplicationInfo, version: string, testCallback: () => void): Promise<void>;

    public abstract async verifyAnalytics(): Promise<void>;

    public abstract async verifyWorkItems(): Promise<void>;
}

class ReleasedSpaceDashboardInteractions extends AbstractSpaceDashboardInteractions {

    protected spaceDashboardPage: SpaceDashboardPage;

    protected strategy: string;

    constructor(strategy: string, spaceName: string) {
        super(spaceName);
        this.strategy = strategy;
        this.spaceDashboardPage = new SpaceDashboardPage(spaceName);
    }

    public async openSpaceDashboardPage(mode: PageOpenMode): Promise<void> {
        if (mode === PageOpenMode.UseMenu) {
            let accountHomeInteractions = AccountHomeInteractionsFactory.create();
            await accountHomeInteractions.openAccountHomePage(PageOpenMode.UseMenu);
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

    public async verifyCodebases(repoName: string): Promise<void> {
        let codebasesCard = await this.spaceDashboardPage.getCodebaseCard();
        await browser.wait(async function () {
            return (await codebasesCard.getCount()) === 1;
        }, support.DEFAULT_WAIT, 'Codebases are loaded');
        expect(await codebasesCard.getCount()).toBe(1, 'number of codebases on page');

        let githubName = browser.params.github.username;
        let codebases = await codebasesCard.getCodebases();
        expect(codebases.length).toBe(1, 'number of codebases');
        expect(codebases[0]).toBe('https://github.com/' + githubName + '/' + repoName);
    }

    public async verifyPipelines(count: number): Promise<Pipeline[]> {
        let pipelinesCard = await this.spaceDashboardPage.getPipelinesCard();
        expect(await pipelinesCard.getCount()).toBe(count, 'number of pipelines on page');

        let pipelines = await pipelinesCard.getPipelines();
        expect(pipelines.length).toBe(count, 'number of pipelines');
        return Promise.resolve(pipelines);
    }

    public async verifyPipeline(pipeline: Pipeline,
        application: string, buildNumber: number, buildStatus: BuildStatus): Promise<void> {
        expect(pipeline.getApplication()).toBe(application, 'application name on pipeline');
        expect(pipeline.getStatus()).toBe(buildStatus, 'build status');
        expect(pipeline.getBuildNumber()).toBe(buildNumber, 'build number');
    }

    public async verifyDeployedApplications(count: number): Promise<DeployedApplicationInfo[]> {
        let deploymentsCard = await this.spaceDashboardPage.getDeploymentsCard();

        let applications = await deploymentsCard.getApplications();
        expect(applications.length).toBe(count, 'number of applications');
        return Promise.resolve(applications);
    }

    public async verifyDeployedApplication(application: DeployedApplicationInfo, name: string): Promise<void> {
        expect(await application.getName()).toBe(name, 'deployed application name');
    }

    public async verifyDeployedApplicationStage(
        application: DeployedApplicationInfo, version: string, testCallback: () => void): Promise<void> {
            if (ReleaseStrategy.STAGE === this.strategy || ReleaseStrategy.RUN === this.strategy) {
                expect(await application.getStageVersion()).toBe(version, 'deployed application stage version');
                await application.openStageLink();
                await support.windowManager.switchToNewWindow();
                await this.verifyLink(testCallback, 'stage');
            }
        }

    public async verifyDeployedApplicationRun(
        application: DeployedApplicationInfo, version: string, testCallback: () => void): Promise<void> {
        if (ReleaseStrategy.RUN === this.strategy) {
            expect(await application.getRunVersion()).toBe(version, 'deployed application run version');
            await application.openRunLink();
            await support.windowManager.switchToLastWindow();
            await this.verifyLink(testCallback, 'run');
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

    private async verifyLink(testCallback: () => void, environment: string) {
        await browser.wait(until.urlContains(environment), support.DEFAULT_WAIT, `url contains ${environment}`);
        await support.screenshotManager.writeScreenshot(environment);

        let currentURL = await browser.getCurrentUrl();
        expect(currentURL).toContain(environment, `${environment} environment url`);

        await testCallback();

        await support.windowManager.switchToMainWindow();
    }
}

class BetaSpaceDashboardInteractions extends ReleasedSpaceDashboardInteractions {

    public async verifyWorkItems(): Promise<void> {
        let workItemsCard = await this.spaceDashboardPage.getWorkItemsCard();
        expect(await workItemsCard.getCount()).toBe(0, 'number of workitems on page');
    }
}
