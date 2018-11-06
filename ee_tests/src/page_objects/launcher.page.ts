import { TextInput } from '../ui/text_input';
import { $, browser, by, element } from 'protractor';
import { BaseElement } from '../ui/base.element';
import { Button } from '../ui/button';
import * as logger from '../support/logging';

export class CreateApplicationPage {

    private createNewApplicationCard = new BaseElement(
        element(by.xpath('//*[contains(text(),\'Create a new codebase\')]' +
            '/ancestor::*[contains(@class,\'code-imports--step_content\')]')),
        'Create a new codebase'
    );

    private importExistingApplicationCard = new BaseElement(
        element(by.xpath('//*[contains(text(),\'Import an existing codebase\')]' +
            '/ancestor::*[contains(@class,\'code-imports--step_content\')]')),
        'Import an existing codebase'
    );

    private continueButton = new Button(
        element(by.xpath('//*[not(@disabled) and contains(text(),\'Continue\')]')),
        'Continue'
    );

    async setProjectName(name: string) {
        let projectName = new TextInput($('#projectName'), 'Application Name');
        logger.debug('ready');
        await projectName.ready();
        logger.debug('clear');
        await projectName.clear();
        logger.debug('sentKeys');
        await projectName.sendKeys(name);
    }

    async selectCreateCodebase(): Promise<void> {
        logger.debug('click create');
        await this.createNewApplicationCard.clickWhenReady();
        // https://github.com/fabric8io/fabric8-test/issues/714
        await browser.sleep(5000);
    }

    async selectImportCodebase(): Promise<void> {
        await this.importExistingApplicationCard.clickWhenReady();
    }

    async clickContinue(): Promise<void> {
        await this.continueButton.clickWhenReady();
    }
}

export class SelectMissionAndRuntimePage {
    async selectMission(name: string) {
        let selection = new Button(
            element(by.xpath('//div[@class=\'list-group-item-heading\'][contains(text(),\'' + name + '\')]')),
            'Select Mission'
        );
        await selection.clickWhenReady();
    }

    async selectRuntime(name: string) {
        let selection = new Button(
            element(by.xpath('//div[@class=\'list-group-item-heading\'][contains(text(),\'' + name + '\')]')),
            'Select Runtime'
        );
        await selection.clickWhenReady();
    }

    async clickContinue(): Promise<void> {
        let missionRuntimeContinueButton = new Button(
            element(by.xpath('//f8launcher-missionruntime-createapp-step' +
                '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
            'Mission&Runtime Continue'
        );
        await missionRuntimeContinueButton.clickWhenReady();
    }
}

export class SelectPipelinePage {

    async selectPipeline(name: string) {
        let selection = new Button(
            element(by.xpath(
                '//*[contains(@class,\'f8launcher-section-release-strategy\')]' +
                '//*[contains(@class,\'list-view-pf-description\')]' +
                '//span[last()]//*[@class=\'f8launcher-pipeline-stages--name\'][contains(text(),\'' + name + '\')]'
            )),
            'Select Pipeline'
        );
        await selection.clickWhenReady();
    }

    async clickContinue(): Promise<void> {
        let releaseStrategyContinueButton = new Button(
            element(by.xpath('//f8launcher-releasestrategy-createapp-step' +
                '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
            'Pipeline Continue'
        );
        await releaseStrategyContinueButton.clickWhenReady();
    }
}

export class AuthorizeGitPage {
    private ghOrgSelect = new Button(
        $('#ghOrg'),
        'Select GitHub Organization'
    );

    private ghRepositoryText = new TextInput(
        $('#ghRepo'),
        'GitHub Repository'
    );

    async selectGitHubOrganization(name: string) {
        await this.ghOrgSelect.clickWhenReady();
        await this.ghOrgItem(name).clickWhenReady();
    }

    async selectRepository(name: string): Promise<void> {
        await this.ghRepositoryText.ready();
        await this.ghRepositoryText.clear();
        await this.ghRepositoryText.sendKeys(name);
    }

    ghOrgItem(name: string): Button {
        return new Button(
            this.ghOrgSelect.element(by.xpath('./option[contains(text(),\'' + name + '\')]')),
            'GitHub Organization'
        );
    }

    async clickContinue(): Promise<void> {
        let gitProviderContinueButton = new Button(
            element(by.xpath('//f8launcher-gitprovider-createapp-step' +
                '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
            'Git Provider Continue'
        );
        await gitProviderContinueButton.clickWhenReady();
    }
}

export class SummaryPage {

    async clickSetuUp(): Promise<void> {
        let setUpApplicationButton = new Button(
            element(
                by.xpath('//*[contains(@class,\'btn\')][contains(text(),\'Set Up Application\')]')),
            'Set Up Application'
        );
        await setUpApplicationButton.clickWhenReady();
    }

    async clickImport(): Promise<void> {
        let releaseStrategyImportContinueButton = new Button(
            element(by.xpath('//f8launcher-releasestrategy-importapp-step' +
                '//*[@class=\'f8launcher-continue\']//*[contains(@class,\'btn\')]')),
            'Pipeline Continue'
        );
        await releaseStrategyImportContinueButton.clickWhenReady();
    }
}

export class ResultsPage {

    newProjectBoosterOkIcon(name: string): BaseElement {
        return new BaseElement(
            element(by.xpath('//f8launcher-projectprogress-createapp-nextstep' +
                '//*[contains(text(),\'' + name + '\')]' +
                '//ancestor::*[contains(@class,\'pfng-list-content\')]' +
                '//*[contains(@class,\'pficon-ok\')]')),
            'OK Icon (' + name + ')'
        );
    }

    async clickReturnToDashboard() {
        let returnToDashboardButton = new Button(
            element(by.cssContainingText('button', 'Return to your dashboard')),
            'Return to your dashboard'
        );
        await returnToDashboardButton.clickWhenReady();
    }
}
