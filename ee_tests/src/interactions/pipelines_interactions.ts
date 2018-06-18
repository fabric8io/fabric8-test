import { browser, element, by, ExpectedConditions as until } from 'protractor';
import * as support from '../support';
import { BuildStatus, BuildStatusUtils } from '../support/build_status';
import { SpacePipelinePage, PipelineDetails } from '../page_objects/space_pipeline_tab.page';
import { ReleaseStrategy } from '../support/release_strategy';
import { PipelineStage } from '../page_objects/space_pipeline_tab.page';
import { PageOpenMode } from '../..';
import { SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';

export abstract class PipelinesInteractions {

    protected spaceName: string;

    protected spacePipelinePage: SpacePipelinePage;

    public static create(strategy: string, spaceName: string) {
        if (strategy === ReleaseStrategy.RELEASE) {
            return new PipelinesInteractionsReleaseStrategy(spaceName);
        }

        if (strategy === ReleaseStrategy.STAGE) {
            return new PipelinesInteractionsStageStrategy(spaceName);
        }

        if (strategy === ReleaseStrategy.RUN) {
            return new PipelinesInteractionsRunStrategy(spaceName);
        }
        throw 'Unknown release strategy: ' + strategy;
    }

    protected constructor(spaceName: string) {
        this.spaceName = spaceName;
        this.spacePipelinePage = new SpacePipelinePage();
    }

    public async showPipelinesScreen() {
        support.info('Verifying pipelines page');
        let dashboardInteractions = SpaceDashboardInteractionsFactory.create(this.spaceName);
        await dashboardInteractions.openSpaceDashboard(PageOpenMode.UseMenu);
        await dashboardInteractions.openPipelinesPage();

        this.spacePipelinePage = new SpacePipelinePage();
        await this.spacePipelinePage.open();
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
        try {
            support.info('Waiting for pipeline to finish');
            await this.waitToFinishInternal(pipeline);
            support.info('Pipeline is finished');
        } catch (e) {
            support.info('Waiting for pipeline to finish failed with error: ' + e);
        } finally {
            try {
                // save Jenkins log no matter if pipeline finished
                support.info('Check the Jenkins log');
                await this.verifyJenkinsLog(pipeline);
            } catch (e) {
                await support.writeScreenshot('target/screenshots/jenkins-log-failed.png');
                await support.writePageSource('target/screenshots/jenkins-log-failed.html');
                // if the UI Show log fails, try navigating to jenkins directly
                support.info('Check the Jenkins log failed, go to Jenkins URL directly');
                support.info('Exception: ' + e);
                let osioURL: string = browser.params.target.url.replace('https://', '');
                let jenkinsURL = 'https://jenkins.' + osioURL;
                await browser.get(jenkinsURL);
                await support.writeScreenshot('target/screenshots/jenkins-direct-log.png');
                await support.writePageSource('target/screenshots/jenkins-direct-log.html');
                throw e;
            } finally {
                // save OC logs no matter if Jenkins log was retrieved
                support.info('Save OC Jenkins pod log');
                await this.saveOCJenkinsLogs();
            }
        }
    }

    public async verifyBuildResult(pipeline: PipelineDetails) {
        support.info('Check build status');
        expect(await pipeline.getStatus()).toBe(BuildStatus.COMPLETE, 'build status');
    }

    public async verifyBuildStages(pipeline: PipelineDetails) {
        support.info('Verifying pipeline build stages');

        let stages = await pipeline.getStages();
        this.verifyBuildStagesInternal(stages);
    }

    protected abstract async waitToFinishInternal(pipeline: PipelineDetails): Promise<void>;

    protected abstract async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void>;

    protected async verifyJenkinsLog(pipeline: PipelineDetails): Promise<void> {
        await pipeline.viewLog();
        await support.switchToWindow(3, 2);
        await browser.wait(until.presenceOf(element(by.cssContainingText('pre', 'Finished:'))),
          support.LONG_WAIT, 'Jenkins log is finished');
        await support.writeScreenshot('target/screenshots/jenkins-log.png');
        await support.writePageSource('target/screenshots/jenkins-log.html');
        await support.switchToWindow(3, 0);
    }

    protected async saveOCJenkinsLogs(): Promise<void> {
        let finished: boolean = false;
        const { exec } = require('child_process');

        support.info('Executing shell script to retrieve logs from OpenShift');

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
        await browser.wait(() => finished === true);
        support.info('Script finished');
    }
}

export class PipelinesInteractionsReleaseStrategy extends PipelinesInteractions {

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
                support.info('Pipeline finished with build status ' + currentStatus);
                return true;
            } else {
              support.debug('... Current pipeline status: ' + currentStatus);
                if (await pipeline.isInputRequired()) {
                    await pipeline.promote();
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
