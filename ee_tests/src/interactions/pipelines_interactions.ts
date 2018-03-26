import { browser, element, by, ExpectedConditions as until, $, $$ } from 'protractor';
import * as support from '../support';
import { SpacePipelinePage } from '../page_objects/space_pipeline.page';
import { ReleaseStrategy } from '../support/release_strategy';
import { SpaceDashboardPage } from '../page_objects';
import { Button } from '../ui';

// TODO - Error conditions to trap
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
        /* Open the pipeline page, select the pipeline by name */
        await this.spaceDashboardPage.pipelinesSectionTitle.clickWhenReady(support.LONGER_WAIT);
        support.debug('Accessed pipeline page');

        let spacePipelinePage = new SpacePipelinePage();
        let pipelineByName = new Button(spacePipelinePage.pipelineByName(this.spaceName), 'Pipeline By Name');

        support.debug('Looking for the pipeline name');
        await pipelineByName.untilPresent(support.LONGER_WAIT);

        /* Verify that only (1) new matching pipeline is found */
        support.debug('Verifying that only 1 pipeline is found with a matching name');
        expect(await spacePipelinePage.allPipelineByName(this.spaceName).count()).toBe(1);

        /* Save the pipeline page output to stdout for logging purposes */
        let pipelineText = await spacePipelinePage.pipelinesPage.getText();
        support.debug('Pipelines page contents = ' + pipelineText);

        /* Find the pipeline name */
        await pipelineByName.untilClickable(support.LONGER_WAIT);

        /* If the build log link is not viewable - the build failed to start */
        // tslint:disable-next-line:max-line-length
        support.debug('Verifying that the build has started - check https://github.com/openshiftio/openshift.io/issues/1194');
        await spacePipelinePage.viewLog.untilClickable(support.LONGEST_WAIT);
        expect(spacePipelinePage.viewLog.isDisplayed()).toBe(true);
    }

    public async waitToFinish() {
        support.info('Waiting for pipeline to finish');
        await this.waitToFinishInternal();
    }

    protected abstract async waitToFinishInternal(): Promise<void>;
}

export class PipelinesInteractionsReleaseStrategy extends PipelinesInteractions {
    protected async waitToFinishInternal(): Promise<void> {
        await this.spacePipelinePage.successBar.untilDisplayed(support.LONGEST_WAIT);
    }
}

export class PipelinesInteractionsStageStrategy extends PipelinesInteractions {
    protected async waitToFinishInternal(): Promise<void> {
        await this.spacePipelinePage.stageIcon.untilClickable(support.LONGEST_WAIT);
    }
}

export class PipelinesInteractionsRunStrategy extends PipelinesInteractions {
    protected async waitToFinishInternal(): Promise<void> {
        /* Promote to both stage and run - build has completed - if inputRequired is not present, build has failed */
        support.debug('Verifying that the promote dialog is opened');
        // tslint:disable-next-line:max-line-length
        let inputRequired = new Button(this.spacePipelinePage.inputRequiredByPipelineByName(this.spaceName), 'InputRequired button');

        await inputRequired.clickWhenReady(support.LONGEST_WAIT);
        await this.spacePipelinePage.promoteButton.clickWhenReady(support.LONGER_WAIT);
        support.writeScreenshot('target/screenshots/pipeline_promote_' + this.spaceName + '.png');

        /* Verify stage and run icons are present - these will timeout and cause failures if missing */
        await this.spacePipelinePage.stageIcon.untilClickable(support.LONGEST_WAIT);
        await this.spacePipelinePage.runIcon.untilClickable(support.LONGEST_WAIT);
    }
}
