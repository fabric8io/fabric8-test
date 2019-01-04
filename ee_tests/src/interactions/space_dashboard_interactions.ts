import { browser, by, element } from 'protractor';
import { FeatureLevelUtils } from '../support/feature_level';
import { PageOpenMode } from '../page_objects/base.page';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { specContext } from '../support/spec_context';
import { OldSpaceDashboardPage, Pipeline } from '../page_objects/old_space_dashboard.page';
import { BuildStatus } from '../support/build_status';
import { AccountHomeInteractionsFactory } from './account_home_interactions';
import { LauncherInteractionsFactory } from './launcher_interactions';
import { Quickstart } from '../support/quickstart';

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

    openPlannerPage(): void;

    createQuickstart(name: string, quickstart: Quickstart, strategy: string): void;

    importRepo(appName: string, repoName: string, strategy: string): void;

    verifyCodebases(repoName: string): void;

    verifyPipelines(count: number): Promise<Pipeline[]>;

    verifyPipeline(
        pipeline: Pipeline, application: string, buildNumber: number, buildStatus: BuildStatus): void;

    verifyAnalytics(): void;

    verifyWorkItems(...items: string[]): void;
}

abstract class AbstractSpaceDashboardInteractions implements SpaceDashboardInteractions {

    protected spaceName: string;

    constructor(spaceName: string) {
        this.spaceName = spaceName;
    }

    public abstract async openSpaceDashboardPage(mode: PageOpenMode): Promise<void>;

    public abstract async openCodebasesPage(): Promise<void>;

    public abstract async openPipelinesPage(): Promise<void>;

    public abstract async openPlannerPage(): Promise<void>;

    public abstract async createQuickstart(name: string, quickstart: Quickstart, strategy: string): Promise<void>;

    public abstract async importRepo(appName: string, repoName: string, strategy: string): Promise<void>;

    public abstract async verifyCodebases(repoName: string): Promise<void>;

    public abstract async verifyPipelines(count: number): Promise<Pipeline[]>;

    public abstract async verifyPipeline(
        pipeline: Pipeline, application: string, buildNumber: number, buildStatus: BuildStatus): Promise<void>;

    public abstract async verifyAnalytics(): Promise<void>;

    public abstract async verifyWorkItems(...items: string[]): Promise<void>;
}

class ReleasedSpaceDashboardInteractions extends AbstractSpaceDashboardInteractions {

    protected spaceDashboardPage: OldSpaceDashboardPage;

    protected strategy: string;

    constructor(strategy: string, spaceName: string) {
        super(spaceName);
        this.strategy = strategy;
        this.spaceDashboardPage = new OldSpaceDashboardPage(spaceName);
    }

    public async openSpaceDashboardPage(mode: PageOpenMode): Promise<void> {
        logger.info('Open space dashboard for space ' + this.spaceName);
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
        logger.info('Open codebases page');
        await browser.executeScript('window.scrollTo(0,0);');
        await (await this.spaceDashboardPage.getCodebaseCard()).openCodebasesPage();
    }

    public async openPipelinesPage(): Promise<void> {
        logger.info('Open pipelines page');
        await this.spaceDashboardPage.getPipelinesCard().then(async function (card) {
            await card.openPipelinesPage();
        });
    }

    public async openPlannerPage(): Promise<void> {
        // planner is not yet released
    }

    public async createQuickstart(name: string, quickstart: Quickstart, strategy: string): Promise<void> {
        logger.info(`Create booster ${name} with strategy ${strategy}`);
        await this.spaceDashboardPage.addToSpace();

        let launcherInteractions = LauncherInteractionsFactory.create();
        await launcherInteractions.createApplication(name, quickstart, strategy);
    }

    public async importRepo(appName: string, repoName: string, strategy: string): Promise<void> {
        logger.info(`Import existing repository ${repoName} with strategy ${strategy}`);
        await this.spaceDashboardPage.addToSpace();

        let launcherInteractions = LauncherInteractionsFactory.create();
        await launcherInteractions.importApplication(appName, repoName, strategy);
    }

    public async verifyCodebases(repoName: string): Promise<void> {
        try {
            logger.info('Verify codebase ' + repoName);
            let codebasesCard = await this.spaceDashboardPage.getCodebaseCard();
            await browser.wait(async function () {
                return (await codebasesCard.getCount()) === 1;
            }, timeouts.DEFAULT_WAIT, 'Codebases are loaded');
            expect(await codebasesCard.getCount()).toBe(1, 'number of codebases on page');

            let githubName = specContext.getGitHubUser();
            let codebases = await codebasesCard.getCodebases();
            expect(codebases.length).toBe(1, 'number of codebases');
            expect(codebases[0]).toBe('https://github.com/' + githubName + '/' + repoName);
        } catch (e) {
            logger.error('Verify codebases failed ', e);
            throw 'Verify codebases failed';
        }
    }

    public async verifyPipelines(count: number): Promise<Pipeline[]> {
        logger.info('Verify pipelines');
        let pipelinesCard = await this.spaceDashboardPage.getPipelinesCard();
        expect(await pipelinesCard.getCount()).toBe(count, 'number of pipelines on page');

        let pipelines = await pipelinesCard.getPipelines();
        expect(pipelines.length).toBe(count, 'number of pipelines');
        return Promise.resolve(pipelines);
    }

    public async verifyPipeline(pipeline: Pipeline,
        application: string, buildNumber: number, buildStatus: BuildStatus): Promise<void> {
        logger.info('Verify pipeline for application ' + await pipeline.getApplication());
        expect(pipeline.getApplication()).toBe(application, 'application name on pipeline');
        expect(pipeline.getStatus()).toBe(buildStatus, 'build status');
        expect(pipeline.getBuildNumber()).toBe(buildNumber, 'build number');
    }

    public async verifyAnalytics(): Promise<void> {
        logger.info('Verify stack report');
        let analyticsCard = await this.spaceDashboardPage.getAnalyticsCard();
        let totalCount = await analyticsCard.getTotalDependenciesCount();
        let analyzedCount = await analyticsCard.getAnalyzedDependenciesCount();
        let unknownCount = await analyticsCard.getUnknownDependenciesCount();

        expect(totalCount).toBeGreaterThanOrEqual(0, 'total dependencies count');
        expect(analyzedCount).toBeGreaterThanOrEqual(0, 'total analyzed count');
        expect(unknownCount).toBeGreaterThanOrEqual(0, 'total unknown count');
        expect(totalCount).toBe(analyzedCount + unknownCount, 'total = analyzed + unknown');
    }

    public async verifyWorkItems(...items: string[]): Promise<void> {
        logger.info('Verify work items');
        // no work items card exptected
        await element.all(by.id('spacehome-my-workitems-badge')).then(function (i) {
            expect(i.length).toBe(0);
        });
    }
}

class BetaSpaceDashboardInteractions extends ReleasedSpaceDashboardInteractions {

    public async verifyWorkItems(...items: string[]): Promise<void> {
        let workItemsCard = await this.spaceDashboardPage.getWorkItemsCard();

        await browser.wait(async () => {
            return await workItemsCard.getCount() === items.length;
        }, timeouts.DEFAULT_WAIT, 'Number of workitems on card');

        expect(await workItemsCard.getCount()).toBe(items.length, 'Number of workitems on card');

        let workItems = await workItemsCard.getWorkItems();
        expect(workItems.length).toBe(items.length, 'Number of work items');
        for (let i = 0; i < items.length; i++) {
            expect(workItems[i]).toBe(items[i], 'Work item name');
        }
    }

    public async openPlannerPage(): Promise<void> {
        logger.info('Open planner page');
        await this.spaceDashboardPage.getWorkItemsCard().then(async function (card) {
            await card.openPlanner();
        });
    }
}
