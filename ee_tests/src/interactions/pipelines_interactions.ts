import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as support from '../support';
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
        support.info('Open pipelines page');

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
        support.info('Show Deployments page');
        await this.spacePipelinePage.deploymentsOption.clickWhenReady();
    }

    public async verifyPipelines(count: number): Promise<PipelineDetails[]> {
        support.info('Verify pipelines');
        let pipelines = await this.spacePipelinePage.getPipelines();
        expect(pipelines.length).toBe(count, 'number of pipelines');

        return Promise.resolve(pipelines);
    }

    public async verifyPipelineInfo(pipeline: PipelineDetails,
        applicationName: string, gitRepositoryName: string, buildNumber: number): Promise<void> {
        support.info('Verify pipeline build info');

        expect(await pipeline.getApplicationName()).toBe(applicationName, 'application name');
        expect(await pipeline.getBuildNumber()).toBe(buildNumber, 'build number ' +
            '(could be caused by https://github.com/openshiftio/openshift.io/issues/3742, ' +
            'check screenshots pipeline-info.png and os-pipeline.png, build numbers should be the same)');

        let githubName = browser.params.github.username;
        expect(await pipeline.getRepository()).
            toBe('https://github.com/' + githubName + '/' + gitRepositoryName + '.git', 'repository');

        await support.screenshotManager.save('pipeline-info');
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
            support.info('Pipeline is finished');
            await support.screenshotManager.save(`pipeline-finished`);
        } catch (e) {
            support.info('Wait for pipeline to finish failed with error: ' + e);
            await support.screenshotManager.save('pipeline-failed');
            waitToFinishInternalError = e;
        }

        // save Jenkins log
        try {
            support.info('Check the Jenkins log');
            await this.verifyJenkinsLog(pipeline);
            support.info('Jenkins log is OK');
        } catch (e) {
            support.info('Check the Jenkins log failed with error: ' + e);
            await support.screenshotManager.save('jenkins-log-failed');
            // if the UI show Jenkins log faile, try navigating to jenkins directly
            await this.showJenkinsLogDirectly();
            verifyJenkinsLogError = e;
        } finally {
            if (support.windowManager.getWindowCount() > 1) {
                await support.windowManager.closeCurrentWindow();
            }
        }

        // check OSO pipeline
        try {
            support.info('Check the OpenShift pipeline');
            await this.checkOSPipeline(pipeline);
            support.info('OpenShift pipeline is OK');
        } catch (e) {
            support.info('Check the OpenShift pipeline failed with error: ' + e);
            await support.screenshotManager.save('os-pipeline-failed');
            osoPipelineError = e;
        } finally {
            if (support.windowManager.getWindowCount() > 1) {
                await support.windowManager.closeCurrentWindow();
            }
        }

        // save OC logs
        try {
            support.info('Save OC Jenkins pod log');
            await runner.runScript(
                '.', // working directory
                './oc-get-project-logs.sh', // script
                [browser.params.login.user, browser.params.login.password, 'jenkins'], // params
                './target/screenshots/oc-jenkins-logs.txt',  // output file
                false,
                support.LONGER_WAIT
            );
        } catch (e) {
            support.info('Save OC Jenkins pod log failed with error: ' + e);
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
        support.info('Verify build result info');
        expect(await pipeline.getStatus()).toBe(expectedStatus, 'build status');
    }

    public async verifyBuildStages(pipeline: PipelineDetails) {
        support.info('Verify pipeline build stages');

        let stages = await pipeline.getStages();
        this.verifyBuildStagesInternal(stages);
    }

    protected abstract async waitForStagesToFinish(pipeline: PipelineDetails): Promise<void>;

    protected abstract async verifyBuildStagesInternal(stages: PipelineStage[]): Promise<void>;

    protected async waitForLogLink(pipeline: PipelineDetails): Promise<void> {
        support.info('Wait for View log link');
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
        }, support.LONGER_WAIT, 'View log link is not present (e.g when Jenkins was not unidled, could be ' +
            'caused by https://github.com/openshiftio/openshift.io/issues/4215, check jenkins-direct-log.png)');
    }

    protected async waitForStagesToStart(pipeline: PipelineDetails): Promise<void> {
        support.info('Wait for stages to start');
        await browser.wait(async function () {
            return (await pipeline.getStages()).length > 0;
        }, support.LONGER_WAIT, 'Stages did not start (meaning that Jenkins was probably unidled but the job ' +
        'did not start, could be caused by https://github.com/openshiftio/openshift.io/issues/4020, ' +
            'check pipeline-failed.png and jenkins-log-failed.png)');
    }

    protected async waitForStageToFinish(
        pipeline: PipelineDetails,
        name: string,
        index: number,
        hook: Function = async (p: PipelineDetails) => { }): Promise<void> {

        await browser.wait(async function () {
            return (await pipeline.getStages()).length > index;
        }, support.DEFAULT_WAIT, `Pipeline contain stage with index ${index} (${name})`);

        support.info(`Wait for ${name} to finish`);
        await browser.wait(async function () {
            let currentStatus = await pipeline.getStatus();
            if (BuildStatusUtils.buildEnded(currentStatus)) {
                support.info('Pipeline finished with status ' + currentStatus);
                return true;
            }

            let stageStatus = await (await pipeline.getStages())[index].getStatus();
            support.debug(`${name} status: ${stageStatus}`);

            if (BuildStageStatusUtils.buildEnded(stageStatus)) {
                await support.screenshotManager.save(`stage-${index}-finished`);
                return true;
            } else {
                hook();
                await browser.sleep(5000);
                return false;
            }
        }, support.LONGER_WAIT,
            name + ' is finished (could be caused by ' +
            'https://github.com/openshiftio/openshift.io/issues/3935, check screnshots ' +
            'pipeline-failed.png and jenkins-log-failed.png)');
    }

    private async verifyJenkinsLog(pipeline: PipelineDetails): Promise<void> {
        await pipeline.viewLog();
        await support.windowManager.switchToNewWindow();
        await browser.wait(until.presenceOf(element(by.cssContainingText('pre', 'Finished:'))),
            support.LONG_WAIT, 'Jenkins log does not indicate finished job (could be caused by ' +
            'https://github.com/openshiftio/openshift.io/issues/4180, ' +
            'check screnshot jenkins-log-failed.png)');
        await support.screenshotManager.save('jenkins-log');
    }

    private async showJenkinsLogDirectly() {
        try {
            support.info('Navigate to Jenkins log directly by URL');
            let osioURL: string = browser.params.target.url.replace('https://', '');
            let jenkinsURL = 'https://jenkins.' + osioURL;
            await browser.get(jenkinsURL);
            await support.screenshotManager.save('jenkins-direct-log');
        } catch (e) {
            // do not propagate the error because it would shadow previous errors
            support.info('Navigate to Jenkins log directly by URL failed. ' + e);
        }
    }

    private async checkOSPipeline(pipeline: PipelineDetails): Promise<void> {
        await pipeline.viewBuildInOS();
        await support.windowManager.switchToNewWindow();

        await browser.wait(until.presenceOf(element(by.cssContainingText('h3', 'Status'))));
        let status = await element(by.xpath('//h3[text()="Status"]/../dl[1]/dd[1]/span[1]')).getText();
        expect(status).toBe('Complete');

        await support.screenshotManager.save('os-pipeline');
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
                support.info('Input is required');
                await pipeline.promote();
                support.info('Promoted');
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
