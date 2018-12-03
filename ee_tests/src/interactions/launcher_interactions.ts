import { browser } from 'protractor';
// tslint:disable-next-line:max-line-length
import { AuthorizeGitPage, CreateApplicationPage, ResultsPage, SelectMissionAndRuntimePage, SelectPipelinePage, SetupStatus, SummaryPage } from '../page_objects/launcher.page';
import { LauncherReleaseStrategy } from '../support/launcher_release_strategy';
import * as logger from '../support/logging';
import { Quickstart } from '../support/quickstart';
import { screenshotManager } from '../support/screenshot_manager';
import { specContext } from '../support/spec_context';
import * as timeouts from '../support/timeouts';

export abstract class LauncherInteractionsFactory {

    public static create(): LauncherInteractions {
        return new LauncherInteractionsImpl();
    }
}

export interface LauncherInteractions {

    createApplication(name: string, quickstart: Quickstart, strategy: string): void;

    importApplication(name: string, repository: string, strategy: string): void;
}

class LauncherInteractionsImpl implements LauncherInteractions {

    async createApplication(
        name: string,
        quickstart: Quickstart = specContext.getQuickstart(),
        strategy = specContext.getReleaseStrategy().toString()): Promise<void> {

        logger.info('Create new application with name ' + name);
        await screenshotManager.save('create-app');
        await this.createApplicationStep(name, true);

        logger.info(`Select mission ${quickstart.mission.name} and runtime ${quickstart.runtime.name}`);
        await this.selectMissionAndRuntimeStep(quickstart);

        let pipeline = new LauncherReleaseStrategy(strategy);
        logger.info('Select pipeline ' + pipeline.name);
        await this.selectPipelineStep(pipeline);

        logger.info('Authorize GitHub and set repository name ' + name);
        await this.authorizeGitHubStep(name);

        logger.info('Check create application summary');
        await this.summaryPageStep(name, quickstart, pipeline);

        logger.info('Check create application results');
        await this.resultPageStep();
    }

    async importApplication(
        name: string,
        repository: string,
        strategy = specContext.getReleaseStrategy().toString()): Promise<void> {

        logger.info('Import existing application with name ' + repository);
        await this.createApplicationStep(repository, false);

        logger.info('Authorize GitHub and set repository name ' + name);
        await this.authorizeGitHubStep(name);

        let pipeline = new LauncherReleaseStrategy(strategy);
        logger.info('Select pipeline ' + pipeline.name);
        await this.selectPipelineStep(pipeline);

        logger.info('Check import application summary');
        let summaryPage = new SummaryPage();
        await summaryPage.clickImport();

        logger.info('Check import application results');
        let resultPage = new ResultsPage();

        await screenshotManager.save('launcher');

        await resultPage.clickReturnToDashboard();
    }

    private async createApplicationStep(name: string, createNew: boolean): Promise<void> {
        let createApplicationPage = new CreateApplicationPage();
        await createApplicationPage.setProjectName(name);
        if (createNew) {
            await createApplicationPage.selectCreateCodebase();
        } else {
            await createApplicationPage.selectImportCodebase();
        }
        await createApplicationPage.clickContinue();
    }

    private async selectMissionAndRuntimeStep(quickstart: Quickstart): Promise<void> {
        /* Note required order of mission and runtime selection */
        /* https://github.com/openshiftio/openshift.io/issues/3418 */
        let selectMissionPage = new SelectMissionAndRuntimePage();
        await selectMissionPage.selectMission(quickstart.mission.name);
        await selectMissionPage.selectRuntime(quickstart.runtime.name);
        await selectMissionPage.clickContinue();
    }

    private async selectPipelineStep(pipeline: LauncherReleaseStrategy): Promise<void> {
        let selectPipelinePage = new SelectPipelinePage();
        await selectPipelinePage.selectPipeline(pipeline.name);
        await selectPipelinePage.clickContinue();
    }

    private async authorizeGitHubStep(name: string): Promise<void> {
        let authorizeGitPage = new AuthorizeGitPage();
        await authorizeGitPage.selectLocation(specContext.getGitHubUser());
        await authorizeGitPage.selectRepository(name);
        await authorizeGitPage.clickContinue();
    }

    private async summaryPageStep(
        name: string,
        quickstart: Quickstart,
        pipeline: LauncherReleaseStrategy): Promise<void> {

        let summaryPage = new SummaryPage();
        expect(await summaryPage.getMission()).toBe(quickstart.mission.name, 'Mission');
        expect(await summaryPage.getRuntime()).toContain(quickstart.runtime.name, 'Runtime');
        expect(await summaryPage.getPipeline()).toBe(pipeline.name, 'Pipeline');
        expect(await summaryPage.getApplicationName()).toBe(name, 'Application name');
        expect(await summaryPage.getVersion()).toBe('1.0.0', 'Version');
        expect(await summaryPage.getGitHubUserName()).toBe(specContext.getGitHubUser(), 'User name');
        expect(await summaryPage.getLocation()).toBe(specContext.getGitHubUser(), 'GitHub location');
        expect(await summaryPage.getRepository()).toBe(name, 'GitHub repository');
        await screenshotManager.save('launcher-summary');
        await summaryPage.clickSetUp();
    }

    private async resultPageStep(): Promise<void> {
        let resultPage = new ResultsPage();
        await browser.wait(
            async () => {
                try {
                    let isInProgress = (await resultPage.getSetupStatus()) === SetupStatus.IN_PROGRESS;
                    return !isInProgress;
                } catch (e) {
                    logger.debug('Retrieving of result page status failed, retrying' + e);
                    return false;
                }
            },
            timeouts.LONGER_WAIT,
            'Setup is finished');

        expect(await resultPage.getSetupStatus()).toBe(SetupStatus.OK, 'Results summary OK');

        let setupSteps = await resultPage.getSetupSteps();
        expect(setupSteps.length).toBe(6);
        for (let step of setupSteps) {
            let title = await step.getTitle();
            let status = await step.getStatus();
            logger.debug(title + ': ' + status);
            expect(status).toBe(SetupStatus.OK, title + ' should be OK');
        }

        await screenshotManager.save('launcher-results');
        await resultPage.clickReturnToDashboard();
    }
}
