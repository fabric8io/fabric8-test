import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from '../support';
import { SpaceDeploymentsPage, DeploymentStatus, DeployedApplication} from '../page_objects/space_deployments.page';
import { DeployedApplicationEnvironment, Environment, ResourceUsageData } from '../page_objects/space_deployments.page';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { ReleaseStrategy } from '../support/release_strategy';

export abstract class DeploymentsInteractions {

    protected spaceName: string;

    protected spacePipelinePage: SpacePipelinePage;

    protected spaceDeploymentsPage: SpaceDeploymentsPage;

    public static create(strategy: string, spaceName: string) {
        if (strategy === ReleaseStrategy.RELEASE) {
            return new DeploymentsInteractionsReleaseStrategy(spaceName);
        }

        if (strategy === ReleaseStrategy.STAGE) {
            return new DeploymentsInteractionsStageStrategy(spaceName);
        }

        if (strategy === ReleaseStrategy.RUN) {
            return new DeploymentsInteractionsRunStrategy(spaceName);
        }
        throw 'Unknown release strategy: ' + strategy;
    }

    protected constructor(spaceName: string) {
        this.spaceName = spaceName;
        this.spacePipelinePage = new SpacePipelinePage();
        this.spaceDeploymentsPage = new SpaceDeploymentsPage();
    }

    public async showDeploymentsScreen() {
        support.info('Verifying deployments page');
        await this.spacePipelinePage.spaceHeader.deploymentsOption.clickWhenReady();
        await browser.sleep(5000);
        this.spaceDeploymentsPage = new SpaceDeploymentsPage();
    }

    public async verifyApplication(): Promise<DeployedApplication> {
        support.info('Verifying deployed applications');
        let applications = await this.spaceDeploymentsPage.getDeployedApplications();
        expect(applications.length).toBe(1, 'number of deployed applications');

        let application = applications[0];
        expect(application.getName()).toBe(this.spaceName, 'application name');
        return application;
    }

    public async verifyEnvironments(application: DeployedApplication) {
        support.info('Verifying application\'s environments');
        let environments = await application.getEnvironments();
        expect(environments.length).toBe(2, 'number of environments');
        await this.testEnvironmentsInternal(environments);
    }

    public async verifyResourceUsage() {
        support.info('Verifying resources usage');
        let data = await this.spaceDeploymentsPage.getResourceUsageData();
        expect(data.length).toBe(2, 'there should be stage and prod environment');
        await this.verifyResourceUsageInternal(data);
    }

    protected abstract async testEnvironmentsInternal(environments: DeployedApplicationEnvironment[]): Promise<void>;

    protected abstract async verifyResourceUsageInternal(data: ResourceUsageData[]): Promise<void>;
}

export class DeploymentsInteractionsReleaseStrategy extends DeploymentsInteractions {

    protected async testEnvironmentsInternal(environments: DeployedApplicationEnvironment[]) {
        // nothing to test here
    }


    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        // nothing to test here
    }
}

export class DeploymentsInteractionsStageStrategy extends DeploymentsInteractionsReleaseStrategy {
    protected async testEnvironmentsInternal(environments: DeployedApplicationEnvironment[]) {
        await super.testEnvironmentsInternal(environments);
        support.info('Verifying application\'s stage environment');

        let environment = environments[Environment.STAGE];
        expect(environment.isReady()).toBeTruthy('stage environment pod is ready');
        expect(environment.getStatus()).toBe(DeploymentStatus.OK, 'stage environment status');
        expect(environment.getVersion()).toBe('1.0.1', 'stage environment version');
        expect(environment.getPodsCount()).toBe(1, 'number of pods on stage environment');
        // TODO this does not work correctly at the moment
        // expect(await environment.getRunningPodsCount()).toBe(1, 'number of running pods on stage environment');
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        await super.verifyResourceUsageInternal(data);
        support.info('Verifying stage environment resource usage');

        let stageData = data[Environment.STAGE];
        let stageDataItems = await stageData.getItems();
        expect(stageDataItems.length).toBe(2, 'there should be 2 resource usage data items for stage');

        let cpu = stageDataItems[0];
        expect(cpu.getActualValue()).
            toBeGreaterThan(0, 'the cpu usage data should be > 0 for stage');
        expect(cpu.getActualValue()).
            toBeLessThanOrEqual(cpu.getMaximumValue(), 'the cpu usage data should to be <= to maximum for stage');

        let memory = stageDataItems[1];
        expect(memory.getActualValue()).
            toBeGreaterThan(0, 'the memory usage data should be > 0 for stage');
        expect(memory.getActualValue()).
            toBeLessThanOrEqual(memory.getMaximumValue(), 'the memory usage data should to be <= to maximum for stage');
    }
}

export class DeploymentsInteractionsRunStrategy extends DeploymentsInteractionsStageStrategy {
    protected async testEnvironmentsInternal(environments: DeployedApplicationEnvironment[]) {
        await super.testEnvironmentsInternal(environments);
        support.info('Verifying application\'s run environment');

        let environment = environments[Environment.RUN];
        expect(environment.isReady()).toBeTruthy('run environment pod is ready');
        expect(environment.getStatus()).toBe(DeploymentStatus.OK, 'run environment status');
        expect(environment.getVersion()).toBe('1.0.1', 'run environment version');
        expect(environment.getPodsCount()).toBe(1, 'number of pods on run environment');
        // TODO this does not work correctly at the moment
        // expect(await environment.getRunningPodsCount()).toBe(1, 'number of running pods on run environment');
    }

    protected async verifyResourceUsageInternal(data: ResourceUsageData[]) {
        await super.verifyResourceUsageInternal(data);
        support.info('Verifying run environment resource usage');

        let stageData = data[Environment.RUN];
        let stageDataItems = await stageData.getItems();
        expect(stageDataItems.length).toBe(2, 'there should be 2 resource usage data items for run environment');

        let cpu = stageDataItems[0];
        expect(cpu.getActualValue()).
            toBeGreaterThan(0, 'the cpu usage data should be > 0 for run');
        expect(cpu.getActualValue()).
            toBeLessThanOrEqual(cpu.getMaximumValue(), 'the cpu usage data should to be <= to maximum for run');

        let memory = stageDataItems[1];
        expect(memory.getActualValue()).
            toBeGreaterThan(0, 'the memory usage data should be > 0 for run');
        expect(memory.getActualValue()).
            toBeLessThanOrEqual(memory.getMaximumValue(), 'the memory usage data should to be <= to maximum for run');
    }
}