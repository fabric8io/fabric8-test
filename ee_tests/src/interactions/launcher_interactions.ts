import * as logger from '../support/logging';
import { specContext } from '../support/spec_context';
import { Quickstart } from '../support/quickstart';
import { SelectMissionAndRuntimePage, SelectPipelinePage, SummaryPage } from '../page_objects/launcher.page';
// tslint:disable-next-line:no-duplicate-imports
import { AuthorizeGitPage, CreateApplicationPage, ResultsPage } from '../page_objects/launcher.page';
import { LauncherReleaseStrategy } from '../support/launcher_release_strategy';
import { screenshotManager } from '../support/screenshot_manager';

export abstract class LauncherInteractionsFactory {

    public static create(): LauncherInteractions {
        return new LauncherInteractionsImpl();
    }
}

export interface LauncherInteractions {

    openLauncherPage(): void;

    createApplication(name: string, quickstart: Quickstart, strategy: string): void;

    importApplication(name: string, repository: string, strategy: string): void;
}

class LauncherInteractionsImpl implements LauncherInteractions {

    constructor() {
    }

    async openLauncherPage(): Promise<void> {

    }

    async createApplication(
        name: string,
        quickstart: Quickstart = specContext.getQuickstart(),
        strategy = specContext.getReleaseStrategy().toString()): Promise<void> {

        logger.info('Create new application with name ' + name);
        let createApplicationPage = new CreateApplicationPage();
        await createApplicationPage.setProjectName(name);
        await createApplicationPage.selectCreateCodebase();
        await createApplicationPage.clickContinue();

        logger.info(`Select mission ${quickstart.mission.name} and runtime ${quickstart.runtime.name}`);
        /* Note required order of mission and runtime selection */
        /* https://github.com/openshiftio/openshift.io/issues/3418 */
        let selectMissionPage = new SelectMissionAndRuntimePage();
        await selectMissionPage.selectMission(quickstart.mission.name);
        await selectMissionPage.selectRuntime(quickstart.runtime.name);
        await selectMissionPage.clickContinue();

        let pipeline = new LauncherReleaseStrategy(strategy);
        logger.info('Select pipeline ' + pipeline.name);
        let selectPipelinePage = new SelectPipelinePage();
        await selectPipelinePage.selectPipeline(pipeline.name);
        await selectPipelinePage.clickContinue();

        logger.info('Authorize GitHub and set repository name ' + name);
        let authorizeGitPage = new AuthorizeGitPage();
        await authorizeGitPage.selectGitHubOrganization(specContext.getGitHubUser());
        await authorizeGitPage.selectRepository(name);
        await authorizeGitPage.clickContinue();

        logger.info('Check create application summary');
        let summaryPage = new SummaryPage();
        await summaryPage.clickSetuUp();

        logger.info('Check create application results');
        let resultPage = new ResultsPage();
        await resultPage.newProjectBoosterOkIcon('Creating your new GitHub repository').untilDisplayed();
        await resultPage.newProjectBoosterOkIcon('Pushing your customized Booster code into the repo')
            .untilDisplayed();
        await resultPage.newProjectBoosterOkIcon('Creating your project on OpenShift').untilDisplayed();
        await resultPage.newProjectBoosterOkIcon('Setting up your build pipeline').untilDisplayed();
        await resultPage.newProjectBoosterOkIcon('Configuring to trigger builds on Git pushes')
            .untilDisplayed();
        await resultPage.newProjectBoosterOkIcon('Setting up your codebase')
            .untilDisplayed();
        await screenshotManager.save('launcher');

        await resultPage.clickReturnToDashboard();
    }

    async importApplication(
        name: string,
        repository: string,
        strategy = specContext.getReleaseStrategy().toString()): Promise<void> {

        logger.info('Import existing application with name ' + name);
        let createApplicationPage = new CreateApplicationPage();
        await createApplicationPage.setProjectName(name);
        await createApplicationPage.selectImportCodebase();
        await createApplicationPage.clickContinue();

        logger.info('Authorize GitHub and set repository name ' + name);
        let authorizeGitPage = new AuthorizeGitPage();
        await authorizeGitPage.selectGitHubOrganization(specContext.getGitHubUser());
        await authorizeGitPage.selectRepository(repository);
        await authorizeGitPage.clickContinue();

        let pipeline = new LauncherReleaseStrategy(strategy);
        logger.info('Select pipeline ' + pipeline.name);
        let selectPipelinePage = new SelectPipelinePage();
        await selectPipelinePage.selectPipeline(pipeline.name);
        await selectPipelinePage.clickContinue();

        logger.info('Check import application summary');
        let summaryPage = new SummaryPage();
        await summaryPage.clickImport();

        logger.info('Check import application results');
        let resultPage = new ResultsPage();
        await resultPage.newProjectBoosterOkIcon('Creating your project on OpenShift').untilDisplayed();
        await resultPage.newProjectBoosterOkIcon('Setting up your build pipeline').untilDisplayed();
        await resultPage.newProjectBoosterOkIcon('Configuring to trigger builds on Git pushes')
            .untilDisplayed();

        await screenshotManager.save('launcher');

        await resultPage.clickReturnToDashboard();
    }
}
