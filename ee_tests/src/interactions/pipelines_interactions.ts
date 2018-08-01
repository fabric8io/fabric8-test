import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as support from '../support';
import { BuildStatus, BuildStatusUtils } from '../support/build_status';
import { PipelineDetails, PipelineStage, SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { ReleaseStrategy } from '../support/release_strategy';
import { PageOpenMode } from '../page_objects/base.page';
import { SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';

export abstract class PipelinesInteractionsFactory {

    public static create(strategy: string, spaceName: string): PipelinesInteractions {
        if (strategy === ReleaseStrategy.RELEASE) {
            return new PipelinesInteractionsReleaseStrategy(strategy, spaceName);
        }

        if (strategy === ReleaseStrategy.STAGE) {
            return new PipelinesInteractionsStageStrategy(strategy, spaceName);
        }

        if (strategy === ReleaseStrategy.RUN) {
            return new PipelinesInteractionsRunStrategy(strategy, spaceName);
        }
        throw 'Unknown release strategy: ' + strategy;
    }
}

export interface PipelinesInteractions {

    openPipelinesPage(mode: PageOpenMode): void;

    showDeployments(): void;

    verifyBuildInfo(): Promise<PipelineDetails>;

    waitToFinish(pipeline: PipelineDetails): void;

    verifyBuildResult(pipeline: PipelineDetails): void;

    verifyBuildStages(pipeline: PipelineDetails): void;
}

abstract class AbstractPipelinesInteractions implements PipelinesInteractions {

    protected strategy: string;

    protected spaceName: string;

    protected spacePipelinePage: SpacePipelinePage;

    public constructor(strategy: string, spaceName: string) {
        this.spaceName = spaceName;
        this.strategy = strategy;
        this.spacePipelinePage = new SpacePipelinePage();
    }

    public async openPipelinesPage(mode: PageOpenMode) {
        support.info('Verifying pipelines page');

        if (mode === PageOpenMode.UseMenu) {
            let dashboardInteractions =
                SpaceDashboardInteractionsFactory.create(this.strategy, this.spaceName);
            await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
            await dashboardInteractions.openPipelinesPage();
            await this.spacePipelinePage.open();
        } else {
            await this.spacePipelinePage.open(mode);
        }
    }

    public async showDeployments(): Promise<void> {
        await this.spacePipelinePage.deploymentsOption.clickWhenReady();
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
        let waitToFinishInternalError: Error | undefined;
        let verifyJenkinsLogError: Error | undefined;
        let ocLogsError: Error | undefined;

        // wait until the pipeline is finished
        try {
            support.info('Wait for pipeline to finish');
            await this.waitToFinishInternal(pipeline);
            support.info('Pipeline is finished');
        } catch (e) {
            support.info('Wait for pipeline to finish failed with error: ' + e);
            await support.screenshotManager.writeScreenshot('pipeline-failed');
            waitToFinishInternalError = e;
        }

        // save Jenkins log
        try {
            support.info('Check the Jenkins log');
            await this.verifyJenkinsLog(pipeline);
            support.info('Jenkins log is OK');
        } catch (e) {
            support.info('Check the Jenkins log failed with error: ' + e);
            await support.screenshotManager.writeScreenshot('jenkins-log-failed');
            // if the UI show Jenkins log faile, try navigating to jenkins directly
            this.showJenkinsLogDirectly();
            verifyJenkinsLogError = e;
        }

        // save OC logs
        try {
            support.info('Save OC Jenkins pod log');
            await this.saveOCJenkinsLogs();
        } catch (e) {
            support.info('Save OC Jenkins pod log failed with error: ' + e);
            ocLogsError = e;
        }

        if (waitToFinishInternalError !== undefined) {
            throw waitToFinishInternalError;
        }

        if (verifyJenkinsLogError !== undefined) {
            throw verifyJenkinsLogError;
        }

        if (ocLogsError !== undefined) {
            throw ocLogsError;
        }
    }

    public async verifyBuildResult(pipeline: PipelineDetails) {
        support.info('Check build status');
        expect(await pipeline.getStatus()).toBe(BuildStatus.COMPLETE, 'build status');
    }

    public async verifyBuildStages(pipeline: PipelineDetails) {
        support.info('Verify pipeline build stages');

        let stages = await pipeline.getStages();
        this.verifyBuildStagesInternal(stages);
    }

    protected abstract async waitToFinishInternal(pipeline: PipelineDetails): Promise<void>;

    protected abstract async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void>;

    protected async verifyJenkinsLog(pipeline: PipelineDetails): Promise<void> {
        await pipeline.viewLog();
        await support.windowManager.switchToNewWindow();
        await browser.wait(until.presenceOf(element(by.cssContainingText('pre', 'Finished:'))),
            support.LONG_WAIT, 'Jenkins log is finished');
        await support.screenshotManager.writeScreenshot('jenkins-log');
        await support.windowManager.switchToMainWindow();
    }

    protected async saveOCJenkinsLogs(): Promise<void> {
        let finished: boolean = false;
        const { exec } = require('child_process');

        support.info('Execute shell script to retrieve logs from OpenShift');

        exec('./oc-get-jenkins-logs.sh ' +
            browser.params.login.user + ' ' +
            browser.params.login.password +
            ' &> ./target/screenshots/oc-logs-output.txt',
            (err: Error, stdout: string | Buffer, stderr: string | Buffer) => {
                if (err !== null) {
                    support.info('External script failed');
                    support.info('STDERR:');
                    support.info(stderr);
                }
                finished = true;
                return;
            }
        );
        await browser.wait(() => finished === true, support.LONGER_WAIT, 'Script is finished');
        support.info('Script finished');
    }

    private async showJenkinsLogDirectly() {
        try {
            support.info('Navigate to Jenkins log directly by URL');
            let osioURL: string = browser.params.target.url.replace('https://', '');
            let jenkinsURL = 'https://jenkins.' + osioURL;
            await browser.get(jenkinsURL);
            await support.screenshotManager.writeScreenshot('jenkins-direct-log');
        } catch (e) {
            // do not propagate the error because it would shadow previous errors
            support.info('Navigate to Jenkins log directly by URL failed. ' + e);
        }
    }
}

class PipelinesInteractionsReleaseStrategy extends AbstractPipelinesInteractions {

    protected async waitToFinishInternal(pipeline: PipelineDetails): Promise<void> {
        await browser.wait(async function () {
            let currentStatus = await pipeline.getStatus();
            if (BuildStatusUtils.buildEnded(currentStatus)) {
                return true;
            } else {
                support.debug('... Current pipeline status: ' + currentStatus);
                await browser.sleep(5000);
                return false;
            }
        }, support.LONGEST_WAIT, 'Pipeline is finished');
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

class PipelinesInteractionsStageStrategy extends PipelinesInteractionsReleaseStrategy {

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

class PipelinesInteractionsRunStrategy extends PipelinesInteractionsStageStrategy {

    protected async waitToFinishInternal(pipeline: PipelineDetails): Promise<void> {
        await browser.wait(async function () {
            let promoted = false;
            support.debug('Before get status');
            let currentStatus = await pipeline.getStatus();
            support.debug('After get status');
            if (BuildStatusUtils.buildEnded(currentStatus)) {
                support.info('Pipeline finished with build status ' + currentStatus);
                return true;
            } else {
                support.debug('... Current pipeline status: ' + currentStatus);
                if (!promoted && await pipeline.isInputRequired()) {
                    support.debug('Input is required');
                    await pipeline.promote();
                    promoted = true;
                    support.debug('Promoted');
                }
                await browser.sleep(5000);
                return false;
            }
        }, support.LONGEST_WAIT, 'Pipeline is finished');
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
