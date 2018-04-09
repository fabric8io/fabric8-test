import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from '../support';
import { BuildStatus, BuildStatusUtils } from '../support/build_status';
import { SpacePipelinePage, PipelineDetails } from '../page_objects/space_pipeline.page';
import { ReleaseStrategy } from '../support/release_strategy';
import { SpaceDashboardPage, PipelineStage } from '../page_objects';
import { Button } from '../ui';

// TODO - Error conditions to trap (copied from original code)
// 1) Jenkins build log - find errors if the test fails
// 2) Jenkins pod log - find errors if the test fails
// 3) Presence of build errors in UI
// 4) Follow the stage and run links */
export abstract class PipelinesInteractions {

    protected spaceName: string;

    protected spacePipelinePage: SpacePipelinePage;

    protected spaceDashboardPage: SpaceDashboardPage;

    public static create(strategy: string, spaceName: string, spaceDashboardPage: SpaceDashboardPage) {
        if (strategy === ReleaseStrategy.RELEASE) {
            return new PipelinesInteractionsReleaseStrategy(spaceName, spaceDashboardPage);
        }

        if (strategy === ReleaseStrategy.STAGE) {
            return new PipelinesInteractionsStageStrategy(spaceName, spaceDashboardPage);
        }

        if (strategy === ReleaseStrategy.RUN) {
            return new PipelinesInteractionsRunStrategy(spaceName, spaceDashboardPage);
        }
        throw 'Unknown release strategy: ' + strategy;
    }

    protected constructor(spaceName: string, spaceDashboardPage: SpaceDashboardPage) {
        this.spaceName = spaceName;
        this.spacePipelinePage = new SpacePipelinePage();
        this.spaceDashboardPage = spaceDashboardPage;
    }

    public async showPipelinesScreen() {
        support.info('Verifying pipelines page');

        await this.spaceDashboardPage.pipelinesSectionTitle.clickWhenReady(support.LONGER_WAIT);
        await browser.sleep(5000);
    }

    public async verifyBuildInfo(): Promise<PipelineDetails> {
        support.info('Verifying pipeline build info');

        let pipelines = await this.spacePipelinePage.getPipelines();
        expect(pipelines.length).toBe(1, 'number of pipelines');

        let pipeline = pipelines[0];
        expect(await pipeline.getApplicationName()).toBe(this.spaceName, 'application name');
        expect(await pipeline.getBuildNumber()).toBe(1, 'build number');

        let githubName = browser.params.github.username;
        expect(await pipeline.getRepository()).
            toBe('https://github.com/' + githubName + '/' + this.spaceName + '.git', 'repository');
        return Promise.resolve(pipeline);
    }

    public async waitToFinish(pipeline: PipelineDetails) {
        support.info('Waiting for pipeline to finish');

        await this.waitToFinishInternal(pipeline);
        expect(await pipeline.getStatus()).toBe(BuildStatus.COMPLETE, 'build status');
    }

    public async verifyBuildStages(pipeline: PipelineDetails) {
        support.info('Verifying pipeline build stages');

        let stages = await pipeline.getStages();
        this.verifyBuildStagesInternal(stages);
    }

    protected abstract async waitToFinishInternal(pipeline: PipelineDetails): Promise<void>;

    protected abstract async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void>;
}

export class PipelinesInteractionsReleaseStrategy extends PipelinesInteractions {

    protected async waitToFinishInternal(pipeline: PipelineDetails): Promise<void> {
        await browser.wait(async function () {
            let currentStatus = await pipeline.getStatus();
            if (BuildStatusUtils.buildEnded(currentStatus)) {
                return true;
            } else {
                await browser.sleep(5000);
                return false;
            }
        }, support.LONGEST_WAIT);
    }

    protected async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void> {
        expect(stages.length).toBe(1, 'number of stages for release strategy');
        await this.verifyBuildReleaseStage(stages);
    }

    protected async verifyBuildReleaseStage(stages: PipelineStage[]) {
        expect(await stages[0].getName()).toBe('Build Release', 'stage name');
        expect(await stages[0].getStatus()).toBe(BuildStatus.COMPLETE, 'stage status');
    }
}

export class PipelinesInteractionsStageStrategy extends PipelinesInteractionsReleaseStrategy {

    protected async waitToFinishInternal(pipeline: PipelineDetails): Promise<void> {
        await super.waitToFinishInternal(pipeline);
    }

    protected async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void> {
        expect(stages.length).toBe(2, 'number of stages for release&stage strategy');
        await this.verifyBuildReleaseStage(stages);
        await this.verifyRolloutStage(stages);
    }

    protected async verifyRolloutStage(stages: PipelineStage[]) {
        expect(await stages[1].getName()).toBe('Rollout to Stage', 'stage name');
        expect(await stages[1].getStatus()).toBe(BuildStatus.COMPLETE, 'stage status');
    }
}

export class PipelinesInteractionsRunStrategy extends PipelinesInteractionsStageStrategy {

    protected async waitToFinishInternal(pipeline: PipelineDetails): Promise<void> {
        await browser.wait(async function () {
            let currentStatus = await pipeline.getStatus();
            if (BuildStatusUtils.buildEnded(currentStatus)) {
                return true;
            } else {
                if (await pipeline.approvalRequired()) {
                    await pipeline.approve();
                }
                await browser.sleep(5000);
                return false;
            }
        }, support.LONGEST_WAIT);
    }

    protected async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void> {
        expect(stages.length).toBe(4, 'number of stages for release&stage&promote strategy');
        await this.verifyBuildReleaseStage(stages);
        await this.verifyRolloutStage(stages);

        expect(await stages[2].getName()).toBe('Approve', 'stage name');
        expect(await stages[2].getStatus()).toBe(BuildStatus.COMPLETE, 'stage status');

        expect(await stages[3].getName()).toBe('Rollout to Run', 'stage name');
        expect(await stages[3].getStatus()).toBe(BuildStatus.COMPLETE, 'stage status');
    }
}
