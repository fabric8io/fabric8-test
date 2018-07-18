import * as support from '../support';
import {
  DeployedApplication, DeployedApplicationEnvironment, DeploymentStatus,
  Environment, ResourceUsageData, SpaceDeploymentsPage
} from '../page_objects/space_deployments_tab.page';
import { ReleaseStrategy } from '../support/release_strategy';
import { FeatureLevelUtils } from '../support/feature_level';
import { MainDashboardPage } from '../page_objects/main_dashboard.page';
import { PageOpenMode } from '../..';
import { PipelinesInteractionsFactory } from './pipelines_interactions';
import { browser } from 'protractor';

export abstract class DeploymentsInteractionsFactory {

    public static create(strategy: string, spaceName: string): DeploymentsInteractions {
        if (FeatureLevelUtils.isReleased()) {
            return <DeploymentsInteractions>{
                openDeploymentsPage(): void {},
                verifyApplication(): Promise<DeployedApplication> {
                    // just return dummy value
                    return Promise.resolve(new DeployedApplication(new MainDashboardPage().header));
                },
                verifyEnvironments(application: DeployedApplication): void {},
                verifyResourceUsage(): void {}
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

    verifyApplication(): Promise<DeployedApplication>;

    verifyEnvironments(application: DeployedApplication): void;

    verifyResourceUsage(): void;
}

abstract class AbstractDeploymentsInteractions implements DeploymentsInteractions {

    protected strategy: string;

    protected spaceName: string;

    protected spaceDeploymentsPage: SpaceDeploymentsPage;

    public constructor(strategy: string, spaceName: string) {
        this.strategy = strategy;
        this.spaceName = spaceName;
        this.spaceDeploymentsPage = new SpaceDeploymentsPage();
    }

    public async openDeploymentsPage(mode: PageOpenMode) {
        support.info('Verifying deployments page');
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

    public async verifyApplication(): Promise<DeployedApplication> {
        support.info('Verifying deployed applications');
        let applications = await this.spaceDeploymentsPage.getDeployedApplications();
        expect(applications.length).toBe(1, 'number of deployed applications');

        let application = applications[0];
        expect(application.getName()).toBe(this.spaceName, 'application name');
        return application;
    }

    public async verifyResourceUsage() {
        support.info('Verifying resources usage');
        let data = await this.spaceDeploymentsPage.getResourceUsageData();
        expect(data.length).toBe(2, 'there should be stage and prod environment');
        await this.verifyResourceUsageInternal(data);
    }

    public abstract async verifyEnvironments(application: DeployedApplication): Promise<void>;

    protected abstract async verifyResourceUsageInternal(data: ResourceUsageData[]): Promise<void>;
}

class DeploymentsInteractionsReleaseStrategy extends AbstractDeploymentsInteractions {

    public async verifyEnvironments(application: DeployedApplication): Promise<void> {
        support.info('Verifying application\'s environments');
        let environments = await application.getEnvironments();
        expect(environments.length).toBe(0, 'number of environments');
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        // nothing to test here
    }
}

class DeploymentsInteractionsStageStrategy extends DeploymentsInteractionsReleaseStrategy {

    public async verifyEnvironments(application: DeployedApplication): Promise<void> {
        support.info('Verifying application\'s environments');
        let environments = await application.getEnvironments();
        expect(environments.length).toBe(2, 'number of environments');
        await this.verifyEnvironmentsInternal(environments);
    }

    protected async verifyEnvironmentsInternal(environments: DeployedApplicationEnvironment[]) {
        await this.verifyEnvironmentInternal(environments[Environment.STAGE], 'stage');
    }

    protected async verifyEnvironmentInternal(environment: DeployedApplicationEnvironment, environmentName: string) {
        support.info(`Verifying application\'s ${environmentName} environment`);

        await browser.wait(async () => {
            return await environment.hasRunningPod();
        }, support.LONGER_WAIT, `Wait for ${environmentName} to have running pod`);

        expect(await environment.getDeploymentStatus()).toBe(DeploymentStatus.OK,
            `${environmentName} environment status`);
        expect(await environment.getVersion()).toBe('1.0.1', `${environmentName} environment version`);
        expect(await environment.getPodsCount()).toBe(1, `number of pods on ${environmentName} environment`);
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        await this.verifyResourceUsageDataInternal(data[Environment.STAGE], 'stage');
    }

    protected async verifyResourceUsageDataInternal(data: ResourceUsageData, environmentName: string) {
        support.info(`Verifying ${environmentName} environment resource usage`);

        let stageDataItems = await data.getItems();
        expect(stageDataItems.length).toBe(2, `there should be 2 resource usage data items for ${environmentName}`);

        let cpu = stageDataItems[0];
        expect(cpu.getActualValue()).
            toBeGreaterThan(0, `the cpu usage data should be > 0 for ${environmentName}`);
        expect(cpu.getActualValue()).
            toBeLessThanOrEqual(cpu.getMaximumValue(),
            `the cpu usage data should to be <= to maximum for ${environmentName}`);

        let memory = stageDataItems[1];
        expect(memory.getActualValue()).
            toBeGreaterThan(0, `the memory usage data should be > 0 for ${environmentName}`);
        expect(memory.getActualValue()).
            toBeLessThanOrEqual(memory.getMaximumValue(),
            `the memory usage data should to be <= to maximum for ${environmentName}`);
    }
}

class DeploymentsInteractionsRunStrategy extends DeploymentsInteractionsStageStrategy {

    protected async verifyEnvironmentsInternal(environments: DeployedApplicationEnvironment[]) {
        await this.verifyEnvironmentInternal(environments[Environment.STAGE], 'stage');
        await this.verifyEnvironmentInternal(environments[Environment.RUN], 'run');
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        await this.verifyResourceUsageDataInternal(data[Environment.STAGE], 'stage');
        await this.verifyResourceUsageDataInternal(data[Environment.RUN], 'run');
    }
}
