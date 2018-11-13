import { TextInput } from '../ui/text_input';
import { browser, by, element, ElementFinder, ExpectedConditions as until } from 'protractor';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';
import * as timeouts from '../support/timeouts';
import { specContext } from '../support/spec_context';

export class CreateApplicationPage {

    async setProjectName(name: string) {
        let projectName = new TextInput(element(by.id('projectName')), 'Project Name');
        await projectName.ready();
        await projectName.clear();
        await projectName.sendKeys(name);
    }

    async selectCreateCodebase(): Promise<void> {
        let createNewApplicationCard = new BaseElement(element(by.css('input[value="createapp"]')),
            'Create a new codebase'
        );
        await createNewApplicationCard.clickWhenReady();
        // https://github.com/fabric8io/fabric8-test/issues/714
        await browser.sleep(5000);
    }

    async selectImportCodebase(): Promise<void> {
        let importExistingApplicationCard = new BaseElement(
            element(by.css('input[value="importapp"]')),
            'Import an existing codebase'
        );
        await importExistingApplicationCard.clickWhenReady();
    }

    async clickContinue(): Promise<void> {
        let continueButton = new Button(element(by.id('cancelImportsButton')), 'Continue');
        await continueButton.clickWhenReady();
    }
}

export class SelectMissionAndRuntimePage {

    private sectionElement = specContext.isProdPreview() ? element(by.tagName('f8launcher-missionruntime-step')) :
        element(by.tagName('f8launcher-missionruntime-createapp-step'));

    async selectMission(name: string) {
        let selection = new Button(
            this.sectionElement.element(by.cssContainingText('div.list-group-item-heading', name)),
            'Select Mission'
        );
        await selection.clickWhenReady();
    }

    async selectRuntime(name: string) {
        let selection = new Button(
            this.sectionElement.element(by.cssContainingText('div.list-group-item-heading', name)),
            'Select Runtime'
        );
        await selection.clickWhenReady();
    }

    async clickContinue(): Promise<void> {
        let continueButton = new Button(
            this.sectionElement.element(by.css('.f8launcher-continue button')),
            'Mission&Runtime Continue'
        );
        await continueButton.clickWhenReady();
    }
}

export class SelectPipelinePage {

    private sectionElement = specContext.isProdPreview() ? element(by.tagName('f8launcher-releasestrategy-step')) :
        element(by.tagName('f8launcher-releasestrategy-createapp-step'));

    async selectPipeline(name: string) {
        let pipelines: ElementFinder[] = await this.sectionElement.all(by.className('list-view-pf-description'));
        for (let pipeline of pipelines) {
            let stages: ElementFinder[] = await pipeline.all(by.className('f8launcher-pipeline-stages--name'));
            let lastStage = stages[stages.length - 1];
            if (await lastStage.getText() === name) {
                await lastStage.click();
            }
        }
    }

    async clickContinue(): Promise<void> {
        let continueButton = new Button(
            this.sectionElement.element(by.className('f8launcher-continue')).element(by.tagName('button')),
            'Pipeline Continue'
        );
        await continueButton.clickWhenReady();
    }
}

export class AuthorizeGitPage {

    private sectionElement = specContext.isProdPreview() ? element(by.tagName('f8launcher-gitprovider-step')) :
        element(by.tagName('f8launcher-gitprovider-createapp-step'));

    async selectLocation(name: string) {
        let locationCombo = new Button(this.sectionElement.element(by.id('ghOrg')), 'GitHub Organization Combo');
        await locationCombo.clickWhenReady();

        let locationComboItem =
            new Button(locationCombo.element(by.cssContainingText('option', name)), 'GitHub Organization');
        await locationComboItem.clickWhenReady();
    }

    async selectRepository(name: string): Promise<void> {
        let ghRepositoryText = new TextInput(element(by.id('ghRepo')), 'GitHub Repository');
        await ghRepositoryText.ready();
        await ghRepositoryText.clear();
        await ghRepositoryText.sendKeys(name);
    }

    async clickContinue(): Promise<void> {
        let continueButton = new Button(
            this.sectionElement.element(by.className('f8launcher-continue')).element(by.tagName('button')),
            'Git Provider Continue'
        );

        await continueButton.clickWhenReady();
    }
}

export class SummaryPage {

    private sectionElement = specContext.isProdPreview() ? element(by.tagName('f8launcher-projectsummary-step')) :
        element(by.tagName('f8launcher-projectsummary-createapp-step'));

    async getMission(): Promise<string> {
        return this.getSiblingElement('h2', 'Mission', '../..', 'div > b').getText();
    }

    async getRuntime(): Promise<string> {
        return this.getSiblingElement('h2', 'Runtime', '../..', 'div > b').getText();
    }

    async getPipeline(): Promise<string> {
        let stages = await this.sectionElement.all(by.className('f8launcher-pipeline-stages--name'));
        return stages[stages.length - 1].getText();
    }

    async getApplicationName(): Promise<string> {
        return this.getLabeledInputValue('Application Name');
    }

    async getVersion(): Promise<string> {
        return this.getLabeledInputValue('Version');
    }

    async getGitHubUserName(): Promise<string> {
        return this.getLabeledValue('Username');
    }

    async getLocation(): Promise<string> {
        return this.getLabeledValue('Location');
    }

    async getRepository(): Promise<string> {
        return this.getLabeledValue('Repository');
    }

    async clickSetUp(): Promise<void> {
        await this.clickProjectSummaryButton('Set Up Application');
    }

    async clickImport(): Promise<void> {
        await this.clickProjectSummaryButton('Import Application');
    }

    private async getLabeledInputValue(label: string): Promise<string> {
        return this.getLabeledElement(label, 'div > input').getAttribute('value');
    }

    private async getLabeledValue(label: string): Promise<string> {
        return this.getLabeledElement(label, 'div > span').getText();
    }

    private getLabeledElement(label: string, elementCSS: string): ElementFinder {
        return this.getSiblingElement('label', label, '..', elementCSS);
    }

    private getSiblingElement(
        selectedTag: string,
        selectedValue: string,
        parentXPath: string,
        siblingCSS: string): ElementFinder {
        let selectedElement = this.sectionElement.element(by.cssContainingText(selectedTag, selectedValue));
        let parentElement = selectedElement.element(by.xpath(parentXPath));
        return parentElement.element(by.css(siblingCSS));
    }

    private async clickProjectSummaryButton(description: string): Promise<void> {
        let projectSummaryButton = new Button(
            this.sectionElement.element(by.css('#ProjectSummary button')), description
        );
        await projectSummaryButton.clickWhenReady();
        await browser.wait(until.stalenessOf(projectSummaryButton), timeouts.DEFAULT_WAIT, 'Staleness of button');
    }
}

export enum SetupStatus {
    OK = 'OK',
    FAILED = 'FAILED',
    IN_PROGRESS = 'IN_PROGRESS'
}

class SetupStatusUtils {

    static getStatusfromClassAttribute(classAttribute: string): SetupStatus {
        let classes = classAttribute.split(' ');

        if (classes.lastIndexOf('pficon-in-progress') > 0) {
            return SetupStatus.IN_PROGRESS;
        } else if (classes.lastIndexOf('pficon-ok') > 0) {
            return SetupStatus.OK;
        } else if (classes.lastIndexOf('pficon-error-circle-o') > 0) { // error state on page level
            return SetupStatus.FAILED;
        } else if (classes.lastIndexOf('pficon-paused') > 0) { // error state on step level
            return SetupStatus.FAILED;
        } else {
            throw 'Unknow result page status';
        }
    }
}

export class SetupStep {

    constructor(private finder: ElementFinder) {
    }

    async getTitle(): Promise<string> {
        return this.finder.element(by.className('list-pf-main-content')).getText();
    }

    async getStatus(): Promise<SetupStatus> {
        let classAttribute = await this.finder.element(by.tagName('span')).getAttribute('class');
        let status = SetupStatusUtils.getStatusfromClassAttribute(classAttribute);
        return Promise.resolve(status);
    }
}

export class ResultsPage {

    private sectionElement = specContext.isProdPreview() ? element(by.tagName('f8launcher-projectprogress-nextstep')) :
    element(by.tagName('f8launcher-projectprogress-createapp-nextstep'));

    async getSetupStatus(): Promise<SetupStatus> {
        let statusElement = this.sectionElement.element(by.css('.card-pf-title-project-progress i'));
        let classAttributeValue = await statusElement.getAttribute('class');
        let status = SetupStatusUtils.getStatusfromClassAttribute(classAttributeValue);
        return Promise.resolve(status);
    }

    async getSetupSteps(): Promise<SetupStep[]> {
        let finders: ElementFinder[] = await this.sectionElement.all(by.className('list-pf-item'));
        let steps: SetupStep[] = [];

        for (let finder of finders) {
            steps.push(new SetupStep(finder));
        }

        return Promise.resolve(steps);
    }

    async clickReturnToDashboard() {
        const label = specContext.isProdPreview() ? 'Return to your Dashboard' : 'Return to your dashboard';

        let returnToDashboardButton = new Button(
            element(by.cssContainingText('button', label)), label
        );
        await returnToDashboardButton.clickWhenReady();
    }
}
