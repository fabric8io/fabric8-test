import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as logger from '../support/logging';
import * as timeouts from '../support/timeouts';
import { windowManager } from '../support/window_manager';
import { screenshotManager } from '../support/screenshot_manager';
import { Environment } from '../support/environments';

export abstract class DeployedApplicationInteractionsFactory {

    public static create(e: Environment): DeployedApplicationInteractions {
        if (e === Environment.RUN) {
            return new RunDeployedApplicationInteractions();
        } else {
            return new StageDeployedApplicationInteractions();
        }
    }
}

export interface DeployedApplicationInteractions {

    verifyDeployedApplication(testCallback: () => void): void;
}

abstract class AbstractDeployedApplicationInteractions implements DeployedApplicationInteractions {

    constructor(private environment: string) {
    }

    async verifyDeployedApplication(testCallback: () => void): Promise<void> {
        logger.info('Verify application on ' + this.environment + ' environment');
        await windowManager.switchToNewWindow();

        await browser.wait(
            until.urlContains(this.environment),
            timeouts.DEFAULT_WAIT,
            `url contains ${this.environment}`);

        await browser.wait(async () => {
            await browser.refresh();
            return ! await element(by.cssContainingText('h1', 'Application is not available')).isPresent();
        }, timeouts.LONGER_WAIT, 'Application takes more than 10 minutes to start');

        await screenshotManager.save(this.environment);

        let currentURL = await browser.getCurrentUrl();
        expect(currentURL).toContain(this.environment, `${this.environment} environment url`);

        await testCallback();

        await windowManager.closeCurrentWindow();
    }
}

class StageDeployedApplicationInteractions extends AbstractDeployedApplicationInteractions {

    constructor() {
        super('stage');
    }
}

class RunDeployedApplicationInteractions extends AbstractDeployedApplicationInteractions {

    constructor() {
        super('run');
    }
}
