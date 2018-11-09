import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { specContext } from '../support/spec_context';
import { windowManager } from '../support/window_manager';
import { screenshotManager } from '../support/screenshot_manager';
import { BuildStageStatus, BuildStageStatusUtils, BuildStatus, BuildStatusUtils } from '../support/build_status';
import { PipelineDetails, PipelineStage, SpacePipelinePage } from '../page_objects/space_pipeline_tab.page';
import { ReleaseStrategy } from '../support/release_strategy';
import { PageOpenMode } from '../page_objects/base.page';
import { SpaceDashboardInteractionsFactory } from './space_dashboard_interactions';
import * as runner from '../support/script_runner';

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

    verifyPipelines(count: number): Promise<PipelineDetails[]>;

    verifyPipelineInfo(pipeline: PipelineDetails,
        applicationName: string, gitRepositoryName: string, buildNumber: number): Promise<void>;

    waitToFinish(pipeline: PipelineDetails): void;

    verifyBuildResult(pipeline: PipelineDetails, expectedStatus: BuildStatus): void;

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
        logger.info('Open pipelines page');

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
        logger.info('Show Deployments page');
        await this.spacePipelinePage.deploymentsOption.clickWhenReady();
    }

    public async verifyPipelines(count: number): Promise<PipelineDetails[]> {
        logger.info('Verify pipelines');
        let pipelines = await this.spacePipelinePage.getPipelines();
        expect(pipelines.length).toBe(count, 'number of pipelines');

        return Promise.resolve(pipelines);
    }

    public async verifyPipelineInfo(pipeline: PipelineDetails,
        applicationName: string, gitRepositoryName: string, buildNumber: number): Promise<void> {
        logger.info('Verify pipeline build info');

        expect(await pipeline.getApplicationName()).toBe(applicationName, 'application name');
        expect(await pipeline.getBuildNumber()).toBe(buildNumber, 'build number ' +
            '(could be caused by https://github.com/openshiftio/openshift.io/issues/3742, ' +
            'check screenshots pipeline-info.png and os-pipeline.png, build numbers should be the same)');

        let githubName = specContext.getGitHubUser();
        expect(await pipeline.getRepository()).
            toBe('https://github.com/' + githubName + '/' + gitRepositoryName + '.git', 'repository');

        await screenshotManager.save('pipeline-info');
        return Promise.resolve(pipeline);
    }

    public async waitToFinish(pipeline: PipelineDetails) {
        let waitToFinishInternalError: Error | undefined;
        let verifyJenkinsLogError: Error | undefined;
        let osoPipelineError: Error | undefined;

        // wait until the pipeline is finished
        try {
            await this.waitForLogLink(pipeline);
            await this.waitForStagesToStart(pipeline);
            await this.waitForStagesToFinish(pipeline);
            logger.info('Pipeline is finished');
            await screenshotManager.save(`pipeline-finished`);
        } catch (e) {
            logger.info('Wait for pipeline to finish failed with error: ' + e);
            await screenshotManager.save('pipeline-failed');
            waitToFinishInternalError = e;
        }

        // save Jenkins log
        try {
            logger.info('Check the Jenkins log');
            await this.verifyJenkinsLog(pipeline);
            logger.info('Jenkins log is OK');
        } catch (e) {
            logger.info('Check the Jenkins log failed with error: ' + e);
            await screenshotManager.save('jenkins-log-failed');
            // if the UI show Jenkins log faile, try navigating to jenkins directly
            await this.showJenkinsLogDirectly();
            verifyJenkinsLogError = e;
        } finally {
            await windowManager.closeAllWindows();
        }

        // check OSO pipeline
        try {
            logger.info('Check the OpenShift pipeline');
            await this.checkOSPipeline(pipeline);
            logger.info('OpenShift pipeline is OK');
        } catch (e) {
            logger.info('Check the OpenShift pipeline failed with error: ' + e);
            await screenshotManager.save('os-pipeline-failed');
            osoPipelineError = e;
        } finally {
            await windowManager.closeAllWindows();
        }

        // save OC logs
        try {
            logger.info('Save OC Jenkins pod log');
            await runner.runScript(
                '.', // working directory
                './oc-get-project-logs.sh', // script
                [specContext.getUser(), specContext.getPassword(), 'jenkins'], // params
                './target/screenshots/oc-jenkins-logs.txt',  // output file
                false,
                timeouts.LONGER_WAIT
            );
        } catch (e) {
            logger.info('Save OC Jenkins pod log failed with error: ' + e);
        }

        if (waitToFinishInternalError !== undefined) {
            throw waitToFinishInternalError;
        }

        if (verifyJenkinsLogError !== undefined) {
            throw verifyJenkinsLogError;
        }

        if (osoPipelineError !== undefined) {
            throw osoPipelineError;
        }
    }

    public async verifyBuildResult(pipeline: PipelineDetails, expectedStatus: BuildStatus) {
        logger.info('Verify build result info');
        expect(await pipeline.getStatus()).toBe(expectedStatus, 'build status');
    }

    public async verifyBuildStages(pipeline: PipelineDetails) {
        logger.info('Verify pipeline build stages');

        let stages = await pipeline.getStages();
        this.verifyBuildStagesInternal(stages);
    }

    protected abstract async waitForStagesToFinish(pipeline: PipelineDetails): Promise<void>;

    protected abstract async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void>;

    protected async waitForLogLink(pipeline: PipelineDetails): Promise<void> {
        logger.info('Wait for View log link');
        await browser.wait(async function () {
            let currentStatus = await pipeline.getStatus();
            if (BuildStatusUtils.buildEnded(currentStatus)) {
                return true;
            } else if (await pipeline.isViewLogPresent()) {
                return true;
            } else {
                await browser.sleep(5000);
                return false;
            }
        }, timeouts.LONGER_WAIT, 'View log link is not present (e.g when Jenkins was not unidled, could be ' +
            'caused by https://github.com/openshiftio/openshift.io/issues/4215, check jenkins-direct-log.png)');
    }

    protected async waitForStagesToStart(pipeline: PipelineDetails): Promise<void> {
        logger.info('Wait for stages to start');
        await browser.wait(async function () {
            return (await pipeline.getStages()).length > 0;
        }, timeouts.LONGER_WAIT, 'Stages did not start (meaning that Jenkins was probably unidled but the job ' +
        'did not start). Check jenkins pod (if it exists, how long it exists, its state) ' +
        'and events in oc-jenkins-logs.txt.');
    }

    protected async waitForStageToFinish(
        pipeline: PipelineDetails,
        name: string,
        index: number,
        hook: Function = async (p: PipelineDetails) => { }): Promise<void> {

        await browser.wait(async function () {
            return (await pipeline.getStages()).length > index;
        }, timeouts.DEFAULT_WAIT, `Pipeline contain stage with index ${index} (${name})`);

        logger.info(`Wait for ${name} to finish`);
        await browser.wait(async function () {
            let currentStatus = await pipeline.getStatus();
            if (BuildStatusUtils.buildEnded(currentStatus)) {
                logger.info('Pipeline finished with status ' + currentStatus);
                return true;
            }

            let stageStatus = await (await pipeline.getStages())[index].getStatus();
            logger.debug(`${name} status: ${stageStatus}`);

            if (BuildStageStatusUtils.buildEnded(stageStatus)) {
                await screenshotManager.save(`stage-${index}-finished`);
                return true;
            } else {
                await hook();
                await browser.sleep(5000);
                return false;
            }
        }, timeouts.LONGER_WAIT,
            name + ' is finished (could be caused by ' +
            'https://github.com/openshiftio/openshift.io/issues/3935, check screnshots ' +
            'pipeline-failed.png and jenkins-log-failed.png)');
    }

    private async verifyJenkinsLog(pipeline: PipelineDetails): Promise<void> {
        await pipeline.viewLog();
        await windowManager.switchToNewWindow();
        await browser.wait(until.presenceOf(element(by.cssContainingText('pre', 'Finished:'))),
            timeouts.LONG_WAIT, 'Jenkins log does not indicate finished job ' +
            '(check screnshot jenkins-log-failed.png)');
        await screenshotManager.save('jenkins-log');
    }

    private async showJenkinsLogDirectly() {
        try {
            logger.info('Navigate to Jenkins log directly by URL');
            await windowManager.createNewWindow(specContext.getJenkinsUrl());
            await screenshotManager.save('jenkins-direct-log');
        } catch (e) {
            // do not propagate the error because it would shadow previous errors
            logger.info('Navigate to Jenkins log directly by URL failed. ' + e);
        }
    }

    private async checkOSPipeline(pipeline: PipelineDetails): Promise<void> {
        try {
            logger.debug('View build in OpenShift');
            await pipeline.viewBuildInOS();
            await windowManager.switchToNewWindow();

            await browser.wait(until.presenceOf(element(by.cssContainingText('h3', 'Status'))),
                timeouts.DEFAULT_WAIT, 'OSO console does not contain Status');
            let status = await element(by.xpath('//h3[text()="Status"]/../dl[1]/dd[1]/span[1]')).getText();
            expect(status).toBe('Complete');

            await screenshotManager.save('os-pipeline');
        } catch (e) {
            logger.error('Check OpenShift pipeline failed with error. ' + e);
            await screenshotManager.save('os-pipeline-failed');
        }
    }
}

class PipelinesInteractionsReleaseStrategy extends AbstractPipelinesInteractions {

    protected async waitForStagesToFinish(pipeline: PipelineDetails): Promise<void> {
        await this.waitForStageToFinish(pipeline, 'Release stage', 0);
    }

    protected async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void> {
        expect(stages.length).toBe(1, 'number of stages for release strategy');
        await this.verifyBuildReleaseStage(stages);
    }

    protected async verifyBuildReleaseStage(stages: PipelineStage[]) {
        await this.verifyBuildStage(stages, 0, 'Build Image');
    }

    protected async verifyBuildStage(stages: PipelineStage[], index: number, name: string) {
        expect(await stages[index].getName()).toBe(name, 'stage name');
        expect(await stages[index].getStatus()).toBe(BuildStageStatus.SUCCESS, 'stage status');
    }
}

class PipelinesInteractionsStageStrategy extends PipelinesInteractionsReleaseStrategy {

    protected async waitForStagesToFinish(pipeline: PipelineDetails): Promise<void> {
        await super.waitForStagesToFinish(pipeline);
        await super.waitForStageToFinish(pipeline, 'Rollout to Stage', 1);
    }

    protected async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void> {
        expect(stages.length).toBe(2, 'number of stages for release&stage strategy');
        await this.verifyBuildReleaseStage(stages);
        await this.verifyRolloutStage(stages);
    }

    protected async verifyRolloutStage(stages: PipelineStage[]) {
        await super.verifyBuildStage(stages, 1, 'Rollout to Stage');
    }
}

class PipelinesInteractionsRunStrategy extends PipelinesInteractionsStageStrategy {

    protected async waitForStagesToFinish(pipeline: PipelineDetails): Promise<void> {
        await super.waitForStagesToFinish(pipeline);

        let promoted = false;
        await super.waitForStageToFinish(pipeline, 'Approve', 2, async (p: PipelineDetails) => {
            if (!promoted && await pipeline.isInputRequired()) {
                logger.info('Input is required');
                await pipeline.promote();
                logger.info('Promoted');
                promoted = true;
            }
        });
        await super.waitForStageToFinish(pipeline, 'Rollout to Run', 3);
    }

    protected async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void> {
        expect(stages.length).toBe(4, 'number of stages for release&stage&promote strategy');
        await this.verifyBuildReleaseStage(stages);
        await this.verifyRolloutStage(stages);
        await this.verifyBuildStage(stages, 2, 'Approve');
        await this.verifyBuildStage(stages, 3, 'Rollout to Run');
    }
}
