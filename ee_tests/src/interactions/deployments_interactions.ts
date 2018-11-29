import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import {
    DeployedApplication, DeployedApplicationEnvironment, DeploymentStatus,
    Environment, ResourceUsageData, SpaceDeploymentsPage
} from '../page_objects/space_deployments_tab.page';
import { ReleaseStrategy } from '../support/release_strategy';
import { FeatureLevelUtils } from '../support/feature_level';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { PageOpenMode } from '../page_objects/base.page';
import { PipelinesInteractionsFactory } from './pipelines_interactions';
import { browser } from 'protractor';

export abstract class DeploymentsInteractionsFactory {

    public static create(strategy: string, spaceName: string): DeploymentsInteractions {
        if (FeatureLevelUtils.isReleased()) {
            return <DeploymentsInteractions>{
                openDeploymentsPage(): void { },
                verifyApplications(count: number): Promise<DeployedApplication[]> {
                    // just return dummy value
                    return Promise.resolve([new DeployedApplication(new MainDashboardPage().header)]);
                },
                verifyApplication(app: DeployedApplication, name: string): void { },
                verifyEnvironments(
                    application: DeployedApplication): Promise<DeployedApplicationEnvironment[]> {
                    return Promise.resolve([new DeployedApplicationEnvironment(new MainDashboardPage().header)]);
                },

                verifyStageEnvironment(environment: DeployedApplicationEnvironment[],
                    status: DeploymentStatus, version: string, podsCount: number): void { },

                verifyRunEnvironment(environment: DeployedApplicationEnvironment[],
                    status: DeploymentStatus, version: string, podsCount: number): void { },

                verifyResourceUsage(): void { }
            };
        }

        if (strategy === ReleaseStrategy.RELEASE) {
            return new DeploymentsInteractionsReleaseStrategy(strategy, spaceName);
        }

        if (strategy === ReleaseStrategy.STAGE) {
            return new DeploymentsInteractionsStageStrategy(strategy, spaceName);
        }

        if (strategy === ReleaseStrategy.RUN) {
            return new DeploymentsInteractionsRunStrategy(strategy, spaceName);
        }
        throw 'Unknown release strategy: ' + strategy;
    }
}

export interface DeploymentsInteractions {

    openDeploymentsPage(mode: PageOpenMode): void;

    verifyApplications(count: number): Promise<DeployedApplication[]>;

    verifyApplication(application: DeployedApplication, name: string): void;

    verifyEnvironments(application: DeployedApplication): Promise<DeployedApplicationEnvironment[]>;

    verifyStageEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): void;

    verifyRunEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): void;

    verifyResourceUsage(): void;
}

abstract class AbstractDeploymentsInteractions implements DeploymentsInteractions {

    protected strategy: ReleaseStrategy;

    protected spaceName: string;

    protected spaceDeploymentsPage: SpaceDeploymentsPage;

    public constructor(strategy: ReleaseStrategy, spaceName: string) {
        this.strategy = strategy;
        this.spaceName = spaceName;
        this.spaceDeploymentsPage = new SpaceDeploymentsPage();
    }

    public async openDeploymentsPage(mode: PageOpenMode) {
        logger.info('Open deployments page');
        if (mode === PageOpenMode.UseMenu) {
            let pipelinesInteractions =
                PipelinesInteractionsFactory.create(this.strategy, this.spaceName);
            await pipelinesInteractions.openPipelinesPage(mode);
            await pipelinesInteractions.showDeployments();
            await this.spaceDeploymentsPage.open();
        } else {
            await this.spaceDeploymentsPage.open(mode);
        }
    }

    public async verifyApplications(count: number): Promise<DeployedApplication[]> {
        logger.info('Verify deployed applications');
        let applications = await this.spaceDeploymentsPage.getDeployedApplications();
        expect(applications.length).toBe(count, 'number of deployed applications');
        return Promise.resolve(applications);
    }

    public async verifyApplication(application: DeployedApplication, name: string): Promise<void> {
        logger.info('Verify deployed application');
        expect(application.getName(this.strategy)).toBe(name, 'application name');
    }

    public async verifyResourceUsage() {
        logger.info('Verify resources usage');
        let data = await this.spaceDeploymentsPage.getResourceUsageData();
        expect(data.length).toBe(2, 'there should be stage and prod environment');
        await this.verifyResourceUsageInternal(data);
    }

    public abstract async verifyEnvironments(
        application: DeployedApplication): Promise<DeployedApplicationEnvironment[]>;

    public abstract async verifyStageEnvironment(environment: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void>;

    public abstract async verifyRunEnvironment(environment: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void>;

    protected abstract async verifyResourceUsageInternal(data: ResourceUsageData[]): Promise<void>;
}

class DeploymentsInteractionsReleaseStrategy extends AbstractDeploymentsInteractions {

    public async verifyEnvironments(application: DeployedApplication): Promise<DeployedApplicationEnvironment[]> {
        logger.info('Verify application\'s environments');
        let environments = await application.getEnvironments();
        expect(environments.length).toBe(0, 'number of environments');
        return Promise.resolve(environments);
    }

    public async verifyStageEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void> {
        // nothing to test here
    }

    public async verifyRunEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void> {
        // nothing to test here
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        // nothing to test here
    }
}

class DeploymentsInteractionsStageStrategy extends DeploymentsInteractionsReleaseStrategy {

    public async verifyEnvironments(application: DeployedApplication): Promise<DeployedApplicationEnvironment[]> {
        logger.info('Verify application\'s environments');
        let environments = await application.getEnvironments();
        expect(environments.length).toBe(2, 'number of environments');
        return Promise.resolve(environments);
    }

    public async verifyStageEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void> {
        await this.verifyEnvironment(environments[Environment.STAGE], status, version, podsCount);
    }

    public async verifyRunEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void> {
        // nothing to test here
    }

    protected async verifyEnvironment(environment: DeployedApplicationEnvironment,
        status: DeploymentStatus, version: string, podsCount: number): Promise<void> {
        let environmentName = await environment.getEnvironmentName();

        logger.info(`Verify application\'s ${environmentName} environment`);

        await browser.wait(async () => {
            return await environment.hasRunningPod();
        }, timeouts.LONGER_WAIT, `Wait for ${environmentName} to have running pod`);

        expect(await environment.getDeploymentStatus()).toBe(status,
            `${environmentName} environment status`);
        expect(await environment.getVersion()).toBe(version, `${environmentName} environment version`);
        expect(await environment.getPodsCount()).toBe(podsCount,
            `number of pods on ${environmentName} environment`);
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        await this.verifyResourceUsageDataInternal(data[Environment.STAGE], 'stage');
    }

    protected async verifyResourceUsageDataInternal(data: ResourceUsageData, environmentName: string) {
        logger.info(`Verify ${environmentName} environment resource usage`);

        let stageDataItems = await data.getItems();
        expect(stageDataItems.length).toBe(2, `there should be 2 resource usage data items for ${environmentName}`);

        let cpu = stageDataItems[0];
        expect(await cpu.getActualValue()).
            toBeGreaterThan(0, `the cpu usage data should be > 0 for ${environmentName}`);
        expect(await cpu.getActualValue()).
            toBeLessThanOrEqual(cpu.getMaximumValue(),
                `the cpu usage data should to be <= to maximum for ${environmentName}`);

        let memory = stageDataItems[1];
        expect(await memory.getActualValue()).
            toBeGreaterThan(0, `the memory usage data should be > 0 for ${environmentName}`);
        expect(await memory.getActualValue()).
            toBeLessThanOrEqual(memory.getMaximumValue(),
                `the memory usage data should to be <= to maximum for ${environmentName}`);
    }
}

class DeploymentsInteractionsRunStrategy extends DeploymentsInteractionsStageStrategy {

    public async verifyStageEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void> {
        await this.verifyEnvironment(environments[Environment.STAGE], status, version, podsCount);
    }

    public async verifyRunEnvironment(environments: DeployedApplicationEnvironment[],
        status: DeploymentStatus, version: string, podsCount: number): Promise<void> {
        await this.verifyEnvironment(environments[Environment.RUN], status, version, podsCount);
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        await this.verifyResourceUsageDataInternal(data[Environment.STAGE], 'stage');
        await this.verifyResourceUsageDataInternal(data[Environment.RUN], 'run');
    }
}
